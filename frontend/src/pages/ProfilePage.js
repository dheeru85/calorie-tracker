import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { diaryAPI } from '../utils/api';
import { useForm } from 'react-hook-form';
import { User, Settings, Target, TrendingUp, Scale, Save, Edit3 } from 'lucide-react';
import { calculateBMR, calculateTDEE, getCalorieGoal, formatWeight } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [weightEntries, setWeightEntries] = useState([]);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      age: user?.age || '',
      gender: user?.gender || '',
      height: user?.height || '',
      weight: user?.weight || '',
      activity_level: user?.activity_level || 'sedentary',
      goal: user?.goal || 'maintain'
    }
  });

  useEffect(() => {
    fetchWeightEntries();
    if (user) {
      reset({
        full_name: user.full_name || '',
        age: user.age || '',
        gender: user.gender || '',
        height: user.height || '',
        weight: user.weight || '',
        activity_level: user.activity_level || 'sedentary',
        goal: user.goal || 'maintain'
      });
    }
  }, [user, reset]);

  const fetchWeightEntries = async () => {
    try {
      const response = await diaryAPI.getWeightEntries(30);
      setWeightEntries(response.data);
    } catch (error) {
      console.error('Error fetching weight entries:', error);
    }
  };

  const onSubmitProfile = async (data) => {
    setLoading(true);
    try {
      const result = await updateProfile(data);
      if (result.success) {
        toast.success('Profile updated successfully! 🎉');
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogWeight = async () => {
    if (!newWeight) return;

    try {
      await diaryAPI.logWeight({
        date: weightDate,
        weight: parseFloat(newWeight)
      });
      toast.success('Weight logged successfully! 📈');
      setShowWeightModal(false);
      setNewWeight('');
      fetchWeightEntries();
    } catch (error) {
      console.error('Error logging weight:', error);
      toast.error('Failed to log weight');
    }
  };

  const calculateCalories = () => {
    if (!user?.weight || !user?.height || !user?.age || !user?.gender) {
      return { bmr: 0, tdee: 0, goal: 2000 };
    }

    const bmr = calculateBMR(user.weight, user.height, user.age, user.gender);
    const tdee = calculateTDEE(bmr, user.activity_level);
    const goal = getCalorieGoal(tdee, user.goal);

    return { bmr, tdee, goal };
  };

  const { bmr, tdee, goal: calorieGoal } = calculateCalories();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'progress', label: 'Progress', icon: TrendingUp }
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little/no exercise)' },
    { value: 'light', label: 'Light (light exercise 1-3 days/week)' },
    { value: 'moderate', label: 'Moderate (moderate exercise 3-5 days/week)' },
    { value: 'active', label: 'Active (hard exercise 6-7 days/week)' },
    { value: 'very_active', label: 'Very Active (very hard exercise, physical job)' }
  ];

  const goals = [
    { value: 'lose', label: 'Lose Weight' },
    { value: 'maintain', label: 'Maintain Weight' },
    { value: 'gain', label: 'Gain Weight' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">
          {user?.full_name || user?.username}
        </h1>
        <p className="text-gray-600">Manage your profile and settings</p>
      </div>

      {/* Tabs */}
      <div className="card-vibrant">
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-vibrant'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Personal Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-outline"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      {...register('full_name', { required: 'Full name is required' })}
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      {...register('age', { 
                        required: 'Age is required',
                        min: { value: 13, message: 'Age must be at least 13' },
                        max: { value: 120, message: 'Age must be less than 120' }
                      })}
                      type="number"
                      className="input-field"
                      placeholder="Enter your age"
                    />
                    {errors.age && (
                      <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      {...register('gender', { required: 'Gender is required' })}
                      className="input-field"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (cm)
                    </label>
                    <input
                      {...register('height', { 
                        required: 'Height is required',
                        min: { value: 100, message: 'Height must be at least 100cm' },
                        max: { value: 250, message: 'Height must be less than 250cm' }
                      })}
                      type="number"
                      className="input-field"
                      placeholder="Enter your height in cm"
                    />
                    {errors.height && (
                      <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      {...register('weight', { 
                        required: 'Weight is required',
                        min: { value: 30, message: 'Weight must be at least 30kg' },
                        max: { value: 300, message: 'Weight must be less than 300kg' }
                      })}
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="Enter your weight in kg"
                    />
                    {errors.weight && (
                      <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activity Level
                    </label>
                    <select
                      {...register('activity_level', { required: 'Activity level is required' })}
                      className="input-field"
                    >
                      {activityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                    {errors.activity_level && (
                      <p className="text-red-500 text-sm mt-1">{errors.activity_level.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Goal
                    </label>
                    <select
                      {...register('goal', { required: 'Goal is required' })}
                      className="input-field"
                    >
                      {goals.map((goal) => (
                        <option key={goal.value} value={goal.value}>
                          {goal.label}
                        </option>
                      ))}
                    </select>
                    {errors.goal && (
                      <p className="text-red-500 text-sm mt-1">{errors.goal.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-lg font-semibold">{user?.full_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Age</label>
                    <p className="text-lg font-semibold">{user?.age || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <p className="text-lg font-semibold capitalize">{user?.gender || 'Not set'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Height</label>
                    <p className="text-lg font-semibold">{user?.height ? `${user.height} cm` : 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Weight</label>
                    <p className="text-lg font-semibold">{user?.weight ? `${user.weight} kg` : 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Activity Level</label>
                    <p className="text-lg font-semibold capitalize">{user?.activity_level?.replace('_', ' ') || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Calorie & Goal Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-blue-50 border-blue-200">
                <div className="text-center">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-600 mb-1">BMR</p>
                  <p className="text-2xl font-bold text-blue-700">{Math.round(bmr)}</p>
                  <p className="text-xs text-blue-600">calories/day</p>
                </div>
              </div>
              
              <div className="card bg-green-50 border-green-200">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-600 mb-1">TDEE</p>
                  <p className="text-2xl font-bold text-green-700">{Math.round(tdee)}</p>
                  <p className="text-xs text-green-600">calories/day</p>
                </div>
              </div>
              
              <div className="card bg-orange-50 border-orange-200">
                <div className="text-center">
                  <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-orange-600 mb-1">Goal</p>
                  <p className="text-2xl font-bold text-orange-700">{Math.round(calorieGoal)}</p>
                  <p className="text-xs text-orange-600">calories/day</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">About Your Numbers</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>BMR:</strong> Calories your body needs at rest</li>
                <li><strong>TDEE:</strong> Total calories you burn daily with activity</li>
                <li><strong>Goal:</strong> Target calories based on your weight goal</li>
              </ul>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Weight Progress</h2>
              <button
                onClick={() => setShowWeightModal(true)}
                className="btn-primary"
              >
                <Scale className="w-4 h-4 mr-2" />
                Log Weight
              </button>
            </div>

            {weightEntries.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card bg-purple-50 border-purple-200">
                    <div className="text-center">
                      <p className="text-sm text-purple-600 mb-1">Current Weight</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {formatWeight(weightEntries[0]?.weight || 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="card bg-blue-50 border-blue-200">
                    <div className="text-center">
                      <p className="text-sm text-blue-600 mb-1">Starting Weight</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatWeight(weightEntries[weightEntries.length - 1]?.weight || 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="card bg-green-50 border-green-200">
                    <div className="text-center">
                      <p className="text-sm text-green-600 mb-1">Change</p>
                      <p className="text-2xl font-bold text-green-700">
                        {weightEntries.length > 1 ? 
                          `${(weightEntries[0].weight - weightEntries[weightEntries.length - 1].weight).toFixed(1)} kg` : 
                          '0 kg'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Recent Entries</h3>
                  {weightEntries.slice(0, 10).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">{entry.date}</span>
                      <span className="font-medium">{formatWeight(entry.weight)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Scale className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No weight entries yet</p>
                <button
                  onClick={() => setShowWeightModal(true)}
                  className="btn-primary"
                >
                  Log Your First Weight
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Log Weight</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="input-field"
                  placeholder="Enter your weight"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={weightDate}
                  onChange={(e) => setWeightDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogWeight}
                  disabled={!newWeight}
                  className="flex-1 btn-primary"
                >
                  Log Weight
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;