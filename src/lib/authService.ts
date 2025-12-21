// src/lib/authService.ts
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export interface AddressData {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
}

export interface SignUpData {
  nome: string;
  email: string;
  senha: string;
  cpfCnpj: string;
  pessoaTipo: "PF" | "PJ";
  phone: string;
  clinicName?: string;
  endereco: AddressData;
}

// CADASTRO
export async function signUpUser(data: SignUpData) {
  const {
    nome,
    email,
    senha,
    cpfCnpj,
    pessoaTipo,
    phone = "",
    clinicName,
    endereco,
  } = data;

  // 1) Criação do usuário no Auth
  const cred = await createUserWithEmailAndPassword(auth, email, senha);
  await updateProfile(cred.user, { displayName: nome });
  await sendEmailVerification(cred.user);
  const uid = cred.user.uid;

  // 2) Salva os dados do usuário no Firestore
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    displayName: nome,
    email,
    phone,
    tipo: "cliente",
    pessoaTipo,
    cpfCnpj,
    clinicName: clinicName || "",
    permissoes: [],
    photoURL: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 3) Salva o endereço na subcoleção
  await saveUserAddress(uid, {
    ...endereco,
    apelido: "Principal",
    isPrincipal: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return uid;
}

// LOGIN
export async function loginUser(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ENDEREÇO
export async function saveUserAddress(userId: string, addressData: any) {
  const addressesRef = collection(db, `users/${userId}/addresses`);
  const docRef = await addDoc(addressesRef, addressData);
  return docRef.id;
}
