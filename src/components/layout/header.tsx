'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  Info,
  Mail,
  UserPlus,
  LogIn,
  LayoutGrid,
  LogOut,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '../theme-switcher';
import { LanguageSwitcher } from '../language-switcher';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

import { Skeleton } from '@/components/ui/skeleton';

interface NavLink {
  href: string;
  label: string;
}

export function Header() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const { t } = useTranslation('common');

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';

  const navLinks: NavLink[] = []; // Now it's properly typed

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          setIsAdmin(false);
          return;
        }
        const data = snap.data() as any;
        const isAdminUser = data?.tipo === 'admin';
        setIsAdmin(!!isAdminUser);
      } catch (error) {
        console.error('Erro ao verificar se usuário é admin:', error);
        setIsAdmin(false);
      }
    };

    const loadCartCount = async () => {
      if (!user) {
        setCartItemCount(0);
        return;
      }
      try {
        const cartRef = doc(db, 'carts', user.uid);
        const cartSnap = await getDoc(cartRef);
        if (!cartSnap.exists()) {
          setCartItemCount(0);
          return;
        }
        const data = cartSnap.data() as any;
        const items = Array.isArray(data.items) ? data.items : [];
        const count = items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
        setCartItemCount(count);
      } catch (error) {
        console.error('Erro ao carregar quantidade do carrinho:', error);
        setCartItemCount(0);
      }
    };

    checkAdmin();
    loadCartCount();
  }, [user]);

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block font-headline">
              IT Lab
            </span>
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs bg-background p-6">
            <Link href="/" className="mb-8 flex items-center">
              <span className="text-lg font-bold font-headline">IT Lab</span>
            </Link>
            <nav className="flex flex-col space-y-4">
              <Link href="https://itsolutionlabdigital.com.br/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Sobre Nós</Link>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Contato</Link>
              {user ? (
                <>
                  <Link href="/account" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Minha Conta</Link>
                  {isAdmin && (
                    <Link href="/admin" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                      Painel Admin
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      logout();
                    }}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary text-left"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Login</Link>
                  <Link href="/auth/register" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Criar Conta</Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('searchPlaceholder')}
                  className="w-full bg-card pl-9 md:w-64 lg:w-96"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center space-x-1">
            <ThemeSwitcher />
            <LanguageSwitcher />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="flex items-center gap-2">
                  <div className="relative">
                    <User className="h-5 w-5" />
                    {user && (
                      <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500"></span>
                    )}
                  </div>
                  <span className="sr-only">Menu do Usuário</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Olá, {displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="w-full">
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        Minha Conta
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full">
                          <LayoutGrid className="mr-2 h-4 w-4" />
                          Painel Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/contact" className="w-full">
                        <Mail className="mr-2 h-4 w-4" />
                        Contato
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onSelect={async (e) => {
                        e.preventDefault();
                        await logout();
                      }}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/auth/login" className="w-full">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/register" className="w-full">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Criar Conta
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="https://itsolutionlabdigital.com.br/" target="_blank" rel="noopener noreferrer" className="w-full">
                        <Info className="mr-2 h-4 w-4" />
                        Sobre Nós
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/contact" className="w-full">
                        <Mail className="mr-2 h-4 w-4" />
                        Contato
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild variant="ghost" size="icon" className="relative">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs text-primary-foreground">
                    {cartItemCount}
                  </Badge>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}