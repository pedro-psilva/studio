'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function FirstAccessResetPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (loading) return;

      if (!user) {
        router.replace('/auth/login');
        return;
      }

      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? (snap.data() as any) : null;
        const forcePasswordReset = !!data?.forcePasswordReset;

        if (!forcePasswordReset) {
          router.replace('/');
          return;
        }
      } catch (e) {
        console.error('Erro ao verificar forcePasswordReset:', e);
      } finally {
        setChecking(false);
      }
    };

    run();
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (password.length < 6) {
      toast({
        title: 'Senha inválida',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'As senhas não conferem',
        description: 'Digite a mesma senha nos dois campos.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      await updatePassword(user, password);
      await updateDoc(doc(db, 'users', user.uid), {
        forcePasswordReset: false,
      });

      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi redefinida com sucesso.',
      });

      router.replace('/');
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err);

      const code = err?.code;
      const message =
        code === 'auth/requires-recent-login'
          ? 'Por segurança, faça login novamente e tente redefinir sua senha.'
          : 'Não foi possível redefinir sua senha. Tente novamente.';

      toast({
        title: 'Erro ao redefinir senha',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <CardHeader className="space-y-1 p-0 text-center">
          <CardTitle className="text-2xl font-bold">Redefinir senha</CardTitle>
          <CardDescription className="text-muted-foreground">
            Por segurança, você precisa definir uma nova senha no seu primeiro acesso.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            disabled={submitting}
          >
            {submitting ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
        </form>
      </div>
    </div>
  );
}
