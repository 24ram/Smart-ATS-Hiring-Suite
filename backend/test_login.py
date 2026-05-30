import asyncio
import httpx
import json
import base64

async def test_login():
    async with httpx.AsyncClient() as client:
        # Assuming admin@smartats.com exists with password 'password123' or 'admin123'
        response = await client.post("http://127.0.0.1:8000/api/v1/auth/login", data={"username": "admin@smartats.com", "password": "password"})
        if response.status_code != 200:
            print("Login failed:", response.text)
            # fallback to testing login_json
            response = await client.post("http://127.0.0.1:8000/api/v1/auth/login/json", json={"email": "admin@smartats.com", "password": "password"})
            if response.status_code != 200:
                print("JSON Login failed:", response.text)
                return
                
        token = response.json().get("access_token")
        print("Got token:", token)
        
        # Decode payload without verifying signature
        payload_b64 = token.split(".")[1]
        # Add padding
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        payload = json.loads(base64.b64decode(payload_b64).decode("utf-8"))
        print("\nDecoded Payload:")
        print(json.dumps(payload, indent=2))

if __name__ == "__main__":
    asyncio.run(test_login())
