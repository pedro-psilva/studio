import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin, handleAuthError } from '@/lib/middleware/adminAuth';
import { OrderData, PaymentStatus } from '@/types/order';
import { UserData } from '@/types/user';

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function csvEscape(value: unknown): string {
  if (value == null) return '';
  const str = String(value);
  if (/[\n\r",;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function htmlEscape(value: unknown): string {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function money(n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n ?? 0);
  return Number.isFinite(v) ? v : 0;
}

function buildOrdersCsv(orders: OrderData[]) {
  const header = [
    'orderId',
    'createdAt',
    'updatedAt',
    'status',
    'paymentStatus',
    'paymentId',
    'subtotal',
    'shipping',
    'discount',
    'couponCode',
    'couponType',
    'couponValue',
    'total',
    'paymentProvider',
    'itemsCount',
  ];

  const rows = orders.map((o) => {
    const createdAt = toDate(o.createdAt);
    const updatedAt = toDate(o.updatedAt);
    const itemsCount = Array.isArray(o.items) ? o.items.length : 0;
    const couponCode = typeof o.coupon?.code === 'string' ? o.coupon.code : '';
    const couponType = typeof o.coupon?.type === 'string' ? o.coupon.type : '';
    const couponValue = money(o.coupon?.value);

    return [
      o.id,
      createdAt ? createdAt.toISOString() : '',
      updatedAt ? updatedAt.toISOString() : '',
      o.status ?? '',
      o.paymentStatus ?? '',
      o.paymentId ?? '',
      money(o.subtotal),
      money(o.shipping),
      money(o.discount),
      couponCode,
      couponType,
      couponValue,
      money(o.total),
      o.paymentProvider ?? '',
      itemsCount,
    ];
  });

  const lines = [header, ...rows].map((cols) => cols.map(csvEscape).join(';'));
  return lines.join('\n');
}

function buildOrderItemsCsv(orders: OrderData[]) {
  const header = [
    'orderId',
    'itemIndex',
    'productId',
    'quantity',
    'shade',
    'material',
    'implantSystem',
    'patientName',
    'teeth',
    'stlFileUrl',
  ];

  const rows: unknown[][] = [];

  for (const o of orders) {
    const items = Array.isArray(o.items) ? o.items : [];
    items.forEach((i, idx) => {
      rows.push([
        o.id,
        idx + 1,
        i?.productId ?? '',
        typeof i?.quantity === 'number' ? i.quantity : 1,
        i?.shade ?? '',
        i?.material ?? '',
        i?.implantSystem ?? '',
        i?.patientName ?? '',
        Array.isArray(i?.teeth) ? i.teeth.join(',') : '',
        i?.stlFileUrl ?? '',
      ]);
    });
  }

  const lines = [header, ...rows].map((cols) => cols.map(csvEscape).join(';'));
  return lines.join('\n');
}

function buildHtmlReport(params: {
  userId: string;
  name: string;
  cpfCnpj: string;
  email: string;
  totalOrders: number;
  paidOrders: number;
  totalValue: number;
  paidValue: number;
  orders: OrderData[];
}) {
  const rows = params.orders
    .slice()
    .sort((a, b) => {
      const da = toDate(a.updatedAt) ?? toDate(a.createdAt) ?? new Date(0);
      const db = toDate(b.updatedAt) ?? toDate(b.createdAt) ?? new Date(0);
      return db.getTime() - da.getTime();
    })
    .map((o) => {
      const createdAt = toDate(o.createdAt);
      const updatedAt = toDate(o.updatedAt);
      const itemsResumo = (o.items ?? [])
        .map((i) => {
          const pid = i?.productId ?? '';
          const q = typeof i?.quantity === 'number' ? i.quantity : 1;
          return pid ? `${pid} x${q}` : '';
        })
        .filter(Boolean)
        .join(' | ');

      return `
        <tr>
          <td>${htmlEscape(o.id)}</td>
          <td>${createdAt ? createdAt.toLocaleString('pt-BR') : ''}</td>
          <td>${updatedAt ? updatedAt.toLocaleString('pt-BR') : ''}</td>
          <td>${htmlEscape(o.status ?? '')}</td>
          <td>${htmlEscape(o.paymentStatus ?? '')}</td>
          <td style="text-align:right">${money(o.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
          <td>${htmlEscape(itemsResumo)}</td>
        </tr>
      `;
    })
    .join('');

  const paidRate = params.totalOrders > 0 ? (params.paidOrders / params.totalOrders) * 100 : 0;

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Relatório do Usuário</title>
  <style>
    body { font-family: Arial, sans-serif; color:#111; margin: 24px; }
    h1 { margin: 0 0 8px; font-size: 20px; }
    .muted { color: #555; font-size: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
    .card { border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px; }
    .card h3 { margin: 0 0 8px; font-size: 14px; }
    .k { color: #666; font-size: 12px; margin-bottom: 2px; }
    .v { font-size: 14px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #e5e5e5; padding: 8px; font-size: 12px; vertical-align: top; }
    th { background: #fafafa; text-align: left; }
    @media print { body { margin: 0.7cm; } }
  </style>
</head>
<body>
  <h1>Relatório do Usuário</h1>
  <div class="muted">Usuário ID: ${htmlEscape(params.userId)}</div>

  <div class="grid">
    <div class="card">
      <h3>Dados do usuário</h3>
      <div class="k">Nome</div>
      <div class="v">${htmlEscape(params.name)}</div>
      <div style="height:8px"></div>
      <div class="k">CPF/CNPJ</div>
      <div class="v">${htmlEscape(params.cpfCnpj)}</div>
      <div style="height:8px"></div>
      <div class="k">E-mail</div>
      <div class="v">${htmlEscape(params.email)}</div>
    </div>

    <div class="card">
      <h3>Resumo de pedidos</h3>
      <div class="k">Total de pedidos</div>
      <div class="v">${params.totalOrders}</div>
      <div style="height:8px"></div>
      <div class="k">Pedidos pagos</div>
      <div class="v">${params.paidOrders} (${paidRate.toFixed(1)}%)</div>
      <div style="height:8px"></div>
      <div class="k">Valor total</div>
      <div class="v">${params.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
      <div style="height:8px"></div>
      <div class="k">Valor pago</div>
      <div class="v">${params.paidValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Pedido</th>
        <th>Criado em</th>
        <th>Atualizado em</th>
        <th>Status</th>
        <th>Pagamento</th>
        <th>Total</th>
        <th>Itens</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Validar autenticação admin
    await requireAdmin(req);

    // Resolver parâmetro userId
    const { id: userId } = await ctx.params;

    if (!userId || !userId.trim()) {
      return NextResponse.json({ error: 'User id ausente.' }, { status: 400 });
    }

    const url = new URL(req.url);
    const format = (url.searchParams.get('format') ?? 'csv').toLowerCase();

    if (format !== 'csv' && format !== 'pdf') {
      return NextResponse.json({ error: 'Formato inválido. Use csv ou pdf.' }, { status: 400 });
    }

    // Buscar dados do usuário
    const userSnap = await adminDb.collection('users').doc(userId).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const userData = userSnap.data() as UserData;

    const name =
      userData.displayName?.trim() ||
      userData.clinicName?.trim() ||
      userData.email?.split('@')[0] ||
      'Usuário';

    const cpfCnpj = userData.cpfCnpj || '';
    const email = userData.email || '';
    const phone = userData.phone || '';
    const pessoaTipo = userData.pessoaTipo || '';
    const tipo = userData.tipo || '';
    const status = userData.status || '';

    // Buscar pedidos do usuário
    const ordersSnap = await adminDb.collection('orders').where('userId', '==', userId).get();

    const orders: OrderData[] = ordersSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: String(data?.id ?? d.id),
        userId: String(data?.userId ?? userId),
        items: Array.isArray(data?.items) ? data.items : [],
        subtotal: money(data?.subtotal),
        shipping: money(data?.shipping),
        discount: money(data?.discount),
        coupon: data?.coupon ?? null,
        total: money(data?.total),
        status: typeof data?.status === 'string' ? data.status : '',
        createdAt: data?.createdAt,
        updatedAt: data?.updatedAt,
        paymentProvider: data?.paymentProvider ?? null,
        paymentStatus: (data?.paymentStatus ?? null) as PaymentStatus,
        paymentId: data?.paymentId ?? null,
      };
    });

    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.paymentStatus === 'approved').length;
    const totalValue = orders.reduce((acc, o) => acc + money(o.total), 0);
    const paidValue = orders
      .filter((o) => o.paymentStatus === 'approved')
      .reduce((acc, o) => acc + money(o.total), 0);

    const safeFileName = `usuario-${userId}`;

    if (format === 'csv') {
      const lines: string[] = [];
      lines.push('SEC;CHAVE;VALOR');
      lines.push(['USUARIO', 'ID', userId].map(csvEscape).join(';'));
      lines.push(['USUARIO', 'NOME', name].map(csvEscape).join(';'));
      lines.push(['USUARIO', 'CPF_CNPJ', cpfCnpj].map(csvEscape).join(';'));
      lines.push(['USUARIO', 'EMAIL', email].map(csvEscape).join(';'));
      lines.push(['USUARIO', 'TELEFONE', phone].map(csvEscape).join(';'));
      lines.push(['USUARIO', 'PESSOA_TIPO', pessoaTipo].map(csvEscape).join(';'));
      lines.push(['USUARIO', 'PERFIL', tipo].map(csvEscape).join(';'));
      lines.push(['USUARIO', 'STATUS', status].map(csvEscape).join(';'));
      lines.push('');
      lines.push('PEDIDOS_RESUMO');
      lines.push(['METRICA', 'TOTAL_PEDIDOS', totalOrders].map(csvEscape).join(';'));
      lines.push(['METRICA', 'PEDIDOS_PAGOS', paidOrders].map(csvEscape).join(';'));
      lines.push(['METRICA', 'VALOR_TOTAL', totalValue].map(csvEscape).join(';'));
      lines.push(['METRICA', 'VALOR_PAGO', paidValue].map(csvEscape).join(';'));
      lines.push('');
      lines.push('PEDIDOS');
      lines.push(buildOrdersCsv(orders));
      lines.push('');
      lines.push('ITENS_DOS_PEDIDOS');
      lines.push(buildOrderItemsCsv(orders));

      const csv = `\uFEFF${lines.join('\n')}`;

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${safeFileName}.csv"`,
        },
      });
    }

    const html = buildHtmlReport({
      userId,
      name,
      cpfCnpj,
      email,
      totalOrders,
      paidOrders,
      totalValue,
      paidValue,
      orders,
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${safeFileName}.html"`,
      },
    });
  } catch (err: any) {
    // Tratar erros de autenticação
    if (err.name === 'UnauthorizedError' || err.name === 'ForbiddenError') {
      return handleAuthError(err);
    }

    const message = typeof err?.message === 'string' ? err.message : 'Erro ao gerar relatório.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
