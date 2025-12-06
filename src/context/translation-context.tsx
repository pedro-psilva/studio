'use client';

import React, { createContext, useState, ReactNode } from 'react';
import { translations, Language, Namespace } from '@/lib/translations';

type Currency = 'BRL' | 'USD' | 'EUR';

type CurrencyOptions = {
  locale: string;
  currency: Currency;
  rate: number; // Conversion rate from BRL
};

const currencySettings: Record<Language, CurrencyOptions> = {
  'pt-BR': { locale: 'pt-BR', currency: 'BRL', rate: 1 },
  'en-US': { locale: 'en-US', currency: 'USD', rate: 1 / 5.4 }, // 1 BRL to X USD
  'es-ES': { locale: 'es-ES', currency: 'EUR', rate: 1 / 5.8 }, // 1 BRL to X EUR
};

type TranslationContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, namespace?: Namespace) => string;
  formatCurrency: (value: number) => string;
};

export const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('pt-BR');

  const t = (key: string, namespace: Namespace = 'common') => {
    const keys = key.split('.');
    let result = translations[language][namespace] as any;
    for (const k of keys) {
      if (result) {
        result = result[k];
      } else {
        return key;
      }
    }
    return result || key;
  };

  const formatCurrency = (value: number) => {
    const { locale, currency, rate } = currencySettings[language];
    const convertedValue = value * rate;

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
      }).format(convertedValue);
    } catch (e) {
      console.error('Error formatting currency:', e);
      // Fallback for environments that might not support Intl well
      if (currency === 'USD') return `$${convertedValue.toFixed(2)}`;
      if (currency === 'EUR') return `€${convertedValue.toFixed(2)}`;
      return `R$ ${value.toFixed(2)}`;
    }
  };


  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, formatCurrency }}>
      {children}
    </TranslationContext.Provider>
  );
};
