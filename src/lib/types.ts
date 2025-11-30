import type { LucideIcon } from 'lucide-react';

export type Product = {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  categoryId: string;
  imageId: string;
  images: string[];
  requiresStl: boolean;
  variants: {
    materials: string[];
    shades: string[];
    implantSystems?: string[];
  };
  technicalSpecs: { [key: string]: string };
  productionTime: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
};

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
  material?: string;
  shade?: string;
  teeth?: number[];
  implantSystem?: string;
  stlFile?: File | null;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  status: 'Received' | 'In Production' | 'Finalized' | 'Shipped' | 'Delivered' | 'Canceled';
  total: number;
  orderDate: string;
  shippingAddress: Address;
  invoiceId: string;
  timeline: { status: string; date: string }[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'technician';
  isPJ: boolean;
  cnpj?: string;
  cpf?: string;
  clinicName?: string;
};

export type Address = {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type Coupon = {
  code: string;
  discount: number; // percentage
  expiryDate: string;
};

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type ProductionStatus = 'Received' | 'In Production' | 'Finalized' | 'Shipped';

export type ProductionOrder = {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  status: ProductionStatus;
  dueDate: string;
};
