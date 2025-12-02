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

const equipe = [
  { id: 'user1', nome: 'Ana Silva', cargo: 'Gerente de Vendas', area: 'Comercial', metas: 3, acoes: 2 },
  { id: 'user2', nome: 'Beatriz Costa', cargo: 'Analista de Marketing', area: 'Marketing', metas: 2, acoes: 5 },
  { id: 'user3', nome: 'Carlos Lima', cargo: 'Coordenador de Produção', area: 'Produção', metas: 4, acoes: 1 },
  { id: 'user4', nome: 'Daniel Martins', cargo: 'Líder de Suporte', area: 'Suporte', metas: 1, acoes: 0 },
];

export default function EquipePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe / Responsáveis</h1>
          <p className="text-muted-foreground">Gerencie os membros da equipe envolvidos no ESAP.</p>
        </div>
        <div className="ml-auto">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Responsável
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
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Nº Metas</TableHead>
                <TableHead>Ações Pendentes</TableHead>
                <TableHead className="text-right">Opções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipe.map((membro) => (
                <TableRow key={membro.id}>
                  <TableCell className="font-medium">{membro.nome}</TableCell>
                  <TableCell>{membro.cargo}</TableCell>
                  <TableCell>{membro.area}</TableCell>
                  <TableCell>{membro.metas}</TableCell>
                  <TableCell>
                    <Badge variant={membro.acoes > 0 ? 'destructive' : 'secondary'}>{membro.acoes}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Opções</DropdownMenuLabel>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Remover do ESAP</DropdownMenuItem>
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
