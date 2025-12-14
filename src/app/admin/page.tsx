'use client';
import Link from 'next/link';
import {
  ArrowUpRight,
  DollarSign,
  Users,
  AlertTriangle,
  ShoppingCart,
  PackageCheck,
  Factory,
  FileWarning,
} from 'lucide-react';
import { useEffect, useMemo, useState } from "react";
import { format, isSameDay, isSameMonth, startOfDay, subDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { listAllOrders, type OrderDocument } from "@/lib/orderService";
import { getService } from "@/lib/serviceService";

type DashboardOrder = OrderDocument & {
  clientName: string;
};

type SalesPoint = {
  date: string;
  value: number;
};

type TopProduct = {
  id: string;
  name: string;
  units: number;
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const rawOrders = await listAllOrders();

        const uniqueUserIds = Array.from(
          new Set(rawOrders.map((o) => o.userId).filter(Boolean)),
        );

        const userMap = new Map<
          string,
          { displayName?: string; clinicName?: string; email?: string }
        >();

        await Promise.all(
          uniqueUserIds.map(async (userId) => {
            try {
              const userRef = doc(db, "users", userId);
              const snap = await getDoc(userRef);
              if (snap.exists()) {
                const data = snap.data() as any;
                userMap.set(userId, {
                  displayName: data.displayName,
                  clinicName: data.clinicName,
                  email: data.email,
                });
              }
            } catch {
            }
          }),
        );

        const mapped: DashboardOrder[] = rawOrders.map((order) => {
          const userInfo = userMap.get(order.userId ?? "") ?? {};

          const clientName =
            userInfo.displayName ||
            userInfo.clinicName ||
            userInfo.email ||
            "Cliente";

          return {
            ...order,
            clientName,
          };
        });

        if (!isMounted) return;
        setOrders(mapped);

        // carrega nomes de serviços para os productIds presentes nos pedidos
        const productIds = Array.from(
          new Set(
            mapped
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
        setError(err?.message ?? "Erro ao carregar dados do dashboard");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const today = startOfDay(new Date());

  const {
    ordersTodayCount,
    inProductionCount,
    finishedTodayCount,
    monthRevenue,
    activeClientsCount,
    delayedOrdersCount,
    salesLast7Days,
    topProducts,
    recentOrders,
  } = useMemo(() => {
    const ordersToday = orders.filter((o) => isSameDay(o.createdAt, today));

    const ordersTodayCount = ordersToday.length;

    const inProductionCount = orders.filter(
      (o) => o.status === "in_production",
    ).length;

    const finishedTodayCount = ordersToday.filter((o) =>
      ["delivered", "shipped"].includes(o.status),
    ).length;

    const monthRevenue = orders
      .filter(
        (o) =>
          isSameMonth(o.createdAt, today) && o.paymentStatus === "approved",
      )
      .reduce((sum, o) => sum + o.total, 0);

    const activeClientIds = new Set(orders.map((o) => o.userId).filter(Boolean));
    const activeClientsCount = activeClientIds.size;

    const delayedOrdersCount = orders.filter((o) => {
      const diffMs = today.getTime() - o.createdAt.getTime();
      const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
      return (
        diffMs > twoDaysMs &&
        (o.status === "pending_payment" || o.status === "in_production")
      );
    }).length;

    const last7Days: SalesPoint[] = Array.from({ length: 7 }).map((_, idx) => {
      const date = subDays(today, 6 - idx);
      const value = orders
        .filter(
          (o) =>
            isSameDay(o.createdAt, date) &&
            o.paymentStatus === "approved",
        )
        .reduce((sum, o) => sum + o.total, 0);

      return {
        date: format(date, "dd/MM"),
        value,
      };
    });

    const productMap = new Map<string, { units: number }>();

    for (const order of orders) {
      for (const item of order.items ?? []) {
        if (!item.productId) continue;
        const current = productMap.get(item.productId) ?? { units: 0 };
        current.units += (item.quantity as number) ?? 0;
        productMap.set(item.productId, current);
      }
    }

    const topProducts: TopProduct[] = Array.from(productMap.entries())
      .map(([id, data]) => ({
        id,
        name: serviceNames[id] ?? 'Serviço não especificado',
        units: data.units,
      }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    const recentOrders = [...orders]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((o) => ({
        id: o.id,
        customer: o.clientName,
        product:
          o.items && o.items[0]
            ? serviceNames[o.items[0].productId] ?? 'Serviço não especificado'
            : "Serviços",
        patient:
          o.items && o.items[0]?.patientName
            ? o.items[0].patientName
            : "Paciente",
      }));

    return {
      ordersTodayCount,
      inProductionCount,
      finishedTodayCount,
      monthRevenue,
      activeClientsCount,
      delayedOrdersCount,
      salesLast7Days: last7Days,
      topProducts,
      recentOrders,
    };
  }, [orders, today, serviceNames]);

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos (Hoje)</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : ordersTodayCount}
              </div>
              <p className="text-xs text-muted-foreground">Pedidos criados hoje</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Produção</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : inProductionCount}
              </div>
              <p className="text-xs text-muted-foreground">Itens na esteira</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Finalizados (Hoje)</CardTitle>
              <PackageCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : finishedTodayCount}
              </div>
              <p className="text-xs text-muted-foreground">Prontos para envio</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento (Mês)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading
                  ? "..."
                  : monthRevenue.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
              </div>
              <p className="text-xs text-muted-foreground">
                Pagamentos aprovados no mês
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : activeClientsCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Clientes com pelo menos um pedido
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Atrasados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {loading ? "..." : delayedOrdersCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Pendentes há mais de 2 dias
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Vendas (Últimos 7 dias)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={salesLast7Days}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
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
                      (value as number).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 0,
                      })
                    }
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/50"
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--accent))", opacity: 0.2 }}
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                    formatter={(value: any) =>
                      (value as number).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorUv)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top Serviços Mais Vendidos</CardTitle>
              <CardDescription>
                Ranking de produtos por unidades vendidas.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {loading && (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              )}
              {!loading &&
                topProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {product.name}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {product.units} un.
                    </div>
                  </div>
                ))}
              {!loading && topProducts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Ainda não há vendas suficientes para este ranking.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Pedidos Recentes</CardTitle>
                <CardDescription>
                  Os 5 pedidos mais recentes que entraram na plataforma.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/admin/orders">
                  Ver Todos
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading && (
                <p className="text-sm text-muted-foreground">
                  Carregando pedidos...
                </p>
              )}
              {!loading && error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              {!loading && !error && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quem comprou</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Produto
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Paciente
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Link
                            href={`/admin/orders`}
                            className="font-medium hover:underline"
                          >
                            {order.customer}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {order.product}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {order.patient}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!loading && recentOrders.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-sm text-muted-foreground"
                        >
                          Nenhum pedido encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-destructive" /> Alertas e
                Pendências
              </CardTitle>
              <CardDescription>
                Ações que precisam de atenção imediata.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {loading && (
                <p className="text-sm text-muted-foreground">
                  Carregando alertas...
                </p>
              )}
              {!loading && delayedOrdersCount === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum alerta crítico no momento.
                </p>
              )}
              {!loading && delayedOrdersCount > 0 && (
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pedidos atrasados</p>
                    <p className="text-xs text-muted-foreground">
                      {delayedOrdersCount} pedido(s) com pendência de produção
                      ou pagamento há mais de 2 dias.
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" asChild>
                    <Link href="/admin/orders">Ver Pedidos</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}