'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Paperclip, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


type Order = {
  id: string;
  client: string;
  product: string;
  files: number;
  dueDate: string;
  urgency: boolean;
  missingFiles: boolean;
  isLate?: boolean;
};

type KanbanColumn = {
  id: 'received' | 'analysis' | 'production' | 'finalized' | 'shipped';
  title: string;
  orders: Order[];
};

const initialColumns: Record<KanbanColumn['id'], KanbanColumn> = {
  received: { id: 'received', title: 'Recebido', orders: [
    { id: 'ORD-099', client: 'Clínica Sorriso Novo', product: 'Coroa de Zircônia', files: 2, dueDate: '2024-08-05', urgency: true, missingFiles: false },
    { id: 'ORD-098', client: 'Dr. Carlos Lima', product: 'Lente E-max', files: 1, dueDate: '2024-08-04', urgency: false, missingFiles: false },
  ]},
  analysis: { id: 'analysis', title: 'Em Análise', orders: [
    { id: 'ORD-097', client: 'Odonto Center', product: 'Guia Cirúrgico', files: 3, dueDate: '2024-08-02', urgency: false, missingFiles: false },
  ]},
  production: { id: 'production', title: 'Em Produção', orders: [
    { id: 'ORD-096', client: 'Dra. Fernanda Dias', product: 'Prótese Total', files: 1, dueDate: '2024-08-10', urgency: false, missingFiles: false },
    { id: 'ORD-095', client: 'Clínica Maxilar', product: 'Implante de Titânio', files: 0, dueDate: '2024-07-30', urgency: false, missingFiles: true },
    { id: 'ORD-093', client: 'Orto Premium', product: 'Alinhador', files: 5, dueDate: '2024-07-25', urgency: true, missingFiles: false, isLate: true },
  ]},
  finalized: { id: 'finalized', title: 'Finalizado', orders: [
      { id: 'ORD-094', client: 'Sorria Bem', product: 'Alinhadores (Set)', files: 5, dueDate: '2024-07-28', urgency: false, missingFiles: false },
  ]},
  shipped: { id: 'shipped', title: 'Enviado', orders: []},
};

export default function ProductionPage() {
    const [columns, setColumns] = useState(initialColumns);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) {
            return;
        }

        const sourceColId = source.droppableId as keyof typeof columns;
        const destColId = destination.droppableId as keyof typeof columns;

        if (sourceColId === destColId && source.index === destination.index) {
            return;
        }
        
        const startColumn = columns[sourceColId];
        const endColumn = columns[destColId];

        if (startColumn === endColumn) {
            const newOrders = Array.from(startColumn.orders);
            const [removed] = newOrders.splice(source.index, 1);
            newOrders.splice(destination.index, 0, removed);

            const newColumn = {
                ...startColumn,
                orders: newOrders,
            };

            setColumns({
                ...columns,
                [startColumn.id]: newColumn,
            });
        } else {
            const startOrders = Array.from(startColumn.orders);
            const [movedOrder] = startOrders.splice(source.index, 1);
            const newStartColumn = {
                ...startColumn,
                orders: startOrders,
            };

            const endOrders = Array.from(endColumn.orders);
            endOrders.splice(destination.index, 0, movedOrder);
            const newEndColumn = {
                ...endColumn,
                orders: endOrders,
            };

            setColumns({
                ...columns,
                [startColumn.id]: newStartColumn,
                [endColumn.id]: newEndColumn,
            });

            // TODO: Firestore update
            // updateOrderStatus(draggableId, endColumn.id)
            console.log(`Moved order ${draggableId} to ${endColumn.title}`);
        }
    };

    return (
        <div className="bg-[#0a0a0a] flex flex-col flex-1 h-full p-4 md:p-6 lg:p-8">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold text-white">Kanban de Produção</h1>
            </header>
            <main className="flex-1 overflow-x-auto">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-flow-col auto-cols-max md:auto-cols-fr gap-5 h-full min-w-max">
                        {Object.values(columns).map(column => (
                            <Droppable key={column.id} droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={cn(
                                            "flex flex-col w-[300px] h-full rounded-lg bg-[#1a1a1a] border border-[#2d2d2d]",
                                            snapshot.isDraggingOver && "border-[#FFD700] bg-[#1a1a1a]/80"
                                        )}
                                    >
                                        <div className="flex items-center justify-between p-4 border-b border-[#2d2d2d]">
                                            <h2 className="font-semibold text-white">{column.title}</h2>
                                            <div className="text-sm font-bold bg-[#FFD700] text-black rounded-full px-2.5 py-0.5">
                                                {column.orders.length}
                                            </div>
                                        </div>
                                        <div className="flex-1 p-3 overflow-y-auto space-y-3">
                                            {column.orders.length > 0 ? (
                                                column.orders.map((order, index) => (
                                                    <Draggable key={order.id} draggableId={order.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{...provided.draggableProps.style}}
                                                                className={cn(
                                                                    "bg-[#121212] rounded-[16px] border border-[#3b2f00] p-4 shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]",
                                                                    snapshot.isDragging && "scale-[1.03] shadow-[0_0_15px_rgba(255,215,0,0.4)] opacity-90 border-[#ffd700]"
                                                                )}
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className="font-bold text-sm text-[#FFD700]">{order.id}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        {order.missingFiles && <AlertTriangle className="h-4 w-4 text-red-500" title="Arquivo Faltando"/>}
                                                                        {order.isLate && <Badge variant="destructive" className="h-5">Atrasado</Badge>}
                                                                        {order.urgency && !order.isLate && <Badge className="bg-orange-600 text-white h-5">Urgente</Badge>}
                                                                    </div>
                                                                </div>
                                                                <p className="font-semibold text-white mb-1">{order.client}</p>
                                                                <p className="text-sm text-gray-400 mb-3">{order.product}</p>

                                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Paperclip className="h-3 w-3" />
                                                                        <span>{order.files}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock className="h-3 w-3" />
                                                                        <span>{new Date(order.dueDate).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button
                                                                                aria-haspopup="true"
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                className="h-6 w-6 text-gray-400 hover:text-white"
                                                                            >
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                                <span className="sr-only">Ações</span>
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="bg-[#1a1a1a] text-white border-[#2d2d2d]">
                                                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                                            <DropdownMenuItem className="focus:bg-[#333] focus:text-white">Ver Detalhes</DropdownMenuItem>
                                                                            <DropdownMenuSeparator className="bg-[#2d2d2d]" />
                                                                            <DropdownMenuItem className="focus:bg-[#333] focustext-white">Mover para...</DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            ) : (
                                                 <div className="border-2 border-dashed border-gray-700 rounded-lg h-24 flex items-center justify-center text-gray-500">
                                                    Nenhum pedido
                                                </div>
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
            </main>
        </div>
    );
}
