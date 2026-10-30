from typing import Dict, Any
from datetime import datetime, timedelta


def calculate_case_priority(
    case_title: str,
    category: str,
    risk_score: float,
    next_hearing_date: str = None
) -> Dict[str, Any]:
    """
    Computes priority and triage ranking based on hearing proximity,
    statutory limitation windows, and case vulnerability scores.
    """
    days_remaining = 14  # Default sensible statutory notice window

    if next_hearing_date:
        try:
            target = datetime.strptime(next_hearing_date.strip(), "%Y-%m-%d")
            delta = (target - datetime.now()).days
            days_remaining = max(1, delta)
        except Exception:
            days_remaining = 14

    # Calculate urgency score
    # Closer hearings and higher risk score yield higher urgency
    time_urgency = max(0.0, 100.0 - (days_remaining * 2.5))
    urgency_score = round((0.60 * time_urgency) + (0.40 * risk_score), 1)
    urgency_score = min(100.0, max(10.0, urgency_score))

    if urgency_score >= 80.0:
        priority_level = "Urgent"
    elif urgency_score >= 60.0:
        priority_level = "High"
    elif urgency_score >= 40.0:
        priority_level = "Normal"
    else:
        priority_level = "Low"

    limitation_deadline = (datetime.now() + timedelta(days=days_remaining)).strftime("%Y-%m-%d")

    rationale = (
        f"Case priority rated '{priority_level}' (Urgency Index: {urgency_score}/100). "
        f"Key judicial listing/deadline scheduled in {days_remaining} days ({limitation_deadline}). "
        f"Composite vulnerability score of {risk_score}/100 necessitates prompt filing of rejoinder/affidavit."
    )

    return {
        "urgency_score": urgency_score,
        "priority_level": priority_level,
        "limitation_deadline": limitation_deadline,
        "days_remaining": days_remaining,
        "rationale": rationale
    }
