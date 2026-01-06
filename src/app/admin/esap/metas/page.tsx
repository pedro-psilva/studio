
'use client';
import { useState } from 'react';
import { PlusCircle, MoreHorizontal, Calendar as CalendarIcon, Target, CheckCircle, XCircle, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, Legend } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const initialMetas = [
    { id: 'm1', kpi: 'Faturamento Mensal', meta_nome: 'Aumentar faturamento em 20%', valor_meta: 50000, valor_atual: 42000, periodo: 'Mensal', responsavel: 'Ana (Comercial)', status: 'em andamento' },
    { id: 'm2', kpi: 'Tempo Médio de Produção', meta_nome: 'Reduzir para 4 dias', valor_meta: 4, valor_atual: 4, periodo: 'Trimestral', responsavel: 'Carlos (Produção)', status: 'concluído' },
    { id: 'm3', kpi: 'Taxa de Conversão', meta_nome: 'Atingir 5% de conversão', valor_meta: 5, valor_atual: 3.8, periodo: 'Mensal', responsavel: 'Beatriz (Marketing)', status: 'atrasado' },
    { id: 'm4', kpi: 'CSAT', meta_nome: 'Manter CSAT acima de 4.8', valor_meta: 4.8, valor_atual: 0, periodo: 'Anual', responsavel: 'Daniel (Suporte)', status: 'não iniciado' },
];

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'em andamento': return { variant: 'default', color: 'bg-blue-500', text: 'Em Andamento' };
        case 'concluído': return { variant: 'secondary', color: 'bg-green-500', text: 'Concluído' };
        case 'atrasado': return { variant: 'destructive', color: 'bg-red-500', text: 'Atrasado' };
        case 'não iniciado': return { variant: 'outline', color: 'bg-gray-500', text: 'Não Iniciado' };
        default: return { variant: 'outline', color: 'bg-gray-500', text: 'N/A' };
    }
};

const metaVsRealData = [
    { name: 'Faturamento', meta: 50000, real: 42000 },
    { name: 'Prod. Time', meta: 4, real: 4.5 },
    { name: 'Conversão', meta: 5, real: 3.8 },
    { name: 'CSAT', meta: 4.8, real: 4.9 },
]

