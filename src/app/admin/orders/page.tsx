'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function OrdersPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Pedidos</CardTitle>
                    <CardDescription>Gerencie todos os pedidos aqui.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Conteúdo da página de pedidos em breve...</p>
                </CardContent>
            </Card>
        </main>
    );
}
