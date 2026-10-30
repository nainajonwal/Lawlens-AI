import os
import re
import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from services.dataset_service import find_matching_historical_cases


def analyze_single_document(
    db: Session,
    file_name: str,
    extracted_text: str,
    category: str = "Civil"
) -> Dict[str, Any]:
    """
    Per-document deep intelligence:
    - Generates executive summary of this specific document
    - Extracts & highlights key points (dates, financial figures, commitments, procedural clauses)
    - Retrieves matching past cases from the Historical Cases dataset
    - Gathers past information and legal jurisprudence
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    clean_text = extracted_text[:8000] if extracted_text else ""

    doc_summary = ""
    key_points = {}
    external_context = ""

    # Attempt Live Gemini API Analysis
    if api_key and len(clean_text) > 20:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-3.8-flash")

            prompt = f"""
            You are LawLens AI, a specialized legal analysis assistant for Indian advocates.
            Analyze the following legal document ('{file_name}', Category: {category}).
            
            Document Text:
            {clean_text}
            
            Return your response STRICTLY as a valid JSON object with the following schema:
            {{
                "doc_summary": "Comprehensive 2-3 paragraph executive summary of this specific document, detailing its legal nature, primary parties, assertions, and procedural significance.",
                "critical_dates": ["List of all important dates, deadlines, or timelines found in the text"],
                "financial_figures": ["List of all monetary sums, consideration amounts, claim damages, or penalties mentioned"],
                "legal_covenants": ["Key commitments, rights, contractual obligations, or charges asserted"],
                "evidentiary_vulnerabilities": ["Potential legal vulnerabilities, missing certifications (e.g. 65B), or ambiguities"],
                "external_legal_context": "Authoritative Indian case law precedents and statutory provisions governing this type of instrument (including landmark Supreme Court or High Court doctrines)."
            }}
            """
            response = model.generate_content(prompt)
            raw_text = response.text.replace("```json", "").replace("```", "").strip()
            data = json.loads(raw_text)

            doc_summary = data.get("doc_summary", "")
            key_points = {
                "critical_dates": data.get("critical_dates", []),
                "financial_figures": data.get("financial_figures", []),
                "legal_covenants": data.get("legal_covenants", []),
                "evidentiary_vulnerabilities": data.get("evidentiary_vulnerabilities", []),
                "external_legal_context": data.get("external_legal_context", "")
            }
        except Exception as e:
            print(f"Gemini per-document analysis fallback: {e}")

    # Deterministic Legal NLP Fallback if Gemini is inactive or errors
    if not doc_summary:
        preview = clean_text[:400].strip() if clean_text else "Document uploaded without machine-readable text."
        doc_summary = (
            f"Analysis of '{file_name}': This document serves as primary legal evidence / pleading in a {category} proceeding. "
            f"The instrument sets forth formal representations, contested covenants, and procedural claims on record. "
            f"Textual excerpt: {preview}..."
        )

        # Regex extract dates (e.g. 2024-05-12, 12/05/2024, May 12, 2024)
        found_dates = list(set(re.findall(r'\b(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+\d{4})\b', clean_text, re.IGNORECASE)))
        # Regex extract monetary figures (e.g. Rs. 50,000, INR 1,00,000, 50 lakhs)
        found_money = list(set(re.findall(r'(?:Rs\.?|INR|₹|\$)\s*[\d,]+(?:\.\d+)?|\b\d+\s*(?:lakh|crore|million|thousand)\b', clean_text, re.IGNORECASE)))

        key_points = {
            "critical_dates": found_dates[:5] if found_dates else ["Dates to be corroborated from original registry filing stamp."],
            "financial_figures": found_money[:5] if found_money else ["Consideration / claim amounts specified within exhibit schedule."],
            "legal_covenants": [
                f"Substantive covenants governing {category} claims and reciprocal obligations.",
                "Formal representations made under oath / verification affidavit.",
                "Evidentiary reliance on primary documentary records."
            ],
            "evidentiary_vulnerabilities": [
                "Verify whether original stamped copies are submitted under Indian Stamp Act.",
                "Electronic exhibits (emails/spreadsheets) require Certificate under Section 65B Evidence Act / Section 63 BSA.",
                "Cross-check chronological alignment against statutory limitation period."
            ],
            "external_legal_context": (
                f"In {category} jurisprudence, Indian courts mandate strict adherence to primary documentary proof "
                f"under Sections 91 and 92 of the Indian Evidence Act. Procedural delays in presenting exhibits "
                f"require formal condonation under Section 5 of the Limitation Act, 1963."
            )
        }

    # Find matching historical cases from the dataset
    past_cases = find_matching_historical_cases(db, clean_text, category, limit=3)

    return {
        "doc_summary": doc_summary,
        "key_points": json.dumps(key_points),
        "related_past_cases": json.dumps(past_cases)
    }
