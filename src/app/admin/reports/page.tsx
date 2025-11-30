'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip, Legend } from 'recharts';
import { File } from "lucide-react";

const salesByProductData = [
  { name: 'Coroa Zircônia', total: 4400 },
  { name: 'Lente E-max', total: 3000 },
  { name: 'Implante Ti', total: 2000 },
  { name: 'Guia Cirúrgico', total: 2780 },
  { name: 'Prótese Total', total: 1890 },
];

export default function ReportsPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
                    <p className="text-muted-foreground">Visualize dados e insights de negócio.</p>
                </div>
                 <Button>
                    <File className="mr-2 h-4 w-4" />
                    Exportar PDF
                </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Faturamento Total
                        </CardTitle>
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$45.231,89</div>
                        <p className="text-xs text-muted-foreground">
                        +20.1% em relação ao mês passado
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Tempo Médio de Produção
                        </CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5.2 dias</div>
                        <p className="text-xs text-muted-foreground">
                        -0.5 dias em relação ao mês passado
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Faturamento por Serviço</CardTitle>
                        <CardDescription>Uma visão geral do faturamento por tipo de serviço.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesByProductData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`}/>
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Conversão de Carrinho</CardTitle>
                         <CardDescription>Taxa de pedidos finalizados vs. carrinhos abandonados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p>Gráfico de conversão em breve...</p>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
