
 'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useAuth } from '@/context/AuthContext';
import { getCart, setCart, updateCartItems, CartItemFirestore } from '@/lib/cartService';
import { createOrderFromCart, OrderItemFirestore } from '@/lib/orderService';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setCartItems([]);
        setLoadingCart(false);
        return;
      }

      try {
        const cart = await getCart(user.uid);

        if (!cart || !cart.items || cart.items.length === 0) {
          setCartItems([]);
        } else {
          const itemsWithProduct = cart.items
            .map((item: CartItemFirestore) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;
              return {
                ...product,
                quantity: item.quantity,
                material: item.material,
                shade: item.shade,
                teeth: item.teeth,
                implantSystem: item.implantSystem,
                stlFileUrl: item.stlFileUrl,
              };
            })
            .filter(Boolean) as any[];

          setCartItems(itemsWithProduct);
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        setCartItems([]);
      } finally {
        setLoadingCart(false);
      }
    };

    loadCart();
  }, [user]);

  const syncCartToFirestore = async (items: any[]) => {
    if (!user) return;

    const firestoreItems: CartItemFirestore[] = items.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      material: item.material,
      shade: item.shade,
      teeth: item.teeth,
      implantSystem: item.implantSystem,
      stlFileUrl: item.stlFileUrl,
    }));

    try {
      const existingCart = await getCart(user.uid);
      if (!existingCart) {
        await setCart(user.uid, firestoreItems);
      } else {
        await updateCartItems(user.uid, firestoreItems);
      }
    } catch (error) {
      console.error('Erro ao sincronizar carrinho:', error);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedItems = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    syncCartToFirestore(updatedItems);
  };

  const removeItem = (productId: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== productId);
    setCartItems(updatedItems);
    syncCartToFirestore(updatedItems);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 15.00 : 0;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (cartItems.length === 0) return;

    const orderItems: OrderItemFirestore[] = cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      shade: item.shade,
      material: item.material,
      implantSystem: item.implantSystem,
      stlFileUrl: item.stlFileUrl,
    }));

    try {
      const order = await createOrderFromCart({
        userId: user.uid,
        items: orderItems,
        subtotal,
        shipping,
      });

      await setCart(user.uid, []);
      setCartItems([]);

      router.push(`/checkout/${order.id}`);
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mb-8">
             <h1 className="text-3xl md:text-4xl font-bold font-headline">Seu Carrinho</h1>
             <p className="text-muted-foreground mt-2">Revise os itens e prossiga para a finalização da compra.</p>
          </div>

          {loadingCart ? (
            <div className="text-center bg-card p-12 rounded-lg border border-dashed">
              <p className="text-muted-foreground">Carregando seu carrinho...</p>
            </div>
          ) : (

          cartItems.length === 0 ? (
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
                {cartItems.map((item, index) => {
                  const productImage = PlaceHolderImages.find(p => p.id === item.imageId);
                  return (
                    <Card key={`${item.id}-${index}`} className="flex flex-col sm:flex-row items-center p-4 gap-4">
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
                         <Button size="lg" className="w-full mt-4" onClick={handleCheckout}>
                            Finalizar Compra <ArrowRight className="ml-2 h-4 w-4"/>
                         </Button>
                    </CardContent>
                 </Card>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
