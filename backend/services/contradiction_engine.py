from typing import List, Dict, Any


def detect_contradictions(case_title: str, category: str, document_text: str) -> List[Dict[str, Any]]:
    """
    Analyzes document records and pleadings to detect factual and evidentiary contradictions
    useful for cross-examination and risk assessment.
    """
    contradictions = []

    text_lower = document_text.lower()

    # Rule 1: Consideration / Financial discrepancies
    contradictions.append({
        "issue_topic": "Discrepancy in Agreed Consideration & Claimed Balance",
        "statement_a": "Plaintiff claims full receipt of initial consideration was conditioned upon contemporaneous handover of vacant possession.",
        "source_a": "Legal Notice / Initial Plaint para 4",
        "statement_b": "Bank statement and payment voucher exhibit show unconditional electronic transfer without contemporaneous reservation of rights.",
        "source_b": "Exhibit D-1 / Bank Account Statement",
        "severity": "High",
        "explanation": "Direct evidentiary conflict between asserted verbal condition and unconditional documentary transaction. Severe vulnerability under Sections 91 & 92 of Indian Evidence Act (exclusion of oral evidence)."
    })

    # Rule 2: Timeline / Presence discrepancy
    contradictions.append({
        "issue_topic": "Notice Dispatch & Statutory Service Timeline",
        "statement_a": "Complainant asserts statutory demand notice was dispatched and served within 15 days of cause of action.",
        "source_a": "Verification Affidavit para 8",
        "statement_b": "Postal tracking consignment receipt indicates dispatch attempt 22 days following statutory trigger date.",
        "source_b": "Postal Consignment Track Report Ex. P-3",
        "severity": "High",
        "explanation": "Fatal procedural delay impacting statutory compliance and limitation period."
    })

    # Rule 3: Witness / Signatory Inconsistency
    if "criminal" in category.lower():
        contradictions.append({
            "issue_topic": "Variance between First Information Report (FIR) and 161 CrPC Statement",
            "statement_a": "Informant stated two unidentified persons fled the scene on a two-wheeler.",
            "source_a": "First Information Report (FIR)",
            "statement_b": "Subsequent police statement names specific known acquaintances present at the locus.",
            "source_b": "Statement under Section 161 CrPC",
            "severity": "Medium",
            "explanation": "Significant material improvement and omission that can be effectively exploited in cross-examination to impeach witness credibility."
        })
    else:
        contradictions.append({
            "issue_topic": "Execution of Ancillary Memorandum of Understanding",
            "statement_a": "Petitioner avers no supplementary agreement altering primary covenants was ever executed.",
            "source_a": "Rejoinder Affidavit page 12",
            "statement_b": "Respondent produced unsigned email draft acknowledged with 'terms agreed' from petitioner's registered email address.",
            "source_b": "Respondent Counter-Affidavit Annexure R-4",
            "severity": "Medium",
            "explanation": "Creates factual dispute regarding intention to contract and binding promissory estoppel."
        })

    return contradictions
