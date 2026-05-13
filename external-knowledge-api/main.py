import os
from flask import Flask, request, jsonify
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base, Document, QAPair, PendingQuestion, SystemInstruction
from datetime import datetime
from dotenv import load_dotenv
import logging

load_dotenv()

# Thiết lập logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Tạo bảng
Base.metadata.create_all(bind=engine)

app = Flask(__name__)

# API keys đọc từ env, dùng | làm separator giữa nhiều keys
_raw_keys = os.getenv("KB_ALLOWED_KEYS", "sk-aiva-external-knowledge-secret-key|dataset-KhssPvf20q75fvA40Bw3nOLr")
ALLOWED_KEYS = [k.strip() for k in _raw_keys.split("|") if k.strip()]


def get_db():
    return SessionLocal()


def verify_auth():
    auth_header = request.headers.get("Authorization")
    logger.info(f"Received Authorization header: {auth_header}")
    if not auth_header or not auth_header.startswith("Bearer "):
        return False
    token = auth_header.split(" ")[1]
    return token in ALLOWED_KEYS


# ──────────────────────────────────────────────
# POST /retrieval — Tìm kiếm trong KB (Dify gọi endpoint này)
# ──────────────────────────────────────────────
@app.route("/retrieval", methods=["POST"])
def retrieval():
    if not verify_auth():
        return jsonify({"error_code": 1001, "error_msg": "Authorization failed"}), 401

    data = request.json or {}
    knowledge_id = data.get("knowledge_id")
    query = data.get("query", "")
    retrieval_setting = data.get("retrieval_setting", {})
    top_k = retrieval_setting.get("top_k", 5)
    score_threshold = retrieval_setting.get("score_threshold", 0.0)

    logger.info(f"Retrieval | KB: {knowledge_id} | Query: {query}")

    db = get_db()
    all_results = []
    query_lower = query.lower()

    try:
        # 0. Tìm SystemInstruction (Tính cách/Văn phong)
        # Luôn luôn trả về để Dify đưa vào ngữ cảnh
        instructions = db.query(SystemInstruction)
        if knowledge_id:
            # Lấy instruction cụ thể cho knowledge_id hoặc general
            instructions = instructions.filter(SystemInstruction.knowledge_id.in_([knowledge_id, "general"]))
        else:
            instructions = instructions.filter(SystemInstruction.knowledge_id == "general")
        
        # Chỉ lấy cái mới nhất cho mỗi knowledge_id
        latest_instruction = instructions.order_by(SystemInstruction.created_at.desc()).first()
        if latest_instruction:
            all_results.append({
                "content": f"[QUAN TRỌNG - HƯỚNG DẪN HỆ THỐNG VỀ TÍNH CÁCH/VĂN PHONG]:\n{latest_instruction.instruction}",
                "score": 1.0,  # Điểm tuyệt đối để luôn được Dify sử dụng
                "title": "System Instruction",
                "metadata": {"source": "trainer_instruction", "type": "instruction", "id": latest_instruction.id}
            })

        # 1. Tìm trong Documents
        docs = db.query(Document)
        if knowledge_id:
            docs = docs.filter(Document.knowledge_id == knowledge_id)
        docs = docs.all()

        for doc in docs:
            content_lower = doc.content.lower()
            # Simple keyword scoring
            score = 0.0
            query_words = query_lower.split()
            if query_words:
                matched = sum(1 for w in query_words if w in content_lower)
                score = matched / len(query_words)
            # Boost nếu title match
            if query_lower in doc.title.lower():
                score = max(score, 0.9)
            # Minimum score nếu cùng knowledge_id
            if knowledge_id and score < 0.3:
                score = 0.3

            if score >= score_threshold:
                all_results.append({
                    "content": doc.content[:2000],  # Giới hạn content length
                    "score": round(score, 2),
                    "title": doc.title,
                    "metadata": {"source": doc.source, "type": "document", "id": doc.id}
                })

        # 2. Tìm trong QA Pairs
        qas = db.query(QAPair)
        if knowledge_id:
            qas = qas.filter(QAPair.knowledge_id == knowledge_id)
        qas = qas.all()

        for qa in qas:
            question_lower = qa.question.lower()
            # Score based on question similarity
            score = 0.0
            query_words = query_lower.split()
            if query_words:
                matched = sum(1 for w in query_words if w in question_lower)
                score = matched / len(query_words)
            if query_lower in question_lower or question_lower in query_lower:
                score = max(score, 0.85)

            if score >= score_threshold:
                all_results.append({
                    "content": f"Hỏi: {qa.question}\nTrả lời: {qa.answer}",
                    "score": round(score, 2),
                    "title": f"Q&A #{qa.id}",
                    "metadata": {"source": "trainer_qa", "type": "qa", "id": qa.id}
                })

        # Sắp xếp theo score giảm dần, lấy top_k
        all_results.sort(key=lambda x: x["score"], reverse=True)
        final_records = all_results[:top_k]

        # Fallback nếu không có kết quả
        if not final_records:
            final_records = [{
                "content": f"Chưa có dữ liệu cho câu hỏi này trong nhóm kiến thức '{knowledge_id}'.",
                "score": 0.1,
                "title": "no_data",
                "metadata": {"source": "fallback"}
            }]

        return jsonify({"records": final_records})

    finally:
        db.close()


