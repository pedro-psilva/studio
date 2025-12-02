'use client';
import { useState } from 'react';
import { PlusCircle, MoreHorizontal, BarChart, FileText, Target, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar, LineChart, Line } from 'recharts';

const kpisData = {
    "Comercial": [
        { id: 'kpi1', nome_kpi: 'Taxa de Conversão de Vendas', indicador: 'Vendas / Visitantes', unidade_medida: '%', status: 'ok', metas: 5 },
    ],
    "Financeiro": [
        { id: 'kpi2', nome_kpi: 'Faturamento Mensal', indicador: 'Soma de todas as vendas', unidade_medida: 'R$', status: 'ok', metas: 3 },
        { id: 'kpi5', nome_kpi: 'Custo por Aquisição (CAC)', indicador: 'Investimento / Novos Clientes', unidade_medida: 'R$', status: 'critico', metas: 4 },
    ],
    "Produção": [
        { id: 'kpi3', nome_kpi: 'Tempo Médio de Produção', indicador: 'Data de Envio - Data de Entrada', unidade_medida: 'Dias', status: 'alerta', metas: 2 },
    ],
    "Suporte": [
        { id: 'kpi4', nome_kpi: 'Satisfação do Cliente (CSAT)', indicador: 'Nota média de avaliação', unidade_medida: '0-5', status: 'ok', metas: 1 },
    ],
};

const kpiByAreaData = [
    { area: 'Comercial', count: 1 },
    { area: 'Financeiro', count: 2 },
    { area: 'Produção', count: 1 },
    { area: 'Suporte', count: 1 },
];

const getAreaStyles = (area: string) => {
    switch (area) {
        case 'Comercial': return { border: 'border-blue-500/80', text: 'text-blue-400', bg: 'bg-blue-500' };
        case 'Financeiro': return { border: 'border-green-500/80', text: 'text-green-400', bg: 'bg-green-500' };
        case 'Produção': return { border: 'border-yellow-500/80', text: 'text-yellow-400', bg: 'bg-yellow-500' };
        case 'Suporte': return { border: 'border-purple-500/80', text: 'text-purple-400', bg: 'bg-purple-500' };
        case 'Marketing': return { border: 'border-pink-500/80', text: 'text-pink-400', bg: 'bg-pink-500' };
        default: return { border: 'border-gray-500/50', text: 'text-gray-400', bg: 'bg-gray-500' };
    }
}

export default function KpisPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="flex-1 bg-background p-4 sm:p-6 md:p-8 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KPIs e Indicadores</h1>
          <p className="text-muted-foreground">Monitore os principais indicadores de performance por área.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="h-12 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Criar Novo KPI
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Criar Novo KPI</DialogTitle>
                <DialogDescription>Preencha os campos abaixo para adicionar um novo indicador de performance.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="nome_kpi">Nome do KPI</Label>
                  <Input id="nome_kpi" placeholder="Ex: Taxa de Conversão" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea id="descricao" placeholder="Descreva o que este KPI mede" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="area">Área Responsável</Label>
                        <Input id="area" placeholder="Ex: Comercial" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="unidade_medida">Unidade de Medida</Label>
                        <Input id="unidade_medida" placeholder="Ex: %, R$, Dias" />
                    </div>
                 </div>
                <div className="space-y-2">
                  <Label htmlFor="indicador">Fórmula / Indicador</Label>
                  <Input id="indicador" placeholder="Ex: Vendas / Visitantes" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" onClick={() => setIsModalOpen(false)}>Salvar KPI</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de KPIs</CardTitle><Target className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-3xl font-bold">5</div><p className="text-xs text-muted-foreground">+2 este mês</p></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Áreas Cobertas</CardTitle><FileText className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-3xl font-bold">4</div><p className="text-xs text-muted-foreground">Comercial, Prod, etc.</p></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">KPIs com Metas</CardTitle><BarChart className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-3xl font-bold">15</div><p className="text-xs text-muted-foreground">52% do total</p></CardContent></Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">KPIs Sem Metas</CardTitle><AlertTriangle className="h-5 w-5 text-yellow-500" /></CardHeader><CardContent><div className="text-3xl font-bold">4</div><p className="text-xs text-muted-foreground">Precisam de atenção</p></CardContent></Card>
      </div>
      
      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
             {Object.entries(kpisData).map(([area, kpis]) => {
                const areaStyle = getAreaStyles(area);
                return (
                <div key={area}>
                    <h2 className={`text-xl font-bold mb-4 pb-2 border-b-2 ${areaStyle.border} ${areaStyle.text}`}>{area}</h2>
                    <div className="space-y-4">
                        {kpis.map((kpi) => (
                            <Card key={kpi.id} className="bg-card/50 backdrop-blur-sm border-border/50 shadow-md hover:shadow-primary/20 transition-all duration-300 relative overflow-hidden group">
                                <div className={`absolute left-0 top-0 h-full w-1.5 ${areaStyle.bg}`}></div>
                                <CardContent className="p-4 pl-6 flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div>
                                        <p className="font-bold text-base">{kpi.nome_kpi}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                            <span><span className="font-semibold">Indicador:</span> {kpi.indicador}</span>
                                            <Badge variant="outline">{kpi.unidade_medida}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-28 h-10 group-hover:scale-105 transition-transform duration-300">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={[{v:1},{v:3},{v:2},{v:5},{v:4}]} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                            <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <Badge variant="secondary" className="h-8">{kpi.metas} Metas ativas</Badge>
                                    <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary">Ver Metas</Button>
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                        <DropdownMenuItem>Editar</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
             )})}
        </div>
        
        <div className="lg:col-span-1">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg h-full sticky top-24">
                <CardHeader>
                    <CardTitle>Distribuição de KPIs por Área</CardTitle>
                    <CardDescription>Visualização da quantidade de indicadores por setor.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={kpiByAreaData} layout="vertical" margin={{ left: 10, right: 20 }}>
                           <XAxis type="number" hide />
                           <YAxis dataKey="area" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={80} />
                           <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={{ background: 'hsl(var(--background))' }} />
                           <Bar dataKey="count" name="KPIs" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
