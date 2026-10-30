from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from database import get_db
import schemas
import models
import auth

router = APIRouter(prefix="/drafts", tags=["Legal Drafts & Split Studio"])

LEGAL_DRAFT_TEMPLATES = [
    {
        "id": "bail_438",
        "title": "Application for Anticipatory Bail (u/s 438 Cr.P.C. / 482 BNSS)",
        "doc_type": "Bail Application",
        "content": """<h2 style="text-align: center;"><strong>IN THE COURT OF THE SESSIONS JUDGE, AT [DISTRICT]</strong></h2>
<h3 style="text-align: center;"><strong>CRIMINAL MISCELLANEOUS BAIL APPLICATION NO. ______ OF 2026</strong></h3>
<p style="text-align: center;"><em>IN THE MATTER OF:</em></p>
<p><strong>[Applicant Name]</strong>, S/o [Father's Name],<br>
R/o [Residential Address], [City, State] ... <strong>APPLICANT / ACCUSED</strong></p>
<p style="text-align: center;"><strong>VERSUS</strong></p>
<p><strong>STATE OF [STATE NAME]</strong><br>
(Through SHO, Police Station [P.S. Name]) ... <strong>RESPONDENT</strong></p>
<hr>
<p style="text-align: center;"><strong><u>APPLICATION UNDER SECTION 438 OF THE CODE OF CRIMINAL PROCEDURE, 1973 (CORRESPONDING TO SECTION 482 OF BHARATIYA NAGARIK SURAKSHA SANHITA, 2023) FOR GRANT OF ANTICIPATORY BAIL</u></strong></p>
<p><strong>MOST RESPECTFULLY SHOWETH:</strong></p>
<ol>
  <li>That the Applicant is a respectable, law-abiding citizen of India with deep roots in society and has no prior criminal antecedents.</li>
  <li>That the present FIR bearing No. [_____/2026] registered at P.S. [Name] under Sections [Sections] has been lodged out of sheer personal rivalry and malafide motives.</li>
  <li>That the allegations in the FIR do not prima facie disclose commission of any cognizable offence against the Applicant, violating the principles laid down by the Hon'ble Supreme Court in <em>Arnesh Kumar v. State of Bihar, (2014) 8 SCC 273</em>.</li>
  <li>That the Applicant undertakes to fully cooperate with the ongoing investigation and abide by all conditions that may be imposed by this Hon'ble Court under Section 438(2) Cr.P.C.</li>
  <li>That the Applicant has reasonable apprehension of being arrested without any lawful cause, which would infringe his fundamental right to personal liberty under Article 21 of the Constitution of India (reaffirmed in <em>Satender Kumar Antil v. CBI, (2022) 10 SCC 51</em>).</li>
</ol>
<p><strong>PRAYER:</strong></p>
<p>It is, therefore, most respectfully prayed that this Hon'ble Court may graciously be pleased to:</p>
<p>(a) Direct that in the event of arrest, the Applicant be released on Anticipatory Bail in connection with FIR No. [____/2026] P.S. [Name];</p>
<p>(b) Pass any other or further orders as this Hon'ble Court may deem fit and proper in the interest of justice.</p>
<p><br><strong>ADVOCATE FOR THE APPLICANT</strong><br>[Advocate Name & Bar Enrollment No.]<br>Date: [Current Date]</p>"""
    },
    {
        "id": "legal_notice_138",
        "title": "Legal Notice under Section 138 Negotiable Instruments Act, 1881",
        "doc_type": "Legal Notice",
        "content": """<h2 style="text-align: center;"><strong>OFFICE OF ADV. [ADVOCATE NAME]</strong></h2>
<p style="text-align: center;">Advocate, High Court | Bar Council Enrollment No: [MAH/XXXX/2021]<br>
Chambers: [Chamber Address, Court Complex, City] | Contact: [Phone/Email]</p>
<hr>
<p><strong>SPEED POST A.D. / REGISTERED POST</strong></p>
<p><strong>Date:</strong> [Current Date]</p>
<p><strong>TO:</strong><br>
<strong>[Name of Defaulter / Drawer]</strong><br>
[Residential / Office Address]<br>
[City, Pincode, State]</p>
<p><strong>SUBJECT: STATUTORY LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 FOR DISHONOUR OF CHEQUE NO. [______] DATED [______] FOR RS. [AMOUNT]/-</strong></p>
<p>Sir/Madam,</p>
<p>Under instructions from, and on behalf of my client, <strong>[Client Full Name]</strong>, residing at [Client Address], I hereby serve upon you the following statutory notice:</p>
<ol>
  <li>That in discharge of your legally enforceable debt/liability towards my Client, you issued Cheque No. [Cheque Number] dated [Cheque Date] drawn on [Bank Name, Branch] for an amount of Rs. [Amount in Figures]/- (Rupees [Amount in Words] only).</li>
  <li>That my Client presented the said cheque for encashment through their banker, [Bank Name], on [Deposit Date]. However, the said cheque was returned unpaid/dishonoured by your bank vide Return Memo dated [Memo Date] with the endorsement <strong>"FUNDS INSUFFICIENT"</strong>.</li>
  <li>That your aforesaid action constitutes an offence punishable under Section 138 of the Negotiable Instruments Act, 1881, as well as Section 420 of the Indian Penal Code, 1860 / Section 318 of Bharatiya Nyaya Sanhita, 2023.</li>
</ol>
<p><strong>THEREFORE</strong>, I hereby call upon you to make the payment of the said cheque amount of <strong>Rs. [Amount]/-</strong> within <strong>15 (fifteen) days</strong> from the receipt of this statutory notice, failing which my Client shall be constrained to initiate criminal proceedings against you under Section 138 of the Negotiable Instruments Act, 1881.</p>
<p><br>Yours faithfully,<br><br><strong>[Advocate Name]</strong><br>Advocate for the Complainant</p>"""
    },
    {
        "id": "written_statement_cpc",
        "title": "Written Statement in Civil Suit (Order VIII Rule 1 CPC)",
        "doc_type": "Written Statement",
        "content": """<h2 style="text-align: center;"><strong>IN THE COURT OF THE CIVIL JUDGE (SENIOR DIVISION), AT [CITY]</strong></h2>
<h3 style="text-align: center;"><strong>CIVIL SUIT NO. ______ OF 2026</strong></h3>
<p><strong>[Plaintiff Name]</strong> ... <strong>PLAINTIFF</strong></p>
<p style="text-align: center;"><strong>VERSUS</strong></p>
<p><strong>[Defendant Name]</strong> ... <strong>DEFENDANT</strong></p>
<hr>
<p style="text-align: center;"><strong><u>WRITTEN STATEMENT ON BEHALF OF DEFENDANT NO. 1 UNDER ORDER VIII RULE 1 OF THE CODE OF CIVIL PROCEDURE, 1908</u></strong></p>
<p><strong>PRELIMINARY OBJECTIONS:</strong></p>
<ol>
  <li>That the present suit is an abuse of judicial process, devoid of any cause of action, and liable to be rejected under Order VII Rule 11 of the CPC.</li>
  <li>That the suit is barred by limitation under Article 54 of the Limitation Act, 1963.</li>
  <li>That the Plaintiff has not approached this Hon'ble Court with clean hands and has suppressed material facts regarding title and possession. As held in <em>Suraj Lamp & Industries v. State of Haryana, (2012) 1 SCC 656</em>, unregistered agreements do not confer any legal ownership.</li>
</ol>
<p><strong>PARAWISE REPLY ON MERITS:</strong></p>
<ol>
  <li>That the contents of Paragraph 1 of the Plaint are matters of record and need no reply, save and except what is expressly admitted herein.</li>
  <li>That the contents of Paragraph 2 are vehemently denied. The Defendant never entered into any binding contract as alleged.</li>
</ol>
<p><strong>PRAYER:</strong></p>
<p>In view of the above facts, the Defendant prays that this Hon'ble Court may kindly dismiss the Plaintiff's suit with exemplary costs under Section 35A of the CPC.</p>
<p><br><strong>DEFENDANT</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>ADVOCATE FOR DEFENDANT</strong></p>"""
    },
    {
        "id": "writ_petition_226",
        "title": "Writ Petition under Article 226 of the Constitution of India",
        "doc_type": "Writ Petition",
        "content": """<h2 style="text-align: center;"><strong>IN THE HIGH COURT OF JUDICATURE AT [HIGH COURT NAME]</strong></h2>
<h3 style="text-align: center;"><strong>EXTRAORDINARY WRIT JURISDICTION</strong></h3>
<h3 style="text-align: center;"><strong>WRIT PETITION (CIVIL) NO. ______ OF 2026</strong></h3>
<p><strong>[Petitioner Name]</strong> ... <strong>PETITIONER</strong></p>
<p style="text-align: center;"><strong>VERSUS</strong></p>
<p><strong>1. STATE OF [STATE]</strong><br>
<strong>2. [Department / Authority Name]</strong> ... <strong>RESPONDENTS</strong></p>
<hr>
<p style="text-align: center;"><strong><u>WRIT PETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA FOR ISSUANCE OF A WRIT IN THE NATURE OF MANDAMUS / CERTIORARI</u></strong></p>
<p><strong>SYNOPSIS & LIST OF DATES:</strong></p>
<p>[Summarize dates and violation of Fundamental Rights under Articles 14, 19, and 21]</p>
<p><strong>QUESTIONS OF LAW:</strong></p>
<ol>
  <li>Whether the impugned administrative action of Respondent No. 2 is arbitrary, capricious, and violates Article 14 of the Constitution of India?</li>
  <li>Whether principles of natural justice (Audi Alteram Partem) were blatantly violated by failing to issue a Show Cause Notice?</li>
</ol>
<p><strong>PRAYER:</strong></p>
<p>The Petitioner respectfully prays for a Writ of Certiorari quashing the impugned order dated [Date], and a Writ of Mandamus directing Respondents to reconsider the matter in accordance with law.</p>"""
    }
]


