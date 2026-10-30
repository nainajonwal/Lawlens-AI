from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# User & Auth
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    bar_enrollment_no: str  # e.g., MAH/4521/2021
    state_bar_council: str  # e.g., Bar Council of Maharashtra & Goa


class UserLogin(BaseModel):
    identifier: Optional[str] = None  # Bar Registration No. (e.g. MAH/4521/2021) or Email
    email: Optional[str] = None  # Backwards compatibility
    password: str


class UserOut(BaseModel):
    user_id: int
    name: str
    email: str
    bar_enrollment_no: Optional[str] = None
    state_bar_council: Optional[str] = None
    is_verified_advocate: Optional[bool] = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserOut] = None


# Cases
class CaseCreate(BaseModel):
    title: str
    category: str = "Civil"
    court: str = "District Court"
    filing_number: Optional[str] = None
    next_hearing_date: Optional[str] = None


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    court: Optional[str] = None
    status: Optional[str] = None
    filing_number: Optional[str] = None
    next_hearing_date: Optional[str] = None


class CaseOut(BaseModel):
    case_id: int
    user_id: int
    title: str
    category: str
    court: str
    status: str
    filing_number: Optional[str] = None
    next_hearing_date: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Documents
class CaseDocumentOut(BaseModel):
    document_id: int
    case_id: int
    file_name: str
    file_path: str
    file_type: str
    extracted_text: Optional[str] = None
    doc_summary: Optional[str] = None
    key_points: Optional[str] = None
    related_past_cases: Optional[str] = None
    analysis_status: Optional[str] = "pending"
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Historical Cases Dataset
class HistoricalCaseCreate(BaseModel):
    case_name: str
    citation: Optional[str] = None
    court: Optional[str] = "Supreme Court of India"
    year: Optional[int] = None
    category: str = "Civil"
    facts_summary: str
    key_issues: Optional[str] = None
    risk_factors: Optional[str] = None
    procedural_pitfalls: Optional[str] = None
    legal_ratio: Optional[str] = None
    source_dataset: Optional[str] = "Indian Legal Corpus"


class HistoricalCaseOut(BaseModel):
    historical_id: int
    case_name: str
    citation: Optional[str] = None
    court: str
    year: Optional[int] = None
    category: str
    facts_summary: str
    key_issues: Optional[str] = None
    risk_factors: Optional[str] = None
    procedural_pitfalls: Optional[str] = None
    legal_ratio: Optional[str] = None
    source_dataset: Optional[str] = None

    class Config:
        from_attributes = True


# Summaries
class CaseSummaryOut(BaseModel):
    summary_id: int
    case_id: int
    executive_summary: str
    background_facts: Optional[str] = None
    procedural_history: Optional[str] = None
    legal_issues: Optional[str] = None
    petitioner_arguments: Optional[str] = None
    respondent_arguments: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Applicable Laws
class ApplicableLawOut(BaseModel):
    law_id: int
    case_id: int
    section: str
    act: str
    title: str
    description: str
    relevance_score: float
    compliance_notes: Optional[str] = None

    class Config:
        from_attributes = True


# Precedents
class PrecedentOut(BaseModel):
    precedent_id: int
    case_id: int
    case_name: str
    citation: str
    court: str
    year: Optional[int] = None
    relevant_ratio: str
    similarity_score: float
    is_landmark: bool

    class Config:
        from_attributes = True


# Contradictions
class ContradictionOut(BaseModel):
    contradiction_id: int
    case_id: int
    issue_topic: str
    statement_a: str
    source_a: str
    statement_b: str
    source_b: str
    severity: str
    explanation: str

    class Config:
        from_attributes = True


# Timeline Events
class TimelineEventOut(BaseModel):
    event_id: int
    case_id: int
    event_date: str
    title: str
    description: str
    source_ref: Optional[str] = None
    sequence_order: int

    class Config:
        from_attributes = True


# Risk Assessments
class RiskAssessmentOut(BaseModel):
    risk_id: int
    case_id: int
    overall_score: float
    risk_level: str
    contradictions_score: float
    procedural_score: float
    limitation_score: float
    document_gap_score: float
    vulnerabilities: Optional[str] = None
    mitigation_strategy: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Priority Scores
class PriorityScoreOut(BaseModel):
    priority_id: int
    case_id: int
    urgency_score: float
    priority_level: str
    limitation_deadline: Optional[str] = None
    days_remaining: Optional[int] = None
    rationale: str

    class Config:
        from_attributes = True


# Chat Messages
class ChatMessageCreate(BaseModel):
    message_text: str


class ChatMessageOut(BaseModel):
    message_id: int
    case_id: int
    sender: str
    message_text: str
    sources_cited: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Unified Intelligence View
class CaseIntelligenceOverview(BaseModel):
    case: CaseOut
    documents: List[CaseDocumentOut]
    summary: Optional[CaseSummaryOut] = None
    laws: List[ApplicableLawOut] = []
    precedents: List[PrecedentOut] = []
    contradictions: List[ContradictionOut] = []
    timeline: List[TimelineEventOut] = []
    risk: Optional[RiskAssessmentOut] = None
    priority: Optional[PriorityScoreOut] = None


# Legal Drafts
class LegalDraftCreate(BaseModel):
    title: str = "Untitled Legal Draft"
    doc_type: str = "Bail Application"
    case_id: Optional[int] = None
    content: str
    plain_text: Optional[str] = None


class LegalDraftUpdate(BaseModel):
    title: Optional[str] = None
    doc_type: Optional[str] = None
    case_id: Optional[int] = None
    content: Optional[str] = None
    plain_text: Optional[str] = None


class LegalDraftOut(BaseModel):
    draft_id: int
    user_id: int
    case_id: Optional[int] = None
    title: str
    doc_type: str
    content: str
    plain_text: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Legal Research & Indian Kanoon
class KanoonTokenUpdate(BaseModel):
    token: str


class KanoonSearchResultItem(BaseModel):
    doc_id: str
    title: str
    headline: Optional[str] = None
    citation: Optional[str] = None
    court: Optional[str] = "Supreme Court of India"
    year: Optional[int] = None
    bench: Optional[str] = None
    ratio: Optional[str] = None
    url: Optional[str] = None
    is_landmark: bool = False
    source: str = "Indian Kanoon"


# AI Assistant Configuration
class AssistantKeyUpdate(BaseModel):
    api_key: str