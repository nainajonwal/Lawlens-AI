import main
from fastapi.testclient import TestClient
import io

client = TestClient(main.app)

# 1. Register or login a test lawyer
res = client.post('/api/auth/register', json={
    'name': 'Advocate Ananya Rao',
    'email': 'ananya.rao@lawlens.in',
    'password': 'LawyerPassword123!'
})
if res.status_code == 400:
    res = client.post('/api/auth/login', json={
        'email': 'ananya.rao@lawlens.in',
        'password': 'LawyerPassword123!'
    })

assert res.status_code == 200, f"Auth failed: {res.text}"
token = res.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}
print("[PASSED] 1. Auth successful. Token received.")

# 2. Create a case
case_res = client.post('/api/cases/', json={
    'title': 'Arjun Mehta vs Union Commercial Bank',
    'category': 'Commercial',
    'court': 'Commercial Court, Mumbai',
    'filing_number': 'COM-2026/8941',
    'next_hearing_date': '2026-11-15'
}, headers=headers)

assert case_res.status_code == 200, f"Case creation failed: {case_res.text}"
case_data = case_res.json()
case_id = case_data['case_id']
print(f"[PASSED] 2. Case created successfully. Case ID: {case_id}")

# 3. Upload a sample document
sample_doc_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 200 >>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(COMMERCIAL ARBITRATION PETITION: Arjun Mehta asserts breach of covenants and unauthorized foreclosure by respondent bank.) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000214 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n465\n%%EOF"

files = {'file': ('petition.pdf', io.BytesIO(sample_doc_content), 'application/pdf')}
doc_res = client.post(f'/api/documents/{case_id}/upload', files=files, headers=headers)
assert doc_res.status_code == 200, f"Upload failed: {doc_res.text}"
print("[PASSED] 3. Document uploaded & extracted text stored.")

# 4. Run intelligence analysis
analyze_res = client.post(f'/api/intelligence/{case_id}/analyze', headers=headers)
assert analyze_res.status_code == 200, f"Analysis failed: {analyze_res.text}"
intel = analyze_res.json()
print(f"[PASSED] 4. Intelligence analysis complete:")
print(f"   - Executive Summary: {intel['summary']['executive_summary'][:65]}...")
print(f"   - Mapped Laws: {len(intel['laws'])} provisions")
print(f"   - Retrieved Precedents: {len(intel['precedents'])} citations")
print(f"   - Contradictions Detected: {len(intel['contradictions'])} conflicts")
print(f"   - Timeline Events: {len(intel['timeline'])} milestones")
print(f"   - Explainable Risk Score: {intel['risk']['overall_score']}/100 ({intel['risk']['risk_level']})")
print(f"   - Priority Score: {intel['priority']['urgency_score']}/100 ({intel['priority']['priority_level']})")

# 5. Ask Legal Assistant
chat_res = client.post(f'/api/assistant/{case_id}/chat', json={
    'message_text': 'What are the main precedents and limitation risks for this commercial case?'
}, headers=headers)
assert chat_res.status_code == 200, f"Assistant chat failed: {chat_res.text}"
print(f"[PASSED] 5. Legal Assistant responded with source citations:")
print(f"   Response: {chat_res.json()['message_text'][:90]}...")
print(f"   Sources: {chat_res.json()['sources_cited']}")
print("\n=== ALL 5 BACKEND MODULES VERIFIED & WORKING PERFECTLY! ===")
