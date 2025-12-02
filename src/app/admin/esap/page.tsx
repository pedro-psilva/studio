
'use client';
import {
    Activity,
    ArrowUpRight,
    BarChart,
    BarChart2,
    CheckCircle,
    Circle,
    DollarSign,
    LineChart,
    Package,
    TrendingDown,
    TrendingUp,
    Users,
    XCircle,
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
    ResponsiveContainer,
    BarChart as RechartsBarChart,
    LineChart as RechartsLineChart,
    Area,
    AreaChart,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
    Line,
    CartesianGrid
} from 'recharts';

const goalsVsResultsData = [
    { name: 'Marketing', meta: 4000, resultado: 2400 },
    { name: 'Comercial', meta: 3000, resultado: 1398 },
    { name: 'Produção', meta: 2000, resultado: 9800 },
    { name: 'Financeiro', meta: 2780, resultado: 3908 },
    { name: 'Suporte', meta: 1890, resultado: 4800 },
];

const growthData = [
    { name: 'Jan', crescimento: 4 },
    { name: 'Fev', crescimento: 3 },
    { name: 'Mar', crescimento: 5 },
    { name: 'Abr', crescimento: 4.5 },
    { name: 'Mai', crescimento: 6 },
    { name: 'Jun', crescimento: 5.5 },
];

const kpisCriticos = [
    { nome: 'Taxa de Recompra', status: 'atrasado', valor: '15%', meta: '25%' },
    { nome: 'Custo de Aquisição (CAC)', status: 'ok', valor: 'R$ 80', meta: 'R$ 75' },
    { nome: 'Tempo Médio de Produção', status: 'atrasado', valor: '6.2 dias', meta: '5 dias' },
];

export default function EsapDashboardPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <h1 className="text-3xl font-bold tracking-tight">ESAP – Dashboard Geral</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">no período atual</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Metas Concluídas (%)</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">75%</div>
                        <p className="text-xs text-muted-foreground">+15% em relação ao mês anterior</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Metas Atrasadas</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">necessitam de atenção</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Melhor KPI (Mês)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Ticket Médio</div>
                        <p className="text-xs text-muted-foreground">+32% acima da meta</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Metas vs. Resultados por Área</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsBarChart data={goalsVsResultsData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="meta" fill="#24C39E" name="Meta" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="resultado" fill="hsl(var(--primary))" name="Resultado" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-1 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Crescimento Percentual Consolidado</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsLineChart data={growthData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="crescimento" name="Crescimento (%)" stroke="hsl(var(--primary))" strokeWidth={2} />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="col-span-full lg:col-span-2">
                    <CardHeader>
                        <CardTitle>KPIs Críticos</CardTitle>
                        <CardDescription>Indicadores que precisam de atenção imediata.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>KPI</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Valor Atual</TableHead>
                                    <TableHead>Meta</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kpisCriticos.map((kpi) => (
                                    <TableRow key={kpi.nome}>
                                        <TableCell className="font-medium">{kpi.nome}</TableCell>
                                        <TableCell>
                                            <Badge variant={kpi.status === 'atrasado' ? 'destructive' : 'default'}>{kpi.status}</Badge>
                                        </TableCell>
                                        <TableCell>{kpi.valor}</TableCell>
                                        <TableCell>{kpi.meta}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {['Marketing', 'Comercial', 'Produção'].map(area => (
                    <Card key={area}>
                        <CardHeader>
                            <CardTitle>{area}</CardTitle>
                            <CardDescription>Resumo das metas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                           <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Concluídas</span>
                                <span className="font-bold">3/5</span>
                           </div>
                           <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Em Andamento</span>
                                <span className="font-bold">1</span>
                           </div>
                           <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Atrasadas</span>
                                <span className="font-bold text-red-500">1</span>
                           </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

        </main>
    );
}
