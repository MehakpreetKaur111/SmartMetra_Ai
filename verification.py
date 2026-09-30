from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuditLog, Recommendation, Verification
from app.schemas import VerificationIn, VerificationOut
from app.security import Role, require_roles

router = APIRouter()


@router.get("/pending")
def pending(
    db: Session = Depends(get_db),
    _=Depends(require_roles(Role.GOVERNMENT, Role.ADMIN)),
    limit: int = 100,
):
    rows = (
        db.query(Recommendation)
        .order_by(Recommendation.created_at.desc())
        .limit(limit)
        .all()
    )
    out = []
    for r in rows:
        std = db.get(db.query(Recommendation).first().__class__, r.id)  # noqa
        out.append({
            "id": r.id,
            "product_id": r.product_id,
            "standard_id": r.standard_id,
            "relevance": r.relevance,
            "why": r.why,
            "confidence": r.confidence,
            "source_url": r.source_url,
            "is_demo": r.is_demo,
            "created_at": r.created_at,
        })
    return out


@router.post("/decide", response_model=VerificationOut)
def decide(
    body: VerificationIn,
    db: Session = Depends(get_db),
    user=Depends(require_roles(Role.GOVERNMENT, Role.ADMIN)),
):
    rec = db.get(Recommendation, body.recommendation_id)
    if not rec:
        raise HTTPException(404, "Recommendation not found")

    old = rec.relevance
    v = Verification(
        recommendation_id=rec.id,
        reviewer_id=user.id,
        decision=body.decision,
        old_value=old,
        new_value=body.new_value,
        comment=body.comment,
    )
    db.add(v)

    db.add(AuditLog(
        actor_id=user.id,
        action="VERIFICATION_DECISION",
        entity="recommendation",
        entity_id=rec.id,
        payload={
            "old": old,
            "new": body.new_value,
            "decision": body.decision,
            "comment": body.comment,
        },
    ))
    db.commit()
    db.refresh(v)
    return v


@router.get("/audit")
def audit(
    db: Session = Depends(get_db),
    _=Depends(require_roles(Role.GOVERNMENT, Role.ADMIN)),
    limit: int = 100,
):
    rows = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [{
        "id": a.id,
        "actor_id": a.actor_id,
        "action": a.action,
        "entity": a.entity,
        "entity_id": a.entity_id,
        "payload": a.payload,
        "created_at": a.created_at,
    } for a in rows]