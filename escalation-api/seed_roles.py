"""
Tạo mã kích hoạt cho Super Admin và Trainers.
Chạy: python seed_roles.py
"""
import secrets
import string
from database import SessionLocal, engine, Base, SuperAdmin, Trainer

Base.metadata.create_all(bind=engine)


def generate_code(prefix):
    chars = string.ascii_uppercase + string.digits
    return prefix + "".join(secrets.choice(chars) for _ in range(6))


def seed():
    db = SessionLocal()

    # ── Super Admin ──
    if db.query(SuperAdmin).count() == 0:
        code = generate_code("SA-")
        db.add(SuperAdmin(activation_code=code))
        db.commit()
        print(f"  🔑 MÃ SUPER ADMIN: {code}")
    else:
        sa = db.query(SuperAdmin).first()
        print(f"  🔑 Super Admin đã tồn tại: {sa.activation_code} (kích hoạt: {sa.activated})")

    # ── Trainers (tạo 10 mã) ──
    existing = db.query(Trainer).count()
    if existing == 0:
        print("\n  📚 MÃ TRAINER:")
        for i in range(10):
            code = generate_code("TR-")
            db.add(Trainer(activation_code=code))
            print(f"    {i+1:>2}. {code}")
        db.commit()
    else:
        print(f"\n  📚 Đã có {existing} mã Trainer:")
        for t in db.query(Trainer).all():
            status = "✅" if t.activated else "⏳"
            name = t.name or "(chưa kích hoạt)"
            print(f"    {status} {t.activation_code} — {name}")

    db.close()


if __name__ == "__main__":
    print("=" * 50)
    print("  TẠO MÃ KÍCH HOẠT — SUPER ADMIN & TRAINERS")
    print("=" * 50)
    seed()
    print("=" * 50)
