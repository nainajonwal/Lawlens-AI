import os
import csv
import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
import models

# Foundational Indian Landmark Case Benchmark Corpus
BASELINE_INDIAN_CASES = [
    {
        "case_name": "Lalita Kumari v. Government of U.P.",
        "citation": "(2014) 2 SCC 1",
        "court": "Supreme Court of India",
        "year": 2014,
        "category": "Criminal",
        "facts_summary": "Pertains to registration of First Information Report (FIR) upon receiving complaints disclosing cognizable offenses versus conducting preliminary inquiry.",
        "key_issues": "Whether police officers are bound to register FIR immediately under Section 154 CrPC without conducting preliminary inquiry.",
        "risk_factors": "Police refusal to register FIR; unjustified preliminary delay exceeding permissible 7-day inquiry threshold.",
        "procedural_pitfalls": "Failing to promptly lodge FIR; delay in reporting without plausible justification leads to adverse evidentiary inferences.",
        "legal_ratio": "Registration of FIR is mandatory under Section 154 CrPC if information discloses commission of cognizable offence. Preliminary inquiry permitted only in restricted categories.",
        "source_dataset": "Indian Supreme Court Landmark Benchmark"
    },
    {
        "case_name": "Arnesh Kumar v. State of Bihar",
        "citation": "(2014) 8 SCC 273",
        "court": "Supreme Court of India",
        "year": 2014,
        "category": "Criminal",
        "facts_summary": "Unchecked arrests made by police in matrimonial disputes and offenses punishable up to seven years without following Section 41 CrPC notice mandates.",
        "key_issues": "Arbitrary exercise of police powers to arrest without recording objective satisfaction.",
        "risk_factors": "Unlawful detention without Section 41A CrPC notice; lack of recorded Magistrate authorization.",
        "procedural_pitfalls": "Non-compliance with checklist under Section 41(1)(b)(ii) CrPC before authorizing arrest.",
        "legal_ratio": "Mandated that police officers shall not automatically arrest accused for offenses punishable with imprisonment up to 7 years without serving Section 41A notice.",
        "source_dataset": "Indian Supreme Court Landmark Benchmark"
    },
    {
        "case_name": "Vidya Drolia v. Durga Trading Corporation",
        "citation": "(2021) 2 SCC 1",
        "court": "Supreme Court of India",
        "year": 2021,
        "category": "Commercial",
        "facts_summary": "Landlord-tenant dispute where tenancy agreement contained an arbitration clause; objection raised regarding non-arbitrability.",
        "key_issues": "Whether tenancy disputes governed by the Transfer of Property Act are arbitrable under Arbitration and Conciliation Act, 1996.",
        "risk_factors": "Jurisdictional defect if matter falls within exclusive statutory rent control court.",
        "procedural_pitfalls": "Invoking Section 11 arbitration without determining whether dispute is barred under special rent legislation.",
        "legal_ratio": "Four-fold test established for arbitrability. Landlord-tenant disputes under Transfer of Property Act are arbitrable unless governed by specific state Rent Control statutes.",
        "source_dataset": "Indian Supreme Court Landmark Benchmark"
    },
    {
        "case_name": "Kailash Nath Associates v. Delhi Development Authority",
        "citation": "(2015) 4 SCC 136",
        "court": "Supreme Court of India",
        "year": 2015,
        "category": "Civil",
        "facts_summary": "Forfeiture of earnest money deposit of earnest bidder following recessionary real estate market and extension of payment dates.",
        "key_issues": "Whether earnest money can be forfeited under Section 74 of Indian Contract Act without proving actual financial loss.",
        "risk_factors": "Unsubstantiated forfeiture; unilateral penalty clauses lacking evidence of actual damage suffered.",
        "procedural_pitfalls": "Claiming liquidated damages without demonstrating reasonable efforts to mitigate losses.",
        "legal_ratio": "Section 74 requires proof of actual loss or damage before forfeiture or compensation is awarded, unless calculating damages is virtually impossible.",
        "source_dataset": "Indian Supreme Court Landmark Benchmark"
    },
    {
        "case_name": "Suraj Lamp & Industries Pvt. Ltd. v. State of Haryana",
        "citation": "(2012) 1 SCC 656",
        "court": "Supreme Court of India",
        "year": 2012,
        "category": "Civil",
        "facts_summary": "Sale of real estate through General Power of Attorney (GPA), Agreement to Sell, and Will transfer instruments bypassing registered conveyance deeds.",
        "key_issues": "Whether GPA / SA / Will transactions transfer valid legal title under Transfer of Property Act and Registration Act.",
        "risk_factors": "Defective title; unenforceable property claims without registered sale deed.",
        "procedural_pitfalls": "Relying on unregistered power of attorney to establish ownership; fatal under Section 54 Transfer of Property Act.",
        "legal_ratio": "Immovable property can legally be transferred/conveyed only by a registered deed of conveyance. GPA sales do not confer title.",
        "source_dataset": "Indian Supreme Court Landmark Benchmark"
    },
    {
        "case_name": "Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal",
        "citation": "(2020) 7 SCC 1",
        "court": "Supreme Court of India",
        "year": 2020,
        "category": "Cyber",
        "facts_summary": "Election petition involving call detail records and video camera footage produced without Section 65B(4) Evidence Act certificate.",
        "key_issues": "Mandatory versus optional nature of certificate under Section 65B(4) for admissibility of electronic records.",
        "risk_factors": "Inadmissibility of electronic exhibits (emails, WhatsApp chats, server logs) lacking certificate.",
        "procedural_pitfalls": "Failing to obtain 65B Evidence Act certificate contemporaneously from the person in lawful custody of the device.",
        "legal_ratio": "Production of Section 65B(4) certificate is a mandatory condition precedent for the admissibility of electronic evidence in court.",
        "source_dataset": "Indian Supreme Court Landmark Benchmark"
    },
    {
        "case_name": "Satender Kumar Antil v. CBI",
        "citation": "(2022) 10 SCC 51",
        "court": "Supreme Court of India",
        "year": 2022,
        "category": "Criminal",
        "facts_summary": "Prolonged undertrial detention and arbitrary denials of bail across trial courts without considering gravity tiers.",
        "key_issues": "Standardized criteria for granting bail without automatic remand upon filing of charge sheet.",
        "risk_factors": "Remand to judicial custody without evaluating accused compliance with investigation summons.",
        "procedural_pitfalls": "Automatic opposition to bail without substantiating flight risk, tampering of evidence, or witness intimidation.",
        "legal_ratio": "Bail is the rule and jail is the exception. Laid down categorised guidelines for bail based on offence gravity.",
        "source_dataset": "Indian Supreme Court Landmark Benchmark"
    }
]


