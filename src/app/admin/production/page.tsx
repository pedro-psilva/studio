'use client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Paperclip, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const kanbanColumns = [
  { id: 'received', title: 'Recebido', orders: [
    { id: 'ORD-099', client: 'Clínica Sorriso Novo', product: 'Coroa de Zircônia', files: 2, dueDate: '2024-08-05', urgency: false },
    { id: 'ORD-098', client: 'Dr. Carlos Lima', product: 'Lente E-max', files: 1, dueDate: '2024-08-04', urgency: false },
  ]},
  { id: 'analysis', title: 'Em Análise', orders: [
    { id: 'ORD-097', client: 'Odonto Center', product: 'Guia Cirúrgico', files: 3, dueDate: '2024-08-02', urgency: true },
  ]},
  { id: 'production', title: 'Em Produção', orders: [
    { id: 'ORD-096', client: 'Dra. Fernanda Dias', product: 'Prótese Total', files: 1, dueDate: '2024-08-10', urgency: false },
    { id: 'ORD-095', client: 'Clínica Maxilar', product: 'Implante de Titânio', files: 0, dueDate: '2024-07-30', urgency: true },
  ]},
  { id: 'finalized', title: 'Finalizado', orders: [
      { id: 'ORD-094', client: 'Sorria Bem', product: 'Alinhadores (Set)', files: 5, dueDate: '2024-07-28', urgency: false },
  ]},
  { id: 'shipped', title: 'Enviado', orders: []},
];

export default function ProductionPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Kanban de Produção</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
                {kanbanColumns.map(column => (
                    <div key={column.id} className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{column.title}</h2>
                            <Badge variant="secondary">{column.orders.length}</Badge>
                        </div>
                        <div className="flex flex-col gap-4">
                            {column.orders.map(order => (
                                <Card key={order.id} className="cursor-grab">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{order.id}</CardTitle>
                                        {order.urgency && <AlertTriangle className="h-4 w-4 text-destructive" />}
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-base font-semibold">{order.client}</p>
                                        <p className="text-sm text-muted-foreground">{order.product}</p>
                                    </CardContent>
                                    <CardFooter className="flex justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Paperclip className="h-3 w-3" />
                                            <span>{order.files}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{order.dueDate.split('-').reverse().join('/')}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                            {column.orders.length === 0 && (
                                <div className="border-2 border-dashed border-muted rounded-lg h-24 flex items-center justify-center text-muted-foreground">
                                    Nenhum pedido
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
