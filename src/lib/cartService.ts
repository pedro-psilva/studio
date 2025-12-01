import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type CartItemFirestore = {
  productId: string;
  quantity: number;
  material?: string;
  shade?: string;
  teeth?: number[];
  implantSystem?: string;
  stlFileUrl?: string;
};

export type CartDocument = {
  userId: string;
  items: CartItemFirestore[];
  updatedAt: Date;
};

const COLLECTION_NAME = 'carts';

function toFirestoreCartItems(items: CartItemFirestore[]) {
  return items.map((item) => {
    const base: any = {
      productId: item.productId,
      quantity: item.quantity,
    };

    if (item.material != null) base.material = item.material;
    if (item.shade != null) base.shade = item.shade;
    if (item.teeth != null) base.teeth = item.teeth;
    if (item.implantSystem != null) base.implantSystem = item.implantSystem;
    if (item.stlFileUrl != null) base.stlFileUrl = item.stlFileUrl;

    return base;
  });
}

export async function getCart(userId: string): Promise<CartDocument | null> {
  const ref = doc(db, COLLECTION_NAME, userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data() as { userId: string; items: CartItemFirestore[]; updatedAt?: any };

  return {
    userId: data.userId,
    items: data.items ?? [],
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  };
}

export async function setCart(userId: string, items: CartItemFirestore[]): Promise<void> {
  const ref = doc(db, COLLECTION_NAME, userId);

  await setDoc(ref, {
    userId,
    items: toFirestoreCartItems(items),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCartItems(userId: string, items: CartItemFirestore[]): Promise<void> {
  const ref = doc(db, COLLECTION_NAME, userId);

  await updateDoc(ref, {
    items: toFirestoreCartItems(items),
    updatedAt: serverTimestamp(),
  });
}
