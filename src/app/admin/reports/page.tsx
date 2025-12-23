'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip, Legend } from 'recharts';
import { FileText, Download, Filter, Calendar, BarChart3 } from "lucide-react";
import { listAllOrders, type OrderDocument } from '@/lib/orderService';
import { getService } from '@/lib/serviceService';
import { exportTablePDF, generateFullReport, type ExportFields } from '@/lib/reports/pdfGenerator';

interface SalesByService {
  name: string;
  total: number;
}

interface CartConversionEntry {
  label: string;
  value: number;
}

export default function ReportsPage() {
  const [allOrders, setAllOrders] = useState<OrderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({});
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Campos para exportação
  const [exportFields, setExportFields] = useState<ExportFields>({
    id: true,
    date: true,
    customer: true,
    products: true,
    status: true,
    paymentStatus: true,
    subtotal: true,
    shipping: true,
    discount: true,
    total: true,
    paymentProvider: true,
    itemsCount: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await listAllOrders();
        if (!isMounted) return;
        setAllOrders(data);

        const productIds = Array.from(
          new Set(
            data
              .flatMap((o) => o.items?.map((i) => i.productId) ?? [])
              .filter(Boolean) as string[],
          ),
        );

        if (productIds.length > 0) {
          const entries = await Promise.all(
            productIds.map(async (pid) => {
              try {
                const service = await getService(pid);
                return [
                  pid,
                  service?.nome ?? 'Serviço não especificado',
                ] as [string, string];
              } catch {
                return [pid, 'Serviço não especificado'] as [string, string];
              }
            }),
          );

          if (!isMounted) return;
          setServiceNames(Object.fromEntries(entries));
        }

        // Buscar nomes dos usuários via API
        const userIds = Array.from(new Set(data.map(o => o.userId).filter(Boolean) as string[]));
        if (userIds.length > 0) {
          try {
            const token = await (await import('firebase/auth')).getAuth().currentUser?.getIdToken();
            const response = await fetch('/api/admin/users/names', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ userIds })
            });

            if (response.ok) {
              const { userNames } = await response.json();
              if (!isMounted) return;
              setUserNames(userNames);
            }
          } catch (error) {
            console.error('Erro ao buscar nomes de usuários:', error);
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message ?? 'Erro ao carregar relatórios');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  // Pedidos filtrados
  const filteredOrders = useMemo(() => {
    return allOrders.filter(order => {
      // Filtro de data
      if (startDate && order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const start = new Date(startDate);
        if (orderDate < start) return false;
      }
      if (endDate && order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }

      // Filtro de status
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Filtro de pagamento
      if (paymentFilter !== 'all' && order.paymentStatus !== paymentFilter) {
        return false;
      }

      return true;
    });
  }, [allOrders, startDate, endDate, statusFilter, paymentFilter]);

  // Métricas corretas: considerar apenas pedidos aprovados para faturamento
  const { totalRevenue, paidRevenue, pendingRevenue } = useMemo(() => {
    const paidOrders = filteredOrders.filter(o => o.paymentStatus === 'approved');
    const pendingOrders = filteredOrders.filter(o => o.paymentStatus !== 'approved');

    return {
      totalRevenue: filteredOrders.reduce((acc, o) => acc + (o.total ?? 0), 0),
      paidRevenue: paidOrders.reduce((acc, o) => acc + (o.total ?? 0), 0),
      pendingRevenue: pendingOrders.reduce((acc, o) => acc + (o.total ?? 0), 0),
    };
  }, [filteredOrders]);

  // Faturamento por produto - apenas pedidos aprovados
  const salesByProductData: SalesByService[] = useMemo(() => {
    const map = new Map<string, number>();
    const paidOrders = filteredOrders.filter(o => o.paymentStatus === 'approved');

    for (const order of paidOrders) {
      const totalItems = order.items?.reduce((acc, item) => acc + (item.quantity ?? 1), 0) || 1;
      const valuePerUnit = (order.total ?? 0) / totalItems;

      for (const item of order.items ?? []) {
        const key = item.productId || 'Serviço';
        const add = valuePerUnit * (item.quantity ?? 1);
        map.set(key, (map.get(key) ?? 0) + add);
      }
    }

    return Array.from(map.entries()).map(([productId, total]) => ({
      name: serviceNames[productId] ?? 'Serviço não especificado',
      total,
    }));
  }, [filteredOrders, serviceNames]);

  const {
    conversionRate,
    paidOrdersCount,
    totalOrdersCount,
    conversionChartData,
  } = useMemo(() => {
    const totalOrdersCount = filteredOrders.length;
    const paidOrdersCount = filteredOrders.filter((o) => o.paymentStatus === 'approved').length;

    const conversionRate = totalOrdersCount > 0
      ? (paidOrdersCount / totalOrdersCount) * 100
      : 0;

    const notConvertedCount = Math.max(totalOrdersCount - paidOrdersCount, 0);

    const conversionChartData: CartConversionEntry[] = [
      { label: 'Convertidos', value: paidOrdersCount },
      { label: 'Não convertidos', value: notConvertedCount },
    ];

    return {
      conversionRate,
      paidOrdersCount,
      totalOrdersCount,
      conversionChartData,
    };
  }, [filteredOrders]);

  // Toggle campo de exportação
  const toggleField = (field: keyof ExportFields) => {
    setExportFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Toggle todos os campos
  const toggleAllFields = () => {
    const allChecked = Object.values(exportFields).every(v => v);
    const newState = !allChecked;
    setExportFields({
      id: newState,
      date: newState,
      customer: newState,
      products: newState,
      status: newState,
      paymentStatus: newState,
      subtotal: newState,
      shipping: newState,
      discount: newState,
      total: newState,
      paymentProvider: newState,
      itemsCount: newState,
    });
  };

  // Limpar filtros
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    setPaymentFilter('all');
  };

  // Função para exportar como CSV
  const handleExportCSV = () => {
    const escapeCsvValue = (value: string | number): string => {
      const str = String(value);
      if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const formatDate = (date: Date) =>
      new Date(date).toLocaleDateString('pt-BR');

    const formatStatus = (status: string) => {
      const statusMap: Record<string, string> = {
        'pending_payment': 'Aguardando Pagamento',
        'paid': 'Pago',
        'approved': 'Aprovado',
        'in_production': 'Em Producao',
        'shipped': 'Enviado',
        'delivered': 'Entregue',
        'canceled': 'Cancelado',
      };
      return statusMap[status] || status;
    };

    const formatPaymentStatus = (status: string) => {
      const statusMap: Record<string, string> = {
        'waiting': 'Aguardando',
        'approved': 'Aprovado',
        'refused': 'Recusado',
        'refunded': 'Reembolsado',
      };
      return statusMap[status] || status;
    };

    // Construir cabeçalhos baseado nos campos selecionados
    const headers: string[] = [];
    if (exportFields.id) headers.push('ID do Pedido');
    if (exportFields.date) headers.push('Data de Criacao');
    if (exportFields.customer) headers.push('Nome do Cliente');
    if (exportFields.products) headers.push('Produtos');
    if (exportFields.status) headers.push('Status do Pedido');
    if (exportFields.paymentStatus) headers.push('Status do Pagamento');
    if (exportFields.subtotal) headers.push('Subtotal (R$)');
    if (exportFields.shipping) headers.push('Frete (R$)');
    if (exportFields.discount) headers.push('Desconto (R$)');
    if (exportFields.total) headers.push('Total (R$)');
    if (exportFields.paymentProvider) headers.push('Provedor de Pagamento');
    if (exportFields.itemsCount) headers.push('Quantidade de Itens');

    // Construir linhas baseado nos campos selecionados
    const rows = filteredOrders.map(order => {
      const productNames = order.items?.map(item => {
        const productName = serviceNames[item.productId || ''] || 'Produto nao especificado';
        return item.quantity && item.quantity > 1 ? `${productName} (${item.quantity}x)` : productName;
      }) || [];
      const productsString = productNames.join(', ');

      const row: string[] = [];
      if (exportFields.id) row.push(order.id || '');
      if (exportFields.date) row.push(order.createdAt ? formatDate(order.createdAt) : '');
      if (exportFields.customer) row.push(userNames[order.userId || ''] || 'Cliente nao identificado');
      if (exportFields.products) row.push(productsString);
      if (exportFields.status) row.push(formatStatus(order.status || ''));
      if (exportFields.paymentStatus) row.push(formatPaymentStatus(order.paymentStatus || ''));
      if (exportFields.subtotal) row.push((order.subtotal || 0).toFixed(2).replace('.', ','));
      if (exportFields.shipping) row.push((order.shipping || 0).toFixed(2).replace('.', ','));
      if (exportFields.discount) row.push((order.discount || 0).toFixed(2).replace('.', ','));
      if (exportFields.total) row.push((order.total || 0).toFixed(2).replace('.', ','));
      if (exportFields.paymentProvider) row.push(order.paymentProvider === 'infinitepay' ? 'InfinitePay' : order.paymentProvider || '');
      if (exportFields.itemsCount) row.push((order.items?.length || 0).toString());

      return row;
    });

    const csvLines = [
      headers.map(h => escapeCsvValue(h)).join(';'),
      ...rows.map(row => row.map(cell => escapeCsvValue(cell)).join(';'))
    ];

    const csvContent = csvLines.join('\r\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const now = new Date().toISOString().slice(0, 10);

    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-pedidos-${now}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para exportar tabela como PDF (usa helper reutilizável)
  const handleExportTablePDF = () => {
    exportTablePDF(
      {
        orders: filteredOrders,
        serviceNames,
        userNames,
        paidRevenue,
        pendingRevenue,
        totalOrdersCount,
        paidOrdersCount,
        conversionRate,
        salesByProductData,
      },
      exportFields,
      { startDate, endDate, statusFilter, paymentFilter }
    );
  };

  // Função para gerar relatório executivo completo
  const handleGenerateFullReport = () => {
    generateFullReport(
      {
        orders: filteredOrders,
        serviceNames,
        userNames,
        paidRevenue,
        pendingRevenue,
        totalOrdersCount,
        paidOrdersCount,
        conversionRate,
        salesByProductData,
      },
      { startDate, endDate, statusFilter, paymentFilter }
    );
  };

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Configure os filtros e campos para gerar relatórios personalizados.</p>
      </div>

      {/* Seção de Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Período e Status
          </CardTitle>
          <CardDescription>
            Filtre os dados por período de tempo e status de pedido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data Início
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data Fim
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusFilter">Status do Pedido</Label>
              <select
                id="statusFilter"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="pending_payment">Aguardando Pagamento</option>
                <option value="paid">Pago</option>
                <option value="in_production">Em Produção</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregue</option>
                <option value="canceled">Cancelado</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentFilter">Status de Pagamento</Label>
              <select
                id="paymentFilter"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="waiting">Aguardando</option>
                <option value="approved">Aprovado</option>
                <option value="refused">Recusado</option>
                <option value="refunded">Reembolsado</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar Filtros
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              {filteredOrders.length} de {allOrders.length} pedido(s) filtrado(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Campos */}
      <Card>
        <CardHeader>
          <CardTitle>Campos para Exportação</CardTitle>
          <CardDescription>
            Selecione quais campos deseja incluir no relatório exportado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={Object.values(exportFields).every(v => v)}
                onCheckedChange={toggleAllFields}
              />
              <label htmlFor="select-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Selecionar Todos
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries({
                id: 'ID do Pedido',
                date: 'Data',
                customer: 'Cliente',
                products: 'Produtos',
                status: 'Status',
                paymentStatus: 'Status Pagamento',
                subtotal: 'Subtotal',
                shipping: 'Frete',
                discount: 'Desconto',
                total: 'Total',
                paymentProvider: 'Provedor',
                itemsCount: 'Qtd. Itens'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={exportFields[key as keyof ExportFields]}
                    onCheckedChange={() => toggleField(key as keyof ExportFields)}
                  />
                  <label htmlFor={key} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Exportação */}
      <div className="flex gap-2">
        <Button onClick={handleExportCSV} variant="outline" disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
        <Button onClick={handleExportTablePDF} variant="outline" disabled={loading}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar Tabela PDF
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em {filteredOrders.length} pedido(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              {allOrders.length > filteredOrders.length && `De ${allOrders.length} total`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {paidOrdersCount} de {totalOrdersCount} pagos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Serviço</CardTitle>
            <CardDescription>
              Receita agrupada por produto/serviço
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <p className="text-sm text-muted-foreground">Carregando dados...</p>
            )}
            {!loading && error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {!loading && !error && salesByProductData.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum pedido encontrado.</p>
            )}
            {!loading && !error && salesByProductData.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByProductData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      value.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0,
                      })
                    }
                  />
                  <Tooltip
                    formatter={(value: any) =>
                      (value as number).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="total"
                    name="Faturamento"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversão de Pedidos</CardTitle>
            <CardDescription>
              Pedidos aprovados vs. não aprovados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <p className="text-sm text-muted-foreground">Carregando dados...</p>
            )}
            {!loading && !error && totalOrdersCount > 0 && (
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {conversionRate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {paidOrdersCount} de {totalOrdersCount} aprovados
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={conversionChartData}>
                    <XAxis
                      dataKey="label"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(value: any) => `${value} pedido(s)`}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Pedidos"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Botão de Relatório Executivo */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Relatório Executivo Completo</h3>
              <p className="text-sm text-muted-foreground">
                Gere um relatório detalhado com análise financeira, faturamento por produto e lista completa de pedidos aprovados
              </p>
            </div>
            <Button onClick={handleGenerateFullReport} size="lg" disabled={loading}>
              <BarChart3 className="mr-2 h-5 w-5" />
              Gerar Relatório Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
