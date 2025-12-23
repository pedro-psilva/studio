import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin, handleAuthError } from '@/lib/middleware/adminAuth';
import { createEmailTransporter } from '@/lib/email/transport';
import { FROM_ADDRESS } from '@/lib/email/constants';
import { sendTestEmailSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

function interpolateTemplate(input: string, vars: Record<string, string>): string {
  let result = input;

  // Tratar condicionais estilo Mustache: {{#displayName}}, {{displayName}}{{/displayName}}
  // Se displayName existe, mostra o conteúdo entre as tags
  result = result.replace(/\{\{#(\w+)\}\}(.*?)\{\{\/\1\}\}/g, (_match, key: string, content: string) => {
    const val = vars[key];
    // Se a variável tem valor, substitui o conteúdo interpolando variáveis dentro dele
    if (val && val.trim()) {
      return content.replace(/\{\{(\w+)\}\}/g, (_m, innerKey: string) => {
        return vars[innerKey] || '';
      });
    }
    return ''; // Se não tem valor, remove o bloco condicional
  });

  // Substituir variáveis simples: {{variavel}}
  result = result.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key: string) => {
    const val = vars[key];
    return typeof val === 'string' ? val : '';
  });

  return result;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Validar autenticação admin
    await requireAdmin(req);

    // Resolver parâmetro templateId
    const { id: templateId } = await ctx.params;

    if (!templateId || !templateId.trim()) {
      return NextResponse.json({ error: 'Template id ausente.' }, { status: 400 });
    }

    // Validar body com Zod
    const body = await req.json().catch(() => ({}));
    const validatedData = sendTestEmailSchema.parse(body);
    const { to } = validatedData;

    // Buscar template
    const tplSnap = await adminDb.collection('notificationTemplates').doc(templateId).get();
    const tpl = tplSnap.data();

    console.log('🔍 Debug template:', {
      templateId,
      exists: tplSnap.exists,
      hasData: !!tpl,
      subject: typeof tpl?.subject,
      html: typeof tpl?.html,
      subjectLength: tpl?.subject?.length,
      htmlLength: tpl?.html?.length,
    });

    const rawSubject = typeof tpl?.subject === 'string' ? tpl.subject : '';
    const rawHtml = typeof tpl?.html === 'string' ? tpl.html : '';

    if (!rawSubject && !rawHtml) {
      return NextResponse.json(
        { error: 'Nenhum template salvo para este tipo de notificação. Salve um assunto/HTML antes de testar.' },
        { status: 400 }
      );
    }

    // Dados de exemplo para interpolação (variam por tipo de template)
    let vars: Record<string, string> = {};

    // Variáveis específicas por template
    if (templateId === 'confirmacao-email') {
      vars = {
        displayName: 'João Silva',
        email: to,
        userType: 'Cliente',
        verificationLink: 'https://exemplo.com/verify?token=abc123',
      };
    } else {
      // Variáveis padrão para templates de pedidos
      vars = {
        customerName: 'Cliente Teste',
        orderId: '000123',
        orderDate: new Date().toLocaleDateString('pt-BR'),
        totalAmount: 'R$ 1.234,56',
        newStatus: 'Em produção',
      };
    }

    const subject = rawSubject ? interpolateTemplate(rawSubject, vars) : `Teste: ${templateId}`;
    const html = rawHtml
      ? interpolateTemplate(rawHtml, vars)
      : '<p>Template de teste sem HTML.</p>';

    // Criar transporter e enviar email
    const transporter = createEmailTransporter();

    try {
      await transporter.sendMail({
        from: FROM_ADDRESS,
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
    // Tratar erros de autenticação
    if (err.name === 'UnauthorizedError' || err.name === 'ForbiddenError') {
      return handleAuthError(err);
    }

    // Tratar erros de validação Zod
    if (err instanceof z.ZodError) {
      const firstError = err.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    // Tratar erro de configuração SMTP
    if (err.message?.includes('SMTP não configurado')) {
      return NextResponse.json(
        {
          error:
            'SMTP não configurado. Verifique BREVO_SMTP_HOST, BREVO_SMTP_USER e BREVO_SMTP_PASS no .env.local e reinicie o servidor.',
        },
        { status: 500 }
      );
    }

    const message = typeof err?.message === 'string' ? err.message : 'Erro ao enviar e-mail de teste.';
    console.error('Erro ao enviar e-mail de teste (route):', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
