"""
Seed a small set of standards.

IMPORTANT: these are DEMO seeds so the pipeline runs end-to-end.
Each row is marked is_demo=True and verification_status='VERIFICATION REQUIRED'.
Replace with real, verified BIS metadata before any judge-facing demo.
Run: python -m app.seed_standards
"""
from app.database import SessionLocal, init_db
from app.models import Standard
from app.services.faiss_store import ensure_index

DEMO_STANDARDS = [
    {
        "is_number": "IS 14543",
        "title": "Packaged drinking water (other than packaged natural mineral water)",
        "scope": "Requirements and test methods for packaged drinking water.",
        "category": "Food & Beverages",
        "department": "Food and Agriculture",
        "standard_type": "Product Specification",
        "status": "In force (verify current revision on BIS)",
        "source_url": "https://www.bis.gov.in/",
    },
    {
        "is_number": "IS 302",
        "title": "Safety of household and similar electrical appliances",
        "scope": "General safety requirements for electrical appliances including fans.",
        "category": "Electrical Appliances",
        "department": "Electrotechnical",
        "standard_type": "Safety Standard",
        "status": "In force (verify current revision on BIS)",
        "source_url": "https://www.bis.gov.in/",
    },
    {
        "is_number": "IS 15622",
        "title": "Ceramic tiles — specification",
        "scope": "Requirements for ceramic tiles used in floors and walls.",
        "category": "Building Materials",
        "department": "Civil Engineering",
        "standard_type": "Product Specification",
        "status": "In force (verify current revision on BIS)",
        "source_url": "https://www.bis.gov.in/",
    },
    {
        "is_number": "IS 4151",
        "title": "Protective helmets for motorcycle riders",
        "scope": "Requirements for motorcycle helmets.",
        "category": "Personal Protective Equipment",
        "department": "Production & General Engineering",
        "standard_type": "Product Specification",
        "status": "In force (verify current revision on BIS)",
        "source_url": "https://www.bis.gov.in/",
    },
    {
        "is_number": "IS 277",
        "title": "Galvanized steel sheets (plain and corrugated)",
        "scope": "Requirements for galvanized steel sheets.",
        "category": "Steel",
        "department": "Metallurgical Engineering",
        "standard_type": "Product Specification",
        "status": "In force (verify current revision on BIS)",
        "source_url": "https://www.bis.gov.in/",
    },
]


def run() -> None:
    init_db()
    db = SessionLocal()
    try:
        for s in DEMO_STANDARDS:
            if db.query(Standard).filter(Standard.is_number == s["is_number"]).first():
                continue
            db.add(Standard(
                **s,
                verification_status="VERIFICATION REQUIRED",
                is_demo=True,
            ))
        db.commit()
        ensure_index(db, force=True)
        print(f"[seed_standards] ensured {len(DEMO_STANDARDS)} demo standards + rebuilt FAISS index.")
    finally:
        db.close()


if __name__ == "__main__":
    run()