from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("1. Testing Root Status...")
r = client.get("/")
assert r.status_code == 200, f"Root failed: {r.status_code}"
print("   Root Status: OK")

print("2. Testing Indian Kanoon Research Status...")
r = client.get("/api/research/status")
assert r.status_code == 200, f"Status failed: {r.status_code}"
print("   Status payload:", r.json())

print("3. Testing Multiple Diverse Indian Kanoon Searches...")
test_queries = ["bail", "accident", "theft", "divorce", "GPA sale", "novel commercial breach query"]
for q in test_queries:
    r = client.get(f"/api/research/search?q={q}")
    assert r.status_code == 200, f"Search failed for {q}: {r.status_code}"
    data = r.json()
    res_len = len(data.get("results", []))
    assert res_len > 0, f"0 results returned for query: {q}"
    top_title = data["results"][0]["title"]
    print(f"   [Query: '{q}'] -> {res_len} results. Top: {top_title}")

print("4. Testing Draft Templates...")
r = client.get("/api/drafts/templates")
assert r.status_code == 200
print("   Templates count:", len(r.json()))

print("5. Testing Advocate Login with Bar Registration No (MAH/4521/2021)...")
r = client.post("/api/auth/login", json={"identifier": "MAH/4521/2021", "password": "lawyer123"})
assert r.status_code == 200, f"Login failed: {r.text}"
auth_data = r.json()
token = auth_data["access_token"]
user_info = auth_data["user"]
print(f"   Advocate Verified: {user_info['name']} | BCI: {user_info['bar_enrollment_no']}")

print("6. Testing Cases Auto-Seeding on /api/cases...")
r = client.get("/api/cases", headers={"Authorization": f"Bearer {token}"})
assert r.status_code == 200, f"Get cases failed: {r.text}"
cases = r.json()
assert len(cases) > 0, "No cases found or auto-seeded!"
print(f"   Advocate has {len(cases)} active case dockets. First case: {cases[0]['title']} (ID: {cases[0]['case_id']})")
first_case_id = cases[0]["case_id"]

print("7. Testing AI Assistant (General Legal Chat without case)...")
r = client.post(
    "/api/assistant/chat",
    json={"message_text": "What are the essential grounds for anticipatory bail under 438 CrPC?"},
    headers={"Authorization": f"Bearer {token}"}
)
assert r.status_code == 200, f"General chat failed: {r.text}"
ans = r.json().get("message_text", "")
assert len(ans) > 20, "Assistant response too short"
print(f"   General Chat Response ({len(ans)} chars): {ans[:90]}...")

print("8. Testing AI Assistant with Case ID...")
r = client.post(
    f"/api/assistant/{first_case_id}/chat",
    json={"message_text": "Summarize the legal strategy for this case."},
    headers={"Authorization": f"Bearer {token}"}
)
assert r.status_code == 200, f"Case chat failed: {r.text}"
case_ans = r.json().get("message_text", "")
print(f"   Case Chat Response ({len(case_ans)} chars): {case_ans[:90]}...")

print("9. Testing Draft Creation...")
r = client.post(
    "/api/drafts",
    json={"title": "Anticipatory Bail Draft - Singhania", "doc_type": "Bail Application", "content": "<p>Draft Content</p>", "case_id": first_case_id},
    headers={"Authorization": f"Bearer {token}"}
)
assert r.status_code == 200, f"Create draft failed: {r.text}"
draft_id = r.json()["draft_id"]
print(f"   Draft created successfully with ID: {draft_id}")

print("\n>>> ALL SYSTEM VERIFICATIONS PASSED 100%! <<<")
