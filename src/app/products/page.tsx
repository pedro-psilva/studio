"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductsCatalog } from "@/components/products/ProductsCatalog";

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <ProductsCatalog />
      </main>
      <Footer />
    </div>
  );
}
