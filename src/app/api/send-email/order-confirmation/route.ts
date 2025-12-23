import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, type OrderConfirmationEmailParams } from '@/lib/emailService';
import { orderConfirmationEmailSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar com Zod
    const validatedData = orderConfirmationEmailSchema.parse(body);

    await sendOrderConfirmationEmail(validatedData as OrderConfirmationEmailParams);

    return NextResponse.json({ success: true, message: 'E-mail de confirmação de pedido enviado.' });
  } catch (error) {
    // Tratar erros de validação Zod
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    console.error('Erro na API de confirmação de pedido:', error);
    return NextResponse.json({ error: 'Falha ao enviar e-mail.' }, { status: 500 });
  }
}
