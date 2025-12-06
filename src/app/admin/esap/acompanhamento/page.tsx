'use client';
import { useState } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const metaData = {
    nome: 'Aumentar faturamento em 20%',
    valor_meta: 50000,
    status: 'em andamento'
};

const initialResultados = [
  { id: 'r1', data_registro: '2024-07-01', valor_real: 42000, crescimento: -16.00, observacao: 'Início do trimestre, vendas sazonais baixas.' },
  { id: 'r2', data_registro: '2024-07-15', valor_real: 48000, crescimento: -4.00, observacao: 'Aumento após campanha de e-mail.' },
  { id: 'r3', data_registro: '2024-07-30', valor_real: 51500, crescimento: 3.00, observacao: 'Meta batida no final do mês.' },
];

export default function AcompanhamentoPage() {
    const [isAddingResult, setIsAddingResult] = useState(false);
    const [resultados, setResultados] = useState(initialResultados);
    const [newResult, setNewResult] = useState({ valor_real: '', observacao: '' });
    const { toast } = useToast();

    const chartData = resultados.map(r => ({
      date: new Date(r.data_registro).toLocaleDateString('pt-BR'),
      'Valor Real': r.valor_real,
      'Valor Meta': metaData.valor_meta
    })).sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime());

    const handleAddResult = () => {
        if (!newResult.valor_real) {
            toast({
                title: "Campo obrigatório",
                description: "O valor real precisa ser preenchido.",
                variant: "destructive",
            });
            return;
        }

        const valorRealNum = parseFloat(newResult.valor_real);
        const ultimoResultado = resultados.length > 0 ? resultados[resultados.length - 1].valor_real : metaData.valor_meta;
        const crescimento = ((valorRealNum - ultimoResultado) / ultimoResultado) * 100;
        
        const newEntry = {
            id: `r${resultados.length + 1}`,
            data_registro: new Date().toISOString().split('T')[0],
            valor_real: valorRealNum,
            crescimento: crescimento,
            observacao: newResult.observacao || 'N/A'
        };

        setResultados([...resultados, newEntry]);
        setIsAddingResult(false);
        setNewResult({ valor_real: '', observacao: '' });

        toast({
            title: "Resultado adicionado!",
            description: "O novo registro de acompanhamento foi salvo com sucesso.",
        });
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Acompanhamento de Resultados</h1>
                    <p className="text-muted-foreground">Insira e visualize o progresso de uma meta específica.</p>
                </div>
                <div className="ml-auto">
                    {!isAddingResult && (
                         <Button onClick={() => setIsAddingResult(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Resultado
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                             <CardTitle className="text-2xl">Meta: {metaData.nome}</CardTitle>
                             <CardDescription>
                                Valor da Meta: {metaData.valor_meta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                             </CardDescription>
                        </div>
                        <Badge variant="default">{metaData.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {isAddingResult && (
                        <Card className="mb-6 bg-muted/50">
                            <CardHeader>
                                <CardTitle>Adicionar Novo Resultado</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="valor_real">Valor Real</Label>
                                    <Input 
                                      id="valor_real" 
                                      type="number" 
                                      placeholder="Ex: 52000" 
                                      value={newResult.valor_real}
                                      onChange={(e) => setNewResult(prev => ({...prev, valor_real: e.target.value}))}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="observacao">Observação</Label>
                                    <Input 
                                      id="observacao" 
                                      placeholder="Algum comentário sobre o resultado" 
                                      value={newResult.observacao}
                                      onChange={(e) => setNewResult(prev => ({...prev, observacao: e.target.value}))}
                                    />
                                </div>
                            </CardContent>
                             <CardContent className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsAddingResult(false)}>Cancelar</Button>
                                <Button onClick={handleAddResult}>Salvar Resultado</Button>
                            </CardContent>
                        </Card>
                    )}
                    
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-2">Gráfico: Meta vs. Real</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                                <Legend />
                                <Line type="monotone" dataKey="Valor Meta" stroke="#E65959" strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="Valor Real" stroke="#24C39E" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Histórico de Resultados</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data do Registro</TableHead>
                                    <TableHead>Valor Real</TableHead>
                                    <TableHead>Crescimento (%)</TableHead>
                                    <TableHead>Observação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {resultados.sort((a, b) => new Date(b.data_registro).getTime() - new Date(a.data_registro).getTime()).map((res) => (
                                    <TableRow key={res.id}>
                                        <TableCell>{new Date(res.data_registro).toLocaleDateString('pt-BR')}</TableCell>
                                        <TableCell className="font-semibold">{res.valor_real.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                        <TableCell>
                                            <div className={`flex items-center font-semibold ${res.crescimento >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {res.crescimento >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                                                {res.crescimento.toFixed(2)}%
                                            </div>
                                        </TableCell>
                                        <TableCell>{res.observacao}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
