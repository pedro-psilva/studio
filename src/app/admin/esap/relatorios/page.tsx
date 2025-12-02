'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { File } from "lucide-react";

export default function RelatoriosEsapPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Relatórios ESAP</h1>
                    <p className="text-muted-foreground">Exporte e visualize relatórios consolidados de performance.</p>
                </div>
                 <Button>
                    <File className="mr-2 h-4 w-4" />
                    Exportar Relatório PDF
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Construtor de Relatórios</CardTitle>
                    <CardDescription>Funcionalidade em desenvolvimento.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Em breve, você poderá gerar relatórios personalizados selecionando KPIs, períodos e áreas específicas.</p>
                </CardContent>
            </Card>
        </main>
    );
}
