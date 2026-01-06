import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { sendPaymentConfirmedEmail } from '@/lib/emailService';

/**
 * PATCH /api/admin/orders/[orderId]/payment
 * 
 * Endpoint administrativo para corrigir o status de pagamento de um pedido.
 * Usado quando o webhook falha ou o status fica inconsistente.
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    // Verificar autenticação admin
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    try {
        const { orderId } = await params;
        const body = await req.json();
        const { paymentStatus, paymentId, sendEmail } = body as {
            paymentStatus?: 'pending' | 'approved' | 'refused';
            paymentId?: string;
            sendEmail?: boolean;
        };

        if (!paymentStatus) {
            return NextResponse.json(
                { error: 'paymentStatus é obrigatório' },
                { status: 400 }
            );
        }

        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderSnap = await orderRef.get();

        if (!orderSnap.exists) {
            return NextResponse.json(
                { error: 'Pedido não encontrado' },
                { status: 404 }
            );
        }

        const orderData = orderSnap.data()!;

        // Atualiza o pedido
        const updateData: Record<string, unknown> = {
            paymentStatus,
            updatedAt: new Date(),
        };

        if (paymentId) {
            updateData.paymentId = paymentId;
        }

        // Se aprovado, também atualiza o status geral
        if (paymentStatus === 'approved') {
            updateData.status = 'paid';
        }

        await orderRef.update(updateData);

        console.log(`Pedido ${orderId} atualizado manualmente:`, {
            paymentStatus,
            paymentId,
            by: authResult.email,
        });

        // Enviar e-mail de confirmação se solicitado
        if (sendEmail && paymentStatus === 'approved') {
            try {
                const userRef = adminDb.collection('users').doc(orderData.userId);
                const userSnap = await userRef.get();
                const userEmail = userSnap.exists ? userSnap.data()?.email : null;

                if (userEmail) {
                    await sendPaymentConfirmedEmail({
                        to: userEmail,
                        customerName: orderData.customerName || 'Cliente',
                        orderId,
                    });
                    console.log(`E-mail de confirmação enviado para ${userEmail}`);
                }
            } catch (emailError) {
                console.error('Erro ao enviar e-mail de confirmação:', emailError);
                // Não falha a requisição por erro de e-mail
            }
        }

        return NextResponse.json({
            success: true,
            orderId,
            paymentStatus,
            message: 'Status de pagamento atualizado com sucesso',
        });
    } catch (error) {
        console.error('Erro ao atualizar status de pagamento:', error);
        return NextResponse.json(
            { error: 'Erro interno ao atualizar status de pagamento' },
            { status: 500 }
        );
    }
}
