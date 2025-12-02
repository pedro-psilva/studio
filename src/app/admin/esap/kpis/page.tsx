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


const kpis = [
  { id: 'kpi1', nome_kpi: 'Taxa de Conversão de Vendas', area: 'Comercial', indicador: 'Vendas / Visitantes', unidade_medida: '%', status: 'ok', metas: 5 },
  { id: 'kpi2', nome_kpi: 'Faturamento Mensal', area: 'Financeiro', indicador: 'Soma de todas as vendas', unidade_medida: 'R$', status: 'ok', metas: 3 },
  { id: 'kpi3', nome_kpi: 'Tempo Médio de Produção', area: 'Produção', indicador: 'Data de Envio - Data de Entrada', unidade_medida: 'Dias', status: 'alerta', metas: 2 },
  { id: 'kpi4', nome_kpi: 'Satisfação do Cliente (CSAT)', area: 'Suporte', indicador: 'Nota média de avaliação', unidade_medida: '0-5', status: 'ok', metas: 1 },
  { id: 'kpi5', nome_kpi: 'Custo por Aquisição (CAC)', area: 'Marketing', indicador: 'Investimento / Novos Clientes', unidade_medida: 'R$', status: 'critico', metas: 4 },
];

const kpiByAreaData = [
    { area: 'Comercial', count: 10 },
    { area: 'Financeiro', count: 5 },
    { area: 'Produção', count: 8 },
    { area: 'Marketing', count: 12 },
    { area: 'Suporte', count: 4 },
];

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'ok': return 'border-green-500/50 text-green-400';
        case 'alerta': return 'border-yellow-500/50 text-yellow-400';
        case 'critico': return 'border-red-500/50 text-red-400';
        default: return 'border-gray-500/50 text-gray-400';
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
          <p className="text-muted-foreground">Gerencie os indicadores chave de performance da sua empresa.</p>
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
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">KPIs Ativos</CardTitle>
                <Target className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">29</div>
                <p className="text-xs text-muted-foreground">+2 este mês</p>
            </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Áreas Cobertas</CardTitle>
                <FileText className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Comercial, MKT, Prod, etc.</p>
            </CardContent>
        </Card>
         <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">KPIs com Metas</CardTitle>
                <BarChart className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">52% do total de KPIs</p>
            </CardContent>
        </Card>
         <Card className="bg-destructive/10 border-destructive/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-destructive">KPIs Críticos</CardTitle>
                <AlertTriangle className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-destructive">1</div>
                <p className="text-xs text-muted-foreground">Custo por Aquisição (CAC)</p>
            </CardContent>
        </Card>
      </div>
      
      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KPI LIST */}
        <div className="lg:col-span-2 space-y-4">
             {kpis.map((kpi) => (
                <Card key={kpi.id} className="bg-card/50 backdrop-blur-sm border-border/50 shadow-md hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-4 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                            <div className={`w-1.5 h-16 rounded-full ${getStatusStyles(kpi.status).replace('border-','bg-')}`}></div>
                            <div>
                                <p className="font-semibold text-base">{kpi.nome_kpi}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                    <span>Área: <Badge variant="secondary">{kpi.area}</Badge></span>
                                    <span>Unidade: <Badge variant="outline">{kpi.unidade_medida}</Badge></span>
                                </div>
                            </div>
                       </div>
                       <div className="flex items-center gap-4">
                         <div className="text-right">
                             <p className="text-sm font-semibold">{kpi.metas} Metas</p>
                             <p className="text-xs text-muted-foreground">vinculadas</p>
                         </div>
                         <div className="w-28 h-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[{v:1},{v:3},{v:2},{v:5},{v:4}]}>
                                <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <Button variant="outline" size="sm">Ver Metas</Button>
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
        {/* CHART */}
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
                           <Bar dataKey="count" name="KPIs" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </div>

    </main>
  );
}
