import React, { useState, useEffect } from 'react';
import { diaryAPI } from '../utils/api';
import { formatDate } from '../utils/helpers';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import MealCard from '../components/MealCard';
import NutritionProgress from '../components/NutritionProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const DiaryPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailySummary, setDailySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editServingSize, setEditServingSize] = useState(1);

  useEffect(() => {
    fetchDailySummary();
  }, [selectedDate]);

  const fetchDailySummary = async () => {
    try {
      setLoading(true);
      const response = await diaryAPI.getDailySummary(selectedDate);
      setDailySummary(response.data);
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      toast.error('Failed to load diary data');
    } finally {
      setLoading(false);
    }
  };

  const navigateDate = (direction) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + direction);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const handleAddFood = (mealType) => {
    window.location.href = `/food-search?meal=${mealType}`;
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setEditServingSize(entry.serving_size / (entry.serving_size / 1)); // Calculate multiplier
    setShowEditModal(true);
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      await diaryAPI.deleteEntry(entryId);
      toast.success('Entry deleted successfully');
      fetchDailySummary();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry) return;

    try {
      const originalNutrition = editingEntry.nutrition;
      
      const updatedNutrition = {
        calories: (originalNutrition.calories / editingEntry.serving_size) * editServingSize,
        protein: (originalNutrition.protein / editingEntry.serving_size) * editServingSize,
        carbs: (originalNutrition.carbs / editingEntry.serving_size) * editServingSize,
        fat: (originalNutrition.fat / editingEntry.serving_size) * editServingSize,
        fiber: (originalNutrition.fiber / editingEntry.serving_size) * editServingSize,
        sugar: (originalNutrition.sugar / editingEntry.serving_size) * editServingSize,
        sodium: (originalNutrition.sodium / editingEntry.serving_size) * editServingSize
      };

      const updateData = {
        serving_size: editServingSize,
        nutrition: updatedNutrition
      };

      await diaryAPI.updateEntry(editingEntry.entry_id, updateData);
      toast.success('Entry updated successfully');
      setShowEditModal(false);
      setEditingEntry(null);
      fetchDailySummary();
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Failed to update entry');
    }
  };

  const macroGoals = {
    protein: 150, // Example goals
    carbs: 200,
    fat: 67
  };

  const calorieGoal = 2000; // Example goal

  if (loading) {
    return <LoadingSpinner size="large" text="Loading your diary..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold gradient-text mb-2">Food Diary</h1>
        <p className="text-gray-600">Track your daily nutrition and meals</p>
      </div>

      {/* Date Navigation */}
      <div className="card-vibrant">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {formatDate(selectedDate)}
            </h2>
          </div>
          
          <button
            onClick={() => navigateDate(1)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="mt-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field w-auto mx-auto"
          />
        </div>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calorie Progress */}
        <div className="card-vibrant">
          <h3 className="text-lg font-bold mb-4">Daily Progress</h3>
          <NutritionProgress
            current={dailySummary?.total_calories || 0}
            target={calorieGoal}
            label="Calories"
            unit="kcal"
          />
          
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600">
                {Math.round(dailySummary?.total_calories || 0)}
              </p>
              <p className="text-sm text-gray-600">Consumed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-600">
                {Math.max(0, calorieGoal - (dailySummary?.total_calories || 0))}
              </p>
              <p className="text-sm text-gray-600">Remaining</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700">
                {calorieGoal}
              </p>
              <p className="text-sm text-gray-600">Goal</p>
            </div>
          </div>
        </div>

        {/* Macro Progress */}
        <div className="card-vibrant">
          <h3 className="text-lg font-bold mb-4">Macronutrients</h3>
          <div className="space-y-4">
            <NutritionProgress
              current={dailySummary?.total_protein || 0}
              target={macroGoals.protein}
              label="Protein"
              unit="g"
              color="protein"
            />
            <NutritionProgress
              current={dailySummary?.total_carbs || 0}
              target={macroGoals.carbs}
              label="Carbs"
              unit="g"
              color="carbs"
            />
            <NutritionProgress
              current={dailySummary?.total_fat || 0}
              target={macroGoals.fat}
              label="Fat"
              unit="g"
              color="fat"
            />
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-6">
        {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => (
          <MealCard
            key={mealType}
            mealType={mealType}
            entries={dailySummary?.meals?.[mealType] || []}
            onAddFood={handleAddFood}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            totalCalories={
              (dailySummary?.meals?.[mealType] || []).reduce(
                (sum, entry) => sum + (entry.nutrition?.calories || 0),
                0
              )
            }
          />
        ))}
      </div>

      {/* Quick Add Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => handleAddFood('breakfast')}
          className="w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-vibrant hover:shadow-vibrant-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Edit Entry Modal */}
      {showEditModal && editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit Entry</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">{editingEntry.food_name}</h4>
                {editingEntry.brand && (
                  <p className="text-sm text-gray-600">{editingEntry.brand}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serving Size
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={editServingSize}
                    onChange={(e) => setEditServingSize(parseFloat(e.target.value) || 1)}
                    min="0.1"
                    step="0.1"
                    className="input-field flex-1"
                  />
                  <span className="text-sm text-gray-600">
                    {editingEntry.serving_unit}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium mb-2">Updated nutrition:</h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Calories:</span>
                    <span className="font-medium ml-2">
                      {Math.round((editingEntry.nutrition.calories / editingEntry.serving_size) * editServingSize)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Protein:</span>
                    <span className="font-medium ml-2">
                      {Math.round((editingEntry.nutrition.protein / editingEntry.serving_size) * editServingSize)}g
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Carbs:</span>
                    <span className="font-medium ml-2">
                      {Math.round((editingEntry.nutrition.carbs / editingEntry.serving_size) * editServingSize)}g
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fat:</span>
                    <span className="font-medium ml-2">
                      {Math.round((editingEntry.nutrition.fat / editingEntry.serving_size) * editServingSize)}g
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEntry}
                  className="flex-1 btn-primary"
                >
                  Update Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryPage;