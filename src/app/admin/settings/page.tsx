'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";

export default function SettingsPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="grid gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                    <p className="text-muted-foreground">
                        Gerencie as configurações da plataforma e integrações.
                    </p>
                </div>
                <Tabs defaultValue="system">
                    <TabsList className="mb-4">
                        <TabsTrigger value="system">Sistema</TabsTrigger>
                        <TabsTrigger value="payment">Pagamentos</TabsTrigger>
                        <TabsTrigger value="production">Produção</TabsTrigger>
                        <TabsTrigger value="integrations">Integrações</TabsTrigger>
                        <TabsTrigger value="permissions">Permissões</TabsTrigger>
                        <TabsTrigger value="security">Segurança</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="system">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configurações do Sistema</CardTitle>
                                <CardDescription>Gerencie informações da empresa e aparência do painel.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="company-name">Nome da Empresa</Label>
                                        <Input id="company-name" defaultValue="Itlab" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company-email">E-mail Oficial</Label>
                                        <Input id="company-email" type="email" defaultValue="contato@itlab.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company-whatsapp">WhatsApp</Label>
                                        <Input id="company-whatsapp" type="tel" defaultValue="+55 (11) 99999-8888" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cor do Tema (Primária)</Label>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-md bg-primary border border-border" />
                                            <Input defaultValue="hsl(51, 100%, 50%)" className="w-48" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                     <Label>Logo da Empresa</Label>
                                     <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-md border flex items-center justify-center bg-muted">
                                            <p className="text-xs text-muted-foreground">Logo</p>
                                        </div>
                                        <Button variant="outline">
                                            <Upload className="mr-2 h-4 w-4"/>
                                            Alterar Logo
                                        </Button>
                                     </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payment">
                         <Card>
                            <CardHeader>
                                <CardTitle>Gateway de Pagamento</CardTitle>
                                <CardDescription>Configure a integração com seu provedor de pagamentos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="api-key">API Key</Label>
                                    <Input id="api-key" type="password" defaultValue="pk_live_xxxxxxxxxxxxxx" />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="webhook-url">URL de Webhook</Label>
                                    <Input id="webhook-url" readOnly defaultValue="https://itlab.com/api/webhooks/payment" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="test-mode" />
                                    <Label htmlFor="test-mode">Habilitar Modo de Teste</Label>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="production">
                         <Card>
                            <CardHeader>
                                <CardTitle>Configurações de Produção</CardTitle>
                                <CardDescription>Defina prazos e taxas para os pedidos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                 <div className="space-y-2">
                                    <Label htmlFor="default-deadline">Prazo Padrão (dias úteis)</Label>
                                    <Input id="default-deadline" type="number" defaultValue="7" className="w-48"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="urgency-fee">Taxa de Urgência (%)</Label>
                                    <Input id="urgency-fee" type="number" defaultValue="15" className="w-48"/>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="integrations">
                         <Card>
                            <CardHeader>
                                <CardTitle>Integrações</CardTitle>
                                <CardDescription>Conecte a plataforma com serviços externos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                 <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-semibold">WhatsApp API</h3>
                                        <p className="text-sm text-muted-foreground">Envie notificações automáticas.</p>
                                    </div>
                                    <Button variant="outline">Configurar</Button>
                                 </div>
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-semibold">Google Drive</h3>
                                        <p className="text-sm text-muted-foreground">Faça backup automático dos arquivos STL.</p>
                                    </div>
                                    <Button variant="outline" disabled>Em breve</Button>
                                 </div>
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-semibold">ERP</h3>
                                        <p className="text-sm text-muted-foreground">Sincronize pedidos e faturas.</p>
                                    </div>
                                    <Button variant="outline" disabled>Em breve</Button>
                                 </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                     <TabsContent value="permissions">
                         <Card>
                            <CardHeader>
                                <CardTitle>Usuários e Permissões</CardTitle>
                                <CardDescription>Gerencie os acessos da sua equipe interna.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex justify-end">
                                    <Button>Adicionar Usuário Interno</Button>
                                </div>
                                <div className="border rounded-lg p-4">
                                     <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">financeiro@itlab.com</p>
                                            <p className="text-sm text-muted-foreground">Função: Financeiro</p>
                                        </div>
                                        <Select defaultValue="finance">
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Definir papel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin Master</SelectItem>
                                                <SelectItem value="production">Produção</SelectItem>
                                                <SelectItem value="finance">Financeiro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                     </div>
                                </div>
                                 <div className="border rounded-lg p-4">
                                     <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">producao@itlab.com</p>
                                            <p className="text-sm text-muted-foreground">Função: Produção</p>
                                        </div>
                                         <Select defaultValue="production">
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Definir papel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin Master</SelectItem>
                                                <SelectItem value="production">Produção</SelectItem>
                                                <SelectItem value="finance">Financeiro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                     </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                         <Card>
                            <CardHeader>
                                <CardTitle>Segurança</CardTitle>
                                <CardDescription>Logs de acesso, erros e configurações de segurança.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-semibold">Logs de Acesso</h3>
                                        <p className="text-sm text-muted-foreground">Visualize quem acessou o sistema e quando.</p>
                                    </div>
                                    <Button variant="outline">Ver Logs</Button>
                                 </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-semibold">Logs de Erro</h3>
                                        <p className="text-sm text-muted-foreground">Acompanhe os erros que ocorreram na plataforma.</p>
                                    </div>
                                    <Button variant="outline" >Ver Logs</Button>
                                 </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="upload-limit">Limite de Upload (MB)</Label>
                                    <Input id="upload-limit" type="number" defaultValue="100" className="w-48"/>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </main>
    );
}
