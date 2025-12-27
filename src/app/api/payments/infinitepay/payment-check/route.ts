import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
 * POST /api/payments/infinitepay/payment-check
 * 
 * Endpoint para verificar o status de um pagamento na InfinitePay.
 * Usado como fallback caso o webhook falhe ou para consultas manuais.
 * 
 * Documentação: https://api.infinitepay.io/invoices/public/checkout/payment_check
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
            paid?: boolean;
            amount?: number;
            paid_amount?: number;
            installments?: number;
            capture_method?: string;
        };

        console.log('Status de pagamento obtido com sucesso:', {
            orderNsu: validatedData.orderNsu,
            paid: data.paid,
            captureMethod: data.capture_method,
        });

        return NextResponse.json({
            success: data.success ?? true,
            paid: data.paid ?? false,
            amount: data.amount,
            paidAmount: data.paid_amount,
            installments: data.installments,
            captureMethod: data.capture_method,
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
