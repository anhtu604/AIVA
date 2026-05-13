"""
Seed 34 tỉnh/thành phố theo Nghị quyết 202/2025/QH15 (có hiệu lực từ 12/6/2025).
Chạy 1 lần duy nhất: python seed_provinces.py
"""
import secrets
import string
from database import SessionLocal, engine, Base, Province

# Tạo bảng nếu chưa có
Base.metadata.create_all(bind=engine)

# 34 đơn vị hành chính cấp tỉnh theo Nghị quyết 202/2025/QH15
# 11 tỉnh/thành KHÔNG sắp xếp:
#   Cao Bằng, Điện Biên, Hà Tĩnh, Lai Châu, Lạng Sơn,
#   Nghệ An, Quảng Ninh, Thanh Hóa, Sơn La, TP Hà Nội, TP Huế
# 23 tỉnh/thành MỚI sau sắp xếp:
#   Tuyên Quang (+ Hà Giang), Lào Cai (+ Yên Bái),
#   Thái Nguyên (+ Bắc Kạn), Phú Thọ (+ Vĩnh Phúc + Hòa Bình),
#   Bắc Ninh (+ Bắc Giang), Hưng Yên (+ Thái Bình),
#   Hải Phòng (+ Hải Dương), Ninh Bình (+ Hà Nam + Nam Định),
#   Quảng Trị (+ Quảng Bình), Đà Nẵng (+ Quảng Nam),
#   Quảng Ngãi (+ Kon Tum), Gia Lai (+ Bình Định),
#   Khánh Hòa (+ Ninh Thuận), Lâm Đồng (+ Đắk Nông + Bình Thuận),
#   Đắk Lắk (+ Phú Yên), TP HCM (+ Bà Rịa-Vũng Tàu + Bình Dương),
#   Đồng Nai (+ Bình Phước), Tây Ninh (+ Long An),
#   Cần Thơ (+ Sóc Trăng + Hậu Giang),
#   Vĩnh Long (+ Bến Tre + Trà Vinh),
#   Đồng Tháp (+ Tiền Giang), Cà Mau (+ Bạc Liêu),
#   An Giang (+ Kiên Giang)

PROVINCES = [
    # 11 tỉnh/thành không sắp xếp
    "Cao Bằng",
    "Điện Biên",
    "Hà Tĩnh",
    "Lai Châu",
    "Lạng Sơn",
    "Nghệ An",
    "Quảng Ninh",
    "Sơn La",
    "Thanh Hóa",
    "TP Hà Nội",
    "TP Huế",
    # 23 tỉnh/thành mới sau sắp xếp
    "An Giang",
    "Bắc Ninh",
    "Cà Mau",
    "Cần Thơ",
    "Đà Nẵng",
    "Đắk Lắk",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hải Phòng",
    "Hưng Yên",
    "Khánh Hòa",
    "Lâm Đồng",
    "Lào Cai",
    "Ninh Bình",
    "Phú Thọ",
    "Quảng Ngãi",
    "Quảng Trị",
    "Tây Ninh",
    "TP Hồ Chí Minh",
    "Thái Nguyên",
    "Tuyên Quang",
    "Vĩnh Long",
]


def generate_code():
    chars = string.ascii_uppercase + string.digits
    return "ADM-" + "".join(secrets.choice(chars) for _ in range(6))


def seed():
    db = SessionLocal()

    if db.query(Province).count() > 0:
        print("Database da co du lieu tinh. Bo qua seed.")
        db.close()
        return

    print("=" * 60)
    print("  MA KICH HOAT CHO ADMIN 34 TINH/THANH")
    print("  (Theo Nghi quyet 202/2025/QH15 - hieu luc 12/6/2025)")
    print("=" * 60)

    for name in PROVINCES:
        code = generate_code()
        province = Province(name=name, admin_activation_code=code)
        db.add(province)
        print(f"  {name:<25} -> {code}")

    db.commit()
    db.close()

    print("=" * 60)
    print(f"  Da tao {len(PROVINCES)} tinh/thanh thanh cong.")
    print("=" * 60)


if __name__ == "__main__":
    seed()
