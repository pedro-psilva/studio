import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type CouponType = 'percent' | 'fixed' | 'free_shipping';

export type CouponDocument = {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  maxUses: number | null;
  usedCount: number;
  minOrderTotal: number;
  active: boolean;
  assignedToUserId: string | null;
  assignedToName: string | null;
  validFrom: Date | null;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCouponParams = {
  code: string;
  description: string;
  type: CouponType;
  value: number;
  maxUses: number | null;
  minOrderTotal: number;
  active: boolean;
  assignedToUserId?: string | null;
  assignedToName?: string | null;
  validFrom: Date | null;
  validUntil: Date | null;
};

export type UpdateCouponParams = Partial<CreateCouponParams> & {
  active?: boolean;
};

const COLLECTION_NAME = 'coupons';

function mapCouponData(id: string, data: any): CouponDocument {
  return {
    id,
    code: data.code,
    description: data.description ?? '',
    type: data.type,
    value: data.value,
    maxUses: data.maxUses ?? null,
    usedCount: data.usedCount ?? 0,
    minOrderTotal: data.minOrderTotal ?? 0,
    active: data.active ?? true,
    assignedToUserId: data.assignedToUserId ?? null,
    assignedToName: data.assignedToName ?? null,
    validFrom: data.validFrom?.toDate?.() ?? null,
    validUntil: data.validUntil?.toDate?.() ?? null,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  };
}

export async function getCoupon(couponId: string): Promise<CouponDocument | null> {
  const ref = doc(db, COLLECTION_NAME, couponId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  return mapCouponData(snap.id, data);
}

export async function listCoupons(options?: { onlyActive?: boolean }): Promise<CouponDocument[]> {
  const colRef = collection(db, COLLECTION_NAME);

  let q: any = colRef;
  if (options?.onlyActive) {
    q = query(colRef, where('active', '==', true));
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const typed = docSnap as QueryDocumentSnapshot<DocumentData>;
    const data = typed.data() as any;
    return mapCouponData(typed.id, data);
  });
}

export async function createCoupon(params: CreateCouponParams): Promise<CouponDocument> {
  const colRef = collection(db, COLLECTION_NAME);
  const now = serverTimestamp();

  const docRef = await addDoc(colRef, {
    code: params.code.toUpperCase(),
    description: params.description,
    type: params.type,
    value: params.value,
    maxUses: params.maxUses,
    usedCount: 0,
    minOrderTotal: params.minOrderTotal,
    active: params.active,
    assignedToUserId: params.assignedToUserId ?? null,
    assignedToName: params.assignedToName ?? null,
    validFrom: params.validFrom,
    validUntil: params.validUntil,
    createdAt: now,
    updatedAt: now,
  });

  const snap = await getDoc(docRef);
  const data = snap.data() as any;
  return mapCouponData(docRef.id, data);
}

export async function updateCoupon(couponId: string, data: UpdateCouponParams): Promise<void> {
  const ref = doc(db, COLLECTION_NAME, couponId);
  await updateDoc(ref, {
    ...data,
    ...(data.code ? { code: data.code.toUpperCase() } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCoupon(couponId: string): Promise<void> {
  const ref = doc(db, COLLECTION_NAME, couponId);
  await deleteDoc(ref);
}

export function getCouponStatus(coupon: CouponDocument): 'Ativo' | 'Expirado' | 'Rascunho' {
  const now = new Date();

  if (!coupon.active) {
    return 'Rascunho';
  }

  if (coupon.validUntil && coupon.validUntil < now) {
    return 'Expirado';
  }

  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return 'Expirado';
  }

  return 'Ativo';
}
