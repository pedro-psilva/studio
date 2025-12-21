"use client";

import { useEffect, useMemo, useState } from "react";
import { File, ListFilter, MoreHorizontal, PlusCircle, Search } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  CouponDocument,
  createCoupon,
  deleteCoupon,
  getCouponStatus,
  listCoupons,
  updateCoupon,
} from "@/lib/couponServiceClean";
import { db } from "@/lib/firebase";

type CollaboratorOption = {
  id: string;
  name: string;
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<CollaboratorOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState<"all" | "active" | "expired" | "draft">("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<"percent" | "fixed" | "free_shipping">("percent");
  const [newValue, setNewValue] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("");
  const [newMinOrderTotal, setNewMinOrderTotal] = useState("");
  const [newActive, setNewActive] = useState(true);
  const [newAssignedToUserId, setNewAssignedToUserId] = useState<string>("none");

  useEffect(() => {
    let isMounted = true;

    async function loadCollaborators() {
      try {
        const colRef = collection(db, 'users');
        const q = query(colRef, where('tipo', '==', 'colaborador'));
        const snap = await getDocs(q);

        const options: CollaboratorOption[] = snap.docs.map((d) => {
          const data = d.data() as any;
          const name = data.displayName || data.clinicName || data.email || 'Sem nome';
          return { id: d.id, name };
        });

        options.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

        if (!isMounted) return;
        setCollaborators(options);
      } catch (err) {
        console.error('Erro ao carregar colaboradores:', err);
      }
    }

    async function loadCoupons() {
      try {
        setLoading(true);
        setError(null);
        const data = await listCoupons();
        if (!isMounted) return;
        setCoupons(data);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message ?? "Erro ao carregar cupons");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCoupons();
    loadCollaborators();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const status = getCouponStatus(coupon);

      if (currentTab === "active" && status !== "Ativo") return false;
      if (currentTab === "expired" && status !== "Expirado") return false;
      if (currentTab === "draft" && status !== "Rascunho") return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          coupon.code.toLowerCase().includes(term) ||
          coupon.description.toLowerCase().includes(term) ||
          (coupon.assignedToName ?? '').toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [coupons, currentTab, searchTerm]);

  function formatDiscount(coupon: CouponDocument) {
    if (coupon.type === "percent") {
      return `${coupon.value}%`;
    }
    if (coupon.type === "fixed") {
      return coupon.value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    }
    return "Frete Grátis";
  }

  function formatUses(coupon: CouponDocument) {
    if (coupon.maxUses == null) {
      return `${coupon.usedCount} / ∞`;
    }
    return `${coupon.usedCount} / ${coupon.maxUses}`;
  }

  function formatValidity(coupon: CouponDocument) {
    if (!coupon.validFrom && !coupon.validUntil) return "Sem validade";
    if (!coupon.validUntil)
      return `A partir de ${coupon.validFrom?.toLocaleDateString("pt-BR")}`;
    if (!coupon.validFrom)
      return `Até ${coupon.validUntil.toLocaleDateString("pt-BR")}`;
    return `${coupon.validFrom.toLocaleDateString("pt-BR")} - ${coupon.validUntil.toLocaleDateString("pt-BR")}`;
  }

  async function handleCreateCoupon() {
    if (isSaving) return;
    const trimmedCode = newCode.trim();
    if (!trimmedCode || !newValue.trim()) return;

    const valueNumber = Number(newValue.replace(/,/g, "."));
    if (Number.isNaN(valueNumber) || valueNumber <= 0) return;

    const maxUsesNumber = newMaxUses.trim() ? Number(newMaxUses.trim()) : null;
    const minOrderNumber = newMinOrderTotal.trim()
      ? Number(newMinOrderTotal.trim().replace(/,/g, "."))
      : 0;

    if (maxUsesNumber !== null && (Number.isNaN(maxUsesNumber) || maxUsesNumber < 0)) {
      return;
    }

    try {
      setIsSaving(true);

      const assigned =
        newAssignedToUserId && newAssignedToUserId !== 'none'
          ? collaborators.find((c) => c.id === newAssignedToUserId) ?? null
          : null;

      const created = await createCoupon({
        code: trimmedCode,
        description: newDescription.trim(),
        type: newType,
        value: valueNumber,
        maxUses: maxUsesNumber,
        minOrderTotal: minOrderNumber,
        active: newActive,
        assignedToUserId: assigned?.id ?? null,
        assignedToName: assigned?.name ?? null,
        validFrom: null,
        validUntil: null,
      });

      setCoupons((prev) => [created, ...prev]);
      setNewCode("");
      setNewDescription("");
      setNewType("percent");
      setNewValue("");
      setNewMaxUses("");
      setNewMinOrderTotal("");
      setNewActive(true);
      setNewAssignedToUserId('none');
      setIsSheetOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle>Cupons</CardTitle>
              <CardDescription>
                Gerencie os cupons promocionais da sua loja.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por código ou descrição..."
                  className="w-full rounded-lg bg-background pl-8"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() => setIsSheetOpen(true)}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Criar Cupom
                    </span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Novo cupom</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Código</Label>
                      <Input
                        id="code"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                        placeholder="EX: ITLAB25"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Input
                        id="description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Ex: 25% off na primeira compra"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Select value={newType} onValueChange={(v) => setNewType(v as any)}>
                          <SelectTrigger id="type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percent">Percentual</SelectItem>
                            <SelectItem value="fixed">Valor fixo</SelectItem>
                            <SelectItem value="free_shipping">Frete grátis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="value">Valor</Label>
                        <Input
                          id="value"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value.replace(/[^0-9.,]/g, ""))}
                          placeholder={newType === "percent" ? "Ex: 25" : "Ex: 50,00"}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="maxUses">Limite de usos (opcional)</Label>
                        <Input
                          id="maxUses"
                          value={newMaxUses}
                          onChange={(e) => setNewMaxUses(e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="Ex: 100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minOrder">Pedido mínimo (opcional)</Label>
                        <Input
                          id="minOrder"
                          value={newMinOrderTotal}
                          onChange={(e) => setNewMinOrderTotal(e.target.value.replace(/[^0-9.,]/g, ""))}
                          placeholder="Ex: 300,00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Vincular ao colaborador (opcional)</Label>
                      <Select value={newAssignedToUserId} onValueChange={setNewAssignedToUserId}>
                        <SelectTrigger id="assignedTo">
                          <SelectValue placeholder="Nenhum" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {collaborators.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <Label htmlFor="active">Ativo</Label>
                      </div>
                      <Switch
                        id="active"
                        checked={newActive}
                        onCheckedChange={setNewActive}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsSheetOpen(false);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCreateCoupon}
                        disabled={isSaving}
                      >
                        {isSaving ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="expired">Expirados</TabsTrigger>
              <TabsTrigger value="draft" className="hidden sm:flex">
                Rascunho
              </TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab} className="mt-4">
              {loading ? (
                <div className="py-8 text-sm text-muted-foreground">
                  Carregando cupons...
                </div>
              ) : error ? (
                <div className="py-8 text-sm text-destructive">{error}</div>
              ) : filteredCoupons.length === 0 ? (
                <div className="py-8 text-sm text-muted-foreground">
                  Nenhum cupom encontrado.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead className="hidden lg:table-cell">Colaborador</TableHead>
                      <TableHead className="hidden md:table-cell">Usos</TableHead>
                      <TableHead className="hidden md:table-cell">Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoupons.map((coupon) => {
                      const status = getCouponStatus(coupon);

                      return (
                        <TableRow key={coupon.id}>
                          <TableCell className="font-medium">{coupon.code}</TableCell>
                          <TableCell>
                            {coupon.type === "percent"
                              ? "Percentual"
                              : coupon.type === "fixed"
                              ? "Valor Fixo"
                              : "Frete Grátis"}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatDiscount(coupon)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {coupon.assignedToName ?? '-'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatUses(coupon)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatValidity(coupon)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                status === "Ativo"
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : status === "Expirado"
                                  ? "bg-destructive/10 text-destructive border-destructive/30"
                                  : "bg-muted text-muted-foreground border-muted"
                              }
                            >
                              {status}
                            </Badge>
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
                                  onClick={() =>
                                    updateCoupon(coupon.id, { active: !coupon.active }).then(
                                      () => {
                                        setCoupons((prev) =>
                                          prev.map((c) =>
                                            c.id === coupon.id ? { ...c, active: !c.active } : c
                                          )
                                        );
                                      }
                                    )
                                  }
                                >
                                  {coupon.active ? "Desativar" : "Ativar"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() =>
                                    deleteCoupon(coupon.id).then(() =>
                                      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id))
                                    )
                                  }
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
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>{filteredCoupons.length}</strong> cupom
            {filteredCoupons.length !== 1 && "s"}
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
