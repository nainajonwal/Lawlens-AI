from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
import schemas
import models
import auth
from services import indian_kanoon_service

router = APIRouter(prefix="/research", tags=["Legal Research & Indian Kanoon"])


@router.get("/status")
def get_research_status():
    """Returns the current Indian Kanoon API integration status."""
    token = indian_kanoon_service.get_kanoon_token()
    return {
        "provider": "Indian Kanoon API (api.indiankanoon.org)",
        "token_configured": bool(token),
        "mode": "Live API + Landmark Corpus" if token else "Verified Indian Landmark Corpus (Fallback Active)",
        "docs_supported": "Supreme Court, High Courts, Tribunals, Statutes & Acts"
    }


@router.post("/token")
def set_research_token(payload: schemas.KanoonTokenUpdate, current_user: models.User = Depends(auth.get_current_user)):
    """Sets or updates the advocate's Indian Kanoon API token."""
    indian_kanoon_service.set_kanoon_token(payload.token)
    return {
        "success": True,
        "message": "Indian Kanoon API Token updated successfully.",
        "token_active": bool(payload.token.strip())
    }


@router.get("/search")
def search_legal_cases(
    q: str = Query(..., description="Legal topic, keywords, or section"),
    court: Optional[str] = Query(None, description="Court filter (e.g. Supreme Court)"),
    year: Optional[int] = Query(None, description="Judgment year"),
    category: Optional[str] = Query(None, description="Law category (Criminal, Civil, Commercial)"),
    pagenum: int = Query(0, description="Page number for pagination")
):
    """Searches Indian Kanoon API and Indian Legal Landmark Corpus."""
    if not q or not q.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty."
        )

    return indian_kanoon_service.search_legal_research(
        query=q.strip(),
        court_filter=court,
        year_filter=year,
        category_filter=category,
        pagenum=pagenum
    )


@router.get("/doc/{doc_id}")
def get_case_document(doc_id: str):
    """Retrieves full text and details for a specific Indian judgment."""
    details = indian_kanoon_service.get_judgment_details(doc_id)
    return details
