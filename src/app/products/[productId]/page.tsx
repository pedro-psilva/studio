'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { products, categories } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslation } from '@/hooks/use-translation';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { getCart, setCart, updateCartItems, CartItemFirestore } from '@/lib/cartService';

const colorOptions = {
  "VITA CLASSIC": {
    "Tonalidades A": ["A1", "A2", "A3", "A3.5", "A4"],
    "Tonalidades B": ["B1", "B2", "B3", "B4"],
    "Tonalidades C": ["C1", "C2", "C3", "C4"],
    "Tonalidades D": ["D1", "D2", "D3", "D4"],
  },
  "DENTES CLAREADOS": {
    "e.max Cad": ["BL1", "BL2", "BL3", "BL4"],
    "Rosetta": ["W1", "W2", "W3", "W4"],
  },
  "VITA 3D MASTER": {
    "Tonalidades 0": ["0M1", "0M2", "0M3"],
    "Tonalidades 1": ["1M1", "1M2"],
    "Tonalidades 2": ["2L2.5", "2M1", "2M2", "2M3", "2R2.5"],
    "Tonalidades 3": ["3L2.5", "3M1", "3M2", "3M3", "3R1.5", "3R2.5"],
    "Tonalidades 4": ["4L2.5", "4R2.5", "4R1.5", "4M1", "4M2", "4M3"],
    "Tonalidades 5": ["5M1", "5M2", "5M3"],
  }
};


export default function ProductDetailPage() {
  const params = useParams();
  const { productId } = params;
  const { t } = useTranslation('home');
  const router = useRouter();
  const { user } = useAuth();

  const product = products.find((p) => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product?.images[0]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  if (!product) {
    notFound();
  }

  const productImages = product.images
    .map((imageId) => PlaceHolderImages.find((p) => p.id === imageId))
    .filter(Boolean) as any[];

  const mainImage = selectedImage
    ? PlaceHolderImages.find((p) => p.id === selectedImage)
    : productImages[0];
    
  const category = categories.find(c => c.id === product.categoryId);

  const handleNext = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const cartItem: CartItemFirestore = {
      productId: product.id,
      quantity,
      shade: selectedColor || undefined,
    };

    try {
      const existingCart = await getCart(user.uid);
      const items = existingCart?.items ? [...existingCart.items, cartItem] : [cartItem];

      if (!existingCart) {
        await setCart(user.uid, items);
      } else {
        await updateCartItems(user.uid, items);
      }

      router.push('/cart');
    } catch (error) {
      console.error('Erro ao adicionar item ao carrinho:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Image Gallery */}
            <div>
              <div className="mb-4">
                {mainImage && (
                    <Image
                        src={mainImage.imageUrl}
                        alt={product.name}
                        width={800}
                        height={600}
                        className="w-full aspect-square md:aspect-[4/3] rounded-lg object-cover border"
                    />
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.id)}
                    className={`rounded-lg overflow-hidden border-2 ${selectedImage === img.id ? 'border-primary' : 'border-transparent'}`}
                  >
                    <Image
                      src={img.imageUrl}
                      alt={product.name}
                      width={200}
                      height={150}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <Link href="/products" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-2">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Voltar para produtos
                </Link>
                {category && <Badge variant="outline">{t(`categories.${category.id}`)}</Badge>}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">{product.name}</h1>
              <p className="text-sm text-muted-foreground mb-4">Código: {product.code}</p>
              <p className="text-3xl font-bold text-primary mb-6">
                R$ {product.price.toFixed(2)}
              </p>
              
              <p className="text-muted-foreground mb-6">{product.description}</p>

              <Separator className="my-6" />

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full sm:w-auto flex-1">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Comprar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Personalize seu Produto</DialogTitle>
                    <DialogDescription>
                      Passo 1 de 6: Seleção de Cor
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* Step 1: Color Selection */}
                  <div className="py-4">
                    <h3 className="text-lg font-semibold mb-4">SELECIONE A COR DESEJADA</h3>
                    <RadioGroup value={selectedColor || ""} onValueChange={setSelectedColor}>
                      <Accordion type="multiple" className="w-full">
                        {Object.entries(colorOptions).map(([system, subGroups]) => (
                           <AccordionItem value={system} key={system}>
                             <AccordionTrigger className="text-md font-medium">{system}</AccordionTrigger>
                             <AccordionContent>
                              <div className="pl-4">
                               <Accordion type="multiple" className="w-full">
                                {Object.entries(subGroups).map(([groupName, colors]) => (
                                  <AccordionItem value={groupName} key={groupName}>
                                    <AccordionTrigger className="text-sm">{groupName}</AccordionTrigger>
                                    <AccordionContent>
                                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-2">
                                        {colors.map((color) => (
                                          <Label key={color} htmlFor={color} className={`flex items-center justify-center p-3 rounded-md border-2 cursor-pointer transition-colors ${selectedColor === color ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                                            <RadioGroupItem value={color} id={color} className="sr-only" />
                                            <span>{color}</span>
                                          </Label>
                                        ))}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                               </Accordion>
                               </div>
                             </AccordionContent>
                           </AccordionItem>
                        ))}
                      </Accordion>
                    </RadioGroup>
                  </div>

                  <DialogFooter>
                    <Button variant="outline">Cancelar</Button>
                    <Button onClick={handleNext}>Próximo</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {product.requiresStl && (
                  <Badge variant="destructive" className="mt-4">Necessário Envio de Arquivo STL</Badge>
              )}
            </div>
          </div>

          {/* Technical Specs */}
          <div className="mt-16">
            <Card>
                <CardHeader>
                    <CardTitle>Detalhes do Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <h3 className="font-semibold mb-2">Especificações Técnicas</h3>
                            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                                {Object.entries(product.technicalSpecs).map(([key, value]) => (
                                    <li key={key}><strong>{key}:</strong> {value}</li>
                                ))}
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2">Prazo de Produção</h3>
                             <p className="text-muted-foreground">{product.productionTime}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
