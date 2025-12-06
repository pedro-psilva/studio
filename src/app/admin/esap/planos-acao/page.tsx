'use client';
import { useState } from 'react';
import { PlusCircle, MoreHorizontal, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


const initialAcoes = [
  { id: 'a1', meta: 'Aumentar faturamento em 20%', acao_nome: 'Campanha de E-mail Marketing', responsavel: 'Beatriz (Marketing)', progresso: 75, prazo: '2024-08-15', status: 'Em Andamento' },
  { id: 'a2', meta: 'Reduzir para 4 dias', acao_nome: 'Otimizar fluxo de CAD/CAM', responsavel: 'Carlos (Produção)', progresso: 100, prazo: '2024-07-30', status: 'Concluído' },
  { id: 'a3', meta: 'Aumentar faturamento em 20%', acao_nome: 'Programa de indicação para clientes', responsavel: 'Ana (Comercial)', progresso: 20, prazo: '2024-09-01', status: 'Não Iniciado' },
  { id: 'a4', meta: 'Atingir 5% de conversão', acao_nome: 'Ajustar lances no Google Ads', responsavel: 'Beatriz (Marketing)', progresso: 50, prazo: '2024-07-25', status: 'Atrasado' },
];

export default function PlanosAcaoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [acoes, setAcoes] = useState(initialAcoes);
  const [newAction, setNewAction] = useState({ meta: '', acao_nome: '', descricao: '', responsavel: ''});
  const { toast } = useToast();

  const handleCreateAction = () => {
      const { meta, acao_nome, responsavel } = newAction;
      if(!meta || !acao_nome || !responsavel || !date) {
           toast({
              title: "Campos obrigatórios",
              description: "Por favor, preencha todos os campos para criar a ação.",
              variant: "destructive",
          });
          return;
      }
      
      const newEntry = {
          id: `a${acoes.length + 1}`,
          meta,
          acao_nome,
          responsavel,
          progresso: 0,
          prazo: format(date, 'yyyy-MM-dd'),
          status: 'Não Iniciado'
      };

      setAcoes([newEntry, ...acoes]);
      setIsModalOpen(false);
      setNewAction({ meta: '', acao_nome: '', descricao: '', responsavel: '' }); // Reset form
      setDate(undefined);

       toast({
          title: "Ação criada com sucesso!",
          description: `A ação "${acao_nome}" foi adicionada.`,
      });
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planos de Ação</h1>
          <p className="text-muted-foreground">Defina e acompanhe as ações para alcançar as metas.</p>
        </div>
        <div className="ml-auto">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Ação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Nova Ação</DialogTitle>
                <DialogDescription>Preencha os campos para adicionar uma nova ação a uma meta.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="meta">Selecionar Meta</Label>
                    <Select onValueChange={(v) => setNewAction(p => ({...p, meta: v}))}>
                        <SelectTrigger><SelectValue placeholder="Vincule a uma meta existente" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Aumentar faturamento em 20%">Aumentar faturamento em 20%</SelectItem>
                            <SelectItem value="Reduzir para 4 dias">Reduzir para 4 dias</SelectItem>
                             <SelectItem value="Atingir 5% de conversão">Atingir 5% de conversão</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="acao_nome">Nome da Ação</Label>
                    <Input id="acao_nome" placeholder="Ex: Criar campanha de e-mail marketing" value={newAction.acao_nome} onChange={(e) => setNewAction(p => ({...p, acao_nome: e.target.value}))}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea id="descricao" placeholder="Detalhes sobre a ação a ser executada" value={newAction.descricao} onChange={(e) => setNewAction(p => ({...p, descricao: e.target.value}))}/>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="responsavel">Responsável</Label>
                        <Select onValueChange={(v) => setNewAction(p => ({...p, responsavel: v}))}>
                            <SelectTrigger><SelectValue placeholder="Atribuir a um responsável" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Ana (Comercial)">Ana (Comercial)</SelectItem>
                                <SelectItem value="Beatriz (Marketing)">Beatriz (Marketing)</SelectItem>
                                <SelectItem value="Carlos (Produção)">Carlos (Produção)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="prazo">Prazo</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Escolha um prazo</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" onClick={handleCreateAction}>Salvar Ação</Button>
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
                <TableHead className="w-[30%]">Ação</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Opções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acoes.map((acao) => (
                <TableRow key={acao.id}>
                  <TableCell className="font-medium">
                    <div className="font-bold">{acao.acao_nome}</div>
                    <div className="text-xs text-muted-foreground">Meta: {acao.meta}</div>
                  </TableCell>
                  <TableCell>{acao.responsavel}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Progress value={acao.progresso} className="w-[60%]" />
                        <span className="text-sm text-muted-foreground">{acao.progresso}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(acao.prazo), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                          acao.status === 'Atrasado' ? 'destructive' :
                          acao.status === 'Concluído' ? 'secondary' :
                          'default'
                      }
                      className={
                          acao.status === 'Concluído' ? 'bg-green-500/20 text-green-700 border-green-500/30' : ''
                      }
                    >
                      {acao.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Opções</DropdownMenuLabel>
                        <DropdownMenuItem>Editar Progresso</DropdownMenuItem>
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
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
