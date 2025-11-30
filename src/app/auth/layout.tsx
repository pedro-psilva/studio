'use client';
import { AuthProvider } from '@/context/AuthContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="bg-gray-900">
        {children}
      </div>
    </AuthProvider>
  );
}