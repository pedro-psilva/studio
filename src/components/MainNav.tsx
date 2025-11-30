'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/context/AuthContext';

export function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = [
    {
      href: '/',
      label: 'Início',
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      auth: true,
    },
    // Adicione mais itens de navegação conforme necessário
  ];

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span>Itlab</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {items
              .filter((item) => !item.auth || (item.auth && user))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}