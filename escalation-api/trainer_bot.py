"""
AIVA Trainer Bot (@aiva_trainer_bot)
Bot huấn luyện AI cho Trainers — 2 chức năng chính:
  1. Upload tài liệu → markitdown → Knowledge Base
  2. Trả lời câu hỏi AI chưa biết → lưu Q&A vào KB

Lệnh:
  /start, /help
  /kichhoat <mã TR-XXXXXX>
  /cauhoi — Xem câu hỏi đang chờ trả lời
  Gửi file (PDF/DOCX/PPTX...) → chuyển sang markdown → lưu vào KB
  Gửi tin nhắn text → tra cứu Knowledge Base
"""

import os
import sys
import asyncio
import logging
import tempfile
import requests
from markitdown import MarkItDown
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

from database import SessionLocal, engine, Base, Trainer, TrainerCategory

Base.metadata.create_all(bind=engine)

load_dotenv()
TRAINER_BOT_TOKEN = os.getenv("TRAINER_BOT_TOKEN")
EXTERNAL_KB_URL = os.getenv("EXTERNAL_KB_URL", "http://host.docker.internal:8000")
EXTERNAL_KB_API_KEY = os.getenv("EXTERNAL_KB_API_KEY", "sk-aiva-external-knowledge-secret-key")

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

md_converter = MarkItDown()

# Lưu trạng thái trainer đang trả lời câu hỏi nào
# Key: telegram_id, Value: question_id
answering_state = {}


def get_db():
    db = SessionLocal()
    try:
        return db
    except Exception:
        db.close()
        raise


def get_trainer(telegram_id: str):
    db = get_db()
    try:
        t = db.query(Trainer).filter(
            Trainer.telegram_id == telegram_id,
            Trainer.activated == True
        ).first()
        if t:
            categories = [c.knowledge_id for c in t.categories]
            return {"name": t.name, "categories": categories}
        return None
    finally:
        db.close()


def kb_headers():
    return {
        "Authorization": f"Bearer {EXTERNAL_KB_API_KEY}",
        "Content-Type": "application/json"
    }


# ──────────────────────────────────────────────
# /start
# ──────────────────────────────────────────────
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Chào bạn! Đây là AIVA Trainer Bot 📚\n\n"
        "Bot giúp bạn huấn luyện AI bằng 2 cách:\n\n"
        "📄 Gửi file (PDF, DOCX, PPTX...) → AI sẽ học từ tài liệu\n"
        "❓ /cauhoi → Xem và trả lời câu hỏi AI chưa biết\n"
        "🔍 Gửi tin nhắn text → Tra cứu Knowledge Base\n\n"
        "🔑 Bắt đầu: /kichhoat <mã TR-XXXXXX>"
    )


# ──────────────────────────────────────────────
# /help
# ──────────────────────────────────────────────
async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📖 HƯỚNG DẪN SỬ DỤNG:\n\n"
        "🔑 /kichhoat <mã> — Kích hoạt tài khoản Trainer\n"
        "📄 Gửi file → Upload tài liệu vào Knowledge Base\n"
        "❓ /cauhoi — Xem câu hỏi AI chưa trả lời được\n"
        "💬 Gửi text → Tra cứu Knowledge Base\n"
        "ℹ️ /thongtin — Xem thông tin tài khoản\n"
        "🚫 /huy — Hủy trạng thái đang trả lời câu hỏi"
    )


