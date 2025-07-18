import React from 'react';
import { formatCalories, formatMacros, getNutritionBarWidth, getProgressColor } from '../utils/helpers';

const NutritionProgress = ({ 
  current, 
  target, 
  type, 
  label, 
  unit = 'kcal',
  color = 'primary'
}) => {
  const width = getNutritionBarWidth(current, target);
  const progressColor = getProgressColor(current, target);

  const getBarColorClass = () => {
    switch (color) {
      case 'protein':
        return 'nutrition-bar-fill protein';
      case 'carbs':
        return 'nutrition-bar-fill carbs';
      case 'fat':
        return 'nutrition-bar-fill fat';
      default:
        return 'nutrition-bar-fill calories';
    }
  };

  const formatValue = (value) => {
    if (unit === 'kcal') {
      return formatCalories(value);
    } else {
      return formatMacros(value);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-semibold ${progressColor}`}>
          {formatValue(current)} / {formatValue(target)} {unit}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="nutrition-bar">
        <div 
          className={`${getBarColorClass()} transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>

      {/* Percentage */}
      <div className="text-right">
        <span className={`text-xs font-medium ${progressColor}`}>
          {Math.round(width)}%
        </span>
      </div>
    </div>
  );
};

export default NutritionProgress;