'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, orderBy, query, where } from 'firebase/firestore';
import { getService } from '@/lib/serviceService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Activity,
  AlertTriangle,
  Archive,
  CheckCircle,
  ChevronRight,
  FileClock,
  FlaskConical,
  Loader,
} from 'lucide-react';
import { OrderDocument, listUserOrders } from '@/lib/orderService';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface UserDocData {
  displayName?: string;
  email?: string;
  phone?: string;
  tipo?: string; // cliente | admin
  pessoaTipo?: 'PF' | 'PJ';
  cpfCnpj?: string;
  clinicName?: string;
}

const statusMap = {
  pending_payment: { label: 'Aguardando Pagamento', icon: FileClock, color: 'bg-yellow-500' },
  paid: { label: 'Pago', icon: CheckCircle, color: 'bg-emerald-500' },
  in_production: { label: 'Em Produção', icon: FlaskConical, color: 'bg-blue-500' },
  shipped: { label: 'Enviado', icon: CheckCircle, color: 'bg-green-500' },
  delivered: { label: 'Entregue', icon: CheckCircle, color: 'bg-green-700' },
  canceled: { label: 'Cancelado', icon: AlertTriangle, color: 'bg-red-500' },
};


export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [userDoc, setUserDoc] = useState<UserDocData | null>(null);
  const [orders, setOrders] = useState<OrderDocument[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({});
  const [userAddress, setUserAddress] = useState<{
    id?: string;
    cep?: string;
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    number?: string;
    complement?: string;
  } | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<{
    displayName: string;
    countryCode: string;
    ddd: string;
    phoneLocal: string;
    pessoaTipo: 'PF' | 'PJ' | '';
    cpfCnpj: string;
    clinicName: string;
  }>({
    displayName: '',
    countryCode: '55',
    ddd: '',
    phoneLocal: '',
    pessoaTipo: '',
    cpfCnpj: '',
    clinicName: '',
  });
  const [addressForm, setAddressForm] = useState<{
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  }>({ cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' });
  const { toast } = useToast();

  const refreshOrders = async () => {
    if (!user) return;
    try {
      setLoadingExtra(true);
      const userOrders = await listUserOrders(user.uid);
      setOrders(userOrders);

      const productIds = Array.from(
        new Set(
          userOrders
            .flatMap((o) => o.items?.map((i) => i.productId) ?? [])
            .filter(Boolean) as string[],
        ),
      );

      if (productIds.length > 0) {
        const entries = await Promise.all(
          productIds.map(async (pid) => {
            try {
              const service = await getService(pid);
              return [
                pid,
                service?.nome ?? 'Serviço não especificado',
              ] as [string, string];
            } catch {
              return [pid, 'Serviço não especificado'] as [string, string];
            }
          }),
        );
        setServiceNames(Object.fromEntries(entries));
      }
    } catch (err) {
      console.error('Erro ao atualizar pedidos:', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar pedidos',
        description: 'Não foi possível atualizar a lista de pedidos.',
      });
    } finally {
      setLoadingExtra(false);
    }
  };

  const handleVerifyPayment = (order: OrderDocument) => {
    // Redireciona para a página de checkout onde a verificação será feita
    // Se o pedido tiver paymentId salvo, usa como transactionNsu
    if (order.paymentId) {
      router.push(`/checkout/${order.id}?transaction_nsu=${order.paymentId}&slug=infinitepay`);
    } else {
      // Se não tiver, apenas abre a página de checkout para mostrar status
      router.push(`/checkout/${order.id}`);
    }
  };


  const handlePayOrder = async (order: OrderDocument) => {
    // Monta descrição amigável com os nomes dos serviços do pedido
    const serviceList = order.items
      .map((item) => serviceNames[item.productId] || 'Serviço')
      .filter(Boolean)
      .join(', ');

    const items = [
      {
        quantity: 1,
        price: Math.round(order.total * 100),
        description: serviceList || `Pedido clínico`,
      },
    ];

    const customer = {
      name:
        userDoc?.clinicName ||
        userDoc?.displayName ||
        user?.displayName ||
        user?.email ||
        undefined,
      email: user?.email || undefined,
      phone_number: userDoc?.phone || undefined,
    };

    const address = userAddress
      ? {
        cep: userAddress.cep,
        number: userAddress.number,
        complement: userAddress.complement,
      }
      : undefined;

    try {
      const response = await fetch('/api/payments/infinitepay/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          total: order.total,
          items,
          customer,
          address,
        }),
      });

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Erro ao gerar link de pagamento',
          description: 'Tente novamente em alguns instantes.',
        });
        return;
      }

      const data = (await response.json()) as { url?: string };

      if (!data.url) {
        toast({
          variant: 'destructive',
          title: 'Resposta inválida do gateway',
          description: 'Não foi possível obter o link de pagamento.',
        });
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Erro ao gerar link de pagamento:', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar link de pagamento',
        description: 'Verifique sua conexão e tente novamente.',
      });
    }
  };

  // Redireciona visitante não autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  // Carrega dados adicionais do Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoadingExtra(true);
        // Dados do usuário
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data() as UserDocData;
          setUserDoc(data);
          setIsAdmin(data?.tipo === 'admin');
        }

        // Endereço principal do usuário
        const addrCol = collection(db, `users/${user.uid}/addresses`);
        const addrSnap = await getDocs(addrCol);
        if (!addrSnap.empty) {
          const allDocs = addrSnap.docs;
          const mainDoc =
            allDocs.find((d) => (d.data() as any).isPrincipal) ?? allDocs[0];
          const main = mainDoc.data() as any;
          setUserAddress({
            id: mainDoc.id,
            cep: main.cep ?? main.zip ?? main.cepCode,
            street: main.logradouro ?? main.rua ?? main.street,
            neighborhood: main.bairro ?? main.neighborhood,
            city: main.cidade ?? main.city,
            state: main.estado ?? main.uf ?? main.state,
            number: main.numero ?? main.number,
            complement: main.complemento ?? main.complement,
          });
        }

        // Pedidos do usuário
        const userOrders = await listUserOrders(user.uid);
        setOrders(userOrders);

        // Carrega nomes de serviços para os productIds usados nos pedidos
        const productIds = Array.from(
          new Set(
            userOrders
              .flatMap((o) => o.items?.map((i) => i.productId) ?? [])
              .filter(Boolean) as string[]
          )
        );

        if (productIds.length > 0) {
          const entries = await Promise.all(
            productIds.map(async (pid) => {
              try {
                const service = await getService(pid);
                return [
                  pid,
                  service?.nome ?? 'Serviço não especificado',
                ] as [string, string];
              } catch {
                return [pid, 'Serviço não especificado'] as [string, string];
              }
            })
          );
          setServiceNames(Object.fromEntries(entries));
        }

      } catch (err) {
        console.error('Erro ao carregar dados da conta:', err);
      } finally {
        setLoadingExtra(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || !user) {
    return null;
  }

  const displayName = userDoc?.displayName || user.displayName || user.email?.split('@')[0] || 'Usuário';

  const summaryCards = [
    { title: "Casos Pendentes", value: orders.filter(o => o.status === 'pending_payment').length, icon: FileClock, color: "text-yellow-500" },
    { title: "Casos em Andamento", value: orders.filter(o => o.status === 'in_production').length, icon: Loader, color: "text-blue-500" },
    { title: "Casos Finalizados", value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: "text-green-500" },
  ];

  const openEditDialog = () => {
    if (!user) return;
    // Tenta quebrar o telefone salvo em código de país + DDD + número local
    let countryCode = '55';
    let ddd = '';
    let phoneLocal = '';
    if (userDoc?.phone) {
      const digits = userDoc.phone.replace(/\D/g, '');
      if (digits.length >= 4) {
        countryCode = digits.slice(0, 2);
        ddd = digits.slice(2, 4);
        phoneLocal = digits.slice(4);
      }
    }

    setProfileForm({
      displayName:
        userDoc?.displayName || user.displayName || user.email?.split('@')[0] || '',
      countryCode,
      ddd,
      phoneLocal,
      pessoaTipo: userDoc?.pessoaTipo || '',
      cpfCnpj: userDoc?.cpfCnpj || '',
      clinicName: userDoc?.clinicName || '',
    });
    setAddressForm({
      cep: userAddress?.cep || '',
      street: userAddress?.street || '',
      number: userAddress?.number || '',
      complement: userAddress?.complement || '',
      neighborhood: userAddress?.neighborhood || '',
      city: userAddress?.city || '',
      state: userAddress?.state || '',
    });
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      setSavingProfile(true);

      // Validação simples de telefone: código de país + DDD + número local obrigatórios e numéricos
      const ccDigits = profileForm.countryCode.replace(/\D/g, '');
      const dddDigits = profileForm.ddd.replace(/\D/g, '');
      const localDigits = profileForm.phoneLocal.replace(/\D/g, '');

      if (!ccDigits || !dddDigits || !localDigits) {
        toast({
          variant: 'destructive',
          title: 'Telefone incompleto',
          description: 'Informe código de país, DDD e telefone.',
        });
        setSavingProfile(false);
        return;
      }

      if (ccDigits.length < 1 || ccDigits.length > 3) {
        toast({
          variant: 'destructive',
          title: 'Código de país inválido',
          description: 'Use um código de país numérico, por exemplo 55.',
        });
        setSavingProfile(false);
        return;
      }

      if (dddDigits.length < 2 || dddDigits.length > 3) {
        toast({
          variant: 'destructive',
          title: 'DDD inválido',
          description: 'Informe um DDD válido, por exemplo 11.',
        });
        setSavingProfile(false);
        return;
      }

      if (localDigits.length < 8) {
        toast({
          variant: 'destructive',
          title: 'Telefone inválido',
          description: 'Informe um número de telefone válido com 8 ou mais dígitos.',
        });
        setSavingProfile(false);
        return;
      }

      const fullPhone = `+${ccDigits} ${dddDigits} ${localDigits}`;

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: profileForm.displayName || null,
        phone: fullPhone,
        pessoaTipo: profileForm.pessoaTipo || null,
        cpfCnpj: profileForm.cpfCnpj || null,
        clinicName: profileForm.clinicName || null,
      });

      const addrCol = collection(db, `users/${user.uid}/addresses`);
      if (userAddress?.id) {
        const addrRef = doc(addrCol, userAddress.id);
        await updateDoc(addrRef, {
          cep: addressForm.cep || null,
          logradouro: addressForm.street || null,
          numero: addressForm.number || null,
          complemento: addressForm.complement || null,
          bairro: addressForm.neighborhood || null,
          cidade: addressForm.city || null,
          estado: addressForm.state || null,
          isPrincipal: true,
        });
        setUserAddress((prev) =>
          prev
            ? {
              ...prev,
              cep: addressForm.cep,
              street: addressForm.street,
              number: addressForm.number,
              complement: addressForm.complement,
              neighborhood: addressForm.neighborhood,
              city: addressForm.city,
              state: addressForm.state,
            }
            : prev,
        );
      } else {
        const newAddrRef = await addDoc(addrCol, {
          cep: addressForm.cep || null,
          logradouro: addressForm.street || null,
          numero: addressForm.number || null,
          complemento: addressForm.complement || null,
          bairro: addressForm.neighborhood || null,
          cidade: addressForm.city || null,
          estado: addressForm.state || null,
          isPrincipal: true,
        });
        setUserAddress({
          id: newAddrRef.id,
          cep: addressForm.cep,
          street: addressForm.street,
          number: addressForm.number,
          complement: addressForm.complement,
          neighborhood: addressForm.neighborhood,
          city: addressForm.city,
          state: addressForm.state,
        });
      }

      // Atualiza o estado local de userDoc para refletir os novos dados imediatamente
      setUserDoc((prev) =>
        prev
          ? {
            ...prev,
            displayName: profileForm.displayName || prev.displayName,
            phone: fullPhone,
            pessoaTipo: profileForm.pessoaTipo || prev.pessoaTipo,
            cpfCnpj: profileForm.cpfCnpj || prev.cpfCnpj,
            clinicName: profileForm.clinicName || prev.clinicName,
          }
          : prev,
      );

      setEditOpen(false);
      toast({
        title: 'Dados atualizados',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar dados',
        description: 'Não foi possível salvar suas informações. Tente novamente.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-10 max-w-7xl space-y-8">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold font-headline">Área do Cliente</h1>
              <p className="text-muted-foreground mt-1">Bem-vindo(a) de volta, {displayName}!</p>
            </div>
            {isAdmin && (
              <Button onClick={() => router.push('/admin')} className="mt-4 md:mt-0">
                Painel de Administrador
              </Button>
            )}
          </div>

          {/* Dashboard do Dentista */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Casos</CardTitle>
              <CardDescription>Um resumo da sua atividade recente.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map(card => (
                  <Card key={card.title} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                      <p className="text-2xl font-bold">{card.value}</p>
                    </div>
                    <card.icon className={`h-8 w-8 ${card.color}`} />
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>


          {/* Abas de Pedidos */}
          <Tabs defaultValue="all-orders">
            <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
              <TabsTrigger value="all-orders">Meus Pedidos Clínicos</TabsTrigger>
              <TabsTrigger value="my-account">Minha Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="all-orders">
              <Card>
                <CardHeader>
                  <CardTitle>Meus Pedidos</CardTitle>
                  <CardDescription>Acompanhe o status dos seus casos clínicos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead className="hidden md:table-cell">Dentes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Atualizado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingExtra ? (
                        <TableRow><TableCell colSpan={6} className="text-center">Carregando pedidos...</TableCell></TableRow>
                      ) : orders.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center h-24">Nenhum pedido encontrado.</TableCell></TableRow>
                      ) : (
                        orders.map(order => {
                          const statusInfo = statusMap[order.status] || { label: order.status, icon: AlertTriangle, color: 'bg-gray-500' };
                          const mainItem = order.items[0];
                          const mainServiceName = mainItem?.productId
                            ? serviceNames[mainItem.productId] || 'Serviço não especificado'
                            : null;
                          const patientName = mainItem?.patientName || `Pedido #${order.id.substring(0, 6)}`;
                          return (
                            <TableRow key={order.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{patientName}</TableCell>
                              <TableCell>
                                {mainServiceName
                                  ? `${mainServiceName}${order.items.length > 1
                                    ? ` +${order.items.length - 1}`
                                    : ''
                                  }`
                                  : 'N/A'}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">{mainItem?.teeth?.join(', ') || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="flex items-center gap-2">
                                  <div className={`h-2 w-2 rounded-full ${statusInfo.color}`}></div>
                                  {statusInfo.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">{format(order.updatedAt, 'dd/MM/yyyy')}</TableCell>
                              <TableCell className="text-right space-x-1">
                                {order.paymentStatus === 'waiting' && (
                                  <div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        void handlePayOrder(order);
                                      }}
                                    >
                                      Pagar
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVerifyPayment(order);
                                      }}
                                    >
                                      Verificar pagamento
                                    </Button>
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-account">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle>Minhas Informações</CardTitle>
                    <CardDescription>Dados cadastrais e endereço principal.</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openEditDialog}
                  >
                    Editar informações
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold">{displayName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userDoc?.pessoaTipo && (
                        <Badge variant="outline">
                          Tipo de conta: {userDoc.pessoaTipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                        </Badge>
                      )}
                      {userDoc?.tipo && (
                        <Badge variant="outline">Perfil: {userDoc.tipo}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {userDoc?.cpfCnpj && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                        <p className="text-sm font-medium">{userDoc.cpfCnpj}</p>
                      </div>
                    )}
                    {userDoc?.phone && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="text-sm font-medium">{userDoc.phone}</p>
                      </div>
                    )}
                    {userDoc?.clinicName && userDoc.clinicName.trim() !== '' && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-sm text-muted-foreground">Clínica</p>
                        <p className="text-sm font-medium">{userDoc.clinicName}</p>
                      </div>
                    )}
                  </div>

                  {userAddress && (
                    <div className="space-y-2 pt-2 border-t mt-4">
                      <p className="text-sm font-semibold">Endereço principal</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          {userAddress.street && <span>{userAddress.street}</span>}
                          {userAddress.number && (
                            <span>{userAddress.street ? `, ${userAddress.number}` : userAddress.number}</span>
                          )}
                          {userAddress.complement && (
                            <span>{` - ${userAddress.complement}`}</span>
                          )}
                        </p>
                        {(userAddress.neighborhood || userAddress.city || userAddress.state) && (
                          <p>
                            {userAddress.neighborhood && <span>{userAddress.neighborhood}</span>}
                            {userAddress.city && (
                              <span>
                                {userAddress.neighborhood ? ' · ' : ''}
                                {userAddress.city}
                              </span>
                            )}
                            {userAddress.state && (
                              <span>{userAddress.city ? ` - ${userAddress.state}` : userAddress.state}</span>
                            )}
                          </p>
                        )}
                        {userAddress.cep && <p>CEP: {userAddress.cep}</p>}
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button variant="outline" onClick={() => router.push('/')}>
                      Voltar para a loja
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar informações</DialogTitle>
            <DialogDescription>
              Atualize seus dados cadastrais e endereço principal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome</Label>
              <Input
                id="displayName"
                value={profileForm.displayName}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, displayName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-section">Telefone com WhatsApp</Label>
              <div className="grid gap-3 grid-cols-[140px_100px_1fr]">
                <div className="space-y-2">
                  <select
                    id="countryCode"
                    value={profileForm.countryCode}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, countryCode: e.target.value }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="55">🇧🇷 +55</option>
                    <option value="1">🇺🇸 +1</option>
                    <option value="351">🇵🇹 +351</option>
                    <option value="34">🇪🇸 +34</option>
                    <option value="44">🇬🇧 +44</option>
                    <option value="33">🇫🇷 +33</option>
                    <option value="49">🇩🇪 +49</option>
                    <option value="39">🇮🇹 +39</option>
                  </select>
                  <p className="text-xs text-muted-foreground">País</p>
                </div>
                <div className="space-y-2">
                  <Input
                    id="ddd"
                    value={profileForm.ddd}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                      setProfileForm((prev) => ({ ...prev, ddd: val }));
                    }}
                    placeholder="11"
                    maxLength={3}
                    inputMode="numeric"
                  />
                  <p className="text-xs text-muted-foreground">DDD</p>
                </div>
                <div className="space-y-2">
                  <Input
                    id="phoneLocal"
                    value={profileForm.phoneLocal}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setProfileForm((prev) => ({ ...prev, phoneLocal: val }));
                    }}
                    placeholder="999999999"
                    maxLength={9}
                    inputMode="numeric"
                  />
                  <p className="text-xs text-muted-foreground">Número (8-9 dígitos)</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                <Input
                  id="cpfCnpj"
                  value={profileForm.cpfCnpj}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, cpfCnpj: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicName">Clínica</Label>
                <Input
                  id="clinicName"
                  value={profileForm.clinicName}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, clinicName: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <p className="text-sm font-semibold">Endereço principal</p>
              <div className="grid gap-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={addressForm.street}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, street: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={addressForm.number}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, number: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={addressForm.complement}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, complement: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={addressForm.neighborhood}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, neighborhood: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, city: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, state: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={addressForm.cep}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, cep: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={savingProfile}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
