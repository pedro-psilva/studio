'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { categories } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useTranslation } from '@/hooks/use-translation';
import type { ServiceDocument } from '@/lib/serviceService';
import { listServices } from '@/lib/serviceService';

export default function HomePage() {
  const { t } = useTranslation('home');
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Banners seguem a mesma ideia dos produtos: usamos URLs públicas das imagens
  // armazenadas no Storage (sem chamar APIs de listagem via JS, evitando CORS).
  const bannerUrls = useMemo(
    () => [
      'https://firebasestorage.googleapis.com/v0/b/studio-1776798305-10e02.firebasestorage.app/o/banner%2FBanner-1.png?alt=media&token=d78a80e3-0ecf-43e5-9664-5203bdd197ab',
      'https://firebasestorage.googleapis.com/v0/b/studio-1776798305-10e02.firebasestorage.app/o/banner%2FBanner-2.png?alt=media&token=5046ffa1-0d19-4ccb-a07b-b9cb4a6673af',
      'https://firebasestorage.googleapis.com/v0/b/studio-1776798305-10e02.firebasestorage.app/o/banner%2FBanner-3.png?alt=media&token=c023b09f-ef98-423f-9ab8-aaaa5195b6b8',
    ],
    []
  );

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await listServices({ onlyActive: true, visibility: "publico" });
        if (!isMounted) return;
        setServices(data);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message ?? "Erro ao carregar produtos");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (bannerUrls.length === 0) return;

    const id = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerUrls.length);
    }, 8000); // 8s por banner

    return () => clearInterval(id);
  }, [bannerUrls.length]);

  const featuredServices = useMemo(
    () => services.slice(0, 4),
    [services]
  );

  const otherServices = useMemo(
    () => services.slice(4, 12),
    [services]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative h-[60vh] w-full overflow-hidden">
          {bannerUrls.length > 0 ? (
            <>
              <Image
                src={bannerUrls[currentBannerIndex]}
                alt={`Banner ${currentBannerIndex + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/70 to-background" />
          )}
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl font-headline">
                {t("heroTitle")}
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
                {t("heroSubtitle")}
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Link href="/products">
                    {t("shopAll")} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/account">{t("myAccount")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center tracking-tight font-headline">
              {t("shopByCategory")}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center h-24">
                      <h3 className="font-semibold text-foreground">
                        {t(`categories.${category.id}`)}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="featured-products" className="py-12 md:py-20 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center tracking-tight font-headline">
              {t("featuredProducts")}
            </h2>
            {loading ? (
              <div className="mt-8 flex justify-center text-muted-foreground text-sm">
                Carregando produtos...
              </div>
            ) : error ? (
              <div className="mt-8 flex justify-center text-destructive text-sm">
                {error}
              </div>
            ) : featuredServices.length === 0 ? (
              <div className="mt-8 flex justify-center text-muted-foreground text-sm">
                Nenhum produto em destaque encontrado.
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredServices.map((service: ServiceDocument) => (
                  <ProductCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="all-products" className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center tracking-tight font-headline">
              {t("ourProducts")}
            </h2>
            {loading ? (
              <div className="mt-8 flex justify-center text-muted-foreground text-sm">
                Carregando produtos...
              </div>
            ) : error ? (
              <div className="mt-8 flex justify-center text-destructive text-sm">
                {error}
              </div>
            ) : otherServices.length === 0 ? (
              <div className="mt-8 flex justify-center text-muted-foreground text-sm">
                Nenhum produto encontrado.
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {otherServices.map((service: ServiceDocument) => (
                  <ProductCard key={service.id} service={service} />
                ))}
              </div>
            )}
            <div className="mt-12 text-center">
              <Button asChild size="lg" variant="outline">
                <Link href="/products">{t("viewAllProducts")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ProductCard({ service }: { service: ServiceDocument }) {
  const { t, formatCurrency } = useTranslation("common");
  const requiresUpload = (service.arquivosNecessarios ?? []).length > 0;

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${service.id}`} className="block">
          {service.imagemUrl ? (
            <Image
              src={service.imagemUrl}
              alt={service.nome}
              width={400}
              height={300}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center text-xs text-muted-foreground">
              Sem imagem
            </div>
          )}
        </Link>
        {requiresUpload && (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2 text-[11px]"
          >
            Upload obrigatório
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="text-lg font-semibold line-clamp-2">
          <Link href={`/products/${service.id}`}>{service.nome}</Link>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Código: {service.codigo}
        </p>
        {service.descricao && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
            {service.descricao}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 bg-background/30">
        <p className="text-lg font-bold text-primary">
          {formatCurrency(service.precoBase)}
        </p>
        <Button size="sm" asChild>
          <Link href={`/products/${service.id}`}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {t("buy")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}