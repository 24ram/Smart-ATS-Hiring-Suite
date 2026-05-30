from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import create_access_token, verify_password
from app.core.config import settings
from app.schemas.user import UserCreate, UserResponse, Token, UserLogin
from app.services.user import create_user, get_user_by_email
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate) -> Any:
    """
    Create new user.
    """
    user = await create_user(user_in)
    return user

@router.post("/login", response_model=Token)
async def login(
    # We use OAuth2PasswordRequestForm for swagger compatibility, but also accept JSON
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = await get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if user.get("role") in ["recruiter", "hiring_manager"]:
        status_val = user.get("status", "approved")
        if status_val == "pending":
            raise HTTPException(status_code=403, detail="Your account is awaiting administrator approval.")
        elif status_val == "rejected":
            raise HTTPException(status_code=403, detail="Your request was rejected.")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user["id"], role=user.get("role") or "recruiter", expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/login/json", response_model=Token)
async def login_json(user_in: UserLogin) -> Any:
    """
    JSON token login, get an access token for future requests.
    """
    user = await get_user_by_email(user_in.email)
    if not user or not verify_password(user_in.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if user.get("role") in ["recruiter", "hiring_manager"]:
        status_val = user.get("status", "approved")
        if status_val == "pending":
            raise HTTPException(status_code=403, detail="Your account is awaiting administrator approval.")
        elif status_val == "rejected":
            raise HTTPException(status_code=403, detail="Your request was rejected.")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user["id"], role=user.get("role") or "recruiter", expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Get current user.
    """
    return current_user
