from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Standard
from app.schemas import StandardOut
from app.services.rag import retrieve

router = APIRouter()


@router.get("/search", response_model=list[StandardOut])
def search(q: str = Query(..., min_length=2), limit: int = 20, db: Session = Depends(get_db)):
    like = f"%{q}%"
    return (
        db.query(Standard)
        .filter(or_(
            Standard.is_number.ilike(like),
            Standard.title.ilike(like),
            Standard.category.ilike(like),
        ))
        .limit(limit)
        .all()
    )


@router.get("/semantic", response_model=list[StandardOut])
def semantic(q: str, k: int = 8, db: Session = Depends(get_db)):
    hits = retrieve(db, q, k=k)
    return [s for s, _ in hits]


@router.get("/{is_number}", response_model=StandardOut)
def get_one(is_number: str, db: Session = Depends(get_db)):
    s = db.query(Standard).filter(Standard.is_number == is_number).first()
    if not s:
        raise HTTPException(404, "Standard not found in knowledge base")
    return s