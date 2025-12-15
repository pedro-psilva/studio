
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";

import {
  ShoppingCart,
  UploadCloud,
  X,
  File as FileIcon,
  ChevronsRight,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useTranslation } from "@/hooks/use-translation";
import { Separator } from "@/components/ui/separator";
import type { ServiceDocument } from "@/lib/serviceService";
import { getService } from "@/lib/serviceService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  getCart,
  setCart,
  updateCartItems,
  type CartItemFirestore,
} from "@/lib/cartService";
import { Progress } from "@/components/ui/progress";
import { SeletorInterativoFDI } from '@/components/fdi-selector';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const colorOptions = {
  "VITA CLASSIC": {
    "Tonalidades A": ["A1", "A2", "A3", "A3.5", "A4"],
    "Tonalidades B": ["B1", "B2", "B3", "B4"],
    "Tonalidades C": ["C1", "C2", "C3", "C4"],
    "Tonalidades D": ["D1", "D2", "D3", "D4"],
  },
  "DENTES CLAREADOS": {
    "e.max Cad": ["BL1", "BL2", "BL3", "BL4"],
    Rosetta: ["W1", "W2", "W3", "W4"],
  },
  "VITA 3D MASTER": {
    "Tonalidades 0": ["0M1", "0M2", "0M3"],
    "Tonalidades 1": ["1M1", "1M2"],
    "Tonalidades 2": ["2L2.5", "2M1", "2M2", "2M3", "2R2.5"],
    "Tonalidades 3": [
      "3L2.5",
      "3M1",
      "3M2",
      "3M3",
      "3R1.5",
      "3R2.5",
    ],
    "Tonalidades 4": [
      "4L2.5",
      "4R2.5",
      "4R1.5",
      "4M1",
      "4M2",
      "4M3",
    ],
    "Tonalidades 5": ["5M1", "5M2", "5M3"],
  },
};

const STEPS = [
  { id: "teeth", title: "Seleção de Dentes" },
  { id: "color", title: "Cor e Material" },
  { id: "files", title: "Upload de Arquivos" },
  { id: "patient", title: "Ficha do Paciente" },
  { id: "review", title: "Revisão" },
];

