'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { OrderDocument, listUserOrders } from '@/lib/orderService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { updateUserById } from '@/lib/admin-utils';
import { toast } from '@/hooks/use-toast';

type AdminAccessLevel = 'reader' | 'editor';

const ADMIN_ACCESS_PAGES: { key: string; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Pedidos' },
  { key: 'production', label: 'Produção' },
  { key: 'products', label: 'Produtos' },
  { key: 'users', label: 'Usuários' },
  { key: 'esap', label: 'ESAP' },
  { key: 'finance', label: 'Financeiro' },
  { key: 'reports', label: 'Relatórios' },
  { key: 'coupons', label: 'Cupons' },
  { key: 'notifications', label: 'Notificações' },
  { key: 'settings', label: 'Configurações' },
];

interface UserDocData {
  displayName?: string;
  email?: string;
  phone?: string;
  tipo?: string; // cliente | admin | colaborador
  adminAccess?: Record<string, AdminAccessLevel> | null;
  pessoaTipo?: 'PF' | 'PJ';
  cpfCnpj?: string;
  clinicName?: string;
}

interface UserAddress {
  id: string;
  apelido?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  isPrincipal?: boolean;
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = params?.id;

  const [userDoc, setUserDoc] = useState<UserDocData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderDocument[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [savingRole, setSavingRole] = useState(false);
  const [savingAccess, setSavingAccess] = useState(false);
  const [accessDraft, setAccessDraft] = useState<Record<string, AdminAccessLevel>>({});

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        setError(null);

        // Dados básicos do usuário
        const userRef = doc(db, 'users', userId);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          setError('Usuário não encontrado.');
          setUserDoc(null);
          setOrders([]);
          setAddresses([]);
          return;
        }

        const data = snap.data() as UserDocData;
        setUserDoc({
          ...data,
          email: data.email,
        });

        setAccessDraft(data?.adminAccess ?? {});

        // Pedidos do usuário
        const userOrders = await listUserOrders(userId);
        setOrders(userOrders);

        // Endereços do usuário (subcoleção users/{id}/addresses)
        const addrCol = collection(db, `users/${userId}/addresses`);
        const addrSnap = await getDocs(addrCol);
        const addrList: UserAddress[] = addrSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setAddresses(addrList);
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        setError('Não foi possível carregar os dados do usuário.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const displayName =
    userDoc?.displayName ||
    userDoc?.clinicName ||
    userDoc?.email?.split('@')[0] ||
    'Usuário';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold font-headline">Detalhes do Usuário</h1>
              <p className="text-muted-foreground mt-1">
                Visualize as informações de cadastro deste cliente.
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/admin/users')}>
              Voltar para lista
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
              <CardDescription>
                Estrutura baseada na seção "Minhas Informações" da página /account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && (
                <p className="text-sm text-muted-foreground">Carregando dados do usuário...</p>
              )}

