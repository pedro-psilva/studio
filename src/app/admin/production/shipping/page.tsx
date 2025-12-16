"use client";
import { useEffect, useState } from 'react';
import { MoreHorizontal, Truck, FileText, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { listAllOrders, type OrderDocument, updateOrderStatus } from "@/lib/orderService";
import { useToast } from "@/hooks/use-toast";

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

type DashboardOrder = OrderDocument & {
  clientName: string;
};

const emptyColumns: Record<KanbanColumn['id'], KanbanColumn> = {
  entry: { id: 'entry', title: 'Entrada', orders: [] },
  packing: { id: 'packing', title: 'Conferência / Embalagem', orders: [] },
  invoice: { id: 'invoice', title: 'Nota Fiscal', orders: [] },
  'ready-to-ship': { id: 'ready-to-ship', title: 'Pronto para Envio', orders: [] },
  shipped: { id: 'shipped', title: 'Saída (Enviado)', orders: [] },
};

export default function ShippingPage() {
    const [columns, setColumns] = useState<Record<KanbanColumn['id'], KanbanColumn>>(emptyColumns);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            try {
                setLoading(true);
                setError(null);

                const rawOrders = await listAllOrders();

                const filtered = rawOrders.filter((o) =>
                    o.status === 'shipped' || o.status === 'delivered'
                );

                const uniqueUserIds = Array.from(
                    new Set(filtered.map((o) => o.userId).filter(Boolean)),
                );

                const userMap = new Map<
                    string,
                    { displayName?: string; clinicName?: string; email?: string }
                >();

                await Promise.all(
                    uniqueUserIds.map(async (userId) => {
                        try {
                            const userRef = doc(db, "users", userId);
                            const snap = await getDoc(userRef);
                            if (snap.exists()) {
                                const data = snap.data() as any;
                                userMap.set(userId, {
                                    displayName: data.displayName,
                                    clinicName: data.clinicName,
                                    email: data.email,
                                });
                            }
                        } catch {
                        }
                    }),
                );

                const mapped: DashboardOrder[] = filtered.map((order) => {
                    const userInfo = userMap.get(order.userId ?? "") ?? {};

                    const clientName =
                        userInfo.displayName ||
                        userInfo.clinicName ||
                        userInfo.email ||
                        order.userId ||
                        "Cliente";

                    return {
                        ...order,
                        clientName,
                    };
                });

                const nextColumns: Record<KanbanColumn['id'], KanbanColumn> = {
                    entry: { ...emptyColumns.entry, orders: [] },
                    packing: { ...emptyColumns.packing, orders: [] },
                    invoice: { ...emptyColumns.invoice, orders: [] },
                    'ready-to-ship': { ...emptyColumns['ready-to-ship'], orders: [] },
                    shipped: { ...emptyColumns.shipped, orders: [] },
                };

                for (const order of mapped) {
                    const shippingDate = order.updatedAt
                        ? order.updatedAt.toISOString()
                        : new Date().toISOString();

                    const shippingOrder: Order = {
                        id: order.id,
                        client: order.clientName,
                        carrier: 'Transportadora',
                        trackingCode: undefined,
                        shippingDate,
                    };

                    let columnKey: KanbanColumn['id'] = 'entry';

                    if (order.status === 'delivered') {
                        columnKey = 'shipped';
                    } else if (order.status === 'shipped') {
                        columnKey = 'ready-to-ship';
                    }

                    nextColumns[columnKey].orders.push(shippingOrder);
                }

                if (!isMounted) return;
                setColumns(nextColumns);
            } catch (err: any) {
                if (!isMounted) return;
                setError(err?.message ?? 'Erro ao carregar Expedição');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        void loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const onDragEnd = async (result: DropResult) => {
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
            if (!movedItem) return;

            const columnToStatus: Record<KanbanColumn['id'], OrderDocument['status']> = {
                entry: 'shipped',
                packing: 'shipped',
                invoice: 'shipped',
                'ready-to-ship': 'shipped',
                shipped: 'delivered',
            };

            const newStatus = columnToStatus[destColId];

            try {
                setSavingOrderId(movedItem.id);
                await updateOrderStatus(movedItem.id, newStatus);

                destItems.splice(destination.index, 0, movedItem);
                setColumns({
                    ...columns,
                    [sourceColId]: { ...columns[sourceColId], orders: sourceItems },
                    [destColId]: { ...columns[destColId], orders: destItems },
                });

                if (destColId === 'shipped') {
                    toast({
                        title: 'Pedido enviado',
                        description: 'O pedido foi marcado como enviado para o cliente.',
                    });
                }
            } catch (err) {
                console.error('Erro ao atualizar status em Expedição:', err);
            } finally {
                setSavingOrderId(null);
            }
        }
    };

    return (
        <div className="bg-background flex flex-col flex-1 h-full p-4 md:p-6 lg:p-8">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold text-white">Kanban de Produção - Expedição</h1>
            </header>
            <main className="flex-1 overflow-x-auto">
                {loading && (
                    <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                        Carregando Expedição...
                    </div>
                )}
                {!loading && error && (
                    <div className="flex items-center justify-center py-10 text-sm text-red-500">
                        {error}
                    </div>
                )}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-flow-col auto-cols-max md:auto-cols-fr gap-5 h-full min-w-max">
                        {Object.values(columns).map(column => (
                            <Droppable
                                key={column.id}
                                droppableId={column.id}
                                isDropDisabled={false}
                                isCombineEnabled={false}
                                ignoreContainerClipping={false}
                            >
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={cn(
                                            "flex flex-col w-[280px] h-full rounded-lg bg-card border border-border",
                                            snapshot.isDraggingOver && "border-primary bg-accent/40"
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
                                                                    "bg-background rounded-[16px] border border-border p-4 shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-md",
                                                                    snapshot.isDragging && "scale-[1.03] shadow-lg opacity-90 border-primary"
                                                                )}
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
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
