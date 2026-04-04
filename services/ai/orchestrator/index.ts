import { streamText, generateText, type ModelMessage } from 'ai';
import { getAIProvider } from '../adapter';
import { systemPrompts } from '../prompts/systemPrompts';

export interface GenerateAIVoiceParams {
  role: 'PUBLIC_CARE' | 'STAFF_CBO' | 'TRAINER_QA';
  messages: ModelMessage[];
  contextData?: any;
  stream?: boolean; // Cờ để chọn trả về luồng (streaming) hay text tĩnh (blocking)
}

export async function generateAIVoice({ role, messages, contextData, stream = true }: GenerateAIVoiceParams) {
  const model = getAIProvider();
  
  // 1. Phân giải System Prompt theo role
  let systemPrompt = systemPrompts[role] || "Bạn là trợ lý AI.";
  
  // 2. Nhúng RAG (Dữ liệu Retrieval) vào nếu Trainer có cung cấp context từ thư viện
  if (contextData) {
    systemPrompt += `\n\n--- [DỮ LIỆU THAM KHẢO HỆ THỐNG CUNG CẤP] ---\n${JSON.stringify(contextData)}\n`;
  }

  // 3. Thực thi gọi LLM
  if (stream) {
    // Luồng giao diện Chat real-time
    const streamingResult = streamText({
      model,
      system: systemPrompt,
      messages,
      temperature: 0.3, // Mức sáng tạo thấp để bám sát thực tế y khoa
    });
    return streamingResult; // Trả về đối tượng StreamTextResult từ sdk
  } else {
    // Trả về luồng tĩnh (cho chức năng tóm tắt, xuất báo cáo)
    const staticResult = await generateText({
      model,
      system: systemPrompt,
      messages,
      temperature: 0.3,
    });
    return staticResult; // Trả về đối tượng GenerateTextResult
  }
}
