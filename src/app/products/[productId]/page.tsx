'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function ProductDetailPage() {
  const params = useParams();
  const { productId } = params;
  const { t } = useTranslation('home');

  const product = products.find((p) => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product?.images[0]);

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

              {/* Variants */}
              <div className="space-y-6">
                {product.variants.materials.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Material</h3>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o material" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants.materials.map((material) => (
                          <SelectItem key={material} value={material}>
                            {material}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {product.variants.shades.length > 0 && (
                   <div>
                    <h3 className="font-semibold mb-2">Cor</h3>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cor" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants.shades.map((shade) => (
                          <SelectItem key={shade} value={shade}>
                            {shade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                 {product.variants.implantSystems && product.variants.implantSystems.length > 0 && (
                   <div>
                    <h3 className="font-semibold mb-2">Sistema de Implante</h3>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o sistema" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants.implantSystems.map((system) => (
                          <SelectItem key={system} value={system}>
                            {system}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2 border rounded-md p-2">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus className="h-4 w-4"/>
                  </Button>
                  <span className="w-10 text-center font-bold">{quantity}</span>
                   <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="h-4 w-4"/>
                  </Button>
                </div>
                <Button size="lg" className="w-full sm:w-auto flex-1">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Adicionar ao Carrinho
                </Button>
              </div>
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
