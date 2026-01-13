import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Draggable } from "react-beautiful-dnd";
import { KanbanLabelManager } from "./KanbanLabelManager";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Simplified generic Order type that covers most needs
// Specific fields can be passed via 'children' or specific props if needed commonly
export type KanbanCardOrder = {
    id: string;
    client: string;
    labels?: { text: string; color: string }[];
    [key: string]: any;
};

type KanbanCardProps = {
    order: KanbanCardOrder;
    index: number;
    badges?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    infoBar?: ReactNode;
};

export function KanbanCard({ order, index, badges, children, footer, infoBar }: KanbanCardProps) {
    // Local state for labels to update UI optimistically/immediately without full page reload
    const [labels, setLabels] = useState(order.labels || []);
    const router = useRouter();

    return (
        <Draggable draggableId={order.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                        "bg-background rounded-[16px] border border-border p-4 shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-md h-fit",
                        snapshot.isDragging && "scale-[1.03] shadow-lg opacity-90 border-primary"
                    )}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            {badges}
                        </div>
                    </div>

                    {/* Labels Row */}
                    {labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {labels.map((label, i) => (
                                <Badge
                                    key={i}
                                    className={cn("text-[10px] px-1.5 py-0 h-4 border-none text-white", label.color)}
                                >
                                    {label.text}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <p className="font-semibold text-foreground mb-1">{order.client}</p>
                    <p className="text-xs text-muted-foreground font-mono mb-1">#{order.id}</p>

                    {children}

                    {/* Footer / Actions Area */}
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                            {infoBar}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    aria-haspopup="true"
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0 ml-1"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Ações</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}`)}>
                                    Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {/* Label Manager Component rendered as a custom item */}
                                <div className="p-1">
                                    <KanbanLabelManager
                                        orderId={order.id}
                                        initialLabels={labels}
                                        onLabelsChange={setLabels}
                                    />
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Bottom Footer (usually Download Button) */}
                    {footer && (
                        <div className="mt-3 pt-3 border-t border-border">
                            {footer}
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
}
