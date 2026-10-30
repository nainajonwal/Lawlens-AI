import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
from services.document_parser import extract_text_from_file

router = APIRouter(prefix="/documents", tags=["Case Documents"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB limit


@router.post("/{case_id}/upload", response_model=schemas.CaseDocumentOut)
async def upload_document(
    case_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Verify case ownership
    case = db.query(models.Case).filter(models.Case.case_id == case_id, models.Case.user_id == current_user.user_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Only PDF and DOCX files are permitted."
        )

    # Generate unique filename to avoid overwrites
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    safe_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    # Save to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text from the uploaded document
    clean_ext = ext.replace(".", "")
    extracted_text, _ = extract_text_from_file(file_path, clean_ext)

    # Domain Guardrail: Verify that the uploaded file is indeed a legal document
    from services.legal_validator import validate_legal_document
    is_legal, reason, _ = validate_legal_document(extracted_text, file.filename)
    if not is_legal:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Upload Rejected: Not a legal document. {reason}"
        )

    # Automatically analyze this specific document (summary, key points, past cases)
    from services.doc_analyzer import analyze_single_document
    analysis_data = analyze_single_document(db, file.filename, extracted_text, case.category)

    # Persist in CaseDocuments table
    doc_record = models.CaseDocument(
        case_id=case.case_id,
        file_name=file.filename,
        file_path=file_path,
        file_type=clean_ext,
        extracted_text=extracted_text,
        doc_summary=analysis_data.get("doc_summary"),
        key_points=analysis_data.get("key_points"),
        related_past_cases=analysis_data.get("related_past_cases"),
        analysis_status="completed"
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    return doc_record


@router.get("/{case_id}", response_model=List[schemas.CaseDocumentOut])
def list_case_documents(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    case = db.query(models.Case).filter(models.Case.case_id == case_id, models.Case.user_id == current_user.user_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    docs = db.query(models.CaseDocument).filter(models.CaseDocument.case_id == case_id).order_by(models.CaseDocument.uploaded_at.desc()).all()
    return docs


@router.get("/{case_id}/doc/{document_id}", response_model=schemas.CaseDocumentOut)
def get_document(
    case_id: int,
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    case = db.query(models.Case).filter(models.Case.case_id == case_id, models.Case.user_id == current_user.user_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    doc = db.query(models.CaseDocument).filter(models.CaseDocument.document_id == document_id, models.CaseDocument.case_id == case_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.post("/{case_id}/doc/{document_id}/analyze", response_model=schemas.CaseDocumentOut)
def reanalyze_document(
    case_id: int,
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    case = db.query(models.Case).filter(models.Case.case_id == case_id, models.Case.user_id == current_user.user_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    doc = db.query(models.CaseDocument).filter(models.CaseDocument.document_id == document_id, models.CaseDocument.case_id == case_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    from services.doc_analyzer import analyze_single_document
    analysis_data = analyze_single_document(db, doc.file_name, doc.extracted_text or "", case.category)

    doc.doc_summary = analysis_data.get("doc_summary")
    doc.key_points = analysis_data.get("key_points")
    doc.related_past_cases = analysis_data.get("related_past_cases")
    doc.analysis_status = "completed"

    db.commit()
    db.refresh(doc)
    return doc

