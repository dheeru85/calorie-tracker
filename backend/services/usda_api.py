import requests
import os
from typing import List, Optional
from models.food import FoodItem, FoodSearchResult, NutritionInfo

class USDAAPIService:
    def __init__(self):
        self.api_key = os.getenv("USDA_API_KEY")
        self.base_url = "https://api.nal.usda.gov/fdc/v1"
    
    def search_foods(self, query: str, page: int = 1, page_size: int = 20) -> FoodSearchResult:
        """Search for foods using USDA FoodData Central API"""
        url = f"{self.base_url}/foods/search"
        
        params = {
            "query": query,
            "pageSize": page_size,
            "pageNumber": page,
            "api_key": self.api_key
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            foods = []
            for food_data in data.get("foods", []):
                food_item = self._parse_food_data(food_data)
                if food_item:
                    foods.append(food_item)
            
            total_hits = data.get("totalHits", 0)
            total_pages = (total_hits + page_size - 1) // page_size
            
            return FoodSearchResult(
                foods=foods,
                total_hits=total_hits,
                current_page=page,
                total_pages=total_pages
            )
            
        except requests.exceptions.RequestException as e:
            print(f"Error searching foods: {e}")
            return FoodSearchResult(foods=[], total_hits=0, current_page=1, total_pages=1)
    
    def get_food_details(self, fdc_id: str) -> Optional[FoodItem]:
        """Get detailed information about a specific food item"""
        url = f"{self.base_url}/food/{fdc_id}"
        
        params = {
            "api_key": self.api_key
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            return self._parse_food_data(data)
            
        except requests.exceptions.RequestException as e:
            print(f"Error getting food details: {e}")
            return None
    
    def _parse_food_data(self, food_data: dict) -> Optional[FoodItem]:
        """Parse USDA food data into our FoodItem model"""
        try:
            fdc_id = str(food_data.get("fdcId", ""))
            description = food_data.get("description", "")
            brand_owner = food_data.get("brandOwner")
            food_category = food_data.get("foodCategory")
            
            # Parse nutrition data
            nutrition = self._parse_nutrition_data(food_data.get("foodNutrients", []))
            
            # Get serving size (default to 100g if not available)
            serving_size = 100.0
            serving_unit = "g"
            
            # Check for serving size in food portions
            if "foodPortions" in food_data and food_data["foodPortions"]:
                portion = food_data["foodPortions"][0]
                if "gramWeight" in portion:
                    serving_size = portion["gramWeight"]
                if "portionDescription" in portion:
                    serving_unit = portion["portionDescription"]
            
            return FoodItem(
                fdc_id=fdc_id,
                description=description,
                brand_owner=brand_owner,
                serving_size=serving_size,
                serving_unit=serving_unit,
                nutrition=nutrition,
                food_category=food_category
            )
            
        except Exception as e:
            print(f"Error parsing food data: {e}")
            return None
    
    def _parse_nutrition_data(self, nutrients: List[dict]) -> NutritionInfo:
        """Parse nutrition data from USDA format"""
        nutrition = NutritionInfo()
        
        # Map USDA nutrient IDs to our fields
        nutrient_mapping = {
            1008: "calories",     # Energy
            1003: "protein",      # Protein
            1005: "carbs",        # Carbohydrate
            1004: "fat",          # Total lipid (fat)
            1079: "fiber",        # Fiber, total dietary
            2000: "sugar",        # Total sugars
            1093: "sodium",       # Sodium
        }
        
        for nutrient in nutrients:
            nutrient_id = nutrient.get("nutrient", {}).get("id")
            amount = nutrient.get("amount", 0)
            
            if nutrient_id in nutrient_mapping:
                field_name = nutrient_mapping[nutrient_id]
                setattr(nutrition, field_name, amount)
        
        return nutrition

# Global instance
usda_service = USDAAPIService()