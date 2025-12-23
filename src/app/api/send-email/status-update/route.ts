import { NextRequest, NextResponse } from 'next/server';
import { sendOrderStatusUpdateEmail, type OrderStatusUpdateEmailParams } from '@/lib/emailService';
import { orderStatusUpdateEmailSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar com Zod
    const validatedData = orderStatusUpdateEmailSchema.parse(body);

    await sendOrderStatusUpdateEmail(validatedData as OrderStatusUpdateEmailParams);

    return NextResponse.json({ success: true, message: 'E-mail de atualização de status enviado.' });
  } catch (error) {
    // Tratar erros de validação Zod
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    console.error('Erro na API de atualização de status:', error);
    return NextResponse.json({ error: 'Falha ao enviar e-mail.' }, { status: 500 });
  }
}
