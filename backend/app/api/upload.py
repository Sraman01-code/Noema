from fastapi import APIRouter, UploadFile, File, HTTPException
from uuid import uuid4
from pathlib import Path

router = APIRouter()

UPLOAD_DIR = Path("uploads/product-images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type")

    ext = file.filename.split(".")[-1]
    filename = f"{uuid4()}.{ext}"
    filepath = UPLOAD_DIR / filename

    with open(filepath, "wb") as f:
        f.write(await file.read())

    return {
        "url": f"http://localhost:8000/uploads/product-images/{filename}"
    }
