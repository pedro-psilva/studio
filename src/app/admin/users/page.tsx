'use client';
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

const users = [
    { name: "Dr. João Silva", type: "PF", email: "joao.silva@email.com", phone: "(11) 99999-1234", totalOrders: 15, status: "Ativo" },
    { name: "Clínica OdontoPrime", type: "PJ", email: "contato@odontoprime.com", phone: "(21) 3333-4444", totalOrders: 58, status: "Ativo" },
    { name: "Dra. Maria Oliveira", type: "PF", email: "maria.o@email.com", phone: "(31) 98888-5678", totalOrders: 5, status: "Inativo" },
    { name: "Sorriso Center", type: "PJ", email: "financeiro@sorrisocenter.com", phone: "(41) 3030-2020", totalOrders: 112, status: "Ativo" },
    { name: "Dr. Pedro Costa", type: "PF", email: "pedro.costa@email.com", phone: "(51) 97777-8901", totalOrders: 0, status: "Ativo" },
];

export default function UsersPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pf">PF</TabsTrigger>
            <TabsTrigger value="pj">PJ</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="inactive" className="hidden sm:flex">
              Inativos
            </TabsTrigger>
          </TabsList>
           <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, email..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filtro
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Tipo (PF/PJ)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Status</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Adicionar Usuário
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Usuários</CardTitle>
              <CardDescription>
                Gerencie os clientes da sua plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead className="hidden md:table-cell">Pedidos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.phone}</TableCell>
                       <TableCell className="hidden md:table-cell">{user.totalOrders}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'Ativo' ? 'default' : 'destructive'} className={user.status === 'Ativo' ? '' : 'bg-destructive/20 text-destructive border-destructive/50'}>
                            {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Resetar Senha</DropdownMenuItem>
                            <DropdownMenuItem>Ver Histórico de Pedidos</DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem>Tornar VIP</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Bloquear
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Mostrando <strong>1-5</strong> de <strong>42</strong> usuários
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
