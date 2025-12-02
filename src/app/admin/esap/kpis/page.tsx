'use client';
import { useState } from 'react';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

const kpis = [
  { id: 'kpi1', nome_kpi: 'Taxa de Conversão', area: 'Comercial', indicador: 'Vendas / Visitantes', unidade_medida: '%' },
  { id: 'kpi2', nome_kpi: 'Faturamento Mensal', area: 'Financeiro', indicador: 'Soma de todas as vendas', unidade_medida: 'R$' },
  { id: 'kpi3', nome_kpi: 'Tempo Médio de Produção', area: 'Produção', indicador: 'Data de Envio - Data de Entrada', unidade_medida: 'Dias' },
  { id: 'kpi4', nome_kpi: 'Satisfação do Cliente (CSAT)', area: 'Suporte', indicador: 'Nota média de avaliação', unidade_medida: '0-5' },
];

export default function KpisPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KPIs e Indicadores</h1>
          <p className="text-muted-foreground">Gerencie os indicadores chave de performance da sua empresa.</p>
        </div>
        <div className="ml-auto">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar KPI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo KPI</DialogTitle>
                <DialogDescription>
                  Preencha os campos abaixo para adicionar um novo indicador.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nome_kpi" className="text-right">
                    Nome do KPI
                  </Label>
                  <Input id="nome_kpi" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="descricao" className="text-right">
                    Descrição
                  </Label>
                  <Textarea id="descricao" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="area" className="text-right">
                    Área
                  </Label>
                  <Input id="area" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="indicador" className="text-right">
                    Indicador
                  </Label>
                  <Input id="indicador" placeholder="Ex: Vendas / Visitantes" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unidade_medida" className="text-right">
                    Unidade
                  </Label>
                  <Input id="unidade_medida" placeholder="Ex: %, R$, Dias" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" onClick={() => setIsModalOpen(false)}>Salvar KPI</Button>
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
                <TableHead>Nome do KPI</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Indicador</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpis.map((kpi) => (
                <TableRow key={kpi.id}>
                  <TableCell className="font-medium">{kpi.nome_kpi}</TableCell>
                  <TableCell>{kpi.area}</TableCell>
                  <TableCell>{kpi.indicador}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{kpi.unidade_medida}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="secondary" size="sm" className="mr-2">Ver Metas</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
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