# ──────────────────────────────────────────────
# /kichhoat <code>
# ──────────────────────────────────────────────
async def kichhoat(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args:
        await update.message.reply_text("⚠️ Vui lòng nhập mã kích hoạt.\nVí dụ: /kichhoat TR-ABC123")
        return

    code = context.args[0].strip().upper()
    telegram_id = str(update.effective_user.id)
    user_name = update.effective_user.full_name
    db = get_db()

    try:
        if not code.startswith("TR-"):
            await update.message.reply_text("❌ Mã Trainer phải bắt đầu bằng TR-.")
            return

        trainer = db.query(Trainer).filter(Trainer.activation_code == code).first()
        if not trainer:
            await update.message.reply_text("❌ Mã kích hoạt không hợp lệ.")
            return
        if trainer.activated:
            await update.message.reply_text(f"⚠️ Mã này đã được kích hoạt bởi: {trainer.name}.")
            return

        trainer.telegram_id = telegram_id
        trainer.name = user_name
        trainer.activated = True
        db.commit()

        categories = [c.knowledge_id for c in trainer.categories]
        cat_str = ", ".join(categories) if categories else "(chưa gán)"

        await update.message.reply_text(
            f"✅ Kích hoạt Trainer thành công!\n\n"
            f"👤 Trainer: {user_name}\n"
            f"📚 Chủ đề phụ trách: {cat_str}\n\n"
            f"📄 Gửi file tài liệu để AI học\n"
            f"❓ Gõ /cauhoi để xem câu hỏi cần trả lời"
        )
    finally:
        db.close()


# ──────────────────────────────────────────────
# /thongtin
# ──────────────────────────────────────────────
async def thongtin(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    trainer = get_trainer(telegram_id)

    if trainer:
        cat_str = ", ".join(trainer["categories"]) if trainer["categories"] else "(chưa gán)"
        await update.message.reply_text(
            f"ℹ️ THÔNG TIN TÀI KHOẢN\n\n"
            f"👤 Vai trò: Trainer\n"
            f"📛 Tên: {trainer['name']}\n"
            f"📚 Chủ đề: {cat_str}"
        )
    else:
        await update.message.reply_text("⚠️ Bạn chưa kích hoạt. Gửi /kichhoat <mã> để bắt đầu.")


# ──────────────────────────────────────────────
# /cauhoi — Xem câu hỏi pending
# ──────────────────────────────────────────────
async def cauhoi(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    trainer = get_trainer(telegram_id)

    if not trainer:
        await update.message.reply_text("⚠️ Bạn chưa kích hoạt Trainer.")
        return

    try:
        # Lấy câu hỏi theo categories của trainer
        params = {}
        if trainer["categories"]:
            # Lấy tất cả câu hỏi thuộc các categories của trainer
            params["knowledge_id"] = trainer["categories"][0]  # API chỉ lọc 1 ID

        resp = requests.get(
            f"{EXTERNAL_KB_URL}/pending-questions",
            params=params,
            headers=kb_headers(),
            timeout=10
        )
        resp.raise_for_status()
        questions = resp.json().get("questions", [])

        if not questions:
            await update.message.reply_text("✅ Không có câu hỏi nào đang chờ trả lời.")
            return

        lines = ["❓ CÂU HỎI ĐANG CHỜ TRẢ LỜI:\n"]
        for q in questions[:10]:
            kb = q.get("knowledge_id", "N/A")
            lines.append(
                f"🔹 #{q['id']} [{kb}]\n"
                f"   {q['question'][:100]}\n"
            )

        lines.append("\n💡 Để trả lời, gõ: /traloi <số ID>")
        await update.message.reply_text("\n".join(lines))

    except Exception as e:
        logger.error(f"Error fetching pending questions: {e}")
        await update.message.reply_text(f"❌ Lỗi: {e}")


# ──────────────────────────────────────────────
# /traloi <id> — Bắt đầu trả lời câu hỏi
# ──────────────────────────────────────────────
async def traloi(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    trainer = get_trainer(telegram_id)

    if not trainer:
        await update.message.reply_text("⚠️ Bạn chưa kích hoạt Trainer.")
        return

    if not context.args:
        await update.message.reply_text("⚠️ Vui lòng nhập ID câu hỏi.\nVí dụ: /traloi 5")
        return

    try:
        question_id = int(context.args[0])
    except ValueError:
        await update.message.reply_text("⚠️ ID phải là số.")
        return

    answering_state[telegram_id] = question_id
    await update.message.reply_text(
        f"📝 Bạn đang trả lời câu hỏi #{question_id}.\n"
        f"Gõ câu trả lời rồi gửi. Gõ /huy để hủy."
    )


# ──────────────────────────────────────────────
# /huy — Hủy trạng thái trả lời
# ──────────────────────────────────────────────
async def huy(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    if telegram_id in answering_state:
        del answering_state[telegram_id]
        await update.message.reply_text("✅ Đã hủy trạng thái trả lời.")
    else:
        await update.message.reply_text("ℹ️ Bạn không đang trả lời câu hỏi nào.")


# ──────────────────────────────────────────────
# Handle file uploads → markitdown → KB
# ──────────────────────────────────────────────
async def handle_document(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    trainer = get_trainer(telegram_id)

    if not trainer:
        await update.message.reply_text("⚠️ Bạn cần kích hoạt Trainer trước.")
        return

    document = update.message.document
    if not document:
        return

    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action="typing")
    await update.message.reply_text(f"📥 Đang xử lý file: {document.file_name}...")

    try:
        # Download file
        file = await context.bot.get_file(document.file_id)
        suffix = os.path.splitext(document.file_name)[1] if document.file_name else ".pdf"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            await file.download_to_drive(tmp.name)
            tmp_path = tmp.name

        # Convert to markdown
        result = md_converter.convert(tmp_path)
        md_content = result.text_content

        # Clean up temp file
        os.unlink(tmp_path)

        if not md_content or len(md_content.strip()) < 10:
            await update.message.reply_text("⚠️ Không trích xuất được nội dung từ file này.")
            return

        # Determine knowledge_id
        categories = trainer["categories"]
        if len(categories) == 1:
            knowledge_id = categories[0]
        elif len(categories) > 1:
            # Auto-classify: kiểm tra từ khóa trong nội dung
            knowledge_id = auto_classify(md_content, categories)
        else:
            knowledge_id = "general"

        # Upload to KB API
        resp = requests.post(
            f"{EXTERNAL_KB_URL}/documents",
            json={
                "knowledge_id": knowledge_id,
                "title": document.file_name,
                "content": md_content[:50000],  # Giới hạn 50K ký tự
                "trainer_name": trainer["name"]
            },
            headers=kb_headers(),
            timeout=30
        )
        resp.raise_for_status()

        doc_id = resp.json().get("document_id")
        preview = md_content[:200] + "..." if len(md_content) > 200 else md_content

        await update.message.reply_text(
            f"✅ Tài liệu đã được lưu vào Knowledge Base!\n\n"
            f"📄 File: {document.file_name}\n"
            f"📚 Nhóm: {knowledge_id}\n"
            f"🆔 ID: {doc_id}\n"
            f"📏 Độ dài: {len(md_content)} ký tự\n\n"
            f"📝 Xem trước:\n{preview}"
        )

    except Exception as e:
        logger.error(f"Error processing document: {e}")
        await update.message.reply_text(f"❌ Lỗi xử lý file: {e}")


def auto_classify(content: str, categories: list) -> str:
    """Tự động phân loại nội dung vào category phù hợp nhất."""
    content_lower = content.lower()

    KEYWORDS = {
        "care": ["chăm sóc", "hỗ trợ", "tư vấn", "bệnh nhân", "điều trị", "arv", "hiv", "aids"],
        "cbo": ["cộng đồng", "cbo", "tiếp cận", "nhóm đích", "tổ chức dựa vào cộng đồng"],
        "testing": ["sàng lọc", "xét nghiệm", "test nhanh", "lấy mẫu", "hiv test", "screening"],
        "confirmation_testing": ["khẳng định", "xét nghiệm khẳng định", "tuyến trên", "confirmation"],
        "opc": ["ngoại trú", "opc", "khám bệnh", "cấp phát thuốc", "phòng khám"],
        "me": ["theo dõi", "đánh giá", "m&e", "monitoring", "báo cáo", "evaluation"],
        "management": ["quản lý", "nhân sự", "tài chính", "dự án", "management"],
        "communications": ["truyền thông", "sự kiện", "truyền thông cộng đồng", "media"],
        "it": ["phần mềm", "hệ thống", "server", "database", "it", "technology"]
    }

    best_category = categories[0]  # Mặc định category đầu tiên
    best_score = 0

    for cat in categories:
        keywords = KEYWORDS.get(cat, [])
        score = sum(1 for kw in keywords if kw in content_lower)
        if score > best_score:
            best_score = score
            best_category = cat

    return best_category


import json
import re

# ──────────────────────────────────────────────
# Handle text messages — Conversational Training
# ──────────────────────────────────────────────
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    text = update.message.text

    if not text:
        return

    trainer = get_trainer(telegram_id)
    if not trainer:
        await update.message.reply_text("⚠️ Bạn cần kích hoạt Trainer trước.\nGửi: /kichhoat <mã TR-XXXXXX>")
        return

    # Nếu đang ở trạng thái trả lời câu hỏi cụ thể (/traloi <id>)
    if telegram_id in answering_state:
        question_id = answering_state[telegram_id]
        await submit_answer(update, question_id, text, trainer["name"])
        del answering_state[telegram_id]
        return

    # Conversational Training via 9router
    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action="typing")

    system_prompt = """Bạn là AIVA Bot, đang được Chuyên gia (Trainer) huấn luyện và chỉ dạy.
Chuyên gia sẽ chỉ ra những điểm bạn cần sửa, hoặc yêu cầu cập nhật kiến thức, tính cách, văn phong.

TÍNH CÁCH CỦA BẠN:
- Lịch sự, chuyên nghiệp, luôn sẵn sàng tiếp thu kiến thức mới.
- Khi Chuyên gia đưa ra một lời khuyên hoặc sự điều chỉnh (ví dụ: "Không gọi tổng đài vì tổng đài sai"), hãy LẬP TỨC hiểu đó là một bài học mới. KHÔNG ĐƯỢC HỎI LẠI "Bạn muốn tôi làm gì?". Hãy tự động tiếp thu và báo cáo "Đã ghi nhận!".

QUAN TRỌNG NHẤT:
Bất cứ khi nào Chuyên gia dạy một kiến thức mới, sửa lỗi, hoặc dặn dò cách xưng hô/tính cách, BẠN PHẢI XUẤT RA JSON ở cuối câu trả lời để hệ thống lưu lại bộ não cho bạn (bọc trong ```json và ```).

Định dạng JSON (CHỌN 1 TRONG 2):
1. Nếu Chuyên gia dạy KIẾN THỨC hoặc SỬA LỖI (vd: Không gọi tổng đài, Uống thuốc lúc 8h...):
```json
{
  "action": "update_knowledge",
  "question": "Câu hỏi tiêu biểu nhất mà người dùng có thể hỏi về vấn đề này (vd: Có nên gọi tổng đài không?)",
  "answer": "Câu trả lời đúng mà Chuyên gia vừa dạy (vd: Bạn không nên gọi tổng đài vì thông tin hiện tại không chính xác...)"
}
```

2. Nếu Chuyên gia dạy VĂN PHONG / TÍNH CÁCH (vd: Trả lời ngắn gọn, xưng hô Bác sĩ...):
```json
{
  "action": "update_personality",
  "instruction": "Chỉ thị chi tiết về tính cách mà Chuyên gia vừa dạy"
}
```

Chỉ khi nào Chuyên gia trò chuyện giao tiếp bình thường thì mới không xuất JSON."""

    try:
        llm_url = os.getenv("ROUTER_API_URL", "http://host.docker.internal:20129/v1/chat/completions")
        llm_payload = {
            "model": "aiva",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            "temperature": 0.2
        }
        
        # Gọi 9router (dùng API key tuỳ ý vì proxy có thể không check, hoặc pass dummy)
        resp = requests.post(
            llm_url, 
            json=llm_payload,
            headers={"Authorization": "Bearer dummy", "Content-Type": "application/json"},
            timeout=60
        )
        resp.raise_for_status()
        
        ai_msg = resp.json()["choices"][0]["message"]["content"]
        
        # Bóc tách JSON
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', ai_msg, re.DOTALL)
        reply_text = ai_msg
        
        if json_match:
            try:
                action_data = json.loads(json_match.group(1))
                action = action_data.get("action")
                
                # Loại bỏ khối JSON khỏi câu trả lời gửi cho user
                reply_text = ai_msg[:json_match.start()].strip()
                
                kb_id = trainer["categories"][0] if trainer["categories"] else "general"
                
                if action == "update_knowledge":
                    # Đẩy vào external-knowledge-api /qa
                    requests.post(
                        f"{EXTERNAL_KB_URL}/qa",
                        json={
                            "knowledge_id": kb_id,
                            "question": action_data.get("question", "N/A"),
                            "answer": action_data.get("answer", "N/A"),
                            "trainer_name": trainer["name"]
                        },
                        headers=kb_headers(),
                        timeout=10
                    )
                    reply_text += "\n\n✅ *Đã tự động lưu Q&A vào Knowledge Base!*"
                    
                elif action == "update_personality":
                    # Đẩy vào external-knowledge-api /instructions
                    requests.post(
                        f"{EXTERNAL_KB_URL}/instructions",
                        json={
                            "knowledge_id": kb_id,
                            "instruction": action_data.get("instruction", "N/A"),
                            "trainer_name": trainer["name"]
                        },
                        headers=kb_headers(),
                        timeout=10
                    )
                    reply_text += "\n\n✅ *Đã tự động cập nhật Văn phong/Tính cách!*"
                    
            except Exception as parse_err:
                logger.error(f"Error parsing/executing JSON from LLM: {parse_err}")
                reply_text += "\n\n⚠️ *(Có lỗi khi trích xuất lệnh tự động)*"
                
        try:
            await update.message.reply_markdown(reply_text)
        except Exception as e:
            logger.warning(f"Markdown parsing failed: {e}. Falling back to plain text.")
            await update.message.reply_text(reply_text)

    except Exception as e:
        logger.error(f"Error calling LLM or KB: {e}")
        await update.message.reply_text(f"❌ Lỗi: {e}")



async def submit_answer(update: Update, question_id: int, answer: str, trainer_name: str):
    """Gửi câu trả lời cho pending question."""
    try:
        resp = requests.post(
            f"{EXTERNAL_KB_URL}/pending-questions/{question_id}/answer",
            json={
                "answer": answer,
                "trainer_name": trainer_name
            },
            headers=kb_headers(),
            timeout=10
        )
        resp.raise_for_status()

        await update.message.reply_text(
            f"✅ Đã lưu câu trả lời cho câu hỏi #{question_id}!\n"
            f"AI sẽ sử dụng câu trả lời này cho các lần sau."
        )
    except Exception as e:
        logger.error(f"Error submitting answer: {e}")
        await update.message.reply_text(f"❌ Lỗi: {e}")


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────
if __name__ == "__main__":
    if not TRAINER_BOT_TOKEN:
        logger.error("TRAINER_BOT_TOKEN chưa được thiết lập trong .env!")
        exit(1)

    logger.info("Khởi động AIVA Trainer Bot...")

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    application = ApplicationBuilder().token(TRAINER_BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_cmd))
    application.add_handler(CommandHandler("kichhoat", kichhoat))
    application.add_handler(CommandHandler("thongtin", thongtin))
    application.add_handler(CommandHandler("cauhoi", cauhoi))
    application.add_handler(CommandHandler("traloi", traloi))
    application.add_handler(CommandHandler("huy", huy))
    application.add_handler(MessageHandler(filters.Document.ALL, handle_document))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    application.run_polling()
