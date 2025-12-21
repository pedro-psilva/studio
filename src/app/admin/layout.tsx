'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Home,
  Package,
  ShoppingCart,
  Users,
  LineChart,
  CreditCard,
  Settings,
  Factory,
  BadgePercent,
  BellRing,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  {
    href: '/admin/production',
    label: 'Produção',
    icon: Factory,
    subLinks: [
      { href: '/admin/production', label: 'Geral' },
      { href: '/admin/production/triage', label: 'Triagem' },
      { href: '/admin/production/cad-cam', label: 'CAD/CAM' },
      { href: '/admin/production/finishing', label: 'Finalização' },
      { href: '/admin/production/shipping', label: 'Expedição' },
    ],
  },
  { href: '/admin/products', label: 'Produtos', icon: Package },
  { href: '/admin/users', label: 'Usuários', icon: Users },
  {
    href: '/admin/esap',
    label: 'ESAP',
    icon: TrendingUp,
    subLinks: [
      { href: '/admin/esap', label: 'Dashboard ESAP' },
      { href: '/admin/esap/meu-painel', label: 'Meu Painel' },
      { href: '/admin/esap/equipe', label: 'Equipe' },
      { href: '/admin/esap/kpis', label: 'KPIs e Indicadores' },
      { href: '/admin/esap/metas', label: 'Metas' },
      { href: '/admin/esap/planos-acao', label: 'Planos de Ação' },
      { href: '/admin/esap/registrar-atividade', label: 'Registrar Atividade' },
      { href: '/admin/esap/acompanhamento', label: 'Acompanhamento' },
      { href: '/admin/esap/relatorios', label: 'Relatórios' },
    ],
  },
  { href: '/admin/finance', label: 'Financeiro', icon: CreditCard },
  { href: '/admin/reports', label: 'Relatórios', icon: LineChart },
  { href: '/admin/coupons', label: 'Cupons', icon: BadgePercent },
  { href: '/admin/notifications', label: 'Notificações', icon: BellRing },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isColaborador, setIsColaborador] = useState(false);
  const [adminAccess, setAdminAccess] = useState<Record<string, 'reader' | 'editor'> | null>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/');
      return;
    }

    const checkAdminStatus = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const data = userSnap.exists() ? (userSnap.data() as any) : null;
        const tipo = data?.tipo;
        const access = (data?.adminAccess && typeof data.adminAccess === 'object') ? (data.adminAccess as any) : null;

        if (tipo === 'admin') {
          setIsAdmin(true);
          setIsColaborador(false);
          setAdminAccess(null);
          return;
        }

        if (tipo === 'colaborador') {
          setIsAdmin(false);
          setIsColaborador(true);
          setAdminAccess(access ?? {});
          return;
        }

        router.replace('/');
      } catch (error) {
        console.error('Error verifying admin status:', error);
        router.replace('/');
      } finally {
        setVerifying(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading, router]);

  const isEsapRoute = pathname.startsWith('/admin/esap');

  if (verifying || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    if (!isColaborador) return null;
  }

  const resolveAccessKey = (path: string): string => {
    if (path === '/admin') return 'dashboard';
    if (path.startsWith('/admin/orders')) return 'orders';
    if (path.startsWith('/admin/production')) return 'production';
    if (path.startsWith('/admin/products')) return 'products';
    if (path.startsWith('/admin/users')) return 'users';
    if (path.startsWith('/admin/esap')) return 'esap';
    if (path.startsWith('/admin/finance')) return 'finance';
    if (path.startsWith('/admin/reports')) return 'reports';
    if (path.startsWith('/admin/coupons')) return 'coupons';
    if (path.startsWith('/admin/notifications')) return 'notifications';
    if (path.startsWith('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const canAccess = (key: string): boolean => {
    if (isAdmin) return true;
    if (!isColaborador) return false;
    if (key === 'dashboard') return true;
    return !!adminAccess?.[key];
  };

  useEffect(() => {
    if (!isColaborador) return;
    const key = resolveAccessKey(pathname);
    if (!canAccess(key)) {
      router.replace('/admin');
    }
  }, [isColaborador, pathname]);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="font-headline">IT Lab Admin</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks.map((link) => {
                const key = resolveAccessKey(link.href);
                if (!canAccess(key)) return null;

                return link.subLinks ? (
                  <Collapsible
                    key={link.href}
                    defaultOpen={isEsapRoute || pathname.startsWith(link.href)}
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&[data-state=open]>svg:last-child]:-rotate-180">
                      <div className="flex items-center gap-3">
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-8 my-2 flex flex-col gap-2 border-l border-border/40">
                      {link.subLinks.map((subLink) => (
                        <Link
                          key={subLink.href}
                          href={subLink.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                            pathname === subLink.href
                              ? 'bg-muted text-primary'
                              : ''
                          )}
                        >
                          <ChevronRight className="h-3 w-3" />
                          {subLink.label}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                      (pathname === link.href && link.href === '/admin') ||
                        (link.href !== '/admin' &&
                          pathname.startsWith(link.href))
                        ? 'bg-muted text-primary'
                        : ''
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
