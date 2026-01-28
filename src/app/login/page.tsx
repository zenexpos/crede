'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AppLogo } from '@/components/layout/app-logo';
import { Loader2 } from 'lucide-react';
import { PinLoginForm } from '@/components/auth/pin-login-form';

export default function LoginPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl">Bienvenue</CardTitle>
          <CardDescription>
            Veuillez entrer votre code PIN à 4 chiffres pour continuer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PinLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
