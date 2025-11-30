'use client';
import { useState } from 'react';
import { MoreHorizontal, Truck, FileText, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Order = {
  id: string;
  client: string;
  carrier: string;
  trackingCode?: string;
  shippingDate: string;
};

type KanbanColumn = {
  id: 'entry' | 'packing' | 'invoice' | 'ready-to-ship' | 'shipped';
  title: string;
  orders: Order[];
};

const initialColumns: Record<KanbanColumn['id'], KanbanColumn> = {
  entry: { id: 'entry', title: 'Entrada', orders: [
    { id: 'EXP-001', client: 'Clínica Sorriso Novo', carrier: 'Correios', shippingDate: '2024-08-10' },
  ]},
  packing: { id: 'packing', title: 'Conferência / Embalagem', orders: [] },
  invoice: { id: 'invoice', title: 'Nota Fiscal', orders: [] },
  'ready-to-ship': { id: 'ready-to-ship', title: 'Pronto para Envio', orders: [
      { id: 'EXP-002', client: 'Dr. Carlos Lima', carrier: 'Loggi', trackingCode: 'LOG12345BR', shippingDate: '2024-08-09' },
  ]},
  shipped: { id: 'shipped', title: 'Saída (Enviado)', orders: [] },
};

export default function ShippingPage() {
    const [columns, setColumns] = useState(initialColumns);

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceColId = source.droppableId as keyof typeof columns;
        const destColId = destination.droppableId as keyof typeof columns;

        if (sourceColId === destColId) {
            const items = Array.from(columns[sourceColId].orders);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);
            setColumns({ ...columns, [sourceColId]: { ...columns[sourceColId], orders: items } });
        } else {
            const sourceItems = Array.from(columns[sourceColId].orders);
            const destItems = Array.from(columns[destColId].orders);
            const [movedItem] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, movedItem);
            setColumns({
                ...columns,
                [sourceColId]: { ...columns[sourceColId], orders: sourceItems },
                [destColId]: { ...columns[destColId], orders: destItems },
            });
        }
    };

    return (
        <div className="bg-[#0a0a0a] flex flex-col flex-1 h-full p-4 md:p-6 lg:p-8">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold text-white">Kanban de Produção - Expedição</h1>
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
                                            "flex flex-col w-[280px] h-full rounded-lg bg-[#1a1a1a] border border-[#2d2d2d]",
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
                                                                className={cn(
                                                                    "bg-[#121212] rounded-[16px] border border-[#3b2f00] p-4 shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]",
                                                                    snapshot.isDragging && "scale-[1.03] shadow-[0_0_15px_rgba(255,215,0,0.4)] opacity-90 border-[#ffd700]"
                                                                )}
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className="font-bold text-sm text-[#FFD700]">{order.id}</span>
                                                                    {order.trackingCode ? <Badge variant="secondary">{order.trackingCode}</Badge> : <Badge variant="destructive" className="bg-orange-600">Sem NF</Badge>}
                                                                </div>
                                                                <p className="font-semibold text-white mb-3">{order.client}</p>

                                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Truck className="h-3 w-3" />
                                                                        <span>{order.carrier}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock className="h-3 w-3" />
                                                                        <span>{new Date(order.shippingDate).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-white"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="bg-[#1a1a1a] text-white border-[#2d2d2d]">
                                                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                                            <DropdownMenuItem className="focus:bg-[#333] focus:text-white">Ver Detalhes</DropdownMenuItem>
                                                                            <DropdownMenuSeparator className="bg-[#2d2d2d]" />
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            ) : (
                                                <div className="border-2 border-dashed border-gray-700 rounded-lg h-24 flex items-center justify-center text-gray-500">Nenhum pedido</div>
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
