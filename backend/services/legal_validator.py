import re
from typing import Tuple, Dict, Any

# Domain taxonomy for Indian and Common Law legal documentation
LEGAL_TAXONOMY = {
    "courts_and_forums": [
        "court", "supreme court", "high court", "district court", "sessions court",
        "magistrate", "tribunal", "bench", "coram", "nclt", "nclat", "drt",
        "arbitral tribunal", "family court", "consumer forum", "judiciary",
        "in the court of", "hon'ble", "honourable"
    ],
    "parties_and_pleadings": [
        "petitioner", "respondent", "plaintiff", "defendant", "appellant",
        "accused", "complainant", "applicant", "affidavit", "writ petition",
        "special leave petition", "suit", "plaint", "written statement",
        "rejoinder", "vakalatnama", "cause title", "memo of parties",
        "versus", "vs.", " v ", "advocate", "counsel", "learned counsel",
        "in the matter of", "deponent", "solemnly affirm"
    ],
    "statutes_and_codes": [
        "section", "sec.", "act", "statute", "constitution of india", "article",
        "code of criminal procedure", "crpc", "civil procedure code", "cpc",
        "indian penal code", "ipc", "bharatiya nyaya sanhita", "bns",
        "bharatiya nagarik suraksha sanhita", "bnss", "bharatiya sakshya adhiniyam",
        "bsa", "evidence act", "contract act", "transfer of property",
        "arbitration and conciliation", "specific relief", "limitation act",
        "negotiable instruments", "ni act", "fir", "order", "sub-section"
    ],
    "contracts_and_commercial": [
        "agreement", "contract", "party of the first part", "party of the second part",
        "witnesseth", "covenants", "indemnity", "arbitration clause",
        "jurisdiction clause", "breach of contract", "consideration",
        "parties hereto", "in witness whereof", "terms and conditions",
        "recitals", "whereas", "force majeure", "severability", "registered deed",
        "power of attorney", "lease deed", "mortgage"
    ],
    "notices_and_proceedings": [
        "legal notice", "demand notice", "without prejudice", "reply to notice",
        "cheque bounce", "section 138", "bail application", "anticipatory bail",
        "interim relief", "ad-interim", "injunction", "stay order",
        "show cause notice", "contempt of court", "cognizable offence",
        "charge sheet", "summons", "warrant", "sub judice"
    ]
}

# Strong definitive single markers that instantly indicate a legal instrument
DEFINITIVE_LEGAL_MARKERS = [
    "vakalatnama", "writ petition", "in the high court of", "in the supreme court of",
    "in the court of", "plaintiff versus", "petitioner vs", "appellant versus",
    "affidavit of", "solemnly affirm and state", "agreement to sell",
    "lease agreement", "general power of attorney", "under section 138",
    "under section 154", "under section 482", "under article 226", "under article 32"
]


def validate_legal_document(text: str, filename: str = "") -> Tuple[bool, str, Dict[str, Any]]:
    """
    Inspects extracted text to verify if the file is an authentic legal document.
    Returns:
        (is_legal: bool, message: str, metadata: dict)
    """
    if not text or len(text.strip()) < 35:
        return (
            False,
            "The uploaded file appears to be empty, unreadable, or contains no extractable text. Please ensure you upload a valid legal document.",
            {"length": len(text or ""), "categories_matched": 0}
        )

    text_lower = text.lower()

    # Check for definitive legal instrument markers
    for marker in DEFINITIVE_LEGAL_MARKERS:
        if marker in text_lower:
            return (
                True,
                f"Verified legal document (matched definitive legal marker: '{marker}').",
                {"definitive_marker": marker, "confidence": "high"}
            )

    matched_categories = {}
    total_matches = 0

    for cat_name, terms in LEGAL_TAXONOMY.items():
        found = []
        for term in terms:
            # Word boundary matching or literal check
            if re.search(r'\b' + re.escape(term) + r'\b', text_lower):
                found.append(term)
        if found:
            matched_categories[cat_name] = found
            total_matches += len(found)

    categories_count = len(matched_categories)

    # Legitimate legal documents span at least 2 distinct legal categories
    # (e.g. Parties + Courts, Statutes + Pleadings, Contracts + Covenants)
    # OR have high legal keyword frequency (>= 4 matches)
    if categories_count >= 2 or total_matches >= 4:
        return (
            True,
            f"Verified legal document (matches {categories_count} legal categories with {total_matches} legal citations/terms).",
            {
                "categories_count": categories_count,
                "total_matches": total_matches,
                "matched_categories": list(matched_categories.keys())
            }
        )

    # Rejection: File lacks legal grounding
    return (
        False,
        "The uploaded file does not appear to be a legal document. It lacks recognized court headings, case pleadings, statutory provisions, contracts, or legal notices. LawLens is restricted exclusively to legal documents.",
        {
            "categories_count": categories_count,
            "total_matches": total_matches,
            "matched_categories": list(matched_categories.keys())
        }
    )
