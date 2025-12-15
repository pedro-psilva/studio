import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, type OrderConfirmationEmailParams } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderConfirmationEmailParams;

    // Basic validation
    if (!body.to || !body.customerName || !body.orderId || !body.orderDate || !body.totalAmount) {
      return NextResponse.json({ error: 'Parâmetros ausentes.' }, { status: 400 });
    }

    await sendOrderConfirmationEmail(body);

    return NextResponse.json({ success: true, message: 'E-mail de confirmação de pedido enviado.' });
  } catch (error) {
    console.error('Erro na API de confirmação de pedido:', error);
    return NextResponse.json({ error: 'Falha ao enviar e-mail.' }, { status: 500 });
  }
}
