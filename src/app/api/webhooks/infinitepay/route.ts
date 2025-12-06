import { NextRequest, NextResponse } from 'next/server';
import { updateOrderPayment, updateOrderStatus } from '@/lib/orderService';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const orderId = data.order_nsu as string | undefined;
    const transactionNsu = data.transaction_nsu as string | undefined;
    const paidAmount = data.paid_amount as number | undefined;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Pedido não encontrado' },
        { status: 400 },
      );
    }

    const paid = typeof paidAmount === 'number' && paidAmount > 0;

    if (paid) {
      await updateOrderPayment(orderId, 'approved', transactionNsu);
      await updateOrderStatus(orderId, 'paid');
    } else {
      await updateOrderPayment(orderId, 'refused', transactionNsu);
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
