import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendPaymentConfirmedEmail } from '@/lib/emailService';

/**
 * Lista de IPs permitidos para webhook do InfinitePay (opcional)
 * Configure via variável de ambiente INFINITEPAY_ALLOWED_IPS separados por vírgula
 * Ex: "192.168.1.1,10.0.0.1"
 * 
 * NOTA: A InfinitePay não fornece assinatura HMAC para validação de webhook.
 * Como alternativa, você pode configurar whitelist de IPs se necessário.
 */
function validateWebhookOrigin(req: NextRequest): boolean {
  const allowedIps = process.env.INFINITEPAY_ALLOWED_IPS;

  if (!allowedIps) {
    // Se não configurado, aceitar todas as requisições
    // Em produção, considere configurar whitelist de IPs
    return true;
  }

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const allowedList = allowedIps.split(',').map(ip => ip.trim());

  return allowedList.includes(clientIp);
}

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
    // Validar origem da requisição (opcional)
    if (!validateWebhookOrigin(req)) {
      console.warn('Webhook rejeitado: IP não autorizado', {
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, message: 'Origem não autorizada.' },
        { status: 403 }
      );
    }

    const data = await req.json();
    console.log('Webhook InfinitePay recebido:', {
      orderId: data.order_nsu || data.order_id,
      status: data.status || data.payment_status,
      timestamp: new Date().toISOString(),
      data: JSON.stringify(data, null, 2),
    });

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
    console.error('Erro no webhook InfinitePay:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ success: false, message: 'Erro interno ao processar webhook.' }, { status: 500 });
  }
}
