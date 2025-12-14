import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Log detalhado para debug local com ngrok
    console.log('Webhook InfinitePay recebido:', JSON.stringify(data, null, 2));

    // Tentar extrair o ID do pedido de vários campos possíveis
    const orderId = (
      data.order_nsu ??
      data.order_id ??
      data.orderId ??
      data.order_reference ??
      data.orderReference
    ) as string | undefined;

    const transactionNsu = (data.transaction_nsu ?? data.transactionId) as
      | string
      | undefined;

    const paidAmount = data.paid_amount as number | undefined;
    const statusField = (data.status ?? data.payment_status) as
      | string
      | undefined;

    if (!orderId) {
      console.error('Webhook InfinitePay sem orderId válido:', data);
      return NextResponse.json(
        { success: false, message: 'Pedido não encontrado (sem orderId)' },
        { status: 400 },
      );
    }

    // Considera pago se veio valor > 0 OU se o status indicar aprovação
    const paid =
      (typeof paidAmount === 'number' && paidAmount > 0) ||
      statusField === 'approved' ||
      statusField === 'paid' ||
      statusField === 'APPROVED';

    const orderRef = adminDb.collection('orders').doc(orderId);

    if (paid) {
      console.log(
        `Marcando pedido ${orderId} como pago a partir do webhook InfinitePay...`,
      );
      await orderRef.update({
        paymentStatus: 'approved',
        paymentId: transactionNsu ?? null,
        status: 'paid',
        updatedAt: new Date(),
      });
    } else {
      console.log(
        `Marcando pedido ${orderId} como pagamento recusado a partir do webhook InfinitePay...`,
      );
      await orderRef.update({
        paymentStatus: 'refused',
        paymentId: transactionNsu ?? null,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, message: null });
  } catch (error) {
    console.error('Erro no webhook InfinitePay:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar webhook' },
      { status: 400 },
    );
  }
}
