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
 * 
 * COMPORTAMENTO DE RETRY:
 * - Responda rapidamente (< 1 segundo) com status 200 (sucesso) ou 400 (erro)
 * - Status 200: Webhook processado com sucesso
 * - Status 400: Erro processável - InfinitePay tentará reenviar
 * - Outros status: Erro não recuperável
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
      // Retorna 400 para que a InfinitePay tente reenviar
      return NextResponse.json({ success: false, message: 'ID do pedido ausente.' }, { status: 400 });
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      console.error(`Pedido ${orderId} não encontrado no Firestore.`);
      // Retorna 400 para retry (pedido pode ainda não ter sido criado)
      return NextResponse.json({ success: false, message: 'Pedido não encontrado.' }, { status: 400 });
    }

    const orderData = orderSnap.data()!;
    const paid = (() => {
      // Prioridade: status explícito
      if (statusField === 'approved' || statusField === 'paid') return true;

      // Verificação baseada no paid_amount ou flag paid (alguns payloads podem variar)
      if (typeof paidAmount === 'number' && paidAmount > 0) return true;

      // Verificações adicionais baseadas em payloads observados
      if (data.paid) {
        if (typeof data.paid === 'boolean') return data.paid;
        if (typeof data.paid === 'number') return data.paid === 100 || data.paid > 0;
        if (typeof data.paid === 'string') return data.paid === 'true' || data.paid === '100' || data.paid.toLowerCase() === 'paid';
      }

      return false;
    })();

    if (paid) {
      if (orderData.paymentStatus !== 'approved') {
        console.log(`Atualizando pedido ${orderId} para pago (Webhook)...`, {
          transactionNsu,
          paidAmount,
          status: statusField
        });

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
      console.log(`Atualizando pedido ${orderId} como pagamento recusado/pendente...`, {
        status: statusField,
        paid
      });
      // Só marca como recusado se status for explicitamente failure ou refused
      // Se for apenas pendente, não faz nada para não cancelar prematuramente
      if (statusField === 'refused' || statusField === 'failed' || statusField === 'chargeback') {
        await orderRef.update({
          paymentStatus: 'refused',
          paymentId: transactionNsu ?? null,
          updatedAt: new Date(),
        });
      }
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
