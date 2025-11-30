
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { products } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { X, Plus, Minus, ShoppingCart as ShoppingCartIcon, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock cart data - using products from data.ts
const initialCartItems = [
  {
    ...products[0], // Zirconia Crown
    quantity: 2,
  },
  {
    ...products[1], // E-Max Veneer
    quantity: 1,
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const { t } = useTranslation('common');

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(
      cartItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.id !== productId));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 15.00 : 0;
  const total = subtotal + shipping;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mb-8">
             <h1 className="text-3xl md:text-4xl font-bold font-headline">Seu Carrinho</h1>
             <p className="text-muted-foreground mt-2">Revise os itens e prossiga para a finalização da compra.</p>
          </div>

          {cartItems.length === 0 ? (
             <div className="text-center bg-card p-12 rounded-lg border border-dashed">
                <ShoppingCartIcon className="mx-auto h-16 w-16 text-muted-foreground" />
                <h2 className="mt-6 text-2xl font-semibold">Seu carrinho está vazio</h2>
                <p className="mt-2 text-muted-foreground">Parece que você ainda não adicionou nenhum produto.</p>
                <Button asChild className="mt-6">
                  <Link href="/products">Explorar Produtos</Link>
                </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item) => {
                  const productImage = PlaceHolderImages.find(p => p.id === item.imageId);
                  return (
                    <Card key={item.id} className="flex flex-col sm:flex-row items-center p-4 gap-4">
                      {productImage && (
                          <Image
                            src={productImage.imageUrl}
                            alt={item.name}
                            width={120}
                            height={120}
                            className="w-full sm:w-32 h-32 sm:h-auto aspect-square rounded-md object-cover"
                          />
                      )}
                      <div className="flex-1 w-full">
                        <Link href={`/products/${item.id}`} className="font-semibold hover:underline">{item.name}</Link>
                        <p className="text-sm text-muted-foreground">R$ {item.price.toFixed(2)}</p>
                         <div className="flex items-center justify-between mt-4">
                           <div className="flex items-center border rounded-md">
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                               <Minus className="h-4 w-4" />
                             </Button>
                             <Input type="number" value={item.quantity} readOnly className="h-8 w-12 border-0 text-center" />
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                               <Plus className="h-4 w-4" />
                             </Button>
                           </div>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                              <X className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                            </Button>
                         </div>
                      </div>
                       <p className="text-lg font-bold w-full sm:w-auto text-right">R$ {(item.price * item.quantity).toFixed(2)}</p>
                    </Card>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                 <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle>Resumo do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>R$ {subtotal.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span>Frete</span>
                            <span>R$ {shipping.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>R$ {total.toFixed(2)}</span>
                        </div>
                         <Button size="lg" className="w-full mt-4">
                            Finalizar Compra <ArrowRight className="ml-2 h-4 w-4"/>
                         </Button>
                    </CardContent>
                 </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
