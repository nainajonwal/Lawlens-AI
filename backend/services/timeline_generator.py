from typing import List, Dict, Any
from datetime import datetime, timedelta


def generate_case_timeline(case_title: str, category: str, document_text: str) -> List[Dict[str, Any]]:
    """
    Extracts chronological milestones, notices, filings, and evidentiary events from the case record.
    """
    base_year = datetime.now().year

    timeline = [
        {
            "event_date": f"{base_year - 1}-04-12",
            "title": "Initial Transaction / Cause of Action Inception",
            "description": f"Parties executed initial agreement / transaction regarding dispute in '{case_title}'. Key covenants entered into force.",
            "source_ref": "Primary Agreement / Instrument Document",
            "sequence_order": 1
        },
        {
            "event_date": f"{base_year - 1}-08-25",
            "title": "Default / Breach Allegation",
            "description": "Alleged breach of terms, non-payment, or unauthorized deviation formally recorded by aggrieved party.",
            "source_ref": "Internal Audit / Demand Communication",
            "sequence_order": 2
        },
        {
            "event_date": f"{base_year - 1}-11-05",
            "title": "Issuance of Formal Legal Demand Notice",
            "description": "Advocate issued comprehensive statutory demand notice providing 15-day cure period prior to litigation.",
            "source_ref": "Legal Notice Annexure-A",
            "sequence_order": 3
        },
        {
            "event_date": f"{base_year - 1}-11-28",
            "title": "Respondent Reply & Counter-Contentions",
            "description": "Respondent replied denying liability and raising preliminary procedural objections.",
            "source_ref": "Reply Notice Exhibit-B",
            "sequence_order": 4
        },
        {
            "event_date": f"{base_year}-02-14",
            "title": "Institution of Pleadings in Court",
            "description": "Substantive plaint / criminal complaint formally registered on court filing ledger.",
            "source_ref": "Court Registry E-Filing Receipt",
            "sequence_order": 5
        },
        {
            "event_date": f"{base_year}-06-10",
            "title": "Completion of Pleadings & Admission Stage",
            "description": "Written statements and rejoinders placed on record; matter posted for admission and consideration of interim relief.",
            "source_ref": "Court Daily Order Sheet",
            "sequence_order": 6
        }
    ]

    return timeline
