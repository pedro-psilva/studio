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

const coupons = [
    { code: "ITLAB25", type: "Percentual", discount: "25%", uses: "15/100", expiry: "2024-12-31", status: "Ativo" },
    { code: "NEWCLINIC15", type: "Percentual", discount: "15%", uses: "88/200", expiry: "2024-10-31", status: "Ativo" },
    { code: "FREESHIP", type: "Valor Fixo", discount: "R$ 30,00", uses: "∞", expiry: "2024-12-31", status: "Ativo" },
    { code: "EXPIRED50", type: "Valor Fixo", discount: "R$ 50,00", uses: "50/50", expiry: "2024-06-30", status: "Expirado" },
    { code: "DRAFT01", type: "Percentual", discount: "10%", uses: "0/0", expiry: "N/A", status: "Rascunho" },
];

export default function CouponsPage() {
    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Tabs defaultValue="all">
                <div className="flex items-center">
                    <TabsList>
                        <TabsTrigger value="all">Todos</TabsTrigger>
                        <TabsTrigger value="active">Ativos</TabsTrigger>
                        <TabsTrigger value="expired">Expirados</TabsTrigger>
                        <TabsTrigger value="draft" className="hidden sm:flex">
                            Rascunho
                        </TabsTrigger>
                    </TabsList>
                    <div className="ml-auto flex items-center gap-2">
                        <Button size="sm" className="h-8 gap-1">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Criar Cupom
                            </span>
                        </Button>
                    </div>
                </div>
                <TabsContent value="all">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cupons de Desconto</CardTitle>
                            <CardDescription>
                                Gerencie os cupons promocionais da sua loja.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Desconto</TableHead>
                                        <TableHead className="hidden md:table-cell">Usos</TableHead>
                                        <TableHead className="hidden md:table-cell">Validade</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>
                                            <span className="sr-only">Ações</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {coupons.map((coupon) => (
                                        <TableRow key={coupon.code}>
                                            <TableCell className="font-medium">{coupon.code}</TableCell>
                                            <TableCell>{coupon.type}</TableCell>
                                            <TableCell className="font-semibold">{coupon.discount}</TableCell>
                                            <TableCell className="hidden md:table-cell">{coupon.uses}</TableCell>
                                            <TableCell className="hidden md:table-cell">{coupon.expiry}</TableCell>
                                            <TableCell>
                                                <Badge variant={coupon.status === 'Ativo' ? 'outline' : 'secondary'}>{coupon.status}</Badge>
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
                                                        <DropdownMenuItem>Editar</DropdownMenuItem>
                                                        <DropdownMenuItem>Desativar</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive">
                                                            Excluir
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
                                Mostrando <strong>1-5</strong> de <strong>10</strong> cupons
                            </div>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </main>
    );
}
