import { Timestamp } from 'firebase-admin/firestore';

/**
 * Status de pagamento
 */
export type PaymentStatus = 'waiting' | 'approved' | 'refused' | 'refunded' | null;

/**
 * Status do pedido
 */
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';

/**
 * Provedor de pagamento
 */
export type PaymentProvider = 'infinitepay' | 'mercadopago' | null;

/**
 * Item individual do pedido
 */
export interface OrderItem {
    productId?: string;
    quantity?: number;
    shade?: string;
    material?: string;
    implantSystem?: string;
    stlFileUrl?: string;
    teeth?: number[];
    patientName?: string;
}

/**
 * Cupom de desconto aplicado
 */
export interface OrderCoupon {
    id?: string;
    code?: string;
    type?: string;
    value?: number;
}

/**
 * Interface completa de dados do pedido
 */
export interface OrderData {
    id: string;
    userId: string;

    // Itens do pedido
    items?: OrderItem[];

    // Valores
    subtotal?: number;
    shipping?: number;
    discount?: number;
    total?: number;

    // Cupom
    coupon?: OrderCoupon | null;

    // Status
    status?: OrderStatus | string;
    paymentStatus?: PaymentStatus;

    // Pagamento
    paymentProvider?: PaymentProvider | string | null;
    paymentId?: string | null;

    // Dados do cliente (para emails)
    customerName?: string;

    // Timestamps
    createdAt?: Timestamp | Date | any;
    updatedAt?: Timestamp | Date | any;
}
