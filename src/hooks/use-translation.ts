'use client';

import { useContext } from 'react';
import { TranslationContext } from '@/context/translation-context';
import { Namespace } from '@/lib/translations';

export const useTranslation = (namespace: Namespace) => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  
  const t = (key: string) => {
      const keys = key.split('.');
      let result = (context.t as any)(namespace);
       for(const k of keys) {
        if(result && typeof result === 'object' && k in result) {
            result = result[k];
        } else {
            // If at any point the key path is invalid, check from root
             const rootResult = context.t(key, namespace)
             return rootResult;
        }
    }

    if (typeof result === 'string') {
        return result;
    }

    // Fallback if the final result is not a string (e.g., a nested object)
    const fallbackKey = `${namespace}.${key}`;
    const fallbackResult = context.t(fallbackKey, namespace);
    return fallbackResult === fallbackKey ? key : fallbackResult;
  }

  // Expose formatCurrency from the context
  const { formatCurrency } = context;

  return { ...context, t, formatCurrency };
};
