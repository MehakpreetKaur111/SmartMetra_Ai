from functools import lru_cache

from app.config import get_settings

settings = get_settings()


@lru_cache(maxsize=1)
def _model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(settings.EMBEDDING_MODEL)


def embed(texts: list[str]) -> list[list[float]]:
    vecs = _model().encode(texts, normalize_embeddings=True)
    return vecs.tolist()


def embed_one(text: str) -> list[float]:
    return embed([text])[0]