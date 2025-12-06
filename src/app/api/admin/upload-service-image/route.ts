'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { ServiceDocument } from '@/lib/serviceService';
import { createService, deleteService, listServices, updateService } from '@/lib/serviceService';
import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const PRODUCTION_STEPS = [
  'Recebimento',
  'Modelagem',
  'Fresagem',
  'Acabamento',
  'Envio',
] as const;

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

function getStatusLabel(service: ServiceDocument): string {
  if (service.ativo) return 'Ativo';
  return 'Inativo';
}

function isUploadRequired(service: ServiceDocument): boolean {
  return (service.arquivosNecessarios ?? []).length > 0;
}

function generateServiceCode(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 12) || 'SERVICO';

  const suffix = Date.now().toString(36).toUpperCase().slice(-4);
  return `${base}-${suffix}`;
}

export default function ProductsPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilterEnabled, setStatusFilterEnabled] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [newActive, setNewActive] = useState(true);
  const [newVisibility, setNewVisibility] = useState<'publico' | 'interno'>('publico');
  const [newPriceVisibility, setNewPriceVisibility] =
    useState<'exibido' | 'escondido'>('exibido');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newPrazoEntrega, setNewPrazoEntrega] = useState('7');
  const [newFluxoProducao, setNewFluxoProducao] = useState<string[]>([]);
  const [newTags, setNewTags] = useState('');
  const [newArquivosNecessarios, setNewArquivosNecessarios] = useState('');
  const [newArquivosOpcionais, setNewArquivosOpcionais] = useState('');
  const [newCustomFieldsText, setNewCustomFieldsText] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImageFile2, setNewImageFile2] = useState<File | null>(null);
  const [newImageFile3, setNewImageFile3] = useState<File | null>(null);
  const [newImageFile4, setNewImageFile4] = useState<File | null>(null);
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newColor, setNewColor] = useState('#4F46E5');

  useEffect(() => {
    let isMounted = true;

    async function loadServices() {
      try {
        setLoading(true);
        setError(null);
        const data = await listServices();
        if (!isMounted) return;
        setServices(data);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message ?? 'Erro ao carregar produtos');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredServices = useMemo(() => {
    let result = [...services];

    if (statusFilterEnabled) {
      result = result.filter((service) => service.ativo);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((service) => {
        return (
          service.nome.toLowerCase().includes(term) ||
          service.codigo.toLowerCase().includes(term) ||
          (service.descricao || '').toLowerCase().includes(term)
        );
      });
    }

    return result;
  }, [services, statusFilterEnabled, searchTerm]);

  function resetFormState() {
    setNewActive(true);
    setNewVisibility('publico');
    setNewPriceVisibility('exibido');
    setNewName('');
    setNewDescription('');
    setNewPrice('');
    setNewPrazoEntrega('7');
    setNewFluxoProducao([]);
    setNewTags('');
    setNewArquivosNecessarios('');
    setNewArquivosOpcionais('');
    setNewCustomFieldsText('');
    setNewImageFile(null);
    setNewImageFile2(null);
    setNewImageFile3(null);
    setNewImageFile4(null);
    setNewPromoTitle('');
    setNewColor('#4F46E5');
  }

  function openCreateDialog() {
    setEditingServiceId(null);
    resetFormState();
    setIsSheetOpen(true);
  }

  function openEditDialog(service: ServiceDocument) {
    setEditingServiceId(service.id);
    setNewActive(service.ativo);
    setNewVisibility(service.visibilidade);
    setNewPriceVisibility(service.visibilidadePreco);
    setNewName(service.nome);
    setNewDescription(service.descricao ?? '');
    setNewPrice(service.precoBase.toFixed(2).replace('.', ','));
    setNewPrazoEntrega(String(service.prazoEntrega));
    setNewFluxoProducao(service.fluxoProducao ?? []);
    setNewTags((service.tags ?? []).join(', '));
    setNewArquivosNecessarios((service.arquivosNecessarios ?? []).join(', '));
    setNewArquivosOpcionais((service.arquivosOpcionais ?? []).join(', '));
    setNewCustomFieldsText(
      (service.camposPersonalizados ?? [])
        .map((field) => field.label)
        .join('\n')
    );
    setNewImageFile(null);
    setNewPromoTitle(service.tituloPromocional ?? '');
    setNewColor(service.corRepresentacao ?? '#4F46E5');
    setIsSheetOpen(true);
  }

  async function handleSaveService() {
    if (!newName.trim() || !newPrice.trim()) {
      toast({
        title: 'Dados incompletos',
        description: 'Preencha pelo menos o nome e o preço base.',
        variant: 'destructive',
      });
      return;
    }

    const priceNumber = Number(
      newPrice
        .replace(/\./g, '')
        .replace(/,/g, '.')
        .trim()
    );

    if (Number.isNaN(priceNumber)) {
      return;
    }

    const prazoNumber = Number(newPrazoEntrega.trim() || '0');

    const tags = newTags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const arquivosNecessarios = newArquivosNecessarios
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const arquivosOpcionais = newArquivosOpcionais
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    let camposPersonalizados: any[] = [];
    if (newCustomFieldsText.trim()) {
      const lines = newCustomFieldsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      camposPersonalizados = lines.map((label) => {
        const id = label
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');

        return {
          id: id || 'campo_personalizado',
          label,
          tipo: 'texto',
          obrigatorio: false,
        };
      });
    }

    try {
      const existing = editingServiceId
        ? services.find((s) => s.id === editingServiceId)
        : null;

      // código base para nomear pasta/arquivo no Storage
      const generatedCode = !editingServiceId
        ? generateServiceCode(newName.trim())
        : existing?.codigo ?? generateServiceCode(newName.trim());

      let imageUrl = existing?.imagemUrl ?? '';
      let imagensSecundarias = existing?.imagensSecundarias ?? [];

      // upload das imagens (se houver arquivos novos) direto no Firebase Storage
      if (newImageFile) {
        const fileRef = ref(
          storage,
          `services-images/${generatedCode}/hero-${Date.now()}-${newImageFile.name}`
        );
        const snapshot = await uploadBytes(fileRef, newImageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const secundarias: string[] = [...imagensSecundarias];

      if (newImageFile2) {
        const fileRef = ref(
          storage,
          `services-images/${generatedCode}/close-${Date.now()}-${newImageFile2.name}`
        );
        const snapshot = await uploadBytes(fileRef, newImageFile2);
        const url = await getDownloadURL(snapshot.ref);
        secundarias[0] = url;
      }

      if (newImageFile3) {
        const fileRef = ref(
          storage,
          `services-images/${generatedCode}/tecnica-${Date.now()}-${newImageFile3.name}`
        );
        const snapshot = await uploadBytes(fileRef, newImageFile3);
        const url = await getDownloadURL(snapshot.ref);
        secundarias[1] = url;
      }

      if (newImageFile4) {
        const fileRef = ref(
          storage,
          `services-images/${generatedCode}/clinica-${Date.now()}-${newImageFile4.name}`
        );
        const snapshot = await uploadBytes(fileRef, newImageFile4);
        const url = await getDownloadURL(snapshot.ref);
        secundarias[2] = url;
      }

      imagensSecundarias = secundarias.filter(Boolean);

      if (!editingServiceId) {
        const payload = {
          ativo: newActive,
          visibilidade: newVisibility,
          nome: newName.trim(),
          codigo: generatedCode,
          descricao: newDescription.trim(),
          precoBase: priceNumber,
          visibilidadePreco: newPriceVisibility,
          prazoEntrega: prazoNumber,
          fluxoProducao: newFluxoProducao,
          tags,
          arquivosNecessarios,
          arquivosOpcionais,
          camposPersonalizados,
          imagemUrl: imageUrl,
          imagensSecundarias,
          tituloPromocional: newPromoTitle.trim(),
          corRepresentacao: newColor.trim() || '#4F46E5',
        };

        const created = await createService(payload);
        setServices((prev) => [created, ...prev]);

        toast({
          title: 'Produto criado',
          description: 'O produto/serviço foi criado com sucesso.',
        });
      } else {
        await updateService(editingServiceId, {
          ativo: newActive,
          visibilidade: newVisibility,
          nome: newName.trim(),
          descricao: newDescription.trim(),
          precoBase: priceNumber,
          visibilidadePreco: newPriceVisibility,
          prazoEntrega: prazoNumber,
          fluxoProducao: newFluxoProducao,
          tags,
          arquivosNecessarios,
          arquivosOpcionais,
          camposPersonalizados,
          imagemUrl: imageUrl,
          imagensSecundarias,
          tituloPromocional: newPromoTitle.trim(),
          corRepresentacao: newColor.trim() || '#4F46E5',
        });

        setServices((prev) =>
          prev.map((service) =>
            service.id === editingServiceId
              ? {
                  ...service,
                  ativo: newActive,
                  visibilidade: newVisibility,
                  nome: newName.trim(),
                  descricao: newDescription.trim(),
                  precoBase: priceNumber,
                  visibilidadePreco: newPriceVisibility,
                  prazoEntrega: prazoNumber,
                  fluxoProducao: newFluxoProducao,
                  tags,
                  arquivosNecessarios,
                  arquivosOpcionais,
                  camposPersonalizados,
                  imagemUrl: imageUrl,
                  imagensSecundarias,
                  tituloPromocional: newPromoTitle.trim(),
                  corRepresentacao: newColor.trim() || '#4F46E5',
                }
              : service
          )
        );

        toast({
          title: 'Produto atualizado',
          description: 'As alterações foram salvas com sucesso.',
        });
      }

      resetFormState();
      setEditingServiceId(null);
      setIsSheetOpen(false);
    } catch (error) {
      toast({
        title: 'Erro ao salvar produto',
        description: 'Ocorreu um erro ao salvar. Tente novamente.',
        variant: 'destructive',
      });
    }
  }

  async function handleDuplicateService(service: ServiceDocument) {
    try {
      const payload = {
        ativo: service.ativo,
        visibilidade: service.visibilidade,
        nome: `${service.nome} (cópia)`,
        codigo: generateServiceCode(service.nome),
        descricao: service.descricao,
        precoBase: service.precoBase,
        visibilidadePreco: service.visibilidadePreco,
        prazoEntrega: service.prazoEntrega,
        fluxoProducao: service.fluxoProducao ?? [],
        tags: service.tags ?? [],
        arquivosNecessarios: service.arquivosNecessarios ?? [],
        arquivosOpcionais: service.arquivosOpcionais ?? [],
        camposPersonalizados: service.camposPersonalizados ?? [],
        imagemUrl: service.imagemUrl,
        imagensSecundarias: service.imagensSecundarias ?? [],
        tituloPromocional: service.tituloPromocional,
        corRepresentacao: service.corRepresentacao,
      };

      const created = await createService(payload);
      setServices((prev) => [created, ...prev]);

      toast({
        title: 'Produto duplicado',
        description: 'Uma cópia do produto foi criada.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao duplicar',
        description: 'Não foi possível duplicar o produto.',
        variant: 'destructive',
      });
    }
  }

  async function handleArchiveService(service: ServiceDocument) {
    try {
      await updateService(service.id, { ativo: false });
      setServices((prev) =>
        prev.map((item) =>
          item.id === service.id
            ? {
                ...item,
                ativo: false,
              }
            : item
        )
      );

      toast({
        title: 'Produto arquivado',
        description: 'O produto foi marcado como inativo.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao arquivar',
        description: 'Não foi possível arquivar o produto.',
        variant: 'destructive',
      });
    }
  }

  async function handleDeleteService(service: ServiceDocument) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o produto "${service.nome}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    try {
      await deleteService(service.id);
      setServices((prev) => prev.filter((item) => item.id !== service.id));

      toast({
        title: 'Produto excluído',
        description: 'O produto foi removido com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o produto.',
        variant: 'destructive',
      });
    }
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle>Produtos</CardTitle>
              <CardDescription>
                Gerencie seus produtos e serviços.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, código..."
                  className="w-full rounded-lg bg-background pl-8"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filtro
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem disabled checked={false}>
                      Categoria
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilterEnabled}
                      onCheckedChange={(checked) =>
                        setStatusFilterEnabled(Boolean(checked))
                      }
                    >
                      Status (somente ativos)
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      size="sm"
                      className="h-8 gap-1"
                      onClick={openCreateDialog}
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Adicionar Produto
                      </span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-2xl">
                    <SheetHeader>
                      <SheetTitle>
                        {editingServiceId ? 'Editar produto/serviço' : 'Novo produto/serviço'}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                      <Tabs defaultValue="basic">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="basic">Básico</TabsTrigger>
                          <TabsTrigger value="production">Produção</TabsTrigger>
                          <TabsTrigger value="media">Mídia</TabsTrigger>
                          <TabsTrigger value="advanced">Avançado</TabsTrigger>
                        </TabsList>
                        <div className="mt-4 max-h-[75vh] overflow-y-auto p-1">
                          <TabsContent value="basic" className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" value={newName} onChange={(event) => setNewName(event.target.value)} />
                              </div>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="price">Preço base</Label>
                                  <Input id="price" value={newPrice} onChange={(event) => setNewPrice(event.target.value)} placeholder="Ex: 350,00" />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="priceVisibility">Visibilidade do preço</Label>
                                  <Select value={newPriceVisibility} onValueChange={(value) => setNewPriceVisibility(value as 'exibido' | 'escondido')}>
                                    <SelectTrigger id="priceVisibility"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="exibido">Exibido</SelectItem>
                                      <SelectItem value="escondido">Escondido</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea id="description" value={newDescription} onChange={(event) => setNewDescription(event.target.value)} />
                              </div>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <Label htmlFor="active">Ativo</Label>
                                    <p className="text-xs text-muted-foreground">Define se o produto está visível para uso.</p>
                                  </div>
                                  <Switch id="active" checked={newActive} onCheckedChange={setNewActive} />
                                </div>
                                <div className="space-y-2 rounded-lg border p-4">
                                  <Label htmlFor="visibility">Visibilidade</Label>
                                  <Select value={newVisibility} onValueChange={(value) => setNewVisibility(value as 'publico' | 'interno')}>
                                    <SelectTrigger id="visibility"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="publico">Público</SelectItem>
                                      <SelectItem value="interno">Interno</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                               <div className="space-y-2">
                                <Label htmlFor="tags">Tags (separe por vírgula)</Label>
                                <Input id="tags" value={newTags} onChange={(event) => setNewTags(event.target.value)} placeholder="zircônia, coroa, posterior" />
                              </div>
                          </TabsContent>
                          <TabsContent value="production" className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="prazoEntrega">Prazo de entrega (dias)</Label>
                                <Input id="prazoEntrega" type="number" min={0} value={newPrazoEntrega} onChange={(event) => setNewPrazoEntrega(event.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <Label>Fluxo de produção</Label>
                                <div className="grid gap-1 md:grid-cols-2">
                                  {PRODUCTION_STEPS.map((step) => (
                                    <label key={step} className="flex items-center gap-2 text-sm">
                                      <Checkbox checked={newFluxoProducao.includes(step)} onCheckedChange={(checked) => {
                                          setNewFluxoProducao((prev) => {
                                            if (checked) return [...prev, step];
                                            return prev.filter((item) => item !== step);
                                          });
                                        }} />
                                      <span>{step}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="arquivosNecessarios">Arquivos necessários (separe por vírgula)</Label>
                                <Input id="arquivosNecessarios" value={newArquivosNecessarios} onChange={(event) => setNewArquivosNecessarios(event.target.value)} placeholder="Modelo digital superior, Modelo digital inferior, ..." />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="arquivosOpcionais">Arquivos opcionais (separe por vírgula)</Label>
                                <Input id="arquivosOpcionais" value={newArquivosOpcionais} onChange={(event) => setNewArquivosOpcionais(event.target.value)} placeholder="Foto sorriso, Rx panorâmica, ..." />
                              </div>
                          </TabsContent>
                          <TabsContent value="media" className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="imagemArquivo">Foto 1 — Hero Estético</Label>
                                <Input id="imagemArquivo" type="file" accept="image/*" onChange={(event) => setNewImageFile(event.target.files?.[0] ?? null)} />
                                <p className="text-xs text-muted-foreground">Imagem principal do produto, usada como destaque.</p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="imagemArquivo2">Foto 2 — Close-up do Material</Label>
                                <Input id="imagemArquivo2" type="file" accept="image/*" onChange={(event) => setNewImageFile2(event.target.files?.[0] ?? null)} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="imagemArquivo3">Foto 3 — Técnica / CAD-CAM</Label>
                                <Input id="imagemArquivo3" type="file" accept="image/*" onChange={(event) => setNewImageFile3(event.target.files?.[0] ?? null)} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="imagemArquivo4">Foto 4 — Aplicação Clínica</Label>
                                <Input id="imagemArquivo4" type="file" accept="image/*" onChange={(event) => setNewImageFile4(event.target.files?.[0] ?? null)} />
                              </div>
                          </TabsContent>
                           <TabsContent value="advanced" className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="tituloPromocional">Título promocional</Label>
                                <Input id="tituloPromocional" value={newPromoTitle} onChange={(event) => setNewPromoTitle(event.target.value)} placeholder="Lançamento com 10% OFF" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="corRepresentacao">Cor de representação</Label>
                                <Input id="corRepresentacao" type="text" value={newColor} onChange={(event) => setNewColor(event.target.value)} placeholder="#4F46E5" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="camposPersonalizados">Campos personalizados (um por linha)</Label>
                                <Textarea id="camposPersonalizados" value={newCustomFieldsText} onChange={(event) => setNewCustomFieldsText(event.target.value)} placeholder={'Observações clínicas\nObservações do paciente\nInstruções ao laboratório'} />
                                <p className="text-xs text-muted-foreground">Cada linha será convertida em um campo de texto opcional.</p>
                              </div>
                           </TabsContent>
                        </div>
                         <div className="flex justify-end gap-2 pt-6 border-t mt-4">
                          <Button type="button" variant="outline" onClick={() => { setIsSheetOpen(false); setEditingServiceId(null); resetFormState(); }}>Cancelar</Button>
                          <Button type="button" onClick={handleSaveService}>
                            {editingServiceId ? 'Salvar alterações' : 'Salvar'}
                          </Button>
                        </div>
                      </Tabs>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
              {loading ? (
                <div className="py-8 text-sm text-muted-foreground">
                  Carregando produtos...
                </div>
              ) : error ? (
                <div className="py-8 text-sm text-destructive">{error}</div>
              ) : filteredServices.length === 0 ? (
                <div className="py-8 text-sm text-muted-foreground">
                  Nenhum produto encontrado.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden w-[100px] sm:table-cell">
                        Imagem
                      </TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Upload Obrigatório
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Preço
                      </TableHead>
                      <TableHead>
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => {
                      const statusLabel = getStatusLabel(service);
                      const uploadRequired = isUploadRequired(service);

                      return (
                        <TableRow key={service.id}>
                          <TableCell className="hidden sm:table-cell">
                            {service.imagemUrl && (
                              <Image
                                alt={service.nome}
                                className="aspect-square rounded-md object-cover"
                                height={64}
                                src={service.imagemUrl}
                                width={64}
                              />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {service.nome}
                          </TableCell>
                          <TableCell>{service.codigo}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                statusLabel === 'Ativo' ? 'outline' : 'secondary'
                              }
                            >
                              {statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {uploadRequired ? 'Sim' : 'Não'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatCurrency(service.precoBase)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => openEditDialog(service)}
                                >
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDuplicateService(service)}
                                >
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleArchiveService(service)}
                                >
                                  Arquivar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteService(service)}
                                >
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>{filteredServices.length}</strong> produtos
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}