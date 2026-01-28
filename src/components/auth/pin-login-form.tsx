'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInAnonymously } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/forms/submit-button';

// For simplicity, we'll use a hardcoded PIN.
// In a real multi-user app, this would be stored securely per user.
const CORRECT_PIN = '1234';

export function PinLoginForm() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [pin, setPin] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth) return;

    setIsPending(true);

    if (pin !== CORRECT_PIN) {
      toast({
        title: 'Code PIN incorrect',
        description: 'Le code PIN que vous avez entré est incorrect. Veuillez réessayer.',
        variant: 'destructive',
      });
      setIsPending(false);
      setPin('');
      return;
    }

    try {
      await signInAnonymously(auth);
      router.replace('/');
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de se connecter. Veuillez réessayer plus tard.',
        variant: 'destructive',
      });
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <Label htmlFor="pin" className="sr-only">
          Code PIN
        </Label>
        <Input
          id="pin"
          name="pin"
          type="password"
          autoComplete="off"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          maxLength={4}
          className="h-16 w-full text-center text-4xl tracking-[1em]"
          style={{ paddingLeft: 'calc(50% - 1.2rem)' }} // Center the spaced-out numbers
          placeholder="----"
          required
        />
      </div>
      <SubmitButton isPending={isPending}>Déverrouiller</SubmitButton>
    </form>
  );
}
