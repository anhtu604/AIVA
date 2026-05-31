import os
import requests
import structlog
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
from dotenv import load_dotenv
from rapidfuzz import fuzz

from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base, Province, Counselor, CounselorArea, EscalationLog

# Create tables
Base.metadata.create_all(bind=engine)

# Load env
load_dotenv()
API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise RuntimeError("API_KEY environment variable is required")
ADMIN_BOT_TOKEN = os.getenv("ADMIN_BOT_TOKEN")
STAFF_BOT_TOKEN = os.getenv("STAFF_BOT_TOKEN")

# Setup Logger
structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)
logger = structlog.get_logger()

app = FastAPI(
    title="AIVA Escalation API",
    description="API chuyển tuyến ca tư vấn đến TVV theo khu vực",
    version="2.0.0"
)

# Auth
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def verify_api_key(api_key: str = Security(api_key_header)):
    if not api_key:
        raise HTTPException(status_code=403, detail="Could not validate credentials")
    
    # Strip common prefixes (like 'custom ', 'bearer ', 'token ')
    actual_key = api_key
    for prefix in ["custom ", "bearer ", "token "]:
        if actual_key.lower().startswith(prefix):
            actual_key = actual_key[len(prefix):].strip()
            
    if actual_key != API_KEY:
        raise HTTPException(status_code=403, detail="Could not validate credentials")
    return api_key

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Models
class EscalationRequest(BaseModel):
    user_name: str
    phone: str
    address: str
    customer_question: str = "Không chia sẻ"
    risk_behavior: str = "Không chia sẻ"
    risk_time: str = "Không chia sẻ"
    risk_population: str = "Không chia sẻ"
    pns_needed: str = "Không chia sẻ"
    service_history: str = "Không chia sẻ"
    current_symptoms: str = "Không chia sẻ"
    dify_conversation_id: str



# Helpers
def normalize(text: str) -> str:
    return text.lower().strip()

def find_province(address: str, db: Session) -> Optional[Province]:
    """Tìm tỉnh/thành phù hợp nhất dựa trên địa chỉ người dùng."""
    normalized_addr = normalize(address)
    provinces = db.query(Province).all()

    best_province = None
    highest_score = 0

    for p in provinces:
        score = fuzz.partial_ratio(normalize(p.name), normalized_addr)
        if normalize(p.name) in normalized_addr:
            score = max(score, 95)
        if score > highest_score:
            highest_score = score
            best_province = p

    return best_province if highest_score >= 60 else None

def find_best_counselor(address: str, counselors: List[Counselor]) -> Optional[Counselor]:
    """Trong một tỉnh, tìm TVV phụ trách khu vực khớp nhất."""
    if not counselors:
        return None

    normalized_addr = normalize(address)
    best = None
    highest_score = 0

    for c in counselors:
        for area in c.areas:
            norm_area = normalize(area.area_name)
            score = fuzz.partial_ratio(norm_area, normalized_addr)
            if norm_area in normalized_addr:
                score = max(score, 90)
            if score > highest_score:
                highest_score = score
                best = c

    # Nếu không match khu vực cụ thể, chọn TVV đầu tiên trong tỉnh
    return best if best else counselors[0]

def send_telegram_notification(counselor: Counselor, payload: EscalationRequest, province_name: str) -> bool:
    """Gửi thông báo ca mới cho TVV qua Staff Bot."""
    if not STAFF_BOT_TOKEN or not counselor.telegram_id:
        logger.warning("missing_telegram_config", counselor=counselor.name)
        return False

    url = f"https://api.telegram.org/bot{STAFF_BOT_TOKEN}/sendMessage"

    message = (
        f"🚨 <b>THÔNG BÁO CA TƯ VẤN MỚI</b> 🚨\n\n"
        f"🏛️ <b>Tỉnh:</b> {province_name}\n"
        f"👤 <b>Khách hàng:</b> {payload.user_name}\n"
        f"📞 <b>SĐT:</b> {payload.phone}\n"
        f"📍 <b>Địa chỉ:</b> {payload.address}\n\n"
        f"❓ <b>Câu hỏi khách hàng:</b> {payload.customer_question}\n"
        f"🔥 <b>Hành vi nguy cơ:</b> {payload.risk_behavior}\n"
        f"⏱️ <b>Thời gian nguy cơ:</b> {payload.risk_time}\n"
        f"👥 <b>Đối tượng nguy cơ:</b> {payload.risk_population}\n"
        f"🤝 <b>Nhu cầu PNS:</b> {payload.pns_needed}\n"
        f"📜 <b>Lịch sử dịch vụ:</b> {payload.service_history}\n"
        f"🩺 <b>Triệu chứng:</b> {payload.current_symptoms}\n\n"
        f"🆔 <i>Dify ID: {payload.dify_conversation_id}</i>"
    )


    try:
        resp = requests.post(url, json={
            "chat_id": counselor.telegram_id,
            "text": message,
            "parse_mode": "HTML"
        }, timeout=10)
        resp.raise_for_status()
        return True
    except Exception as e:
        logger.error("telegram_send_failed", error=str(e), counselor=counselor.name)
        return False

# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────
@app.post("/api/escalate", dependencies=[Depends(verify_api_key)])
def escalate_case(payload: EscalationRequest, db: Session = Depends(get_db)):
    logger.info("escalation_requested", user_name=payload.user_name, address=payload.address)

    # 1. Tìm tỉnh
    province = find_province(payload.address, db)
    if not province:
        logger.warning("no_province_matched", address=payload.address)
        raise HTTPException(status_code=404, detail="Không tìm được tỉnh/thành phù hợp với địa chỉ.")

    # 2. Tìm TVV đã kích hoạt trong tỉnh đó
    active_counselors = db.query(Counselor).filter(
        Counselor.province_id == province.id,
        Counselor.activated == True
    ).all()

    if not active_counselors:
        logger.warning("no_active_counselor", province=province.name)
        raise HTTPException(status_code=404, detail=f"Tỉnh {province.name} chưa có TVV nào kích hoạt.")

    # 3. Chọn TVV khớp khu vực nhất
    best = find_best_counselor(payload.address, active_counselors)

    # 4. Gửi thông báo Telegram
    success = send_telegram_notification(best, payload, province.name)

    # 5. Ghi nhận vào Database
    log_entry = EscalationLog(
        user_name=payload.user_name,
        phone=payload.phone,
        address=payload.address,
        customer_question=payload.customer_question,
        risk_behavior=payload.risk_behavior,
        risk_time=payload.risk_time,
        risk_population=payload.risk_population,
        pns_needed=payload.pns_needed,
        service_history=payload.service_history,
        current_symptoms=payload.current_symptoms,
        dify_conversation_id=payload.dify_conversation_id,
        province_name=province.name,
        counselor_id=best.id if best else None,
        counselor_name=best.name if best else "N/A",
        telegram_notified=success,
        status="contacted" if success else "new"
    )

    try:
        db.add(log_entry)
        db.commit()
    except Exception as e:
        logger.error("failed_to_save_log", error=str(e))
        db.rollback()

    logger.info("escalation_processed",
                province=province.name,
                counselor=best.name,
                telegram_success=success)

    return {
        "status": "success",
        "province": province.name,
        "counselor_name": best.name,
        "counselor_phone": best.phone,
        "telegram_notified": success
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
