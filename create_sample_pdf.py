import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT

def create_bail_application_pdf(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CourtTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#0f172a')
    )

    case_no_style = ParagraphStyle(
        'CaseNo',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#1e293b')
    )

    body_style = ParagraphStyle(
        'LegalBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        alignment=TA_JUSTIFY,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=8
    )

    bold_body_style = ParagraphStyle(
        'BoldLegalBody',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=4
    )

    subheading_style = ParagraphStyle(
        'SubHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=15,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=10
    )

    story = []

    # Court Header
    story.append(Paragraph("IN THE COURT OF THE PRINCIPAL SESSIONS JUDGE, GREATER MUMBAI", title_style))
    story.append(Paragraph("CRIMINAL MISCELLANEOUS BAIL APPLICATION NO. 4102 OF 2026", case_no_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f172a'), spaceBefore=2, spaceAfter=10))

    # Parties Memo
    memo_text = """
    <b>IN THE MATTER OF:</b><br/><br/>
    <b>1. Singhania Logistics & Infrastructure Pvt. Ltd.</b><br/>
    Through its Managing Director, Shri Rajesh Singhania,<br/>
    Having office at Nariman Point, Mumbai - 400021 ... <b>APPLICANT / ACCUSED</b><br/><br/>
    <div align="center"><b>VERSUS</b></div><br/>
    <b>1. THE STATE OF MAHARASHTRA</b><br/>
    Through Police Inspector, Marine Lines Police Station, Mumbai<br/><br/>
    <b>2. Apex Global Freight Carriers Pvt. Ltd.</b><br/>
    Represented by Director Vikramaditya Rao ... <b>RESPONDENTS</b>
    """
    story.append(Paragraph(memo_text, body_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceBefore=8, spaceAfter=12))

    # Document Heading
    subject_text = "<b><u>APPLICATION UNDER SECTION 438 OF THE CODE OF CRIMINAL PROCEDURE, 1973 (CORRESPONDING TO SECTION 482 OF BHARATIYA NAGARIK SURAKSHA SANHITA, 2023) FOR GRANT OF ANTICIPATORY BAIL IN FIR NO. 142/2026</u></b>"
    story.append(Paragraph(subject_text, subheading_style))

    # Pleading Paragraphs
    p1 = "<b>MOST RESPECTFULLY SHOWETH:</b>"
    story.append(Paragraph(p1, bold_body_style))

    p2 = "1. That the Applicant is a premier registered logistics provider operating across Maharashtra and Gujarat with exemplary statutory compliance and no criminal antecedents whatsoever. The Applicant employs over 350 personnel and maintains deep roots in society."
    story.append(Paragraph(p2, body_style))

    p3 = "2. That on <b>12th September 2026</b>, Respondent No. 2 maliciously lodged <b>FIR No. 142/2026</b> at Marine Lines Police Station under <b>Sections 420 and 406 of the Indian Penal Code, 1860</b> (corresponding to Sections 316 and 318 of the Bharatiya Nyaya Sanhita, 2023), alleging criminal breach of trust and cheating regarding delayed shipment of heavy engineering components valued at <b>Rs. 45,00,000/-</b> (Rupees Forty-Five Lakhs only)."
    story.append(Paragraph(p3, body_style))

    p4 = "3. That the entire transaction between the parties is governed by a formal Master Commercial Transportation Agreement dated <b>15th January 2026</b> containing a mandatory Dispute Resolution and Arbitration Clause. The alleged consignment delay arose purely due to unprecedented monsoon landslides on the Konkan corridor between <b>18th August 2026 and 28th August 2026</b>, constituting a recognized <i>Force Majeure</i> event under Clause 14 of the contract."
    story.append(Paragraph(p4, body_style))

    p5 = "4. That the Applicant had already refunded an interim mobilization advance of <b>Rs. 15,00,000/-</b> vide RTGS reference UTR-N26090142 on <b>2nd September 2026</b>, demonstrating genuine bona fide conduct and complete absence of fraudulent intention at the inception of the transaction."
    story.append(Paragraph(p5, body_style))

    p6 = "5. That the Investigating Officer, in flagrant violation of the mandatory binding directives issued by the Hon'ble Supreme Court in <b><i>Arnesh Kumar v. State of Bihar, (2014) 8 SCC 273</i></b>, failed to serve any statutory notice of appearance under <b>Section 41A of the Cr.P.C.</b> (Section 35(3) BNSS) prior to issuing arrest threats against the Applicant's executives."
    story.append(Paragraph(p6, body_style))

    p7 = "6. That as authoritatively held in <b><i>Satender Kumar Antil v. CBI, (2022) 10 SCC 51</i></b> and <b><i>State of Haryana v. Bhajan Lal, 1992 Supp (1) SCC 335</i></b>, criminal color cannot be foisted upon essentially civil and commercial contractual disputes. The ingredients of dishonest inducement under Section 420 IPC are wholly missing on the face of the FIR."
    story.append(Paragraph(p7, body_style))

    p8 = "7. That the Applicant undertakes to fully cooperate with the investigating agency, join investigation as and when summoned, and strictly abide by all conditions stipulated under <b>Section 438(2) of the Cr.P.C.</b> The Applicant undertakes not to tamper with any witness or documentary evidence."
    story.append(Paragraph(p8, body_style))

    # Prayer
    prayer_heading = "<b>PRAYER</b>"
    story.append(Spacer(1, 6))
    story.append(Paragraph(prayer_heading, bold_body_style))

    prayer_body = """
    Wherefore, in the light of the facts and circumstances stated hereinabove, the Applicant most respectfully prays that this Hon'ble Court may graciously be pleased to:<br/><br/>
    (a) Order that in the event of arrest of the Applicant or its Managing Director Shri Rajesh Singhania in connection with FIR No. 142/2026 registered at Marine Lines Police Station, Mumbai, they be immediately released on Anticipatory Bail upon furnishing suitable solvent sureties;<br/><br/>
    (b) Grant ad-interim transit protection from custodial harassment pending disposal of the present application;<br/><br/>
    (c) Pass such other or further order(s) as this Hon'ble Court may deem fit and proper in the interest of justice.
    """
    story.append(Paragraph(prayer_body, body_style))
    story.append(Spacer(1, 10))

    # Signatures
    sig_data = [
        [Paragraph("<b>ADVOCATE FOR THE APPLICANT</b><br/>Adv. Priya Sharma<br/>Enrollment No: MAH/4521/2021<br/>High Court & Sessions Court, Mumbai", body_style),
         Paragraph("<b>APPLICANT / DEPONENT</b><br/>For Singhania Logistics Pvt. Ltd.<br/>(Managing Director)<br/>Date: 25th September 2026", body_style)]
    ]
    t = Table(sig_data, colWidths=[270, 234])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(t)

    # Verification Affidavit
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#94a3b8'), spaceBefore=5, spaceAfter=8))
    story.append(Paragraph("<b><u>VERIFICATION AFFIDAVIT</u></b>", subheading_style))
    verif_text = "I, Rajesh Singhania, do hereby solemnly affirm and declare on oath that the contents of paragraphs 1 to 7 of the accompanying application are true and correct to the best of my knowledge and documentary records. Verified at Mumbai on this 25th day of September 2026."
    story.append(Paragraph(verif_text, body_style))

    doc.build(story)
    print(f"Created Bail Application PDF: {output_path}")


def create_commercial_notice_pdf(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    header_style = ParagraphStyle(
        'LawOfficeHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#0f172a')
    )

    sub_header_style = ParagraphStyle(
        'LawOfficeSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#475569')
    )

    body_style = ParagraphStyle(
        'LegalBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        alignment=TA_JUSTIFY,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=8
    )

    subject_style = ParagraphStyle(
        'NoticeSubject',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        alignment=TA_JUSTIFY,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=10
    )

    story = []

    # Letterhead
    story.append(Paragraph("CHAMBERS OF ADV. PRIYA SHARMA", header_style))
    story.append(Paragraph("Advocate, High Court of Bombay & City Civil Court<br/>Bar Council Enrollment No.: MAH/4521/2021<br/>Chambers: 402, Lawyers Chambers, High Court Annex, Fort, Mumbai - 400001", sub_header_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f172a'), spaceBefore=2, spaceAfter=12))

    # Dispatch details
    meta_text = """
    <b>SPEED POST WITH ACKNOWLEDGEMENT DUE / LEGAL NOTICE</b><br/>
    <b>Date:</b> 10th October 2026<br/><br/>
    <b>TO:</b><br/>
    <b>1. Horizon Global Ventures Ltd.</b><br/>
    Through its Managing Director Shri Sunil Agarwal<br/>
    Plot No. 88, Bandra-Kurla Complex (BKC), Bandra East, Mumbai - 400051<br/>
    """
    story.append(Paragraph(meta_text, body_style))
    story.append(Spacer(1, 6))

    # Subject
    subject = "<b>SUBJECT: STATUTORY LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 READ WITH SECTION 420 OF IPC (SECTION 318 BNS) REGARDING DISHONOUR OF CHEQUE NO. 884129 FOR RS. 28,50,000/-</b>"
    story.append(Paragraph(subject, subject_style))

    # Notice content
    content_p1 = "Sir / Madam,<br/><br/>Under instructions from, and on behalf of my client, <b>M/s Apex Infotech Solutions LLP</b>, having corporate office at Worli, Mumbai (hereinafter referred to as 'My Client'), I hereby serve upon you this formal statutory demand notice:"
    story.append(Paragraph(content_p1, body_style))

    content_p2 = "1. That in discharge of your legally enforceable debt and liability arising out of Enterprise Cloud Software Supply Agreement dated <b>20th February 2026</b>, you issued Cheque No. <b>884129</b> dated <b>15th September 2026</b> drawn on HDFC Bank, Fort Branch, Mumbai, for a sum of <b>Rs. 28,50,000/-</b> (Rupees Twenty-Eight Lakhs Fifty Thousand only) in favour of My Client."
    story.append(Paragraph(content_p2, body_style))

    content_p3 = "2. That My Client deposited the aforesaid cheque for realization through ICICI Bank, Worli Branch on <b>18th September 2026</b>. However, the said cheque was returned unpaid and dishonoured by your bank vide Return Memo dated <b>22nd September 2026</b> with the official endorsement: <b>'FUNDS INSUFFICIENT'</b>."
    story.append(Paragraph(content_p3, body_style))

    content_p4 = "3. That as per the binding doctrine affirmed by the Hon'ble Supreme Court in <b><i>K. Bhaskaran v. Sankaran Vaidhyan Balan, (1999) 7 SCC 510</i></b> and <b><i>Dashrath Rupsingh Rathod v. State of Maharashtra, (2014) 9 SCC 129</i></b>, the issuance of a cheque without maintaining sufficient funds constitutes an explicit statutory offence punishable with imprisonment up to 2 years and fine up to twice the cheque amount."
    story.append(Paragraph(content_p4, body_style))

    content_p5 = "<b>NOW THEREFORE</b>, I hereby call upon you to make the payment of the said amount of <b>Rs. 28,50,000/-</b> along with commercial interest @ 18% per annum within <b>15 (fifteen) days</b> of the receipt of this statutory notice, failing which My Client shall initiate criminal proceedings under Section 138 of the Negotiable Instruments Act, 1881, as well as a Commercial Summary Suit under Order XXXVII of the CPC for recovery, entirely at your risk, costs, and consequences."
    story.append(Paragraph(content_p5, body_style))
    story.append(Spacer(1, 15))

    # Advocate signature
    sig = """
    Yours faithfully,<br/><br/>
    <b>Adv. Priya Sharma</b><br/>
    Advocate for the Complainant<br/>
    Bar Council of Maharashtra & Goa (MAH/4521/2021)
    """
    story.append(Paragraph(sig, body_style))

    doc.build(story)
    print(f"Created Commercial Notice PDF: {output_path}")

if __name__ == "__main__":
    out_dir = r"C:\Users\Admin\LawLens\sample_documents"
    os.makedirs(out_dir, exist_ok=True)
    create_bail_application_pdf(os.path.join(out_dir, "Sample_Anticipatory_Bail_Petition_Singhania.pdf"))
    create_commercial_notice_pdf(os.path.join(out_dir, "Sample_Commercial_Notice_Section_138_NI_Act.pdf"))
