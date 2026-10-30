from database import engine
from sqlalchemy.orm import Session
import models
from services.dataset_service import seed_historical_dataset, find_matching_historical_cases
from services.doc_analyzer import analyze_single_document

with Session(engine) as db:
    seeded = seed_historical_dataset(db)
    print(f"Historical cases seeded: {seeded}")

    matches = find_matching_historical_cases(
        db,
        "Property dispute with unregistered power of attorney and earnest money forfeiture",
        "Civil"
    )
    print(f"Matched {len(matches)} historical cases:")
    for m in matches:
        print(f"  - {m['case_name']} [{m['citation']}]: {m['relevance_explanation']}")

    # Test single document analysis
    doc_res = analyze_single_document(
        db,
        "sample_pleading.pdf",
        "Petitioner claims failure to register sale deed under Section 54 Transfer of Property Act and forfeiture of earnest money deposit of Rs. 15,00,000 on 2024-03-15.",
        "Civil"
    )
    print("\nPer-document analysis generated successfully!")
    print("Doc Summary:", doc_res["doc_summary"][:120])
    print("Key Points extracted:", doc_res["key_points"][:120])
    print("Related past cases count in doc:", len(doc_res["related_past_cases"]))
