'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import React from 'react';


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
    ]
  },
  { href: '/admin/products', label: 'Produtos', icon: Package },
  { href: '/admin/users', label: 'Usuários', icon: Users },
  { href: '/admin/finance', label: 'Financeiro', icon: CreditCard },
  { href: '/admin/reports', label: 'Relatórios', icon: LineChart },
  { href: '/admin/coupons', label: 'Cupons', icon: BadgePercent },
  { href: '/admin/notifications', label: 'Notificações', icon: BellRing },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isProductionRoute = pathname.startsWith('/admin/production');

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
              {navLinks.map((link) => 
                link.subLinks ? (
                  <Collapsible key={link.href} defaultOpen={isProductionRoute}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&[data-state=open]>svg:last-child]:rotate-90">
                       <div className="flex items-center gap-3">
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-8 my-2 flex flex-col gap-2 border-l border-border/40">
                      {link.subLinks.map(subLink => (
                         <Link
                          key={subLink.href}
                          href={subLink.href}
                           className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                            pathname === subLink.href ? 'bg-muted text-primary' : ''
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
                     (pathname === link.href && link.href === '/admin') || (link.href !== '/admin' && pathname.startsWith(link.href)) ? 'bg-muted text-primary' : ''
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Atualize seu Plano</CardTitle>
                <CardDescription>
                  Desbloqueie todos os recursos e tenha acesso ilimitado à nossa plataforma.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
