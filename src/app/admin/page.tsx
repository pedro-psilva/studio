'use client';
import Link from 'next/link';
import {
  ArrowUpRight,
  DollarSign,
  Users,
  CreditCard,
  Activity,
  Package,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Header } from '@/components/layout/header';

const ordersByStatusData = [
  { name: 'Recebido', total: 45 },
  { name: 'Em Análise', total: 12 },
  { name: 'Em Produção', total: 38 },
  { name: 'Finalizado', total: 25 },
  { name: 'Enviado', total: 18 },
];

export default function AdminDashboard() {
  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Faturamento (Mês)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% em relação ao mês passado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos (Hoje)
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+25</div>
              <p className="text-xs text-muted-foreground">
                +10% em relação a ontem
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tempo Médio de Produção
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5.2 dias</div>
              <p className="text-xs text-muted-foreground">
                -0.5 dias em relação à semana passada
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos Atrasados
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">3</div>
              <p className="text-xs text-muted-foreground">
                Verificar produção urgente
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Pedidos por Status</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={ordersByStatusData}>
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
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Bar
                    dataKey="total"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Usados (Top 5)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              {[
                { name: 'Coroa de Zircônia', value: '1,250' },
                { name: 'Lente E-Max', value: '980' },
                { name: 'Implante de Titânio', value: '750' },
                { name: 'Guia Cirúrgico', value: '500' },
                { name: 'Prótese Total', value: '320' },
              ].map((product, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {product.name}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">{product.value} un.</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Pedidos Recentes</CardTitle>
              <CardDescription>
                Os 5 pedidos mais recentes.
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Produto
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    customer: 'Clínica Sorriso Aberto',
                    product: 'Coroa de Zircônia',
                    status: 'Em Produção',
                    date: '2023-11-23',
                    amount: '$250.00',
                  },
                  {
                    customer: 'Dr. João Pereira',
                    product: 'Lente E-Max',
                    status: 'Recebido',
                    date: '2023-11-22',
                    amount: '$150.00',
                  },
                  {
                    customer: 'OdontoPrime',
                    product: 'Implante de Titânio',
                    status: 'Enviado',
                    date: '2023-11-21',
                    amount: '$350.00',
                  },
                  {
                    customer: 'Clínica Dente Feliz',
                    product: 'Guia Cirúrgico',
                    status: 'Finalizado',
                    date: '2023-11-20',
                    amount: '$450.00',
                  },
                  {
                    customer: 'Dr. Ricardo Alves',
                    product: 'Prótese Total',
                    status: 'Em Análise',
                    date: '2023-11-19',
                    amount: '$550.00',
                  },
                ].map((order, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="font-medium">{order.customer}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {order.product}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className="text-xs" variant="outline">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {order.date}
                    </TableCell>
                    <TableCell className="text-right">{order.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
