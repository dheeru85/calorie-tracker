from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from datetime import date, datetime
from models.diary import (
    DiaryEntry, DiaryEntryCreate, DiaryEntryUpdate, 
    DailyNutritionSummary, WeightEntry, WeightEntryCreate
)
from models.user import User
from services.auth_service import get_current_user
from pymongo import MongoClient
import os
import uuid

router = APIRouter()

def get_db():
    mongo_url = os.getenv("MONGO_URL")
    client = MongoClient(mongo_url)
    return client.calorie_tracker

@router.post("/entries", response_model=DiaryEntry)
async def create_diary_entry(
    entry_data: DiaryEntryCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new diary entry"""
    db = get_db()
    
    try:
        diary_entry = {
            "entry_id": str(uuid.uuid4()),
            "user_id": current_user.user_id,
            "date": entry_data.date.isoformat(),  # Convert date to string
            "meal_type": entry_data.meal_type,
            "fdc_id": entry_data.fdc_id,
            "food_name": entry_data.food_name,
            "brand": entry_data.brand,
            "serving_size": entry_data.serving_size,
            "serving_unit": entry_data.serving_unit,
            "nutrition": entry_data.nutrition.dict(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = db.diary_entries.insert_one(diary_entry)
        if result.inserted_id:
            return DiaryEntry(**diary_entry)
        else:
            raise HTTPException(status_code=500, detail="Could not create diary entry")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating diary entry: {str(e)}")

@router.get("/entries", response_model=List[DiaryEntry])
async def get_diary_entries(
    date_filter: Optional[date] = Query(None, description="Filter by specific date"),
    meal_type: Optional[str] = Query(None, description="Filter by meal type"),
    current_user: User = Depends(get_current_user)
):
    """Get diary entries for the current user"""
    db = get_db()
    
    try:
        query = {"user_id": current_user.user_id}
        
        if date_filter:
            query["date"] = date_filter.isoformat()  # Convert date to string for query
        
        if meal_type:
            query["meal_type"] = meal_type
        
        entries = list(db.diary_entries.find(query).sort("created_at", -1))
        return [DiaryEntry(**entry) for entry in entries]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting diary entries: {str(e)}")

@router.get("/summary/{date}", response_model=DailyNutritionSummary)
async def get_daily_summary(
    date: date,
    current_user: User = Depends(get_current_user)
):
    """Get daily nutrition summary for a specific date"""
    db = get_db()
    
    try:
        entries = list(db.diary_entries.find({
            "user_id": current_user.user_id,
            "date": date.isoformat()  # Convert date to string for query
        }))
        
        # Calculate totals
        totals = {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0,
            "fiber": 0,
            "sugar": 0,
            "sodium": 0
        }
        
        meals = {
            "breakfast": [],
            "lunch": [],
            "dinner": [],
            "snack": []
        }
        
        for entry in entries:
            # Add to totals
            nutrition = entry["nutrition"]
            for key in totals:
                totals[key] += nutrition.get(key, 0)
            
            # Group by meal type
            meal_type = entry["meal_type"]
            if meal_type in meals:
                meals[meal_type].append(DiaryEntry(**entry))
        
        return DailyNutritionSummary(
            date=date,
            total_calories=totals["calories"],
            total_protein=totals["protein"],
            total_carbs=totals["carbs"],
            total_fat=totals["fat"],
            total_fiber=totals["fiber"],
            total_sugar=totals["sugar"],
            total_sodium=totals["sodium"],
            meals=meals
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting daily summary: {str(e)}")

@router.put("/entries/{entry_id}", response_model=DiaryEntry)
async def update_diary_entry(
    entry_id: str,
    entry_update: DiaryEntryUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a diary entry"""
    db = get_db()
    
    try:
        update_data = entry_update.dict(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            result = db.diary_entries.update_one(
                {"entry_id": entry_id, "user_id": current_user.user_id},
                {"$set": update_data}
            )
            
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="Diary entry not found")
        
        # Return updated entry
        updated_entry = db.diary_entries.find_one({
            "entry_id": entry_id,
            "user_id": current_user.user_id
        })
        
        return DiaryEntry(**updated_entry)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating diary entry: {str(e)}")

@router.delete("/entries/{entry_id}")
async def delete_diary_entry(
    entry_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a diary entry"""
    db = get_db()
    
    try:
        result = db.diary_entries.delete_one({
            "entry_id": entry_id,
            "user_id": current_user.user_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Diary entry not found")
        
        return {"message": "Diary entry deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting diary entry: {str(e)}")

@router.post("/weight", response_model=WeightEntry)
async def log_weight(
    weight_data: WeightEntryCreate,
    current_user: User = Depends(get_current_user)
):
    """Log a weight entry"""
    db = get_db()
    
    try:
        weight_entry = {
            "entry_id": str(uuid.uuid4()),
            "user_id": current_user.user_id,
            "date": weight_data.date,
            "weight": weight_data.weight,
            "created_at": datetime.utcnow()
        }
        
        result = db.weight_entries.insert_one(weight_entry)
        if result.inserted_id:
            return WeightEntry(**weight_entry)
        else:
            raise HTTPException(status_code=500, detail="Could not log weight")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error logging weight: {str(e)}")

@router.get("/weight", response_model=List[WeightEntry])
async def get_weight_entries(
    limit: int = Query(30, ge=1, le=100, description="Number of entries to return"),
    current_user: User = Depends(get_current_user)
):
    """Get weight entries for the current user"""
    db = get_db()
    
    try:
        entries = list(db.weight_entries.find({
            "user_id": current_user.user_id
        }).sort("date", -1).limit(limit))
        
        return [WeightEntry(**entry) for entry in entries]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting weight entries: {str(e)}")