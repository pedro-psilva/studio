'use client';

import Link from 'next/link';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Informe seu e-mail.');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, trimmed);
      toast({
        title: 'E-mail enviado',
        description: 'Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada e spam.',
      });
    } catch (err: any) {
      console.error('Erro ao enviar e-mail de redefinição:', err);
      setError('Não foi possível enviar o e-mail de redefinição. Verifique o endereço e tente novamente.');
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o e-mail de redefinição. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <CardHeader className="space-y-1 p-0 text-center">
          <CardTitle className="text-2xl font-bold">Esqueci minha senha</CardTitle>
          <CardDescription className="text-muted-foreground">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </CardDescription>
        </CardHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar link de redefinição'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <Link href="/auth/login" className="underline flex items-center justify-center text-muted-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
