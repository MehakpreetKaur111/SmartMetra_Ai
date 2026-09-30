"""
FAISS semantic index built from the Standard table.
Rebuilt automatically when the underlying corpus changes.
"""
from __future__ import annotations

import os
import threading
from typing import Any

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import Standard
from app.services.embedding import embed

settings = get_settings()

_lock = threading.Lock()
_index: Any | None = None
_ids: list[str] = []
_fingerprint: int = 0


def _corpus(db: Session) -> list[Standard]:
    return db.query(Standard).all()


def _fingerprint_of(rows: list[Standard]) -> int:
    # cheap change detector: count + max(id-based hash)
    return hash((len(rows), sum(hash(r.is_number + (r.title or "")) for r in rows)))


def _std_text(s: Standard) -> str:
    return " | ".join(filter(None, [s.is_number, s.title, s.category, s.scope]))


def _build(rows: list[Standard]) -> None:
    global _index, _ids, _fingerprint
    if not rows:
        _index, _ids, _fingerprint = None, [], 0
        return

    import faiss
    import numpy as np

    vecs = np.asarray(embed([_std_text(r) for r in rows]), dtype="float32")
    index = faiss.IndexFlatIP(vecs.shape[1])   # cosine via normalized vectors
    index.add(vecs)
    _index = index
    _ids = [r.id for r in rows]
    _fingerprint = _fingerprint_of(rows)


def ensure_index(db: Session, force: bool = False) -> None:
    """Build the index lazily; rebuild if the corpus changed or force=True."""
    global _fingerprint
    with _lock:
        rows = _corpus(db)
        fp = _fingerprint_of(rows)
        if force or _index is None or fp != _fingerprint:
            _build(rows)


def search(db: Session, query: str, k: int = 8) -> list[tuple[Standard, float]]:
    ensure_index(db)
    if _index is None or not _ids:
        return []
    import numpy as np

    q = np.asarray([embed_one_wrapper(query)], dtype="float32")
    scores, idxs = _index.search(q, min(k, len(_ids)))
    out: list[tuple[Standard, float]] = []
    for score, i in zip(scores[0], idxs[0]):
        if i == -1:
            continue
        std = db.get(Standard, _ids[i])
        if std:
            out.append((std, float(score)))
    return out


def embed_one_wrapper(text: str) -> list[float]:
    from app.services.embedding import embed_one
    return embed_one(text)


def save() -> None:
    """Optional persistence. Prototype rebuilds on demand, but this is available."""
    if _index is None:
        return
    import faiss

    os.makedirs(os.path.dirname(settings.FAISS_INDEX_PATH) or ".", exist_ok=True)
    faiss.write_index(_index, settings.FAISS_INDEX_PATH)


def load_if_exists() -> bool:
    global _index
    if not os.path.exists(settings.FAISS_INDEX_PATH):
        return False
    try:
        import faiss

        _index = faiss.read_index(settings.FAISS_INDEX_PATH)
        return True
    except Exception:
        return False