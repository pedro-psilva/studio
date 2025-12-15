import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendPaymentConfirmedEmail } from '@/lib/emailService';

async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const doc = await userRef.get();
    if (doc.exists) {
      return doc.data()?.email || null;
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar e-mail do usuário ${userId}:`, error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Webhook InfinitePay recebido:', JSON.stringify(data, null, 2));

    const orderId = (data.order_nsu ?? data.order_id) as string | undefined;
    const transactionNsu = (data.transaction_nsu ?? data.transactionId) as string | undefined;
    const paidAmount = data.paid_amount as number | undefined;
    const statusField = (data.status ?? data.payment_status) as string | undefined;

    if (!orderId) {
      console.error('Webhook InfinitePay sem orderId válido:', data);
      return NextResponse.json({ success: false, message: 'ID do pedido ausente.' }, { status: 400 });
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      console.error(`Pedido ${orderId} não encontrado no Firestore.`);
      return NextResponse.json({ success: false, message: 'Pedido não encontrado.' }, { status: 404 });
    }

    const orderData = orderSnap.data()!;
    const paid = (typeof paidAmount === 'number' && paidAmount > 0) || statusField === 'approved' || statusField === 'paid';

    if (paid) {
      if (orderData.paymentStatus !== 'approved') {
        console.log(`Atualizando pedido ${orderId} para pago...`);
        await orderRef.update({
          paymentStatus: 'approved',
          status: 'paid',
          paymentId: transactionNsu ?? null,
          updatedAt: new Date(),
        });

        // Enviar e-mail de confirmação de pagamento
        const userEmail = await getUserEmail(orderData.userId);
        if (userEmail) {
          await sendPaymentConfirmedEmail({
            to: userEmail,
            customerName: orderData.customerName || 'Cliente',
            orderId: orderId,
          });
        }
      } else {
        console.log(`Pedido ${orderId} já estava marcado como pago. Webhook ignorado.`);
      }
    } else {
      console.log(`Atualizando pedido ${orderId} como pagamento recusado...`);
      await orderRef.update({
        paymentStatus: 'refused',
        paymentId: transactionNsu ?? null,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no webhook InfinitePay:', error);
    return NextResponse.json({ success: false, message: 'Erro interno ao processar webhook.' }, { status: 500 });
  }
}
