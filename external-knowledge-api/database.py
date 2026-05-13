from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./knowledge.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Document(Base):
    """Tài liệu đã chuyển đổi sang Markdown và lưu vào KB"""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    knowledge_id = Column(String, index=True)
    title = Column(String)
    content = Column(Text)
    source = Column(String, default="trainer_upload")
    trainer_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class QAPair(Base):
    """Cặp Câu hỏi - Trả lời do Trainer cung cấp"""
    __tablename__ = "qa_pairs"

    id = Column(Integer, primary_key=True, index=True)
    knowledge_id = Column(String, index=True)
    question = Column(Text)
    answer = Column(Text)
    trainer_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PendingQuestion(Base):
    """Câu hỏi AI không trả lời được, chờ Trainer trả lời"""
    __tablename__ = "pending_questions"

    id = Column(Integer, primary_key=True, index=True)
    knowledge_id = Column(String, index=True, nullable=True)
    question = Column(Text)
    user_id = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, answered
    answer = Column(Text, nullable=True)
    trainer_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    answered_at = Column(DateTime, nullable=True)


class SystemInstruction(Base):
    """Quy tắc về tính cách/văn phong chung cho AI"""
    __tablename__ = "system_instructions"

    id = Column(Integer, primary_key=True, index=True)
    knowledge_id = Column(String, index=True, default="general")
    instruction = Column(Text)
    trainer_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
