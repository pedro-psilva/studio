import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAdmin, handleAuthError } from '@/lib/middleware/adminAuth';
import { createEmailTransporter, isSmtpConfigured } from '@/lib/email/transport';
import { FROM_ADDRESS } from '@/lib/email/constants';
import { createUserSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    // Validar autenticação admin
    await requireAdmin(req);

    // Validar body com Zod
    const body = await req.json();
    const validatedData = createUserSchema.parse(body);

    const { email, password, displayName, tipo, forcePasswordReset, adminAccess } = validatedData;

    // Criar usuário no Firebase Auth
    const createdUser = await adminAuth.createUser({
      email,
      password,
      displayName: displayName || undefined,
    });

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: 'BASE_URL não configurado.' }, { status: 500 });
    }

    // Gerar link de verificação de email
    const verificationLink = await adminAuth.generateEmailVerificationLink(email, {
      url: `${baseUrl}/auth/verify-email`,
    });

    // Salvar dados do usuário no Firestore
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

    // Enviar email de boas-vindas se SMTP estiver configurado
    try {
      if (isSmtpConfigured()) {
        const transporter = createEmailTransporter();

        // Tentar carregar template do Firestore
        let subject = 'Conta criada - Confirme seu e-mail';
        let htmlTemplate = '';

        try {
          const templateDoc = await adminDb.collection('notificationTemplates').doc('confirmacao-email').get();
          if (templateDoc.exists) {
            const templateData = templateDoc.data();
            subject = templateData?.subject || subject;
            htmlTemplate = templateData?.html || '';
          }
        } catch (templateErr) {
          console.warn('Template não encontrado no Firestore, usando fallback:', templateErr);
        }

        // Se não houver template, usar HTML embutido moderno
        if (!htmlTemplate) {
          htmlTemplate = `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Confirme seu E-mail</title>
  </head>
  <body style="margin:0;padding:0;background:#0b0f14;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0b0f14;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="640" style="max-width:640px;background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:22px 22px 14px 22px;">
                <div style="text-align:center;line-height:1.1;">
                  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;font-size:26px;font-weight:800;color:#ffffff;">IT Solution</div>
                  <div style="font-family:'Great Vibes','Brush Script MT','Segoe Script',cursive;font-size:18px;color:#d6b56c;margin-top:6px;">Laboratório digital</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 22px 22px 22px;">
                <div style="font-family:Inter,Segoe UI,Arial,sans-serif;color:#e5e7eb;font-size:15px;line-height:1.6;">
                  <h1 style="margin:0 0 10px 0;font-size:18px;color:#ffffff;">Olá{{#displayName}}, {{displayName}}{{/displayName}}!</h1>
                  <p style="margin:0 0 12px 0;color:#cbd5e1;">Sua conta foi criada com sucesso. Para começar a usar nossos serviços, você precisa confirmar seu endereço de e-mail.</p>
                  <div style="background:#0b1220;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;margin:14px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:6px 0;color:#e5e7eb;">E-mail</td>
                        <td align="right" style="padding:6px 0;color:#ffffff;font-weight:800;">{{email}}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#e5e7eb;">Tipo de conta</td>
                        <td align="right" style="padding:6px 0;color:#d6b56c;font-weight:900;">{{userType}}</td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin:22px 0;text-align:center;">
                    <a href="{{verificationLink}}" target="_blank" rel="noreferrer" style="display:inline-block;background:linear-gradient(135deg,#d6b56c 0%,#c9a553 100%);color:#000000;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;box-shadow:0 4px 14px rgba(214,181,108,0.3);">Confirmar E-mail</a>
                  </div>
                  <p style="margin:14px 0 0 0;color:#94a3b8;font-size:13px;">Ou copie e cole este link no seu navegador:</p>
                  <p style="margin:6px 0 14px 0;color:#60a5fa;font-size:12px;word-break:break-all;">{{verificationLink}}</p>
                  <div style="background:rgba(251,191,36,0.1);border-left:3px solid #fbbf24;padding:12px;border-radius:6px;margin:14px 0;">
                    <p style="margin:0;color:#fbbf24;font-size:13px;font-weight:600;">⚠️ Este link expira em 24 horas</p>
                  </div>
                  <p style="margin:14px 0 0 0;color:#cbd5e1;font-size:13px;">Se você não solicitou esta conta, pode ignorar este e-mail com segurança.</p>
                  <div style="margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);">
                    <p style="margin:0;color:#cbd5e1;">Atenciosamente,</p>
                    <p style="margin:0;color:#ffffff;font-weight:700;">Equipe IT Solution</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 22px 18px 22px;background:#0b1220;border-top:1px solid rgba(255,255,255,0.08);">
                <div style="font-family:Inter,Segoe UI,Arial,sans-serif;font-size:12px;line-height:1.5;color:#94a3b8;text-align:center;">Se você tiver dúvidas, responda este e-mail ou entre em contato com nosso suporte.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
        }

        // Mapear tipo de usuário para português
        const tipoMap: Record<string, string> = {
          'cliente': 'Cliente',
          'colaborador': 'Colaborador',
          'admin': 'Administrador',
        };
        const userTypeLabel = tipoMap[tipo] || tipo;

        // Substituir variáveis no template
        const html = htmlTemplate
          .replace(/\{\{#displayName\}\}.*?\{\{\/displayName\}\}/g, displayName ? `, ${displayName}` : '')
          .replace(/\{\{displayName\}\}/g, displayName || '')
          .replace(/\{\{email\}\}/g, email)
          .replace(/\{\{userType\}\}/g, userTypeLabel)
          .replace(/\{\{verificationLink\}\}/g, verificationLink);

        await transporter.sendMail({
          from: FROM_ADDRESS,
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
    // Tratar erros de autenticação
    if (err.name === 'UnauthorizedError' || err.name === 'ForbiddenError') {
      return handleAuthError(err);
    }

    // Tratar erros de validação Zod
    if (err instanceof z.ZodError) {
      const firstError = err.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    // Tratar erro de email duplicado
    if (err?.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'Este email já está cadastrado.' }, { status: 409 });
    }

    // Erro genérico
    const message = typeof err?.message === 'string' ? err.message : 'Erro ao criar usuário.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
