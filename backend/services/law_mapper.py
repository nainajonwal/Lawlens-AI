from typing import List, Dict, Any


STATUTORY_DATABASE = [
    {
        "category": "Criminal",
        "keywords": ["cheat", "fraud", "deceit", "dishonest", "property", "420", "misrepresentation"],
        "section": "Section 420 IPC / Section 318 BNS",
        "act": "Indian Penal Code / Bharatiya Nyaya Sanhita, 2023",
        "title": "Cheating and dishonestly inducing delivery of property",
        "description": "Punishes whoever cheats and thereby dishonestly induces the person deceived to deliver any property, punishable with imprisonment up to seven years and fine.",
        "compliance_notes": "Requires establishing dishonest intention from the very inception of the transaction, not merely a subsequent breach of contract."
    },
    {
        "category": "Criminal",
        "keywords": ["breach", "trust", "entrusted", "misappropriation", "406", "agent"],
        "section": "Section 406 IPC / Section 316 BNS",
        "act": "Indian Penal Code / Bharatiya Nyaya Sanhita, 2023",
        "title": "Criminal Breach of Trust",
        "description": "Whoever commits criminal breach of trust shall be punished with imprisonment up to three years, or fine, or both.",
        "compliance_notes": "Entrustment of property and fraudulent misappropriation or conversion to own use must be distinctly proved."
    },
    {
        "category": "Criminal",
        "keywords": ["forgery", "document", "electronic", "record", "false", "468", "signature"],
        "section": "Section 468 IPC / Section 338 BNS",
        "act": "Indian Penal Code / Bharatiya Nyaya Sanhita, 2023",
        "title": "Forgery for purpose of cheating",
        "description": "Addresses making a false document or electronic record with intent that it shall be used for cheating.",
        "compliance_notes": "Forensic handwriting or digital certificate authentication required under statutory rules."
    },
    {
        "category": "Criminal",
        "keywords": ["bail", "arrest", "custody", "investigation", "police", "437", "439", "482"],
        "section": "Section 482 CrPC / Section 528 BNSS",
        "act": "Code of Criminal Procedure / Bharatiya Nagarik Suraksha Sanhita, 2023",
        "title": "Inherent powers of High Court",
        "description": "Preserves High Court authority to prevent abuse of the process of any court and to secure the ends of justice.",
        "compliance_notes": "Invoked sparingly where allegations in the FIR/complaint do not disclose a cognizable offense on the face of it."
    },
    {
        "category": "Civil",
        "keywords": ["contract", "agreement", "breach", "damages", "consideration", "performance"],
        "section": "Section 73",
        "act": "Indian Contract Act, 1872",
        "title": "Compensation for loss or damage caused by breach of contract",
        "description": "Entitles the aggrieved party to receive compensation for loss or damage naturally arising in the usual course of things.",
        "compliance_notes": "Direct proximate loss must be substantiated; remote and indirect damages are not recoverable."
    },
    {
        "category": "Civil",
        "keywords": ["injunction", "specific performance", "relief", "stay", "restraint"],
        "section": "Section 38 & 39",
        "act": "Specific Relief Act, 1963",
        "title": "Perpetual Injunctions & Specific Performance",
        "description": "Governs judicial discretion to prevent breach of an obligation existing in favor of the applicant.",
        "compliance_notes": "Requires demonstrating prima facie case, balance of convenience, and irreparable injury."
    },
    {
        "category": "Civil",
        "keywords": ["property", "title", "possession", "mortgage", "lease", "sale"],
        "section": "Section 54",
        "act": "Transfer of Property Act, 1882",
        "title": "Sale of Immovable Property",
        "description": "Defines sale as a transfer of ownership in exchange for a price paid or promised. Requires registered instrument for value >= Rs 100.",
        "compliance_notes": "Verify registered sale deed and check encumbrance certificate across statutory limitation period."
    },
    {
        "category": "Commercial",
        "keywords": ["arbitration", "award", "dispute", "tribunal", "clause", "section 9", "section 11"],
        "section": "Section 9 & 11",
        "act": "Arbitration and Conciliation Act, 1996",
        "title": "Interim Measures & Appointment of Arbitrators",
        "description": "Empowers parties to seek interim preservation orders before the court prior to arbitral constitution.",
        "compliance_notes": "Requires valid written arbitration agreement clause satisfying Section 7 criteria."
    },
    {
        "category": "Constitutional",
        "keywords": ["fundamental", "right", "equality", "liberty", "writ", "habeas", "mandamus", "226", "32"],
        "section": "Article 226",
        "act": "Constitution of India, 1950",
        "title": "Power of High Courts to issue certain writs",
        "description": "Empowers High Courts throughout territories in relation to which they exercise jurisdiction to issue directions, orders or writs.",
        "compliance_notes": "Alternative efficacious statutory remedies must generally be exhausted unless fundamental right violation is apparent."
    },
    {
        "category": "Cyber",
        "keywords": ["computer", "data", "hacking", "unauthorized", "identity", "theft", "66"],
        "section": "Section 66 & 66C",
        "act": "Information Technology Act, 2000",
        "title": "Computer related offences & Identity Theft",
        "description": "Prescribes punishment with imprisonment up to three years and fine for fraudulent or dishonest use of electronic signatures, passwords, or identification.",
        "compliance_notes": "Digital evidence must comply with Certificate under Section 65B of Indian Evidence Act / Section 63 BSA."
    }
]


def map_applicable_laws(category: str, title: str, document_text: str) -> List[Dict[str, Any]]:
    """
    Scans the case context and extracts relevant statutory provisions with relevance scores.
    """
    corpus = f"{category} {title} {document_text}".lower()
    matched_laws = []

    for item in STATUTORY_DATABASE:
        score = 0.50
        # Category bonus
        if item["category"].lower() == category.lower():
            score += 0.25
        
        # Keyword matches
        matches = sum(1 for kw in item["keywords"] if kw in corpus)
        if matches > 0:
            score += min(0.24, matches * 0.06)

        if score >= 0.70 or item["category"].lower() == category.lower():
            matched_laws.append({
                "section": item["section"],
                "act": item["act"],
                "title": item["title"],
                "description": item["description"],
                "relevance_score": round(min(score, 0.98), 2),
                "compliance_notes": item["compliance_notes"]
            })

    # Return top matches sorted by relevance
    matched_laws.sort(key=lambda x: x["relevance_score"], reverse=True)
    return matched_laws[:5]
