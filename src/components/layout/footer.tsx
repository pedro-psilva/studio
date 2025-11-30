import Link from 'next/link';
import { Logo } from '../icons/logo';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Button } from '../ui/button';

const footerLinks = {
  shop: [
    { href: '/products?category=crowns', label: 'Crowns & Bridges' },
    { href: '/products?category=implants', label: 'Implants' },
    { href: '/products?category=veneers', label: 'Veneers' },
    { href: '/products?category=dentures', label: 'Dentures' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/shipping', label: 'Shipping Policy' },
    { href: '/privacy', label: 'Privacy Policy' },
  ],
  account: [
    { href: '/account', label: 'My Account' },
    { href: '/account/orders', label: 'My Orders' },
    { href: '/auth/login', label: 'Login' },
    { href: '/auth/register', label: 'Register' },
  ],
};

const socialLinks = [
  { href: '#', icon: Facebook },
  { href: '#', icon: Instagram },
  { href: '#', icon: Twitter },
  { href: '#', icon: Linkedin },
];

export function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t border-border/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="font-bold text-lg font-headline">DentalFlow</span>
            </Link>
            <p className="mt-4 text-muted-foreground max-w-xs">
              The future of digital dentistry, delivered to your clinic.
            </p>
          </div>

          <div>
            <h3 className="font-semibold tracking-wider text-foreground">Shop</h3>
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
            <h3 className="font-semibold tracking-wider text-foreground">Company</h3>
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
            <h3 className="font-semibold tracking-wider text-foreground">Account</h3>
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
            &copy; {new Date().getFullYear()} DentalFlow, Inc. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {socialLinks.map((social) => (
              <Button key={social.href} variant="ghost" size="icon" asChild>
                <Link href={social.href} aria-label={social.icon.displayName}>
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
