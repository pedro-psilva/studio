'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendEmailVerification } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function VerifyEmailPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(loggingOut ? '/' : '/auth/login');
      return;
    }
    if (user.emailVerified) {
      router.replace('/');
    }
  }, [user, loading, router, loggingOut]);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
    } finally {
      router.replace('/');
    }
  }

  async function handleResend() {
    if (!user) return;
    try {
      setSending(true);
      await sendEmailVerification(user);
      toast({
        title: 'E-mail reenviado',
        description: 'Enviamos um novo link de verificação. Verifique sua caixa de entrada e spam.',
      });
    } catch (err) {
      console.error('Erro ao reenviar verificação:', err);
      toast({
        title: 'Erro ao reenviar',
        description: 'Não foi possível reenviar o e-mail de verificação. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  }

  async function handleIHaveVerified() {
    if (!user) return;
    try {
      setChecking(true);
      await user.reload();
      if (user.emailVerified) {
        toast({ title: 'E-mail verificado', description: 'Sua conta foi ativada com sucesso.' });
        router.replace('/');
        return;
      }
      toast({
        title: 'Ainda não verificado',
        description: 'Ainda não identificamos a verificação. Aguarde alguns segundos e tente novamente.',
        variant: 'destructive',
      });
    } catch (err) {
      console.error('Erro ao checar verificação:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível checar a verificação agora. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Verifique seu e-mail</CardTitle>
          <CardDescription>
            Para ativar sua conta, você precisa confirmar seu e-mail. Abra sua caixa de entrada e clique no link enviado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            E-mail: <span className="font-medium text-foreground">{user?.email ?? '-'}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleResend} disabled={sending || !user}>
              {sending ? 'Enviando...' : 'Reenviar e-mail'}
            </Button>
            <Button onClick={handleIHaveVerified} disabled={checking || !user}>
              {checking ? 'Verificando...' : 'Já verifiquei'}
            </Button>
            <Button variant="ghost" onClick={handleLogout} disabled={!user || loggingOut}>
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