export default function MetasPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [date, setDate] = useState<Date>();
    const [metas, setMetas] = useState(initialMetas);
    const [newMeta, setNewMeta] = useState({ kpi: '', meta_nome: '', valor_meta: '', periodo: '', responsavel: '' });
    const { toast } = useToast();
    const router = useRouter();


    const handleCreateMeta = () => {
        if (isSaving) return;

        const { kpi, meta_nome, valor_meta, periodo, responsavel } = newMeta;
        if (!kpi || !meta_nome || !valor_meta || !periodo || !responsavel) {
            toast({
                title: "Campos obrigatórios",
                description: "Por favor, preencha todos os campos para criar a meta.",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);

        const newEntry = {
            id: `m${metas.length + 1}`,
            kpi,
            meta_nome,
            valor_meta: parseFloat(valor_meta),
            valor_atual: 0,
            periodo,
            responsavel,
            status: 'não iniciado'
        };

        setMetas([newEntry, ...metas]);
        setIsModalOpen(false);
        setNewMeta({ kpi: '', meta_nome: '', valor_meta: '', periodo: '', responsavel: '' }); // Reset form

        toast({
            title: "Meta criada com sucesso!",
            description: `A meta "${meta_nome}" foi adicionada.`,
        });
        setIsSaving(false);
    };

    return (
        <main className="flex-1 bg-background p-4 sm:p-6 md:p-8 space-y-8">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Metas</h1>
                    <p className="text-muted-foreground">Crie, acompanhe e gerencie as metas da sua equipe.</p>
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="h-12 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Criar Nova Meta
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader><DialogTitle className="text-xl">Criar Nova Meta</DialogTitle><DialogDescription>Defina uma nova meta e atribua um responsável para impulsionar os resultados.</DialogDescription></DialogHeader>
                        <div className="grid gap-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label htmlFor="kpi">Vincular a um KPI</Label><Select onValueChange={(v) => setNewMeta(p => ({ ...p, kpi: v }))}><SelectTrigger><SelectValue placeholder="Selecione um KPI existente" /></SelectTrigger><SelectContent><SelectItem value="Taxa de Conversão">Taxa de Conversão</SelectItem><SelectItem value="Faturamento Mensal">Faturamento Mensal</SelectItem></SelectContent></Select></div>
                                <div className="space-y-2"><Label htmlFor="meta_nome">Nome da Meta</Label><Input id="meta_nome" placeholder="Ex: Aumentar faturamento em 20%" value={newMeta.meta_nome} onChange={(e) => setNewMeta(p => ({ ...p, meta_nome: e.target.value }))} /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label htmlFor="valor_meta">Valor da Meta</Label><Input id="valor_meta" type="number" placeholder="Ex: 50000" value={newMeta.valor_meta} onChange={(e) => setNewMeta(p => ({ ...p, valor_meta: e.target.value }))} /></div>
                                <div className="space-y-2"><Label htmlFor="periodo">Período</Label><Select onValueChange={(v) => setNewMeta(p => ({ ...p, periodo: v }))}><SelectTrigger><SelectValue placeholder="Selecione o período" /></SelectTrigger><SelectContent><SelectItem value="mensal">Mensal</SelectItem><SelectItem value="trimestral">Trimestral</SelectItem><SelectItem value="anual">Anual</SelectItem></SelectContent></Select></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label htmlFor="data_inicio">Data de Início</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "PPP") : <span>Escolha uma data</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent></Popover></div>
                                <div className="space-y-2"><Label htmlFor="data_fim">Data de Fim</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(addDays(date || new Date(), 30), "PPP") : <span>Escolha uma data</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent></Popover></div>
                            </div>
                            <div className="space-y-2"><Label htmlFor="responsavel">Responsável</Label><Select onValueChange={(v) => setNewMeta(p => ({ ...p, responsavel: v }))}><SelectTrigger><SelectValue placeholder="Atribuir a um responsável" /></SelectTrigger><SelectContent><SelectItem value="Ana (Comercial)">Ana (Comercial)</SelectItem><SelectItem value="Carlos (Produção)">Carlos (Produção)</SelectItem></SelectContent></Select></div>
                        </div>
                        <DialogFooter><Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button type="submit" onClick={handleCreateMeta} disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar Meta'}</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* PERFORMANCE BLOCKS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Metas Ativas</CardTitle><Target className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metas.filter(m => m.status === 'em andamento').length}</div></CardContent></Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Concluídas</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{metas.filter(m => m.status === 'concluído').length}</div></CardContent></Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Atrasadas</CardTitle><XCircle className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{metas.filter(m => m.status === 'atrasado').length}</div></CardContent></Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Não Iniciadas</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metas.filter(m => m.status === 'não iniciado').length}</div></CardContent></Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Cresc. Médio</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">+5.2%</div></CardContent></Card>
            </div>

            {/* MAIN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {metas.map((meta) => {
                        const statusInfo = getStatusStyles(meta.status);
                        const progress = meta.valor_meta > 0 ? (meta.valor_atual / meta.valor_meta) * 100 : 0;
                        return (
                            <Card key={meta.id} className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 shadow-md hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 group">
                                <div className={`absolute left-0 top-0 h-full w-1.5 ${statusInfo.color}`}></div>
                                <CardContent className="p-4 pl-6 grid grid-cols-1 md:grid-cols-5 items-center gap-4">
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-muted-foreground">{meta.kpi}</p>
                                        <p className="font-bold text-lg">{meta.meta_nome}</p>
                                    </div>
                                    <div className="text-sm">
                                        <p className="text-muted-foreground">Progresso</p>
                                        <p className="font-semibold">{meta.valor_atual.toLocaleString('pt-BR')} / {meta.valor_meta.toLocaleString('pt-BR')}</p>
                                    </div>
                                    <div>
                                        <Progress value={progress} className="h-2" />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>{Math.round(progress)}%</span>
                                            <span>{meta.periodo}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                        <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => router.push(`/admin/esap/acompanhamento?metaId=${meta.id}`)}>Ver Detalhes</DropdownMenuItem>
                                                <DropdownMenuItem>Editar Meta</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
                {/* CHART */}
                <div className="lg:col-span-1">
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg h-full sticky top-24">
                        <CardHeader>
                            <CardTitle>Performance de Metas (Meta vs. Real)</CardTitle>
                            <CardDescription>Comparativo do valor alvo e o valor alcançado.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={metaVsRealData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} />
                                    <Tooltip cursor={{ fill: 'hsla(var(--accent))' }} contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                                    <Bar dataKey="meta" name="Meta" fill="hsla(var(--primary), 0.5)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="real" name="Real" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
