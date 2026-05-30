import sys
sys.path.append('.')
from app.core.security import create_access_token
from jose import jwt
from app.core.config import settings
import asyncio
from app.services.user import get_user_by_email
from datetime import timedelta

async def test():
    user = await get_user_by_email('admin@smartats.com')
    if not user:
        user = {"id": "123", "role": "admin"}
    token = create_access_token(user['id'], role=user.get('role', 'recruiter'), expires_delta=timedelta(minutes=30))
    print("Token:", token)
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    print("Payload:", payload)

asyncio.run(test())
