import { embedMany } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';

// Lazy-init admin client
let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
    if (!_supabase) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        _supabase = createClient(url, key);
    }
    return _supabase;
}

export async function ingestDocument(title: string, content: string, targetRole: string) {
    if (!title || !content || !targetRole) {
        throw new Error("Missing required fields (title, content, targetRole)");
    }

    // 1. Chia nhỏ content (chunking) thành các đoạn văn khoảng 500-1000 ký tự.
    const chunks = chunkText(content, 800);

    // 2. Lưu thông tin tài liệu vào bảng knowledge_documents và lấy ID
    const { data: document, error: docError } = await getSupabase()
        .from('knowledge_documents')
        .insert({
            title,
            content,
            target_role: targetRole,
            created_at: new Date().toISOString(),
        } as any)
        .select('id')
        .single();
    
    if (docError) {
        console.error("Error inserting document:", docError);
        throw new Error("Không thể lưu tài liệu: " + docError.message);
    }
    
    if (!document || !(document as any).id) {
        throw new Error("Lỗi không xác định khi lưu tài liệu (không có ID trả về).");
    }

    const documentId = (document as any).id;

    // 3. Sử dụng thư viện ai kết hợp với provider @ai-sdk/google để tạo mảng vector (embeddings)
    let embeddings: number[][] = [];
    try {
        const { embeddings: resultEmbeddings } = await embedMany({
            model: google.textEmbeddingModel('text-embedding-004'),
            values: chunks,
        });
        embeddings = resultEmbeddings;
    } catch (embedError: any) {
        console.error("Error creating embeddings:", embedError);
        
        // Rollback: Xóa document vừa tạo nếu có lỗi sinh vector
        await getSupabase().from('knowledge_documents').delete().eq('id', documentId);
        throw new Error("Lỗi trích xuất vector từ Google AI: " + (embedError.message || 'Unknown error'));
    }

    if (embeddings.length !== chunks.length) {
        // Rollback
        await getSupabase().from('knowledge_documents').delete().eq('id', documentId);
        throw new Error(`Đã có lỗi: số lượng vector sinh ra (${embeddings.length}) khác với số lượng chunk (${chunks.length})`);
    }

    // 4. Lưu vector vào bảng knowledge_embeddings
    const embeddingRecords = chunks.map((chunk, i) => ({
        document_id: documentId,
        content: chunk,
        embedding: embeddings[i],
    }));

    const { error: embedSaveError } = await getSupabase()
        .from('knowledge_embeddings')
        .insert(embeddingRecords as any);

    if (embedSaveError) {
        console.error("Error inserting embeddings:", embedSaveError);
        
        // Rollback document
        await getSupabase().from('knowledge_documents').delete().eq('id', documentId);
        throw new Error("Lỗi khi lưu vector vào cơ sở dữ liệu: " + embedSaveError.message);
    }

    return { 
        success: true, 
        documentId, 
        chunksCount: chunks.length 
    };
}

/**
 * Hàm hỗ trợ: Chia nhỏ văn bản thành các đoạn.
 * Ưu tiên chia theo đoạn văn (\n\n), không chia cắt ngang từ.
 */
function chunkText(text: string, maxChunkSize: number = 800): string[] {
    const chunks: string[] = [];
    // Tách theo đoạn văn
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    
    for (const p of paragraphs) {
        if (currentChunk.length + p.length > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = p;
        } else {
            currentChunk += (currentChunk ? '\n\n' : '') + p;
        }
    }
    
    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }
    
    // Fallback: nếu có đoạn văn quá dài (dài hơn ngưỡng max), hãy chia nhỏ tiếp.
    const finalChunks: string[] = [];
    for (const chunk of chunks) {
        // du di một chút (cộng 300) để không chặt quá vặt
        if (chunk.length <= maxChunkSize + 300) { 
            finalChunks.push(chunk);
        } else {
            // Chặt thô theo khoảng trắng
            let step = 0;
            while (step < chunk.length) {
                let end = step + maxChunkSize;
                if (end < chunk.length) {
                    const nextSpace = chunk.indexOf(' ', end);
                    const prevSpace = chunk.lastIndexOf(' ', end);
                    
                    // Tìm cách cắt đẹp nhất, ưu tiên cắt đúng sau khoảng trắng gần ngưỡng end
                    if (prevSpace > step && end - prevSpace < 150) {
                        end = prevSpace;
                    } else if (nextSpace !== -1 && nextSpace - end < 100) {
                        end = nextSpace;
                    }
                }
                finalChunks.push(chunk.slice(step, end).trim());
                step = end;
            }
        }
    }

    return finalChunks;
}
