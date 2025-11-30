'use client';

import React, { createContext, useState, ReactNode } from 'react';
import { translations, Language, Namespace } from '@/lib/translations';

type TranslationContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, namespace?: Namespace) => string;
};

export const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('pt-BR');

  const t = (key: string, namespace: Namespace = 'common') => {
    const keys = key.split('.');
    let result = translations[language][namespace] as any;
    for(const k of keys) {
        if(result) {
            result = result[k];
        } else {
            return key;
        }
    }
    return result || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};
