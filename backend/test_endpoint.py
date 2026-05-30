from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_applications():
    response = client.get("/api/v1/applications/")
    print(f"Status Code: {response.status_code}")
    if response.status_code != 200:
        print(response.json())
    else:
        print(f"Returned {len(response.json())} apps")

test_read_applications()
