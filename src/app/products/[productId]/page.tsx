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

interface ToothPosition {
  tooth: number;
  top: string;
  left: string;
}

interface ToothButtonProps {
  tooth: number;
  isSelected: boolean;
  onClick: (tooth: number) => void;
  style: React.CSSProperties;
}

function ToothButton({ tooth, isSelected, onClick, style }: ToothButtonProps) {
  return (
    <button
      type="button"
      style={style}
      className={
        "absolute flex h-9 w-9 items-center justify-center rounded-full border text-sm font-light shadow-md transition-all duration-200 active:scale-95 " +
        (isSelected
          // ESTADO SELECIONADO: fundo/borda azul e texto branco
          ? "scale-105 border-blue-500 bg-blue-500 text-white font-medium"
          // ESTADO NORMAL: dente branco no light, translúcido no dark
          : "border-slate-200 bg-white text-slate-900 dark:border-white/20 dark:bg-white/5 dark:text-white hover:border-blue-500")
      }
      onClick={() => onClick(tooth)}
    >
      {tooth}
    </button>
  );
}

const upperArcadePositions: ToothPosition[] = [
  { tooth: 18, top: "120px", left: "80px" },
  { tooth: 17, top: "95px", left: "95px" },
  { tooth: 16, top: "70px", left: "115px" },
  { tooth: 15, top: "45px", left: "140px" },
  { tooth: 14, top: "28px", left: "165px" },
  { tooth: 13, top: "18px", left: "190px" },
  { tooth: 12, top: "12px", left: "218px" },
  { tooth: 11, top: "10px", left: "248px" },
  { tooth: 21, top: "10px", left: "282px" },
  { tooth: 22, top: "12px", left: "312px" },
  { tooth: 23, top: "18px", left: "340px" },
  { tooth: 24, top: "28px", left: "365px" },
  { tooth: 25, top: "45px", left: "390px" },
  { tooth: 26, top: "70px", left: "415px" },
  { tooth: 27, top: "95px", left: "435px" },
  { tooth: 28, top: "120px", left: "450px" },
];

const lowerArcadePositions: ToothPosition[] = [
  { tooth: 48, top: "120px", left: "80px" },
  { tooth: 47, top: "95px", left: "95px" },
  { tooth: 46, top: "70px", left: "115px" },
  { tooth: 45, top: "45px", left: "140px" },
  { tooth: 44, top: "28px", left: "165px" },
  { tooth: 43, top: "18px", left: "190px" },
  { tooth: 42, top: "12px", left: "218px" },
  { tooth: 41, top: "10px", left: "248px" },
  { tooth: 31, top: "10px", left: "282px" },
  { tooth: 32, top: "12px", left: "312px" },
  { tooth: 33, top: "18px", left: "340px" },
  { tooth: 34, top: "28px", left: "365px" },
  { tooth: 35, top: "45px", left: "390px" },
  { tooth: 36, top: "70px", left: "415px" },
  { tooth: 37, top: "95px", left: "435px" },
  { tooth: 38, top: "120px", left: "450px" },
];

function ArcadaSuperiorFDI({
  selectedTeeth,
  onToothClick,
}: {
  selectedTeeth: number[];
  onToothClick: (tooth: number) => void;
}) {
  return (
    <div className="relative w-[540px] h-[200px] bg-transparent">
      {upperArcadePositions.map(({ tooth, top, left }) => (
        <ToothButton
          key={tooth}
          tooth={tooth}
          isSelected={selectedTeeth.includes(tooth)}
          onClick={onToothClick}
          style={{ top, left }}
        />
      ))}
    </div>
  );
}

