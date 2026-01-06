'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { getOrder, OrderDocument, updateOrderPayment } from '@/lib/orderService';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getService } from '@/lib/serviceService';
import { useToast } from '@/hooks/use-toast';

interface UserInfo {
  displayName?: string;
  email?: string;
  clinicName?: string;
  cpfCnpj?: string;
  phone?: string;
}

function getOrderStatusLabel(status: OrderDocument['status']): string {
  switch (status) {
    case 'pending_payment':
      return 'Pagamento pendente';
    case 'paid':
      return 'Pago';
    case 'in_production':
      return 'Em produção';
    case 'shipped':
      return 'Enviado';
    case 'delivered':
      return 'Entregue';
    case 'canceled':
      return 'Cancelado';
    default:
      return status;
  }
}

function getPaymentStatusLabel(status: OrderDocument['paymentStatus']): string {
  switch (status) {
    case 'waiting':
      return 'Aguardando pagamento';
    case 'approved':
      return 'Aprovado';
    case 'refused':
      return 'Recusado';
    case 'refunded':
      return 'Estornado';
    case null:
    default:
      return 'N/A';
  }
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const { toast } = useToast();

  const [order, setOrder] = useState<OrderDocument | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({});
  const [isMarkingAsPaid, setIsMarkingAsPaid] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        const orderData = await getOrder(id);
        if (!orderData) {
          setError('Pedido não encontrado.');
          setOrder(null);
          return;
        }

        setOrder(orderData);

        // carrega nomes de serviços para cada productId distinto
        const productIds = Array.from(
          new Set(orderData.items?.map((item) => item.productId).filter(Boolean) as string[])
        );

        if (productIds.length > 0) {
          const entries = await Promise.all(
            productIds.map(async (pid) => {
              try {
                const service = await getService(pid);
                return [
                  pid,
                  service?.nome ?? 'Serviço não especificado',
                ] as [string, string];
              } catch {
                return [pid, 'Serviço não especificado'] as [string, string];
              }
            })
          );
          setServiceNames(Object.fromEntries(entries));
        }

        // carrega dados básicos do cliente
        if (orderData.userId) {
          try {
            const userRef = doc(db, 'users', orderData.userId);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
              const data = snap.data() as any;
              setUserInfo({
                displayName: data.displayName,
                email: data.email,
                clinicName: data.clinicName,
                cpfCnpj: data.cpfCnpj,
                phone: data.phone,
              });
            }
          } catch (e) {
            // ignora erro individual de usuário
          }
        }
      } catch (err) {
        console.error('Erro ao carregar pedido:', err);
        setError('Não foi possível carregar os dados do pedido.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleMarkAsPaid = async () => {
    if (!order || isMarkingAsPaid) return;

    setIsMarkingAsPaid(true);
    try {
      // Atualiza diretamente no Firestore
      await updateOrderPayment(order.id, 'approved');

      // Atualiza o estado local
      setOrder((prev) =>
        prev
          ? {
            ...prev,
            paymentStatus: 'approved',
            status: 'paid',
          }
          : prev
      );

      toast({
        title: 'Pagamento confirmado',
        description: 'O status do pedido foi atualizado com sucesso.',
      });
    } catch (err) {
      console.error('Erro ao marcar como pago:', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: 'Não foi possível marcar o pedido como pago.',
      });
    } finally {
      setIsMarkingAsPaid(false);
    }
  };

  const totalItems = order?.items?.length ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-10 max-w-5xl space-y-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="mr-1"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold font-headline">Detalhes do Pedido</h1>
              {order && (
                <p className="text-sm text-muted-foreground">
                  Pedido <span className="font-mono font-medium">#{order.id}</span>
                </p>
              )}
            </div>
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground">Carregando detalhes do pedido...</p>
          )}

          {!loading && error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {!loading && !error && order && (
            <>
              {/* Resumo do pedido */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo</CardTitle>
                  <CardDescription>
                    Visão geral dos valores e do status deste pedido.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status do pedido</p>
                    <Badge variant="outline">{getOrderStatusLabel(order.status)}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status do pagamento</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{getPaymentStatusLabel(order.paymentStatus)}</p>
                      {order.paymentStatus === 'waiting' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleMarkAsPaid}
                          disabled={isMarkingAsPaid}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {isMarkingAsPaid ? 'Marcando...' : 'Marcar como Pago'}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Itens</p>
                    <p className="text-sm font-medium">{totalItems}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="text-sm font-medium">
                      {order.subtotal.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Frete</p>
                    <p className="text-sm font-medium">
                      {order.shipping.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">
                      {order.total.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle>Cliente</CardTitle>
                  <CardDescription>Dados básicos do cliente associado ao pedido.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm font-medium">
                    {userInfo?.displayName || userInfo?.clinicName || userInfo?.email || order.userId}
                  </p>
                  {userInfo?.email && (
                    <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                  )}
                  <div className="grid gap-4 md:grid-cols-2 mt-2">
                    {userInfo?.cpfCnpj && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">CPF/CNPJ</p>
                        <p className="text-sm font-medium">{userInfo.cpfCnpj}</p>
                      </div>
                    )}
                    {userInfo?.phone && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Telefone</p>
                        <p className="text-sm font-medium">{userInfo.phone}</p>
                      </div>
                    )}
                    {userInfo?.clinicName && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-xs text-muted-foreground">Clínica</p>
                        <p className="text-sm font-medium">{userInfo.clinicName}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Itens e personalização */}
              <Card>
                <CardHeader>
                  <CardTitle>Itens e Personalização</CardTitle>
                  <CardDescription>
                    Produtos escolhidos, paciente, dentes, material e outras informações clínicas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {order.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum item registrado neste pedido.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Serviço</TableHead>
                          <TableHead>Qtd</TableHead>
                          <TableHead>Paciente</TableHead>
                          <TableHead className="hidden md:table-cell">Dentes</TableHead>
                          <TableHead className="hidden md:table-cell">Material / Sistema</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {serviceNames[item.productId] || 'Serviço não especificado'}
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.patientName || '-'}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {item.teeth && item.teeth.length > 0
                                ? item.teeth.join(', ')
                                : '-'}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {[item.material, item.implantSystem]
                                .filter(Boolean)
                                .join(' / ') || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
