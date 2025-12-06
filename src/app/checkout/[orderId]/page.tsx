"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { getOrder, type OrderDocument } from "@/lib/orderService";
import { useTranslation } from "@/hooks/use-translation";

export default function CheckoutOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { orderId } = params as { orderId: string };
  const { formatCurrency } = useTranslation('common');

  const [order, setOrder] = useState<OrderDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrder(orderId);
        setOrder(data);
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
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <CardTitle className="mt-4 text-2xl font-bold">
                Pedido criado com sucesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              {loading && <p className="text-muted-foreground">Carregando detalhes do pedido...</p>}
              {!loading && !order && (
                <p className="text-muted-foreground">Pedido não encontrado.</p>
              )}
              {!loading && order && (
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Número do pedido: <span className="font-semibold">{order.id}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Status: <span className="font-semibold">{order.status}</span>
                  </p>
                  <p className="text-lg font-bold">
                    Total: {formatCurrency(order.total)}
                  </p>
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
