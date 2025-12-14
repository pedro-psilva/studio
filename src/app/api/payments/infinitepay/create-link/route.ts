import { NextRequest, NextResponse } from 'next/server';

const INFINITEPAY_ENDPOINT = 'https://api.infinitepay.io/invoices/public/checkout/links';

export async function POST(req: NextRequest) {
  try {
    const { orderId, total, items: rawItems, customer, address } = await req.json();

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 });
    }

    if (typeof total !== 'number' || !Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ error: 'total inválido' }, { status: 400 });
    }

    const handle = process.env.INFINITEPAY_HANDLE;
    const baseUrl = process.env.BASE_URL;

    if (!handle || !baseUrl) {
      console.error('Configuração de pagamento incompleta. INFINITEPAY_HANDLE ou BASE_URL ausentes.');
      return NextResponse.json({ error: 'Configuração de pagamento incompleta' }, { status: 500 });
    }

    const redirectUrl = `${baseUrl}/checkout/${orderId}`;
    const webhookUrl = `${baseUrl}/api/webhooks/infinitepay`;

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

    const body: any = {
      handle,
      redirect_url: redirectUrl,
      webhook_url: webhookUrl,
      order_nsu: orderId,
      items,
    };

    if (customer && (customer.name || customer.email || customer.phone_number)) {
      body.customer = {};
      if (customer.name) body.customer.name = customer.name;
      if (customer.email) body.customer.email = customer.email;
      if (customer.phone_number) body.customer.phone_number = customer.phone_number;
    }

    if (address && (address.cep || address.number || address.complement)) {
      body.address = {};
      if (address.cep) body.address.cep = address.cep;
      if (address.number) body.address.number = address.number;
      if (address.complement) body.address.complement = address.complement;
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
      body: JSON.stringify(body),
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
    console.error('Erro na rota create-link InfinitePay:', error);
    return NextResponse.json({ error: 'Erro interno ao criar link de pagamento' }, { status: 500 });
  }
}
