from sqlalchemy import text
from database import engine, Base
import models

# 1. Create any missing tables (like HistoricalCases)
Base.metadata.create_all(bind=engine)

# 2. Alter existing tables if columns missing
with engine.connect() as conn:
    doc_cols = [c[0].lower() for c in conn.execute(text("DESCRIBE CaseDocuments")).fetchall()]
    if "doc_summary" not in doc_cols:
        conn.execute(text("ALTER TABLE CaseDocuments ADD COLUMN doc_summary TEXT NULL"))
        print("Added 'doc_summary' column to CaseDocuments")
    if "key_points" not in doc_cols:
        conn.execute(text("ALTER TABLE CaseDocuments ADD COLUMN key_points TEXT NULL"))
        print("Added 'key_points' column to CaseDocuments")
    if "related_past_cases" not in doc_cols:
        conn.execute(text("ALTER TABLE CaseDocuments ADD COLUMN related_past_cases TEXT NULL"))
        print("Added 'related_past_cases' column to CaseDocuments")
    if "analysis_status" not in doc_cols:
        conn.execute(text("ALTER TABLE CaseDocuments ADD COLUMN analysis_status VARCHAR(50) DEFAULT 'pending'"))
        print("Added 'analysis_status' column to CaseDocuments")

    conn.commit()
    print("Database schema successfully upgraded!")
