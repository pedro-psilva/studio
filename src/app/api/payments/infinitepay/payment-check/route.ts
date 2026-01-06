import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendPaymentConfirmedEmail } from '@/lib/emailService';

const INFINITEPAY_PAYMENT_CHECK_ENDPOINT = 'https://api.infinitepay.io/invoices/public/checkout/payment_check';

/**
 * Schema de validação para verificação de status de pagamento
 */
const paymentCheckSchema = z.object({
    orderNsu: z.string().min(1, 'order_nsu é obrigatório'),
    transactionNsu: z.string().min(1, 'transaction_nsu é obrigatório'),
    slug: z.string().min(1, 'slug é obrigatório'),
});

/**
 * Busca o e-mail do usuário pelo ID
 */
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

/**
 * POST /api/payments/infinitepay/payment-check
 * 
 * Endpoint para verificar o status de um pagamento na InfinitePay.
 * Usado como fallback caso o webhook falhe ou para consultas manuais.
 * 
 * IMPORTANTE: Este endpoint também atualiza o status do pedido no banco
 * quando o pagamento é confirmado.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = paymentCheckSchema.parse(body);

        const handle = process.env.INFINITEPAY_HANDLE;

        if (!handle) {
            console.error('Configuração de pagamento incompleta. INFINITEPAY_HANDLE ausente.');
            return NextResponse.json({ error: 'Configuração de pagamento incompleta' }, { status: 500 });
        }

        const payload = {
            handle,
            order_nsu: validatedData.orderNsu,
            transaction_nsu: validatedData.transactionNsu,
            slug: validatedData.slug,
        };

        console.log('Verificando status de pagamento na InfinitePay:', {
            endpoint: INFINITEPAY_PAYMENT_CHECK_ENDPOINT,
            orderNsu: validatedData.orderNsu,
        });

        const response = await fetch(INFINITEPAY_PAYMENT_CHECK_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Erro ao verificar status de pagamento InfinitePay:', {
                status: response.status,
                statusText: response.statusText,
                body: text,
            });
            return NextResponse.json(
                { error: 'Falha ao verificar status de pagamento' },
                { status: 502 }
            );
        }

        const data = await response.json() as {
            success?: boolean;
            paid?: number | boolean | string;
            amount?: number;
            paid_amount?: number;
            installments?: number;
            capture_method?: string;
            payment_method?: string;
            status?: string;
        };

        // Determinar se o pagamento foi realizado
        // A API pode retornar paid como boolean, número (100 = pago) ou string
        const isPaid = (() => {
            if (typeof data.paid === 'boolean') return data.paid;
            if (typeof data.paid === 'number') return data.paid === 100 || data.paid > 0;
            if (typeof data.paid === 'string') return data.paid === 'true' || data.paid === '100' || data.paid.toLowerCase() === 'paid';
            if (data.status === 'approved' || data.status === 'paid') return true;
            return false;
        })();

        console.log('Status de pagamento obtido com sucesso:', {
            orderNsu: validatedData.orderNsu,
            paidRaw: data.paid,
            paidType: typeof data.paid,
            isPaid,
            status: data.status,
            captureMethod: data.capture_method,
        });

        // Se o pagamento foi confirmado, atualizar o pedido no banco de dados
        if (isPaid) {
            try {
                const orderId = validatedData.orderNsu;
                const orderRef = adminDb.collection('orders').doc(orderId);
                const orderSnap = await orderRef.get();

                if (orderSnap.exists) {
                    const orderData = orderSnap.data()!;

                    // Só atualiza se ainda não estava marcado como pago
                    if (orderData.paymentStatus !== 'approved') {
                        console.log(`Atualizando pedido ${orderId} para pago via payment-check...`);

                        await orderRef.update({
                            paymentStatus: 'approved',
                            status: 'paid',
                            paymentId: validatedData.transactionNsu,
                            updatedAt: new Date(),
                        });

                        // Enviar e-mail de confirmação
                        const userEmail = await getUserEmail(orderData.userId);
                        if (userEmail) {
                            try {
                                await sendPaymentConfirmedEmail({
                                    to: userEmail,
                                    customerName: orderData.customerName || 'Cliente',
                                    orderId: orderId,
                                });
                                console.log(`E-mail de confirmação enviado para ${userEmail}`);
                            } catch (emailError) {
                                console.error('Erro ao enviar e-mail de confirmação:', emailError);
                            }
                        }
                    } else {
                        console.log(`Pedido ${orderId} já estava marcado como pago.`);
                    }
                } else {
                    console.error(`Pedido ${orderId} não encontrado no Firestore.`);
                }
            } catch (dbError) {
                console.error('Erro ao atualizar pedido no banco:', dbError);
                // Não falha a requisição, apenas loga o erro
            }
        }

        return NextResponse.json({
            success: data.success ?? true,
            paid: isPaid,
            amount: data.amount,
            paidAmount: data.paid_amount,
            installments: data.installments,
            captureMethod: data.capture_method,
            paymentMethod: data.payment_method,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const firstError = error.errors[0];
            return NextResponse.json({ error: firstError.message }, { status: 400 });
        }

        console.error('Erro na rota payment-check InfinitePay:', error);
        return NextResponse.json(
            { error: 'Erro interno ao verificar status de pagamento' },
            { status: 500 }
        );
    }
}
