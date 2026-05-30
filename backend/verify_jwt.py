import asyncio
import httpx
import json
import base64
import random

async def verify():
    # Make random email to avoid duplicate errors
    r_id = random.randint(1000, 9999)
    admin_email = f"admin{r_id}@test.com"
    cand_email = f"candidate{r_id}@test.com"
    
    async with httpx.AsyncClient() as client:
        print(f"Registering admin {admin_email}...")
        res = await client.post("http://127.0.0.1:8000/api/v1/auth/register", json={
            "name": "Admin Test",
            "email": admin_email,
            "password": "password",
            "role": "admin"
        })
        print("Admin Register:", res.status_code, res.text)
        
        res = await client.post("http://127.0.0.1:8000/api/v1/auth/login/json", json={
            "email": admin_email,
            "password": "password"
        })
        admin_token = res.json().get("access_token")
        
        if not admin_token:
            print("Failed to get admin token")
            return
            
        print("Admin JWT:")
        payload_b64 = admin_token.split(".")[1]
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        payload = json.loads(base64.b64decode(payload_b64).decode("utf-8"))
        print(json.dumps(payload, indent=2))
        
        # Candidate
        print(f"\nRegistering candidate {cand_email}...")
        res = await client.post("http://127.0.0.1:8000/api/v1/candidate-auth/register", json={
            "name": "Candidate Test",
            "email": cand_email,
            "password": "password"
        })
        print("Candidate Register:", res.status_code, res.text)
        
        res = await client.post("http://127.0.0.1:8000/api/v1/candidate-auth/login", json={
            "email": cand_email,
            "password": "password"
        })
        cand_token = res.json().get("access_token")
        
        if not cand_token:
            print("Failed to get candidate token")
            return
            
        print("Candidate JWT:")
        payload_b64 = cand_token.split(".")[1]
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        payload = json.loads(base64.b64decode(payload_b64).decode("utf-8"))
        print(json.dumps(payload, indent=2))
        
if __name__ == "__main__":
    asyncio.run(verify())
