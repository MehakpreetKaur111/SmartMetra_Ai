"""PaddleOCR with Tesseract fallback. Returns real text or an empty result."""
from __future__ import annotations

from app.config import get_settings
from app.services.cv import preprocess

settings = get_settings()
_paddle = None
_paddle_loaded = False


def _get_paddle():
    global _paddle, _paddle_loaded
    if _paddle_loaded:
        return _paddle
    _paddle_loaded = True
    try:
        from paddleocr import PaddleOCR  # type: ignore
        _paddle = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
    except Exception:
        _paddle = None
    return _paddle


def extract_text(image_bytes: bytes) -> dict:
    """
    Returns {engine, raw_text, blocks:[{text,bbox,conf}]}.
    Never fabricates output — empty blocks if nothing is read.
    """
    try:
        processed = preprocess(image_bytes)
    except Exception as e:
        return {"engine": "none", "raw_text": "", "blocks": [], "error": str(e)}

    if settings.OCR_ENGINE == "paddle":
        engine = _get_paddle()
        if engine is not None:
            try:
                result = engine.ocr(processed, cls=True)
                blocks: list[dict] = []
                for line in result or []:
                    for box, (text, conf) in line:
                        blocks.append({"text": text, "bbox": box, "conf": float(conf)})
                return {
                    "engine": "paddle",
                    "raw_text": "\n".join(b["text"] for b in blocks).strip(),
                    "blocks": blocks,
                }
            except Exception:
                pass  # fall through to tesseract

    import pytesseract

    data = pytesseract.image_to_data(processed, output_type=pytesseract.Output.DICT)
    blocks = []
    for i, t in enumerate(data["text"]):
        if t and t.strip():
            blocks.append({
                "text": t,
                "bbox": [data["left"][i], data["top"][i], data["width"][i], data["height"][i]],
                "conf": float(data["conf"][i]) / 100.0,
            })
    return {
        "engine": "tesseract",
        "raw_text": "\n".join(b["text"] for b in blocks).strip(),
        "blocks": blocks,
    }