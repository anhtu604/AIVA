"""
AIVA Admin Bot (@aiva_adminbot)
Bot quản trị hệ thống TVV theo phân cấp: System Admin → Admin Tỉnh → TVV

Lệnh cho Admin Tỉnh (sau khi kích hoạt):
  /themtvv <tên> | <sđt> | <khu vực 1, khu vực 2, ...>
  /dstvv
  /xoatvv <mã TVV>

Lệnh cho TVV:
  /kichhoat <mã>

Lệnh chung:
  /start, /help
"""

import os
import sys
import asyncio
import secrets
import string
import logging
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

from database import (SessionLocal, engine, Base, Province, Counselor, CounselorArea,
                      SuperAdmin, Trainer, TrainerCategory, Staff, StaffCategory, VALID_CATEGORIES)

# Tạo bảng nếu chưa có
Base.metadata.create_all(bind=engine)

load_dotenv()
ADMIN_BOT_TOKEN = os.getenv("ADMIN_BOT_TOKEN")

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)


def categories_list_text():
    """Tạo chuỗi hiển thị danh sách categories hợp lệ."""
    return "\n".join(f"  • {k} — {v}" for k, v in VALID_CATEGORIES.items())


def get_db():
    db = SessionLocal()
    try:
        return db
    except Exception:
        db.close()
        raise


def generate_tvv_code():
    chars = string.ascii_uppercase + string.digits
    return "TVV-" + "".join(secrets.choice(chars) for _ in range(6))


# ──────────────────────────────────────────────
# /start
# ──────────────────────────────────────────────
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Chào bạn! Đây là Bot Quản trị AIVA.\n\n"
        "🔑 Nếu bạn là Admin Tỉnh, hãy gửi:\n"
        "  /kichhoat <mã Admin>\n\n"
        "💡 Tư vấn viên (TVV) vui lòng kích hoạt tại AIVA Staff Bot (@aiva_staff_bot).\n\n"
        "Gõ /help để xem tất cả lệnh."
    )


# ──────────────────────────────────────────────
# /help
# ──────────────────────────────────────────────
async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📖 DANH SÁCH LỆNH:\n\n"
        "🔑 /kichhoat <mã> — Kích hoạt tài khoản\n\n"
        "👑 SUPER ADMIN:\n"
        "  /dstinhs — Xem trạng thái 34 tỉnh\n"
        "  /themma <loại> — Tạo mã (TR/STAFF)\n"
        "  /danhsach <loại> — Xem mã (ADM/TR/TVV/STAFF)\n"
        "  /themquyen <mã> <quyền> — Thêm quyền\n"
        "  /xoaquyen <mã> <quyền> — Xóa quyền\n"
        "  /xoama <mã> — Xóa mã kích hoạt\n"
        "  /resetma <mã> — Reset mã đã kích hoạt\n"
        "  /dsquyen — Xem danh sách quyền hợp lệ\n\n"
        "👤 ADMIN TỈNH:\n"
        "  /themtvv <tên> | <sđt> | <khu vực 1, khu vực 2>\n"
        "  /themstaff <quyền 1, quyền 2> — Tạo mã Staff\n"
        "  /dstvv — Xem danh sách TVV\n"
        "  /xoatvv <mã TVV> — Xóa TVV\n\n"
        "ℹ️ /thongtin — Xem thông tin tài khoản\n"
    )


