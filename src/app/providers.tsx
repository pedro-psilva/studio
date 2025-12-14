"use client";

import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { TranslationProvider } from "@/context/translation-context";
import { AuthProvider } from "@/context/AuthContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <TranslationProvider>
          {children}
          <Toaster />
        </TranslationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
