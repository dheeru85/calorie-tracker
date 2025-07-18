import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { diaryAPI } from '../utils/api';
import { formatCalories, formatMacros, getMotivationalMessage } from '../utils/helpers';
import { Calendar, Target, TrendingUp, Plus, Apple, Utensils, Moon, Coffee } from 'lucide-react';
import NutritionProgress from '../components/NutritionProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dailySummary, setDailySummary] = useState(null);
  const [weightEntries, setWeightEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryResponse, weightResponse] = await Promise.all([
        diaryAPI.getDailySummary(selectedDate),
        diaryAPI.getWeightEntries(7)
      ]);

      setDailySummary(summaryResponse.data);
      setWeightEntries(weightResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateCalorieGoal = () => {
    if (user?.target_calories) {
      return user.target_calories;
    }
    // Default goal based on user profile
    return 2000;
  };

  const calorieGoal = calculateCalorieGoal();
  const currentCalories = dailySummary?.total_calories || 0;
  const calorieProgress = (currentCalories / calorieGoal) * 100;

  const macroGoals = {
    protein: Math.round(calorieGoal * 0.25 / 4), // 25% of calories from protein
    carbs: Math.round(calorieGoal * 0.45 / 4),   // 45% of calories from carbs
    fat: Math.round(calorieGoal * 0.30 / 9)      // 30% of calories from fat
  };

  const quickStats = [
    {
      icon: Target,
      label: 'Daily Goal',
      value: formatCalories(calorieGoal),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: TrendingUp,
      label: 'Progress',
      value: `${Math.round(calorieProgress)}%`,
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Apple,
      label: 'Remaining',
      value: formatCalories(Math.max(0, calorieGoal - currentCalories)),
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const mealSummary = dailySummary?.meals || {};
  const mealTypes = [
    { type: 'breakfast', icon: Coffee, label: 'Breakfast', color: 'from-yellow-400 to-orange-400' },
    { type: 'lunch', icon: Utensils, label: 'Lunch', color: 'from-orange-400 to-red-400' },
    { type: 'dinner', icon: Moon, label: 'Dinner', color: 'from-red-400 to-purple-400' },
    { type: 'snack', icon: Apple, label: 'Snacks', color: 'from-green-400 to-blue-400' }
  ];

  if (loading) {
    return <LoadingSpinner size="large" text="Loading your dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Welcome back, {user?.full_name || user?.username}! 👋
          </h1>
          <p className="text-gray-600">
            {getMotivationalMessage(calorieProgress)}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field py-2 px-3 text-sm"
            />
          </div>
          <Link to="/food-search" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Food
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="card-vibrant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calorie Progress */}
      <div className="card-vibrant">
        <h2 className="text-xl font-bold mb-6">Daily Calorie Progress</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Calories</span>
            <span className="text-lg font-bold text-primary-600">
              {formatCalories(currentCalories)} / {formatCalories(calorieGoal)}
            </span>
          </div>
          
          <div className="nutrition-bar">
            <div 
              className="nutrition-bar-fill calories"
              style={{ width: `${Math.min(calorieProgress, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {calorieProgress < 100 ? 'Keep going!' : 'Goal reached! 🎉'}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(calorieProgress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Macro Progress */}
      <div className="card-vibrant">
        <h2 className="text-xl font-bold mb-6">Macronutrient Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Meal Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mealTypes.map((meal) => {
          const entries = mealSummary[meal.type] || [];
          const mealCalories = entries.reduce((sum, entry) => sum + (entry.nutrition?.calories || 0), 0);
          
          return (
            <div key={meal.type} className="card hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${meal.color} flex items-center justify-center`}>
                    <meal.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{meal.label}</h3>
                    <p className="text-sm text-gray-600">{formatCalories(mealCalories)} cal</p>
                  </div>
                </div>
                <Link
                  to={`/diary?meal=${meal.type}`}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </Link>
              </div>
              
              <div className="space-y-2">
                {entries.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No foods logged yet
                  </p>
                ) : (
                  entries.slice(0, 3).map((entry, index) => (
                    <div key={index} className="text-sm text-gray-700 truncate">
                      {entry.food_name} ({formatCalories(entry.nutrition?.calories || 0)} cal)
                    </div>
                  ))
                )}
                
                {entries.length > 3 && (
                  <p className="text-xs text-gray-500">
                    +{entries.length - 3} more items
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weight Tracking */}
      {weightEntries.length > 0 && (
        <div className="card-vibrant">
          <h2 className="text-xl font-bold mb-6">Recent Weight Entries</h2>
          <div className="space-y-3">
            {weightEntries.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">{entry.date}</span>
                <span className="font-medium">{entry.weight} kg</span>
              </div>
            ))}
          </div>
          <Link
            to="/profile"
            className="block text-center mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            View All Weight Entries
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/food-search" className="card hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Food</h3>
              <p className="text-sm text-gray-600">Search and log your meals</p>
            </div>
          </div>
        </Link>
        
        <Link to="/diary" className="card hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Diary</h3>
              <p className="text-sm text-gray-600">Check your food history</p>
            </div>
          </div>
        </Link>
        
        <Link to="/profile" className="card hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Update Goals</h3>
              <p className="text-sm text-gray-600">Adjust your targets</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;