# ──────────────────────────────────────────────
# /kichhoat <code>
# ──────────────────────────────────────────────
async def kichhoat(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args:
        await update.message.reply_text("⚠️ Vui lòng nhập mã kích hoạt.\nVí dụ: /kichhoat ADM-ABC123")
        return

    code = context.args[0].strip().upper()
    telegram_id = str(update.effective_user.id)
    user_name = update.effective_user.full_name
    db = get_db()

    try:
        # Check if it's a Super Admin activation code
        if code.startswith("SA-"):
            sa = db.query(SuperAdmin).filter(SuperAdmin.activation_code == code).first()
            if not sa:
                await update.message.reply_text("❌ Mã kích hoạt không hợp lệ.")
                return
            if sa.activated:
                await update.message.reply_text(f"⚠️ Mã Super Admin đã được kích hoạt bởi: {sa.name}.")
                return

            sa.telegram_id = telegram_id
            sa.name = user_name
            sa.activated = True
            db.commit()

            await update.message.reply_text(
                f"✅ Kích hoạt SUPER ADMIN thành công!\n\n"
                f"👑 Admin: {user_name}\n\n"
                f"Bạn có quyền xem toàn bộ hệ thống.\n"
                f"Gõ /dstinhs để xem trạng thái 34 tỉnh."
            )

        # Check if it's an Admin activation code
        elif code.startswith("ADM-"):
            province = db.query(Province).filter(Province.admin_activation_code == code).first()
            if not province:
                await update.message.reply_text("❌ Mã kích hoạt không hợp lệ.")
                return
            if province.admin_activated:
                await update.message.reply_text(
                    f"⚠️ Tỉnh {province.name} đã được kích hoạt bởi: {province.admin_name}."
                )
                return

            province.admin_telegram_id = telegram_id
            province.admin_name = user_name
            province.admin_activated = True
            db.commit()

            await update.message.reply_text(
                f"✅ Kích hoạt thành công!\n\n"
                f"👤 Admin: {user_name}\n"
                f"🏛️ Tỉnh: {province.name}\n\n"
                f"Bạn có thể bắt đầu thêm TVV bằng lệnh:\n"
                f"/themtvv <tên> | <sđt> | <khu vực 1, khu vực 2>"
            )

        # Check if it's a TVV activation code
        elif code.startswith("TVV-"):
            await update.message.reply_text("❌ Mã TVV phải được kích hoạt tại AIVA Staff Bot (@aiva_staff_bot).")
            return
        else:
            await update.message.reply_text("❌ Mã không hợp lệ. Mã phải bắt đầu bằng SA- hoặc ADM-.")
    finally:
        db.close()


# ──────────────────────────────────────────────
# /themtvv <tên> | <sđt> | <khu vực 1, khu vực 2>
# ──────────────────────────────────────────────
async def themtvv(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    db = get_db()

    try:
        # Kiểm tra quyền Admin
        province = db.query(Province).filter(
            Province.admin_telegram_id == telegram_id,
            Province.admin_activated == True
        ).first()

        if not province:
            await update.message.reply_text("❌ Bạn chưa kích hoạt hoặc không phải Admin Tỉnh.")
            return

        # Parse input
        raw_text = " ".join(context.args) if context.args else ""
        parts = [p.strip() for p in raw_text.split("|")]

        if len(parts) < 3:
            await update.message.reply_text(
                "⚠️ Sai cú pháp. Vui lòng nhập theo mẫu:\n"
                "/themtvv Nguyễn Văn A | 0901234567 | Quận 1, Quận 3, Quận 5"
            )
            return

        name = parts[0]
        phone = parts[1]
        areas_raw = [a.strip() for a in parts[2].split(",") if a.strip()]

        if not areas_raw:
            await update.message.reply_text("⚠️ Vui lòng nhập ít nhất 1 khu vực.")
            return

        activation_code = generate_tvv_code()

        counselor = Counselor(
            province_id=province.id,
            name=name,
            phone=phone,
            activation_code=activation_code,
            activated=False
        )
        db.add(counselor)
        db.flush()

        for area in areas_raw:
            db.add(CounselorArea(counselor_id=counselor.id, area_name=area.lower()))

        db.commit()

        await update.message.reply_text(
            f"✅ Đã thêm TVV thành công!\n\n"
            f"👤 Tên: {name}\n"
            f"📞 SĐT: {phone}\n"
            f"📍 Khu vực: {', '.join(areas_raw)}\n"
            f"🏛️ Tỉnh: {province.name}\n\n"
            f"🔑 Mã kích hoạt: <code>{activation_code}</code>\n\n"
            f"👉 Gửi mã này cho TVV. TVV mở bot này và gửi:\n"
            f"/kichhoat {activation_code}",
            parse_mode="HTML"
        )
    finally:
        db.close()


# ──────────────────────────────────────────────
# /themstaff <quyền 1, quyền 2>
# ──────────────────────────────────────────────
async def themstaff(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    db = get_db()

    try:
        # Kiểm tra quyền Admin Tỉnh
        province = db.query(Province).filter(
            Province.admin_telegram_id == telegram_id,
            Province.admin_activated == True
        ).first()

        if not province:
            await update.message.reply_text("❌ Bạn chưa kích hoạt hoặc không phải Admin Tỉnh.")
            return

        if not context.args:
            await update.message.reply_text(
                "⚠️ Cú pháp: /themstaff <quyền 1, quyền 2>\n"
                "Ví dụ: /themstaff management, communications\n\n"
                "Gõ /dsquyen để xem danh sách quyền hợp lệ."
            )
            return

        raw = " ".join(context.args)
        categories = [c.strip().lower() for c in raw.split(",") if c.strip()]

        # Validate categories
        invalid = [c for c in categories if c not in VALID_CATEGORIES]
        if invalid:
            await update.message.reply_text(
                f"❌ Quyền không hợp lệ: {', '.join(invalid)}\n\n"
                f"Quyền hợp lệ:\n{categories_list_text()}"
            )
            return

        code = "STF-" + "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        staff = Staff(activation_code=code, activated=False)
        db.add(staff)
        db.flush()

        for cat in categories:
            db.add(StaffCategory(staff_id=staff.id, knowledge_id=cat))

        db.commit()
        cat_str = ", ".join(f"{c} ({VALID_CATEGORIES[c]})" for c in categories) if categories else "(chưa gán)"

        await update.message.reply_text(
            f"✅ Đã tạo mã Staff thành công!\n\n"
            f"🔑 Mã: <code>{code}</code>\n"
            f"📚 Quyền: {cat_str}\n\n"
            f"👉 Gửi mã này cho Staff. Staff mở @aiva_staff_bot và gửi:\n"
            f"/kichhoat {code}",
            parse_mode="HTML"
        )
    finally:
        db.close()



# ──────────────────────────────────────────────
# /dstvv
# ──────────────────────────────────────────────
async def dstvv(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    db = get_db()

    try:
        province = db.query(Province).filter(
            Province.admin_telegram_id == telegram_id,
            Province.admin_activated == True
        ).first()

        if not province:
            await update.message.reply_text("❌ Bạn chưa kích hoạt hoặc không phải Admin Tỉnh.")
            return

        counselors = db.query(Counselor).filter(Counselor.province_id == province.id).all()

        if not counselors:
            await update.message.reply_text(f"📋 Tỉnh {province.name}: Chưa có TVV nào.")
            return

        lines = [f"📋 DANH SÁCH TVV — {province.name}\n"]
        for c in counselors:
            status = "✅" if c.activated else "⏳"
            areas_str = ", ".join([a.area_name for a in c.areas])
            lines.append(
                f"{status} [{c.activation_code}] {c.name}\n"
                f"   📞 {c.phone} | 📍 {areas_str}"
            )

        await update.message.reply_text("\n".join(lines))
    finally:
        db.close()


# ──────────────────────────────────────────────
# /xoatvv <mã TVV>
# ──────────────────────────────────────────────
async def xoatvv(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    db = get_db()

    try:
        province = db.query(Province).filter(
            Province.admin_telegram_id == telegram_id,
            Province.admin_activated == True
        ).first()

        if not province:
            await update.message.reply_text("❌ Bạn chưa kích hoạt hoặc không phải Admin Tỉnh.")
            return

        if not context.args:
            await update.message.reply_text("⚠️ Vui lòng nhập mã TVV.\nVí dụ: /xoatvv TVV-ABC123")
            return

        code = context.args[0].strip().upper()
        counselor = db.query(Counselor).filter(
            Counselor.activation_code == code,
            Counselor.province_id == province.id
        ).first()

        if not counselor:
            await update.message.reply_text("❌ Không tìm thấy TVV với mã này trong tỉnh của bạn.")
            return

        name = counselor.name
        db.delete(counselor)
        db.commit()

        await update.message.reply_text(f"✅ Đã xóa TVV: {name} ({code})")
    finally:
        db.close()


# ──────────────────────────────────────────────
# /thongtin
# ──────────────────────────────────────────────
async def thongtin(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    db = get_db()

    try:
        # Check if super admin
        sa = db.query(SuperAdmin).filter(
            SuperAdmin.telegram_id == telegram_id,
            SuperAdmin.activated == True
        ).first()

        if sa:
            total_provinces = db.query(Province).count()
            activated_provinces = db.query(Province).filter(Province.admin_activated == True).count()
            total_tvv = db.query(Counselor).count()
            active_tvv = db.query(Counselor).filter(Counselor.activated == True).count()
            await update.message.reply_text(
                f"ℹ️ THÔNG TIN TÀI KHOẢN\n\n"
                f"👑 Vai trò: Super Admin\n"
                f"🏛️ Tỉnh: {activated_provinces}/{total_provinces} đã kích hoạt\n"
                f"👥 TVV: {active_tvv}/{total_tvv} đã kích hoạt"
            )
            return

        # Check if admin
        province = db.query(Province).filter(
            Province.admin_telegram_id == telegram_id,
            Province.admin_activated == True
        ).first()

        if province:
            count = db.query(Counselor).filter(Counselor.province_id == province.id).count()
            active = db.query(Counselor).filter(
                Counselor.province_id == province.id,
                Counselor.activated == True
            ).count()
            await update.message.reply_text(
                f"ℹ️ THÔNG TIN TÀI KHOẢN\n\n"
                f"👤 Vai trò: Admin Tỉnh\n"
                f"🏛️ Tỉnh: {province.name}\n"
                f"👥 Tổng TVV: {count} (đã kích hoạt: {active})"
            )
            return

        # Check if TVV
        counselor = db.query(Counselor).filter(
            Counselor.telegram_id == telegram_id,
            Counselor.activated == True
        ).first()

        if counselor:
            prov = db.query(Province).filter(Province.id == counselor.province_id).first()
            areas_str = ", ".join([a.area_name for a in counselor.areas])
            await update.message.reply_text(
                f"ℹ️ THÔNG TIN TÀI KHOẢN\n\n"
                f"👤 Vai trò: Tư vấn viên\n"
                f"📛 Tên: {counselor.name}\n"
                f"📞 SĐT: {counselor.phone}\n"
                f"🏛️ Tỉnh: {prov.name if prov else 'N/A'}\n"
                f"📍 Khu vực: {areas_str}"
            )
            return

        await update.message.reply_text("⚠️ Bạn chưa kích hoạt tài khoản. Gửi /kichhoat <mã> để bắt đầu.")
    finally:
        db.close()


# ──────────────────────────────────────────────
# /dstinhs (Super Admin only)
# ──────────────────────────────────────────────
async def dstinhs(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    db = get_db()

    try:
        sa = db.query(SuperAdmin).filter(
            SuperAdmin.telegram_id == telegram_id,
            SuperAdmin.activated == True
        ).first()

        if not sa:
            await update.message.reply_text("❌ Chỉ Super Admin mới có quyền xem.")
            return

        provinces = db.query(Province).order_by(Province.name).all()
        lines = ["📋 TRẠNG THÁI 34 TỈNH/THÀNH\n"]

        for p in provinces:
            status = "✅" if p.admin_activated else "⏳"
            tvv_count = db.query(Counselor).filter(Counselor.province_id == p.id).count()
            tvv_active = db.query(Counselor).filter(
                Counselor.province_id == p.id,
                Counselor.activated == True
            ).count()
            admin_info = f" ({p.admin_name})" if p.admin_name else ""
            lines.append(
                f"{status} {p.name}{admin_info} — TVV: {tvv_active}/{tvv_count}"
            )

        await update.message.reply_text("\n".join(lines))
    finally:
        db.close()


# ──────────────────────────────────────────────
# /themma <loại> [tham số] (Super Admin only)
# Tạo mã kích hoạt cho: ADM, TVV, TR, STAFF
# ──────────────────────────────────────────────
async def themma(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    db = get_db()

    try:
        sa = db.query(SuperAdmin).filter(
            SuperAdmin.telegram_id == telegram_id,
            SuperAdmin.activated == True
        ).first()

        if not sa:
            await update.message.reply_text("❌ Chỉ Super Admin mới có quyền tạo mã.")
            return

        if not context.args:
            await update.message.reply_text(
                "⚠️ Cú pháp:\n"
                "/themma TR <quyền 1, quyền 2>\n"
                "/themma STAFF <quyền 1, quyền 2>\n\n"
                "Ví dụ:\n"
                "/themma TR care, cbo, testing\n"
                "/themma STAFF management, communications\n\n"
                "Gõ /dsquyen để xem danh sách quyền hợp lệ."
            )
            return

        role_type = context.args[0].strip().upper()

        if role_type == "TR":
            raw = " ".join(context.args[1:]) if len(context.args) > 1 else ""
            categories = [c.strip().lower() for c in raw.split(",") if c.strip()]

            # Validate categories
            invalid = [c for c in categories if c not in VALID_CATEGORIES]
            if invalid:
                await update.message.reply_text(
                    f"❌ Quyền không hợp lệ: {', '.join(invalid)}\n\n"
                    f"Quyền hợp lệ:\n{categories_list_text()}"
                )
                return

            code = generate_tvv_code().replace("TVV-", "TR-")
            trainer = Trainer(activation_code=code, activated=False)
            db.add(trainer)
            db.flush()

            for cat in categories:
                db.add(TrainerCategory(trainer_id=trainer.id, knowledge_id=cat))

            db.commit()
            cat_str = ", ".join(f"{c} ({VALID_CATEGORIES[c]})" for c in categories) if categories else "(chưa gán)"

            await update.message.reply_text(
                f"✅ Đã tạo mã Trainer!\n\n"
                f"🔑 Mã: <code>{code}</code>\n"
                f"📚 Quyền: {cat_str}\n\n"
                f"Gửi mã này cho Trainer → /kichhoat {code} trên @aiva_trainer_bot",
                parse_mode="HTML"
            )

        elif role_type == "STAFF":
            raw = " ".join(context.args[1:]) if len(context.args) > 1 else ""
            categories = [c.strip().lower() for c in raw.split(",") if c.strip()]

            # Validate categories
            invalid = [c for c in categories if c not in VALID_CATEGORIES]
            if invalid:
                await update.message.reply_text(
                    f"❌ Quyền không hợp lệ: {', '.join(invalid)}\n\n"
                    f"Quyền hợp lệ:\n{categories_list_text()}"
                )
                return

            code = "STF-" + "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
            staff = Staff(activation_code=code, activated=False)
            db.add(staff)
            db.flush()

            for cat in categories:
                db.add(StaffCategory(staff_id=staff.id, knowledge_id=cat))

            db.commit()
            cat_str = ", ".join(f"{c} ({VALID_CATEGORIES[c]})" for c in categories) if categories else "(chưa gán)"

            await update.message.reply_text(
                f"✅ Đã tạo mã Staff!\n\n"
                f"🔑 Mã: <code>{code}</code>\n"
                f"📚 Quyền: {cat_str}",
                parse_mode="HTML"
            )

        else:
            await update.message.reply_text("❌ Loại không hợp lệ. Chọn: TR hoặc STAFF")

    finally:
        db.close()


# ──────────────────────────────────────────────
# /dsquyen — Xem danh sách quyền (categories) hợp lệ
# ──────────────────────────────────────────────
async def dsquyen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lines = ["📋 DANH SÁCH QUYỀN HỢP LỆ:\n"]
    for k, v in VALID_CATEGORIES.items():
        lines.append(f"  • <code>{k}</code> — {v}")
    lines.append("\n💡 Dùng: /themma TR care, cbo")
    lines.append("💡 Dùng: /themquyen TR-XXXXXX testing")
    await update.message.reply_text("\n".join(lines), parse_mode="HTML")


# ──────────────────────────────────────────────
# /themquyen <mã> <quyền 1, quyền 2> (Super Admin only)
# ──────────────────────────────────────────────
async def themquyen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    db = get_db()

    try:
        sa = db.query(SuperAdmin).filter(
            SuperAdmin.telegram_id == telegram_id,
            SuperAdmin.activated == True
        ).first()

        if not sa:
            await update.message.reply_text("❌ Chỉ Super Admin mới có quyền.")
            return

        if len(context.args) < 2:
            await update.message.reply_text(
                "⚠️ Cú pháp: /themquyen <mã> <quyền 1, quyền 2>\n"
                "Ví dụ: /themquyen TR-ABC123 care, cbo\n\n"
                "Gõ /dsquyen để xem danh sách quyền."
            )
            return

        code = context.args[0].strip().upper()
        raw = " ".join(context.args[1:])
        new_cats = [c.strip().lower() for c in raw.split(",") if c.strip()]

        # Validate
        invalid = [c for c in new_cats if c not in VALID_CATEGORIES]
        if invalid:
            await update.message.reply_text(
                f"❌ Quyền không hợp lệ: {', '.join(invalid)}\n\n"
                f"Gõ /dsquyen để xem danh sách."
            )
            return

        added = []
        skipped = []

        if code.startswith("TR-"):
            obj = db.query(Trainer).filter(Trainer.activation_code == code).first()
            if not obj:
                await update.message.reply_text(f"❌ Không tìm thấy mã: {code}")
                return
            existing = {c.knowledge_id for c in obj.categories}
            for cat in new_cats:
                if cat in existing:
                    skipped.append(cat)
                else:
                    db.add(TrainerCategory(trainer_id=obj.id, knowledge_id=cat))
                    added.append(cat)
            name = obj.name or code

        elif code.startswith("STF-"):
            obj = db.query(Staff).filter(Staff.activation_code == code).first()
            if not obj:
                await update.message.reply_text(f"❌ Không tìm thấy mã: {code}")
                return
            existing = {c.knowledge_id for c in obj.categories}
            for cat in new_cats:
                if cat in existing:
                    skipped.append(cat)
                else:
                    db.add(StaffCategory(staff_id=obj.id, knowledge_id=cat))
                    added.append(cat)
            name = obj.name or code

        else:
            await update.message.reply_text("❌ Chỉ hỗ trợ mã TR- hoặc STF-.")
            return

        db.commit()
        msg = f"✅ Cập nhật quyền cho {name} ({code}):\n"
        if added:
            msg += f"\n➕ Đã thêm: {', '.join(added)}"
        if skipped:
            msg += f"\n⏭️ Đã có sẵn: {', '.join(skipped)}"
        await update.message.reply_text(msg)

    finally:
        db.close()


# ──────────────────────────────────────────────
# /xoaquyen <mã> <quyền> (Super Admin only)
# ──────────────────────────────────────────────
async def xoaquyen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    db = get_db()

    try:
        sa = db.query(SuperAdmin).filter(
            SuperAdmin.telegram_id == telegram_id,
            SuperAdmin.activated == True
        ).first()

        if not sa:
            await update.message.reply_text("❌ Chỉ Super Admin mới có quyền.")
            return

        if len(context.args) < 2:
            await update.message.reply_text(
                "⚠️ Cú pháp: /xoaquyen <mã> <quyền>\n"
                "Ví dụ: /xoaquyen TR-ABC123 cbo"
            )
            return

        code = context.args[0].strip().upper()
        cats_to_remove = [c.strip().lower() for c in " ".join(context.args[1:]).split(",") if c.strip()]
        removed = []

        if code.startswith("TR-"):
            obj = db.query(Trainer).filter(Trainer.activation_code == code).first()
            if not obj:
                await update.message.reply_text(f"❌ Không tìm thấy mã: {code}")
                return
            for cat_name in cats_to_remove:
                cat_obj = db.query(TrainerCategory).filter(
                    TrainerCategory.trainer_id == obj.id,
                    TrainerCategory.knowledge_id == cat_name
                ).first()
                if cat_obj:
                    db.delete(cat_obj)
                    removed.append(cat_name)
            name = obj.name or code

        elif code.startswith("STF-"):
            obj = db.query(Staff).filter(Staff.activation_code == code).first()
            if not obj:
                await update.message.reply_text(f"❌ Không tìm thấy mã: {code}")
                return
            for cat_name in cats_to_remove:
                cat_obj = db.query(StaffCategory).filter(
                    StaffCategory.staff_id == obj.id,
                    StaffCategory.knowledge_id == cat_name
                ).first()
                if cat_obj:
                    db.delete(cat_obj)
                    removed.append(cat_name)
            name = obj.name or code

        else:
            await update.message.reply_text("❌ Chỉ hỗ trợ mã TR- hoặc STF-.")
            return

        db.commit()
        if removed:
            await update.message.reply_text(f"✅ Đã xóa quyền của {name}: {', '.join(removed)}")
        else:
            await update.message.reply_text(f"⚠️ Không tìm thấy quyền cần xóa.")

    finally:
        db.close()


# ──────────────────────────────────────────────
# /danhsach <loại> (Super Admin only)
# ──────────────────────────────────────────────
async def danhsach(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    db = get_db()

    try:
        sa = db.query(SuperAdmin).filter(
            SuperAdmin.telegram_id == telegram_id,
            SuperAdmin.activated == True
        ).first()

        if not sa:
            await update.message.reply_text("❌ Chỉ Super Admin mới có quyền xem.")
            return

        role_type = context.args[0].strip().upper() if context.args else ""

        if role_type == "TR":
            trainers = db.query(Trainer).all()
            if not trainers:
                await update.message.reply_text("📋 Chưa có Trainer nào.")
                return
            lines = ["📋 DANH SÁCH TRAINER:\n"]
            for t in trainers:
                status = "✅" if t.activated else "⏳"
                cats = ", ".join([c.knowledge_id for c in t.categories]) or "N/A"
                name = t.name or "(chưa kích hoạt)"
                lines.append(f"{status} [{t.activation_code}] {name} — {cats}")
            await update.message.reply_text("\n".join(lines))

        elif role_type == "TVV":
            counselors = db.query(Counselor).all()
            if not counselors:
                await update.message.reply_text("📋 Chưa có TVV nào.")
                return
            lines = ["📋 DANH SÁCH TVV (toàn quốc):\n"]
            for c in counselors:
                status = "✅" if c.activated else "⏳"
                prov = db.query(Province).filter(Province.id == c.province_id).first()
                prov_name = prov.name if prov else "N/A"
                areas = ", ".join([a.area_name for a in c.areas])
                lines.append(f"{status} [{c.activation_code}] {c.name} — {prov_name} — {areas}")
            await update.message.reply_text("\n".join(lines))

        elif role_type == "STAFF":
            staffs = db.query(Staff).all()
            if not staffs:
                await update.message.reply_text("📋 Chưa có Staff nào.")
                return
            lines = ["📋 DANH SÁCH STAFF:\n"]
            for s in staffs:
                status = "✅" if s.activated else "⏳"
                name = s.name or "(chưa kích hoạt)"
                cats = ", ".join([c.knowledge_id for c in s.categories]) or "N/A"
                lines.append(f"{status} [{s.activation_code}] {name} — {cats}")
            await update.message.reply_text("\n".join(lines))

        elif role_type == "ADM":
            provinces = db.query(Province).order_by(Province.name).all()
            lines = ["📋 DANH SÁCH MÃ ADMIN TỈNH:\n"]
            for p in provinces:
                status = "✅" if p.admin_activated else "⏳"
                name = p.admin_name or "(chưa kích hoạt)"
                lines.append(f"{status} [{p.admin_activation_code}] {p.name} — {name}")
            # Chia nhỏ nếu quá dài
            msg = "\n".join(lines)
            if len(msg) > 4000:
                mid = len(lines) // 2
                await update.message.reply_text("\n".join(lines[:mid]))
                await update.message.reply_text("\n".join(lines[mid:]))
            else:
                await update.message.reply_text(msg)

        else:
            await update.message.reply_text(
                "⚠️ Cú pháp: /danhsach <loại>\n"
                "Loại: ADM, TR, TVV, STAFF"
            )

    finally:
        db.close()


# ──────────────────────────────────────────────
# /xoama <mã> (Super Admin only)
# ──────────────────────────────────────────────
async def xoama(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    db = get_db()

    try:
        sa = db.query(SuperAdmin).filter(
            SuperAdmin.telegram_id == telegram_id,
            SuperAdmin.activated == True
        ).first()

        if not sa:
            await update.message.reply_text("❌ Chỉ Super Admin mới có quyền xóa.")
            return

        if not context.args:
            await update.message.reply_text("⚠️ Vui lòng nhập mã.\nVí dụ: /xoama TR-ABC123")
            return

        code = context.args[0].strip().upper()
        deleted = False
        name = ""

        if code.startswith("TR-"):
            obj = db.query(Trainer).filter(Trainer.activation_code == code).first()
            if obj:
                name = obj.name or code
                db.delete(obj)
                deleted = True

        elif code.startswith("TVV-"):
            obj = db.query(Counselor).filter(Counselor.activation_code == code).first()
            if obj:
                name = obj.name or code
                db.delete(obj)
                deleted = True

        elif code.startswith("STF-"):
            obj = db.query(Staff).filter(Staff.activation_code == code).first()
            if obj:
                name = obj.name or code
                db.delete(obj)
                deleted = True

        else:
            await update.message.reply_text("❌ Chỉ hỗ trợ xóa mã TR-, TVV-, STF-. Mã ADM dùng /resetma.")
            return

        if deleted:
            db.commit()
            await update.message.reply_text(f"✅ Đã xóa: {name} ({code})")
        else:
            await update.message.reply_text(f"❌ Không tìm thấy mã: {code}")

    finally:
        db.close()


# ──────────────────────────────────────────────
# /resetma <mã> (Super Admin only)
# Reset mã đã kích hoạt → cho phép người khác kích hoạt lại
# ──────────────────────────────────────────────
async def resetma(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    db = get_db()

    try:
        sa = db.query(SuperAdmin).filter(
            SuperAdmin.telegram_id == telegram_id,
            SuperAdmin.activated == True
        ).first()

        if not sa:
            await update.message.reply_text("❌ Chỉ Super Admin mới có quyền reset.")
            return

        if not context.args:
            await update.message.reply_text("⚠️ Vui lòng nhập mã.\nVí dụ: /resetma ADM-ABC123")
            return

        code = context.args[0].strip().upper()
        reset_done = False
        info = ""

        if code.startswith("ADM-"):
            prov = db.query(Province).filter(Province.admin_activation_code == code).first()
            if prov:
                info = f"{prov.name} (admin: {prov.admin_name})"
                prov.admin_telegram_id = None
                prov.admin_name = None
                prov.admin_activated = False
                reset_done = True

        elif code.startswith("TR-"):
            obj = db.query(Trainer).filter(Trainer.activation_code == code).first()
            if obj:
                info = obj.name or code
                obj.telegram_id = None
                obj.name = None
                obj.activated = False
                reset_done = True

        elif code.startswith("TVV-"):
            obj = db.query(Counselor).filter(Counselor.activation_code == code).first()
            if obj:
                info = obj.name or code
                obj.telegram_id = None
                obj.activated = False
                reset_done = True

        elif code.startswith("STF-"):
            obj = db.query(Staff).filter(Staff.activation_code == code).first()
            if obj:
                info = obj.name or code
                obj.telegram_id = None
                obj.name = None
                obj.activated = False
                reset_done = True

        else:
            await update.message.reply_text("❌ Mã không hợp lệ.")
            return

        if reset_done:
            db.commit()
            await update.message.reply_text(f"✅ Đã reset mã {code}\n🔄 {info} → có thể kích hoạt lại.")
        else:
            await update.message.reply_text(f"❌ Không tìm thấy mã: {code}")

    finally:
        db.close()


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────
if __name__ == "__main__":
    if not ADMIN_BOT_TOKEN:
        logger.error("ADMIN_BOT_TOKEN chưa được thiết lập trong .env!")
        exit(1)

    logger.info("Khởi động AIVA Admin Bot...")

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    application = ApplicationBuilder().token(ADMIN_BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_cmd))
    application.add_handler(CommandHandler("kichhoat", kichhoat))
    application.add_handler(CommandHandler("themtvv", themtvv))
    application.add_handler(CommandHandler("themstaff", themstaff))
    application.add_handler(CommandHandler("dstvv", dstvv))
    application.add_handler(CommandHandler("xoatvv", xoatvv))
    application.add_handler(CommandHandler("thongtin", thongtin))
    application.add_handler(CommandHandler("dstinhs", dstinhs))
    application.add_handler(CommandHandler("themma", themma))
    application.add_handler(CommandHandler("danhsach", danhsach))
    application.add_handler(CommandHandler("dsquyen", dsquyen))
    application.add_handler(CommandHandler("themquyen", themquyen))
    application.add_handler(CommandHandler("xoaquyen", xoaquyen))
    application.add_handler(CommandHandler("xoama", xoama))
    application.add_handler(CommandHandler("resetma", resetma))

    application.run_polling()
