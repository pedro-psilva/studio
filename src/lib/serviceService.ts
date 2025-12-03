import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where, serverTimestamp, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type ServiceVisibility = 'publico' | 'interno';
export type ServicePriceVisibility = 'exibido' | 'escondido';

export type CustomField = {
  id: string;
  label: string;
  tipo: string;
  obrigatorio: boolean;
  [key: string]: any;
};

export type ServiceDocument = {
  id: string;
  ativo: boolean;
  visibilidade: ServiceVisibility;
  nome: string;
  codigo: string;
  descricao: string;
  precoBase: number;
  visibilidadePreco: ServicePriceVisibility;
  prazoEntrega: number;
  fluxoProducao: string[];
  tags: string[];
  arquivosNecessarios: string[];
  arquivosOpcionais: string[];
  camposPersonalizados: CustomField[];
  imagemUrl: string;
  tituloPromocional: string;
  corRepresentacao: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateServiceParams = {
  ativo: boolean;
  visibilidade: ServiceVisibility;
  nome: string;
  codigo: string;
  descricao: string;
  precoBase: number;
  visibilidadePreco: ServicePriceVisibility;
  prazoEntrega: number;
  fluxoProducao: string[];
  tags: string[];
  arquivosNecessarios: string[];
  arquivosOpcionais: string[];
  camposPersonalizados: CustomField[];
  imagemUrl: string;
  tituloPromocional: string;
  corRepresentacao: string;
};

export type UpdateServiceParams = Partial<CreateServiceParams> & {
  ativo?: boolean;
};

const COLLECTION_NAME = 'services';

function mapServiceData(data: any): ServiceDocument {
  return {
    id: data.id,
    ativo: data.ativo,
    visibilidade: data.visibilidade,
    nome: data.nome,
    codigo: data.codigo,
    descricao: data.descricao,
    precoBase: data.precoBase,
    visibilidadePreco: data.visibilidadePreco,
    prazoEntrega: data.prazoEntrega,
    fluxoProducao: data.fluxoProducao ?? [],
    tags: data.tags ?? [],
    arquivosNecessarios: data.arquivosNecessarios ?? [],
    arquivosOpcionais: data.arquivosOpcionais ?? [],
    camposPersonalizados: data.camposPersonalizados ?? [],
    imagemUrl: data.imagemUrl,
    tituloPromocional: data.tituloPromocional,
    corRepresentacao: data.corRepresentacao,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  };
}

export async function getService(serviceId: string): Promise<ServiceDocument | null> {
  const ref = doc(db, COLLECTION_NAME, serviceId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as any;
  return mapServiceData(data);
}

export async function listServices(options?: { onlyActive?: boolean; visibility?: ServiceVisibility }): Promise<ServiceDocument[]> {
  const colRef = collection(db, COLLECTION_NAME);

  let q: any = colRef;

  if (options?.onlyActive || options?.visibility) {
    const whereClauses: any[] = [];
    if (options.onlyActive) {
      whereClauses.push(where('ativo', '==', true));
    }
    if (options.visibility) {
      whereClauses.push(where('visibilidade', '==', options.visibility));
    }

    if (whereClauses.length === 1) {
      q = query(colRef, whereClauses[0]);
    } else if (whereClauses.length === 2) {
      q = query(colRef, whereClauses[0], whereClauses[1]);
    }
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
    const data = docSnap.data() as any;
    return mapServiceData(data);
  });
}

export async function createService(params: CreateServiceParams): Promise<ServiceDocument> {
  const colRef = collection(db, COLLECTION_NAME);
  const now = serverTimestamp();

  const docRef = await addDoc(colRef, {
    ...params,
    createdAt: now,
    updatedAt: now,
  });

  const serviceId = docRef.id;

  await updateDoc(docRef, { id: serviceId });

  return {
    id: serviceId,
    ...params,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function updateService(serviceId: string, data: UpdateServiceParams): Promise<void> {
  const ref = doc(db, COLLECTION_NAME, serviceId);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
