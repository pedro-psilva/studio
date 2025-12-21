import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const resolved = await Promise.resolve(ctx.params as any);
    const id = String(resolved?.id ?? '').trim();

    if (!id) {
      return NextResponse.json({ error: 'Template id ausente.' }, { status: 400 });
    }

    const snap = await adminDb.collection('notificationTemplates').doc(id).get();
    const data = snap.exists ? (snap.data() as any) : null;

    return NextResponse.json({
      id,
      subject: data?.subject ?? '',
      html: data?.html ?? '',
      updatedAt: data?.updatedAt ?? null,
    });
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'Erro ao buscar template.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const updatedBy =
      (typeof requesterData?.displayName === 'string' && requesterData.displayName.trim()) ||
      (typeof requesterData?.email === 'string' && requesterData.email.trim()) ||
      decoded.uid;

    const resolved = await Promise.resolve(ctx.params as any);
    const id = String(resolved?.id ?? '').trim();

    if (!id) {
      return NextResponse.json({ error: 'Template id ausente.' }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      subject?: string;
      html?: string;
    };

    const subject = typeof body.subject === 'string' ? body.subject : '';
    const html = typeof body.html === 'string' ? body.html : '';

    if (subject.length > 200) {
      return NextResponse.json({ error: 'Assunto muito longo (máx 200 caracteres).' }, { status: 400 });
    }

    if (html.length > 200_000) {
      return NextResponse.json({ error: 'HTML muito grande.' }, { status: 400 });
    }

    await adminDb
      .collection('notificationTemplates')
      .doc(id)
      .set(
        {
          subject,
          html,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy,
        },
        { merge: true }
      );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'Erro ao salvar template.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
