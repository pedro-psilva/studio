
'use client';

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <section className="py-16 md:py-24 bg-card">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline">Fale Conosco</h1>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                            Tem alguma dúvida ou precisa de um orçamento? Nossa equipe está pronta para ajudar.
                        </p>
                    </div>
                </section>

                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Contact Form */}
                            <div>
                                <h2 className="text-3xl font-bold font-headline mb-6">Envie uma Mensagem</h2>
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Seu Nome</Label>
                                            <Input id="name" placeholder="João Silva" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Seu E-mail</Label>
                                            <Input id="email" type="email" placeholder="joao.silva@email.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Assunto</Label>
                                        <Input id="subject" placeholder="Dúvida sobre produto" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Sua Mensagem</Label>
                                        <Textarea id="message" placeholder="Digite sua mensagem aqui..." rows={5} />
                                    </div>
                                    <Button type="submit" size="lg" className="w-full">Enviar Mensagem</Button>
                                </form>
                            </div>
                            
                            {/* Contact Info */}
                            <div className="space-y-8">
                                 <h2 className="text-3xl font-bold font-headline">Informações de Contato</h2>
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">E-mail</h3>
                                        <p className="text-muted-foreground">Nosso canal de comunicação principal.</p>
                                        <a href="mailto:contato@itlab.com" className="text-primary hover:underline">contato@itlab.com</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                     <div className="bg-primary/10 p-3 rounded-full text-primary">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">Telefone</h3>
                                        <p className="text-muted-foreground">Para questões urgentes, de Seg a Sex, 9h-18h.</p>
                                        <a href="tel:+5511999998888" className="text-primary hover:underline">+55 (11) 99999-8888</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                     <div className="bg-primary/10 p-3 rounded-full text-primary">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">Endereço</h3>
                                        <p className="text-muted-foreground">Nosso escritório (visitas apenas com agendamento).</p>
                                        <p>Rua da Tecnologia, 123, São Paulo, SP</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
