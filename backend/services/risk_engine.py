from typing import Dict, Any, List


def calculate_explainable_risk(
    category: str,
    contradictions_count: int,
    documents_count: int,
    has_filing_number: bool,
    has_hearing_date: bool,
    past_cases_benchmark: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Computes an EXPLAINABLE, multi-factor legal vulnerability & risk score (0-100)
    calibrated against Indian historical case law and procedural benchmarks.
    
    CRITICAL ETHICAL CONSTRAINT:
    - This model NEVER predicts win/loss outcomes or judicial decisions.
    - It highlights operational, procedural, evidentiary, and statutory vulnerabilities.
    
    Formula:
    Risk = 0.30 * Contradictions + 0.25 * Procedural + 0.25 * Limitation/Timeline + 0.10 * DocumentGaps + 0.10 * DatasetBenchmark
    """
    # 1. Contradictions sub-score (0 - 100)
    c_score = min(100.0, contradictions_count * 28.0)

    # 2. Procedural compliance sub-score (0 - 100)
    p_score = 25.0
    if not has_filing_number:
        p_score += 35.0  # Unregistered / defective filing risk
    if category.lower() == "criminal":
        p_score += 15.0  # Heightened statutory rigor under CrPC/BNSS

    # 3. Limitation & Timeline urgency sub-score (0 - 100)
    l_score = 40.0
    if has_hearing_date:
        l_score += 20.0  # Imminent judicial scrutiny

    # 4. Document Completeness & Evidentiary Gap sub-score (0 - 100)
    if documents_count == 0:
        d_score = 90.0
    elif documents_count == 1:
        d_score = 55.0  # Single document risks lack of corroboration
    elif documents_count == 2:
        d_score = 30.0
    else:
        d_score = 15.0  # Robust multi-document dossier

    # 5. Historical Dataset Precedent Benchmark sub-score (0 - 100)
    dataset_risk_notes = []
    b_score = 30.0
    if past_cases_benchmark:
        for past in past_cases_benchmark[:2]:
            pitfall = past.get("procedural_pitfalls") or past.get("risk_factors")
            if pitfall:
                b_score += 15.0
                dataset_risk_notes.append(
                    f"Dataset Precedent Alert: Similar to historical case '{past.get('case_name')}' ({past.get('citation')}) - Key procedural pitfall: {pitfall[:150]}"
                )
    b_score = min(100.0, b_score)

    # Weighted Overall Score
    overall_score = round(
        (0.30 * c_score) +
        (0.25 * p_score) +
        (0.25 * l_score) +
        (0.10 * d_score) +
        (0.10 * b_score),
        1
    )

    # Determine risk category
    if overall_score >= 75.0:
        risk_level = "Critical"
    elif overall_score >= 50.0:
        risk_level = "High"
    elif overall_score >= 30.0:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    # Specific actionable vulnerabilities
    vulnerabilities = [
        f"Evidentiary Vulnerability: {contradictions_count} conflicting statements detected across exhibits that may be targeted during cross-examination.",
        "Statutory Limitation Risk: Strict limitation periods apply; delay condonation applications must be backed by day-to-day sufficient cause affidavits.",
        "Corroboration Gap: " + ("Critical evidentiary records missing from filing docket." if documents_count < 2 else "Primary exhibits on record; supplementary rejoinder exhibits recommended."),
        "Procedural Scrutiny: Section 65B Indian Evidence Act / Section 63 BSA certificate required for any electronic or email evidence."
    ]
    if dataset_risk_notes:
        vulnerabilities.extend(dataset_risk_notes)

    # Concrete mitigation steps for the lawyer
    mitigation_strategy = (
        "1. File an explanatory clarificatory affidavit addressing factual variance prior to cross-examination.\n"
        "2. Ensure original certified copies of primary instruments are produced during admission stage.\n"
        "3. Procure requisite Section 65B / 63 BSA electronic evidence certificate for bank logs and email transcripts.\n"
        "4. Prepare a consolidated synopsis highlighting that contradictions are immaterial to the core statutory relief sought."
    )

    return {
        "overall_score": overall_score,
        "risk_level": risk_level,
        "contradictions_score": round(c_score, 1),
        "procedural_score": round(p_score, 1),
        "limitation_score": round(l_score, 1),
        "document_gap_score": round(d_score, 1),
        "vulnerabilities": "\n".join(vulnerabilities),
        "mitigation_strategy": mitigation_strategy
    }
