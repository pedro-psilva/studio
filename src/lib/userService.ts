import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type UserData = {
  id: string;
  displayName?: string;
  email: string;
  // ... outros campos que você tenha
};

export async function getUserDataById(userId: string): Promise<UserData | null> {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data(),
  } as UserData;
}
