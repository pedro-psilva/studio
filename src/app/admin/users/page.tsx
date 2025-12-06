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
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { getAllUsers, updateUserById, deleteUserById } from '@/lib/admin-utils';

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data: any[] = await getAllUsers();

        const mapped: UserRow[] = data.map((user) => ({
          id: user.id,
          name:
            user.displayName ||
            user.clinicName ||
            user.email ||
            'Sem nome',
          type: user.pessoaTipo || 'PF',
          role: user.tipo || 'cliente',
          email: user.email || '',
          phone: user.phone || '',
          totalOrders: typeof user.totalOrders === 'number' ? user.totalOrders : 0,
          status: user.status || 'Ativo',
        }));

        setUsers(mapped);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        setError('Não foi possível carregar os usuários.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Adicionar Usuário
                  </span>
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
    </main>
  );
}
