'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const notificationTemplates = [
    { 
        id: "pedido-criado", 
        title: "Confirmação de Pedido", 
        description: "Enviado ao cliente assim que um novo pedido é registrado no sistema.", 
        channels: { email: true, whatsapp: false } 
    },
    { 
        id: "pagamento-confirmado", 
        title: "Pagamento Confirmado", 
        description: "Enviado quando o gateway de pagamento confirma a transação.", 
        channels: { email: true, whatsapp: false } 
    },
    { 
        id: "pedido-atualizado", 
        title: "Atualização de Status do Pedido", 
        description: "Enviado sempre que o status de produção do pedido (ex: Em Produção, Finalizado) é alterado.", 
        channels: { email: true, whatsapp: false } 
    },
    { 
        id: "pedido-enviado", 
        title: "Pedido Enviado", 
        description: "Enviado quando o pedido sai para entrega, incluindo o código de rastreio.", 
        channels: { email: true, whatsapp: false } 
    },
    { 
        id: "arquivo-solicitado", 
        title: "Solicitação de Arquivo Complementar", 
        description: "Disparado manualmente pela equipe interna quando falta algum arquivo para a produção.", 
        channels: { email: true, whatsapp: false } 
    },
];

export default function NotificationsPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Notificações Transacionais</CardTitle>
                    <CardDescription>
                        Gerencie os templates e canais de notificação para seus clientes. As notificações são enviadas via E-mail (Brevo).
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-8">
                    {notificationTemplates.map((template) => (
                        <div key={template.id} className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-lg border p-4">
                            <div className="flex-1 mb-4 md:mb-0">
                                <h3 className="font-semibold">{template.title}</h3>
                                <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                     <Mail className="h-5 w-5 text-muted-foreground" />
                                     <Badge variant={template.channels.email ? 'default' : 'outline'}>
                                        {template.channels.email ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                                        E-mail
                                     </Badge>
                                </div>
                                 <div className="flex items-center space-x-2">
                                     <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                     <Badge variant={template.channels.whatsapp ? 'default' : 'outline'}>
                                        {template.channels.whatsapp ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                                        WhatsApp
                                     </Badge>
                                </div>
                                <Button variant="outline" size="sm" disabled>
                                    Editar Template
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </main>
    );
}