# ──────────────────────────────────────────────
# POST /documents — Trainer upload tài liệu mới
# ──────────────────────────────────────────────
@app.route("/documents", methods=["POST"])
def add_document():
    if not verify_auth():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    knowledge_id = data.get("knowledge_id")
    title = data.get("title")
    content = data.get("content")
    trainer_name = data.get("trainer_name", "unknown")

    if not knowledge_id or not title or not content:
        return jsonify({"error": "Missing required fields: knowledge_id, title, content"}), 400

    db = get_db()
    try:
        doc = Document(
            knowledge_id=knowledge_id,
            title=title,
            content=content,
            source="trainer_upload",
            trainer_name=trainer_name
        )
        db.add(doc)
        db.commit()
        logger.info(f"Document added | KB: {knowledge_id} | Title: {title} | By: {trainer_name}")
        return jsonify({"status": "success", "document_id": doc.id})
    finally:
        db.close()


# ──────────────────────────────────────────────
# POST /qa — Trainer trả lời câu hỏi
# ──────────────────────────────────────────────
@app.route("/qa", methods=["POST"])
def add_qa():
    if not verify_auth():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    knowledge_id = data.get("knowledge_id")
    question = data.get("question")
    answer = data.get("answer")
    trainer_name = data.get("trainer_name", "unknown")

    if not question or not answer:
        return jsonify({"error": "Missing required fields: question, answer"}), 400

    db = get_db()
    try:
        qa = QAPair(
            knowledge_id=knowledge_id or "general",
            question=question,
            answer=answer,
            trainer_name=trainer_name
        )
        db.add(qa)
        db.commit()
        logger.info(f"QA added | KB: {knowledge_id} | Q: {question[:50]} | By: {trainer_name}")
        return jsonify({"status": "success", "qa_id": qa.id})
    finally:
        db.close()


# ──────────────────────────────────────────────
# POST /instructions — Trainer cập nhật tính cách/văn phong
# ──────────────────────────────────────────────
@app.route("/instructions", methods=["POST"])
def add_instruction():
    if not verify_auth():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    knowledge_id = data.get("knowledge_id", "general")
    instruction = data.get("instruction")
    trainer_name = data.get("trainer_name", "unknown")

    if not instruction:
        return jsonify({"error": "Missing required field: instruction"}), 400

    db = get_db()
    try:
        inst = SystemInstruction(
            knowledge_id=knowledge_id,
            instruction=instruction,
            trainer_name=trainer_name
        )
        db.add(inst)
        db.commit()
        logger.info(f"Instruction added | KB: {knowledge_id} | By: {trainer_name}")
        return jsonify({"status": "success", "instruction_id": inst.id})
    finally:
        db.close()


# ──────────────────────────────────────────────
# Pending Questions (AI không trả lời được)
# ──────────────────────────────────────────────
@app.route("/pending-questions", methods=["POST"])
def add_pending_question():
    if not verify_auth():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    question = data.get("question")
    knowledge_id = data.get("knowledge_id")
    user_id = data.get("user_id")

    if not question:
        return jsonify({"error": "Missing required field: question"}), 400

    db = get_db()
    try:
        pq = PendingQuestion(
            knowledge_id=knowledge_id,
            question=question,
            user_id=user_id,
            status="pending"
        )
        db.add(pq)
        db.commit()
        logger.info(f"Pending question added | KB: {knowledge_id} | Q: {question[:50]}")
        return jsonify({"status": "success", "question_id": pq.id})
    finally:
        db.close()


@app.route("/pending-questions", methods=["GET"])
def get_pending_questions():
    if not verify_auth():
        return jsonify({"error": "Unauthorized"}), 401

    knowledge_id = request.args.get("knowledge_id")
    db = get_db()
    try:
        query = db.query(PendingQuestion).filter(PendingQuestion.status == "pending")
        if knowledge_id:
            query = query.filter(PendingQuestion.knowledge_id == knowledge_id)
        questions = query.order_by(PendingQuestion.created_at.desc()).limit(20).all()

        return jsonify({"questions": [{
            "id": q.id,
            "question": q.question,
            "knowledge_id": q.knowledge_id,
            "user_id": q.user_id,
            "created_at": q.created_at.isoformat() if q.created_at else None
        } for q in questions]})
    finally:
        db.close()


@app.route("/pending-questions/<int:question_id>/answer", methods=["POST"])
def answer_pending_question(question_id):
    if not verify_auth():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    answer = data.get("answer")
    trainer_name = data.get("trainer_name", "unknown")

    if not answer:
        return jsonify({"error": "Missing required field: answer"}), 400

    db = get_db()
    try:
        pq = db.query(PendingQuestion).filter(PendingQuestion.id == question_id).first()
        if not pq:
            return jsonify({"error": "Question not found"}), 404

        # Cập nhật trạng thái
        pq.status = "answered"
        pq.answer = answer
        pq.trainer_name = trainer_name
        pq.answered_at = datetime.utcnow()

        # Đồng thời lưu vào QA Pairs để AI học
        qa = QAPair(
            knowledge_id=pq.knowledge_id or "general",
            question=pq.question,
            answer=answer,
            trainer_name=trainer_name
        )
        db.add(qa)
        db.commit()

        logger.info(f"Question #{question_id} answered by {trainer_name}")
        return jsonify({"status": "success", "qa_id": qa.id})
    finally:
        db.close()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
