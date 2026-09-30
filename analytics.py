from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product, Recommendation, Standard, User, Verification
from app.security import Role, require_roles

router = APIRouter()


@router.get("/overview")
def overview(
    db: Session = Depends(get_db),
    _=Depends(require_roles(Role.GOVERNMENT, Role.ADMIN, Role.INDUSTRY)),
):
    return {
        "products": db.query(func.count(Product.id)).scalar() or 0,
        "standards": db.query(func.count(Standard.id)).scalar() or 0,
        "recommendations": db.query(func.count(Recommendation.id)).scalar() or 0,
        "verifications": db.query(func.count(Verification.id)).scalar() or 0,
        "users": db.query(func.count(User.id)).scalar() or 0,
    }


@router.get("/top-standards")
def top_standards(
    db: Session = Depends(get_db),
    _=Depends(require_roles(Role.GOVERNMENT, Role.ADMIN)),
):
    rows = (
        db.query(Standard.is_number, Standard.title, func.count(Recommendation.id).label("hits"))
        .join(Recommendation, Recommendation.standard_id == Standard.id)
        .group_by(Standard.id)
        .order_by(func.count(Recommendation.id).desc())
        .limit(10)
        .all()
    )
    return [{"is_number": r[0], "title": r[1], "hits": r[2]} for r in rows]


@router.get("/decisions")
def decisions(
    db: Session = Depends(get_db),
    _=Depends(require_roles(Role.GOVERNMENT, Role.ADMIN)),
):
    rows = (
        db.query(Verification.decision, func.count(Verification.id))
        .group_by(Verification.decision)
        .all()
    )
    return [{"decision": r[0], "count": r[1]} for r in rows]