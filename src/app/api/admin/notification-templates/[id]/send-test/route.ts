import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

function interpolateTemplate(input: string, vars: Record<string, string>): string {
  return input.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key: string) => {
    const val = vars[key];
    return typeof val === 'string' ? val : '';
  });
}

export async function POST(
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
    const templateId = String(resolved?.id ?? '').trim();

    if (!templateId) {
      return NextResponse.json({ error: 'Template id ausente.' }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as { to?: string };
    const to = String(body?.to ?? '').trim().toLowerCase();

    if (!to || !to.includes('@')) {
      return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
    }

    const tplSnap = await adminDb.collection('notificationTemplates').doc(templateId).get();
    const tpl = tplSnap.exists ? (tplSnap.data() as any) : null;

    const rawSubject = typeof tpl?.subject === 'string' ? tpl.subject : '';
    const rawHtml = typeof tpl?.html === 'string' ? tpl.html : '';

    if (!rawSubject && !rawHtml) {
      return NextResponse.json(
        { error: 'Nenhum template salvo para este tipo de notificação. Salve um assunto/HTML antes de testar.' },
        { status: 400 }
      );
    }

    const smtpHost = process.env.BREVO_SMTP_HOST;
    const smtpPort = Number(process.env.BREVO_SMTP_PORT || 587);
    const smtpUser = process.env.BREVO_SMTP_USER;
    const smtpPass = process.env.BREVO_SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        {
          error:
            'SMTP não configurado. Verifique BREVO_SMTP_HOST, BREVO_SMTP_USER e BREVO_SMTP_PASS no .env.local e reinicie o servidor.',
        },
        { status: 500 }
      );
    }

    const vars: Record<string, string> = {
      customerName: 'Cliente Teste',
      orderId: '000123',
      orderDate: new Date().toLocaleDateString('pt-BR'),
      totalAmount: 'R$ 0,00',
      newStatus: 'Em produção',
    };

    const subject = rawSubject ? interpolateTemplate(rawSubject, vars) : `Teste: ${templateId}`;
    const html = rawHtml
      ? interpolateTemplate(rawHtml, vars)
      : '<p>Template de teste sem HTML.</p>';

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const FROM_EMAIL = 'ferramentas@itsolutionlabdigital.com.br';

    try {
      await transporter.sendMail({
        from: `"IT Solution" <${FROM_EMAIL}>`,
        to,
        subject,
        html,
      });
    } catch (smtpErr: any) {
      const smtpMsg = typeof smtpErr?.message === 'string' ? smtpErr.message : 'Falha no SMTP.';
      console.error('Erro SMTP ao enviar teste:', {
        templateId,
        to,
        code: smtpErr?.code,
        response: smtpErr?.response,
        responseCode: smtpErr?.responseCode,
        message: smtpMsg,
      });
      return NextResponse.json(
        { error: `Falha ao enviar via SMTP: ${smtpMsg}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'Erro ao enviar e-mail de teste.';
    console.error('Erro ao enviar e-mail de teste (route):', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
