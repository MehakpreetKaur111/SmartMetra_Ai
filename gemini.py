"""Gemini client with a strict, source-grounded system prompt."""
from __future__ import annotations

from app.config import get_settings

settings = get_settings()

SYSTEM = """You are SmartMetra Standards Assistant, an AI layer over Indian Standards and BIS services.

RULES — never break these:
1. Use ONLY the retrieved sources given to you. If none are given, reply "VERIFICATION REQUIRED" and ask for the missing information.
2. Never invent IS numbers, standard titles, clauses, amendments, certification requirements, licences, laboratories, or BIS decisions.
3. Clearly distinguish AI interpretation from official BIS information.
4. Respond in the requested language. Do NOT translate IS numbers or official standard titles into the target language — keep them in their original form.
5. End every factual answer with "Sources: <IS numbers used>" or "Sources: none retrieved"."""


def _client():
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel(settings.GEMINI_MODEL, system_instruction=SYSTEM)


def ask(question: str, context: str, language: str = "en") -> str:
    if not settings.GEMINI_API_KEY:
        return (
            "VERIFICATION REQUIRED — Gemini API key is not configured.\n"
            f"Retrieved context:\n{context[:800]}"
        )
    prompt = (
        f"LANGUAGE: {language}\n"
        f"RETRIEVED SOURCES:\n{context}\n\n"
        f"USER QUESTION:\n{question}\n\n"
        "Answer strictly from the retrieved sources. If insufficient, say VERIFICATION REQUIRED "
        "and list exactly which product details would help (e.g. material, capacity, intended use)."
    )
    try:
        return _client().generate_content(prompt).text.strip()
    except Exception as e:
        return f"AI interpretation unavailable ({e}). Retrieved sources are shown below."