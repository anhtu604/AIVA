import { notFound } from 'next/navigation';
import ChatArea from '@/features/workspace-switcher/ChatArea';
import { STAFF_MODULES } from '@/features/workspace-switcher/staffModules';

interface PageProps {
    params: Promise<{ module: string }>;
}

// ─── Welcome messages per module ─────────────────────────────────────────────
const WELCOME_MESSAGES: Record<string, string> = {
    'cbo':          'Xin chào! Tôi là AIVA Staff – module CBO. Tôi có thể hỗ trợ bạn về kịch bản tiếp cận cộng đồng, tư vấn ca, hoặc quy trình xử lý của CBO. Bạn cần hỗ trợ gì?',
    'vct':          'Xin chào! Tôi là AIVA Staff – module VCT. Tôi hỗ trợ quy trình tư vấn trước/sau xét nghiệm HIV và kết nối dịch vụ tiếp theo. Bạn cần tư vấn về vấn đề gì?',
    'surveillance': 'Xin chào! Tôi là AIVA Staff – module Giám sát dịch tễ. Tôi có thể hỗ trợ quy trình báo cáo ca bệnh, phân tích số liệu và nhắc lịch báo cáo. Bạn cần hỗ trợ gì?',
    'comms':        'Xin chào! Tôi là AIVA Staff – module Truyền thông. Tôi có thể soạn nội dung, gợi ý chiến dịch hoặc kiểm tra thông điệp truyền thông. Bạn muốn bắt đầu với nội dung gì?',
    'it-support':   'Xin chào! Tôi là AIVA Staff – module IT Support. Tôi sẵn sàng hỗ trợ xử lý sự cố kỹ thuật, hướng dẫn sử dụng hệ thống. Bạn đang gặp vấn đề gì?',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function StaffModulePage({ params }: PageProps) {
    const { module: moduleSlug } = await params;

    // Validate module tồn tại
    const moduleConfig = STAFF_MODULES.find((m) => m.slug === moduleSlug);
    if (!moduleConfig) {
        notFound();
    }

    return (
        <ChatArea
            moduleSlug={moduleSlug}
            moduleLabel={moduleConfig.label}
            moduleColor={moduleConfig.color}
            moduleBg={moduleConfig.bg}
            welcomeMessage={WELCOME_MESSAGES[moduleSlug]}
        />
    );
}

// ─── Static params for known modules ─────────────────────────────────────────
export function generateStaticParams() {
    return STAFF_MODULES.map((m) => ({ module: m.slug }));
}
