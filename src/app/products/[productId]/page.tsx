'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import {
  ShoppingCart,
  ChevronLeft,
  UploadCloud,
  X,
  File as FileIcon,
  ChevronsRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { products, categories } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslation } from '@/hooks/use-translation';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { getCart, setCart, updateCartItems, CartItemFirestore } from '@/lib/cartService';
import { Progress } from '@/components/ui/progress';

const colorOptions = {
  "VITA CLASSIC": {
    "Tonalidades A": ["A1", "A2", "A3", "A3.5", "A4"],
    "Tonalidades B": ["B1", "B2", "B3", "B4"],
    "Tonalidades C": ["C1", "C2", "C3", "C4"],
    "Tonalidades D": ["D1", "D2", "D3", "D4"],
  },
  "DENTES CLAREADOS": {
    "e.max Cad": ["BL1", "BL2", "BL3", "BL4"],
    "Rosetta": ["W1", "W2", "W3", "W4"],
  },
  "VITA 3D MASTER": {
    "Tonalidades 0": ["0M1", "0M2", "0M3"],
    "Tonalidades 1": ["1M1", "1M2"],
    "Tonalidades 2": ["2L2.5", "2M1", "2M2", "2M3", "2R2.5"],
    "Tonalidades 3": ["3L2.5", "3M1", "3M2", "3M3", "3R1.5", "3R2.5"],
    "Tonalidades 4": ["4L2.5", "4R2.5", "4R1.5", "4M1", "4M2", "4M3"],
    "Tonalidades 5": ["5M1", "5M2", "5M3"],
  }
};

const teethData = {
    upper: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
    lower: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
};

const STEPS = [
    { id: 'teeth', title: 'Seleção de Dentes' },
    { id: 'color', title: 'Cor e Material' },
    { id: 'files', title: 'Upload de Arquivos' },
    { id: 'patient', title: 'Ficha do Paciente' },
    { id: 'review', title: 'Revisão' },
];

