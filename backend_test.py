#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for MyFitnessPal Clone
Tests all authentication, food search, and diary management endpoints
"""

import requests
import json
from datetime import date, datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get backend URL from frontend .env file
def get_backend_url():
    frontend_env_path = "/app/frontend/.env"
    if os.path.exists(frontend_env_path):
        with open(frontend_env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_BASE = f"{BASE_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.test_user_data = {
            "username": "sarah_fitness",
            "email": "sarah.fitness@example.com",
            "password": "SecurePass123!",
            "full_name": "Sarah Johnson",
            "age": 28,
            "gender": "female",
            "height": 165.0,
            "weight": 65.0,
            "activity_level": "moderately_active",
            "goal": "lose",
            "target_calories": 1800
        }
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def set_auth_header(self):
        """Set authorization header for authenticated requests"""
        if self.access_token:
            self.session.headers.update({
                "Authorization": f"Bearer {self.access_token}"
            })
    
    def test_health_check(self):
        """Test basic health check endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_result("Health Check", True, "API is healthy and responding")
                    return True
                else:
                    self.log_result("Health Check", False, "API responded but status not healthy", data)
            else:
                self.log_result("Health Check", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Health Check", False, f"Connection error: {str(e)}")
        return False
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        try:
            response = self.session.post(
                f"{API_BASE}/auth/register",
                json=self.test_user_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if "user_id" in data and "message" in data:
                    self.log_result("User Registration", True, "User registered successfully", data)
                    return True
                else:
                    self.log_result("User Registration", False, "Invalid response format", data)
            elif response.status_code == 400:
                # User might already exist, try with different username
                modified_data = self.test_user_data.copy()
                modified_data["username"] = f"sarah_fitness_{datetime.now().strftime('%H%M%S')}"
                modified_data["email"] = f"sarah.fitness.{datetime.now().strftime('%H%M%S')}@example.com"
                
                response = self.session.post(
                    f"{API_BASE}/auth/register",
                    json=modified_data
                )
                
                if response.status_code == 200:
                    data = response.json()
                    self.test_user_data = modified_data  # Update for future tests
                    self.log_result("User Registration", True, "User registered with modified credentials", data)
                    return True
                else:
                    self.log_result("User Registration", False, f"HTTP {response.status_code}", response.text)
            else:
                self.log_result("User Registration", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("User Registration", False, f"Request error: {str(e)}")
        return False
    
    def test_user_login(self):
        """Test user login endpoint"""
        try:
            login_data = {
                "username": self.test_user_data["username"],
                "password": self.test_user_data["password"]
            }
            
            response = self.session.post(
                f"{API_BASE}/auth/login",
                data=login_data  # OAuth2PasswordRequestForm expects form data
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    self.access_token = data["access_token"]
                    self.set_auth_header()
                    self.log_result("User Login", True, "Login successful, token received", {"token_type": data["token_type"]})
                    return True
                else:
                    self.log_result("User Login", False, "Invalid response format", data)
            else:
                self.log_result("User Login", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("User Login", False, f"Request error: {str(e)}")
        return False
    
    def test_get_current_user(self):
        """Test get current user profile endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/auth/me")
            
            if response.status_code == 200:
                data = response.json()
                if "user_id" in data and "username" in data:
                    self.log_result("Get Current User", True, "User profile retrieved successfully", 
                                  {"username": data["username"], "email": data.get("email")})
                    return True
                else:
                    self.log_result("Get Current User", False, "Invalid response format", data)
            else:
                self.log_result("Get Current User", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Get Current User", False, f"Request error: {str(e)}")
        return False
    
    def test_update_user_profile(self):
        """Test update user profile endpoint"""
        try:
            update_data = {
                "target_calories": 2000,
                "goal": "maintain"
            }
            
            response = self.session.put(
                f"{API_BASE}/auth/me",
                json=update_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("target_calories") == 2000 and data.get("goal") == "maintain":
                    self.log_result("Update User Profile", True, "Profile updated successfully", update_data)
                    return True
                else:
                    self.log_result("Update User Profile", False, "Profile not updated correctly", data)
            else:
                self.log_result("Update User Profile", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Update User Profile", False, f"Request error: {str(e)}")
        return False
    
    def test_food_search(self):
        """Test food search with USDA API integration"""
        try:
            params = {
                "query": "apple",
                "page": 1,
                "page_size": 5
            }
            
            response = self.session.get(f"{API_BASE}/food/search", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if "foods" in data and "total_hits" in data:
                    foods_count = len(data["foods"])
                    self.log_result("Food Search", True, f"Found {foods_count} foods, total hits: {data['total_hits']}", 
                                  {"sample_food": data["foods"][0]["description"] if foods_count > 0 else "None"})
                    return True
                else:
                    self.log_result("Food Search", False, "Invalid response format", data)
            else:
                self.log_result("Food Search", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Food Search", False, f"Request error: {str(e)}")
        return False
    
    def test_food_details(self):
        """Test food details endpoint"""
        try:
            # First search for a food to get an FDC ID
            search_response = self.session.get(f"{API_BASE}/food/search", params={"query": "banana", "page_size": 1})
            
            if search_response.status_code == 200:
                search_data = search_response.json()
                if search_data["foods"]:
                    fdc_id = search_data["foods"][0]["fdc_id"]
                    
                    # Now get details for this food
                    response = self.session.get(f"{API_BASE}/food/details/{fdc_id}")
                    
                    if response.status_code == 200:
                        data = response.json()
                        if "fdc_id" in data and "nutrition" in data:
                            self.log_result("Food Details", True, f"Retrieved details for FDC ID: {fdc_id}", 
                                          {"description": data.get("description"), "calories": data["nutrition"].get("calories")})
                            return True
                        else:
                            self.log_result("Food Details", False, "Invalid response format", data)
                    else:
                        self.log_result("Food Details", False, f"HTTP {response.status_code}", response.text)
                else:
                    self.log_result("Food Details", False, "No foods found in search to test details")
            else:
                self.log_result("Food Details", False, "Could not search for foods to test details")
        except Exception as e:
            self.log_result("Food Details", False, f"Request error: {str(e)}")
        return False
    
    def test_custom_food_creation(self):
        """Test custom food creation endpoint"""
        try:
            custom_food_data = {
                "name": "Sarah's Protein Smoothie",
                "brand": "Homemade",
                "serving_size": 250,
                "serving_unit": "ml",
                "nutrition": {
                    "calories": 320,
                    "protein": 25,
                    "carbs": 35,
                    "fat": 8,
                    "fiber": 5,
                    "sugar": 20,
                    "sodium": 150
                }
            }
            
            response = self.session.post(
                f"{API_BASE}/food/custom",
                json=custom_food_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if "food_id" in data and data["name"] == custom_food_data["name"]:
                    self.log_result("Custom Food Creation", True, "Custom food created successfully", 
                                  {"food_id": data["food_id"], "name": data["name"]})
                    return True
                else:
                    self.log_result("Custom Food Creation", False, "Invalid response format", data)
            else:
                self.log_result("Custom Food Creation", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Custom Food Creation", False, f"Request error: {str(e)}")
        return False
    
    def test_diary_entry_creation(self):
        """Test diary entry creation endpoint"""
        try:
            diary_entry_data = {
                "date": str(date.today()),
                "meal_type": "breakfast",
                "fdc_id": "123456",
                "food_name": "Oatmeal with Berries",
                "brand": "Quaker",
                "serving_size": 1,
                "serving_unit": "cup",
                "nutrition": {
                    "calories": 280,
                    "protein": 8,
                    "carbs": 54,
                    "fat": 4,
                    "fiber": 8,
                    "sugar": 12,
                    "sodium": 200
                }
            }
            
            response = self.session.post(
                f"{API_BASE}/diary/entries",
                json=diary_entry_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if "entry_id" in data and data["food_name"] == diary_entry_data["food_name"]:
                    self.entry_id = data["entry_id"]  # Store for later tests
                    self.log_result("Diary Entry Creation", True, "Diary entry created successfully", 
                                  {"entry_id": data["entry_id"], "food_name": data["food_name"]})
                    return True
                else:
                    self.log_result("Diary Entry Creation", False, "Invalid response format", data)
            else:
                self.log_result("Diary Entry Creation", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Diary Entry Creation", False, f"Request error: {str(e)}")
        return False
    
    def test_diary_entries_retrieval(self):
        """Test diary entries retrieval endpoint"""
        try:
            params = {
                "date_filter": str(date.today())
            }
            
            response = self.session.get(f"{API_BASE}/diary/entries", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    entries_count = len(data)
                    self.log_result("Diary Entries Retrieval", True, f"Retrieved {entries_count} diary entries", 
                                  {"entries_count": entries_count})
                    return True
                else:
                    self.log_result("Diary Entries Retrieval", False, "Invalid response format - expected list", data)
            else:
                self.log_result("Diary Entries Retrieval", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Diary Entries Retrieval", False, f"Request error: {str(e)}")
        return False
    
    def test_daily_nutrition_summary(self):
        """Test daily nutrition summary endpoint"""
        try:
            today = str(date.today())
            response = self.session.get(f"{API_BASE}/diary/summary/{today}")
            
            if response.status_code == 200:
                data = response.json()
                if "total_calories" in data and "meals" in data:
                    self.log_result("Daily Nutrition Summary", True, f"Retrieved summary for {today}", 
                                  {"total_calories": data["total_calories"], "total_protein": data.get("total_protein")})
                    return True
                else:
                    self.log_result("Daily Nutrition Summary", False, "Invalid response format", data)
            else:
                self.log_result("Daily Nutrition Summary", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Daily Nutrition Summary", False, f"Request error: {str(e)}")
        return False
    
    def test_diary_entry_update(self):
        """Test diary entry update endpoint"""
        if not hasattr(self, 'entry_id'):
            self.log_result("Diary Entry Update", False, "No entry ID available from creation test")
            return False
        
        try:
            update_data = {
                "serving_size": 1.5,
                "nutrition": {
                    "calories": 420,
                    "protein": 12,
                    "carbs": 81,
                    "fat": 6,
                    "fiber": 12,
                    "sugar": 18,
                    "sodium": 300
                }
            }
            
            response = self.session.put(
                f"{API_BASE}/diary/entries/{self.entry_id}",
                json=update_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("serving_size") == 1.5:
                    self.log_result("Diary Entry Update", True, "Diary entry updated successfully", 
                                  {"entry_id": self.entry_id, "new_serving_size": data["serving_size"]})
                    return True
                else:
                    self.log_result("Diary Entry Update", False, "Entry not updated correctly", data)
            else:
                self.log_result("Diary Entry Update", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Diary Entry Update", False, f"Request error: {str(e)}")
        return False
    
    def test_weight_logging(self):
        """Test weight logging endpoint"""
        try:
            weight_data = {
                "date": str(date.today()),
                "weight": 64.5
            }
            
            response = self.session.post(
                f"{API_BASE}/diary/weight",
                json=weight_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if "entry_id" in data and data["weight"] == weight_data["weight"]:
                    self.log_result("Weight Logging", True, "Weight logged successfully", 
                                  {"entry_id": data["entry_id"], "weight": data["weight"]})
                    return True
                else:
                    self.log_result("Weight Logging", False, "Invalid response format", data)
            else:
                self.log_result("Weight Logging", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Weight Logging", False, f"Request error: {str(e)}")
        return False
    
    def test_weight_history(self):
        """Test weight history retrieval endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/diary/weight")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    weight_entries = len(data)
                    self.log_result("Weight History", True, f"Retrieved {weight_entries} weight entries", 
                                  {"entries_count": weight_entries})
                    return True
                else:
                    self.log_result("Weight History", False, "Invalid response format - expected list", data)
            else:
                self.log_result("Weight History", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Weight History", False, f"Request error: {str(e)}")
        return False
    
    def test_popular_foods(self):
        """Test popular foods endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/food/popular")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    popular_count = len(data)
                    self.log_result("Popular Foods", True, f"Retrieved {popular_count} popular foods", 
                                  {"popular_count": popular_count})
                    return True
                else:
                    self.log_result("Popular Foods", False, "Invalid response format - expected list", data)
            else:
                self.log_result("Popular Foods", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Popular Foods", False, f"Request error: {str(e)}")
        return False
    
    def test_diary_entry_deletion(self):
        """Test diary entry deletion endpoint"""
        if not hasattr(self, 'entry_id'):
            self.log_result("Diary Entry Deletion", False, "No entry ID available from creation test")
            return False
        
        try:
            response = self.session.delete(f"{API_BASE}/diary/entries/{self.entry_id}")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result("Diary Entry Deletion", True, "Diary entry deleted successfully", 
                                  {"entry_id": self.entry_id, "message": data["message"]})
                    return True
                else:
                    self.log_result("Diary Entry Deletion", False, "Invalid response format", data)
            else:
                self.log_result("Diary Entry Deletion", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Diary Entry Deletion", False, f"Request error: {str(e)}")
        return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🚀 Starting comprehensive backend API tests...")
        print(f"📍 Backend URL: {BASE_URL}")
        print(f"📍 API Base: {API_BASE}")
        print("=" * 80)
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Get Current User", self.test_get_current_user),
            ("Update User Profile", self.test_update_user_profile),
            ("Food Search", self.test_food_search),
            ("Food Details", self.test_food_details),
            ("Custom Food Creation", self.test_custom_food_creation),
            ("Diary Entry Creation", self.test_diary_entry_creation),
            ("Diary Entries Retrieval", self.test_diary_entries_retrieval),
            ("Daily Nutrition Summary", self.test_daily_nutrition_summary),
            ("Diary Entry Update", self.test_diary_entry_update),
            ("Weight Logging", self.test_weight_logging),
            ("Weight History", self.test_weight_history),
            ("Popular Foods", self.test_popular_foods),
            ("Diary Entry Deletion", self.test_diary_entry_deletion),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            print(f"\n🧪 Running: {test_name}")
            if test_func():
                passed += 1
            else:
                failed += 1
        
        print("\n" + "=" * 80)
        print(f"📊 TEST SUMMARY")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        return self.test_results

if __name__ == "__main__":
    tester = BackendTester()
    results = tester.run_all_tests()
    
    # Save results to file
    with open("/app/backend_test_results.json", "w") as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n💾 Detailed results saved to: /app/backend_test_results.json")