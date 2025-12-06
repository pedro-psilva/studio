'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ListFilter,
  Search,
  File,
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { listAllOrders, OrderDocument } from '@/lib/orderService';
import { format } from 'date-fns';
import Link from 'next/link';

interface InvoiceRow {
  id: string;
  orderId: string;
  client: string;
  date: string;
  value: number;
  status: 'Pago' | 'Pendente' | 'Vencido';
}

export default function FinancePage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pago' | 'Pendente' | 'Vencido'>('all');

  useEffect(() => {
    let isMounted = true;

    async function loadFinanceData() {
      try {
        setLoading(true);
        setError(null);

        const orders: OrderDocument[] = await listAllOrders();

        // carrega usuários envolvidos para mostrar o nome / clínica
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
              // ignora erro de usuário individual
            }
          })
        );

        const mapped: InvoiceRow[] = orders.map((order) => {
          const userInfo = userMap.get(order.userId ?? '') ?? {};

          const clientName =
            userInfo.displayName ||
            userInfo.clinicName ||
            userInfo.email ||
            order.userId ||
            'Cliente';

          let status: InvoiceRow['status'] = 'Pendente';
          if (order.paymentStatus === 'approved') status = 'Pago';
          else if (order.paymentStatus === 'refused' || order.paymentStatus === 'refunded')
            status = 'Vencido';

          return {
            id: order.id,
            orderId: order.id,
            client: clientName,
            date: format(order.createdAt, 'dd/MM/yyyy'),
            value: order.total,
            status,
          };
        });

        if (!isMounted) return;
        setInvoices(mapped);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message ?? 'Erro ao carregar dados financeiros');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadFinanceData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    if (statusFilter !== 'all') {
      result = result.filter((inv) => inv.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((inv) => {
        return (
          inv.id.toLowerCase().includes(term) ||
          inv.orderId.toLowerCase().includes(term) ||
          inv.client.toLowerCase().includes(term)
        );
      });
    }

    return result;
  }, [invoices, searchTerm, statusFilter]);

  const totalValue = filteredInvoices.reduce((acc, inv) => acc + inv.value, 0);

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle>Financeiro</CardTitle>
              <CardDescription>
                Acompanhe faturas, pagamentos e receita total gerada pelos pedidos.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por fatura, pedido ou cliente..."
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
                    <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === 'all'}
                      onCheckedChange={() => setStatusFilter('all')}
                    >
                      Todos
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === 'Pago'}
                      onCheckedChange={() => setStatusFilter('Pago')}
                    >
                      Pago
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === 'Pendente'}
                      onCheckedChange={() => setStatusFilter('Pendente')}
                    >
                      Pendente
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === 'Vencido'}
                      onCheckedChange={() => setStatusFilter('Vencido')}
                    >
                      Vencido
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
          <div className="mb-4 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div>
              {loading && <span>Carregando informações financeiras...</span>}
              {!loading && error && <span className="text-destructive">{error}</span>}
              {!loading && !error && (
                <span>
                  {filteredInvoices.length} fatura
                  {filteredInvoices.length !== 1 && 's'} encontradas
                </span>
              )}
            </div>
            <div className="font-medium">
              Total filtrado:{' '}
              {totalValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Fatura</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
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
                    Carregando faturas...
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

              {!loading && !error && filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    Nenhuma fatura encontrada.
                  </TableCell>
                </TableRow>
              )}

              {!loading && !error &&
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.orderId}</TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>
                      {invoice.value.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.status === 'Pago'
                            ? 'default'
                            : invoice.status === 'Pendente'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/orders/${invoice.orderId}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
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
