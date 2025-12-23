import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAdmin, handleAuthError } from '@/lib/middleware/adminAuth';
import { updateNotificationTemplateSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Validar autenticação admin
    await requireAdmin(req);

    // Resolver parâmetro id
    const { id } = await ctx.params;

    if (!id || !id.trim()) {
      return NextResponse.json({ error: 'Template id ausente.' }, { status: 400 });
    }

    // Buscar template
    const snap = await adminDb.collection('notificationTemplates').doc(id).get();
    const data = snap.data();

    return NextResponse.json({
      id,
      subject: data?.subject ?? '',
      html: data?.html ?? '',
      updatedAt: data?.updatedAt ?? null,
    });
  } catch (err: any) {
    // Tratar erros de autenticação
    if (err.name === 'UnauthorizedError' || err.name === 'ForbiddenError') {
      return handleAuthError(err);
    }

    const message = typeof err?.message === 'string' ? err.message : 'Erro ao buscar template.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Validar autenticação admin
    const { userData } = await requireAdmin(req);

    // Determinar quem está atualizando
    const updatedBy = userData.displayName?.trim() || userData.email || '';

    // Resolver parâmetro id
    const { id } = await ctx.params;

    if (!id || !id.trim()) {
      return NextResponse.json({ error: 'Template id ausente.' }, { status: 400 });
    }

    // Validar body com Zod
    const body = await req.json().catch(() => ({}));
    const validatedData = updateNotificationTemplateSchema.parse(body);

    const { subject, html } = validatedData;

    // Atualizar template
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

    console.log('✅ Template salvo:', {
      id,
      subjectLength: subject.length,
      htmlLength: html.length,
      updatedBy,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Tratar erros de autenticação
    if (err.name === 'UnauthorizedError' || err.name === 'ForbiddenError') {
      return handleAuthError(err);
    }

    // Tratar erros de validação Zod
    if (err instanceof z.ZodError) {
      const firstError = err.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    const message = typeof err?.message === 'string' ? err.message : 'Erro ao salvar template.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
