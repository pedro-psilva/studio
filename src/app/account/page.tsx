'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, orderBy, query, where } from 'firebase/firestore';
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
    { title: "Casos em Andamento", value: orders.filter(o => o.status === 'in_production').length, icon: Loader, color: "text-blue-500" },
    { title: "Casos Pendentes", value: orders.filter(o => o.status === 'pending_payment').length, icon: FileClock, color: "text-yellow-500" },
    { title: "Casos Finalizados", value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: "text-green-500" },
    { title: "Retrabalhos", value: 0, icon: Activity, color: "text-orange-500" },
  ];

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
                            <TableRow key={order.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/account/orders/${order.id}`)}>
                              <TableCell className="font-medium">{patientName}</TableCell>
                              <TableCell>
                                {mainServiceName
                                  ? `${mainServiceName}${
                                      order.items.length > 1
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
                              <TableCell className="text-right">
                                 <Button variant="ghost" size="icon">
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
                <CardHeader>
                  <CardTitle>Minhas Informações</CardTitle>
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
    </div>
  );
}
