"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, Clock, ExternalLink, CreditCard, QrCode } from "lucide-react";
import { getOrder, type OrderDocument } from "@/lib/orderService";
import { useTranslation } from "@/hooks/use-translation";
import { Badge } from "@/components/ui/badge";

export default function CheckoutOrderPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orderId } = params as { orderId: string };
  const { formatCurrency } = useTranslation('common');

  const [order, setOrder] = useState<OrderDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'paid' | 'failed'>('pending');

  // Parâmetros retornados pela InfinitePay após pagamento
  const receiptUrl = searchParams.get('receipt_url');
  const transactionNsu = searchParams.get('transaction_nsu');
  const slug = searchParams.get('slug');
  const captureMethod = searchParams.get('capture_method');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrder(orderId);
        setOrder(data);

        // Se já tem status de aprovado, não precisa verificar
        if (data?.paymentStatus === 'approved') {
          setPaymentStatus('paid');
        }
      } catch (error) {
        console.error("Erro ao carregar pedido:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // Verificar status do pagamento se temos os parâmetros necessários
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!transactionNsu || !slug || !orderId || paymentStatus === 'paid') {
        return;
      }

      setPaymentStatus('checking');

      try {
        const response = await fetch('/api/payments/infinitepay/payment-check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderNsu: orderId,
            transactionNsu,
            slug,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.paid) {
            setPaymentStatus('paid');
            // Recarrega o pedido para pegar status atualizado
            const updatedOrder = await getOrder(orderId);
            setOrder(updatedOrder);
          } else {
            setPaymentStatus('pending');
          }
        } else {
          setPaymentStatus('failed');
        }
      } catch (error) {
        console.error('Erro ao verificar status de pagamento:', error);
        setPaymentStatus('failed');
      }
    };

    // Aguarda 2 segundos antes de verificar (permite webhook processar primeiro)
    const timer = setTimeout(checkPaymentStatus, 2000);
    return () => clearTimeout(timer);
  }, [transactionNsu, slug, orderId, paymentStatus]);

  const getCaptureMethodIcon = () => {
    if (captureMethod === 'pix') return <QrCode className="h-5 w-5" />;
    if (captureMethod === 'credit_card') return <CreditCard className="h-5 w-5" />;
    return null;
  };

  const getCaptureMethodLabel = () => {
    if (captureMethod === 'pix') return 'PIX';
    if (captureMethod === 'credit_card') return 'Cartão de Crédito';
    return 'Pagamento';
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-12 md:py-16 flex justify-center">
          <Card className="max-w-xl w-full">
            <CardHeader className="text-center">
              <Button
                variant="ghost"
                className="absolute left-4 top-4 flex items-center gap-2"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>

              {paymentStatus === 'paid' && <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />}
              {paymentStatus === 'checking' && <Clock className="mx-auto h-12 w-12 text-yellow-500 animate-pulse" />}
              {paymentStatus === 'pending' && <Clock className="mx-auto h-12 w-12 text-blue-500" />}

              <CardTitle className="mt-4 text-2xl font-bold">
                {paymentStatus === 'paid' && 'Pagamento confirmado!'}
                {paymentStatus === 'checking' && 'Verificando pagamento...'}
                {paymentStatus === 'pending' && 'Pedido criado com sucesso'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              {loading && <p className="text-muted-foreground">Carregando detalhes do pedido...</p>}
              {!loading && !order && (
                <p className="text-muted-foreground">Pedido não encontrado.</p>
              )}
              {!loading && order && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      Número do pedido: <span className="font-semibold">{order.id}</span>
                    </p>
                    <p className="text-lg font-bold">
                      Total: {formatCurrency(order.total)}
                    </p>

                    {/* Status do pagamento */}
                    <div className="flex justify-center items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      {paymentStatus === 'paid' && (
                        <Badge variant="default" className="bg-green-600">Pago</Badge>
                      )}
                      {paymentStatus === 'checking' && (
                        <Badge variant="secondary">Verificando...</Badge>
                      )}
                      {paymentStatus === 'pending' && (
                        <Badge variant="outline">Aguardando Pagamento</Badge>
                      )}
                    </div>

                    {/* Método de pagamento */}
                    {captureMethod && (
                      <div className="flex justify-center items-center gap-2 pt-2">
                        {getCaptureMethodIcon()}
                        <span className="text-sm font-medium">{getCaptureMethodLabel()}</span>
                      </div>
                    )}

                    {/* Link para comprovante */}
                    {receiptUrl && paymentStatus === 'paid' && (
                      <div className="pt-2">
                        <Button asChild variant="outline" size="sm">
                          <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                            Ver Comprovante <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Mensagem informativa */}
                  {paymentStatus === 'pending' && (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                      Seu pedido foi criado! Complete o pagamento para que possamos processar sua solicitação.
                    </p>
                  )}
                  {paymentStatus === 'paid' && (
                    <p className="text-sm text-green-700 bg-green-50 p-3 rounded-md">
                      Pagamento confirmado! Você receberá um email com os detalhes do seu pedido.
                    </p>
                  )}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Button asChild variant="outline">
                  <Link href="/products">Continuar comprando</Link>
                </Button>
                <Button asChild>
                  <Link href="/account">Ver meus pedidos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
