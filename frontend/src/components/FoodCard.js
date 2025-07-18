import React from 'react';
import { Plus, Info } from 'lucide-react';
import { formatCalories, formatMacros } from '../utils/helpers';

const FoodCard = ({ food, onAddToMeal, onViewDetails, showAddButton = true }) => {
  const { description, brand_owner, nutrition, serving_size, serving_unit } = food;

  const handleAddClick = (e) => {
    e.stopPropagation();
    onAddToMeal(food);
  };

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    onViewDetails(food);
  };

  return (
    <div 
      className="card-vibrant cursor-pointer hover:scale-105 transition-transform duration-300"
      onClick={() => onViewDetails(food)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate mb-1">
            {description}
          </h3>
          {brand_owner && (
            <p className="text-sm text-gray-600 truncate mb-2">
              by {brand_owner}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Per {serving_size} {serving_unit}
          </p>
        </div>
        
        {showAddButton && (
          <button
            onClick={handleAddClick}
            className="ml-3 p-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Nutrition Summary */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {formatCalories(nutrition.calories)}
          </div>
          <div className="text-xs text-gray-600">Calories</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">
            {formatMacros(nutrition.protein)}
          </div>
          <div className="text-xs text-gray-600">Protein</div>
        </div>
      </div>

      {/* Macros Bar */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-600">
          <span>C: {formatMacros(nutrition.carbs)}</span>
          <span>F: {formatMacros(nutrition.fat)}</span>
          <span>Fiber: {formatMacros(nutrition.fiber)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleDetailsClick}
          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-300"
        >
          <Info size={14} />
          <span className="text-sm font-medium">Details</span>
        </button>
        
        {showAddButton && (
          <button
            onClick={handleAddClick}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white transition-all duration-300"
          >
            <Plus size={14} />
            <span className="text-sm font-medium">Add</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FoodCard;