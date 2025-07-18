import { format, isToday, isYesterday, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (typeof date === 'string') {
    date = parseISO(date);
  }
  
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM dd, yyyy');
  }
};

export const formatCalories = (calories) => {
  return Math.round(calories).toLocaleString();
};

export const formatMacros = (grams) => {
  return `${Math.round(grams)}g`;
};

export const calculateCaloriesFromMacros = (protein, carbs, fat) => {
  return (protein * 4) + (carbs * 4) + (fat * 9);
};

export const calculateMacroPercentage = (macro, totalCalories) => {
  const macroCalories = macro * (macro === 'fat' ? 9 : 4);
  return totalCalories > 0 ? (macroCalories / totalCalories) * 100 : 0;
};

export const getMealIcon = (mealType) => {
  const icons = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎'
  };
  return icons[mealType] || '🍽️';
};

export const getMealColor = (mealType) => {
  const colors = {
    breakfast: 'from-yellow-400 to-orange-400',
    lunch: 'from-orange-400 to-red-400',
    dinner: 'from-red-400 to-purple-400',
    snack: 'from-green-400 to-blue-400'
  };
  return colors[mealType] || 'from-gray-400 to-gray-500';
};

export const calculateBMR = (weight, height, age, gender) => {
  // Using Mifflin-St Jeor Equation
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

export const calculateTDEE = (bmr, activityLevel) => {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  return bmr * (activityMultipliers[activityLevel] || 1.2);
};

export const getCalorieGoal = (tdee, goal) => {
  switch (goal) {
    case 'lose':
      return tdee - 500; // 1 lb per week
    case 'gain':
      return tdee + 500; // 1 lb per week
    default:
      return tdee; // maintain
  }
};

export const getNutritionBarWidth = (current, target) => {
  if (target === 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(percentage, 100);
};

export const getProgressColor = (current, target) => {
  const percentage = (current / target) * 100;
  
  if (percentage < 50) {
    return 'text-red-500';
  } else if (percentage < 80) {
    return 'text-yellow-500';
  } else if (percentage <= 100) {
    return 'text-green-500';
  } else {
    return 'text-orange-500';
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const formatWeight = (weight, unit = 'kg') => {
  if (unit === 'lbs') {
    return `${Math.round(weight * 2.205)} lbs`;
  }
  return `${Math.round(weight * 10) / 10} kg`;
};

export const formatHeight = (height, unit = 'cm') => {
  if (unit === 'ft') {
    const feet = Math.floor(height / 30.48);
    const inches = Math.round((height % 30.48) / 2.54);
    return `${feet}'${inches}"`;
  }
  return `${Math.round(height)} cm`;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const getMotivationalMessage = (progress) => {
  if (progress < 25) {
    return "Every journey starts with a single step! 🚀";
  } else if (progress < 50) {
    return "You're making great progress! Keep it up! 💪";
  } else if (progress < 75) {
    return "Halfway there! You're doing amazing! 🌟";
  } else if (progress < 100) {
    return "Almost there! You've got this! 🔥";
  } else {
    return "Goal achieved! You're crushing it! 🎉";
  }
};