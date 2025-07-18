from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class NutritionInfo(BaseModel):
    calories: Optional[float] = 0
    protein: Optional[float] = 0
    carbs: Optional[float] = 0
    fat: Optional[float] = 0
    fiber: Optional[float] = 0
    sugar: Optional[float] = 0
    sodium: Optional[float] = 0
    
class FoodItem(BaseModel):
    fdc_id: str
    description: str
    brand_owner: Optional[str] = None
    serving_size: Optional[float] = 100  # grams
    serving_unit: Optional[str] = "g"
    nutrition: NutritionInfo
    food_category: Optional[str] = None

class FoodSearchResult(BaseModel):
    foods: List[FoodItem]
    total_hits: int
    current_page: int
    total_pages: int

class CustomFood(BaseModel):
    food_id: str
    user_id: str
    name: str
    brand: Optional[str] = None
    serving_size: float
    serving_unit: str
    nutrition: NutritionInfo
    created_at: datetime
    updated_at: datetime