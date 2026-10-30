from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth

router = APIRouter(prefix="/cases", tags=["Case Management"])


@router.get("/", response_model=List[schemas.CaseOut])
def list_cases(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    cases = db.query(models.Case).filter(models.Case.user_id == current_user.user_id).order_by(models.Case.created_at.desc()).all()
    if not cases:
        seed_demo_cases_for_user(db, current_user.user_id)
        cases = db.query(models.Case).filter(models.Case.user_id == current_user.user_id).order_by(models.Case.created_at.desc()).all()
    return cases


def seed_demo_cases_for_user(db: Session, user_id: int):
    """Automatically seeds 2 comprehensive demonstration case dockets for new advocates."""
    try:
        # Case 1: Criminal Bail & Quashing Docket
        case1 = models.Case(
            user_id=user_id,
            title="State of Maharashtra v. Singhania Logistics & Ors.",
            category="Criminal",
            court="Sessions Court, Greater Mumbai",
            status="active",
            filing_number="CRA-2026/4102",
            next_hearing_date="2026-11-20"
        )
        db.add(case1)
        db.commit()
        db.refresh(case1)

        # Documents
        doc1 = models.CaseDocument(
            case_id=case1.case_id,
            file_name="Anticipatory_Bail_Pleading_FIR_142.pdf",
            file_path="uploads/demo_case_1.pdf",
            file_type="pdf",
            extracted_text="APPLICATION UNDER SECTION 438 CrPC FOR GRANT OF ANTICIPATORY BAIL. The applicant Singhania Logistics has been falsely implicated in FIR No. 142/2026 registered at P.S. Marine Lines u/s 420, 406 IPC (Sections 316, 318 BNS). The dispute is purely of a civil commercial transaction regarding delivery delay. No Section 41A notice served. Applicant ready to cooperate.",
            doc_summary="Anticipatory Bail application seeking pre-arrest protection in commercial transport dispute. Highlights lack of criminal intent and failure by IO to serve mandatory Section 41A CrPC notice.",
            key_points='["Purely civil dispute given criminal cloak", "Section 41A notice was never served prior to arrest threat", "Full willingness to join investigation under 438(2) CrPC"]',
            analysis_status="completed"
        )
        db.add(doc1)

        # Summary
        sum1 = models.CaseSummary(
            case_id=case1.case_id,
            executive_summary="Anticipatory bail proceedings instituted before the Sessions Court challenging threat of arbitrary arrest in FIR No. 142/2026 alleging breach of delivery covenants. Defense grounds rely on commercial contract terms and non-compliance of Section 41A CrPC safeguards.",
            background_facts="Commercial freight contract entered in Jan 2026. Monsoon road disruptions delayed consignments. Complainant filed FIR alleging cheating rather than seeking commercial arbitral recourse.",
            procedural_history="FIR registered on 12-09-2026. Anticipatory Bail moved on 25-09-2026. Listed for hearing on interim protection.",
            legal_issues="Whether failure to perform commercial delivery on time constitutes cheating u/s 420 IPC absent fraudulent intention at inception?",
            petitioner_arguments="Mere breach of contract does not amount to cheating; mandatory compliance with Arnesh Kumar guidelines was ignored.",
            respondent_arguments="Investigation is nascent; custodial interrogation requested by prosecution."
        )
        db.add(sum1)

        # Applicable Laws
        law1 = models.ApplicableLaw(
            case_id=case1.case_id,
            section="Section 438 CrPC / 482 BNSS",
            act="Code of Criminal Procedure / BNSS, 2023",
            title="Direction for grant of bail to person apprehending arrest",
            description="Empowers High Court or Sessions Court to direct release on bail in anticipatory apprehension of non-bailable arrest.",
            relevance_score=0.96
        )
        law2 = models.ApplicableLaw(
            case_id=case1.case_id,
            section="Section 41A CrPC / 35(3) BNSS",
            act="Code of Criminal Procedure / BNSS, 2023",
            title="Notice of appearance before police officer",
            description="Police officer mandated to issue notice of appearance to person against whom reasonable complaint exists for offences punishable up to 7 years.",
            relevance_score=0.94
        )
        law3 = models.ApplicableLaw(
            case_id=case1.case_id,
            section="Section 420 IPC / Section 318 BNS",
            act="Indian Penal Code / Bharatiya Nyaya Sanhita, 2023",
            title="Cheating and dishonestly inducing delivery of property",
            description="Punishment for cheating with imprisonment up to 7 years and fine.",
            relevance_score=0.88
        )
        db.add_all([law1, law2, law3])

        # Precedents
        p1 = models.Precedent(
            case_id=case1.case_id,
            case_name="Arnesh Kumar v. State of Bihar",
            citation="(2014) 8 SCC 273",
            court="Supreme Court of India",
            year=2014,
            relevant_ratio="Mandated that police officers must not arrest accused unnecessarily without satisfying Section 41 CrPC notice requirements for offences punishable up to 7 years.",
            similarity_score=0.94,
            is_landmark=True
        )
        p2 = models.Precedent(
            case_id=case1.case_id,
            case_name="Satender Kumar Antil v. CBI",
            citation="(2022) 10 SCC 51",
            court="Supreme Court of India",
            year=2022,
            relevant_ratio="Bail is the rule, jail is the exception. Laid down categorised bail jurisprudence streamlining speedy liberty.",
            similarity_score=0.91,
            is_landmark=True
        )
        p3 = models.Precedent(
            case_id=case1.case_id,
            case_name="State of Haryana v. Bhajan Lal",
            citation="1992 Supp (1) SCC 335",
            court="Supreme Court of India",
            year=1992,
            relevant_ratio="Laid down seven definitive categories for quashing criminal complaints when civil disputes are maliciously given a criminal cloak.",
            similarity_score=0.89,
            is_landmark=True
        )
        db.add_all([p1, p2, p3])

        # Contradiction
        c1 = models.Contradiction(
            case_id=case1.case_id,
            issue_topic="Date of Alleged Non-Delivery Notice",
            statement_a="Complainant claimed in FIR that goods were never loaded on transport vehicles.",
            source_a="FIR No. 142/2026, Page 3",
            statement_b="Digital Gate Pass & E-Way Bills exhibit vehicle departure on 10-06-2026 with GPS logging.",
            source_b="E-Way Bill System & Transporter Log, Exhibit D-2",
            severity="High",
            explanation="Direct factual contradiction between FIR assertion and electronic government portal records."
        )
        db.add(c1)

        # Timeline
        t1 = models.TimelineEvent(case_id=case1.case_id, event_date="2026-01-15", title="Freight Agreement Executed", description="Commercial logistics contract entered between parties.", sequence_order=1)
        t2 = models.TimelineEvent(case_id=case1.case_id, event_date="2026-06-10", title="Goods Dispatched & E-Way Bill Generated", description="Consignment loaded and tracked via portal.", sequence_order=2)
        t3 = models.TimelineEvent(case_id=case1.case_id, event_date="2026-09-12", title="FIR Registered by Complainant", description="Complaint lodged at P.S. Marine Lines u/s 420/406 IPC.", sequence_order=3)
        t4 = models.TimelineEvent(case_id=case1.case_id, event_date="2026-09-25", title="Anticipatory Bail Application Moved", description="Petition filed before Sessions Court under Section 438 CrPC.", sequence_order=4)
        db.add_all([t1, t2, t3, t4])

        # Risk Assessment
        risk1 = models.RiskAssessment(
            case_id=case1.case_id,
            overall_score=38.5,
            risk_level="Moderate",
            contradictions_score=25.0,
            procedural_score=15.0,
            limitation_score=5.0,
            document_gap_score=18.0,
            vulnerabilities="Factual discrepancies between FIR statement and electronic transit receipts.",
            mitigation_strategy="Place certified copies of Section 65B Evidence Act certificate along with GPS telematics logs to disprove misappropriation."
        )
        db.add(risk1)

        # Priority Score
        prio1 = models.PriorityScore(
            case_id=case1.case_id,
            urgency_score=78.0,
            priority_level="Urgent",
            limitation_deadline="2026-11-20",
            days_remaining=38,
            rationale="Upcoming hearing on pre-arrest bail protection before the Sessions Judge."
        )
        db.add(prio1)

        # Welcome Chat Message
        msg1 = models.ChatMessage(
            case_id=case1.case_id,
            sender="assistant",
            message_text="Hello Adv. Counsel! I have ingested the case records for 'State of Maharashtra v. Singhania Logistics'. Key procedural safeguards under Section 41A CrPC and leading bail precedents (Arnesh Kumar, Satender Kumar Antil) have been mapped. How can I assist with your defense strategy?",
            sources_cited="Pleadings, Section 41A CrPC, Arnesh Kumar (2014)"
        )
        db.add(msg1)

        # Case 2: Commercial Contract & 138 NI Act
        case2 = models.Case(
            user_id=user_id,
            title="Arjun Mehta v. Union Commercial Bank & Anr.",
            category="Commercial",
            court="Commercial Court / High Court of Bombay",
            status="active",
            filing_number="COM-2026/8941",
            next_hearing_date="2026-12-05"
        )
        db.add(case2)
        db.commit()
        db.refresh(case2)

        sum2 = models.CaseSummary(
            case_id=case2.case_id,
            executive_summary="Commercial dispute involving breach of loan restructuring covenants and dishonour of security cheques under Section 138 NI Act.",
            background_facts="Credit facility restructured under RBI master direction. Bank attempted sudden enforcement without mandatory 60-day cure notice.",
            procedural_history="Commercial suit filed seeking declaration of non-enforceability of security cheques.",
            legal_issues="Whether security cheques issued for future contingent liabilities are enforceable u/s 138 NI Act absent crystallised debt?",
            petitioner_arguments="Cheques were strictly security instruments and not issued in discharge of existing debt.",
            respondent_arguments="Bank holds valid statutory presumption under Sections 118 and 139 of the NI Act."
        )
        db.add(sum2)

        risk2 = models.RiskAssessment(
            case_id=case2.case_id,
            overall_score=45.0,
            risk_level="Moderate",
            contradictions_score=20.0,
            procedural_score=20.0,
            vulnerabilities="Statutory presumptions under Sections 118 and 139 NI Act favouring the holder.",
            mitigation_strategy="Rely on Dashrath Rupsingh Rathod and Meter & Instruments to rebut statutory presumption via loan account audit."
        )
        db.add(risk2)

        prio2 = models.PriorityScore(
            case_id=case2.case_id,
            urgency_score=62.0,
            priority_level="High",
            limitation_deadline="2026-12-05",
            days_remaining=53,
            rationale="Pleading completion deadline in commercial dispute."
        )
        db.add(prio2)

        db.commit()
    except Exception as e:
        print(f"[Cases] Error auto-seeding demo cases: {e}")
        db.rollback()



@router.post("/", response_model=schemas.CaseOut)
def create_case(
    case_in: schemas.CaseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    new_case = models.Case(
        user_id=current_user.user_id,
        title=case_in.title,
        category=case_in.category,
        court=case_in.court,
        filing_number=case_in.filing_number,
        next_hearing_date=case_in.next_hearing_date,
        status="active"
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    return new_case


@router.get("/{case_id}", response_model=schemas.CaseOut)
def get_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    case = db.query(models.Case).filter(models.Case.case_id == case_id, models.Case.user_id == current_user.user_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or access denied")
    return case


@router.put("/{case_id}", response_model=schemas.CaseOut)
def update_case(
    case_id: int,
    case_update: schemas.CaseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    case = db.query(models.Case).filter(models.Case.case_id == case_id, models.Case.user_id == current_user.user_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    for field, val in case_update.dict(exclude_unset=True).items():
        setattr(case, field, val)

    db.commit()
    db.refresh(case)
    return case


@router.delete("/{case_id}")
def delete_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    case = db.query(models.Case).filter(models.Case.case_id == case_id, models.Case.user_id == current_user.user_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    db.delete(case)
    db.commit()
    return {"message": "Case and associated intelligence records deleted successfully"}
