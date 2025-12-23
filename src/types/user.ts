import { Timestamp } from 'firebase-admin/firestore';

/**
 * Tipos de perfil de usuário
 */
export type UserTipo = 'cliente' | 'colaborador' | 'admin';

/**
 * Níveis de acesso para colaboradores admin
 */
export type AdminAccessLevel = 'reader' | 'editor';

/**
 * Status do usuário
 */
export type UserStatus = 'Pendente' | 'Ativo' | 'Inativo' | 'Bloqueado';

/**
 * Tipo de pessoa (física ou jurídica)
 */
export type PessoaTipo = 'fisica' | 'juridica';

/**
 * Interface completa de dados do usuário
 */
export interface UserData {
  email: string;
  displayName: string | null;
  tipo: UserTipo;
  status: UserStatus;
  
  // Dados pessoais/empresariais
  cpfCnpj?: string;
  phone?: string;
  pessoaTipo?: PessoaTipo;
  clinicName?: string;
  
  // Controle de senha
  forcePasswordReset?: boolean;
  
  // Acesso admin para colaboradores
  adminAccess?: Record<string, AdminAccessLevel>;
  
  // Timestamps
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

/**
 * Dados mínimos do usuário autenticado (retornados pelo middleware)
 */
export interface AuthenticatedUser {
  uid: string;
  userData: UserData;
}
