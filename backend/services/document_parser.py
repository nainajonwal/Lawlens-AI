import os
from typing import Tuple
from pypdf import PdfReader
from docx import Document


def extract_text_from_file(file_path: str, file_type: str) -> Tuple[str, int]:
    """
    Extracts text and page/paragraph count from PDF or DOCX file.
    Returns: (extracted_text, count)
    """
    if not os.path.exists(file_path):
        return "", 0

    extracted_text = ""
    unit_count = 0
    file_type = file_type.lower().replace(".", "")

    try:
        if file_type == "pdf":
            reader = PdfReader(file_path)
            unit_count = len(reader.pages)
            pages_text = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    pages_text.append(f"--- [Page {i + 1}] ---\n{text.strip()}")
            extracted_text = "\n\n".join(pages_text)

        elif file_type in ["docx", "doc"]:
            doc = Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            unit_count = len(paragraphs)
            extracted_text = "\n\n".join(paragraphs)

        else:
            # Plain text fallback
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                extracted_text = f.read()
                unit_count = 1

    except Exception as e:
        extracted_text = f"[Error during document parsing: {str(e)}]"
        unit_count = 0

    return extracted_text.strip(), unit_count
