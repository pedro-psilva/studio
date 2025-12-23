import { storage } from '@/lib/firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface OrderFile {
    name: string;
    path: string;
    downloadUrl: string;
}

/**
 * Busca todos os arquivos de um pedido no Firebase Storage
 * @param userId - ID do usuário que fez o pedido
 * @param productIds - IDs dos produtos do pedido
 * @returns Lista de arquivos encontrados
 */
export async function getOrderFiles(
    userId: string,
    productIds: string[]
): Promise<OrderFile[]> {
    const files: OrderFile[] = [];

    for (const productId of productIds) {
        try {
            const folderPath = `cases-files/${userId}/${productId}`;
            const folderRef = ref(storage, folderPath);

            const result = await listAll(folderRef);

            for (const itemRef of result.items) {
                const downloadUrl = await getDownloadURL(itemRef);
                files.push({
                    name: itemRef.name,
                    path: itemRef.fullPath,
                    downloadUrl,
                });
            }
        } catch (error) {
            console.warn(`Erro ao buscar arquivos para produto ${productId}:`, error);
            // Continua para outros produtos mesmo se um falhar
        }
    }

    return files;
}

/**
 * Baixa múltiplos arquivos como ZIP
 * @param files - Lista de arquivos para download
 * @param zipName - Nome do arquivo ZIP (sem extensão)
 */
export async function downloadFilesAsZip(
    files: OrderFile[],
    zipName: string = 'arquivos-pedido'
): Promise<void> {
    if (files.length === 0) {
        throw new Error('Nenhum arquivo para download');
    }

    const zip = new JSZip();

    // Download de todos os arquivos e adiciona ao ZIP
    const downloadPromises = files.map(async (file) => {
        try {
            const response = await fetch(file.downloadUrl);
            const blob = await response.blob();
            zip.file(file.name, blob);
        } catch (error) {
            console.error(`Erro ao baixar arquivo ${file.name}:`, error);
        }
    });

    await Promise.all(downloadPromises);

    // Gera o arquivo ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Faz o download
    saveAs(zipBlob, `${zipName}.zip`);
}

/**
 * Busca e baixa todos os arquivos de um pedido como ZIP
 * @param userId - ID do usuário
 * @param productIds - IDs dos produtos do pedido
 * @param orderId - ID do pedido (para nome do arquivo)
 */
export async function downloadOrderFilesAsZip(
    userId: string,
    productIds: string[],
    orderId: string
): Promise<void> {
    const files = await getOrderFiles(userId, productIds);

    if (files.length === 0) {
        throw new Error('Nenhum arquivo encontrado para este pedido');
    }

    await downloadFilesAsZip(files, `pedido-${orderId}`);
}
