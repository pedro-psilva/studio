 'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Minus, ShoppingCart as ShoppingCartIcon, ArrowRight, FileText, Edit, CircleDot } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { getCart, setCart, updateCartItems, CartItemFirestore } from '@/lib/cartService';
import { createOrderFromCart, OrderItemFirestore } from '@/lib/orderService';
import { Badge } from '@/components/ui/badge';
import { getService, type ServiceDocument } from '@/lib/serviceService';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';

type CartItemWithService = CartItemFirestore & {
  uniqueId: string;
  service: ServiceDocument;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemWithService[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<{ cep?: string; number?: string; complement?: string } | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    type: 'percent' | 'fixed' | 'free_shipping';
    value: number;
    active: boolean;
    maxUses?: number | null;
    usedCount?: number;
    validFrom?: Date | null;
    validUntil?: Date | null;
  } | null>(null);
  const { t, formatCurrency } = useTranslation('common');
  const { user } = useAuth();
  const router = useRouter();

  const handleEditCase = (item: CartItemWithService) => {
    if (typeof window !== 'undefined') {
      const key = `editCase:${item.productId}:${item.uniqueId}`;
      const payload = {
        productId: item.productId,
        quantity: item.quantity,
        selectedTeeth: item.teeth ?? [],
        selectedColor: item.shade ?? null,
        patientName: item.patientName ?? '',
        stlFileUrl: item.stlFileUrl ?? null,
      };

      try {
        window.localStorage.setItem(key, JSON.stringify(payload));
        window.sessionStorage.setItem('editCaseKey', key);
      } catch (e) {
        console.error('Erro ao preparar edição de caso:', e);
      }
    }

    router.push(`/products/${item.productId}?editCase=1`);
  };

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
          const originalItems = cart.items;
          const itemsWithService: CartItemWithService[] = (
            await Promise.all(
              cart.items.map(async (item, index) => {
                try {
                  const service = await getService(item.productId);
                  if (!service) return null;
                  return {
                    ...item,
                    uniqueId: `${item.productId}-${index}`,
                    service,
                  } as CartItemWithService;
                } catch (e) {
                  console.error('Erro ao carregar serviço para item do carrinho:', e);
                  return null;
                }
              })
            )
          ).filter(Boolean) as CartItemWithService[];

          setCartItems(itemsWithService);

          if (itemsWithService.length !== originalItems.length) {
            const cleanedItems: CartItemFirestore[] = itemsWithService.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              material: item.material,
              shade: item.shade,
              teeth: item.teeth,
              implantSystem: item.implantSystem,
              stlFileUrl: item.stlFileUrl,
              patientName: item.patientName,
            }));

            try {
              await updateCartItems(user.uid, cleanedItems);
            } catch (e) {
              console.error('Erro ao limpar itens inválidos do carrinho:', e);
            }
          }
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

  useEffect(() => {
    const loadUserDataForPayment = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data() as { phone?: string };
          if (data.phone) setUserPhone(data.phone);
        }

        const addrCol = collection(db, `users/${user.uid}/addresses`);
        const addrSnap = await getDocs(addrCol);
        if (!addrSnap.empty) {
          const all = addrSnap.docs.map((d) => d.data() as any);
          const main = all.find((a) => a.isPrincipal) ?? all[0];
          setUserAddress({
            cep: main.cep,
            number: main.numero ?? main.number,
            complement: main.complemento ?? main.complement,
          });
        }
      } catch (e) {
        console.error('Erro ao carregar dados do usuário para pagamento:', e);
      }
    };

    loadUserDataForPayment();
  }, [user]);

  const syncCartToFirestore = async (items: CartItemWithService[]) => {
    if (!user) return;

    const firestoreItems: CartItemFirestore[] = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      material: item.material,
      shade: item.shade,
      teeth: item.teeth,
      implantSystem: item.implantSystem,
      stlFileUrl: item.stlFileUrl,
      patientName: item.patientName,
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

  const updateQuantity = (uniqueId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedItems = cartItems.map((item) =>
      item.uniqueId === uniqueId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    syncCartToFirestore(updatedItems);
  };

  const removeItem = (uniqueId: string) => {
    const updatedItems = cartItems.filter((item) => item.uniqueId !== uniqueId);
    setCartItems(updatedItems);
    syncCartToFirestore(updatedItems);
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.service.precoBase ?? 0) * item.quantity,
    0
  );
  const shipping = 0;

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.type === 'percent') {
      const percent = Math.max(0, Math.min(appliedCoupon.value, 100));
      return (subtotal * percent) / 100;
    }

    if (appliedCoupon.type === 'fixed') {
      const v = Math.max(0, appliedCoupon.value);
      return Math.min(v, subtotal);
    }

    // free_shipping não altera subtotal; frete tratado separadamente
    return 0;
  }, [appliedCoupon, subtotal]);

  const finalShipping = useMemo(() => {
    if (appliedCoupon?.type === 'free_shipping') return 0;
    return shipping;
  }, [appliedCoupon, shipping]);

  const total = useMemo(() => {
    const base = subtotal - discount + finalShipping;
    return base < 0 ? 0 : base;
  }, [subtotal, discount, finalShipping]);

  const handleApplyCoupon = async () => {
    const raw = couponCode.trim();
    if (!raw) {
      setCouponError('Informe um código de cupom.');
      setAppliedCoupon(null);
      return;
    }

    setApplyingCoupon(true);
    setCouponError(null);

    try {
      const normalized = raw.toUpperCase();
      const col = collection(db, 'coupons');
      const q = query(col, where('code', '==', normalized), limit(1));
      const snap = await getDocs(q);

      if (snap.empty) {
        setAppliedCoupon(null);
        setCouponError('Cupom não encontrado.');
        return;
      }

      const docSnap = snap.docs[0];
      const data = docSnap.data() as any;

      if (!data.active) {
        setAppliedCoupon(null);
        setCouponError('Este cupom está inativo.');
        return;
      }

      const now = new Date();
      const validFrom: Date | null = data.validFrom?.toDate?.() ?? null;
      const validUntil: Date | null = data.validUntil?.toDate?.() ?? null;

      if (validFrom && now < validFrom) {
        setAppliedCoupon(null);
        setCouponError('Este cupom ainda não está válido.');
        return;
      }

      if (validUntil && now > validUntil) {
        setAppliedCoupon(null);
        setCouponError('Este cupom está expirado.');
        return;
      }

      if (data.maxUses != null && typeof data.usedCount === 'number') {
        if (data.usedCount >= data.maxUses) {
          setAppliedCoupon(null);
          setCouponError('Este cupom já atingiu o número máximo de usos.');
          return;
        }
      }

      const type: 'percent' | 'fixed' | 'free_shipping' =
        data.type === 'fixed'
          ? 'fixed'
          : data.type === 'free_shipping'
          ? 'free_shipping'
          : 'percent';

      setAppliedCoupon({
        id: docSnap.id,
        code: data.code,
        type,
        value: typeof data.value === 'number' ? data.value : 0,
        active: !!data.active,
        maxUses: data.maxUses ?? null,
        usedCount: data.usedCount ?? 0,
        validFrom,
        validUntil,
      });
      setCouponError(null);
      setCouponCode(normalized);
    } catch (e) {
      console.error('Erro ao aplicar cupom:', e);
      setAppliedCoupon(null);
      setCouponError('Não foi possível validar o cupom. Tente novamente.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      const returnUrl = '/cart';
      router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (cartItems.length === 0) return;

    const orderItems: OrderItemFirestore[] = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      shade: item.shade,
      material: item.material,
      implantSystem: item.implantSystem,
      stlFileUrl: item.stlFileUrl,
      teeth: item.teeth,
      patientName: item.patientName,
    }));

    const infinitepayItems = cartItems.map((item) => ({
      quantity: item.quantity,
      price: Math.round((item.service.precoBase ?? 0) * 100),
      description: item.service.nome,
    }));

    const customer = {
      name: user?.displayName ?? user?.email ?? undefined,
      email: user?.email ?? undefined,
      phone_number: userPhone ?? undefined,
    };

    try {
      const order = await createOrderFromCart({
        userId: user.uid,
        items: orderItems,
        subtotal,
        shipping,
      });

      await setCart(user.uid, []);
      setCartItems([]);
      try {
        const response = await fetch('/api/payments/infinitepay/create-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId: order.id, total, items: infinitepayItems, customer, address: userAddress }),
        });

        if (!response.ok) {
          console.error('Falha ao criar link de pagamento InfinitePay');
          router.push(`/checkout/${order.id}`);
          return;
        }

        const data = (await response.json()) as { url?: string };

        if (!data.url) {
          console.error('Resposta inválida ao criar link de pagamento InfinitePay');
          router.push(`/checkout/${order.id}`);
          return;
        }

        window.location.href = data.url;
      } catch (err) {
        console.error('Erro ao integrar com InfinitePay:', err);
        router.push(`/checkout/${order.id}`);
      }
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
                {cartItems.map((item) => {
                  const isCustom = Array.isArray(item.service.arquivosNecessarios) && item.service.arquivosNecessarios.length > 0;

                  return (
                    <Card key={item.uniqueId} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-start gap-4 p-4">
                        {item.service.imagemUrl && (
                          <Image
                            src={item.service.imagemUrl}
                            alt={item.service.nome}
                            width={120}
                            height={120}
                            className="w-full sm:w-32 h-32 sm:h-auto aspect-square rounded-md object-cover"
                          />
                        )}
                        <div className="flex-1 w-full">
                          <Link href={`/products/${item.productId}`} className="font-semibold hover:underline">
                            {item.service.nome}
                          </Link>
                          {item.patientName && <p className="text-sm font-medium text-primary">Paciente: {item.patientName}</p>}
                          <p className="text-sm text-muted-foreground">{formatCurrency(item.service.precoBase)}</p>
                           <div className="flex items-center justify-between mt-4">
                             <div className="flex items-center border rounded-md">
                               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)} disabled={isCustom}>
                                 <Minus className="h-4 w-4" />
                               </Button>
                               <Input type="number" value={item.quantity} readOnly className="h-8 w-12 border-0 text-center" />
                               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)} disabled={isCustom}>
                                 <Plus className="h-4 w-4" />
                               </Button>
                             </div>
                              <Button variant="ghost" size="icon" onClick={() => removeItem(item.uniqueId)}>
                                <X className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                              </Button>
                           </div>
                        </div>
                         <p className="text-lg font-bold w-full sm:w-auto text-right">{formatCurrency(item.service.precoBase * item.quantity)}</p>
                      </div>
                      
                      {/* Customization Details */}
                      {isCustom && (
                        <div className="bg-muted/50 px-4 py-3 border-t">
                           <h4 className="text-sm font-semibold mb-3">Detalhes do Caso Clínico:</h4>
                           <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground mb-4'>
                            {item.teeth && item.teeth.length > 0 && <div><strong>Dentes:</strong> {item.teeth.join(', ')}</div>}
                            {item.shade && <div><strong>Cor:</strong> <Badge variant="secondary">{item.shade}</Badge></div>}
                            {item.stlFileUrl && <div className="flex items-center gap-1 col-span-2"><strong>Arquivo:</strong> <FileText className="h-3 w-3"/> {item.stlFileUrl}</div>}
                           </div>
                           
                           <div className="flex gap-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleEditCase(item)}
                             >
                               <Edit className="mr-2 h-4 w-4" /> Editar Caso
                             </Button>
                           </div>
                        </div>
                      )}

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
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Código do cupom"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              disabled={applyingCoupon || cartItems.length === 0}
                              onClick={handleApplyCoupon}
                            >
                              {applyingCoupon ? 'Aplicando...' : 'Aplicar'}
                            </Button>
                          </div>
                          {couponError && (
                            <p className="text-xs text-destructive">{couponError}</p>
                          )}
                          {appliedCoupon && !couponError && (
                            <p className="text-xs text-emerald-600">
                              Cupom {appliedCoupon.code} aplicado.
                            </p>
                          )}
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-sm text-emerald-700">
                            <span>Desconto</span>
                            <span>-{formatCurrency(discount)}</span>
                          </div>
                        )}
                         <div className="flex justify-between">
                            <span>Frete</span>
                            <span>{formatCurrency(finalShipping)}</span>
                         </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
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
