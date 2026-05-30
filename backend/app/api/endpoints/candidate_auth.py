from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import timedelta

from app.core.config import settings
from app.core.security import create_access_token
from app.schemas.candidate_auth import CandidateRegister, CandidateLogin, CandidateToken, CandidateUserResponse
from app.services.candidate_auth import create_candidate_user, authenticate_candidate, get_candidate_by_email, get_candidate_user

router = APIRouter()

oauth2_candidate_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/candidate-auth/login"
)

async def get_current_candidate_user(token: str = Depends(oauth2_candidate_scheme)) -> dict:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=["HS256"]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    user = await get_candidate_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Candidate user not found")
    return user


@router.post("/register", response_model=CandidateUserResponse, status_code=status.HTTP_201_CREATED)
async def register_candidate(data: CandidateRegister):
    existing = await get_candidate_by_email(data.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    user = await create_candidate_user(data)
    return user

@router.post("/login", response_model=CandidateToken)
async def login_candidate(data: CandidateLogin):
    user = await authenticate_candidate(data.email, data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user["id"], role="candidate", expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=CandidateUserResponse)
async def get_candidate_me(current_user: dict = Depends(get_current_candidate_user)):
    return current_user
