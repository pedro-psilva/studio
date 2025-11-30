
'use client';

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
    const aboutImage = PlaceHolderImages.find(p => p.id === 'hero-banner');

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <section className="py-16 md:py-24 bg-card">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline">Sobre a IT Lab</h1>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                            Inovação, precisão e tecnologia de ponta para revolucionar a odontologia digital.
                        </p>
                    </div>
                </section>

                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                            <div>
                                {aboutImage && (
                                     <Image
                                        src={aboutImage.imageUrl}
                                        alt="Laboratório IT Lab"
                                        width={600}
                                        height={400}
                                        className="rounded-lg object-cover shadow-lg"
                                        data-ai-hint={aboutImage.imageHint}
                                    />
                                )}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold font-headline mb-4">Nossa Missão</h2>
                                <p className="text-muted-foreground mb-4">
                                    Na IT Lab, nossa missão é capacitar clínicas e profissionais da odontologia com as ferramentas e produtos mais avançados do mercado. Combinamos arte e ciência para entregar resultados de alta precisão que transformam sorrisos e otimizam o fluxo de trabalho dos nossos parceiros.
                                </p>
                                <p className="text-muted-foreground">
                                    Estamos comprometidos com a excelência, desde a escolha dos materiais até a entrega final, garantindo que cada peça produzida em nosso laboratório atenda aos mais rigorosos padrões de qualidade.
                                </p>
                                <Button asChild className="mt-6">
                                    <Link href="/contact">Entre em Contato</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
