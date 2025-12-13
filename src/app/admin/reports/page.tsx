'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip, Legend } from 'recharts';
import { File } from "lucide-react";
import { listAllOrders, type OrderDocument } from '@/lib/orderService';
import { getService } from '@/lib/serviceService';

interface SalesByService {
  name: string;
  total: number;
}

interface CartConversionEntry {
  label: string;
  value: number;
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<OrderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await listAllOrders();
        if (!isMounted) return;
        setOrders(data);

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

  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, o) => acc + (o.total ?? 0), 0);
  }, [orders]);

  const salesByProductData: SalesByService[] = useMemo(() => {
    const map = new Map<string, number>();

    for (const order of orders) {
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
  }, [orders, serviceNames]);

  const {
    conversionRate,
    paidOrdersCount,
    totalOrdersCount,
    conversionChartData,
  } = useMemo(() => {
    const totalOrdersCount = orders.length;
    const paidOrdersCount = orders.filter((o) => o.paymentStatus === 'approved').length;

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
  }, [orders]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Visualize dados e insights de negócio em tempo real.</p>
        </div>
        <Button>
          <File className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em todos os pedidos cadastrados.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M3 3h18v4H3z" />
              <path d="M3 11h18v10H3z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">Inclui todos os status de pedido.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Serviço</CardTitle>
            <CardDescription>
              Receita estimada agrupada por produto/serviço dos pedidos.
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
              <p className="text-sm text-muted-foreground">Nenhum pedido encontrado para gerar o gráfico.</p>
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
            <CardTitle>Conversão de Carrinho</CardTitle>
            <CardDescription>
              Taxa de pedidos finalizados vs. carrinhos abandonados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <p className="text-sm text-muted-foreground">Carregando dados...</p>
            )}
            {!loading && error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {!loading && !error && totalOrdersCount === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum pedido encontrado para calcular a conversão.
              </p>
            )}
            {!loading && !error && totalOrdersCount > 0 && (
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {conversionRate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {paidOrdersCount} de {totalOrdersCount} pedidos com pagamento aprovado
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
    </main>
  );
}
