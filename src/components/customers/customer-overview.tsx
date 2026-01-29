'use client';

import { useState, useRef } from 'react';
import type { Customer } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CustomersTable } from './customers-table';
import { Search, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockDataStore, saveData } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

export function CustomerOverview({
  customers,
}: {
  customers: Customer[];
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const customersToExport = mockDataStore.customers;
    if (customersToExport.length === 0) {
      toast({
        title: 'Aucune donnée à exporter',
        description: "Il n'y a aucun client à exporter.",
      });
      return;
    }

    const headers = ['id', 'name', 'phone', 'createdAt', 'balance'];
    // Add BOM for Excel compatibility with UTF-8
    const bom = '\uFEFF';
    const csvRows = [
      headers.join(','),
      ...customersToExport.map((customer) =>
        headers
          .map((fieldName) => {
            let cell = customer[fieldName as keyof Customer] ?? '';
            // Basic CSV escaping for values containing commas or quotes
            cell = String(cell).replace(/"/g, '""');
            if (/[",\n]/.test(cell)) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(',')
      ),
    ];
    const csvString = bom + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    link.download = `export-clients-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: 'Exportation réussie',
      description: 'Les données des clients ont été exportées au format CSV.',
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Le fichier n'a pas pu être lu");
        }

        const lines = text.trim().split(/\r\n|\n/);
        if (lines.length < 2) {
          throw new Error(
            "Le fichier CSV est vide ou ne contient que l'en-tête."
          );
        }
        // Remove BOM if present
        const headerLine =
          lines[0].charCodeAt(0) === 0xfeff ? lines[0].substring(1) : lines[0];
        const headers = headerLine.split(',').map((h) => h.trim());

        const requiredHeaders = ['id', 'name', 'phone', 'createdAt', 'balance'];
        const missingHeaders = requiredHeaders.filter(
          (h) => !headers.includes(h)
        );
        if (missingHeaders.length > 0) {
          throw new Error(
            `En-têtes CSV manquants: ${missingHeaders.join(', ')}`
          );
        }

        const newCustomers: Customer[] = lines
          .slice(1)
          .map((line) => {
            if (!line.trim()) return null; // Ignore empty lines
            // This is a very basic CSV parser, it won't handle commas inside quoted fields.
            const values = line.split(',');
            const customer: Partial<Customer> = {};
            headers.forEach((header, index) => {
              if (requiredHeaders.includes(header)) {
                const value = values[index]?.trim() ?? '';
                if (header === 'balance') {
                  (customer as any)[header] = parseFloat(value) || 0;
                } else {
                  (customer as any)[header] = value;
                }
              }
            });
            return customer as Customer;
          })
          .filter((c): c is Customer => c !== null);

        // Restore data into the in-memory store
        mockDataStore.customers = newCustomers;
        // IMPORTANT: Clear transactions as they are not part of the CSV and would be orphaned.
        mockDataStore.transactions = [];

        // Persist the restored data to localStorage
        saveData();

        // Trigger UI update
        window.dispatchEvent(new Event('datachanged'));

        toast({
          title: 'Succès !',
          description: `Données importées depuis CSV. ${newCustomers.length} clients chargés. Les anciennes transactions ont été effacées.`,
        });
      } catch (error) {
        console.error('Failed to import data:', error);
        toast({
          title: 'Erreur',
          description: `Erreur lors de l'importation: ${
            error instanceof Error ? error.message : 'Erreur inconnue'
          }`,
          variant: 'destructive',
        });
      } finally {
        // Reset file input so the same file can be uploaded again
        if (event.target) {
          event.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <CardTitle>Aperçu des clients</CardTitle>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative w-full sm:w-auto sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button variant="outline" onClick={handleImportClick}>
              <Upload />
              Importer
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download />
              Exporter
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".csv"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CustomersTable customers={filteredCustomers} />
      </CardContent>
    </Card>
  );
}
