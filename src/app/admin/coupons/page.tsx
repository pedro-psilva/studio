'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function CouponsPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Cupons de Desconto</h1>
                <Button className="ml-auto" size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Criar Cupom
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Cupons</CardTitle>
                    <CardDescription>Gerencie os cupons de desconto da loja.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Conteúdo da página de cupons em breve...</p>
                </CardContent>
            </Card>
        </main>
    );
}
