from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from models.food import NutritionInfo

class DiaryEntry(BaseModel):
    entry_id: str
    user_id: str
    date: date
    meal_type: str  # breakfast, lunch, dinner, snack
    fdc_id: Optional[str] = None
    food_name: str
    brand: Optional[str] = None
    serving_size: float
    serving_unit: str
    nutrition: NutritionInfo
    created_at: datetime
    updated_at: datetime

class DiaryEntryCreate(BaseModel):
    date: date
    meal_type: str
    fdc_id: Optional[str] = None
    food_name: str
    brand: Optional[str] = None
    serving_size: float
    serving_unit: str
    nutrition: NutritionInfo

class DiaryEntryUpdate(BaseModel):
    serving_size: Optional[float] = None
    serving_unit: Optional[str] = None
    nutrition: Optional[NutritionInfo] = None

class DailyNutritionSummary(BaseModel):
    date: date
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    total_fiber: float
    total_sugar: float
    total_sodium: float
    meals: dict  # meal_type -> List[DiaryEntry]

class WeightEntry(BaseModel):
    entry_id: str
    user_id: str
    date: date
    weight: float  # in kg
    created_at: datetime

class WeightEntryCreate(BaseModel):
    date: date
    weight: float