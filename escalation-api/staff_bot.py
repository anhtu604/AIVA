"""
AIVA Staff Bot
Dành riêng cho nhân viên Staff. Yêu cầu mã STF-XXXXXX để kích hoạt.
Kết nối với Dify Chatflow riêng của Staff.
"""

import os
import sys
import json
import asyncio
import logging
import requests
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

from database import SessionLocal, engine, Base, Staff, StaffCategory

Base.metadata.create_all(bind=engine)

load_dotenv()
STAFF_BOT_TOKEN = os.getenv("STAFF_BOT_TOKEN")
DIFY_API_KEY = os.getenv("STAFF_DIFY_API_KEY")
DIFY_API_BASE_URL = os.getenv("DIFY_API_BASE_URL", "http://localhost/v1").rstrip("/")

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Key: telegram_user_id, Value: dify_conversation_id
user_conversations = {}

def get_db():
    db = SessionLocal()
    try:
        return db
    except Exception:
        db.close()
        raise

def get_staff(telegram_id: str):
    db = get_db()
    try:
        s = db.query(Staff).filter(
            Staff.telegram_id == telegram_id,
            Staff.activated == True
        ).first()
        if s:
            categories = [c.knowledge_id for c in s.categories]
            return {"name": s.name, "categories": categories}
        return None
    finally:
        db.close()


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    await update.message.reply_html(
        rf"Xin chào {user.mention_html()}! Mình là AIVA Staff Bot. "
        rf"Vui lòng kích hoạt tài khoản bằng lệnh: /kichhoat STF-XXXXXX"
    )

async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📖 HƯỚNG DẪN SỬ DỤNG:\n\n"
        "🔑 /kichhoat <mã STF-...> — Kích hoạt tài khoản Staff\n"
        "ℹ️ /thongtin — Xem thông tin tài khoản\n"
        "💬 Nhắn tin bình thường để hỏi đáp với AI"
    )

async def kichhoat(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args:
        await update.message.reply_text("⚠️ Vui lòng nhập mã kích hoạt.\nVí dụ: /kichhoat STF-ABC123")
        return

    code = context.args[0].strip().upper()
    telegram_id = str(update.effective_user.id)
    user_name = update.effective_user.full_name
    db = get_db()

    try:
        if not code.startswith("STF-"):
            await update.message.reply_text("❌ Mã Staff phải bắt đầu bằng STF-.")
            return

        staff = db.query(Staff).filter(Staff.activation_code == code).first()
        if not staff:
            await update.message.reply_text("❌ Mã kích hoạt không hợp lệ.")
            return
        if staff.activated:
            await update.message.reply_text(f"⚠️ Mã này đã được kích hoạt bởi: {staff.name}.")
            return

        staff.telegram_id = telegram_id
        staff.name = user_name
        staff.activated = True
        db.commit()

        categories = [c.knowledge_id for c in staff.categories]
        cat_str = ", ".join(categories) if categories else "(chưa gán)"

        await update.message.reply_text(
            f"✅ Kích hoạt Staff thành công!\n\n"
            f"👤 Nhân viên: {user_name}\n"
            f"📚 Quyền tra cứu: {cat_str}\n\n"
            f"Bây giờ bạn có thể chat trực tiếp với AI!"
        )
    finally:
        db.close()

async def thongtin(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    staff = get_staff(telegram_id)

    if staff:
        cat_str = ", ".join(staff["categories"]) if staff["categories"] else "(chưa gán)"
        await update.message.reply_text(
            f"ℹ️ THÔNG TIN TÀI KHOẢN\n\n"
            f"👤 Vai trò: Staff\n"
            f"📛 Tên: {staff['name']}\n"
            f"📚 Quyền: {cat_str}"
        )
    else:
        await update.message.reply_text("⚠️ Bạn chưa kích hoạt. Gửi /kichhoat <mã> để bắt đầu.")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = str(update.effective_user.id)
    user_message = update.message.text

    if not user_message:
        return

    staff = get_staff(user_id)
    if not staff:
        await update.message.reply_text("⚠️ Bạn cần kích hoạt Staff trước.\nGửi: /kichhoat <mã STF-XXXXXX>")
        return

    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action='typing')

    # Dify Chatflow Request
    dify_url = f"{DIFY_API_BASE_URL}/chat-messages"
    headers = {
        "Authorization": f"Bearer {DIFY_API_KEY}",
        "Content-Type": "application/json"
    }

    # Pass the categories as an input string, just in case Chatflow uses it later for classification
    cat_str = ", ".join(staff["categories"]) if staff["categories"] else ""

    payload = {
        "inputs": {
            "staff_categories": cat_str,
            "staff_name": staff["name"]
        },
        "query": user_message,
        "response_mode": "blocking",
        "user": f"telegram_{user_id}"
    }

    if user_id in user_conversations:
        payload["conversation_id"] = user_conversations[user_id]

    try:
        response = requests.post(dify_url, json=payload, headers=headers, timeout=120)
        response.raise_for_status()
        data = response.json()

        answer = data.get("answer", "Xin lỗi, hiện tại mình không thể trả lời.")

        if "conversation_id" in data:
            user_conversations[user_id] = data["conversation_id"]

        # Chia nhỏ tin nhắn nếu dài hơn 4000 ký tự
        max_length = 4000
        for i in range(0, len(answer), max_length):
            await update.message.reply_text(answer[i:i+max_length])

    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling Dify API: {e}")
        try:
            error_data = response.json()
            err_msg = error_data.get('message', str(e))
        except Exception:
            err_msg = str(e)
        
        error_msg = f"Xin lỗi, đã xảy ra lỗi khi kết nối với máy chủ AI.\nChi tiết: {err_msg}"
        await update.message.reply_text(error_msg)


if __name__ == "__main__":
    if not STAFF_BOT_TOKEN or not DIFY_API_KEY:
        logger.error("STAFF_BOT_TOKEN hoặc STAFF_DIFY_API_KEY chưa được thiết lập!")
        exit(1)

    logger.info("Khởi động AIVA Staff Bot...")

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    application = ApplicationBuilder().token(STAFF_BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_cmd))
    application.add_handler(CommandHandler("kichhoat", kichhoat))
    application.add_handler(CommandHandler("thongtin", thongtin))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    application.run_polling()
