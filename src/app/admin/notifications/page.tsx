'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function NotificationsPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Notificações</CardTitle>
                    <CardDescription>Configure os templates de e-mail e outras notificações.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Conteúdo da página de notificações em breve...</p>
                </CardContent>
            </Card>
        </main>
    );
}
