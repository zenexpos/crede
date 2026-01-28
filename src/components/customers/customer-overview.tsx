'use client';

import { useState } from 'react';
import type { Customer } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CustomersTable } from './customers-table';
import { Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockDataStore } from '@/lib/mock-data';

export function CustomerOverview({
  customers,
}: {
  customers: Customer[];
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBackup = () => {
    // Use the current state from the mockDataStore for the backup
    const dataToBackup = JSON.stringify(mockDataStore, null, 2);
    const blob = new Blob([dataToBackup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    link.download = `backup-crede-zenagui-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <Button variant="outline" onClick={handleBackup}>
              <Download />
              Prendre une copie de sauvegarde
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CustomersTable customers={filteredCustomers} />
      </CardContent>
    </Card>
  );
}
