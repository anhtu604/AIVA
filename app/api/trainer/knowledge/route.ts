import { NextResponse } from 'next/server';
import { ingestDocument } from '@/services/retrieval/ingest';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, content, targetRole } = body;

        // Bắt lỗi payload đầu vào
        if (!title || !content || !targetRole) {
            return NextResponse.json(
                { error: 'Thiếu thông tin bắt buộc (title, content, hoặc targetRole).' },
                { status: 400 }
            );
        }

        // Gọi hàm ingestDocument ở service
        const result = await ingestDocument(title, content, targetRole);

        // Trả về kết quả thành công
        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error('API Error in ingest route:', error);
        
        // Trả về lỗi server
        return NextResponse.json(
            { error: error.message || 'Có lỗi xảy ra khi nạp tri thức vào hệ thống.' },
            { status: 500 }
        );
    }
}
