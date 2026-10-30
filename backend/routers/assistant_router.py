from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
from services.legal_assistant import answer_legal_query, get_gemini_key, set_gemini_key

router = APIRouter(prefix="/assistant", tags=["Legal Research Assistant"])


@router.get("/status")
def get_assistant_status():
    """Returns AI model and Gemini configuration status."""
    key = get_gemini_key()
    return {
        "gemini_configured": bool(key),
        "mode": "Google Gemini 2.5 AI + Kanoon Precedents" if key else "Dynamic Indian Legal Reasoning Engine (Active)",
        "models_supported": "Gemini 2.5 Flash, 1.5 Flash, BNS/BNSS Statutory Engine"
    }


@router.post("/key")
def update_gemini_key(
    payload: schemas.AssistantKeyUpdate,
    current_user: models.User = Depends(auth.get_current_user)
):
    """Sets or updates the Google Gemini API key."""
    success = set_gemini_key(payload.api_key)
    return {
        "success": success,
        "gemini_active": bool(payload.api_key.strip()),
        "message": "Gemini API Key updated successfully." if success else "Failed to save key."
    }


@router.post("/chat")
def chat_general(
    query_in: schemas.ChatMessageCreate,
    current_user: models.User = Depends(auth.get_current_user)
):
    ai_result = answer_legal_query(
        query=query_in.message_text,
        case_title="All-India Legal Intelligence",
        category="General Law"
    )
    return {
        "message_id": 999999,
        "case_id": 0,
        "sender": "assistant",
        "message_text": ai_result["answer"],
        "sources_cited": ai_result["sources_cited"]
    }


@router.post("/{case_id}/chat")
def chat_with_case_assistant(
    case_id: int,
    query_in: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if case_id == 0:
        return chat_general(query_in, current_user)

    case = db.query(models.Case).filter(models.Case.case_id == case_id, models.Case.user_id == current_user.user_id).first()
    if not case:
        return chat_general(query_in, current_user)

    # Save lawyer question
    user_msg = models.ChatMessage(
        case_id=case_id,
        sender="lawyer",
        message_text=query_in.message_text
    )
    db.add(user_msg)

    # Gather case context
    summary = db.query(models.CaseSummary).filter(models.CaseSummary.case_id == case_id).first()
    summary_text = summary.executive_summary if summary else ""
    
    docs = db.query(models.CaseDocument).filter(models.CaseDocument.case_id == case_id).all()
    doc_text = "\n\n".join([d.extracted_text for d in docs if d.extracted_text])

    laws = db.query(models.ApplicableLaw).filter(models.ApplicableLaw.case_id == case_id).all()
    laws_dicts = [{"section": l.section, "act": l.act, "title": l.title} for l in laws]

    precedents = db.query(models.Precedent).filter(models.Precedent.case_id == case_id).all()
    prec_dicts = [{"case_name": p.case_name, "citation": p.citation, "relevant_ratio": p.relevant_ratio} for p in precedents]

    # Generate source-grounded answer
    ai_result = answer_legal_query(
        query=query_in.message_text,
        case_title=case.title,
        category=case.category,
        case_summary=summary_text,
        laws=laws_dicts,
        precedents=prec_dicts,
        document_text=doc_text
    )

    # Save assistant response
    assistant_msg = models.ChatMessage(
        case_id=case_id,
        sender="assistant",
        message_text=ai_result["answer"],
        sources_cited=ai_result["sources_cited"]
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg


@router.get("/{case_id}/chat")
def get_chat_history(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if case_id == 0:
        return []

    case = db.query(models.Case).filter(models.Case.case_id == case_id, models.Case.user_id == current_user.user_id).first()
    if not case:
        return []

    history = db.query(models.ChatMessage).filter(models.ChatMessage.case_id == case_id).order_by(models.ChatMessage.created_at.asc()).all()
    return history
