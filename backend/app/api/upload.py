from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from uuid import uuid4
from pathlib import Path

router = APIRouter()

UPLOAD_DIR = Path("uploads/product-images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_image(request: Request, file: UploadFile = File(...)):
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type")

    ext = Path(file.filename or "").suffix.lstrip(".") or "bin"
    filename = f"{uuid4()}.{ext}"
    filepath = UPLOAD_DIR / filename

    with open(filepath, "wb") as f:
        f.write(await file.read())

    base_url = str(request.base_url).rstrip("/")
    return {
        "url": f"{base_url}/uploads/product-images/{filename}"
    }
