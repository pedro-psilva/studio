'use client';
import { useState } from 'react';
import {
  PlusCircle,
  TrendingUp,
  Target,
  CheckCircle,
  Activity,
  Calendar,
  User,
  Briefcase,
  ExternalLink,
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
import { Progress } from '@/components/ui/progress';
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

const colaborador = {
  id: 'user1',
  nome: 'Ana Silva',
  cargo: 'Gerente de Vendas',
  area: 'Comercial',
  avatarId: 'avatar-1',
};

const kpisData = [
  { title: 'Visitas Registradas', value: 12, target: 20, icon: Briefcase },
  { title: 'Prospecções', value: 5, target: 10, icon: User },
  { title: 'Atividades Totais', value: 32, target: 50, icon: Activity },
  { title: '% Metas Atingidas', value: 75, target: 100, icon: CheckCircle },
];

const minhasMetas = [
  { id: 'm1', nome: 'Aumentar prospecções em 20%', progresso: 50, status: 'em andamento' },
  { id: 'm2', nome: 'Fechar 5 novos contratos', progresso: 40, status: 'em andamento' },
  { id: 'm3', nome: 'Realizar 20 visitas a clientes', progresso: 60, status: 'atrasado' },
];

const minhasAtividades = [
  { id: 'a1', tipo: 'Visita', cliente: 'Clínica Sorriso Aberto', data: '2024-07-28' },
  { id: 'a2', tipo: 'Prospecção', cliente: 'OdontoPrime', data: '2024-07-27' },
  { id: 'a3', tipo: 'Follow-up', cliente: 'Dr. João Pereira', data: '2024-07-26' },
  { id: 'a4', tipo: 'Reunião', cliente: 'Clínica Dente Feliz', data: '2024-07-25' },
];

const weeklyEvolutionData = [
  { week: 'Semana 1', visitas: 2, prospecções: 1 },
  { week: 'Semana 2', visitas: 4, prospecções: 2 },
  { week: 'Semana 3', visitas: 3, prospecções: 1 },
  { week: 'Semana 4', visitas: 3, prospecções: 1 },
];

export default function PainelColaboradorPage() {
  const avatar = PlaceHolderImages.find((p) => p.id === colaborador.avatarId);

  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 bg-background">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {avatar && (
            <Image
              src={avatar.imageUrl}
              alt={colaborador.nome}
              width={64}
              height={64}
              className="rounded-full border-2 border-primary"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meu Painel</h1>
            <p className="text-muted-foreground">
              Bem-vinda, {colaborador.nome}! Acompanhe seu desempenho.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline"><Calendar className="mr-2 h-4 w-4"/> Ver Agenda</Button>
            <Button asChild>
                <Link href="/admin/esap/registrar-atividade">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Registrar Atividade
                </Link>
            </Button>
        </div>
      </div>

       {/* KPIS */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpisData.map(kpi => (
                <Card key={kpi.title} className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-primary/10 transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                        <kpi.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{kpi.title.startsWith('%') ? `${kpi.value}%` : kpi.value}</div>
                        <p className="text-xs text-muted-foreground">Meta: {kpi.target}</p>
                        <Progress value={(kpi.value / kpi.target) * 100} className="h-2 mt-2" />
                    </CardContent>
                </Card>
            ))}
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* MINHAS METAS */}
            <div className="lg:col-span-2">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg h-full">
                    <CardHeader>
                        <CardTitle>Minhas Metas</CardTitle>
                        <CardDescription>Acompanhe o progresso das suas metas individuais.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         {minhasMetas.map(meta => (
                             <div key={meta.id}>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-semibold">{meta.nome}</p>
                                    <span className="text-sm font-bold">{meta.progresso}%</span>
                                </div>
                                <Progress value={meta.progresso} />
                                <div className="flex justify-between items-center mt-1">
                                    <Badge variant={meta.status === 'atrasado' ? 'destructive' : meta.status === 'concluído' ? 'default' : 'secondary'}>
                                        {meta.status}
                                    </Badge>
                                </div>
                             </div>
                         ))}
                    </CardContent>
                </Card>
            </div>
            
            {/* MINHAS ATIVIDADES */}
            <div>
                 <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg h-full">
                    <CardHeader>
                        <CardTitle>Minhas Atividades Recentes</CardTitle>
                        <CardDescription>Últimas atividades que você registrou.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow><TableHead>Tipo</TableHead><TableHead>Cliente</TableHead><TableHead>Data</TableHead></TableRow>
                            </TableHeader>
                            <TableBody>
                                {minhasAtividades.map(ativ => (
                                    <TableRow key={ativ.id}>
                                        <TableCell><Badge variant="outline">{ativ.tipo}</Badge></TableCell>
                                        <TableCell>{ativ.cliente}</TableCell>
                                        <TableCell>{new Date(ativ.data).toLocaleDateString('pt-BR')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <Button variant="link" className="w-full mt-2">Ver todas as atividades <ExternalLink className="ml-2 h-4 w-4"/></Button>
                    </CardContent>
                </Card>
            </div>
      </div>
      
       {/* GRÁFICO */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
                <CardTitle>Evolução Semanal</CardTitle>
                <CardDescription>Comparativo de visitas e prospecções nas últimas 4 semanas.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                     <LineChart data={weeklyEvolutionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                        <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Line type="monotone" dataKey="visitas" name="Visitas" stroke="hsl(var(--primary))" strokeWidth={2} />
                        <Line type="monotone" dataKey="prospecções" name="Prospecções" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

    </main>
  );
}
