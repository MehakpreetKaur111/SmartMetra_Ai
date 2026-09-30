"""PyMuPDF extraction + naive IS-number discovery for bulk KB seeding."""
from __future__ import annotations

import re
from pathlib import Path

import fitz  # PyMuPDF

IS_RE = re.compile(r"\bIS\s?\d{2,5}(?:\s?\(Part\s?\d+\))?\b", re.IGNORECASE)


def extract_text(pdf_path: Path) -> str:
    doc = fitz.open(pdf_path)
    try:
        return "\n".join(page.get_text("text") for page in doc).strip()
    finally:
        doc.close()


def find_is_numbers(text: str) -> list[str]:
    return sorted({m.group(0).replace("  ", " ").strip() for m in IS_RE.finditer(text)})


def first_scope(text: str, limit: int = 1200) -> str:
    return text[:limit] if text else ""