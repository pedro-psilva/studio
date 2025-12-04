import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

// Usamos runtime edge para aproveitar o ambiente Web (Request/formData)
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type deve ser multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const code = formData.get('code');

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 });
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Código do produto ausente' }, { status: 400 });
    }

    const safeCode = code.trim() || 'produto';
    const timestamp = Date.now();
    const originalName = (file as any).name || 'arquivo';

    const fileRef = ref(
      storage,
      `services-images/${safeCode}/${timestamp}-${originalName}`
    );

    const arrayBuffer = await (file as any).arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const snapshot = await uploadBytes(fileRef, buffer);
    const imageUrl = await getDownloadURL(snapshot.ref);

    return NextResponse.json({ url: imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Erro no upload de imagem', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload da imagem' },
      { status: 500 }
    );
  }
}
