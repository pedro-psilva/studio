"use client";
import { useEffect, useState } from "react";
import { MoreHorizontal, Paperclip, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "react-beautiful-dnd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { listAllOrders, type OrderDocument, updateOrderStatus } from "@/lib/orderService";
import { useToast } from "@/hooks/use-toast";
import { getService } from "@/lib/serviceService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Order = {
  id: string;
  client: string;
  product: string;
  patient?: string;
  files: number;
  dueDate: string;
  urgency: boolean;
  missingFiles: boolean;
  isLate?: boolean;
};

type KanbanColumn = {
  id: "received" | "analysis" | "production" | "finalized" | "shipped";
  title: string;
  orders: Order[];
};

type DashboardOrder = OrderDocument & {
  clientName: string;
};

const emptyColumns: Record<KanbanColumn["id"], KanbanColumn> = {
  received: {
    id: "received",
    title: "Recebido",
    orders: [],
  },
  analysis: {
    id: "analysis",
    title: "Em Análise (Triagem)",
    orders: [],
  },
  production: {
    id: "production",
    title: "Em Produção (CAD/CAM + Finalização)",
    orders: [],
  },
  finalized: {
    id: "finalized",
    title: "Finalizado (Aguardando Expedição)",
    orders: [],
  },
  shipped: {
    id: "shipped",
    title: "Enviado",
    orders: [],
  },
};

