from fastapi.testclient import TestClient
from app.main import app
from app.api.deps import get_current_user, require_role

# Override dependency
def override_require_role(allowed_roles):
    async def _override():
        return {"id": "123", "role": "recruiter", "email": "test@test.com"}
    return _override

# Apply override
app.dependency_overrides[require_role([1, 2, 3])] = override_require_role([1, 2, 3])
# We need to override the specific parameterized dependency, which is tricky in FastAPI.
# A simpler way is to just generate a valid token.