function ArcadaInferiorFDI({
  selectedTeeth,
  onToothClick,
}: {
  selectedTeeth: number[];
  onToothClick: (tooth: number) => void;
}) {
  return (
    <div className="relative w-[540px] h-[200px] bg-transparent scale-y-[-1]">
      {lowerArcadePositions.map(({ tooth, top, left }) => (
        <ToothButton
          key={tooth}
          tooth={tooth}
          isSelected={selectedTeeth.includes(tooth)}
          onClick={onToothClick}
          style={{ top, left, transform: "scaleY(-1)" }}
        />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const { productId } = params as { productId: string };
  const { t } = useTranslation("home");
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

  function toggleTooth(tooth: number) {
    setSelectedTeeth((prev) =>
      prev.includes(tooth)
        ? prev.filter((t) => t !== tooth)
        : [...prev, tooth].sort((a, b) => a - b)
    );
  }

  function selectSmileTeeth() {
    setSelectedTeeth([15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35]);
  }

  function clearSelection() {
    setSelectedTeeth([]);
  }

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

    if (currentStep === 2 && requiresStl && uploadedFiles.length === 0) {
      errors.files = "Envie ao menos 1 arquivo clínico.";
    }

    if (currentStep === 3 && requiresStl && !patientData.name) {
      errors.patientName = "O nome do paciente é obrigatório.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleNext() {
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

    // TODO: upload real dos arquivos para Storage e uso das URLs
    const stlFileUrl = uploadedFiles.length > 0 ? uploadedFiles[0].name : undefined;

    const cartItem: CartItemFirestore = {
      productId: service.id,
      quantity: 1,
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

  function handleFileDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setUploadedFiles((prev) => [...prev, ...files]);
  }

  function removeFile(fileName: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
  }

  function handleSaveDraft() {
    if (!service) return;

    try {
      if (typeof window === "undefined") return;

      const draftKey = `serviceDraft:${service.id}`;
      const draft = {
        productId: service.id,
        selectedTeeth,
        selectedColor,
        patientData,
        // não dá para persistir os arquivos completos com File API de forma simples;
        // guardamos apenas os nomes para referência visual futura, se necessário.
        uploadedFileNames: uploadedFiles.map((f) => f.name),
        currentStep,
        createdAt: new Date().toISOString(),
      };

      window.localStorage.setItem(draftKey, JSON.stringify(draft));
      // após salvar o rascunho, avança para o próximo passo (se existir)
      setCurrentStep((prev) =>
        prev < STEPS.length - 1 ? prev + 1 : prev
      );
    } catch (e) {
      console.error("Erro ao salvar rascunho do serviço:", e);
    }
  }

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
                          alt={service.nome}
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
                                alt={`${service.nome} - miniatura ${index + 1}`}
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
                              alt={service.nome}
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
                        ? "Personalizar e Comprar"
                        : "Adicionar ao Carrinho"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        Personalize seu Produto: {service.nome}
                      </DialogTitle>
                      <DialogDescription>
                        Passo {currentStep + 1} de {STEPS.length}: {" "}
                        {STEPS[currentStep].title}
                      </DialogDescription>
                      <Progress value={progress} className="mt-2" />
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-6 -mr-6">
                      {/* Step 1: Teeth Selection com arcada FDI antiga */}
                      <div className={currentStep === 0 ? "block" : "hidden"}>
                        <h3 className="text-lg font-semibold mb-4 text-center">
                          Selecione os dentes
                        </h3>

                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                          <div className="flex-1 flex flex-col items-center justify-center py-1 scale-95 md:scale-100">
                            <ArcadaSuperiorFDI
                              selectedTeeth={selectedTeeth}
                              onToothClick={toggleTooth}
                            />
                            <div className="h-2" />
                            <ArcadaInferiorFDI
                              selectedTeeth={selectedTeeth}
                              onToothClick={toggleTooth}
                            />
                          </div>

                          <div className="w-full md:w-64 lg:w-72 space-y-4">
                            <div className="border rounded-md p-3 bg-muted/40 min-h-[80px]">
                              <p className="text-xs font-semibold mb-2">
                                Dentes selecionados
                              </p>
                              {selectedTeeth.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {selectedTeeth.map((tooth) => (
                                    <Badge
                                      key={tooth}
                                      variant="default"
                                      className="relative text-xs bg-primary cursor-pointer hover:bg-primary/80 flex items-center justify-center px-2 py-1 pr-3"
                                      onClick={() => toggleTooth(tooth)}
                                    >
                                      <span>{tooth}</span>
                                      <span className="absolute -top-1 -right-1 text-[9px] leading-none bg-red-600 text-white rounded-full px-1 pb-[1px]">
                                        ×
                                      </span>
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  Nenhum dente selecionado
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                className="w-full"
                                onClick={selectSmileTeeth}
                              >
                                Selecionar sorriso
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={clearSelection}
                              >
                                Limpar seleção
                              </Button>
                            </div>
                          </div>
                        </div>

                        {formErrors.teeth && (
                          <p className="text-sm text-destructive mt-4 text-center">
                            {formErrors.teeth}
                          </p>
                        )}
                      </div>

                      {/* Step 2: Color Selection */}
                      <div
                        className={currentStep === 1 ? "block" : "hidden"}
                      >
                        <h3 className="text-lg font-semibold mb-4">
                          SELECIONE A COR DESEJADA
                        </h3>
                        <RadioGroup
                          value={selectedColor || ""}
                          onValueChange={setSelectedColor}
                        >
                          {/* acordeão de sistemas/tons */}
                          <div className="space-y-2">
                            {Object.entries(colorOptions).map(
                              ([system, subGroups]) => (
                                <div key={system} className="border rounded-md">
                                  <div className="px-4 py-2 font-medium">
                                    {system}
                                  </div>
                                  <div className="px-4 pb-3 space-y-2">
                                    {Object.entries(subGroups).map(
                                      ([groupName, colors]) => (
                                        <div key={groupName}>
                                          <p className="text-xs font-semibold mb-1 text-muted-foreground">
                                            {groupName}
                                          </p>
                                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                            {colors.map((color) => (
                                              <Label
                                                key={color}
                                                htmlFor={color}
                                                className={`flex items-center justify-center p-2 rounded-md border-2 cursor-pointer transition-colors text-xs sm:text-sm ${
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
                                      )
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Step 3: File Upload */}
                      <div
                        className={currentStep === 2 ? "block" : "hidden"}
                      >
                        <h3 className="text-lg font-semibold mb-4">
                          Upload de Arquivos Clínicos
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
                                  Clique para enviar
                                </span>{" "}
                                ou arraste e solte
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Arquivos STL, PLY, OBJ (MAX. 100MB)
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
                              Arquivo atual no caso: <span className="font-medium">{existingStlFileName}</span>. Envie um novo arquivo se desejar substituir.
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
                                Arquivos Carregados:
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
                          Ficha do Paciente
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="patient-name">
                                Nome do Paciente
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
                              <Label htmlFor="patient-age">Idade</Label>
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
                              Observações Clínicas
                            </Label>
                            <Textarea
                              id="clinical-notes"
                              placeholder="Ex: Paciente com histórico de bruxismo..."
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
                              Observações do Dentista
                            </Label>
                            <Textarea
                              id="dentist-notes"
                              placeholder="Ex: Favor conferir o ponto de contato..."
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
                          Revise as informações
                        </h3>
                        <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                          <div className="flex justify-between items-center">
                            <span>Produto:</span>
                            <span className="font-medium text-right">
                              {service.nome}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span>Dentes:</span>
                            <span className="font-medium text-right">
                              {selectedTeeth.length > 0
                                ? selectedTeeth.join(", ")
                                : "Nenhum"}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span>Cor:</span>
                            <span className="font-medium text-right">
                              {selectedColor || "Não selecionada"}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span>Arquivos:</span>
                            <span className="font-medium text-right">
                              {uploadedFiles.length} arquivo(s)
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span>Paciente:</span>
                            <span className="font-medium text-right">
                              {patientData.name || "Não informado"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="pt-4 mt-auto border-t">
                      <div className="flex justify-between w-full">
                        <div />
                        <div className="flex items-center gap-2">
                          {currentStep > 0 && (
                            <Button variant="outline" onClick={handleBack}>
                              Voltar
                            </Button>
                          )}

                          {currentStep === STEPS.length - 1 ? (
                            <>
                              <Button
                                variant="outline"
                                onClick={handleAddToCart}
                              >
                                Adicionar ao carrinho
                              </Button>
                              <Button onClick={handleNext}>
                                Finalizar compra
                                <ChevronsRight className="ml-2 h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button onClick={handleNext}>
                              Avançar
                              <ChevronsRight className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {requiresStl && (
                  <Badge variant="destructive" className="mt-4">
                    Necessário Envio de Arquivo STL
                  </Badge>
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
