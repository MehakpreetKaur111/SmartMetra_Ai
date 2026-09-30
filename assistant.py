from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Conversation
from app.schemas import AskIn, AskOut, SourceOut
from app.security import get_current_user
from app.services.gemini import ask
from app.services.rag import build_context, retrieve

router = APIRouter()


@router.post("/ask", response_model=AskOut)
def ask_endpoint(
    body: AskIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    hits = retrieve(db, body.question, k=6)

    if not hits:
        answer = (
            "VERIFICATION REQUIRED — no retrieved official sources matched your question. "
            "Please add the product name, category, material or intended use."
        )
        sources: list[SourceOut] = []
    else:
        context = build_context(hits)
        answer = ask(body.question, context, body.language)
        sources = [
            SourceOut(
                is_number=s.is_number,
                title=s.title,
                source_url=s.source_url,
                verification_status=s.verification_status,
            )
            for s, _ in hits
        ]

    db.add(Conversation(
        user_id=user.id,
        language=body.language,
        question=body.question,
        answer=answer,
        sources=[s.model_dump() for s in sources],
    ))
    db.commit()

    return AskOut(
        answer=answer,
        language=body.language,
        sources=sources,
        verification_required=not hits,
    )