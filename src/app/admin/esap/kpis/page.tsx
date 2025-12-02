'use client';
import { AreaChart, BarChart, File, ListFilter, MoreHorizontal, PlusCircle, Search, Trash, Edit, Eye, TrendingUp, DollarSign, Target, Briefcase, Hand, Users, LineChart as LineChartIcon, BarChart2, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ResponsiveContainer, BarChart as RechartsBarChart, PieChart, Pie, Cell } from 'recharts';

const kpiData = [
  { area: 'Comercial', name: 'Taxa de Conversão', indicator: 'Pedidos / Sessões', unit: '%', trend: [5, 6, 5, 7, 8], metas: 2, color: 'hsl(210, 89%, 64%)' },
  { area: 'Comercial', name: 'Ticket Médio', indicator: 'Receita / Pedidos', unit: 'R$', trend: [250, 260, 280, 270, 290], metas: 1, color: 'hsl(210, 89%, 64%)' },
  { area: 'Financeiro', name: 'CAC', indicator: 'Custo Marketing / Novos Clientes', unit: 'R$', trend: [120, 110, 100, 115, 105], metas: 1, color: 'hsl(142, 71%, 45%)' },
  { area: 'Financeiro', name: 'Lucratividade', indicator: '(Lucro / Receita) * 100', unit: '%', trend: [15, 18, 17, 20, 22], metas: 1, color: 'hsl(142, 71%, 45%)' },
  { area: 'Produção', name: 'Tempo Médio de Produção', indicator: 'Dias', unit: 'dias', trend: [7, 6, 6.5, 5.5, 5], metas: 1, color: 'hsl(48, 96%, 53%)' },
  { area: 'Suporte', name: 'CSAT', indicator: 'Avaliações Positivas / Total', unit: '%', trend: [90, 92, 91, 93, 95], metas: 1, color: 'hsl(262, 83%, 67%)' },
];

const kpisByArea = kpiData.reduce((acc, kpi) => {
  if (!acc[kpi.area]) {
    acc[kpi.area] = [];
  }
  acc[kpi.area].push(kpi);
  return acc;
}, {} as Record<string, typeof kpiData>);


const summaryCards = [
    { title: 'Total de KPIs', value: kpiData.length, icon: BarChart2, color: 'text-primary' },
    { title: 'Áreas Cobertas', value: Object.keys(kpisByArea).length, icon: Briefcase, color: 'text-sky-500' },
    { title: 'KPIs com Metas Ativas', value: kpiData.filter(k => k.metas > 0).length, icon: Target, color: 'text-green-500' },
    { title: 'KPIs Sem Metas', value: kpiData.filter(k => k.metas === 0).length, icon: XCircle, color: 'text-amber-500' },
]

const areaDistributionData = Object.entries(kpisByArea).map(([name, kpis]) => ({ name, value: kpis.length }));
const AREA_COLORS = {
    Comercial: 'hsl(210, 89%, 64%)',
    Financeiro: 'hsl(142, 71%, 45%)',
    Produção: 'hsl(48, 96%, 53%)',
    Suporte: 'hsl(262, 83%, 67%)'
};


export default function KpisPage() {
    return (
        <main className="flex-1 bg-background p-4 sm:p-6 md:p-8 space-y-8">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">KPIs e Indicadores</h1>
                    <p className="text-muted-foreground">Monitore os principais indicadores de performance por área.</p>
                </div>
                 <Button size="lg" className="h-12 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Criar Novo KPI
                </Button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map(card => (
                     <Card key={card.title} className="bg-card/50 backdrop-blur-sm border-border/50 shadow-md hover:shadow-primary/20 transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CHART */}
                <div className="lg:col-span-1">
                     <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg h-full sticky top-24">
                        <CardHeader>
                            <CardTitle>Distribuição por Área</CardTitle>
                            <CardDescription>Proporção de KPIs por setor da empresa.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <RechartsBarChart data={areaDistributionData} layout="vertical" margin={{ left: 20 }}>
                                     <XAxis type="number" hide />
                                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={80} />
                                     <RechartsBarChart dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20}>
                                        {areaDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={AREA_COLORS[entry.name as keyof typeof AREA_COLORS] || 'hsl(var(--primary))'} />
                                        ))}
                                     </RechartsBarChart>
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                
                {/* KPI LIST */}
                <div className="lg:col-span-2 space-y-6">
                   {Object.entries(kpisByArea).map(([area, kpis]) => (
                       <div key={area}>
                            <h2 className="text-xl font-semibold mb-4 flex items-center">
                                <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: AREA_COLORS[area as keyof typeof AREA_COLORS] }}></span>
                                {area}
                            </h2>
                            <div className="space-y-4">
                                {kpis.map(kpi => (
                                    <Card key={kpi.name} className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 shadow-md hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300">
                                         <div className="absolute left-0 top-0 h-full w-1.5" style={{ backgroundColor: kpi.color }}></div>
                                        <CardContent className="p-4 pl-6 grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                                            <div className="md:col-span-5">
                                                <p className="font-bold text-lg">{kpi.name}</p>
                                                <p className="text-xs text-muted-foreground">{kpi.indicator}</p>
                                            </div>
                                             <div className="md:col-span-2 text-center">
                                                <Badge variant="secondary">{kpi.unit}</Badge>
                                             </div>
                                            <div className="md:col-span-2 text-center">
                                                <Badge variant="outline">{kpi.metas} Metas</Badge>
                                            </div>
                                            <div className="md:col-span-3 flex items-center justify-end gap-2">
                                                <Button size="sm" variant="ghost" className="transition-colors hover:bg-primary/10 hover:text-primary">Ver Metas</Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 opacity-70 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar KPI</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-500 focus:text-red-500"><Trash className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                       </div>
                   ))}
                </div>
            </div>
        </main>
    );
}
