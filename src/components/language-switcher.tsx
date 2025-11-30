'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const languages = [
    { id: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { id: 'en-US', name: 'English', flag: '🇺🇸' },
    { id: 'es-ES', name: 'Español', flag: '🇪🇸' }
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation('common');

  const currentLanguage = languages.find(l => l.id === language) || languages[0];

  const handleLanguageChange = (langId: string) => {
    setLanguage(langId as 'pt-BR' | 'en-US' | 'es-ES');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="text-xl">{currentLanguage.flag}</span>
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
             <DropdownMenuItem key={lang.id} onClick={() => handleLanguageChange(lang.id)}>
                <span className="mr-2 text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
            </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