export default function ProductionGeneralPage() {
    const [columns, setColumns] = useState<Record<KanbanColumn['id'], KanbanColumn>>(emptyColumns);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const [pendingMove, setPendingMove] = useState<{
        sourceColId: KanbanColumn['id'];
        destColId: KanbanColumn['id'];
        sourceIndex: number;
        destIndex: number;
        order: Order;
    } | null>(null);
    const [confirming, setConfirming] = useState(false);

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
                    received: { ...emptyColumns.received, orders: [] },
                    analysis: { ...emptyColumns.analysis, orders: [] },
                    production: { ...emptyColumns.production, orders: [] },
                    finalized: { ...emptyColumns.finalized, orders: [] },
                    shipped: { ...emptyColumns.shipped, orders: [] },
                };

                const now = new Date();
                const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;

                for (const order of mapped) {
                    const firstItem = order.items?.[0];
                    const productId = firstItem?.productId;
                    const productName = productId
                        ? serviceNames[productId] ?? 'Serviço não especificado'
                        : "Serviço";
                    const patientName = firstItem?.patientName ?? "Paciente";

                    const files = order.items?.length ?? 0;

                    const dueDate = order.createdAt
                        ? order.createdAt.toISOString()
                        : new Date().toISOString();

                    const ageMs = now.getTime() - order.createdAt.getTime();
                    const isLate =
                        ageMs > fiveDaysMs &&
                        order.status !== "shipped" &&
                        order.status !== "delivered";

                    const urgency = isLate;

                    const kanbanOrder: Order = {
                        id: order.id,
                        client: order.clientName,
                        product: productName,
                        patient: patientName,
                        files,
                        dueDate,
                        urgency,
                        missingFiles: false,
                        isLate,
                    };

                    let columnKey: KanbanColumn['id'] = "received";

                    // Mapeia status do pedido -> coluna do kanban
                    // Regra desejada:
                    // - pending_payment: ainda aguardando pagamento, fica em "Recebido"
                    // - paid: pagamento aceito, entra em triagem ("Em Análise")
                    // - in_production: vai para "Em Produção"
                    // - delivered: "Finalizado (Aguardando Expedição)"
                    // - shipped: "Enviado"
                    switch (order.status) {
                        case "pending_payment":
                            columnKey = "received";
                            break;
                        case "paid":
                            columnKey = "analysis";
                            break;
                        case "in_production":
                            columnKey = "production";
                            break;
                        case "delivered":
                            columnKey = "finalized";
                            break;
                        case "shipped":
                            columnKey = "shipped";
                            break;
                        default:
                            columnKey = "received";
                    }

                    nextColumns[columnKey].orders.push(kanbanOrder);
                }

                if (!isMounted) return;
                setColumns(nextColumns);
            } catch (err: any) {
                if (!isMounted) return;
                setError(err?.message ?? "Erro ao carregar produção");
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

        if (!destination) {
            return;
        }

        const sourceColId = source.droppableId as keyof typeof columns;
        const destColId = destination.droppableId as keyof typeof columns;

        if (sourceColId === destColId) {
            const items = Array.from(columns[sourceColId].orders);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);
            setColumns({ ...columns, [sourceColId]: { ...columns[sourceColId], orders: items } });
            return;
        }

        const sourceItems = Array.from(columns[sourceColId].orders);
        const [movedItem] = sourceItems.splice(source.index, 1);

        // Se por algum motivo não houver item na posição, não faz nada
        if (!movedItem) {
            return;
        }

        // Guarda o movimento pendente para confirmação via popup
        setPendingMove({
            sourceColId,
            destColId,
            sourceIndex: source.index,
            destIndex: destination.index,
            order: movedItem,
        });
    };

    const handleConfirmMove = async () => {
        if (!pendingMove) return;

        const { sourceColId, destColId, sourceIndex, destIndex } = pendingMove;

        setConfirming(true);
        try {
            setColumns(prev => {
                const sourceItems = Array.from(prev[sourceColId].orders);
                const destItems = Array.from(prev[destColId].orders);

                // Remove da coluna de origem pela posição
                const [removed] = sourceItems.splice(sourceIndex, 1);
                if (!removed) {
                    return prev;
                }

                destItems.splice(destIndex, 0, removed);

                return {
                    ...prev,
                    [sourceColId]: { ...prev[sourceColId], orders: sourceItems },
                    [destColId]: { ...prev[destColId], orders: destItems },
                };
            });

            setPendingMove(null);
        } catch (err) {
            console.error('Erro ao atualizar status do pedido a partir do kanban:', err);
            toast({
                variant: "destructive",
                title: "Erro ao atualizar status",
                description: "Não foi possível atualizar o status do pedido. Tente novamente.",
            });
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div className="bg-background flex flex-col flex-1 h-full p-4 md:p-6 lg:p-8">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold text-foreground">Kanban de Produção - Geral</h1>
            </header>
            <main className="flex-1 overflow-x-auto">
                {loading && (
                    <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                        Carregando pedidos de produção...
                    </div>
                )}
                {!loading && error && (
                    <div className="flex items-center justify-center py-10 text-sm text-destructive">
                        {error}
                    </div>
                )}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-flow-col auto-cols-max md:auto-cols-fr gap-5 h-full min-w-max">
                        {Object.values(columns).map((column) => (
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
                                            "flex flex-col w-[300px] h-full rounded-lg bg-card border border-border",
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
                                                column.orders
                                                    .filter(Boolean)
                                                    .map((order, index) => (
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
                                                                            {order.missingFiles && (
                                                                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                                                            )}
                                                                            {order.isLate && <Badge variant="destructive" className="h-5">Atrasado</Badge>}
                                                                            {order.urgency && !order.isLate && <Badge className="bg-amber-600 text-amber-50 h-5">Urgente</Badge>}
                                                                        </div>
                                                                    </div>
                                                                    <p className="font-semibold text-foreground mb-1">{order.client}</p>
                                                                    <p className="text-sm text-muted-foreground mb-1">{order.product}</p>
                                                                    <p className="text-xs text-muted-foreground mb-2">Paciente: {order.patient ?? "Paciente"}</p>

                                                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
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
                                                                                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                                                                >
                                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                                    <span className="sr-only">Ações</span>
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end">
                                                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                                                <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                                                                <DropdownMenuSeparator />
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </div>
                                                                </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            ) : (
                                                 <div className="border-2 border-dashed border-border/60 rounded-lg h-24 flex items-center justify-center text-muted-foreground">
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

                <AlertDialog
                    open={!!pendingMove}
                    onOpenChange={(open) => {
                        if (!open) setPendingMove(null);
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar alteração de status</AlertDialogTitle>
                            <AlertDialogDescription>
                                {pendingMove && (
                                    <span>
                                        Deseja realmente alterar o status do pedido
                                        {' '}
                                        <strong>{pendingMove.order.client}</strong>
                                        {' '}
                                        para a coluna
                                        {' '}
                                        <strong>{columns[pendingMove.destColId].title}</strong>?
                                        Essa ação atualizará o status no sistema de pedidos.
                                    </span>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={confirming}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    void handleConfirmMove();
                                }}
                                disabled={confirming}
                            >
                                {confirming ? "Atualizando..." : "Confirmar"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    );
}
