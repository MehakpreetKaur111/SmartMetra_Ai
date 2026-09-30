"""OpenCV preprocessing + image quality. YOLO is optional."""
from __future__ import annotations

from typing import Any

_yolo = None
_yolo_loaded = False


def _try_yolo():
    global _yolo, _yolo_loaded
    if _yolo_loaded:
        return _yolo
    _yolo_loaded = True
    try:
        from ultralytics import YOLO  # type: ignore
        _yolo = YOLO("yolov8n.pt")
    except Exception:
        _yolo = None
    return _yolo


def _decode(image_bytes: bytes) -> Any:
    import cv2
    import numpy as np

    arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Unreadable image")
    return img


def preprocess(image_bytes: bytes) -> Any:
    """Grayscale → denoise → adaptive threshold. Input to OCR."""
    import cv2

    img = _decode(image_bytes)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    return cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 11
    )


def quality_score(image_bytes: bytes) -> float:
    """Blur + exposure heuristic → 0..1. Warn the user before OCR."""
    import cv2
    import numpy as np

    img = _decode(image_bytes)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    sharp = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    bright = float(np.mean(gray))
    sharp_norm = min(sharp / 500.0, 1.0)
    expo_norm = 1.0 - abs(bright - 128) / 128.0
    return round(0.6 * sharp_norm + 0.4 * expo_norm, 3)


def detect_regions(image_bytes: bytes) -> list[dict]:
    """Optional: label / barcode region detection. Empty list if YOLO unavailable."""
    model = _try_yolo()
    if model is None:
        return []
    img = _decode(image_bytes)
    results = model.predict(img, verbose=False)
    boxes: list[dict] = []
    for r in results:
        for b in r.boxes:
            boxes.append({
                "label": r.names[int(b.cls)],
                "conf": float(b.conf),
                "bbox": [float(x) for x in b.xyxy[0].tolist()],
            })
    return boxes