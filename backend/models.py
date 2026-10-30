from sqlalchemy import Column, Integer, String, Text, Float, TIMESTAMP, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "Users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    bar_enrollment_no = Column(String(100), nullable=True)  # e.g., MAH/4521/2021
    state_bar_council = Column(String(150), nullable=True)  # e.g., Bar Council of Maharashtra & Goa
    is_verified_advocate = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    cases = relationship("Case", back_populates="owner")
    drafts = relationship("LegalDraft", back_populates="user", cascade="all, delete-orphan")


class Case(Base):
    __tablename__ = "Cases"

    case_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.user_id"), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="Civil")  # Civil, Criminal, Constitutional, Commercial, Cyber
    court = Column(String(200), default="District Court")
    status = Column(String(50), default="active")  # active, pending, closed
    filing_number = Column(String(100), nullable=True)
    next_hearing_date = Column(String(50), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    owner = relationship("User", back_populates="cases")
    documents = relationship("CaseDocument", back_populates="case", cascade="all, delete-orphan")
    summaries = relationship("CaseSummary", back_populates="case", cascade="all, delete-orphan")
    laws = relationship("ApplicableLaw", back_populates="case", cascade="all, delete-orphan")
    precedents = relationship("Precedent", back_populates="case", cascade="all, delete-orphan")
    contradictions = relationship("Contradiction", back_populates="case", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="case", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="case", cascade="all, delete-orphan")
    priority_scores = relationship("PriorityScore", back_populates="case", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="case", cascade="all, delete-orphan")
    drafts = relationship("LegalDraft", back_populates="case")


class CaseDocument(Base):
    __tablename__ = "CaseDocuments"

    document_id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("Cases.case_id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(20), nullable=False)  # pdf, docx
    extracted_text = Column(Text, nullable=True)
    doc_summary = Column(Text, nullable=True)
    key_points = Column(Text, nullable=True)  # JSON formatted key takeaways
    related_past_cases = Column(Text, nullable=True)  # JSON formatted past matched cases
    analysis_status = Column(String(50), default="pending")  # pending, completed
    uploaded_at = Column(TIMESTAMP, server_default=func.now())

    case = relationship("Case", back_populates="documents")


class CaseSummary(Base):
    __tablename__ = "CaseSummaries"

    summary_id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("Cases.case_id"), nullable=False)
    executive_summary = Column(Text, nullable=False)
    background_facts = Column(Text, nullable=True)
    procedural_history = Column(Text, nullable=True)
    legal_issues = Column(Text, nullable=True)
    petitioner_arguments = Column(Text, nullable=True)
    respondent_arguments = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    case = relationship("Case", back_populates="summaries")


class ApplicableLaw(Base):
    __tablename__ = "ApplicableLaws"

    law_id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("Cases.case_id"), nullable=False)
    section = Column(String(100), nullable=False)
    act = Column(String(200), nullable=False)  # IPC/BNS, CrPC/BNSS, BSA
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    relevance_score = Column(Float, default=0.90)
    compliance_notes = Column(Text, nullable=True)

    case = relationship("Case", back_populates="laws")


class Precedent(Base):
    __tablename__ = "Precedents"

    precedent_id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("Cases.case_id"), nullable=False)
    case_name = Column(String(255), nullable=False)
    citation = Column(String(150), nullable=False)
    court = Column(String(150), nullable=False)
    year = Column(Integer, nullable=True)
    relevant_ratio = Column(Text, nullable=False)
    similarity_score = Column(Float, default=0.85)
    is_landmark = Column(Boolean, default=True)

    case = relationship("Case", back_populates="precedents")


class Contradiction(Base):
    __tablename__ = "Contradictions"

    contradiction_id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("Cases.case_id"), nullable=False)
    issue_topic = Column(String(200), nullable=False)
    statement_a = Column(Text, nullable=False)
    source_a = Column(String(200), nullable=False)
    statement_b = Column(Text, nullable=False)
    source_b = Column(String(200), nullable=False)
    severity = Column(String(50), default="High")  # High, Medium, Low
    explanation = Column(Text, nullable=False)

    case = relationship("Case", back_populates="contradictions")


class TimelineEvent(Base):
    __tablename__ = "TimelineEvents"

    event_id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("Cases.case_id"), nullable=False)
    event_date = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    source_ref = Column(String(200), nullable=True)
    sequence_order = Column(Integer, default=1)

    case = relationship("Case", back_populates="timeline_events")


class RiskAssessment(Base):
    __tablename__ = "RiskAssessments"

    risk_id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("Cases.case_id"), nullable=False)
    overall_score = Column(Float, nullable=False)  # 0 to 100
    risk_level = Column(String(50), nullable=False)  # Low, Moderate, High, Critical
    contradictions_score = Column(Float, default=0.0)
    procedural_score = Column(Float, default=0.0)
    limitation_score = Column(Float, default=0.0)
    document_gap_score = Column(Float, default=0.0)
    vulnerabilities = Column(Text, nullable=True)  # JSON or bulleted text
    mitigation_strategy = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    case = relationship("Case", back_populates="risk_assessments")


class PriorityScore(Base):
    __tablename__ = "PriorityScores"

    priority_id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("Cases.case_id"), nullable=False)
    urgency_score = Column(Float, nullable=False)  # 0 to 100
    priority_level = Column(String(50), nullable=False)  # Urgent, High, Normal, Low
    limitation_deadline = Column(String(50), nullable=True)
    days_remaining = Column(Integer, nullable=True)
    rationale = Column(Text, nullable=False)

    case = relationship("Case", back_populates="priority_scores")


class ChatMessage(Base):
    __tablename__ = "ChatMessages"

    message_id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("Cases.case_id"), nullable=False)
    sender = Column(String(50), default="lawyer")  # lawyer, assistant
    message_text = Column(Text, nullable=False)
    sources_cited = Column(Text, nullable=True)  # JSON or comma-separated list
    created_at = Column(TIMESTAMP, server_default=func.now())

    case = relationship("Case", back_populates="chat_messages")


class HistoricalCase(Base):
    __tablename__ = "HistoricalCases"

    historical_id = Column(Integer, primary_key=True, index=True)
    case_name = Column(String(255), nullable=False)
    citation = Column(String(150), nullable=True)
    court = Column(String(150), default="Supreme Court of India")
    year = Column(Integer, nullable=True)
    category = Column(String(100), default="Civil")
    facts_summary = Column(Text, nullable=False)
    key_issues = Column(Text, nullable=True)
    risk_factors = Column(Text, nullable=True)
    procedural_pitfalls = Column(Text, nullable=True)
    legal_ratio = Column(Text, nullable=True)
    source_dataset = Column(String(100), default="Indian Legal Corpus")


class LegalDraft(Base):
    __tablename__ = "LegalDrafts"

    draft_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.user_id"), nullable=False)
    case_id = Column(Integer, ForeignKey("Cases.case_id"), nullable=True)
    title = Column(String(255), nullable=False, default="Untitled Legal Draft")
    doc_type = Column(String(100), default="Bail Application")  # Bail Application, Legal Notice, Written Statement, Plaint, Writ Petition, Affidavit, Custom Draft
    content = Column(Text, nullable=False)  # Rich HTML / document formatted content
    plain_text = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="drafts")
    case = relationship("Case", back_populates="drafts")