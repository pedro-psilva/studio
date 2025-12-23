import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { UnauthorizedError, ForbiddenError } from '@/types/api';
import { AuthenticatedUser, UserData } from '@/types/user';

/**
 * Middleware para exigir autenticação de usuário admin.
 * 
 * @param req - Request do Next.js
 * @returns Dados do usuário autenticado
 * @throws UnauthorizedError se o token não for fornecido ou for inválido
 * @throws ForbiddenError se o usuário não for admin
 * 
 * @example
 * ```typescript
 * export async function GET(req: Request) {
 *   try {
 *     const { uid, userData } = await requireAdmin(req);
 *     // ... lógica da rota
 *   } catch (err) {
 *     return handleAuthError(err);
 *   }
 * }
 * ```
 */
export async function requireAdmin(req: Request): Promise<AuthenticatedUser> {
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        throw new UnauthorizedError('Token de autenticação não fornecido');
    }

    let decoded;
    try {
        decoded = await adminAuth.verifyIdToken(token);
    } catch (err) {
        throw new UnauthorizedError('Token de autenticação inválido');
    }

    const userSnap = await adminDb.collection('users').doc(decoded.uid).get();

    if (!userSnap.exists) {
        throw new ForbiddenError('Usuário não encontrado');
    }

    const userData = userSnap.data() as UserData;

    if (!userData || userData.tipo !== 'admin') {
        throw new ForbiddenError('Acesso negado. Apenas administradores podem acessar este recurso');
    }

    return {
        uid: decoded.uid,
        userData,
    };
}

/**
 * Helper para converter erros de autenticação em respostas NextResponse
 * 
 * @param error - Erro capturado
 * @returns NextResponse com status e mensagem apropriados
 */
export function handleAuthError(error: unknown): Response {
    if (error instanceof UnauthorizedError) {
        return Response.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof ForbiddenError) {
        return Response.json({ error: error.message }, { status: 403 });
    }

    // Erro genérico
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return Response.json({ error: message }, { status: 500 });
}
