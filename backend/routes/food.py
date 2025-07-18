from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from models.food import FoodSearchResult, FoodItem, CustomFood
from models.user import User
from services.auth_service import get_current_user
from services.usda_api import usda_service
from pymongo import MongoClient
import os
import uuid
from datetime import datetime

router = APIRouter()

def get_db():
    mongo_url = os.getenv("MONGO_URL")
    client = MongoClient(mongo_url)
    return client.calorie_tracker

@router.get("/search", response_model=FoodSearchResult)
async def search_foods(
    query: str = Query(..., description="Search query for foods"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user)
):
    """Search for foods using USDA FoodData Central API"""
    try:
        result = usda_service.search_foods(query, page, page_size)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching foods: {str(e)}")

@router.get("/details/{fdc_id}", response_model=FoodItem)
async def get_food_details(
    fdc_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific food item"""
    try:
        food_item = usda_service.get_food_details(fdc_id)
        if not food_item:
            raise HTTPException(status_code=404, detail="Food item not found")
        return food_item
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting food details: {str(e)}")

@router.post("/custom", response_model=CustomFood)
async def create_custom_food(
    food_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Create a custom food item"""
    db = get_db()
    
    try:
        custom_food = {
            "food_id": str(uuid.uuid4()),
            "user_id": current_user.user_id,
            "name": food_data["name"],
            "brand": food_data.get("brand"),
            "serving_size": food_data["serving_size"],
            "serving_unit": food_data["serving_unit"],
            "nutrition": food_data["nutrition"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = db.custom_foods.insert_one(custom_food)
        if result.inserted_id:
            return CustomFood(**custom_food)
        else:
            raise HTTPException(status_code=500, detail="Could not create custom food")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating custom food: {str(e)}")

@router.get("/custom", response_model=list[CustomFood])
async def get_user_custom_foods(
    current_user: User = Depends(get_current_user)
):
    """Get all custom foods created by the current user"""
    db = get_db()
    
    try:
        custom_foods = list(db.custom_foods.find({"user_id": current_user.user_id}))
        return [CustomFood(**food) for food in custom_foods]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting custom foods: {str(e)}")

@router.delete("/custom/{food_id}")
async def delete_custom_food(
    food_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a custom food item"""
    db = get_db()
    
    try:
        result = db.custom_foods.delete_one({
            "food_id": food_id,
            "user_id": current_user.user_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Custom food not found")
        
        return {"message": "Custom food deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting custom food: {str(e)}")

@router.get("/popular", response_model=list[dict])
async def get_popular_foods(
    current_user: User = Depends(get_current_user)
):
    """Get popular/frequently used foods"""
    db = get_db()
    
    try:
        # Get most frequently logged foods by this user
        pipeline = [
            {"$match": {"user_id": current_user.user_id}},
            {"$group": {
                "_id": "$food_name",
                "count": {"$sum": 1},
                "last_used": {"$max": "$created_at"},
                "fdc_id": {"$first": "$fdc_id"},
                "brand": {"$first": "$brand"},
                "nutrition": {"$first": "$nutrition"}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        
        popular_foods = list(db.diary_entries.aggregate(pipeline))
        return popular_foods
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting popular foods: {str(e)}")