'use client';

import { useEffect, useState } from 'react';
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { getAllUsers, updateUserById, deleteUserById } from '@/lib/admin-utils';
import { useAuth } from '@/context/AuthContext';

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

interface UserRow {
  id: string;
  name: string;
  type: string;
  role: string;
  email: string;
  phone: string;
  totalOrders: number;
  status: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserDisplayName, setNewUserDisplayName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserTipo, setNewUserTipo] = useState<'cliente' | 'colaborador' | 'admin'>('cliente');
  const [newUserForcePasswordReset, setNewUserForcePasswordReset] = useState(false);
  const [newUserAdminAccess, setNewUserAdminAccess] = useState<Record<string, AdminAccessLevel>>({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: any[] = await getAllUsers();

      const mapped: UserRow[] = data.map((u) => ({
        id: u.id,
        name: u.displayName || u.clinicName || u.email || 'Sem nome',
        type: u.pessoaTipo || 'PF',
        role: u.tipo || 'cliente',
        email: u.email || '',
        phone: u.phone || '',
        totalOrders: typeof u.totalOrders === 'number' ? u.totalOrders : 0,
        status: u.status || 'Ativo',
      }));

      setUsers(mapped);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError('Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!user) {
      toast({
        title: 'Sessão expirada',
        description: 'Faça login novamente para criar usuários.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreatingUser(true);
      const token = await user.getIdToken();

      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: newUserDisplayName,
          email: newUserEmail,
          password: newUserPassword,
          tipo: newUserTipo,
          forcePasswordReset: newUserForcePasswordReset,
          adminAccess: newUserTipo === 'colaborador' ? newUserAdminAccess : undefined,
        }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = payload?.error || 'Não foi possível criar o usuário.';
        toast({ title: 'Erro ao criar usuário', description: msg, variant: 'destructive' });
        return;
      }

      toast({
        title: 'Usuário criado',
        description: `Conta criada para ${payload?.email ?? newUserEmail}.`,
      });

      setAddUserOpen(false);
      setNewUserDisplayName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserTipo('cliente');
      setNewUserForcePasswordReset(false);
      setNewUserAdminAccess({});
      await fetchUsers();
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      toast({
        title: 'Erro ao criar usuário',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Ativo' ? 'Inativo' : 'Ativo';
    try {
      await updateUserById(userId, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
      toast({
        title: 'Status atualizado',
        description: `Usuário agora está ${newStatus}.`,
      });
    } catch (err) {
      console.error('Erro ao atualizar status do usuário:', err);
      toast({
        title: 'Erro ao atualizar status',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = window.confirm('Tem certeza que deseja excluir este usuário? Essa ação não pode ser desfeita.');
    if (!confirmed) return;

    try {
      await deleteUserById(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast({
        title: 'Usuário excluído',
        description: 'O usuário foi removido com sucesso.',
      });
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      toast({
        title: 'Erro ao excluir usuário',
        description: 'Verifique suas permissões e tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle>Usuários</CardTitle>
              <CardDescription>
                Gerencie clientes, colaboradores e administradores.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, email..."
                  className="w-full rounded-lg bg-background pl-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filtro
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Tipo (PF/PJ)
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Status</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" className="h-8 gap-1" onClick={() => setAddUserOpen(true)}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Adicionar Usuário</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead className="hidden md:table-cell">Pedidos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                        Carregando usuários...
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && error && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-destructive">
                        {error}
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && !error && users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && !error &&
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {user.role === 'admin'
                              ? 'Administrador'
                              : user.role === 'colaborador'
                              ? 'Colaborador'
                              : 'Cliente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.phone}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.totalOrders}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.status === 'Ativo' ? 'default' : 'destructive'}
                            className={
                              user.status === 'Ativo'
                                ? ''
                                : 'bg-destructive/20 text-destructive border-destructive/50'
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/admin/users/${user.id}`)}
                              >
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleToggleStatus(user.id, user.status)
                                }
                              >
                                {user.status === 'Ativo' ? 'Marcar como inativo' : 'Marcar como ativo'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Excluir usuário
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-xs text-muted-foreground">
                {users.length > 0 && !loading && !error ? (
                  <>
                    Mostrando <strong>{users.length}</strong> usuário
                    {users.length > 1 && 's'}
                  </>
                ) : (
                  'Sem usuários para exibir'
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar usuário</DialogTitle>
            <DialogDescription>
              Crie uma conta para um usuário. O usuário poderá fazer login com o email e senha definidos.
            </DialogDescription>
          </DialogHeader>

          <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
            <input type="text" name="username" autoComplete="username" className="hidden" />
            <input type="password" name="password" autoComplete="current-password" className="hidden" />

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="newUserDisplayName">Nome</Label>
                <Input
                  id="newUserDisplayName"
                  name="newUserDisplayName"
                  autoComplete="off"
                  value={newUserDisplayName}
                  onChange={(e) => setNewUserDisplayName(e.target.value)}
                  placeholder="Nome do usuário"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newUserEmail">Email</Label>
                <Input
                  id="newUserEmail"
                  name="newUserEmail"
                  type="email"
                  autoComplete="off"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="email@dominio.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newUserPassword">Senha</Label>
                <Input
                  id="newUserPassword"
                  name="newUserPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="grid gap-2">
                <Label>Perfil</Label>
                <Select value={newUserTipo} onValueChange={(v) => setNewUserTipo(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newUserTipo === 'colaborador' && (
                <div className="grid gap-3">
                  <Label>Acessos do colaborador</Label>
                  <div className="grid gap-3">
                    {ADMIN_ACCESS_PAGES.map((p) => {
                      const checked = newUserAdminAccess[p.key] != null;
                      const level = newUserAdminAccess[p.key] ?? 'reader';

                      return (
                        <div key={p.key} className="grid gap-2 rounded-md border p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`access-${p.key}`}
                                checked={checked}
                                onCheckedChange={(v) => {
                                  const enabled = !!v;
                                  setNewUserAdminAccess((prev) => {
                                    if (!enabled) {
                                      const next = { ...prev };
                                      delete next[p.key];
                                      return next;
                                    }

                                    return { ...prev, [p.key]: prev[p.key] ?? 'reader' };
                                  });
                                }}
                              />
                              <Label htmlFor={`access-${p.key}`}>{p.label}</Label>
                            </div>
                            {checked && (
                              <Select
                                value={level}
                                onValueChange={(val) =>
                                  setNewUserAdminAccess((prev) => ({
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

              <div className="flex items-center gap-2">
                <Checkbox
                  id="newUserForcePasswordReset"
                  checked={newUserForcePasswordReset}
                  onCheckedChange={(v) => setNewUserForcePasswordReset(!!v)}
                />
                <Label htmlFor="newUserForcePasswordReset">Exigir redefinição de senha no primeiro acesso</Label>
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserOpen(false)} disabled={creatingUser}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={creatingUser}>
              {creatingUser ? 'Criando...' : 'Criar usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
