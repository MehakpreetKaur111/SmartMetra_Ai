"""Seed roles + demo users. Safe to run multiple times."""
from app.database import SessionLocal, init_db
from app.models import Role, User
from app.security import hash_password

ROLES = [
    ("CONSUMER", "Consumer / citizen"),
    ("INDUSTRY", "Manufacturer / industry"),
    ("GOVERNMENT", "Government / authorized verifier"),
    ("ADMIN", "System administrator"),
]

DEMO_USERS = [
    ("consumer@smartmetra.dev", "Demo Consumer", "CONSUMER"),
    ("industry@smartmetra.dev", "Demo Industry", "INDUSTRY"),
    ("gov@smartmetra.dev", "Demo Verifier", "GOVERNMENT"),
]


def run() -> None:
    init_db()
    db = SessionLocal()
    try:
        for name, desc in ROLES:
            if not db.query(Role).filter(Role.name == name).first():
                db.add(Role(name=name))
        db.commit()

        for email, name, role_name in DEMO_USERS:
            if db.query(User).filter(User.email == email).first():
                continue
            role = db.query(Role).filter(Role.name == role_name).first()
            u = User(
                email=email,
                full_name=name,
                hashed_password=hash_password("secret123"),
            )
            u.roles.append(role)
            db.add(u)
        db.commit()
        print("[seed] roles and demo users ensured.")
        print("[seed] demo login: gov@smartmetra.dev / secret123")
    finally:
        db.close()


if __name__ == "__main__":
    run()