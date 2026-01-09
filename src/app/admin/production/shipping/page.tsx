"use client";
import { useEffect, useState } from 'react';
import { Truck, Clock, Download, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { listAllOrders, type OrderDocument, updateOrderStatus } from "@/lib/orderService";
import { useToast } from "@/hooks/use-toast";
import { downloadOrderFilesAsZip } from "@/lib/storageHelper";
import { KanbanCard } from "@/components/admin/KanbanCard";

type Order = {
    id: string;
    client: string;
    carrier: string;
    trackingCode?: string;
    shippingDate: string;
    paymentStatus?: 'waiting' | 'approved' | 'refused' | 'refunded' | null;
    userId?: string;
    productIds?: string[];
    files: number;
    labels?: { text: string; color: string }[];
};

type KanbanColumn = {
    id: 'entry' | 'packing' | 'shipped';
    title: string;
    orders: Order[];
};

type DashboardOrder = OrderDocument & {
    clientName: string;
};

const emptyColumns: Record<KanbanColumn['id'], KanbanColumn> = {
    entry: { id: 'entry', title: 'Entrada', orders: [] },
    packing: { id: 'packing', title: 'Embalagem', orders: [] },
    shipped: { id: 'shipped', title: 'Envio (Saída)', orders: [] },
};

export default function ShippingPage() {
    const [columns, setColumns] = useState<Record<KanbanColumn['id'], KanbanColumn>>(emptyColumns);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
    const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
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
                    shipped: { ...emptyColumns.shipped, orders: [] },
                };

                for (const order of mapped) {
                    const shippingDate = order.updatedAt
                        ? order.updatedAt.toISOString()
                        : new Date().toISOString();

                    const productIdsForDownload = order.items?.map(i => i.productId).filter(Boolean) as string[] || [];
                    const files = order.items?.filter(item => item.stlFileUrl).length ?? 0;

                    const shippingOrder: Order = {
                        id: order.id,
                        client: order.clientName,
                        carrier: 'Transportadora',
                        trackingCode: undefined, // You might want to map this from order data if available
                        shippingDate,
                        paymentStatus: order.paymentStatus,
                        userId: order.userId,
                        productIds: productIdsForDownload,
                        files,
                        labels: order.labels,
                    };

                    let columnKey: KanbanColumn['id'] = 'entry';

                    if (order.status === 'shipped') {
                        columnKey = 'shipped';
                    } else if (order.status === 'delivered') {
                        columnKey = 'entry';
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
        if (savingOrderId) return;

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
                entry: 'delivered',
                packing: 'delivered',
                shipped: 'shipped',
            };

            const newStatus = columnToStatus[destColId];
            const previousColumns = { ...columns };

            // Atualização Otimista
            destItems.splice(destination.index, 0, movedItem);
            setColumns({
                ...columns,
                [sourceColId]: { ...columns[sourceColId], orders: sourceItems },
                [destColId]: { ...columns[destColId], orders: destItems },
            });

            try {
                setSavingOrderId(movedItem.id);
                await updateOrderStatus(movedItem.id, newStatus);

                if (destColId === 'shipped') {
                    toast({
                        title: 'Pedido enviado',
                        description: 'O pedido foi marcado como enviado para o cliente.',
                    });
                }
            } catch (err) {
                console.error('Erro ao atualizar status em Expedição:', err);
                setColumns(previousColumns);
                toast({
                    variant: "destructive",
                    title: "Erro ao mover pedido",
                    description: "Não foi possível atualizar o status do pedido."
                });
            } finally {
                setSavingOrderId(null);
            }
        }
    };

    const handleDownloadFiles = async (order: Order) => {
        if (!order.userId || !order.productIds || order.productIds.length === 0) {
            toast({
                variant: "destructive",
                title: "Sem arquivos",
                description: "Este pedido não possui arquivos para download.",
            });
            return;
        }

        setDownloadingFiles(prev => new Set(prev).add(order.id));

        try {
            await downloadOrderFilesAsZip(
                order.userId,
                order.productIds,
                order.id
            );

            toast({
                title: "Download iniciado",
                description: "Os arquivos estão sendo baixados em formato ZIP.",
            });
        } catch (error: any) {
            console.error('Erro ao baixar arquivos:', error);
            toast({
                variant: "destructive",
                title: "Erro no download",
                description: error.message || "Não foi possível baixar os arquivos.",
            });
        } finally {
            setDownloadingFiles(prev => {
                const next = new Set(prev);
                next.delete(order.id);
                return next;
            });
        }
    };

    return (
        <div className="bg-background flex flex-col flex-1 h-full p-4 md:p-6 lg:p-8">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold text-foreground">Kanban de Produção - Expedição</h1>
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
                                            <h2 className="font-semibold text-foreground">{column.title}</h2>
                                            <div className="text-sm font-bold bg-[#FFD700] text-black rounded-full px-2.5 py-0.5">
                                                {column.orders.length}
                                            </div>
                                        </div>
                                        <div className="flex-1 p-3 overflow-y-auto space-y-3">
                                            {column.orders.length > 0 ? (
                                                column.orders.map((order, index) => (
                                                    <KanbanCard
                                                        key={order.id}
                                                        order={order}
                                                        index={index}
                                                        badges={
                                                            <>
                                                                {order.paymentStatus === 'approved' && (
                                                                    <Badge className="bg-emerald-600 text-white h-5">Aprovado</Badge>
                                                                )}
                                                                {order.paymentStatus === 'waiting' && (
                                                                    <Badge className="bg-amber-500 text-white h-5">Pendente</Badge>
                                                                )}
                                                                {(order.paymentStatus === 'refused' || order.paymentStatus === 'refunded') && (
                                                                    <Badge className="bg-red-600 text-white h-5">Recusado</Badge>
                                                                )}
                                                                {order.trackingCode ? <Badge variant="secondary">{order.trackingCode}</Badge> : <Badge variant="destructive" className="bg-orange-600">Sem NF</Badge>}
                                                            </>
                                                        }
                                                        infoBar={
                                                            <>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Truck className="h-3 w-3" />
                                                                    <span>{order.carrier}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>{new Date(order.shippingDate).toLocaleDateString()}</span>
                                                                </div>
                                                            </>
                                                        }
                                                        footer={
                                                            <>
                                                                {order.userId && order.productIds && order.productIds.length > 0 && order.files > 0 ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="w-full text-xs"
                                                                        onClick={() => handleDownloadFiles(order)}
                                                                        disabled={downloadingFiles.has(order.id)}
                                                                    >
                                                                        <Download className="h-3 w-3 mr-1.5" />
                                                                        {downloadingFiles.has(order.id) ? 'Baixando...' : `Baixar Arquivos (${order.files})`}
                                                                    </Button>
                                                                ) : (
                                                                    <div className="text-xs text-muted-foreground text-center py-1">
                                                                        <Paperclip className="h-3 w-3 inline mr-1" />
                                                                        Sem Arquivos
                                                                    </div>
                                                                )}
                                                            </>
                                                        }
                                                    >
                                                        <p className="font-semibold text-foreground mb-1">{order.client}</p>
                                                        <p className="text-xs text-muted-foreground font-mono mb-1">#{order.id}</p>
                                                    </KanbanCard>
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
