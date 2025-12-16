"use client";
import { useEffect, useState } from "react";
import { MoreHorizontal, Paperclip, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { listAllOrders, type OrderDocument, updateOrderStatus } from "@/lib/orderService";
import { useToast } from "@/hooks/use-toast";
import { getService } from "@/lib/serviceService";

type Order = {
  id: string;
  client: string;
  product: string;
  patient?: string;
  entryDate: string;
  dueDate: string;
  urgency: boolean;
  missingInfo: boolean;
};

type KanbanColumn = {
  id: 'entry' | 'verification' | 'pending' | 'released';
  title: string;
  orders: Order[];
};

type DashboardOrder = OrderDocument & {
  clientName: string;
};

const emptyColumns: Record<KanbanColumn['id'], KanbanColumn> = {
  entry: { id: 'entry', title: 'Entrada', orders: [] },
  verification: { id: 'verification', title: 'Verificação de Triagem', orders: [] },
  pending: { id: 'pending', title: 'Aguardando Complemento', orders: [] },
  released: { id: 'released', title: 'Liberado para Produção (Saída)', orders: [] },
};

export default function TriagePage() {
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

                const uniqueUserIds = Array.from(
                    new Set(rawOrders.map((o) => o.userId).filter(Boolean)),
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

                const mapped: DashboardOrder[] = rawOrders.map((order) => {
                    const userInfo = userMap.get(order.userId ?? "") ?? {};

                    const clientName =
                        userInfo.displayName ||
                        userInfo.clinicName ||
                        userInfo.email ||
                        "Cliente";

                    return {
                        ...order,
                        clientName,
                    };
                });

                const productIds = Array.from(
                    new Set(
                        mapped
                            .flatMap((o) => o.items?.map((i) => i.productId) ?? [])
                            .filter(Boolean) as string[],
                    ),
                );

                let serviceNames: Record<string, string> = {};

                if (productIds.length > 0) {
                    const entries = await Promise.all(
                        productIds.map(async (pid) => {
                            try {
                                const service = await getService(pid);
                                return [
                                    pid,
                                    service?.nome ?? 'Serviço não especificado',
                                ] as [string, string];
                            } catch {
                                return [pid, 'Serviço não especificado'] as [string, string];
                            }
                        }),
                    );

                    serviceNames = Object.fromEntries(entries);
                }

                const nextColumns: Record<KanbanColumn['id'], KanbanColumn> = {
                    entry: { ...emptyColumns.entry, orders: [] },
                    verification: { ...emptyColumns.verification, orders: [] },
                    pending: { ...emptyColumns.pending, orders: [] },
                    released: { ...emptyColumns.released, orders: [] },
                };

                const now = new Date();
                const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

                for (const order of mapped) {
                    // filtramos apenas pedidos ainda na esteira inicial (não enviados/entregues/cancelados)
                    if (order.status === 'shipped' || order.status === 'delivered' || order.status === 'canceled') {
                        continue;
                    }

                    const firstItem = order.items?.[0];
                    const productId = firstItem?.productId;
                    const productName = productId
                        ? serviceNames[productId] ?? 'Serviço não especificado'
                        : "Serviço";
                    const patientName = firstItem?.patientName ?? "Paciente";

                    const entryDate = order.createdAt
                        ? order.createdAt.toISOString()
                        : new Date().toISOString();

                    const dueDate = entryDate;

                    const ageMs = now.getTime() - order.createdAt.getTime();
                    const missingInfo = false;
                    const urgency = ageMs > twoDaysMs;

                    const triageOrder: Order = {
                        id: order.id,
                        client: order.clientName,
                        product: productName,
                        patient: patientName,
                        entryDate,
                        dueDate,
                        urgency,
                        missingInfo,
                    };

                    let columnKey: KanbanColumn['id'] = 'entry';

                    switch (order.status) {
                        case 'pending_payment':
                            columnKey = urgency ? 'pending' : 'entry';
                            break;
                        case 'paid':
                            columnKey = 'verification';
                            break;
                        case 'in_production':
                            columnKey = 'released';
                            break;
                        default:
                            columnKey = 'entry';
                    }

                    nextColumns[columnKey].orders.push(triageOrder);
                }

                if (!isMounted) return;
                setColumns(nextColumns);
            } catch (err: any) {
                if (!isMounted) return;
                setError(err?.message ?? 'Erro ao carregar triagem');
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
        if (savingOrderId) {
            // evita múltiplos saves concorrentes e animações estranhas
            return;
        }
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

            // Mapa de coluna de triagem -> status de pedido
            const columnToStatus: Record<KanbanColumn['id'], OrderDocument['status']> = {
                entry: 'pending_payment',
                verification: 'paid',
                pending: 'pending_payment',
                released: 'in_production',
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

                // Mensagens apenas nas mudanças de etapa macro:
                // Recebido -> Análise (pending_payment -> paid)
                // Análise -> Produção (paid -> in_production)
                if (destColId === 'verification') {
                    toast({
                        title: 'Pedido em análise',
                        description: 'O pedido foi movido de Recebido para Análise.',
                    });
                } else if (destColId === 'released') {
                    toast({
                        title: 'Pedido em produção',
                        description: 'O pedido foi liberado da análise para a produção.',
                    });
                }
            } catch (err) {
                console.error('Erro ao atualizar status na triagem:', err);
            } finally {
                setSavingOrderId(null);
            }
        }
    };

    return (
        <div className="bg-background flex flex-col flex-1 h-full p-4 md:p-6 lg:p-8">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold text-white">Kanban de Produção - Triagem</h1>
            </header>
            <main className="flex-1 overflow-x-auto">
                {loading && (
                    <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                        Carregando triagem...
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
                                            "flex flex-col w-[320px] h-full rounded-lg bg-card border border-border",
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
                                                                    <div className="flex items-center gap-2">
                                                                        {order.missingInfo && (
                                                                            <Badge variant="destructive" className="h-5 bg-orange-600">
                                                                                <AlertTriangle className="h-3 w-3 mr-1" /> Faltando Info
                                                                            </Badge>
                                                                        )}
                                                                        {order.urgency && !order.missingInfo && (
                                                                            <Badge className="bg-red-600 text-white h-5">Urgente</Badge>
                                                                        )}
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
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <p className="font-semibold text-white mb-1">{order.client}</p>
                                                                <p className="text-sm text-gray-400 mb-1">{order.product}</p>
                                                                <p className="text-xs text-gray-500 mb-2">Paciente: {order.patient ?? "Paciente"}</p>
                                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock className="h-3 w-3" />
                                                                        <span>Prazo: {new Date(order.dueDate).toLocaleDateString()}</span>
                                                                    </div>
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
