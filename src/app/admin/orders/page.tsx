'use client';
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
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
import { Search } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="received">Recebidos</TabsTrigger>
            <TabsTrigger value="in-production">Em Produção</TabsTrigger>
            <TabsTrigger value="shipped">Enviados</TabsTrigger>
            <TabsTrigger value="delivered">Entregues</TabsTrigger>
            <TabsTrigger value="canceled">Cancelados</TabsTrigger>
          </TabsList>
           <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por ID, cliente..."
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
                  Status Pagamento
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Status Pedido</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Data
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Exportar
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos</CardTitle>
              <CardDescription>
                Gerencie os pedidos da sua loja.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Data
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Valor
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Status Pedido
                    </TableHead>
                    <TableHead>Status Pagamento</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: 'ORD-098', cliente: 'Clinica Sorriso Aberto', data: '2024-07-25', valor: 'R$ 450,00', statusPedido: 'Em Produção', statusPagto: 'Pago'},
                    { id: 'ORD-097', cliente: 'Dr. Ricardo Mendes', data: '2024-07-24', valor: 'R$ 1.200,00', statusPedido: 'Recebido', statusPagto: 'Pendente'},
                    { id: 'ORD-096', cliente: 'OdontoPlus', data: '2024-07-23', valor: 'R$ 280,00', statusPedido: 'Enviado', statusPagto: 'Pago'},
                    { id: 'ORD-095', cliente: 'Clínica Dente Feliz', data: '2024-07-22', valor: 'R$ 890,00', statusPedido: 'Entregue', statusPagto: 'Pago'},
                    { id: 'ORD-094', cliente: 'Dra. Ana Costa', data: '2024-07-21', valor: 'R$ 150,00', statusPedido: 'Cancelado', statusPagto: 'Reembolsado'},

                  ].map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.cliente}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {order.data}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{order.valor}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{order.statusPedido}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.statusPagto === 'Pago' ? 'default' : 'destructive'}>{order.statusPagto}</Badge>
                    </TableCell>
                    <TableCell>
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
                          <DropdownMenuItem asChild><Link href={`/admin/orders/${order.id}`}>Ver Pedido</Link></DropdownMenuItem>
                          <DropdownMenuItem>Atualizar Status</DropdownMenuItem>
                           <DropdownMenuItem>Baixar Arquivos</DropdownMenuItem>
                          <DropdownMenuItem>Enviar Notificação</DropdownMenuItem>
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
                Mostrando <strong>1-5</strong> de <strong>32</strong> pedidos
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
