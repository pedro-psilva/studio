'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ReportsPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Relatórios</CardTitle>
                    <CardDescription>Visualize dados e insights de negócio.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Conteúdo da página de relatórios em breve...</p>
                </CardContent>
            </Card>
        </main>
    );
}
