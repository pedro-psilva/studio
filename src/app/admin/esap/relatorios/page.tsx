'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { File, TrendingUp, CheckCircle, XCircle, Activity } from "lucide-react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, LineChart, Line, CartesianGrid } from 'recharts';

const goalsVsResultsData = [
    { name: 'Marketing', meta: 4000, resultado: 2400 },
    { name: 'Comercial', meta: 3000, resultado: 1398 },
    { name: 'Produção', meta: 5000, resultado: 4800 },
    { name: 'Financeiro', meta: 2780, resultado: 3908 },
];

const progressOverTimeData = [
    { date: 'Jul 1', progress: 25 },
    { date: 'Jul 8', progress: 45 },
    { date: 'Jul 15', progress: 55 },
    { date: 'Jul 22', progress: 70 },
    { date: 'Jul 29', progress: 85 },
];

const detailedReportData = [
  { id: 'm1', meta: 'Aumentar faturamento em 20%', area: 'Comercial', responsavel: 'Ana Silva', progresso: 84, status: 'em andamento' },
  { id: 'm2', meta: 'Reduzir para 4 dias', area: 'Produção', responsavel: 'Carlos Lima', progresso: 100, status: 'concluído' },
  { id: 'm3', meta: 'Atingir 5% de conversão', area: 'Marketing', responsavel: 'Beatriz Costa', progresso: 76, status: 'atrasado' },
  { id: 'm4', meta: 'Manter CSAT acima de 4.8', area: 'Suporte', responsavel: 'Daniel Martins', progresso: 0, status: 'não iniciado' },
];

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'em andamento': return { variant: 'default', text: 'Em Andamento' };
        case 'concluído': return { variant: 'secondary', color: 'bg-green-500', text: 'Concluído' };
        case 'atrasado': return { variant: 'destructive', text: 'Atrasado' };
        case 'não iniciado': return { variant: 'outline', text: 'Não Iniciado' };
        default: return { variant: 'outline', text: 'N/A' };
    }
};

export default function RelatoriosEsapPage() {
    const [period, setPeriod] = useState('30d');

    return (
        <main className="flex flex-1 flex-col gap-8 p-4 md:gap-8 md:p-8 bg-background">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Relatórios ESAP</h1>
                    <p className="text-muted-foreground">Exporte e visualize relatórios consolidados de performance.</p>
                </div>
                <div className="flex items-center gap-2">
                     <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Últimos 7 dias</SelectItem>
                            <SelectItem value="30d">Últimos 30 dias</SelectItem>
                            <SelectItem value="90d">Últimos 3 meses</SelectItem>
                            <SelectItem value="12m">Último ano</SelectItem>
                        </SelectContent>
                    </Select>
                     <Button>
                        <File className="mr-2 h-4 w-4" />
                        Exportar Relatório PDF
                    </Button>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Progresso Médio</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">78%</div><p className="text-xs text-muted-foreground">+5% vs. período anterior</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Metas Concluídas</CardTitle><CheckCircle className="h-4 w-4 text-green-500"/></CardHeader><CardContent><div className="text-2xl font-bold">8/12</div><p className="text-xs text-muted-foreground">Total de metas finalizadas</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Metas em Andamento</CardTitle><Activity className="h-4 w-4 text-blue-500"/></CardHeader><CardContent><div className="text-2xl font-bold">3</div><p className="text-xs text-muted-foreground">Metas ativas no período</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Metas Atrasadas</CardTitle><XCircle className="h-4 w-4 text-red-500"/></CardHeader><CardContent><div className="text-2xl font-bold">1</div><p className="text-xs text-muted-foreground">Ações necessárias</p></CardContent></Card>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader><CardTitle>Metas vs. Resultados por Área</CardTitle><CardDescription>Comparativo do planejado versus o alcançado no período.</CardDescription></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={goalsVsResultsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                <Legend wrapperStyle={{fontSize: "12px"}}/>
                                <Bar dataKey="meta" fill="#24C39E" name="Meta" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="resultado" fill="hsl(var(--primary))" name="Resultado" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader><CardTitle>Progresso Geral das Metas</CardTitle><CardDescription>Evolução do percentual médio de conclusão das metas.</CardDescription></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={progressOverTimeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`}/>
                                <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value: number) => [`${value.toFixed(1)}%`, 'Progresso']}/>
                                <Legend wrapperStyle={{fontSize: "12px"}}/>
                                <Line type="monotone" dataKey="progress" name="Progresso (%)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            
            {/* DETAILED TABLE */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle>Relatório Detalhado de Metas</CardTitle>
                    <CardDescription>Visão completa de todas as metas registradas no período selecionado.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Nome da Meta</TableHead>
                                <TableHead>Área</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>Progresso</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {detailedReportData.map((row) => {
                                const statusInfo = getStatusStyles(row.status);
                                return (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">{row.meta}</TableCell>
                                        <TableCell>{row.area}</TableCell>
                                        <TableCell>{row.responsavel}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={row.progresso} className="w-24 h-2" />
                                                <span className="text-muted-foreground text-xs">{row.progresso}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusInfo.variant as any}>{statusInfo.text}</Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
