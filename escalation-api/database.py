from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./aiva_escalation.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Province(Base):
    """Tỉnh/Thành phố — mỗi tỉnh có 1 Admin quản lý"""
    __tablename__ = "provinces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    admin_activation_code = Column(String, unique=True)
    admin_telegram_id = Column(String, nullable=True)
    admin_name = Column(String, nullable=True)
    admin_activated = Column(Boolean, default=False)

    counselors = relationship("Counselor", back_populates="province", cascade="all, delete-orphan")


class Counselor(Base):
    """Tư vấn viên — thuộc về 1 tỉnh, phụ trách nhiều khu vực"""
    __tablename__ = "counselors"

    id = Column(Integer, primary_key=True, index=True)
    province_id = Column(Integer, ForeignKey("provinces.id"))
    name = Column(String, index=True)
    phone = Column(String)
    telegram_id = Column(String, nullable=True)
    activation_code = Column(String, unique=True)
    activated = Column(Boolean, default=False)

    province = relationship("Province", back_populates="counselors")
    areas = relationship("CounselorArea", back_populates="counselor", cascade="all, delete-orphan")


class CounselorArea(Base):
    """Khu vực (Quận/Huyện) mà TVV phụ trách"""
    __tablename__ = "counselor_areas"

    id = Column(Integer, primary_key=True, index=True)
    counselor_id = Column(Integer, ForeignKey("counselors.id"))
    area_name = Column(String, index=True)

    counselor = relationship("Counselor", back_populates="areas")


class SuperAdmin(Base):
    """Admin cao nhất — quản lý toàn bộ hệ thống"""
    __tablename__ = "superadmins"

    id = Column(Integer, primary_key=True, index=True)
    activation_code = Column(String, unique=True)
    telegram_id = Column(String, nullable=True)
    name = Column(String, nullable=True)
    activated = Column(Boolean, default=False)


class Trainer(Base):
    """Trainer — huấn luyện AI qua bot, phân loại theo chủ đề"""
    __tablename__ = "trainers"

    id = Column(Integer, primary_key=True, index=True)
    activation_code = Column(String, unique=True)
    telegram_id = Column(String, nullable=True)
    name = Column(String, nullable=True)
    activated = Column(Boolean, default=False)

    categories = relationship("TrainerCategory", back_populates="trainer", cascade="all, delete-orphan")


class TrainerCategory(Base):
    """Nhóm kiến thức mà Trainer phụ trách (care, cbo, screen_testing, ...)"""
    __tablename__ = "trainer_categories"

    id = Column(Integer, primary_key=True, index=True)
    trainer_id = Column(Integer, ForeignKey("trainers.id"))
    knowledge_id = Column(String, index=True)

    trainer = relationship("Trainer", back_populates="categories")


class Staff(Base):
    """Staff — nhân viên hệ thống, phân loại theo chủ đề"""
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    activation_code = Column(String, unique=True)
    telegram_id = Column(String, nullable=True)
    name = Column(String, nullable=True)
    role = Column(String, nullable=True)
    activated = Column(Boolean, default=False)

    categories = relationship("StaffCategory", back_populates="staff", cascade="all, delete-orphan")


class StaffCategory(Base):
    """Nhóm kiến thức mà Staff phụ trách"""
    __tablename__ = "staff_categories"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"))
    knowledge_id = Column(String, index=True)

    staff = relationship("Staff", back_populates="categories")


class EscalationLog(Base):
    """Lịch sử chuyển tuyến ca tư vấn từ Dify sang TVV (Thông tin chi tiết cho TVV)"""
    __tablename__ = "escalation_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String)
    phone = Column(String)
    address = Column(String)
    
    # Thông tin chuyên môn cho TVV
    customer_question = Column(String)      # Câu hỏi/Yêu cầu cụ thể của khách
    risk_behavior = Column(String)          # Hành vi nguy cơ
    risk_time = Column(String)              # Thời gian xảy ra hành vi nguy cơ
    risk_population = Column(String)        # Đối tượng nguy cơ (MSM, FSW...)
    pns_needed = Column(String)             # Nhu cầu hỗ trợ bạn tình/bạn chích
    service_history = Column(String)        # Lịch sử dịch vụ (Đã XN, PrEP...)
    current_symptoms = Column(String)       # Triệu chứng hiện tại (nếu có)
    
    dify_conversation_id = Column(String)
    province_name = Column(String)
    counselor_id = Column(Integer, ForeignKey("counselors.id"), nullable=True)
    counselor_name = Column(String)
    telegram_notified = Column(Boolean, default=False)
    status = Column(String, default="new")  # new/contacted/completed
    created_at = Column(DateTime, default=datetime.utcnow)




# 9 nhóm kiến thức AIVA hợp lệ
VALID_CATEGORIES = {
    "care": "AIVA Care",
    "cbo": "AIVA CBO",
    "testing": "AIVA Testing",
    "confirmation_testing": "AIVA Confirmation Testing",
    "opc": "AIVA OPC",
    "me": "AIVA M&E",
    "management": "AIVA Management",
    "communications": "AIVA Communications",
    "it": "AIVA IT Support",
}

