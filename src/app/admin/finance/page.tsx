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
  const [periodFilter, setPeriodFilter] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

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

    // Filtro de período
    if (periodFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      if (periodFilter === 'month') {
        filterDate.setMonth(now.getMonth() - 1);
      } else if (periodFilter === 'quarter') {
        filterDate.setMonth(now.getMonth() - 3);
      } else if (periodFilter === 'year') {
        filterDate.setFullYear(now.getFullYear() - 1);
      }

      result = result.filter((inv) => {
        const invDate = new Date(inv.date.split('/').reverse().join('-'));
        return invDate >= filterDate;
      });
    }

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
  }, [invoices, searchTerm, statusFilter, periodFilter]);

  // Métricas financeiras
  const metrics = useMemo(() => {
    const receitaConfirmada = invoices
      .filter(inv => inv.status === 'Pago')
      .reduce((acc, inv) => acc + inv.value, 0);

    const aReceber = invoices
      .filter(inv => inv.status === 'Pendente')
      .reduce((acc, inv) => acc + inv.value, 0);

    const inadimplencia = invoices
      .filter(inv => inv.status === 'Vencido')
      .reduce((acc, inv) => acc + inv.value, 0);

    // Fluxo do mês atual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const fluxoMes = invoices
      .filter(inv => {
        const invDate = new Date(inv.date.split('/').reverse().join('-'));
        return invDate >= firstDayOfMonth && inv.status === 'Pago';
      })
      .reduce((acc, inv) => acc + inv.value, 0);

    return { receitaConfirmada, aReceber, inadimplencia, fluxoMes };
  }, [invoices]);

  const totalValue = filteredInvoices.reduce((acc, inv) => acc + inv.value, 0);

  // Função para exportar CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Data', 'Cliente', 'Valor', 'Status', 'ID do Pedido'];

    const rows = filteredInvoices.map(inv => [
      inv.id,
      inv.date,
      inv.client,
      inv.value.toFixed(2).replace('.', ','),
      inv.status,
      inv.orderId
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\r\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const now = new Date().toISOString().slice(0, 10);

    link.setAttribute('href', url);
    link.setAttribute('download', `faturas-${now}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Filtrar por período</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={periodFilter === 'all'}
                      onCheckedChange={() => setPeriodFilter('all')}
                    >
                      Todos
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={periodFilter === 'month'}
                      onCheckedChange={() => setPeriodFilter('month')}
                    >
                      Último Mês
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={periodFilter === 'quarter'}
                      onCheckedChange={() => setPeriodFilter('quarter')}
                    >
                      Último Trimestre
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={periodFilter === 'year'}
                      onCheckedChange={() => setPeriodFilter('year')}
                    >
                      Último Ano
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExportCSV}>
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
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pedido</TableHead>
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
                    <TableCell className="font-medium">{invoice.orderId}</TableCell>
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

      {/* Cards de Métricas Financeiras */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Confirmada</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-green-600"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.receitaConfirmada.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagamentos aprovados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-yellow-600"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.aReceber.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagamentos pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inadimplência</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-red-600"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.inadimplencia.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Recusados/Vencidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fluxo do Mês</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-blue-600"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.fluxoMes.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Recebido este mês
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
