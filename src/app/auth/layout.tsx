import { Logo } from "@/components/icons/logo";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authBgImage = PlaceHolderImages.find(p => p.id === 'hero-banner');

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      {authBgImage && (
        <Image
          src={authBgImage.imageUrl}
          alt="Dental Laboratory"
          fill
          className="object-cover"
          data-ai-hint={authBgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
         <Link href="/" className="mb-6 flex items-center space-x-2 text-2xl">
            <Logo className="h-10 w-10 text-primary" />
            <span className="font-bold font-headline">DentalFlow</span>
          </Link>
        <div className="w-full rounded-lg border border-border bg-card p-6 shadow-lg sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
