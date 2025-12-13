"use client";
import { useEffect, useState } from 'react';
import { MoreHorizontal, Paperclip, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { listAllOrders, type OrderDocument } from "@/lib/orderService";
import { getService } from "@/lib/serviceService";

type Order = {
  id: string;
  client: string;
  product: string;
  patient?: string;
  files: number;
  dueDate: string;
  urgency: boolean;
  missingFiles: boolean;
};

type KanbanColumn = {
  id: 'entry' | 'cad' | 'cam' | 'milling' | 'digital-control' | 'exit';
  title: string;
  orders: Order[];
};

type DashboardOrder = OrderDocument & {
  clientName: string;
};

const emptyColumns: Record<KanbanColumn['id'], KanbanColumn> = {
  entry: { id: 'entry', title: 'Entrada', orders: [] },
  cad: { id: 'cad', title: 'CAD', orders: [] },
  cam: { id: 'cam', title: 'CAM', orders: [] },
  milling: { id: 'milling', title: 'Impressão / Fresagem', orders: [] },
  'digital-control': { id: 'digital-control', title: 'Controle Digital', orders: [] },
  exit: { id: 'exit', title: 'Saída', orders: [] },
};

export default function CadCamPage() {
    const [columns, setColumns] = useState<Record<KanbanColumn['id'], KanbanColumn>>(emptyColumns);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            try {
                setLoading(true);
                setError(null);

                const rawOrders = await listAllOrders();

                // considerar apenas pedidos em produção para este quadro
                const filtered = rawOrders.filter((o) => o.status === 'in_production');

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
                    cad: { ...emptyColumns.cad, orders: [] },
                    cam: { ...emptyColumns.cam, orders: [] },
                    milling: { ...emptyColumns.milling, orders: [] },
                    'digital-control': { ...emptyColumns['digital-control'], orders: [] },
                    exit: { ...emptyColumns.exit, orders: [] },
                };

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

                    const cadOrder: Order = {
                        id: order.id,
                        client: order.clientName,
                        product: productName,
                        patient: patientName,
                        files,
                        dueDate,
                        urgency: false,
                        missingFiles: false,
                    };

                    // inicialmente todos entram em "Entrada"; o time move entre as etapas
                    nextColumns.entry.orders.push(cadOrder);
                }

                if (!isMounted) return;
                setColumns(nextColumns);
            } catch (err: any) {
                if (!isMounted) return;
                setError(err?.message ?? 'Erro ao carregar CAD/CAM');
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

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;
        
        const sourceColId = source.droppableId as keyof typeof columns;
        const destColId = destination.droppableId as keyof typeof columns;
        
        if (source.droppableId === destination.droppableId) {
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
                <h1 className="text-2xl font-semibold text-white">Kanban de Produção - CAD/CAM</h1>
            </header>
            <main className="flex-1 overflow-x-auto">
                {loading && (
                    <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                        Carregando CAD/CAM...
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
                            <Droppable key={column.id} droppableId={column.id} isDropDisabled={false}>
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
                                                                    <div className="flex items-center gap-2">
                                                                        {order.missingFiles && <Badge variant="destructive" className="h-5 bg-orange-600">Pendência</Badge>}
                                                                        {order.urgency && <Badge className="bg-red-600 text-white h-5">URGENTE</Badge>}
                                                                    </div>
                                                                </div>
                                                                <p className="font-semibold text-white mb-1">{order.client}</p>
                                                                <p className="text-sm text-gray-400 mb-1">{order.product}</p>
                                                                <p className="text-xs text-gray-500 mb-2">Paciente: {order.patient ?? "Paciente"}</p>
                                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Paperclip className="h-3 w-3" />
                                                                        <span>{order.files} STL</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock className="h-3 w-3" />
                                                                        <span>{new Date(order.dueDate).toLocaleDateString()}</span>
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
