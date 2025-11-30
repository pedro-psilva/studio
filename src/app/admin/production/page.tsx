'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ProductionPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Kanban de Produção</CardTitle>
                    <CardDescription>Acompanhe o fluxo de produção.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Conteúdo da página do Kanban de Produção em breve...</p>
                </CardContent>
            </Card>
        </main>
    );
}
