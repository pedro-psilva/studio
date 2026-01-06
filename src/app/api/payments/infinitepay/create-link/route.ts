import { NextRequest, NextResponse } from 'next/server';
import { createPaymentLinkSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

const INFINITEPAY_ENDPOINT = 'https://api.infinitepay.io/invoices/public/checkout/links';

export async function POST(req: NextRequest) {
  try {
    // Validar body com Zod
    const body = await req.json();
    const validatedData = createPaymentLinkSchema.parse(body);

    const { orderId, total, items: rawItems, customer, address } = validatedData;

    const handle = process.env.INFINITEPAY_HANDLE;
    const baseUrl = process.env.BASE_URL;

    if (!handle || !baseUrl) {
      console.error('Configuração de pagamento incompleta. INFINITEPAY_HANDLE ou BASE_URL ausentes.');
      return NextResponse.json({ error: 'Configuração de pagamento incompleta' }, { status: 500 });
    }

    const redirectUrl = `${baseUrl}/checkout/${orderId}`;
    const webhookUrl = `${baseUrl}/api/webhooks/infinitepay`;

    // Validar valor mínimo aceito pelo InfinitePay (R$ 1,00)
    if (total < 1.00) {
      console.error('Valor do pedido abaixo do mínimo aceito pelo InfinitePay:', total);
      return NextResponse.json(
        { error: 'O valor mínimo para pagamento é de R$ 1,00' },
        { status: 400 }
      );
    }

    // Validar e processar items
    const validItems = Array.isArray(rawItems)
      ? rawItems.filter(
        (it) =>
          typeof it === 'object' &&
          it != null &&
          typeof it.quantity === 'number' &&
          it.quantity > 0 &&
          typeof it.price === 'number' &&
          it.price > 0 &&
          typeof it.description === 'string' &&
          it.description.length > 0,
      )
      : [];

    const items =
      validItems.length > 0
        ? validItems
        : [
          {
            quantity: 1,
            price: Math.round(total * 100),
            description: `Pedido ${orderId}`,
          },
        ];

    const body_payload: any = {
      handle,
      redirect_url: redirectUrl,
      webhook_url: webhookUrl,
      order_nsu: orderId,
      items,
    };

    // Dados do cliente (opcional) - facilita o checkout pré-preenchendo informações
    if (customer && (customer.name || customer.email || customer.phone_number)) {
      body_payload.customer = {};
      if (customer.name) body_payload.customer.name = customer.name;
      if (customer.email) body_payload.customer.email = customer.email;
      if (customer.phone_number) body_payload.customer.phone_number = customer.phone_number;
    }

    // Endereço de entrega (opcional) - para produtos que requerem entrega física
    if (address && (address.cep || address.street || address.neighborhood || address.number || address.complement)) {
      body_payload.address = {};
      if (address.cep) body_payload.address.cep = address.cep;
      if (address.street) body_payload.address.street = address.street;
      if (address.neighborhood) body_payload.address.neighborhood = address.neighborhood;
      if (address.number) body_payload.address.number = address.number;
      if (address.complement) body_payload.address.complement = address.complement;
    }

    console.log('Enviando requisição para InfinitePay:', {
      endpoint: INFINITEPAY_ENDPOINT,
      handle,
      redirectUrl,
      webhookUrl,
      items,
    });

    const response = await fetch(INFINITEPAY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body_payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Erro ao criar link InfinitePay:', {
        status: response.status,
        statusText: response.statusText,
        body: text,
      });
      return NextResponse.json({ error: 'Falha ao criar link de pagamento' }, { status: 502 });
    }

    const data = (await response.json()) as { url?: string };

    if (!data.url) {
      console.error('Resposta da InfinitePay não contém URL:', data);
      return NextResponse.json({ error: 'Resposta inválida da InfinitePay' }, { status: 502 });
    }

    console.log('Link de pagamento InfinitePay gerado com sucesso:', data.url);
    return NextResponse.json({ url: data.url });
  } catch (error) {
    // Tratar erros de validação Zod
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    console.error('Erro na rota create-link InfinitePay:', error);
    return NextResponse.json({ error: 'Erro interno ao criar link de pagamento' }, { status: 500 });
  }
}
