'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function FinancePage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Financeiro</CardTitle>
                    <CardDescription>Gerencie faturas e pagamentos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Conteúdo da página financeira em breve...</p>
                </CardContent>
            </Card>
        </main>
    );
}
