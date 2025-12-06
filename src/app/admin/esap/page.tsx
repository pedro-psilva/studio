
'use client';
import {
    Activity,
    ArrowUpRight,
    Briefcase,
    CheckCircle,
    DollarSign,
    Target,
    TrendingUp,
    Users,
    XCircle,
    BarChart2,
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
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
    Line,
    CartesianGrid,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const goalsVsResultsData = [
    { name: 'Marketing', meta: 4000, resultado: 2400 },
    { name: 'Comercial', meta: 3000, resultado: 1398 },
    { name: 'Produção', meta: 2000, resultado: 1800 },
    { name: 'Financeiro', meta: 2780, resultado: 3908 },
    { name: 'Suporte', meta: 1890, resultado: 2100 },
];

const teamActivitiesData = [
  { name: 'Ana Silva', atividades: 45 },
  { name: 'Beatriz Costa', atividades: 62 },
  { name: 'Carlos Lima', atividades: 38 },
  { name: 'Daniel Martins', atividades: 55 },
  { name: 'Eduardo Filho', atividades: 29 },
];

const goalsStatusData = [
  { name: 'Concluídas', value: 8, color: '#22c55e' },
  { name: 'Em Andamento', value: 3, color: '#3b82f6' },
  { name: 'Atrasadas', value: 1, color: '#ef4444' },
];

const productivityRanking = [
    { id: 'user1', name: 'Ana Silva', progress: 95, avatarId: 'avatar-1' },
    { id: 'user2', name: 'Beatriz Costa', progress: 92, avatarId: 'avatar-1' },
    { id: 'user3', name: 'Carlos Lima', progress: 88, avatarId: 'avatar-1' },
    { id: 'user4', name: 'Daniel Martins', progress: 85, avatarId: 'avatar-1' },
    { id: 'user5', name: 'Eduardo Filho', progress: 76, avatarId: 'avatar-1' },
];


export default function EsapDashboardPage() {
    return (
        <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 bg-background">
            <h1 className="text-3xl font-bold tracking-tight">ESAP – Dashboard Geral</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Metas Ativas</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">12</div><p className="text-xs text-muted-foreground">no período atual</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Metas Concluídas</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">8</div><p className="text-xs text-muted-foreground">+15% vs. mês anterior</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Metas Atrasadas</CardTitle><XCircle className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold">1</div><p className="text-xs text-muted-foreground">necessita de atenção</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Visitas</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">42</div><p className="text-xs text-muted-foreground">registradas este mês</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Prospecções</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">25</div><p className="text-xs text-muted-foreground">+5% vs. mês anterior</p></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                 <Card className="col-span-1 lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle>Atividades da Equipe (Últimos 30 dias)</CardTitle>
                        <CardDescription>Volume de atividades registradas por colaborador.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsBarChart data={teamActivitiesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                <Bar dataKey="atividades" fill="hsl(var(--primary))" name="Atividades" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card className="col-span-1 bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle>Status das Metas</CardTitle>
                        <CardDescription>Distribuição geral das metas do período.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                             <PieChart>
                                <Pie data={goalsStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                    return (
                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                        {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                    }}>
                                    {goalsStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Legend wrapperStyle={{fontSize: "12px"}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                 <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle>Ranking de Produtividade</CardTitle>
                        <CardDescription>Top 5 colaboradores por percentual de metas atingidas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {productivityRanking.map(colab => {
                                const avatar = PlaceHolderImages.find(p => p.id === colab.avatarId);
                                return (
                                <div key={colab.id} className="flex items-center gap-4">
                                    {avatar && <Image src={avatar.imageUrl} alt={colab.name} width={40} height={40} className="rounded-full" />}
                                    <div className="flex-1">
                                        <p className="font-semibold">{colab.name}</p>
                                        <div className="h-2 mt-1 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${colab.progress}%` }}></div>
                                        </div>
                                    </div>
                                    <span className="font-bold text-lg">{colab.progress}%</span>
                                </div>
                            )})}
                        </div>
                    </CardContent>
                </Card>

                 <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle>Metas vs. Resultados por Área</CardTitle>
                        <CardDescription>Comparativo do planejado versus alcançado.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsBarChart data={goalsVsResultsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Legend wrapperStyle={{fontSize: "12px"}}/>
                                <Bar dataKey="meta" fill="hsl(var(--primary), 0.5)" name="Meta" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="resultado" fill="hsl(var(--primary))" name="Resultado" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
