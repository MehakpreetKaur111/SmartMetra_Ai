import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import Product
from app.schemas import OCRResponse, ProductOut
from app.security import get_current_user
from app.services.cv import detect_regions, quality_score
from app.services.ocr import extract_text

settings = get_settings()
router = APIRouter()


@router.post("/ocr", response_model=OCRResponse)
async def ocr(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    data = await file.read()
    if not data:
        raise HTTPException(400, "Empty file")

    quality = quality_score(data)
    result = extract_text(data)
    # Optional: region detection (returns [] if YOLO unavailable)
    _ = detect_regions(data)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    fname = f"{uuid.uuid4().hex}_{file.filename or 'image.jpg'}"
    fpath = os.path.join(settings.UPLOAD_DIR, fname)
    with open(fpath, "wb") as f:
        f.write(data)

    if not result["raw_text"]:
        raise HTTPException(
            422,
            detail={
                "message": "No readable text detected. Please retake the photo in better lighting.",
                "image_quality": quality,
                "engine": result["engine"],
            },
        )

    product = Product(
        owner_id=user.id,
        name=result["raw_text"].splitlines()[0][:120] if result["raw_text"] else "Untitled product",
        description=result["raw_text"],
        ocr_text=result["raw_text"],
        image_path=fpath,
        image_quality=quality,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    warning = None
    if quality < 0.35:
        warning = "Low image quality — results may be incomplete."

    return OCRResponse(
        product_id=product.id,
        engine=result["engine"],
        raw_text=result["raw_text"],
        blocks=result["blocks"],
        image_quality=quality,
        warning=warning,
    )


@router.get("/", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return (
        db.query(Product)
        .filter(Product.owner_id == user.id)
        .order_by(Product.created_at.desc())
        .all()
    )


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = db.get(Product, product_id)
    if not p or p.owner_id != user.id:
        raise HTTPException(404, "Product not found")
    return p