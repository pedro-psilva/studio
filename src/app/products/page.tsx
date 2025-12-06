"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useTranslation } from "@/hooks/use-translation";
import { Slider } from "@/components/ui/slider";
import type { ServiceDocument } from "@/lib/serviceService";
import { listServices } from "@/lib/serviceService";

export default function ProductsPage() {
  const { t } = useTranslation("home");
  const { t: tCommon, formatCurrency } = useTranslation("common");
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);

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

  const filteredServices = useMemo(() => {
    const [minPrice, maxPrice] = priceRange;

    return services.filter((service) => {
      const price = service.precoBase ?? 0;
      return price >= minPrice && price <= maxPrice;
    });
  }, [services, priceRange]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight font-headline">
              {t("ourProducts")}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              {t('productsPage.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="md:col-span-1">
              <div className="sticky top-24">
                <h2 className="text-2xl font-bold mb-6 font-headline">{t('productsPage.filters')}</h2>

                {/* Price Filter */}
                <div>
                  <h3 className="font-semibold mb-4 text-lg">{t('productsPage.priceRange')}</h3>
                  <Slider
                    defaultValue={priceRange}
                    min={0}
                    max={1500}
                    step={50}
                    onValueChange={(value) =>
                      setPriceRange([value[0] ?? 0, value[1] ?? 1500])
                    }
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{formatCurrency(priceRange[0])}</span>
                    <span>{formatCurrency(priceRange[1])}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="md:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center h-full text-center bg-card p-8 rounded-lg">
                  <p className="text-muted-foreground">{t('productsPage.loading')}</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-center bg-card p-8 rounded-lg">
                  <p className="text-destructive">{error}</p>
                </div>
              ) : filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <ProductCard key={service.id} service={service} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center bg-card p-8 rounded-lg">
                  <p className="text-xl font-semibold">
                    {t('productsPage.noProductsFound')}
                  </p>
                  <p className="text-muted-foreground mt-2">
                    {t('productsPage.adjustFilters')}
                  </p>
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

function ProductCard({ service }: { service: ServiceDocument }) {
  const { t: tCommon, formatCurrency } = useTranslation("common");
  const { t: tHome } = useTranslation("home");
  const { t: tProducts } = useTranslation('products');

  const requiresUpload = (service.arquivosNecessarios ?? []).length > 0;

  const productName = tProducts(`${service.codigo}.name`) || service.nome;
  const productDescription = tProducts(`${service.codigo}.description`) || service.descricao;

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${service.id}`} className="block">
          {service.imagemUrl ? (
            <Image
              src={service.imagemUrl}
              alt={productName}
              width={400}
              height={300}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center text-xs text-muted-foreground">
              {tHome('productCard.noImage')}
            </div>
          )}
        </Link>
        {requiresUpload && (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2 text-[11px]"
          >
            {tHome('productCard.requiresUpload')}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="text-lg font-semibold line-clamp-2">
          <Link href={`/products/${service.id}`}>{productName}</Link>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {tHome('productCard.code')}: {service.codigo}
        </p>
        {productDescription && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
            {productDescription}
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
            {tCommon("buy")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
