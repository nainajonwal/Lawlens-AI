from typing import List, Dict, Any


INDIAN_PRECEDENTS_CORPUS = [
    {
        "category": "Criminal",
        "case_name": "Lalita Kumari v. Government of U.P.",
        "citation": "(2014) 2 SCC 1",
        "court": "Supreme Court of India",
        "year": 2014,
        "keywords": ["fir", "registration", "cognizable", "investigation", "mandatory", "police"],
        "relevant_ratio": "Held that registration of FIR is mandatory under Section 154 of the Code of Criminal Procedure if the information discloses commission of a cognizable offence.",
        "is_landmark": True
    },
    {
        "category": "Criminal",
        "case_name": "Arnesh Kumar v. State of Bihar",
        "citation": "(2014) 8 SCC 273",
        "court": "Supreme Court of India",
        "year": 2014,
        "keywords": ["arrest", "notice", "41a", "detention", "harassment", "dowry", "498a"],
        "relevant_ratio": "Mandated that police officers must not arrest accused unnecessarily without satisfying Section 41 CrPC notice requirements for offences punishable up to seven years.",
        "is_landmark": True
    },
    {
        "category": "Criminal",
        "case_name": "Satender Kumar Antil v. CBI",
        "citation": "(2022) 10 SCC 51",
        "court": "Supreme Court of India",
        "year": 2022,
        "keywords": ["bail", "guidelines", "undertrial", "custody", "liberty", "personal"],
        "relevant_ratio": "Comprehensive guidelines laid down streamlining bail jurisprudence, emphasizing that bail is the rule and jail is an exception, categorizing offences into distinct tiers.",
        "is_landmark": True
    },
    {
        "category": "Civil",
        "case_name": "Suraj Lamp & Industries Pvt. Ltd. v. State of Haryana",
        "citation": "(2012) 1 SCC 656",
        "court": "Supreme Court of India",
        "year": 2012,
        "keywords": ["power of attorney", "sale deed", "property", "gpa", "transfer", "title"],
        "relevant_ratio": "Held that General Power of Attorney (GPA) sales or sale agreements do not convey title and do not amount to transfer of immovable property; registered conveyance is compulsory.",
        "is_landmark": True
    },
    {
        "category": "Civil",
        "case_name": "Kailash Nath Associates v. Delhi Development Authority",
        "citation": "(2015) 4 SCC 136",
        "court": "Supreme Court of India",
        "year": 2015,
        "keywords": ["contract", "liquidated damages", "section 74", "forfeiture", "earnest money"],
        "relevant_ratio": "Held that Section 74 of the Contract Act requires proof of actual loss before damages or forfeiture of earnest money can be awarded, unless calculating loss is impossible.",
        "is_landmark": True
    },
    {
        "category": "Commercial",
        "case_name": "Vidya Drolia and Others v. Durga Trading Corporation",
        "citation": "(2021) 2 SCC 1",
        "court": "Supreme Court of India",
        "year": 2021,
        "keywords": ["arbitration", "arbitrability", "landlord", "tenant", "section 8", "section 11"],
        "relevant_ratio": "Four-fold test established to determine non-arbitrability of disputes; clarified landlord-tenant disputes governed by Transfer of Property Act are arbitrable unless covered by rent control statutes.",
        "is_landmark": True
    },
    {
        "category": "Constitutional",
        "case_name": "Justice K.S. Puttaswamy (Retd.) v. Union of India",
        "citation": "(2017) 10 SCC 1",
        "court": "Supreme Court of India",
        "year": 2017,
        "keywords": ["privacy", "fundamental right", "article 21", "data", "surveillance", "dignity"],
        "relevant_ratio": "Unanimously affirmed that the Right to Privacy is a fundamental right protected under Article 21 and Part III of the Constitution of India subject to proportionality and legitimate state aim.",
        "is_landmark": True
    },
    {
        "category": "Cyber",
        "case_name": "Shreya Singhal v. Union of India",
        "citation": "(2015) 5 SCC 1",
        "court": "Supreme Court of India",
        "year": 2015,
        "keywords": ["section 66a", "it act", "free speech", "social media", "unconstitutional", "internet"],
        "relevant_ratio": "Struck down Section 66A of the Information Technology Act as unconstitutional for violating the freedom of speech and expression guaranteed under Article 19(1)(a).",
        "is_landmark": True
    },
    {
        "category": "Cyber",
        "case_name": "Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal",
        "citation": "(2020) 7 SCC 1",
        "court": "Supreme Court of India",
        "year": 2020,
        "keywords": ["65b", "certificate", "electronic evidence", "call records", "admissibility"],
        "relevant_ratio": "Clarified that obtaining a Certificate under Section 65B(4) of the Evidence Act is a mandatory condition precedent to the admissibility of electronic records in court.",
        "is_landmark": True
    }
]


def retrieve_precedents(category: str, title: str, document_text: str) -> List[Dict[str, Any]]:
    """
    Ranks precedents from the Indian judicial corpus based on case category, keyword overlap,
    and factual relevance to provide authoritative citation grounding.
    """
    corpus = f"{category} {title} {document_text}".lower()
    ranked = []

    for prec in INDIAN_PRECEDENTS_CORPUS:
        score = 0.55
        if prec["category"].lower() == category.lower():
            score += 0.25

        matches = sum(1 for kw in prec["keywords"] if kw in corpus)
        score += min(0.18, matches * 0.05)

        ranked.append({
            "case_name": prec["case_name"],
            "citation": prec["citation"],
            "court": prec["court"],
            "year": prec["year"],
            "relevant_ratio": prec["relevant_ratio"],
            "similarity_score": round(min(score, 0.96), 2),
            "is_landmark": prec["is_landmark"]
        })

    ranked.sort(key=lambda x: x["similarity_score"], reverse=True)
    return ranked[:4]
