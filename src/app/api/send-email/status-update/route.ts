import { NextRequest, NextResponse } from 'next/server';
import { sendOrderStatusUpdateEmail, type OrderStatusUpdateEmailParams } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderStatusUpdateEmailParams;

    // Basic validation
    if (!body.to || !body.customerName || !body.orderId || !body.newStatus) {
      return NextResponse.json({ error: 'Parâmetros ausentes.' }, { status: 400 });
    }

    await sendOrderStatusUpdateEmail(body);

    return NextResponse.json({ success: true, message: 'E-mail de atualização de status enviado.' });
  } catch (error) {
    console.error('Erro na API de atualização de status:', error);
    return NextResponse.json({ error: 'Falha ao enviar e-mail.' }, { status: 500 });
  }
}
