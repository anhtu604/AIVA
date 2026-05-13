import json
import os
from database import SessionLocal, engine, Base, Counselor, CounselorArea

# Make sure tables exist
Base.metadata.create_all(bind=engine)

def migrate():
    if not os.path.exists("counselors.json"):
        print("counselors.json not found. Nothing to migrate.")
        return

    with open("counselors.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    db = SessionLocal()
    
    # Check if DB already has data
    if db.query(Counselor).count() > 0:
        print("Database already contains data. Migration aborted to prevent duplication.")
        return

    for c_data in data:
        counselor = Counselor(
            name=c_data.get("name", ""),
            phone=c_data.get("phone", ""),
            telegram_id=c_data.get("telegram_id", "")
        )
        db.add(counselor)
        db.flush() # To get counselor.id
        
        for area in c_data.get("areas", []):
            db.add(CounselorArea(counselor_id=counselor.id, area_name=area))
            
    db.commit()
    db.close()
    print(f"Successfully migrated {len(data)} counselors from JSON to SQLite database.")

if __name__ == "__main__":
    migrate()
