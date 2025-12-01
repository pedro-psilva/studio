"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-12 md:py-16 flex justify-center">
          <Card className="max-w-xl w-full text-center">
            <CardHeader>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <CardTitle className="mt-4 text-2xl font-bold">
                Pedido criado com sucesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Seu pedido foi registrado e está aguardando o processamento de pagamento.
              </p>
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
