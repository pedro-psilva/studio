'use client';

import { useEffect, useMemo, useState } from 'react';
import { File, ListFilter, MoreHorizontal, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { listAllOrders, type OrderDocument } from '@/lib/orderService';
import { format } from 'date-fns';

type OrderStatusFilter = 'all' | 'pending_payment' | 'paid' | 'in_production' | 'shipped' | 'delivered' | 'canceled';

interface OrderRow {
  id: string;
  client: string;
  date: string;
  total: number;
  orderStatus: OrderDocument['status'];
  paymentStatus: OrderDocument['paymentStatus'];
}

function getOrderStatusLabel(status: OrderDocument['status']): string {
  switch (status) {
    case 'pending_payment':
      return 'Pagamento pendente';
    case 'paid':
      return 'Pago';
    case 'in_production':
      return 'Em produção';
    case 'shipped':
      return 'Enviado';
    case 'delivered':
      return 'Entregue';
    case 'canceled':
      return 'Cancelado';
    default:
      return status;
  }
}

function getPaymentStatusLabel(status: OrderDocument['paymentStatus']): string {
  switch (status) {
    case 'waiting':
      return 'Aguardando pagamento';
    case 'approved':
      return 'Aprovado';
    case 'refused':
      return 'Recusado';
    case 'refunded':
      return 'Estornado';
    case null:
    default:
      return 'N/A';
  }
}

export default function OrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);

        const orders = await listAllOrders();

        const uniqueUserIds = Array.from(new Set(orders.map((o) => o.userId).filter(Boolean)));
        const userMap = new Map<string, { displayName?: string; clinicName?: string; email?: string }>();

        await Promise.all(
          uniqueUserIds.map(async (userId) => {
            try {
              const userRef = doc(db, 'users', userId);
              const snap = await getDoc(userRef);
              if (snap.exists()) {
                const data = snap.data() as any;
                userMap.set(userId, {
                  displayName: data.displayName,
                  clinicName: data.clinicName,
                  email: data.email,
                });
              }
            } catch (e) {
              // ignore per-user error
            }
          })
        );

        const mapped: OrderRow[] = orders.map((order) => {
          const userInfo = userMap.get(order.userId ?? '') ?? {};

          const clientName =
            userInfo.displayName ||
            userInfo.clinicName ||
            userInfo.email ||
            'Cliente';

          return {
            id: order.id,
            client: clientName,
            date: format(order.createdAt, 'dd/MM/yyyy'),
            total: order.total,
            orderStatus: order.status,
            paymentStatus: order.paymentStatus,
          };
        });

        if (!isMounted) return;
        setRows(mapped);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message ?? 'Erro ao carregar pedidos');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    let result = [...rows];

    if (statusFilter !== 'all') {
      result = result.filter((row) => row.orderStatus === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((row) => {
        return (
          row.id.toLowerCase().includes(term) ||
          row.client.toLowerCase().includes(term)
        );
      });
    }

    return result;
  }, [rows, searchTerm, statusFilter]);

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle>Pedidos</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os pedidos clínicos cadastrados.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por ID ou cliente..."
                  className="w-full rounded-lg bg-background pl-8"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
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
                    <DropdownMenuLabel>Filtrar por status do pedido</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === 'all'}
                      onCheckedChange={() => setStatusFilter('all')}
                    >
                      Todos
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === 'pending_payment'}
                      onCheckedChange={() => setStatusFilter('pending_payment')}
                    >
                      Aguardando pagamento
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === 'paid'}
                      onCheckedChange={() => setStatusFilter('paid')}
                    >
                      Pago
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === 'in_production'}
                      onCheckedChange={() => setStatusFilter('in_production')}
                    >
                      Em produção
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === 'shipped'}
                      onCheckedChange={() => setStatusFilter('shipped')}
                    >
                      Enviado
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === 'delivered'}
                      onCheckedChange={() => setStatusFilter('delivered')}
                    >
                      Entregue
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === 'canceled'}
                      onCheckedChange={() => setStatusFilter('canceled')}
                    >
                      Cancelado
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Exportar
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="hidden md:table-cell">Valor</TableHead>
                <TableHead className="hidden md:table-cell">Status Pedido</TableHead>
                <TableHead>Status Pagamento</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    Carregando pedidos...
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

              {!loading && !error && filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}

              {!loading && !error &&
                filteredRows.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.client}</TableCell>
                    <TableCell className="hidden md:table-cell">{order.date}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {order.total.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={
                          order.orderStatus === 'paid' || order.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : order.orderStatus === 'pending_payment'
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : order.orderStatus === 'in_production' || order.orderStatus === 'shipped'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-destructive/10 text-destructive border-destructive/30'
                        }
                      >
                        {getOrderStatusLabel(order.orderStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          order.paymentStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : order.paymentStatus === 'waiting'
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : order.paymentStatus === 'refused' || order.paymentStatus === 'refunded'
                            ? 'bg-destructive/10 text-destructive border-destructive/30'
                            : 'bg-muted text-muted-foreground border-muted'
                        }
                      >
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{order.id}</TableCell>
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
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              Ver Pedido
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Atualizar Status</DropdownMenuItem>
                          <DropdownMenuItem>Baixar Arquivos</DropdownMenuItem>
                          <DropdownMenuItem>Enviar Notificação</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