export default function ProductDetailPage() {
  const params = useParams();
  const { productId } = params as { productId: string };
  const { t: tHome, formatCurrency } = useTranslation("home");
  const { t: tProduct } = useTranslation('product');
  const { t: tProducts } = useTranslation('products');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [service, setService] = useState<ServiceDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // fluxo de compra
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingStlFileName, setExistingStlFileName] = useState<string | null>(null);
  const [patientData, setPatientData] = useState({
    name: "",
    age: "",
    clinicalNotes: "",
    dentistNotes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const progress = useMemo(
    () => ((currentStep + 1) / STEPS.length) * 100,
    [currentStep]
  );

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

  // Modo edição vindo do carrinho: carrega dados salvos e abre o modal já preenchido
  useEffect(() => {
    if (!service) return;
    if (typeof window === "undefined") return;

    const isEditMode = searchParams.get("editCase") === "1";
    if (!isEditMode) return;

    try {
      const key = window.sessionStorage.getItem("editCaseKey");
      if (!key) return;
      const raw = window.localStorage.getItem(key);
      if (!raw) return;

      const data = JSON.parse(raw) as {
        productId: string;
        quantity?: number;
        selectedTeeth?: number[];
        selectedColor?: string | null;
        patientName?: string;
        stlFileUrl?: string | null;
      };

      if (data.productId !== service.id) return;

      setSelectedTeeth(data.selectedTeeth ?? []);
      setSelectedColor(data.selectedColor ?? null);
      setPatientData((prev) => ({
        ...prev,
        name: data.patientName ?? "",
      }));
      setExistingStlFileName(data.stlFileUrl ?? null);

      // abre modal diretamente no passo de revisão para conferência
      setCurrentStep(STEPS.length - 1);
      setIsModalOpen(true);
    } catch (e) {
      console.error("Erro ao carregar dados de edição de caso:", e);
    }
  }, [service, searchParams]);

  useEffect(() => {
    // sempre que trocar de serviço, volta para a primeira imagem
    setSelectedImageIndex(0);
    setIsLightboxOpen(false);
  }, [service?.id]);

  const requiresStl =
    !!service &&
    Array.isArray(service.arquivosNecessarios) &&
    service.arquivosNecessarios.length > 0;

  function resetFlow() {
    setCurrentStep(0);
    setSelectedTeeth([]);
    setSelectedColor(null);
    setUploadedFiles([]);
    setPatientData({ name: "", age: "", clinicalNotes: "", dentistNotes: "" });
    setFormErrors({});
  }

  function openModal() {
    if (!service) return;
    resetFlow();
    setIsModalOpen(true);
  }

  function validateStep(): boolean {
    const errors: Record<string, string> = {};

    if (currentStep === 0 && requiresStl && selectedTeeth.length === 0) {
      errors.teeth = "Selecione ao menos 1 dente.";
    }

    if (currentStep === 2 && requiresStl && uploadedFiles.length === 0 && !existingStlFileName) {
      errors.files = "Envie ao menos 1 arquivo clínico.";
    }

    if (currentStep === 3 && requiresStl && !patientData.name) {
      errors.patientName = "O nome do paciente é obrigatório.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleNext(data?: any) {
    if (currentStep === 0) {
      setSelectedTeeth(data as number[]);
    }
    
    if (!validateStep()) return;
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      void handleAddToCart();
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  async function handleAddToCart() {
    if (!service) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!validateStep()) return;

    let stlFileUrl: string | undefined = existingStlFileName ?? undefined;

    if (uploadedFiles.length > 0) {
      try {
        const file = uploadedFiles[0];
        const safeUserId = user.uid || "anonymous";
        const storagePath = `cases-files/${safeUserId}/${service.id}/${Date.now()}-${file.name}`;
        const fileRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(fileRef, file);
        stlFileUrl = await getDownloadURL(snapshot.ref);
      } catch (uploadError) {
        console.error("Erro ao fazer upload do arquivo clínico:", uploadError);
      }
    }

    const quantity = requiresStl ? Math.max(1, selectedTeeth.length || 1) : 1;

    const cartItem: CartItemFirestore = {
      productId: service.id,
      quantity,
      teeth: selectedTeeth,
      shade: selectedColor || undefined,
      material: undefined,
      implantSystem: undefined,
      stlFileUrl,
      patientName: patientData.name || undefined,
    };

    try {
      const existingCart = await getCart(user.uid);
      const items = existingCart?.items ? [...existingCart.items, cartItem] : [cartItem];

      if (!existingCart) {
        await setCart(user.uid, items);
      } else {
        await updateCartItems(user.uid, items);
      }

      setIsModalOpen(false);
      router.push("/cart");
    } catch (err) {
      console.error("Erro ao adicionar item ao carrinho:", err);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setUploadedFiles((prev) => [...prev, ...files]);
  }

  const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  function removeFile(fileName: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
  }

  if (!loading && !service && !error) {
    notFound();
  }

  const translatedName = service ? tProducts(`${service.codigo}.name`) : null;
  const productName = service
    ? translatedName && translatedName !== `${service.codigo}.name`
      ? translatedName
      : service.nome
    : '...';

  const productDescription = service ? tProducts(`${service.codigo}.description`) || service.descricao : '...';
  
  const translatedTags = service ? tProducts(`${service.codigo}.tags`) : null;
  const productTags = Array.isArray(translatedTags) ? translatedTags : (service?.tags ?? []);

  const translatedFlow = service ? tProducts(`${service.codigo}.productionFlow`) : null;
  const productFlow = Array.isArray(translatedFlow) ? translatedFlow : (service?.fluxoProducao ?? []);

  const unitPrice = service?.precoBase ?? 0;
  const quantity = requiresStl ? Math.max(1, (selectedTeeth || []).length || 1) : 1;
  const totalPrice = unitPrice * quantity;

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
              {/* Imagens com navegação estilo ecommerce */}
              <div>
                {(() => {
                  const imagens: string[] = [
                    service.imagemUrl,
                    ...(service.imagensSecundarias ?? []),
                  ].filter(Boolean);

                  if (!imagens.length) {
                    return (
                      <div className="w-full aspect-square md:aspect-[4/3] rounded-lg border bg-muted flex items-center justify-center text-sm text-muted-foreground mb-4">
                        Sem imagem disponível
                      </div>
                    );
                  }

                  const current = imagens[Math.min(selectedImageIndex, imagens.length - 1)];

                  return (
                    <>
                      <button
                        type="button"
                        className="group relative mb-4 block w-full aspect-square md:aspect-[4/3] rounded-lg border overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
                        onClick={() => setIsLightboxOpen(true)}
                      >
                        <Image
                          src={current}
                          alt={productName}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </button>

                      {imagens.length > 1 && (
                        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                          {imagens.map((src, index) => (
                            <button
                              key={src + index}
                              type="button"
                              onClick={() => {
                                setSelectedImageIndex(index);
                                setIsLightboxOpen(false);
                              }}
                              className={
                                "relative h-20 w-20 flex-shrink-0 rounded-md border overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary" +
                                (index === selectedImageIndex
                                  ? " border-primary ring-1 ring-primary"
                                  : " border-muted")
                              }
                            >
                              <Image
                                src={src}
                                alt={`${productName} - miniatura ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      {isLightboxOpen && (
                        <div
                          className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4"
                          onClick={() => setIsLightboxOpen(false)}
                        >
                          <div className="relative max-w-4xl w-full aspect-video">
                            <Image
                              src={current}
                              alt={productName}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Informações + fluxo de compra */}
              <div>
                <div className="mb-4">
                  <Link
                    href="/products"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center mb-2"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {tProduct('backToProducts')}
                  </Link>
                  {service.tituloPromocional && (
                    <Badge variant="outline">{service.tituloPromocional}</Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">
                  {productName}
                </h1>
                <p className="text-sm text-muted-foreground mb-2">
                  {tProduct('code')}: {service.codigo}
                </p>
                <p className="text-3xl font-bold text-primary mb-4">
                  {formatCurrency(totalPrice)}
                </p>

                {service.prazoEntrega > 0 && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {tProduct('deliveryTime')}: {service.prazoEntrega} {tProduct('days')}
                  </p>
                )}

                {productDescription && (
                  <p className="text-muted-foreground mb-6 whitespace-pre-line">
                    {productDescription}
                  </p>
                )}

                {/* Fluxo de compra */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="w-full sm:w-auto flex-1"
                      onClick={openModal}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {requiresStl
                        ? tProduct('customizeAndBuy')
                        : tProduct('addToCart')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        {tProduct('modal.title')}: {productName}
                      </DialogTitle>
                      <DialogDescription>
                        {`Passo ${currentStep + 1} de ${STEPS.length}`}: {tProduct(`modal.steps.${STEPS[currentStep].id}`)}
                      </DialogDescription>
                      <Progress value={progress} className="mt-2" />
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-6 -mr-6">
                      {/* Step 1: Teeth Selection */}
                      <div className={currentStep === 0 ? 'block' : 'hidden'}>
                        <SeletorInterativoFDI 
                          initialSelection={selectedTeeth}
                          onNext={(selection) => handleNext(selection)}
                        />
                        {formErrors.teeth && <p className="text-sm text-center text-destructive mt-4">{formErrors.teeth}</p>}
                      </div>

                      {/* Step 2: Color Selection */}
                      <div className={currentStep === 1 ? "block" : "hidden"}>
                        <h3 className="text-lg font-semibold mb-4">
                          {tProduct('modal.color.title')}
                        </h3>
                        <Accordion type="single" collapsible defaultValue="VITA CLASSIC" className="w-full">
                          {Object.entries(colorOptions).map(([system, subGroups]) => (
                            <AccordionItem value={system} key={system}>
                              <AccordionTrigger>{system}</AccordionTrigger>
                              <AccordionContent>
                                <RadioGroup
                                  value={selectedColor || ""}
                                  onValueChange={setSelectedColor}
                                  className="space-y-4 pt-2"
                                >
                                  {Object.entries(subGroups).map(([groupName, colors]) => (
                                    <div key={groupName}>
                                      <p className="text-sm font-semibold mb-2 text-muted-foreground">
                                        {groupName}
                                      </p>
                                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                        {colors.map((color) => (
                                          <Label
                                            key={color}
                                            htmlFor={color}
                                            className={`flex items-center justify-center p-3 rounded-md border-2 cursor-pointer transition-colors text-xs sm:text-sm ${
                                              selectedColor === color
                                                ? "border-primary bg-primary/10"
                                                : "border-muted"
                                            }`}
                                          >
                                            <RadioGroupItem
                                              value={color}
                                              id={color}
                                              className="sr-only"
                                            />
                                            <span>{color}</span>
                                          </Label>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>

                      {/* Step 3: File Upload */}
                      <div
                        className={currentStep === 2 ? "block" : "hidden"}
                      >
                        <h3 className="text-lg font-semibold mb-4">
                          {tProduct('modal.files.title')}
                        </h3>
                        <div className="space-y-4">
                          <label
                            htmlFor="file-upload"
                            className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">
                                  {tProduct('modal.files.clickToUpload')}
                                </span>{" "}
                                {tProduct('modal.files.orDragAndDrop')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tProduct('modal.files.fileTypes')}
                              </p>
                            </div>
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              multiple
                              onChange={handleFileChange}
                            />
                          </label>
                          {existingStlFileName && uploadedFiles.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {tProduct('modal.files.currentFile')}: <span className="font-medium">{existingStlFileName}</span>. {tProduct('modal.files.uploadToReplace')}
                            </p>
                          )}
                          {formErrors.files && (
                            <p className="text-sm text-destructive mt-2">
                              {formErrors.files}
                            </p>
                          )}

                          {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-semibold">
                                {tProduct('modal.files.uploadedFiles')}:
                              </h4>
                              <ul className="space-y-2">
                                {uploadedFiles.map((file, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center justify-between p-2 rounded-md bg-muted"
                                  >
                                    <div className="flex items-center gap-2">
                                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                                      <span className="text-sm">{file.name}</span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => removeFile(file.name)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Step 4: Patient Form */}
                      <div
                        className={currentStep === 3 ? "block" : "hidden"}
                      >
                        <h3 className="text-lg font-semibold mb-4">
                          {tProduct('modal.patient.title')}
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="patient-name">
                                {tProduct('modal.patient.name')}
                              </Label>
                              <Input
                                id="patient-name"
                                value={patientData.name}
                                onChange={(e) =>
                                  setPatientData((p) => ({
                                    ...p,
                                    name: e.target.value,
                                  }))
                                }
                                className={
                                  formErrors.patientName
                                    ? "border-destructive"
                                    : ""
                                }
                              />
                              {formErrors.patientName && (
                                <p className="text-sm text-destructive mt-1">
                                  {formErrors.patientName}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="patient-age">{tProduct('modal.patient.age')}</Label>
                              <Input
                                id="patient-age"
                                type="number"
                                value={patientData.age}
                                onChange={(e) =>
                                  setPatientData((p) => ({
                                    ...p,
                                    age: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="clinical-notes">
                              {tProduct('modal.patient.clinicalNotes')}
                            </Label>
                            <Textarea
                              id="clinical-notes"
                              placeholder={tProduct('modal.patient.clinicalNotesPlaceholder')}
                              value={patientData.clinicalNotes}
                              onChange={(e) =>
                                setPatientData((p) => ({
                                  ...p,
                                  clinicalNotes: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="dentist-notes">
                              {tProduct('modal.patient.dentistNotes')}
                            </Label>
                            <Textarea
                              id="dentist-notes"
                              placeholder={tProduct('modal.patient.dentistNotesPlaceholder')}
                              value={patientData.dentistNotes}
                              onChange={(e) =>
                                setPatientData((p) => ({
                                  ...p,
                                  dentistNotes: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Step 5: Review */}
                      <div
                        className={currentStep === 4 ? "block" : "hidden"}
                      >
                        <h3 className="text-lg font-semibold mb-4">
                          {tProduct('modal.review.title')}
                        </h3>
                        <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                          <div className="flex justify-between items-center">
                            <span>{tProduct('modal.review.product')}:</span>
                            <span className="font-medium text-right">
                              {productName}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span>{tProduct('modal.review.teeth')}:</span>
                            <span className="font-medium text-right">
                              {selectedTeeth && selectedTeeth.length > 0
                                ? selectedTeeth.join(", ")
                                : tProduct('modal.review.none')}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span>{tProduct('modal.review.color')}:</span>
                            <span className="font-medium text-right">
                              {selectedColor || tProduct('modal.review.notSelected')}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span>{tProduct('modal.review.files')}:</span>
                            <span className="font-medium text-right">
                              {uploadedFiles.length > 0 ? `${uploadedFiles.length} ${tProduct('modal.review.newFiles')}` : (existingStlFileName ? `1 ${tProduct('modal.review.existingFile')}`: tProduct('modal.review.none'))}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span>{tProduct('modal.review.patient')}:</span>
                            <span className="font-medium text-right">
                              {patientData.name || tProduct('modal.review.notInformed')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="pt-4 mt-auto border-t">
                     <div className="flex justify-between w-full items-center">
                        <div className="text-lg font-bold text-primary">
                          {formatCurrency(totalPrice)}
                        </div>
                        <div className="flex items-center gap-2">
                          {currentStep > 0 && (
                            <Button variant="outline" onClick={handleBack}>
                              {tProduct('modal.buttons.back')}
                            </Button>
                          )}

                          {currentStep < STEPS.length - 1 && (
                            <Button onClick={() => handleNext()}>
                              {tProduct('modal.buttons.next')}
                              <ChevronsRight className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                          
                          {currentStep === STEPS.length - 1 && (
                            <Button onClick={handleAddToCart}>
                              {tProduct('modal.buttons.addToCart')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {requiresStl && (
                  <Badge variant="destructive" className="mt-4">
                    {tProduct('requiresStlUpload')}
                  </Badge>
                )}

                <Separator className="my-6" />

                {productTags && productTags.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {tProduct('tags')}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {productTags.map((tag: string) => (
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
                        {tProduct('requiredFiles')}
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
                        {tProduct('optionalFiles')}
                      </h2>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {service.arquivosOpcionais.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {productFlow && productFlow.length > 0 && productFlow[0] !== "N/A" && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    {tProduct('productionFlow')}
                  </h2>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {productFlow.map((step, index) => (
                      <span
                        key={`${step}-${index}`}
                        className="rounded-full border px-3 py-1"
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
