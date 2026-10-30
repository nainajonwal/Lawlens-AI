import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
from services.dataset_service import (
    seed_historical_dataset,
    ingest_csv_dataset,
    ingest_json_dataset
)

router = APIRouter(prefix="/dataset", tags=["Historical Legal Cases Dataset"])

DATASET_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "datasets")


@router.get("/", response_model=List[schemas.HistoricalCaseOut])
def list_historical_cases(
    q: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Ensure baseline benchmark dataset is seeded
    seed_historical_dataset(db)

    query = db.query(models.HistoricalCase)

    if category and category.lower() != "all":
        query = query.filter(models.HistoricalCase.category.ilike(f"%{category}%"))

    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            (models.HistoricalCase.case_name.ilike(term)) |
            (models.HistoricalCase.citation.ilike(term)) |
            (models.HistoricalCase.facts_summary.ilike(term)) |
            (models.HistoricalCase.legal_ratio.ilike(term))
        )

    return query.order_by(models.HistoricalCase.year.desc()).all()


@router.post("/upload")
async def upload_dataset_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".csv", ".json"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported dataset format. Please upload a CSV (.csv) or JSON (.json) file."
        )

    os.makedirs(DATASET_UPLOAD_DIR, exist_ok=True)
    temp_path = os.path.join(DATASET_UPLOAD_DIR, f"{uuid.uuid4().hex}_{file.filename}")

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if ext == ".csv":
        added = ingest_csv_dataset(db, temp_path)
    else:
        added = ingest_json_dataset(db, temp_path)

    return {
        "message": f"Successfully ingested {added} historical cases from '{file.filename}' into the dataset.",
        "imported_count": added
    }


@router.get("/{historical_id}", response_model=schemas.HistoricalCaseOut)
def get_historical_case(
    historical_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    item = db.query(models.HistoricalCase).filter(models.HistoricalCase.historical_id == historical_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Historical case not found")
    return item
