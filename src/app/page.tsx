'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { products, categories } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslation } from '@/hooks/use-translation';

export default function HomePage() {
  const { t } = useTranslation('home');
  const featuredProducts = products.slice(0, 4);
  const otherProducts = products.slice(4, 12);
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-banner');

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative h-[60vh] w-full">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl font-headline">
                {t('heroTitle')}
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
                {t('heroSubtitle')}
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                  <Link href="/products">
                    {t('shopAll')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/account">
                    {t('myAccount')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center tracking-tight font-headline">{t('shopByCategory')}</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/products?category=${category.id}`} className="group">
                  <Card className="overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center h-24">
                      <h3 className="font-semibold text-foreground">{t(`categories.${category.id}`)}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="featured-products" className="py-12 md:py-20 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center tracking-tight font-headline">{t('featuredProducts')}</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section id="all-products" className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center tracking-tight font-headline">{t('ourProducts')}</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {otherProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button asChild size="lg" variant="outline">
                <Link href="/products">{t('viewAllProducts')}</Link>
              </Button>
            </div>
          </div>
        </section>
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