export default function ProductDetailPage() {
  const params = useParams();
  const { productId } = params;
  const { t } = useTranslation('home');
  const router = useRouter();
  const { user } = useAuth();

  const product = products.find((p) => p.id === productId);
  
  // State for customization flow
  const [selectedImage, setSelectedImage] = useState(product?.images[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [patientData, setPatientData] = useState({ name: '', age: '', clinicalNotes: '', dentistNotes: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const progress = useMemo(() => ((currentStep + 1) / STEPS.length) * 100, [currentStep]);
  
  if (!product) {
    notFound();
  }

  const productImages = product.images
    .map((imageId) => PlaceHolderImages.find((p) => p.id === imageId))
    .filter(Boolean) as any[];

  const mainImage = selectedImage
    ? PlaceHolderImages.find((p) => p.id === selectedImage)
    : productImages[0];
    
  const category = categories.find(c => c.id === product.categoryId);

  const resetFlow = () => {
    setCurrentStep(0);
    setSelectedTeeth([]);
    setSelectedColor(null);
    setUploadedFiles([]);
    setPatientData({ name: '', age: '', clinicalNotes: '', dentistNotes: '' });
    setFormErrors({});
  };

  const openModal = () => {
    resetFlow();
    setIsModalOpen(true);
  }

  const validateStep = () => {
    const errors: Record<string, string> = {};
    if (currentStep === 0 && product.requiresStl && selectedTeeth.length === 0) {
        errors.teeth = 'Selecione ao menos 1 dente.';
    }
    if (currentStep === 2 && uploadedFiles.length === 0 && product.requiresStl) {
        errors.files = 'Envie ao menos 1 arquivo clínico.';
    }
    if (currentStep === 3 && !patientData.name && product.requiresStl) {
        errors.patientName = 'O nome do paciente é obrigatório.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleNext = () => {
    if (validateStep()) {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleAddToCart();
        }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!validateStep()) return;

    // TODO: Handle file upload to Firebase Storage and get URLs
    const stlFileUrl = uploadedFiles.length > 0 ? uploadedFiles[0].name : undefined;

    const cartItem: CartItemFirestore = {
      productId: product.id,
      quantity: 1, // Assuming 1 case per customization
      teeth: selectedTeeth,
      shade: selectedColor || undefined,
      material: product.variants.materials[0] || undefined,
      implantSystem: product.variants.implantSystems?.[0] || undefined,
      stlFileUrl, // Placeholder
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
      router.push('/cart');
    } catch (error) {
      console.error('Erro ao adicionar item ao carrinho:', error);
    }
  };
  
  const toggleTooth = (tooth: number) => {
    setSelectedTeeth(prev => 
        prev.includes(tooth) ? prev.filter(t => t !== tooth) : [...prev, tooth].sort((a,b) => a-b)
    );
  };

  const selectSmileTeeth = () => {
    setSelectedTeeth([15, 14, 13, 12, 11, 21, 22, 23, 24, 25]);
  };
  
  const clearSelection = () => {
    setSelectedTeeth([]);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setUploadedFiles(prev => [...prev, ...files]);
  };
  
  const removeFile = (fileName: string) => {
      setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  }


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Image Gallery */}
            <div>
              <div className="mb-4">
                {mainImage && (
                    <Image
                        src={mainImage.imageUrl}
                        alt={product.name}
                        width={800}
                        height={600}
                        className="w-full aspect-square md:aspect-[4/3] rounded-lg object-cover border"
                    />
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.id)}
                    className={`rounded-lg overflow-hidden border-2 ${selectedImage === img.id ? 'border-primary' : 'border-transparent'}`}
                  >
                    <Image
                      src={img.imageUrl}
                      alt={product.name}
                      width={200}
                      height={150}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <Link href="/products" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-2">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Voltar para produtos
                </Link>
                {category && <Badge variant="outline">{t(`categories.${category.id}`)}</Badge>}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">{product.name}</h1>
              <p className="text-sm text-muted-foreground mb-4">Código: {product.code}</p>
              <p className="text-3xl font-bold text-primary mb-6">
                R$ {product.price.toFixed(2)}
              </p>
              
              <p className="text-muted-foreground mb-6">{product.description}</p>

              <Separator className="my-6" />

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full sm:w-auto flex-1" onClick={openModal}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {product.requiresStl ? 'Personalizar e Comprar' : 'Adicionar ao Carrinho'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Personalize seu Produto: {product.name}</DialogTitle>
                    <DialogDescription>
                      Passo {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].title}
                    </DialogDescription>
                    <Progress value={progress} className="mt-2" />
                  </DialogHeader>
                  
                    <div className="flex-1 overflow-y-auto pr-6 -mr-6">
                        {/* Step 1: Teeth Selection */}
                        <div className={currentStep === 0 ? 'block' : 'hidden'}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-3">
                                    <h3 className="font-semibold mb-4 text-center">Selecione os dentes (Padrão FDI)</h3>
                                    {/* Upper Arch */}
                                    <div className="flex justify-center items-center gap-1 bg-muted/50 p-2 rounded-t-full">
                                        {teethData.upper.map(tooth => (
                                            <Button key={tooth} variant={selectedTeeth.includes(tooth) ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0" onClick={() => toggleTooth(tooth)}>{tooth}</Button>
                                        ))}
                                    </div>
                                    {/* Lower Arch */}
                                    <div className="flex justify-center items-center gap-1 bg-muted/50 p-2 rounded-b-full mt-2">
                                        {teethData.lower.map(tooth => (
                                            <Button key={tooth} variant={selectedTeeth.includes(tooth) ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0" onClick={() => toggleTooth(tooth)}>{tooth}</Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-1 border-l pl-4">
                                    <h4 className="font-semibold mb-2">Dentes Selecionados</h4>
                                    <div className="flex flex-wrap gap-2 mb-4 min-h-[50px]">
                                        {selectedTeeth.length > 0 ? selectedTeeth.map(t => <Badge key={t}>{t}</Badge>) : <p className="text-xs text-muted-foreground">Nenhum</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Button onClick={selectSmileTeeth} size="sm" variant="secondary" className="w-full">Sorriso (10 dentes)</Button>
                                        <Button onClick={clearSelection} size="sm" variant="ghost" className="w-full text-destructive">Limpar seleção</Button>
                                    </div>
                                    {formErrors.teeth && <p className="text-sm text-destructive mt-2">{formErrors.teeth}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Color Selection */}
                        <div className={currentStep === 1 ? 'block' : 'hidden'}>
                            <h3 className="text-lg font-semibold mb-4">SELECIONE A COR DESEJADA</h3>
                            <RadioGroup value={selectedColor || ""} onValueChange={setSelectedColor}>
                                <Accordion type="multiple" className="w-full" defaultValue={['VITA CLASSIC']}>
                                    {Object.entries(colorOptions).map(([system, subGroups]) => (
                                    <AccordionItem value={system} key={system}>
                                        <AccordionTrigger className="text-md font-medium">{system}</AccordionTrigger>
                                        <AccordionContent>
                                        <div className="pl-4">
                                        <Accordion type="multiple" className="w-full" defaultValue={Object.keys(subGroups)}>
                                            {Object.entries(subGroups).map(([groupName, colors]) => (
                                            <AccordionItem value={groupName} key={groupName}>
                                                <AccordionTrigger className="text-sm">{groupName}</AccordionTrigger>
                                                <AccordionContent>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-2">
                                                    {colors.map((color) => (
                                                    <Label key={color} htmlFor={color} className={`flex items-center justify-center p-3 rounded-md border-2 cursor-pointer transition-colors ${selectedColor === color ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                                                        <RadioGroupItem value={color} id={color} className="sr-only" />
                                                        <span>{color}</span>
                                                    </Label>
                                                    ))}
                                                </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                            ))}
                                        </Accordion>
                                        </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                    ))}
                                </Accordion>
                            </RadioGroup>
                        </div>

                         {/* Step 3: File Upload */}
                         <div className={currentStep === 2 ? 'block' : 'hidden'}>
                            <h3 className="text-lg font-semibold mb-4">Upload de Arquivos Clínicos</h3>
                            <div className="space-y-4">
                                <label 
                                    htmlFor="file-upload" 
                                    className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleFileDrop}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                                        <p className="text-xs text-muted-foreground">Arquivos STL, PLY, OBJ (MAX. 100MB)</p>
                                    </div>
                                    <input id="file-upload" type="file" className="hidden" multiple onChange={handleFileChange} />
                                </label>
                                {formErrors.files && <p className="text-sm text-destructive mt-2">{formErrors.files}</p>}

                                {uploadedFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold">Arquivos Carregados:</h4>
                                        <ul className="space-y-2">
                                            {uploadedFiles.map((file, i) => (
                                                <li key={i} className="flex items-center justify-between p-2 rounded-md bg-muted">
                                                    <div className="flex items-center gap-2">
                                                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                                                        <span className="text-sm">{file.name}</span>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(file.name)}>
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
                        <div className={currentStep === 3 ? 'block' : 'hidden'}>
                            <h3 className="text-lg font-semibold mb-4">Ficha do Paciente</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <DialogFooter className="pt-4 border-t flex-col-reverse sm:flex-row sm:justify-between">
                    <div>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button variant="ghost" className="ml-2">Salvar Rascunho</Button>
                    </div>
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
                        Voltar
                      </Button>
                      <Button onClick={handleNext}>
                        {currentStep === STEPS.length - 1 ? 'Concluir e Adicionar ao Carrinho' : 'Avançar'}
                        <ChevronsRight className="ml-2 h-4 w-4" />
                      </Button>
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
