'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { useState } from 'react';

const languages = [
    { id: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { id: 'en-US', name: 'English', flag: '🇺🇸' },
    { id: 'es-ES', name: 'Español', flag: '🇪🇸' }
];

export function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState(languages[0]);

  // In a real app, this would also call a function to update user preferences
  // and load new translation files.
  const handleLanguageChange = (langId: string) => {
    const newLang = languages.find(l => l.id === langId);
    if (newLang) {
        setCurrentLanguage(newLang);
        // Here you would typically call a context method or a server action
        // to change the language globally.
        console.log(`Language changed to: ${newLang.name}`);
    }
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
