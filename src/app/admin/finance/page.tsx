'use client';
import {
  ListFilter,
  Search,
  File,
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const invoices = [
    { id: "INV-2024-001", orderId: "ORD-098", client: "Clinica Sorriso Aberto", date: "2024-07-25", value: "R$ 450,00", status: "Pago" },
    { id: "INV-2024-002", orderId: "ORD-097", client: "Dr. Ricardo Mendes", date: "2024-07-24", value: "R$ 1.200,00", status: "Pendente" },
    { id: "INV-2024-003", orderId: "ORD-096", client: "OdontoPlus", date: "2024-07-23", value: "R$ 280,00", status: "Pago" },
    { id: "INV-2024-004", orderId: "ORD-095", client: "Clínica Dente Feliz", date: "2024-07-22", value: "R$ 890,00", status: "Pago" },
    { id: "INV-2024-005", orderId: "ORD-094", client: "Dra. Ana Costa", date: "2024-07-21", value: "R$ 150,00", status: "Vencido" },
];

export default function FinancePage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
             <Tabs defaultValue="invoices">
                <div className="flex items-center">
                    <TabsList>
                        <TabsTrigger value="invoices">Faturas</TabsTrigger>
                        <TabsTrigger value="payments">Pagamentos</TabsTrigger>
                        <TabsTrigger value="reports">Relatórios Financeiros</TabsTrigger>
                    </TabsList>
                     <div className="ml-auto flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-8 gap-1">
                            <File className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Exportar
                            </span>
                        </Button>
                    </div>
                </div>
                 <TabsContent value="invoices">
                    <Card>
                        <CardHeader>
                            <CardTitle>Faturas</CardTitle>
                            <CardDescription>Gerencie faturas e pagamentos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID Fatura</TableHead>
                                        <TableHead>Pedido</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead><span className="sr-only">Ações</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">{invoice.id}</TableCell>
                                            <TableCell>{invoice.orderId}</TableCell>
                                            <TableCell>{invoice.client}</TableCell>
                                            <TableCell>{invoice.date}</TableCell>
                                            <TableCell>{invoice.value}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    invoice.status === 'Pago' ? 'default' : 
                                                    invoice.status === 'Pendente' ? 'secondary' : 'destructive'
                                                }>
                                                    {invoice.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm">
                                                    Ver Detalhes
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                 </TabsContent>
                 <TabsContent value="payments">
                     <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Pagamentos</CardTitle>
                            <CardDescription>Visualize todos os pagamentos e logs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Conteúdo da aba de pagamentos em breve...</p>
                        </CardContent>
                    </Card>
                 </TabsContent>
                  <TabsContent value="reports">
                     <Card>
                        <CardHeader>
                            <CardTitle>Relatórios Financeiros</CardTitle>
                            <CardDescription>Insights sobre o faturamento do seu negócio.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Conteúdo da aba de relatórios financeiros em breve...</p>
                        </CardContent>
                    </Card>
                 </TabsContent>
            </Tabs>
        </main>
    );
}
