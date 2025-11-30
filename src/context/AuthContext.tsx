'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  signIn: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/');
      toast({
        title: 'Logout realizado com sucesso',
        description: 'Você saiu da sua conta com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: 'Erro ao fazer logout',
        description: 'Ocorreu um erro ao tentar sair da sua conta. Tente novamente.',
        variant: 'destructive',
      });
    }
  }, [router]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo de volta!',
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: 'Erro ao fazer login',
        description: 'Email ou senha inválidos. Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, signIn }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);