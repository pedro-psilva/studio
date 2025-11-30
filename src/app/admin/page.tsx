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
  ShoppingCart,
  PackageCheck,
  Factory,
  FileWarning,
} from 'lucide-react';
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
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const ordersByStatusData = [
  { name: 'Recebido', total: 45 },
  { name: 'Em Análise', total: 12 },
  { name: 'Em Produção', total: 38 },
  { name: 'Finalizado', total: 25 },
  { name: 'Enviado', total: 18 },
];

const salesLast30Days = [
    { date: '01/11', value: 1200 },
    { date: '02/11', value: 1500 },
    { date: '03/11', value: 900 },
    { date: '04/11', value: 2200 },
    { date: '05/11', value: 1800 },
    { date: '06/11', value: 2500 },
    { date: '07/11', value: 2100 },
  ];

export default function AdminDashboard() {
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
              <div className="text-2xl font-bold">25</div>
              <p className="text-xs text-muted-foreground">+10% vs ontem</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Produção</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">38</div>
              <p className="text-xs text-muted-foreground">Itens na esteira</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Finalizados (Hoje)</CardTitle>
              <PackageCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Prontos para envio</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento (Mês)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$45.231,89</div>
              <p className="text-xs text-muted-foreground">+20.1% vs mês passado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-muted-foreground">+5 novos este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Atrasados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">3</div>
              <p className="text-xs text-muted-foreground">Verificar produção</p>
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
                <AreaChart data={salesLast30Days}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
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
                    tickFormatter={(value) => `R$${value/1000}k`}
                  />
                   <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUv)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top Serviços Mais Vendidos</CardTitle>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <Card className="lg:col-span-2">
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
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { customer: 'Clínica Sorriso Aberto', product: 'Coroa de Zircônia', status: 'Em Produção', amount: 'R$250.00' },
                      { customer: 'Dr. João Pereira', product: 'Lente E-Max', status: 'Recebido', amount: 'R$150.00' },
                      { customer: 'OdontoPrime', product: 'Implante de Titânio', status: 'Enviado', amount: 'R$350.00' },
                      { customer: 'Clínica Dente Feliz', product: 'Guia Cirúrgico', status: 'Finalizado', amount: 'R$450.00' },
                      { customer: 'Dr. Ricardo Alves', product: 'Prótese Total', status: 'Em Análise', amount: 'R$550.00' },
                    ].map((order, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="font-medium">{order.customer}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{order.product}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className="text-xs" variant="outline">{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{order.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileWarning className="h-5 w-5 text-destructive"/> Alertas</CardTitle>
                    <CardDescription>Ações que precisam de atenção</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="flex-1">
                            <p className="text-sm font-medium">Pedido #ORD-087</p>
                            <p className="text-xs text-muted-foreground">Faltando arquivo STL</p>
                        </div>
                        <Button variant="secondary" size="sm">Resolver</Button>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="flex-1">
                            <p className="text-sm font-medium">Pedido #ORD-082</p>
                            <p className="text-xs text-muted-foreground">Pagamento pendente</p>
                        </div>
                        <Button variant="secondary" size="sm">Ver Fatura</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
