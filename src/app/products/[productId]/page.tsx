"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useTranslation } from "@/hooks/use-translation";
import { Separator } from "@/components/ui/separator";
import type { ServiceDocument } from "@/lib/serviceService";
import { getService } from "@/lib/serviceService";

export default function ProductDetailPage() {
  const params = useParams();
  const { productId } = params as { productId: string };
  const { t } = useTranslation("home");

  const [service, setService] = useState<ServiceDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getService(productId);
        if (!isMounted) return;
        if (!data || !data.ativo || data.visibilidade !== "publico") {
          notFound();
          return;
        }
        setService(data);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message ?? "Erro ao carregar produto");
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
  }, [productId]);

  if (!loading && !service && !error) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">Carregando produto...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-destructive">{error}</p>
            </div>
          ) : service ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {/* Imagem */}
              <div>
                <div className="mb-4">
                  {service.imagemUrl ? (
                    <Image
                      src={service.imagemUrl}
                      alt={service.nome}
                      width={800}
                      height={600}
                      className="w-full aspect-square md:aspect-[4/3] rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-full aspect-square md:aspect-[4/3] rounded-lg border bg-muted flex items-center justify-center text-sm text-muted-foreground">
                      Sem imagem disponível
                    </div>
                  )}
                </div>
              </div>

              {/* Informações */}
              <div>
                <div className="mb-4">
                  <Link
                    href="/products"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center mb-2"
                  >
                    {/* ChevronLeft removido para simplificar */}
                    Voltar para produtos
                  </Link>
                  {service.tituloPromocional && (
                    <Badge variant="outline">{service.tituloPromocional}</Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">
                  {service.nome}
                </h1>
                <p className="text-sm text-muted-foreground mb-2">
                  Código: {service.codigo}
                </p>
                <p className="text-3xl font-bold text-primary mb-4">
                  R$ {service.precoBase.toFixed(2)}
                </p>

                {service.prazoEntrega > 0 && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Prazo estimado de entrega: {service.prazoEntrega} dia(s)
                  </p>
                )}

                {service.descricao && (
                  <p className="text-muted-foreground mb-6 whitespace-pre-line">
                    {service.descricao}
                  </p>
                )}

                <Separator className="my-6" />

                {service.tags && service.tags.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Indicações / tags
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {service.arquivosNecessarios &&
                  service.arquivosNecessarios.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Arquivos necessários
                      </h2>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {service.arquivosNecessarios.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {service.arquivosOpcionais &&
                  service.arquivosOpcionais.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Arquivos opcionais
                      </h2>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {service.arquivosOpcionais.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {service.fluxoProducao && service.fluxoProducao.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Fluxo de produção
                    </h2>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {service.fluxoProducao.map((step, index) => (
                  </div>
                </div>
                {/* Step 5: Review */}
                <div className={currentStep === 4 ? 'block' : 'hidden'}>
                  <h3 className="text-lg font-semibold mb-4">Revise as informações</h3>
                  <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                    <div className="flex justify-between items-center"><span>Produto:</span><span className="font-medium text-right">{product.name}</span></div>
                    <Separator/>
                    <div className="flex justify-between items-center"><span>Dentes:</span><span className="font-medium text-right">{selectedTeeth.length > 0 ? selectedTeeth.join(', ') : 'Nenhum'}</span></div>
                    <Separator/>
                    <div className="flex justify-between items-center"><span>Cor:</span><span className="font-medium text-right">{selectedColor || 'Não selecionada'}</span></div>
                    <Separator/>
                    <div className="flex justify-between items-center"><span>Arquivos:</span><span className="font-medium text-right">{uploadedFiles.length} arquivo(s)</span></div>
                    <Separator/>
                    <div className="flex justify-between items-center"><span>Paciente:</span><span className="font-medium text-right">{patientData.name || 'Não informado'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
  const { productId } = params as { productId: string };
  const { t } = useTranslation("home");

  const [service, setService] = useState<ServiceDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getService(productId);
        if (!isMounted) return;
        if (!data || !data.ativo || data.visibilidade !== "publico") {
          notFound();
          return;
        }
        setService(data);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message ?? "Erro ao carregar produto");
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
  }, [productId]);

  if (!loading && !service && !error) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">Carregando produto...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-destructive">{error}</p>
            </div>
          ) : service ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {/* Imagem */}
              <div>
                <div className="mb-4">
                  {service.imagemUrl ? (
                    <Image
                      src={service.imagemUrl}
                      alt={service.nome}
                      width={800}
                      height={600}
                      className="w-full aspect-square md:aspect-[4/3] rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-full aspect-square md:aspect-[4/3] rounded-lg border bg-muted flex items-center justify-center text-sm text-muted-foreground">
                      Sem imagem disponível
                    </div>
                  )}
                </div>
              </div>

              {/* Informações */}
              <div>
                <div className="mb-4">
                  <Link
                    href="/products"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center mb-2"
                  >
                    {/* ChevronLeft removido para simplificar */}
                    Voltar para produtos
                  </Link>
                  {service.tituloPromocional && (
                    <Badge variant="outline">{service.tituloPromocional}</Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">
                  {service.nome}
                </h1>
                <p className="text-sm text-muted-foreground mb-2">
                  Código: {service.codigo}
                </p>
                <p className="text-3xl font-bold text-primary mb-4">
                  R$ {service.precoBase.toFixed(2)}
                </p>

                {service.prazoEntrega > 0 && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Prazo estimado de entrega: {service.prazoEntrega} dia(s)
                  </p>
                )}

                {service.descricao && (
                  <p className="text-muted-foreground mb-6 whitespace-pre-line">
                    {service.descricao}
                  </p>
                )}

                {service.tags && service.tags.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Indicações / tags
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                                    <div>
                                        <Label htmlFor="patient-name">Nome do Paciente</Label>
                                        <Input id="patient-name" value={patientData.name} onChange={(e) => setPatientData(p => ({...p, name: e.target.value}))} className={formErrors.patientName ? 'border-destructive' : ''} />
                                         {formErrors.patientName && <p className="text-sm text-destructive mt-1">{formErrors.patientName}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="patient-age">Idade</Label>
                                        <Input id="patient-age" type="number" value={patientData.age} onChange={(e) => setPatientData(p => ({...p, age: e.target.value}))} />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="clinical-notes">Observações Clínicas</Label>
                                    <Textarea id="clinical-notes" placeholder="Ex: Paciente com histórico de bruxismo..." value={patientData.clinicalNotes} onChange={(e) => setPatientData(p => ({...p, clinicalNotes: e.target.value}))} />
                                </div>
                                <div>
                                    <Label htmlFor="dentist-notes">Observações do Dentista</Label>
                                    <Textarea id="dentist-notes" placeholder="Ex: Favor conferir o ponto de contato..." value={patientData.dentistNotes} onChange={(e) => setPatientData(p => ({...p, dentistNotes: e.target.value}))} />
                                </div>
                            </div>
                        </div>
                        
                        {/* Step 5: Review */}
                        <div className={currentStep === 4 ? 'block' : 'hidden'}>
                             <h3 className="text-lg font-semibold mb-4">Revise as informações</h3>
                             <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                                <div className="flex justify-between items-center"><span>Produto:</span><span className="font-medium text-right">{product.name}</span></div>
                                <Separator/>
                                <div className="flex justify-between items-center"><span>Dentes:</span><span className="font-medium text-right">{selectedTeeth.length > 0 ? selectedTeeth.join(', ') : 'Nenhum'}</span></div>
                                <Separator/>
                                <div className="flex justify-between items-center"><span>Cor:</span><span className="font-medium text-right">{selectedColor || 'Não selecionada'}</span></div>
                                <Separator/>
                                <div className="flex justify-between items-center"><span>Arquivos:</span><span className="font-medium text-right">{uploadedFiles.length} arquivo(s)</span></div>
                                <Separator/>
                                <div className="flex justify-between items-center"><span>Paciente:</span><span className="font-medium text-right">{patientData.name || 'Não informado'}</span></div>
                             </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 mt-auto border-t">
                      <div className="flex justify-between w-full">
                          <div>
                              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                              <Button variant="outline" className="ml-2">Salvar Rascunho</Button>
                          </div>
                          <div className="flex items-center gap-2">
                              {currentStep > 0 && (
                                  <Button variant="outline" onClick={handleBack}>
                                      Voltar
                                  </Button>
                              )}
                              {currentStep !== 0 && (
                                  <Button onClick={handleNext}>
                                      {currentStep === STEPS.length - 1 ? 'Concluir e Adicionar ao Carrinho' : 'Avançar'}
                                      <ChevronsRight className="ml-2 h-4 w-4" />
                                  </Button>
                              )}
                          </div>
                      </div>
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