              {!loading && error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {!loading && !error && userDoc && (
                <>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold">{displayName}</p>
                      {userDoc.email && (
                        <p className="text-sm text-muted-foreground">{userDoc.email}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <div className="flex flex-wrap gap-2">
                        {userDoc.pessoaTipo && (
                          <Badge variant="outline">
                            Tipo de conta:{' '}
                            {userDoc.pessoaTipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                          </Badge>
                        )}
                        {userDoc.tipo && (
                          <Badge variant="outline">Perfil: {userDoc.tipo}</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={userDoc.tipo === 'admin' ? 'default' : 'outline'}
                          disabled={savingRole || !userId || userDoc.tipo === 'admin'}
                          onClick={async () => {
                            if (!userId || userDoc.tipo === 'admin') return;
                            try {
                              setSavingRole(true);
                              await updateUserById(userId as string, { tipo: 'admin' });
                              setUserDoc((prev) => (prev ? { ...prev, tipo: 'admin' } : prev));
                              toast({
                                title: 'Perfil atualizado',
                                description: 'Usuário agora é administrador.',
                              });
                            } catch (err) {
                              console.error('Erro ao atualizar perfil para admin:', err);
                              toast({
                                title: 'Erro ao atualizar perfil',
                                description: 'Não foi possível tornar este usuário admin.',
                                variant: 'destructive',
                              });
                            } finally {
                              setSavingRole(false);
                            }
                          }}
                        >
                          Tornar administrador
                        </Button>
                        <Button
                          size="sm"
                          variant={userDoc.tipo === 'colaborador' ? 'default' : 'outline'}
                          disabled={savingRole || !userId || userDoc.tipo === 'colaborador'}
                          onClick={async () => {
                            if (!userId || userDoc.tipo === 'colaborador') return;
                            try {
                              setSavingRole(true);
                              await updateUserById(userId as string, { tipo: 'colaborador' });
                              setUserDoc((prev) =>
                                prev ? { ...prev, tipo: 'colaborador' } : prev
                              );
                              toast({
                                title: 'Perfil atualizado',
                                description: 'Usuário agora é colaborador.',
                              });
                            } catch (err) {
                              console.error('Erro ao atualizar perfil para colaborador:', err);
                              toast({
                                title: 'Erro ao atualizar perfil',
                                description: 'Não foi possível tornar este usuário colaborador.',
                                variant: 'destructive',
                              });
                            } finally {
                              setSavingRole(false);
                            }
                          }}
                        >
                          Tornar colaborador
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {userDoc.cpfCnpj && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                        <p className="text-sm font-medium">{userDoc.cpfCnpj}</p>
                      </div>
                    )}
                    {userDoc.phone && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="text-sm font-medium">{userDoc.phone}</p>
                      </div>
                    )}
                    {userDoc.clinicName && userDoc.clinicName.trim() !== '' && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-sm text-muted-foreground">Clínica</p>
                        <p className="text-sm font-medium">{userDoc.clinicName}</p>
                      </div>
                    )}
                  </div>

                  {userDoc.tipo === 'colaborador' && (
                    <div className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">Acessos do colaborador</p>
                          <p className="text-sm text-muted-foreground">
                            Marque as páginas que ele pode acessar e defina se é leitor ou editor.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          disabled={savingAccess || !userId}
                          onClick={async () => {
                            if (!userId) return;
                            try {
                              setSavingAccess(true);
                              await updateUserById(userId as string, { adminAccess: accessDraft });
                              setUserDoc((prev) => (prev ? { ...prev, adminAccess: accessDraft } : prev));
                              toast({
                                title: 'Permissões atualizadas',
                                description: 'Acessos do colaborador foram salvos.',
                              });
                            } catch (err) {
                              console.error('Erro ao salvar permissões:', err);
                              toast({
                                title: 'Erro ao salvar permissões',
                                description: 'Não foi possível salvar os acessos.',
                                variant: 'destructive',
                              });
                            } finally {
                              setSavingAccess(false);
                            }
                          }}
                        >
                          {savingAccess ? 'Salvando...' : 'Salvar acessos'}
                        </Button>
                      </div>

                      <div className="mt-4 grid gap-3">
                        {ADMIN_ACCESS_PAGES.map((p) => {
                          const checked = accessDraft[p.key] != null;
                          const level = accessDraft[p.key] ?? 'reader';

                          return (
                            <div key={p.key} className="grid gap-2 rounded-md border p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`edit-access-${p.key}`}
                                    checked={checked}
                                    onCheckedChange={(v) => {
                                      const enabled = !!v;
                                      setAccessDraft((prev) => {
                                        if (!enabled) {
                                          const next = { ...prev };
                                          delete next[p.key];
                                          return next;
                                        }

                                        return { ...prev, [p.key]: prev[p.key] ?? 'reader' };
                                      });
                                    }}
                                  />
                                  <Label htmlFor={`edit-access-${p.key}`}>{p.label}</Label>
                                </div>
                                {checked && (
                                  <Select
                                    value={level}
                                    onValueChange={(val) =>
                                      setAccessDraft((prev) => ({
                                        ...prev,
                                        [p.key]: val as AdminAccessLevel,
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="w-[160px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="reader">Leitor</SelectItem>
                                      <SelectItem value="editor">Editor</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Resumo de compras */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Compras</CardTitle>
              <CardDescription>
                Visão geral dos pedidos e do total já comprado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
              )}

              {!loading && error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {!loading && !error && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total de pedidos</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total já comprado</p>
                    <p className="text-2xl font-bold">
                      R${' '}
                      {orders
                        .reduce((acc, o) => acc + (o.total ?? 0), 0)
                        .toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Última compra</p>
                    <p className="text-sm font-medium">
                      {orders.length === 0
                        ? 'Nenhuma compra ainda'
                        : format(
                            orders
                              .slice()
                              .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0]
                              .updatedAt,
                            'dd/MM/yyyy'
                          )}
                    </p>
                  </div>
                </div>
              )}

              {!loading && !error && orders.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">Pedidos recentes</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Atualizado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders
                        .slice()
                        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                        .slice(0, 5)
                        .map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                            <TableCell>
                              R{' '}
                              {order.total.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {format(order.updatedAt, 'dd/MM/yyyy')}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Endereços do usuário */}
          <Card>
            <CardHeader>
              <CardTitle>Endereços</CardTitle>
              <CardDescription>
                Endereços cadastrados para este cliente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <p className="text-sm text-muted-foreground">Carregando endereços...</p>
              )}

              {!loading && !error && addresses.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>
              )}

              {!loading && !error && addresses.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-lg border bg-background p-4 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {addr.apelido || 'Endereço'}
                        </p>
                        {addr.isPrincipal && (
                          <Badge variant="outline" className="text-xs">
                            Principal
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">
                        {[addr.logradouro, addr.numero]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {[addr.bairro, addr.cidade, addr.estado]
                          .filter(Boolean)
                          .join(' - ')}
                      </p>
                      {addr.cep && (
                        <p className="text-xs text-muted-foreground">CEP: {addr.cep}</p>
                      )}
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
