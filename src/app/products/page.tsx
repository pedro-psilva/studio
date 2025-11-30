'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { products, categories } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslation } from '@/hooks/use-translation';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

export default function ProductsPage() {
  const { t } = useTranslation('home');
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const filteredProducts = products.filter(product => {
    const price = product.price;
    const isPriceInRange = price >= priceRange[0] && price <= priceRange[1];
    const isCategorySelected = selectedCategories.length === 0 || selectedCategories.includes(product.categoryId);
    return isPriceInRange && isCategorySelected;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight font-headline">
              {t('ourProducts')}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Explore nossa seleção completa de produtos e serviços odontológicos digitais.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="md:col-span-1">
              <div className="sticky top-24">
                <h2 className="text-2xl font-bold mb-6 font-headline">Filtros</h2>
                
                {/* Category Filter */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-4 text-lg">Categorias</h3>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={category.id} 
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryChange(category.id)}
                        />
                        <label
                          htmlFor={category.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t(`categories.${category.id}`)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                    <h3 className="font-semibold mb-4 text-lg">Faixa de Preço</h3>
                    <Slider
                        defaultValue={[0, 1500]}
                        min={0}
                        max={1500}
                        step={50}
                        onValueChange={(value) => setPriceRange(value)}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>R$ {priceRange[0]}</span>
                        <span>R$ {priceRange[1]}</span>
                    </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="md:col-span-3">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center bg-card p-8 rounded-lg">
                    <p className="text-xl font-semibold">Nenhum produto encontrado</p>
                    <p className="text-muted-foreground mt-2">Tente ajustar seus filtros para encontrar o que procura.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const { t } = useTranslation('common');
  const productImage = PlaceHolderImages.find(p => p.id === product.imageId);
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.id}`} className="block">
          {productImage && (
            <Image
              src={productImage.imageUrl}
              alt={product.name}
              width={400}
              height={300}
              className="w-full h-48 object-cover"
              data-ai-hint={productImage.imageHint}
            />
          )}
        </Link>
        {product.requiresStl && (
          <Badge variant="destructive" className="absolute top-2 right-2">STL Required</Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="text-lg font-semibold">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Code: {product.code}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 bg-background/30">
        <p className="text-lg font-bold text-primary">
          R$ {product.price.toFixed(2)}
        </p>
        <Button size="sm" asChild>
          <Link href={`/products/${product.id}`}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {t('buy')}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}