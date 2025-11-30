'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Configurações</CardTitle>
                    <CardDescription>Gerencie as configurações do sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Conteúdo da página de configurações em breve...</p>
                </CardContent>
            </Card>
        </main>
    );
}
