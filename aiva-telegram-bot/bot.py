import os
import json
import logging
import requests
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

# Load environment variables from .env file
load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
DIFY_API_KEY = os.getenv("DIFY_API_KEY")
DIFY_API_BASE_URL = os.getenv("DIFY_API_BASE_URL", "http://localhost/v1").rstrip("/")
EXTERNAL_KNOWLEDGE_URL = os.getenv("EXTERNAL_KNOWLEDGE_URL", "http://host.docker.internal:8000")
EXTERNAL_KB_API_KEY = os.getenv("EXTERNAL_KB_API_KEY", "sk-aiva-external-knowledge-secret-key")

# Set up logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Dictionary to store conversation IDs for users
# Key: telegram_user_id (str), Value: dify_conversation_id (str)
user_conversations = {}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send a message when the command /start is issued."""
    user = update.effective_user
    await update.message.reply_html(
        rf"Xin chào {user.mention_html()}! Mình là bot trợ lý AIVA Care. Bạn cần mình giúp gì nào?"
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle incoming messages and forward them to Dify API."""
    user_id = str(update.effective_user.id)
    user_message = update.message.text
    
    if not user_message:
        return
        
    # Send "typing" action to Telegram to let user know bot is processing
    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action='typing')
    
    # Prepare Dify API request
    dify_url = f"{DIFY_API_BASE_URL}/chat-messages"
    headers = {
        "Authorization": f"Bearer {DIFY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "inputs": {},
        "query": user_message,
        "response_mode": "blocking",
        "user": f"telegram_{user_id}"
    }
    
    # If we already have an ongoing conversation with this user, attach the conversation_id
    if user_id in user_conversations:
        payload["conversation_id"] = user_conversations[user_id]
        
    try:
        response = requests.post(dify_url, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        data = response.json()
        
        # Extract the bot's reply from Dify
        answer = data.get("answer", "Xin lỗi, mình không có câu trả lời vào lúc này.")
        
        # Save the conversation ID for future messages to keep the context
        if "conversation_id" in data:
            user_conversations[user_id] = data["conversation_id"]
        
        # Detect khi AI không trả lời được → forward cho Trainer
        NO_ANSWER_PHRASES = [
            "xin lỗi, mình không có câu trả lời",
            "mình chưa có thông tin",
            "mình không chắc chắn",
            "mình cần hỏi thêm chuyên gia",
            "hiện tại mình chưa thể trả lời"
        ]
        answer_lower = answer.lower()
        is_unanswered = any(phrase in answer_lower for phrase in NO_ANSWER_PHRASES)
        
        if is_unanswered:
            try:
                requests.post(
                    EXTERNAL_KNOWLEDGE_URL + "/pending-questions",
                    json={
                        "question": user_message,
                        "knowledge_id": None,
                        "user_id": f"telegram_{user_id}"
                    },
                    headers={
                        "Authorization": f"Bearer {EXTERNAL_KB_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    timeout=5
                )
                logger.info(f"Forwarded unanswered question to trainer queue: {user_message[:50]}")
            except Exception as fwd_err:
                logger.warning(f"Failed to forward question: {fwd_err}")
            
        # Send the response back to Telegram
        await update.message.reply_text(answer)
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling Dify API: {e}")
        error_msg = f"Xin lỗi, đã xảy ra lỗi khi kết nối với máy chủ AI. Chi tiết: {e}"
        await update.message.reply_text(error_msg)

async def clear(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Command to clear conversation context"""
    user_id = str(update.effective_user.id)
    if user_id in user_conversations:
        del user_conversations[user_id]
        await update.message.reply_text("Đã xoá ngữ cảnh chat cũ. Chúng ta bắt đầu phiên mới nhé!")
    else:
        await update.message.reply_text("Bạn chưa có phiên chat nào đang hoạt động.")

if __name__ == '__main__':
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN is not set in .env file!")
        exit(1)
        
    if not DIFY_API_KEY:
        logger.error("DIFY_API_KEY is not set in .env file!")
        exit(1)
        
    logger.info("Khởi động AIVA Care Telegram Bot...")
    
    import asyncio
    import sys
    
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()

    # on different commands - answer in Telegram
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("clear", clear))

    # on non command i.e message - echo the message on Telegram
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    # Run the bot until the user presses Ctrl-C
    application.run_polling()
