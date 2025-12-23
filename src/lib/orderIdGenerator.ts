import { db } from '@/lib/firebase';
import { doc, runTransaction, setDoc } from 'firebase/firestore';

/**
 * Gera um ID de pedido no formato: YYMMDD-N
 * Onde:
 * - YY = Ano (ex: 25 para 2025)
 * - MM = Mês (ex: 12 para dezembro)
 * - DD = Dia (ex: 08)
 * - N = Sequencial do dia (1, 2, 3...)
 * 
 * Exemplos: 251208-1, 251208-2, 251209-1
 * 
 * @returns ID único no formato YYMMDD-N
 * @example
 * const orderId = await generateOrderId(); // "251208-1"
 */
export async function generateOrderId(): Promise<string> {
    const now = new Date();

    // Formatar data: YY, MM, DD
    const year = String(now.getFullYear()).slice(-2); // 2025 -> "25"
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 12
    const day = String(now.getDate()).padStart(2, '0'); // 08

    const datePrefix = `${year}${month}${day}`; // "251208"

    // Nome do contador é único por dia
    const counterDocId = `orders-${now.getFullYear()}-${month}-${day}`; // "orders-2025-12-08"
    const counterRef = doc(db, 'counters', counterDocId);

    try {
        // Usar transação para garantir atomicidade
        const sequentialNumber = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);

            let currentValue = 0;

            if (counterDoc.exists()) {
                const data = counterDoc.data();
                currentValue = typeof data?.value === 'number' ? data.value : 0;
            } else {
                // Criar documento contador para este dia
                transaction.set(counterRef, {
                    value: 0,
                    date: `${now.getFullYear()}-${month}-${day}`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            const nextValue = currentValue + 1;

            // Atualizar contador
            transaction.update(counterRef, {
                value: nextValue,
                updatedAt: new Date(),
            });

            return nextValue;
        });

        // Formato final: YYMMDD-N
        return `${datePrefix}-${sequentialNumber}`;
    } catch (error) {
        console.error('Erro ao gerar ID de pedido:', error);

        // Fallback: usar timestamp dos últimos 5 dígitos + random
        const timestamp = Date.now();
        const last5 = String(timestamp).slice(-5);
        const random = Math.floor(Math.random() * 100);
        const fallbackId = `${datePrefix}-${last5}${random}`;

        console.warn(`Usando ID fallback: ${fallbackId}`);
        return fallbackId;
    }
}

/**
 * Reseta o contador de pedidos de um dia específico
 * ⚠️ CUIDADO: Use apenas em desenvolvimento!
 * 
 * @param date - Data para resetar (padrão: hoje)
 */
export async function resetOrderCounter(date: Date = new Date()): Promise<void> {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const counterDocId = `orders-${date.getFullYear()}-${month}-${day}`;

    const counterRef = doc(db, 'counters', counterDocId);
    await setDoc(counterRef, {
        value: 0,
        date: `${date.getFullYear()}-${month}-${day}`,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    console.log(`Contador resetado para ${counterDocId}`);
}
