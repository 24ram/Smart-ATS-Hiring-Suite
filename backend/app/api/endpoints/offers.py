from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.offer import OfferCreate, OfferUpdate, OfferResponse
from app.services.offer import create_offer, get_offer, list_offers, update_offer, delete_offer
from app.api.deps import require_role
from app.schemas.user import UserRole

router = APIRouter()

@router.post("/", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
async def create_new_offer(
    offer_in: OfferCreate,
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    # Service layer handles validation of candidate_id and job_id and raises HTTPException if missing
    return await create_offer(offer_in, current_user.get("name", "Unknown"))

@router.get("/", response_model=List[OfferResponse])
async def read_offers(
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    return await list_offers()

@router.get("/{offer_id}", response_model=OfferResponse)
async def read_offer(
    offer_id: str,
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    offer = await get_offer(offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer

@router.put("/{offer_id}", response_model=OfferResponse)
async def update_existing_offer(
    offer_id: str,
    update_in: OfferUpdate,
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    offer = await update_offer(offer_id, update_in)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer

@router.delete("/{offer_id}", status_code=status.HTTP_200_OK)
async def delete_existing_offer(
    offer_id: str,
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin]))
) -> Any:
    success = await delete_offer(offer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Offer not found")
    return {"message": "Offer deleted successfully"}
