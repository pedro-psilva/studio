'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

interface UserDocData {
  displayName?: string;
  email?: string;
  phone?: string;
  tipo?: string; // cliente | admin
  pessoaTipo?: 'PF' | 'PJ';
  cpfCnpj?: string;
  clinicName?: string;
}

interface AddressDoc {
  id: string;
  apelido?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  isPrincipal?: boolean;
}

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [userDoc, setUserDoc] = useState<UserDocData | null>(null);
  const [addresses, setAddresses] = useState<AddressDoc[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Redireciona visitante não autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  // Carrega dados adicionais do Firestore (users/{uid} e addresses)
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUserDoc(snap.data() as UserDocData);
        }

        const addrRef = collection(db, `users/${user.uid}/addresses`);
        const addrSnap = await getDocs(addrRef);
        const list: AddressDoc[] = addrSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setAddresses(list);

        const data = (snap.exists() ? (snap.data() as any) : null);
        const admin = data?.tipo === 'admin';
        setIsAdmin(!!admin);

      } catch (err) {
        console.error('Erro ao carregar dados da conta:', err);
      } finally {
        setLoadingExtra(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || !user) {
    return null;
  }

  const displayName =
    userDoc?.displayName || user.displayName || user.email?.split('@')[0] || 'Usuário';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Minha Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold">{displayName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userDoc?.pessoaTipo && (
                    <Badge variant="outline">
                      Tipo de conta: {userDoc.pessoaTipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </Badge>
                  )}
                  {userDoc?.tipo && (
                    <Badge variant="outline">Perfil: {userDoc.tipo}</Badge>
                  )}
                  {isAdmin && <Badge variant="default">Administrador</Badge>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {userDoc?.cpfCnpj && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                    <p className="text-sm font-medium">{userDoc.cpfCnpj}</p>
                  </div>
                )}
                {userDoc?.phone && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="text-sm font-medium">{userDoc.phone}</p>
                  </div>
                )}
                {userDoc?.clinicName && userDoc.clinicName.trim() !== '' && (
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-sm text-muted-foreground">Clínica</p>
                    <p className="text-sm font-medium">{userDoc.clinicName}</p>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="pt-2">
                  <Button onClick={() => router.push('/admin')}>Abrir painel de administrador</Button>
                </div>
              )}

              <div className="pt-4">
                <Button variant="outline" onClick={() => router.push('/')}>
                  Voltar para a loja
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereços</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingExtra && (
                <p className="text-sm text-muted-foreground">Carregando dados...</p>
              )}
              {!loadingExtra && addresses.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum endereço cadastrado ainda.
                </p>
              )}
              {!loadingExtra && addresses.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-lg border bg-card p-4 text-sm space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {addr.apelido || 'Endereço'}
                        </span>
                        {addr.isPrincipal && <Badge>Principal</Badge>}
                      </div>
                      <p>
                        {addr.logradouro}, {addr.numero}
                        {addr.complemento && ` - ${addr.complemento}`}
                      </p>
                      <p>
                        {addr.bairro} - {addr.cidade}/{addr.estado}
                      </p>
                      <p>{addr.cep}</p>
                      <p>{addr.pais}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}