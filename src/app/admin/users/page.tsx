'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function UsersPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Usuários</CardTitle>
                    <CardDescription>Gerencie clientes e administradores.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Conteúdo da página de usuários em breve...</p>
                </CardContent>
            </Card>
        </main>
    );
}
