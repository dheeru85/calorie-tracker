import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { foodAPI, diaryAPI } from '../utils/api';
import { debounce } from '../utils/helpers';
import { Search, Filter, Clock, Star } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const FoodSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [servingSize, setServingSize] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mealParam = queryParams.get('meal');

  useEffect(() => {
    if (mealParam) {
      setSelectedMeal(mealParam);
    }
    fetchPopularFoods();
  }, [mealParam]);

  const fetchPopularFoods = async () => {
    try {
      const response = await foodAPI.getPopularFoods();
      setPopularFoods(response.data);
    } catch (error) {
      console.error('Error fetching popular foods:', error);
    }
  };

  const debouncedSearch = debounce(async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await foodAPI.searchFoods(query, page, 20);
      setSearchResults(response.data.foods);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error searching foods:', error);
      toast.error('Failed to search foods');
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, page]);

  const handleAddFood = (food) => {
    setSelectedFood(food);
    setServingSize(1);
    setShowAddModal(true);
  };

  const handleViewDetails = (food) => {
    setSelectedFood(food);
    setServingSize(1);
    setShowAddModal(true);
  };

  const confirmAddFood = async () => {
    if (!selectedFood) return;

    try {
      const nutrition = {
        calories: selectedFood.nutrition.calories * servingSize,
        protein: selectedFood.nutrition.protein * servingSize,
        carbs: selectedFood.nutrition.carbs * servingSize,
        fat: selectedFood.nutrition.fat * servingSize,
        fiber: selectedFood.nutrition.fiber * servingSize,
        sugar: selectedFood.nutrition.sugar * servingSize,
        sodium: selectedFood.nutrition.sodium * servingSize
      };

      const entryData = {
        date: new Date().toISOString().split('T')[0],
        meal_type: selectedMeal,
        fdc_id: selectedFood.fdc_id,
        food_name: selectedFood.description,
        brand: selectedFood.brand_owner,
        serving_size: selectedFood.serving_size * servingSize,
        serving_unit: selectedFood.serving_unit,
        nutrition
      };

      await diaryAPI.createEntry(entryData);
      toast.success('Food added to diary! 🍽️');
      setShowAddModal(false);
      setSelectedFood(null);
    } catch (error) {
      console.error('Error adding food to diary:', error);
      toast.error('Failed to add food to diary');
    }
  };

  const mealOptions = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snack', label: 'Snack', icon: '🍎' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold gradient-text mb-2">Find Your Food</h1>
        <p className="text-gray-600">Search thousands of foods and track your nutrition</p>
      </div>

      {/* Search Bar */}
      <div className="card-vibrant">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for foods (e.g., chicken breast, apple, quinoa)"
              className="input-field pl-10 pr-4"
            />
          </div>
          <button className="btn-outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>

        {/* Meal Selection */}
        <div className="flex flex-wrap gap-2">
          {mealOptions.map((meal) => (
            <button
              key={meal.value}
              onClick={() => setSelectedMeal(meal.value)}
              className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300 ${
                selectedMeal === meal.value
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-vibrant'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>{meal.icon}</span>
              <span className="font-medium">{meal.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Search Results</h2>
            {searchResults.length > 0 && (
              <p className="text-gray-600">
                Found {searchResults.length} foods
              </p>
            )}
          </div>

          {loading ? (
            <LoadingSpinner text="Searching foods..." />
          ) : searchResults.length === 0 && searchQuery.length >= 3 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No foods found for "{searchQuery}"</p>
              <p className="text-sm text-gray-500">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((food) => (
                <FoodCard
                  key={food.fdc_id}
                  food={food}
                  onAddToMeal={handleAddFood}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    page === i + 1
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Popular Foods */}
      {!searchQuery && popularFoods.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold">Your Popular Foods</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularFoods.map((food, index) => (
              <div key={index} className="card hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{food._id}</h3>
                    {food.brand && (
                      <p className="text-sm text-gray-600">{food.brand}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Used {food.count} times
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {Math.round(food.nutrition?.calories || 0)} cal
                    </p>
                    <p className="text-xs text-gray-500">
                      Last: {new Date(food.last_used).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddFood({
                    fdc_id: food.fdc_id,
                    description: food._id,
                    brand_owner: food.brand,
                    nutrition: food.nutrition,
                    serving_size: 100,
                    serving_unit: 'g'
                  })}
                  className="w-full btn-secondary text-sm"
                >
                  Add to {selectedMeal}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default State */}
      {!searchQuery && popularFoods.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Start Searching for Foods</h2>
          <p className="text-gray-600 mb-6">
            Search our extensive database of foods to track your nutrition
          </p>
          <div className="max-w-md mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Try searching for 'chicken breast' or 'apple'"
              className="input-field"
            />
          </div>
        </div>
      )}

      {/* Add Food Modal */}
      {showAddModal && selectedFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add to {selectedMeal}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedFood.description}</h4>
                {selectedFood.brand_owner && (
                  <p className="text-sm text-gray-600">{selectedFood.brand_owner}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serving Size
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={servingSize}
                    onChange={(e) => setServingSize(parseFloat(e.target.value) || 1)}
                    min="0.1"
                    step="0.1"
                    className="input-field flex-1"
                  />
                  <span className="text-sm text-gray-600">
                    × {selectedFood.serving_size} {selectedFood.serving_unit}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium mb-2">Nutrition per serving:</h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Calories:</span>
                    <span className="font-medium ml-2">
                      {Math.round(selectedFood.nutrition.calories * servingSize)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Protein:</span>
                    <span className="font-medium ml-2">
                      {Math.round(selectedFood.nutrition.protein * servingSize)}g
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Carbs:</span>
                    <span className="font-medium ml-2">
                      {Math.round(selectedFood.nutrition.carbs * servingSize)}g
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fat:</span>
                    <span className="font-medium ml-2">
                      {Math.round(selectedFood.nutrition.fat * servingSize)}g
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddFood}
                  className="flex-1 btn-primary"
                >
                  Add to Diary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodSearchPage;