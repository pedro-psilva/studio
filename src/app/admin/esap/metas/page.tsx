'use client';
import { useState } from 'react';
import { PlusCircle, MoreHorizontal, Calendar as CalendarIcon } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const metas = [
  { id: 'm1', kpi: 'Faturamento Mensal', meta_nome: 'Aumentar faturamento em 20%', valor_meta: 50000, periodo: 'Mensal', responsavel: 'Ana (Comercial)', status: 'em andamento' },
  { id: 'm2', kpi: 'Tempo Médio de Produção', meta_nome: 'Reduzir para 4 dias', valor_meta: 4, periodo: 'Trimestral', responsavel: 'Carlos (Produção)', status: 'concluído' },
  { id: 'm3', kpi: 'Taxa de Conversão', meta_nome: 'Atingir 5% de conversão', valor_meta: 5, periodo: 'Mensal', responsavel: 'Beatriz (Marketing)', status: 'atrasado' },
  { id: 'm4', kpi: 'CSAT', meta_nome: 'Manter CSAT acima de 4.8', valor_meta: 4.8, periodo: 'Anual', responsavel: 'Daniel (Suporte)', status: 'não iniciado' },
];

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'em andamento': return 'default';
        case 'concluído': return 'secondary';
        case 'atrasado': return 'destructive';
        case 'não iniciado': return 'outline';
        default: return 'outline';
    }
};

export default function MetasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState<Date>();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas</h1>
          <p className="text-muted-foreground">Crie e gerencie as metas da sua equipe.</p>
        </div>
        <div className="ml-auto">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Meta</DialogTitle>
                <DialogDescription>
                  Defina uma nova meta e atribua um responsável.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="kpi">Selecionar KPI</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Selecione um KPI" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="kpi1">Taxa de Conversão</SelectItem>
                                <SelectItem value="kpi2">Faturamento Mensal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="meta_nome">Nome da Meta</Label>
                        <Input id="meta_nome" placeholder="Ex: Aumentar faturamento em 20%" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="valor_meta">Valor da Meta</Label>
                        <Input id="valor_meta" type="number" placeholder="Ex: 50000" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="periodo">Período</Label>
                         <Select>
                            <SelectTrigger><SelectValue placeholder="Selecione o período" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semanal">Semanal</SelectItem>
                                <SelectItem value="mensal">Mensal</SelectItem>
                                <SelectItem value="trimestral">Trimestral</SelectItem>
                                <SelectItem value="anual">Anual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="data_inicio">Data de Início</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Escolha uma data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="data_fim">Data de Fim</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Escolha uma data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Atribuir a um responsável" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user1">Ana (Comercial)</SelectItem>
                            <SelectItem value="user2">Carlos (Produção)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" onClick={() => setIsModalOpen(false)}>Salvar Meta</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KPI</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metas.map((meta) => (
                <TableRow key={meta.id}>
                  <TableCell className="font-semibold">{meta.kpi}</TableCell>
                  <TableCell>{meta.meta_nome}</TableCell>
                  <TableCell>{meta.valor_meta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                  <TableCell>{meta.periodo}</TableCell>
                  <TableCell>{meta.responsavel}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(meta.status)}>{meta.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
