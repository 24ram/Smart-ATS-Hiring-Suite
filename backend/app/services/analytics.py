from typing import List, Dict, Any
from app.db.mongodb import db

async def get_overview_stats() -> Dict[str, Any]:
    # Total candidates
    total_candidates = await db.db["candidates"].count_documents({})
    
    # Total jobs
    total_jobs = await db.db["jobs"].count_documents({})
    
    # Total Applications
    total_applications = await db.db["applications"].count_documents({})
    
    # Hired and rejected counts
    hired = await db.db["candidates"].count_documents({"stage": "hired"})
    rejected = await db.db["candidates"].count_documents({"stage": "rejected"})
    
    # Average AI score
    pipeline = [
        {"$match": {"ai_score": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": None, "avg_score": {"$avg": "$ai_score"}}}
    ]
    avg_score_cursor = db.db["candidates"].aggregate(pipeline)
    avg_score_result = await avg_score_cursor.to_list(length=1)
    
    avg_score = round(avg_score_result[0]["avg_score"], 1) if avg_score_result else 0.0

    # Average Interview Score
    interview_pipeline = [
        {"$match": {"overall_score": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": None, "avg_interview_score": {"$avg": "$overall_score"}}}
    ]
    avg_interview_cursor = db.db["scorecards"].aggregate(interview_pipeline)
    avg_interview_result = await avg_interview_cursor.to_list(length=1)
    
    avg_interview_score = round(avg_interview_result[0]["avg_interview_score"], 1) if avg_interview_result else 0.0

    return {
        "total_candidates": total_candidates,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "hired_candidates": hired,
        "rejected_candidates": rejected,
        "average_ai_score": avg_score,
        "average_interview_score": avg_interview_score
    }

async def get_pipeline_stats() -> List[Dict[str, Any]]:
    pipeline = [
        {
            "$group": {
                "_id": {"$ifNull": ["$stage", "applied"]},
                "count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "stage": "$_id",
                "count": 1
            }
        }
    ]
    cursor = db.db["candidates"].aggregate(pipeline)
    results = await cursor.to_list(length=100)
    
    # Ensure all stages are represented even if 0
    stages = ["applied", "screening", "interview", "technical", "hr", "offered", "rejected", "hired"]
    stage_counts = {r["stage"]: r["count"] for r in results}
    
    return [{"stage": s, "count": stage_counts.get(s, 0)} for s in stages]

async def get_ai_score_stats() -> List[Dict[str, Any]]:
    pipeline = [
        {"$match": {"ai_score": {"$exists": True, "$ne": None}}},
        {
            "$bucket": {
                "groupBy": "$ai_score",
                "boundaries": [0, 51, 71, 86, 101],
                "default": "Other",
                "output": {"count": {"$sum": 1}}
            }
        }
    ]
    cursor = db.db["candidates"].aggregate(pipeline)
    results = await cursor.to_list(length=100)
    
    ranges = {
        0: "0-50",
        51: "51-70",
        71: "71-85",
        86: "86-100"
    }
    
    formatted_results = []
    # Initialize all ranges to 0
    buckets = {v: 0 for v in ranges.values()}
    
    for r in results:
        if r["_id"] in ranges:
            buckets[ranges[r["_id"]]] = r["count"]
            
    for k, v in buckets.items():
        formatted_results.append({"range": k, "count": v})
        
    return formatted_results

async def get_recent_activity() -> List[Dict[str, Any]]:
    cursor = db.db["candidates"].find().sort("created_at", -1).limit(5)
    candidates = await cursor.to_list(length=5)
    for c in candidates:
        c["id"] = str(c["_id"])
        c.pop("_id", None)
    return candidates

async def get_recommendation_distribution() -> List[Dict[str, Any]]:
    pipeline = [
        {
            "$group": {
                "_id": "$recommendation",
                "count": {"$sum": 1}
            }
        }
    ]
    cursor = db.db["scorecards"].aggregate(pipeline)
    results = await cursor.to_list(length=100)
    
    # Pre-defined recommendation types to ensure all show up even if 0
    recs = ["strong_hire", "hire", "neutral", "no_hire", "strong_no_hire"]
    rec_counts = {r["_id"]: r["count"] for r in results if r["_id"]}
    
    formatted_results = []
    for r in recs:
        label = r.replace("_", " ").title()
        formatted_results.append({"name": label, "count": rec_counts.get(r, 0)})
        
    return formatted_results
