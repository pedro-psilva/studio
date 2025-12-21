import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

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

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: 'BASE_URL não configurado.' }, { status: 500 });
    }

    const verificationLink = await adminAuth.generateEmailVerificationLink(email, {
      url: `${baseUrl}/auth/verify-email`,
    });

    await adminDb.collection('users').doc(createdUser.uid).set(
      {
        email,
        displayName: displayName || null,
        tipo,
        status: 'Pendente',
        forcePasswordReset,
        adminAccess: tipo === 'colaborador' ? adminAccess ?? {} : null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    try {
      const smtpHost = process.env.BREVO_SMTP_HOST;
      const smtpPort = Number(process.env.BREVO_SMTP_PORT || 587);
      const smtpUser = process.env.BREVO_SMTP_USER;
      const smtpPass = process.env.BREVO_SMTP_PASS;

      if (smtpHost && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: false,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const fromEmail = 'ferramentas@itsolutionlabdigital.com.br';
        const subject = 'Conta criada com sucesso - confirme seu e-mail';

        const html = `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
            <h2>Olá${displayName ? `, ${displayName}` : ''}!</h2>
            <p>Sua conta foi criada com sucesso.</p>
            <p>Para ativar sua conta, confirme seu e-mail clicando no link abaixo:</p>
            <p><a href="${verificationLink}" target="_blank" rel="noreferrer">Confirmar e-mail</a></p>
            <p>Se você não solicitou esta conta, desconsidere esta mensagem.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
            <p style="font-size:12px;color:#555">IT Solution - Laboratório digital</p>
          </div>
        `;

        await transporter.sendMail({
          from: `"IT Solution" <${fromEmail}>`,
          to: email,
          subject,
          html,
        });
      }
    } catch (mailErr) {
      console.error('Erro ao enviar e-mail de conta criada/verificação:', mailErr);
    }

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
