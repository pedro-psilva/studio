import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);

    const requesterSnap = await adminDb.collection('users').doc(decoded.uid).get();
    const requesterData = requesterSnap.exists ? (requesterSnap.data() as any) : null;

    if (!requesterData || requesterData.tipo !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await req.json()) as {
      displayName?: string;
      email?: string;
      password?: string;
      tipo?: 'cliente' | 'colaborador' | 'admin';
      forcePasswordReset?: boolean;
      adminAccess?: Record<string, 'reader' | 'editor'>;
    };

    const email = (body.email ?? '').trim().toLowerCase();
    const password = body.password ?? '';
    const displayName = (body.displayName ?? '').trim();
    const tipo = body.tipo ?? 'cliente';
    const forcePasswordReset = !!body.forcePasswordReset;
    const adminAccess = body.adminAccess ?? undefined;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    const createdUser = await adminAuth.createUser({
      email,
      password,
      displayName: displayName || undefined,
    });

    await adminDb.collection('users').doc(createdUser.uid).set(
      {
        email,
        displayName: displayName || null,
        tipo,
        status: 'Ativo',
        forcePasswordReset,
        adminAccess: tipo === 'colaborador' ? adminAccess ?? {} : null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json(
      {
        uid: createdUser.uid,
        email: createdUser.email,
        displayName: createdUser.displayName,
        tipo,
      },
      { status: 201 }
    );
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'Erro ao criar usuário.';

    if (err?.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'Este email já está cadastrado.' }, { status: 409 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
