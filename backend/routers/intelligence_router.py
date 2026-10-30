from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
from services.summarizer import generate_case_summary
from services.law_mapper import map_applicable_laws
from services.precedent_retriever import retrieve_precedents
from services.contradiction_engine import detect_contradictions
from services.timeline_generator import generate_case_timeline
from services.risk_engine import calculate_explainable_risk
from services.priority_engine import calculate_case_priority

router = APIRouter(prefix="/intelligence", tags=["Legal Intelligence Engines"])


@router.post("/{case_id}/analyze", response_model=schemas.CaseIntelligenceOverview)
def run_case_analysis(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    case = db.query(models.Case).filter(models.Case.case_id == case_id, models.Case.user_id == current_user.user_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    docs = db.query(models.CaseDocument).filter(models.CaseDocument.case_id == case_id).all()
    aggregated_text = "\n\n".join([d.extracted_text for d in docs if d.extracted_text])

    # 1. Summarization
    summary_data = generate_case_summary(case.title, case.category, case.court, aggregated_text)
    # Check if summary already exists or update
    existing_summary = db.query(models.CaseSummary).filter(models.CaseSummary.case_id == case_id).first()
    if not existing_summary:
        existing_summary = models.CaseSummary(case_id=case_id, **summary_data)
        db.add(existing_summary)
    else:
        for k, v in summary_data.items():
            setattr(existing_summary, k, v)

    # 2. Statutory Law Mapping
    db.query(models.ApplicableLaw).filter(models.ApplicableLaw.case_id == case_id).delete()
    mapped_laws = map_applicable_laws(case.category, case.title, aggregated_text)
    law_records = []
    for l in mapped_laws:
        rec = models.ApplicableLaw(case_id=case_id, **l)
        db.add(rec)
        law_records.append(rec)

    # 3. Precedent Retrieval
    db.query(models.Precedent).filter(models.Precedent.case_id == case_id).delete()
    precedents = retrieve_precedents(case.category, case.title, aggregated_text)
    precedent_records = []
    for p in precedents:
        rec = models.Precedent(case_id=case_id, **p)
        db.add(rec)
        precedent_records.append(rec)

    # 4. Contradictions Detection
    db.query(models.Contradiction).filter(models.Contradiction.case_id == case_id).delete()
    contradictions = detect_contradictions(case.title, case.category, aggregated_text)
    contradiction_records = []
    for c in contradictions:
        rec = models.Contradiction(case_id=case_id, **c)
        db.add(rec)
        contradiction_records.append(rec)

    # 5. Timeline Generation
    db.query(models.TimelineEvent).filter(models.TimelineEvent.case_id == case_id).delete()
    timeline = generate_case_timeline(case.title, case.category, aggregated_text)
    timeline_records = []
    for t in timeline:
        rec = models.TimelineEvent(case_id=case_id, **t)
        db.add(rec)
        timeline_records.append(rec)

    # 6. Explainable Risk Assessment (Calibrated with Historical Cases Dataset)
    from services.dataset_service import find_matching_historical_cases
    past_cases = find_matching_historical_cases(db, aggregated_text, case.category, limit=3)

    db.query(models.RiskAssessment).filter(models.RiskAssessment.case_id == case_id).delete()
    risk_data = calculate_explainable_risk(
        category=case.category,
        contradictions_count=len(contradiction_records),
        documents_count=len(docs),
        has_filing_number=bool(case.filing_number),
        has_hearing_date=bool(case.next_hearing_date),
        past_cases_benchmark=past_cases
    )
    risk_rec = models.RiskAssessment(case_id=case_id, **risk_data)
    db.add(risk_rec)

    # 7. Priority Triage Scorer
    db.query(models.PriorityScore).filter(models.PriorityScore.case_id == case_id).delete()
    priority_data = calculate_case_priority(
        case_title=case.title,
        category=case.category,
        risk_score=risk_data["overall_score"],
        next_hearing_date=case.next_hearing_date
    )
    priority_rec = models.PriorityScore(case_id=case_id, **priority_data)
    db.add(priority_rec)

    db.commit()
    db.refresh(existing_summary)
    db.refresh(risk_rec)
    db.refresh(priority_rec)

    return {
        "case": case,
        "documents": docs,
        "summary": existing_summary,
        "laws": law_records,
        "precedents": precedent_records,
        "contradictions": contradiction_records,
        "timeline": timeline_records,
        "risk": risk_rec,
        "priority": priority_rec
    }


@router.get("/{case_id}/overview", response_model=schemas.CaseIntelligenceOverview)
def get_case_overview(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    case = db.query(models.Case).filter(models.Case.case_id == case_id, models.Case.user_id == current_user.user_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    docs = db.query(models.CaseDocument).filter(models.CaseDocument.case_id == case_id).all()
    summary = db.query(models.CaseSummary).filter(models.CaseSummary.case_id == case_id).first()
    laws = db.query(models.ApplicableLaw).filter(models.ApplicableLaw.case_id == case_id).all()
    precedents = db.query(models.Precedent).filter(models.Precedent.case_id == case_id).all()
    contradictions = db.query(models.Contradiction).filter(models.Contradiction.case_id == case_id).all()
    timeline = db.query(models.TimelineEvent).filter(models.TimelineEvent.case_id == case_id).order_by(models.TimelineEvent.sequence_order.asc()).all()
    risk = db.query(models.RiskAssessment).filter(models.RiskAssessment.case_id == case_id).first()
    priority = db.query(models.PriorityScore).filter(models.PriorityScore.case_id == case_id).first()

    return {
        "case": case,
        "documents": docs,
        "summary": summary,
        "laws": laws,
        "precedents": precedents,
        "contradictions": contradictions,
        "timeline": timeline,
        "risk": risk,
        "priority": priority
    }
