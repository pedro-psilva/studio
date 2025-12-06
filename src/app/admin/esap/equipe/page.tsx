'use client';
import { useState } from 'react';
import {
  PlusCircle,
  MoreHorizontal,
  ArrowUpRight,
  UserCheck,
  Briefcase,
  TrendingUp,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const equipe = [
  {
    id: 'user1',
    nome: 'Ana Silva',
    cargo: 'Gerente de Vendas',
    area: 'Comercial',
    metas: 3,
    acoes: 2,
    status: 'ativo',
    email: 'ana.silva@itlab.com',
    avatarId: 'avatar-1',
    kpis: { visitas: 12, prospecções: 5, atividades: 32, metasAtingidas: 0.75 },
  },
  {
    id: 'user2',
    nome: 'Beatriz Costa',
    cargo: 'Analista de Marketing',
    area: 'Marketing',
    metas: 2,
    acoes: 5,
    status: 'ativo',
    email: 'beatriz.costa@itlab.com',
    avatarId: 'avatar-1',
    kpis: { visitas: 2, prospecções: 15, atividades: 45, metasAtingidas: 0.5 },
  },
  {
    id: 'user3',
    nome: 'Carlos Lima',
    cargo: 'Coordenador de Produção',
    area: 'Produção',
    metas: 4,
    acoes: 1,
    status: 'ativo',
    email: 'carlos.lima@itlab.com',
    avatarId: 'avatar-1',
    kpis: { visitas: 0, prospecções: 0, atividades: 12, metasAtingidas: 1 },
  },
  {
    id: 'user4',
    nome: 'Daniel Martins',
    cargo: 'Líder de Suporte',
    area: 'Suporte',
    metas: 1,
    acoes: 0,
    status: 'inativo',
    email: 'daniel.martins@itlab.com',
    avatarId: 'avatar-1',
    kpis: { visitas: 0, prospecções: 0, atividades: 55, metasAtingidas: 1 },
  },
];

const totalKpis = equipe.reduce(
    (acc, membro) => {
        if(membro.status === 'ativo') {
            acc.visitas += membro.kpis.visitas;
            acc.prospecções += membro.kpis.prospecções;
            acc.atividades += membro.kpis.atividades;
        }
        return acc;
    },
    { visitas: 0, prospecções: 0, atividades: 0 }
);

const summaryCards = [
    { title: 'Colaboradores Ativos', value: equipe.filter(e => e.status === 'ativo').length, icon: UserCheck, color: "text-blue-500" },
    { title: 'Total de Visitas (Mês)', value: totalKpis.visitas, icon: Briefcase, color: "text-purple-500" },
    { title: 'Total de Prospecções (Mês)', value: totalKpis.prospecções, icon: TrendingUp, color: "text-green-500" },
    { title: 'Total de Atividades (Mês)', value: totalKpis.atividades, icon: BarChart2, color: "text-orange-500" },
];


export default function EquipePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe / Responsáveis</h1>
          <p className="text-muted-foreground">Gerencie os membros da equipe envolvidos no ESAP.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline">Definir Metas Individuais</Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Colaborador
                </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Adicionar Responsável ao ESAP</DialogTitle>
                    <DialogDescription>Selecione um usuário existente e defina seu cargo e área.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="user">Usuário</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Selecione um usuário do sistema" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="id1">joao.silva@email.com</SelectItem>
                                <SelectItem value="id2">maria.oliveira@email.com</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input id="cargo" placeholder="Ex: Gerente de Vendas" />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="area">Área</Label>
                    <Input id="area" placeholder="Ex: Comercial" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                    <Button type="submit" onClick={() => setIsModalOpen(false)}>Salvar</Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>
      
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryCards.map(card => (
                <Card key={card.title} className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-primary/10 transition-shadow duration-300">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {equipe.map((membro) => {
            const avatar = PlaceHolderImages.find(p => p.id === membro.avatarId);
            return (
                 <Card key={membro.id} className="bg-card/50 backdrop-blur-sm border-border/50 shadow-md hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 group">
                    <CardHeader className="flex flex-row items-center gap-4">
                        {avatar && <Image src={avatar.imageUrl} alt={membro.nome} width={56} height={56} className="rounded-full border-2 border-primary/50" />}
                        <div className="flex-1">
                            <CardTitle className="text-lg">{membro.nome}</CardTitle>
                            <CardDescription>{membro.cargo}</CardDescription>
                            <p className="text-xs text-muted-foreground">{membro.email}</p>
                        </div>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Opções</DropdownMenuLabel>
                                <DropdownMenuItem>Ver Perfil do Colaborador</DropdownMenuItem>
                                <DropdownMenuItem>Editar Colaborador</DropdownMenuItem>
                                <DropdownMenuItem>Definir Metas</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Remover do ESAP</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Área</span>
                            <Badge variant="secondary">{membro.area}</Badge>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={membro.status === 'ativo' ? 'default' : 'destructive'} className={membro.status === 'ativo' ? 'bg-green-500/20 text-green-700 border-green-500/30' : ''}>{membro.status}</Badge>
                         </div>
                         <div className="border-t border-border/50 pt-4 grid grid-cols-2 gap-4 text-center">
                             <div>
                                 <p className="text-xs text-muted-foreground">Metas</p>
                                 <p className="font-bold text-lg">{membro.metas}</p>
                             </div>
                              <div>
                                 <p className="text-xs text-muted-foreground">Ações Pendentes</p>
                                 <p className="font-bold text-lg">{membro.acoes}</p>
                             </div>
                         </div>
                    </CardContent>
                </Card>
            )
        })}
      </div>
    </main>
  );
}
