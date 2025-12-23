import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/middleware/adminAuth';

export async function POST(req: Request) {
    try {
        // Validar autenticação admin
        await requireAdmin(req);

        const body = await req.json();
        const { userIds } = body;

        if (!Array.isArray(userIds)) {
            return NextResponse.json(
                { error: 'userIds deve ser um array' },
                { status: 400 }
            );
        }

        // Buscar dados dos usuários
        const userNames: Record<string, string> = {};

        await Promise.all(
            userIds.map(async (uid: string) => {
                try {
                    const userDoc = await adminDb.collection('users').doc(uid).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        const name = userData?.nome || userData?.displayName || userData?.email || 'Cliente não identificado';
                        userNames[uid] = name;
                    } else {
                        userNames[uid] = 'Cliente não identificado';
                    }
                } catch (error) {
                    console.error(`Erro ao buscar usuário ${uid}:`, error);
                    userNames[uid] = 'Cliente não identificado';
                }
            })
        );

        return NextResponse.json({ userNames });
    } catch (error: any) {
        console.error('Erro ao buscar nomes de usuários:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao buscar nomes de usuários' },
            { status: 500 }
        );
    }
}
