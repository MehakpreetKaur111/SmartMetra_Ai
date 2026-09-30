"""AI Standards Match — the central workflow."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product, Recommendation, Standard
from app.schemas import MatchIn, MatchOut, RetrievedStandard
from app.security import get_current_user
from app.services.gemini import ask
from app.services.rag import build_context, decide_relevance, retrieve

router = APIRouter()


def _missing_info(hits) -> list[str]:
    if not hits:
        return ["product name", "category", "material", "intended use"]
    weak = [s for s, score in hits if score < 0.35]
    if len(weak) == len(hits):
        return ["more specific product description", "material", "capacity / rating", "intended use"]
    return []


@router.post("/", response_model=MatchOut)
def match(
    body: MatchIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Build a query string from product name + description + specs
    parts: list[str] = []
    if body.product_name:
        parts.append(body.product_name)
    if body.description:
        parts.append(body.description)
    if body.specs:
        parts.extend(f"{k}: {v}" for k, v in body.specs.items())
    query = " ".join(parts).strip()

    # If product_id given, append its OCR text so we use real extraction
    if body.product_id:
        p = db.get(Product, body.product_id)
        if p and p.ocr_text:
            query = f"{query} {p.ocr_text}".strip()

    if not query:
        return MatchOut(
            ai_summary="VERIFICATION REQUIRED — please describe your product or upload an image.",
            missing_info=["product name", "category", "material", "intended use"],
            retrieved=[],
            demo=body.demo,
        )

    hits = retrieve(db, query, k=8)

    retrieved: list[RetrievedStandard] = []
    for s, score in hits:
        relevance = decide_relevance(score)
        why = (
            f"Retrieved because the identified product/category matches the scope of "
            f"{s.is_number}. Official applicability must be confirmed against the BIS source."
        )
        rec = Recommendation(
            product_id=body.product_id,
            standard_id=s.id,
            user_id=user.id,
            relevance=relevance,
            why=why,
            confidence=float(score),
            source_url=s.source_url,
            is_demo=body.demo,
        )
        db.add(rec)
        retrieved.append(RetrievedStandard(
            is_number=s.is_number,
            title=s.title,
            category=s.category,
            relevance=relevance,
            why=why,
            source_url=s.source_url,
            verification_status=s.verification_status,
            score=float(score),
        ))

    db.commit()

    if hits:
        context = build_context(hits)
        summary = ask(
            question=f"Which Indian Standards may apply to this product?\n\nProduct: {query}",
            context=context,
            language=body.language,
        )
    else:
        summary = (
            "VERIFICATION REQUIRED — no matching standard was retrieved from the knowledge base. "
            "Please add material, capacity or intended use."
        )

    return MatchOut(
        ai_summary=summary,
        missing_info=_missing_info(hits),
        retrieved=retrieved,
        demo=body.demo,
    )