'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";

const notificationTemplates = [
    { id: "pedido-criado", title: "Pedido Criado", description: "Enviado quando um novo pedido é submetido pelo cliente.", channels: { email: true, whatsapp: false } },
    { id: "pedido-atualizado", title: "Status do Pedido Atualizado", description: "Enviado sempre que o status de produção do pedido muda.", channels: { email: true, whatsapp: true } },
    { id: "pedido-finalizado", title: "Pedido Finalizado", description: "Enviado quando o pedido está pronto para expedição.", channels: { email: true, whatsapp: false } },
    { id: "pagamento-confirmado", title: "Pagamento Confirmado", description: "Enviado quando o pagamento da fatura é confirmado.", channels: { email: true, whatsapp: true } },
    { id: "arquivo-solicitado", title: "Arquivo Solicitado", description: "Enviado quando a equipe interna solicita um arquivo complementar.", channels: { email: true, whatsapp: false } },
];

export default function NotificationsPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Notificações</CardTitle>
                    <CardDescription>Gerencie os templates e canais de notificação para seus clientes.</CardDescription>
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
                                     <Switch id={`email-${template.id}`} defaultChecked={template.channels.email} aria-label={`Email for ${template.title}`} />
                                </div>
                                 <div className="flex items-center space-x-2">
                                     <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                     <Switch id={`whatsapp-${template.id}`} defaultChecked={template.channels.whatsapp} aria-label={`WhatsApp for ${template.title}`} />
                                </div>
                                <Button variant="outline" size="sm">
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
