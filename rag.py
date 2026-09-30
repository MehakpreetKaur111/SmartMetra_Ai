"""Minimal RAG — no LangChain. Retrieve → build context → hand to LLM."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import Standard
from app.services.faiss_store import search


def retrieve(db: Session, query: str, k: int = 8) -> list[tuple[Standard, float]]:
    return search(db, query, k=k)


def build_context(hits: list[tuple[Standard, float]]) -> str:
    if not hits:
        return "NO_RETRIEVED_SOURCES"
    lines = []
    for s, score in hits:
        lines.append(
            f"[{s.is_number}] {s.title} | category={s.category} "
            f"| verification={s.verification_status} | source={s.source_url} | score={score:.3f}"
        )
    return "\n".join(lines)


def decide_relevance(score: float) -> str:
    """Honest, non-numeric applicability label derived from retrieval score."""
    if score >= 0.55:
        return "RELEVANT"
    if score >= 0.38:
        return "POTENTIALLY_RELEVANT"
    if score >= 0.25:
        return "RELATED"
    return "VERIFICATION_REQUIRED"