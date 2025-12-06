'use client';
import { useState } from 'react';
import {
  PlusCircle,
  Building,
  ClipboardList,
  Calendar,
  Clock,
  MapPin,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function RegistrarAtividadePage() {
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Lógica de envio para o Firestore viria aqui
    toast({
        title: "Atividade Registrada!",
        description: "Sua atividade foi salva com sucesso no sistema.",
    });
    // Limpar formulário após envio
  }

  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registrar Atividade</h1>
          <p className="text-muted-foreground">Preencha o formulário para registrar uma nova atividade.</p>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
        <CardHeader>
            <CardTitle>Nova Atividade</CardTitle>
            <CardDescription>Insira os detalhes da atividade para manter seus KPIs atualizados.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tipo de Atividade */}
                    <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de Atividade</Label>
                        <Select>
                            <SelectTrigger id="tipo">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="visita">Visita</SelectItem>
                                <SelectItem value="prospeccao">Prospecção</SelectItem>
                                <SelectItem value="follow-up">Follow-up</SelectItem>
                                <SelectItem value="reuniao">Reunião</SelectItem>
                                <SelectItem value="ligacao">Ligação</SelectItem>
                                <SelectItem value="atendimento">Atendimento</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     {/* Cliente */}
                    <div className="space-y-2">
                        <Label htmlFor="cliente">Cliente</Label>
                        <div className="flex items-center">
                            <Building className="absolute ml-3 h-5 w-5 text-muted-foreground"/>
                            <Input id="cliente" placeholder="Nome do cliente ou clínica" className="pl-10"/>
                        </div>
                    </div>
                </div>

                {/* Descrição */}
                 <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                     <div className="relative">
                        <ClipboardList className="absolute top-3 left-3 h-5 w-5 text-muted-foreground" />
                        <Textarea id="descricao" placeholder="Descreva a atividade, pontos importantes, próximos passos..." className="pl-10"/>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Data */}
                     <div className="space-y-2">
                        <Label htmlFor="data">Data</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                                >
                                <Calendar className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Escolha uma data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Hora */}
                    <div className="space-y-2">
                        <Label htmlFor="hora">Hora</Label>
                        <div className="flex items-center">
                            <Clock className="absolute ml-3 h-5 w-5 text-muted-foreground"/>
                            <Input id="hora" type="time" className="pl-10"/>
                        </div>
                    </div>
                </div>

                {/* Local */}
                <div className="space-y-2">
                    <Label htmlFor="local">Local</Label>
                    <div className="flex items-center">
                        <MapPin className="absolute ml-3 h-5 w-5 text-muted-foreground"/>
                        <Input id="local" placeholder="Endereço da visita ou link da reunião" className="pl-10"/>
                    </div>
                </div>

                {/* Anexo */}
                 <div className="space-y-2">
                    <Label htmlFor="anexo">Anexo</Label>
                    <div className="flex items-center">
                         <Paperclip className="absolute ml-3 h-5 w-5 text-muted-foreground"/>
                        <Input id="anexo" type="file" className="pl-10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"/>
                    </div>
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" type="reset">Limpar</Button>
                    <Button type="submit">Salvar Atividade</Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </main>
  );
}
