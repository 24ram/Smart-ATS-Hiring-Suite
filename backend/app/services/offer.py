from datetime import datetime
from bson import ObjectId
from app.db.mongodb import db
from app.schemas.offer import OfferCreate, OfferUpdate, OfferStatus
from app.services.candidate import get_candidate_by_id, add_candidate_activity
from app.services.job import get_job_by_id
from app.services.email import send_offer_sent_email
from fastapi import HTTPException

async def create_offer(offer_in: OfferCreate, created_by: str) -> dict:
    # Validate candidate exists
    candidate = await get_candidate_by_id(offer_in.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    # Validate job exists
    job = await get_job_by_id(offer_in.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    now = datetime.utcnow()
    offer_dict = offer_in.model_dump()
    
    # Auto fields
    offer_dict["candidate_name"] = candidate.get("name", "Unknown Candidate")
    offer_dict["job_title"] = job.get("title", "Unknown Job")
    offer_dict["status"] = OfferStatus.pending.value
    offer_dict["offer_letter_url"] = None
    offer_dict["created_by"] = created_by
    offer_dict["created_at"] = now
    offer_dict["updated_at"] = now
    offer_dict["sent_at"] = None
    offer_dict["viewed_at"] = None
    offer_dict["responded_at"] = None

    # Locate application first to extract application_id
    from app.services.application import update_application_status
    app_query = {"candidate_id": offer_in.candidate_id, "job_id": offer_in.job_id}
    if offer_in.application_id:
        app_query["_id"] = ObjectId(offer_in.application_id)
        
    app_record = await db.db["applications"].find_one(app_query)
    
    # Pre-fill application_id if found
    if app_record:
        if app_record.get("hm_feedback") != "Hire":
            raise HTTPException(status_code=400, detail="Hiring Manager approval required before generating an offer.")
        offer_dict["application_id"] = str(app_record["_id"])
    else:
        # If no app record exists, we can't have HM approval
        raise HTTPException(status_code=400, detail="Hiring Manager approval required before generating an offer.")
    
    result = await db.db["offers"].insert_one(offer_dict)
    
    # Timeline event
    await add_candidate_activity(offer_in.candidate_id, "Offer generated", "An offer has been generated in pending status.")

    # Update application status to offer
    if app_record:
        await update_application_status(str(app_record["_id"]), "offer")

    return await get_offer(str(result.inserted_id))

def _map_legacy_offer_status(status: str) -> str:
    if not status:
        return "pending"
    s = status.lower()
    if s in ["draft", "sent", "viewed"]:
        return "pending"
    if s in ["declined", "expired"]:
        return "rejected"
    if s not in ["pending", "accepted", "rejected"]:
        return "pending"
    return s

async def get_offer(offer_id: str) -> dict | None:
    try:
        offer = await db.db["offers"].find_one({"_id": ObjectId(offer_id)})
        if offer:
            offer["id"] = str(offer["_id"])
            offer["status"] = _map_legacy_offer_status(offer.get("status", ""))
        return offer
    except Exception:
        return None

async def list_offers() -> list[dict]:
    cursor = db.db["offers"].find({}).sort("created_at", -1)
    offers = await cursor.to_list(length=1000)
    for o in offers:
        o["id"] = str(o["_id"])
        o["status"] = _map_legacy_offer_status(o.get("status", ""))
    return offers

async def update_offer(offer_id: str, update_in: OfferUpdate) -> dict | None:
    offer = await get_offer(offer_id)
    if not offer:
        return None

    update_dict = {k: v for k, v in update_in.model_dump(exclude_unset=True).items() if v is not None}
    if not update_dict:
        return offer

    now = datetime.utcnow()
    update_dict["updated_at"] = now
    
    # Check status change
    new_status = update_dict.get("status")
    old_status = offer.get("status")

    if new_status and new_status != old_status:
        if new_status == OfferStatus.sent.value:
            update_dict["sent_at"] = now
        elif new_status in [OfferStatus.accepted.value, OfferStatus.declined.value]:
            update_dict["responded_at"] = now
        elif new_status == OfferStatus.viewed.value:
            update_dict["viewed_at"] = now
            
        # Enum string extraction because it might be an Enum object depending on pydantic
        status_val = new_status.value if hasattr(new_status, "value") else new_status

    await db.db["offers"].update_one(
        {"_id": ObjectId(offer_id)},
        {"$set": update_dict}
    )
    
    # Append timeline activity if status changed
    if new_status and new_status != old_status:
        candidate_id = offer["candidate_id"]
        status_val = new_status.value if hasattr(new_status, "value") else new_status
        
        if status_val == OfferStatus.sent.value:
            await add_candidate_activity(candidate_id, "Offer sent", "The offer has been sent to the candidate.")
            
            # Send Email
            candidate = await get_candidate_by_id(candidate_id)
            if candidate and candidate.get("email"):
                joining_date_str = offer["joining_date"].strftime("%Y-%m-%d") if isinstance(offer["joining_date"], datetime) else str(offer["joining_date"])
                await send_offer_sent_email(
                    to_email=candidate["email"],
                    candidate_name=offer["candidate_name"],
                    job_title=offer["job_title"],
                    salary=offer["salary"],
                    joining_date=joining_date_str
                )
                
        elif status_val == OfferStatus.accepted.value:
            await add_candidate_activity(candidate_id, "Offer accepted", "The candidate accepted the offer.")
        elif status_val == OfferStatus.declined.value:
            await add_candidate_activity(candidate_id, "Offer declined", "The candidate declined the offer.")

    return await get_offer(offer_id)

async def delete_offer(offer_id: str) -> bool:
    try:
        result = await db.db["offers"].delete_one({"_id": ObjectId(offer_id)})
        return result.deleted_count > 0
    except Exception:
        return False