def seed_historical_dataset(db: Session) -> int:
    """Populates baseline dataset if table is empty."""
    count = db.query(models.HistoricalCase).count()
    if count > 0:
        return count

    for item in BASELINE_INDIAN_CASES:
        db.add(models.HistoricalCase(**item))
    db.commit()
    return len(BASELINE_INDIAN_CASES)


def ingest_csv_dataset(db: Session, file_path: str) -> int:
    """Ingests past cases from a user-uploaded CSV file."""
    if not os.path.exists(file_path):
        return 0

    added_count = 0
    with open(file_path, mode="r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        for row in reader:
            case_name = row.get("case_name") or row.get("title") or row.get("Case")
            if not case_name:
                continue

            record = models.HistoricalCase(
                case_name=case_name.strip(),
                citation=(row.get("citation") or row.get("Citation") or "").strip(),
                court=(row.get("court") or row.get("Court") or "High Court / Supreme Court").strip(),
                year=int(row.get("year")) if (row.get("year") and str(row.get("year")).isdigit()) else None,
                category=(row.get("category") or row.get("Category") or "Civil").strip(),
                facts_summary=(row.get("facts_summary") or row.get("facts") or row.get("Summary") or "").strip(),
                key_issues=(row.get("key_issues") or row.get("issues") or "").strip(),
                risk_factors=(row.get("risk_factors") or row.get("risks") or "").strip(),
                procedural_pitfalls=(row.get("procedural_pitfalls") or row.get("pitfalls") or "").strip(),
                legal_ratio=(row.get("legal_ratio") or row.get("ratio") or "").strip(),
                source_dataset="User Uploaded Dataset"
            )
            db.add(record)
            added_count += 1

    db.commit()
    return added_count


def ingest_json_dataset(db: Session, file_path: str) -> int:
    """Ingests past cases from a user-uploaded JSON file."""
    if not os.path.exists(file_path):
        return 0

    added_count = 0
    with open(file_path, mode="r", encoding="utf-8", errors="ignore") as f:
        data = json.load(f)
        items = data if isinstance(data, list) else data.get("cases", [])
        for row in items:
            case_name = row.get("case_name") or row.get("title")
            if not case_name:
                continue

            record = models.HistoricalCase(
                case_name=case_name.strip(),
                citation=row.get("citation", ""),
                court=row.get("court", "Supreme Court of India"),
                year=row.get("year"),
                category=row.get("category", "Civil"),
                facts_summary=row.get("facts_summary", row.get("facts", "")),
                key_issues=row.get("key_issues", ""),
                risk_factors=row.get("risk_factors", ""),
                procedural_pitfalls=row.get("procedural_pitfalls", ""),
                legal_ratio=row.get("legal_ratio", row.get("ratio", "")),
                source_dataset="User Uploaded Dataset"
            )
            db.add(record)
            added_count += 1

    db.commit()
    return added_count


def find_matching_historical_cases(db: Session, text: str, category: str, limit: int = 3) -> List[Dict[str, Any]]:
    """
    Matches an uploaded document or case against the historical database,
    identifying relevant precedents, procedural pitfalls, and legal ratios.
    """
    seed_historical_dataset(db)

    cases = db.query(models.HistoricalCase).all()
    if not cases:
        return []

    text_lower = text.lower()
    cat_lower = category.lower() if category else ""

    scored_cases = []
    for c in cases:
        score = 0.40
        # Category alignment
        if c.category and c.category.lower() in cat_lower:
            score += 0.25

        # Check key terms
        keywords = (f"{c.case_name} {c.key_issues} {c.procedural_pitfalls} {c.legal_ratio}").lower().split()
        matches = 0
        for kw in set(keywords):
            if len(kw) > 4 and kw in text_lower:
                matches += 1

        score += min(0.30, matches * 0.05)

        explanation = f"Matched on {c.category} jurisprudence."
        if c.procedural_pitfalls:
            explanation += f" Precedent cautions on: {c.procedural_pitfalls[:120]}..."

        scored_cases.append({
            "historical_id": c.historical_id,
            "case_name": c.case_name,
            "citation": c.citation or "Citation on record",
            "court": c.court,
            "year": c.year,
            "category": c.category,
            "legal_ratio": c.legal_ratio or "Key ratio on record",
            "procedural_pitfalls": c.procedural_pitfalls or "Standard statutory compliance required",
            "relevance_score": round(min(score, 0.96), 2),
            "relevance_explanation": explanation
        })

    scored_cases.sort(key=lambda x: x["relevance_score"], reverse=True)
    return scored_cases[:limit]