@router.get("/templates")
def get_draft_templates():
    """Returns standard verified Indian court draft templates."""
    return LEGAL_DRAFT_TEMPLATES


@router.get("", response_model=List[schemas.LegalDraftOut])
def get_user_drafts(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all legal drafts created by the current advocate."""
    drafts = db.query(models.LegalDraft).filter(models.LegalDraft.user_id == current_user.user_id).order_by(models.LegalDraft.updated_at.desc()).all()
    if not drafts:
        demo_draft = models.LegalDraft(
            user_id=current_user.user_id,
            case_id=None,
            title="Anticipatory Bail Draft - Singhania",
            doc_type="Bail Application",
            content=LEGAL_DRAFT_TEMPLATES[0]["content"],
            plain_text="Anticipatory Bail Application under Section 438 CrPC."
        )
        db.add(demo_draft)
        db.commit()
        drafts = db.query(models.LegalDraft).filter(models.LegalDraft.user_id == current_user.user_id).order_by(models.LegalDraft.updated_at.desc()).all()
    return drafts


@router.post("", response_model=schemas.LegalDraftOut)
def create_draft(
    payload: schemas.LegalDraftCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new legal draft."""
    draft = models.LegalDraft(
        user_id=current_user.user_id,
        case_id=payload.case_id,
        title=payload.title,
        doc_type=payload.doc_type,
        content=payload.content,
        plain_text=payload.plain_text
    )
    db.add(draft)
    db.commit()
    db.refresh(draft)
    return draft


@router.get("/{draft_id}", response_model=schemas.LegalDraftOut)
def get_draft(
    draft_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves a specific draft by ID."""
    draft = db.query(models.LegalDraft).filter(
        models.LegalDraft.draft_id == draft_id,
        models.LegalDraft.user_id == current_user.user_id
    ).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found.")
    return draft


@router.put("/{draft_id}", response_model=schemas.LegalDraftOut)
def update_draft(
    draft_id: int,
    payload: schemas.LegalDraftUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Updates an existing legal draft."""
    draft = db.query(models.LegalDraft).filter(
        models.LegalDraft.draft_id == draft_id,
        models.LegalDraft.user_id == current_user.user_id
    ).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found.")

    if payload.title is not None:
        draft.title = payload.title
    if payload.doc_type is not None:
        draft.doc_type = payload.doc_type
    if payload.case_id is not None:
        draft.case_id = payload.case_id
    if payload.content is not None:
        draft.content = payload.content
    if payload.plain_text is not None:
        draft.plain_text = payload.plain_text

    db.commit()
    db.refresh(draft)
    return draft


@router.delete("/{draft_id}")
def delete_draft(
    draft_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a legal draft."""
    draft = db.query(models.LegalDraft).filter(
        models.LegalDraft.draft_id == draft_id,
        models.LegalDraft.user_id == current_user.user_id
    ).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found.")

    db.delete(draft)
    db.commit()
    return {"success": True, "message": "Draft deleted successfully."}
