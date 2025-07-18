import React from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { formatCalories, formatMacros, getMealIcon, getMealColor } from '../utils/helpers';

const MealCard = ({ 
  mealType, 
  entries = [], 
  onAddFood, 
  onEditEntry, 
  onDeleteEntry,
  totalCalories = 0
}) => {
  const mealIcon = getMealIcon(mealType);
  const mealColor = getMealColor(mealType);
  const mealName = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  return (
    <div className={`meal-card ${mealType}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${mealColor} flex items-center justify-center text-white text-xl shadow-lg`}>
            {mealIcon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{mealName}</h3>
            <p className="text-sm text-gray-600">
              {formatCalories(totalCalories)} calories
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onAddFood(mealType)}
          className="p-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Food Entries */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No foods logged yet</p>
            <button
              onClick={() => onAddFood(mealType)}
              className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-300"
            >
              Add your first food
            </button>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.entry_id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900 truncate">
                    {entry.food_name}
                  </h4>
                  {entry.brand && (
                    <span className="text-xs text-gray-500 truncate">
                      • {entry.brand}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-600">
                    {entry.serving_size} {entry.serving_unit}
                  </span>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>{formatCalories(entry.nutrition.calories)} cal</span>
                    <span>P: {formatMacros(entry.nutrition.protein)}</span>
                    <span>C: {formatMacros(entry.nutrition.carbs)}</span>
                    <span>F: {formatMacros(entry.nutrition.fat)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-3">
                <button
                  onClick={() => onEditEntry(entry)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => onDeleteEntry(entry.entry_id)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MealCard;