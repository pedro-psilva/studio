import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CartItemFirestore } from '@/lib/cartService';
import { getUserDataById } from '@/lib/userService';


export type OrderItemFirestore = {
  productId: string;
  quantity: number;
  shade?: string;
  material?: string;
  implantSystem?: string;
  stlFileUrl?: string;
  teeth?: number[];
  patientName?: string;
};

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'canceled';

export type PaymentStatus =
  | 'waiting'
  | 'approved'
  | 'refused'
  | 'refunded'
  | null;

export type OrderDocument = {
  id: string;
  userId: string;
  items: OrderItemFirestore[];
  subtotal: number;
  shipping: number;
  discount?: number;
  coupon?: {
    id: string;
    code: string;
    type: 'percent' | 'fixed' | 'free_shipping';
    value: number;
  } | null;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  paymentProvider: 'infinitepay' | null;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  labels?: { text: string; color: string }[];
};

const COLLECTION_NAME = 'orders';

async function sendOrderEmail(endpoint: 'order-confirmation' | 'status-update', payload: any) {
  try {
    // We don't need the base URL as API routes are same-origin
    await fetch(`/api/send-email/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error(`Falha ao enviar e-mail de ${endpoint}:`, error);
    // Non-critical, so we don't re-throw
  }
}

function mapCartItemToOrderItem(item: CartItemFirestore): OrderItemFirestore {
  return {
    productId: item.productId,
    quantity: item.quantity,
    shade: item.shade,
    material: item.material,
    implantSystem: item.implantSystem,
    stlFileUrl: item.stlFileUrl,
    teeth: item.teeth,
    patientName: item.patientName,
  };
}

export async function getOrder(orderId: string): Promise<OrderDocument | null> {
  const ref = doc(db, COLLECTION_NAME, orderId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data() as any;

  const createdAt: Date = data.createdAt?.toDate?.() ?? new Date();
  const updatedAt: Date = data.updatedAt?.toDate?.() ?? new Date();

  let status: OrderStatus = data.status;

  if (status === 'pending_payment' && data.paymentStatus === 'waiting') {
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    if (diffMs >= threeDaysMs) {
      status = 'canceled';
    }
  }

  return {
    id: snap.id,
    userId: data.userId,
    items: data.items ?? [],
    subtotal: data.subtotal ?? 0,
    shipping: data.shipping ?? 0,
    discount: typeof data.discount === 'number' ? data.discount : 0,
    coupon: data.coupon ?? null,
    total: data.total ?? 0,
    status,
    createdAt,
    updatedAt,
    paymentProvider: data.paymentProvider ?? null,
    paymentStatus: data.paymentStatus ?? null,
    paymentId: data.paymentId,
    labels: data.labels ?? [],
  };
}

export async function listUserOrders(userId: string): Promise<OrderDocument[]> {
  const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as any;

    const createdAt: Date = data.createdAt?.toDate?.() ?? new Date();
    const updatedAt: Date = data.updatedAt?.toDate?.() ?? new Date();

    let status: OrderStatus = data.status;

    if (status === 'pending_payment' && data.paymentStatus === 'waiting') {
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

      if (diffMs >= threeDaysMs) {
        status = 'canceled';
      }
    }

    return {
      id: docSnap.id,
      userId: data.userId,
      items: data.items ?? [],
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      status,
      createdAt,
      updatedAt,
      paymentProvider: data.paymentProvider ?? null,
      paymentStatus: data.paymentStatus ?? null,
      paymentId: data.paymentId,
      labels: data.labels ?? [],
    };
  });
}

// Lista todos os pedidos (para visão administrativa / financeira)
export async function listAllOrders(): Promise<OrderDocument[]> {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as any;

    const createdAt: Date = data.createdAt?.toDate?.() ?? new Date();
    const updatedAt: Date = data.updatedAt?.toDate?.() ?? new Date();

    let status: OrderStatus = data.status;

    if (status === 'pending_payment' && data.paymentStatus === 'waiting') {
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

      if (diffMs >= threeDaysMs) {
        status = 'canceled';
      }
    }

    return {
      id: docSnap.id,
      userId: data.userId,
      items: data.items ?? [],
      subtotal: data.subtotal,
      shipping: data.shipping,
      discount: typeof data.discount === 'number' ? data.discount : 0,
      coupon: data.coupon ?? null,
      total: data.total,
      status,
      createdAt,
      updatedAt,
      paymentProvider: data.paymentProvider ?? null,
      paymentStatus: data.paymentStatus ?? null,
      paymentId: data.paymentId,
      labels: data.labels ?? [],
    } as OrderDocument;
  });
}

export type CreateOrderParams = {
  userId: string;
  items: OrderItemFirestore[];
  subtotal: number;
  shipping: number;
  discount?: number;
  coupon?: {
    id: string;
    code: string;
    type: 'percent' | 'fixed' | 'free_shipping';
    value: number;
  } | null;
};

export async function createOrderFromCart(
  params: CreateOrderParams
): Promise<OrderDocument> {
  const { userId, items, subtotal, shipping, discount = 0, coupon = null } = params;

  const total = Math.max(0, subtotal - discount + shipping);

  const colRef = collection(db, COLLECTION_NAME);

  const now = serverTimestamp();

  const firestoreItems = items.map((item) => {
    const base: any = {
      productId: item.productId,
      quantity: item.quantity,
    };

    if (item.shade != null) base.shade = item.shade;
    if (item.material != null) base.material = item.material;
    if (item.implantSystem != null) base.implantSystem = item.implantSystem;
    if (item.stlFileUrl != null) base.stlFileUrl = item.stlFileUrl;
    if (item.teeth != null) base.teeth = item.teeth;
    if (item.patientName != null) base.patientName = item.patientName;


    return base;
  });

  // Gerar ID amigável sequencial
  const { generateOrderId } = await import('@/lib/orderIdGenerator');
  const orderId = await generateOrderId();

  // Usar setDoc com ID customizado em vez de addDoc
  const docRef = doc(colRef, orderId);

  await setDoc(docRef, {
    id: orderId,
    userId,
    items: firestoreItems,
    subtotal,
    shipping,
    discount,
    coupon,
    total,
    status: 'pending_payment',
    createdAt: now,
    updatedAt: now,
    paymentProvider: 'infinitepay',
    paymentStatus: 'waiting',
  });

  // Dispara e-mail de confirmação de pedido via API route
  try {
    const user = await getUserDataById(userId);
    if (user && user.email) {
      await sendOrderEmail('order-confirmation', {
        to: user.email,
        customerName: user.displayName || 'Cliente',
        orderId,
        orderDate: new Date().toLocaleDateString('pt-BR'),
        totalAmount: total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      });
    }
  } catch (apiError) {
    console.error(`Falha ao disparar e-mail de confirmação para o pedido ${orderId}:`, apiError);
  }

  return {
    id: orderId,
    userId,
    items,
    subtotal,
    shipping,
    discount,
    coupon,
    total,
    status: 'pending_payment',
    createdAt: new Date(),
    updatedAt: new Date(),
    paymentProvider: 'infinitepay',
    paymentStatus: 'waiting',
    labels: [],
  };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const currentOrder = await getOrder(orderId);

  const ref = doc(db, COLLECTION_NAME, orderId);
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });

  // Only send email if status has changed
  if (currentOrder && currentOrder.status !== status) {
    try {
      if (currentOrder.userId) {
        const user = await getUserDataById(currentOrder.userId);
        if (user && user.email) {
          await sendOrderEmail('status-update', {
            to: user.email,
            customerName: user.displayName || 'Cliente',
            orderId,
            newStatus: status,
          });
        }
      }
    } catch (apiError) {
      console.error(`Falha ao disparar e-mail de atualização para o pedido ${orderId}:`, apiError);
    }
  }
}

export async function updateOrderPayment(
  orderId: string,
  paymentStatus: PaymentStatus,
  paymentId?: string
): Promise<void> {
  const ref = doc(db, COLLECTION_NAME, orderId);

  const updateData: Record<string, unknown> = {
    paymentStatus,
    paymentId: paymentId ?? null,
    updatedAt: serverTimestamp(),
  };

  // Se aprovado, também atualiza o status geral do pedido
  if (paymentStatus === 'approved') {
    updateData.status = 'paid';
  }

  await updateDoc(ref, updateData);
}

export async function updateOrderLabels(
  orderId: string,
  labels: { text: string; color: string }[]
): Promise<void> {
  const ref = doc(db, COLLECTION_NAME, orderId);
  await updateDoc(ref, {
    labels,
    updatedAt: serverTimestamp(),
  });
}
