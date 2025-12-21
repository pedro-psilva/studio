import Link from 'next/link';
import { Instagram, Linkedin } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from '@/hooks/use-translation';

const socialLinks = [
  { href: 'https://www.instagram.com/itsolutionlab', icon: Instagram, name: 'Instagram' },
  { href: 'https://www.linkedin.com/company/it-solution-lab-digital', icon: Linkedin, name: 'LinkedIn' },
];

export function Footer() {
  const { t } = useTranslation('footer');

  const footerLinks = {
    shop: [
      { href: '/products?category=crowns', label: t('links.crowns') },
      { href: '/products?category=implants', label: t('links.implants') },
      { href: '/products?category=veneers', label: t('links.veneers') },
      { href: '/products?category=dentures', label: t('links.dentures') },
    ],
    company: [
      { href: '/about', label: t('links.about') },
      { href: '/contact', label: t('links.contact') },
      { href: '/shipping', label: t('links.shipping') },
      { href: '/privacy', label: t('links.privacy') },
    ],
    account: [
      { href: '/account', label: t('links.myAccount') },
      { href: '/account/orders', label: t('links.myOrders') },
      { href: '/auth/login', label: t('links.login') },
      { href: '/auth/register', label: t('links.register') },
    ],
  };

  return (
    <footer className="bg-card text-card-foreground border-t border-border/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <span className="flex flex-col items-center text-center leading-tight">
                <span className="font-headline font-bold text-xl">IT Solution</span>
                <span className="font-script text-lg text-yellow-500 tracking-wide">Laboratório digital</span>
              </span>
            </Link>
            <p className="mt-4 text-muted-foreground max-w-xs">
              {t('tagline')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold tracking-wider text-foreground">{t('headings.shop')}</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold tracking-wider text-foreground">{t('headings.company')}</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold tracking-wider text-foreground">{t('headings.account')}</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} IT Lab, Inc. {t('copyright')}
          </p>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {socialLinks.map((social) => (
              <Button key={social.name} variant="ghost" size="icon" asChild>
                <Link href={social.href} aria-label={social.name}>
                  <social.icon className="h-5 w-5" />
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
