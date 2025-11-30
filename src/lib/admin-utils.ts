import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot
} from "firebase/firestore";

type UserDocument = {
  id: string;
  data: () => DocumentData;
};
import { auth, db } from "./firebase";

interface UserData {
  displayName: string;
  email: string;
  tipo: string;
  roles?: string[];
  permissoes?: string[];
  updatedAt: any;
}

export async function makeUserAdmin(email: string) {
  try {
    // Find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('User not found');
    }

    // Update user document with admin role
    const userDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), {
      tipo: 'admin',
      roles: ['super-admin'],
      permissoes: [
        'manage-users',
        'manage-content',
        'manage-settings',
        'view-audit-logs'
      ],
      updatedAt: new Date().toISOString()
    });

    console.log(`Successfully made ${email} a super admin`);
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    throw error;
  }
}

// Function to check if user has admin role
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data() as UserData;
    return userData.tipo === 'admin' && Array.isArray(userData.roles) && userData.roles.includes('super-admin');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Function to get all users (admin only)
export async function getAllUsers() {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}
