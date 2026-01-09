import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, X, Tag } from "lucide-react";
import { updateOrderLabels } from "@/lib/orderService";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Label = {
    text: string;
    color: string;
};

type KanbanLabelManagerProps = {
    orderId: string;
    initialLabels: Label[];
    onLabelsChange: (labels: Label[]) => void;
};

const COLORS = [
    { name: "Blue", value: "bg-blue-500" },
    { name: "Green", value: "bg-emerald-500" },
    { name: "Yellow", value: "bg-yellow-500" },
    { name: "Red", value: "bg-red-500" },
    { name: "Purple", value: "bg-purple-500" },
    { name: "Pink", value: "bg-pink-500" },
    { name: "Indigo", value: "bg-indigo-500" },
    { name: "Gray", value: "bg-gray-500" },
    { name: "Orange", value: "bg-orange-500" },
    { name: "Cyan", value: "bg-cyan-500" },
];

export function KanbanLabelManager({ orderId, initialLabels, onLabelsChange }: KanbanLabelManagerProps) {
    const [labels, setLabels] = useState<Label[]>(initialLabels);
    const [newLabelText, setNewLabelText] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddLabel = async () => {
        if (!newLabelText.trim()) return;

        const newLabel = { text: newLabelText, color: selectedColor };
        const updatedLabels = [...labels, newLabel];

        setIsSubmitting(true);
        try {
            await updateOrderLabels(orderId, updatedLabels);
            setLabels(updatedLabels);
            onLabelsChange(updatedLabels);
            setNewLabelText("");
            toast({ title: "Etiqueta adicionada" });
        } catch (error) {
            console.error("Erro ao adicionar etiqueta:", error);
            toast({ variant: "destructive", title: "Erro ao adicionar etiqueta" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveLabel = async (indexToRemove: number) => {
        const updatedLabels = labels.filter((_, index) => index !== indexToRemove);

        setIsSubmitting(true);
        try {
            await updateOrderLabels(orderId, updatedLabels);
            setLabels(updatedLabels);
            onLabelsChange(updatedLabels);
            toast({ title: "Etiqueta removida" });
        } catch (error) {
            console.error("Erro ao remover etiqueta:", error);
            toast({ variant: "destructive", title: "Erro ao remover etiqueta" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start pl-2 text-xs h-8 font-normal">
                    <Tag className="mr-2 h-3.5 w-3.5" />
                    Gerenciar Etiquetas
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none text-sm">Etiquetas</h4>
                        <p className="text-xs text-muted-foreground">
                            Adicione etiquetas personalizadas ao pedido.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-[2rem]">
                        {labels.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">Nenhuma etiqueta</span>
                        )}
                        {labels.map((label, index) => (
                            <Badge
                                key={index}
                                className={cn("text-white pr-1 py-0.5 h-6", label.color)}
                            >
                                {label.text}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 ml-1 hover:bg-black/20 rounded-full"
                                    onClick={() => handleRemoveLabel(index)}
                                    disabled={isSubmitting}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                        <Input
                            placeholder="Nova etiqueta..."
                            value={newLabelText}
                            onChange={(e) => setNewLabelText(e.target.value)}
                            className="h-8 text-xs"
                        />
                        <div className="flex flex-wrap gap-1.5">
                            {COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    className={cn(
                                        "w-5 h-5 rounded-full transition-all border border-transparent",
                                        color.value,
                                        selectedColor === color.value && "scale-110 ring-2 ring-offset-1 ring-primary border-white"
                                    )}
                                    onClick={() => setSelectedColor(color.value)}
                                    type="button"
                                    title={color.name}
                                />
                            ))}
                        </div>
                        <Button
                            size="sm"
                            className="w-full h-8 text-xs"
                            onClick={handleAddLabel}
                            disabled={!newLabelText.trim() || isSubmitting}
                        >
                            <Plus className="mr-2 h-3 w-3" /> Adicionar
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
