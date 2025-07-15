import React, { useState, useEffect } from 'react';
import { 
  FaStar,
  FaHeart,
  FaAppleAlt,
  FaCube,
  FaGamepad,
  FaTrophy,
  FaSmile,
  FaCircle,
  FaSquare,
  FaPuzzlePiece,
  FaLeaf,
  FaCar,
  FaCat,
  FaDog,
  FaFish,
  FaTree,
  FaHome,
  FaBug,
  FaCarrot,
  FaBan,
  FaCheck,
  FaQuestion,
  FaRainbow,
  FaSun,
  FaMoon,
  FaCloud
} from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import nativeNotificationService from '../services/nativeNotificationService.js';
import apiService from '../services/apiService';

const InteractiveHomework = ({ homework, selectedChildId, onComplete }) => {
  const { isDark } = useTheme();
  const [currentActivity, setCurrentActivity] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [previousSubmission, setPreviousSubmission] = useState(null);
  const [isCheckingSubmission, setIsCheckingSubmission] = useState(true);

  // Enhanced activity generation system
  const getActivities = () => {
    const homeworkTitle = homework.title.toLowerCase();
    
    // Math Activities
    if (homeworkTitle.includes('basic addition') || homeworkTitle.includes('addition')) {
      return generateMathActivities('addition', 1, 5);
    }
    
    if (homeworkTitle.includes('subtraction')) {
      return generateMathActivities('subtraction', 1, 5);
    }
    
    if (homeworkTitle.includes('counting') || homeworkTitle.includes('numbers')) {
      return generateCountingActivities(1, 10);
    }
    
    // Shape Activities
    if (homeworkTitle.includes('shapes') || homeworkTitle.includes('geometry')) {
      return generateShapeActivities();
    }
    
    // Color Activities
    if (homeworkTitle.includes('colors') || homeworkTitle.includes('colour')) {
      return generateColorActivities();
    }
    
    // Letter Activities
    if (homeworkTitle.includes('letters') || homeworkTitle.includes('alphabet')) {
      return generateLetterActivities();
    }
    
    // Animal Activities
    if (homeworkTitle.includes('animals') || homeworkTitle.includes('pets')) {
      return generateAnimalActivities();
    }
    
    // Default fallback - mixed activities for general homework
    return generateMixedActivities();
  };
  
  // Math activity generators
  const generateMathActivities = (type, min, max) => {
    const activities = [];
    const mathIcons = [FaAppleAlt, FaCube, FaHeart, FaStar, FaCircle];
    const colors = ['text-red-500', 'text-blue-500', 'text-pink-500', 'text-yellow-500', 'text-green-500'];
    
    for (let i = 0; i < 5; i++) {
      if (type === 'addition') {
        const first = Math.floor(Math.random() * max) + 1;
        const second = Math.floor(Math.random() * (max - first + 1)) + 1;
        const answer = first + second;
        
        activities.push({
          id: i + 1,
          type: 'addition',
          question: `${first} + ${second} = ?`,
          instruction: 'Add the items together',
          items: [first, second],
          icon: mathIcons[i % mathIcons.length],
          color: colors[i % colors.length],
          correctAnswer: answer
        });
      } else if (type === 'subtraction') {
        const total = Math.floor(Math.random() * max) + 2;
        const subtract = Math.floor(Math.random() * (total - 1)) + 1;
        const answer = total - subtract;
        
        activities.push({
          id: i + 1,
          type: 'subtraction',
          question: `${total} - ${subtract} = ?`,
          instruction: 'Take away the items',
          items: [total, subtract],
          icon: mathIcons[i % mathIcons.length],
          color: colors[i % colors.length],
          correctAnswer: answer
        });
      }
    }
    
    return activities;
  };
  
  const generateCountingActivities = (min, max) => {
    const activities = [];
    const countingIcons = [FaAppleAlt, FaStar, FaHeart, FaLeaf, FaCar];
    const colors = ['text-red-500', 'text-yellow-500', 'text-pink-500', 'text-green-500', 'text-blue-500'];
    
    for (let i = 0; i < 5; i++) {
      const count = Math.floor(Math.random() * (max - min + 1)) + min;
      
      activities.push({
        id: i + 1,
        type: 'counting',
        question: 'Count the items!',
        instruction: 'How many do you see?',
        items: count,
        icon: countingIcons[i % countingIcons.length],
        color: colors[i % colors.length],
        correctAnswer: count
      });
    }
    
    return activities;
  };
  
  const generateShapeActivities = () => {
    const shapes = [
      { name: 'Circle', icon: FaCircle, color: 'text-blue-500' },
      { name: 'Square', icon: FaSquare, color: 'text-red-500' },
      { name: 'Star', icon: FaStar, color: 'text-yellow-500' }
    ];
    
    return shapes.map((shape, index) => ({
      id: index + 1,
      type: 'shape_recognition',
      question: `Which one is a ${shape.name}?`,
      instruction: `Find the ${shape.name}`,
      targetShape: shape.name,
      icon: shape.icon,
      color: shape.color,
      correctAnswer: shape.name
    }));
  };
  
  const generateColorActivities = () => {
    const colors = [
      { name: 'Red', icon: FaHeart, color: 'text-red-500', bgColor: 'bg-red-500' },
      { name: 'Blue', icon: FaCircle, color: 'text-blue-500', bgColor: 'bg-blue-500' },
      { name: 'Yellow', icon: FaSun, color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
      { name: 'Green', icon: FaLeaf, color: 'text-green-500', bgColor: 'bg-green-500' }
    ];
    
    return colors.map((color, index) => ({
      id: index + 1,
      type: 'color_recognition',
      question: `Which color is ${color.name}?`,
      instruction: `Find the ${color.name} color`,
      targetColor: color.name,
      icon: color.icon,
      color: color.color,
      bgColor: color.bgColor,
      correctAnswer: color.name
    }));
  };
  
  const generateLetterActivities = () => {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    
    return letters.map((letter, index) => ({
      id: index + 1,
      type: 'letter_recognition',
      question: `Which letter is ${letter}?`,
      instruction: `Find the letter ${letter}`,
      targetLetter: letter,
      icon: FaPuzzlePiece,
      color: 'text-purple-500',
      correctAnswer: letter
    }));
  };
  
  const generateAnimalActivities = () => {
    const animals = [
      { name: 'Cat', icon: FaCat, sound: 'Meow' },
      { name: 'Dog', icon: FaDog, sound: 'Woof' },
      { name: 'Fish', icon: FaFish, sound: 'Blub' }
    ];
    
    return animals.map((animal, index) => ({
      id: index + 1,
      type: 'animal_recognition',
      question: `Which animal says "${animal.sound}"?`,
      instruction: 'Find the animal that makes this sound',
      targetAnimal: animal.name,
      icon: animal.icon,
      color: 'text-orange-500',
      correctAnswer: animal.name
    }));
  };
  
  const generateMixedActivities = () => {
    // Fallback mixed activities for general homework
    return [
      {
        id: 1,
        type: 'counting',
        question: 'Count the stars!',
        instruction: 'How many stars do you see?',
        items: 3,
        icon: FaStar,
        color: 'text-yellow-500',
        correctAnswer: 3
      },
      {
        id: 2,
        type: 'addition',
        question: '2 + 1 = ?',
        instruction: 'Add the hearts together',
        items: [2, 1],
        icon: FaHeart,
        color: 'text-pink-500',
        correctAnswer: 3
      },
      {
        id: 3,
        type: 'shape_recognition',
        question: 'Which one is a Circle?',
        instruction: 'Find the Circle',
        targetShape: 'Circle',
        icon: FaCircle,
        color: 'text-blue-500',
        correctAnswer: 'Circle'
      }
    ];
  };

  const activities = getActivities();

  // Check if homework was already submitted on component mount
  useEffect(() => {
    const checkExistingSubmission = async () => {
      if (!homework?.id || !selectedChildId) {
        setIsCheckingSubmission(false);
        return;
      }

      try {
        // Check if this homework has already been submitted
        const response = await apiService.homework.getById(homework.id);
        
        // Look for submission by this child
        const existingSubmission = response.data.homework?.submissions?.find(
          sub => sub.child_id === parseInt(selectedChildId)
        );
        
        if (existingSubmission) {
          console.log('🔒 Interactive homework already submitted:', existingSubmission);
          setPreviousSubmission(existingSubmission);
          setHasBeenSubmitted(true);
          setIsCompleted(true);
          setShowResult(true);
          
          // Set the previous results
          setScore(existingSubmission.score || 0);
          if (existingSubmission.answers_data) {
            try {
              const previousAnswers = JSON.parse(existingSubmission.answers_data);
              setAnswers(previousAnswers);
            } catch (e) {
              console.warn('Could not parse previous answers:', e);
            }
          }
        }
      } catch (error) {
        console.error('Error checking existing submission:', error);
        // Continue anyway - don't block if we can't check
      } finally {
        setIsCheckingSubmission(false);
      }
    };

    checkExistingSubmission();
  }, [homework?.id, selectedChildId]);

  const renderCountingActivity = (activity) => {
    const IconComponent = activity.icon;
    const items = Array.from({ length: activity.items }, (_, i) => i);

    return (
      <div className="text-center space-y-6">
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {activity.question}
        </h3>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {activity.instruction}
        </p>
        
        {/* Visual items to count */}
        <div className="flex justify-center gap-4 my-8 flex-wrap">
          {items.map((_, index) => (
            <div key={index} className="transform transition-all duration-300 hover:scale-110">
              <IconComponent 
                className={`text-6xl ${activity.color} animate-bounce`}
                style={{ 
                  animationDelay: `${index * 0.2}s`,
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Answer buttons */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              onClick={() => handleAnswer(activity.id, num)}
              className={`p-4 text-2xl font-bold rounded-xl border-2 transition-all transform hover:scale-105 ${
                answers[activity.id] === num
                  ? num === activity.correctAnswer
                    ? 'bg-green-500 text-white border-green-600'
                    : 'bg-red-500 text-white border-red-600'
                  : isDark
                    ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              }`}
              disabled={answers[activity.id] !== undefined}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderAdditionActivity = (activity) => {
    const IconComponent = activity.icon;
    const [first, second] = activity.items;

    return (
      <div className="text-center space-y-6">
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {activity.question}
        </h3>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {activity.instruction}
        </p>
        
        {/* Visual representation */}
        <div className="flex justify-center items-center gap-8 my-8">
          {/* First group */}
          <div className="flex gap-2">
            {Array.from({ length: first }, (_, i) => (
              <IconComponent 
                key={`first-${i}`}
                className={`text-4xl ${activity.color}`}
              />
            ))}
          </div>
          
          {/* Plus sign */}
          <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            +
          </div>
          
          {/* Second group */}
          <div className="flex gap-2">
            {Array.from({ length: second }, (_, i) => (
              <IconComponent 
                key={`second-${i}`}
                className={`text-4xl ${activity.color}`}
              />
            ))}
          </div>
          
          {/* Equals sign */}
          <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            =
          </div>
          
          {/* Question mark */}
          <div className={'text-4xl font-bold text-purple-500'}>
            ?
          </div>
        </div>
        
        {/* Answer buttons */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              onClick={() => handleAnswer(activity.id, num)}
              className={`p-4 text-2xl font-bold rounded-xl border-2 transition-all transform hover:scale-105 ${
                answers[activity.id] === num
                  ? num === activity.correctAnswer
                    ? 'bg-green-500 text-white border-green-600'
                    : 'bg-red-500 text-white border-red-600'
                  : isDark
                    ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              }`}
              disabled={answers[activity.id] !== undefined}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderSubtractionActivity = (activity) => {
    const IconComponent = activity.icon;
    const [total, subtract] = activity.items;

    return (
      <div className="text-center space-y-6">
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {activity.question}
        </h3>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {activity.instruction}
        </p>
        
        {/* Visual representation */}
        <div className="flex justify-center items-center gap-8 my-8">
          {/* Total items */}
          <div className="flex gap-2 flex-wrap max-w-xs">
            {Array.from({ length: total }, (_, i) => (
              <IconComponent 
                key={`total-${i}`}
                className={`text-4xl ${i < subtract ? 'text-gray-400 line-through' : activity.color}`}
              />
            ))}
          </div>
          
          {/* Minus sign */}
          <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            -
          </div>
          
          {/* Subtract amount */}
          <div className="flex gap-2">
            {Array.from({ length: subtract }, (_, i) => (
              <IconComponent 
                key={`subtract-${i}`}
                className="text-4xl text-red-500"
              />
            ))}
          </div>
          
          {/* Equals sign */}
          <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            =
          </div>
          
          {/* Question mark */}
          <div className="text-4xl font-bold text-purple-500">
            ?
          </div>
        </div>
        
        {/* Answer buttons */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {[0, 1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              onClick={() => handleAnswer(activity.id, num)}
              className={`p-4 text-2xl font-bold rounded-xl border-2 transition-all transform hover:scale-105 ${
                answers[activity.id] === num
                  ? num === activity.correctAnswer
                    ? 'bg-green-500 text-white border-green-600'
                    : 'bg-red-500 text-white border-red-600'
                  : isDark
                    ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              }`}
              disabled={answers[activity.id] !== undefined}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderShapeRecognitionActivity = (activity) => {
    const shapes = [
      { name: 'Circle', icon: FaCircle },
      { name: 'Square', icon: FaSquare },
      { name: 'Star', icon: FaStar }
    ];

    return (
      <div className="text-center space-y-6">
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {activity.question}
        </h3>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {activity.instruction}
        </p>
        
        {/* Shape options */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto my-8">
          {shapes.map(shape => {
            const ShapeIcon = shape.icon;
            return (
              <button
                key={shape.name}
                onClick={() => handleAnswer(activity.id, shape.name)}
                className={`p-8 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  answers[activity.id] === shape.name
                    ? shape.name === activity.correctAnswer
                      ? 'bg-green-500 text-white border-green-600'
                      : 'bg-red-500 text-white border-red-600'
                    : isDark
                      ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'
                      : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                }`}
                disabled={answers[activity.id] !== undefined}
              >
                <ShapeIcon className="text-6xl mx-auto mb-2" />
                <div className="text-lg font-bold">{shape.name}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderColorRecognitionActivity = (activity) => {
    const colors = [
      { name: 'Red', bgColor: 'bg-red-500' },
      { name: 'Blue', bgColor: 'bg-blue-500' },
      { name: 'Yellow', bgColor: 'bg-yellow-500' },
      { name: 'Green', bgColor: 'bg-green-500' }
    ];

    return (
      <div className="text-center space-y-6">
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {activity.question}
        </h3>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {activity.instruction}
        </p>
        
        {/* Color options */}
        <div className="grid grid-cols-2 gap-6 max-w-md mx-auto my-8">
          {colors.map(color => (
            <button
              key={color.name}
              onClick={() => handleAnswer(activity.id, color.name)}
              className={`p-8 rounded-2xl border-4 transition-all transform hover:scale-105 ${
                answers[activity.id] === color.name
                  ? color.name === activity.correctAnswer
                    ? 'border-green-600 ring-4 ring-green-300'
                    : 'border-red-600 ring-4 ring-red-300'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              disabled={answers[activity.id] !== undefined}
            >
              <div className={`w-20 h-20 ${color.bgColor} rounded-full mx-auto mb-3`}></div>
              <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {color.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderLetterRecognitionActivity = (activity) => {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const shuffledLetters = [...letters].sort(() => Math.random() - 0.5).slice(0, 4);
    
    // Ensure target letter is included
    if (!shuffledLetters.includes(activity.targetLetter)) {
      shuffledLetters[Math.floor(Math.random() * shuffledLetters.length)] = activity.targetLetter;
    }

    return (
      <div className="text-center space-y-6">
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {activity.question}
        </h3>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {activity.instruction}
        </p>
        
        {/* Letter options */}
        <div className="grid grid-cols-2 gap-6 max-w-md mx-auto my-8">
          {shuffledLetters.map(letter => (
            <button
              key={letter}
              onClick={() => handleAnswer(activity.id, letter)}
              className={`p-8 text-6xl font-bold rounded-2xl border-2 transition-all transform hover:scale-105 ${
                answers[activity.id] === letter
                  ? letter === activity.correctAnswer
                    ? 'bg-green-500 text-white border-green-600'
                    : 'bg-red-500 text-white border-red-600'
                  : isDark
                    ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              }`}
              disabled={answers[activity.id] !== undefined}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderAnimalRecognitionActivity = (activity) => {
    const animals = [
      { name: 'Cat', icon: FaCat },
      { name: 'Dog', icon: FaDog },
      { name: 'Fish', icon: FaFish }
    ];

    return (
      <div className="text-center space-y-6">
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {activity.question}
        </h3>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {activity.instruction}
        </p>
        
        {/* Animal options */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto my-8">
          {animals.map(animal => {
            const AnimalIcon = animal.icon;
            return (
              <button
                key={animal.name}
                onClick={() => handleAnswer(activity.id, animal.name)}
                className={`p-8 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  answers[activity.id] === animal.name
                    ? animal.name === activity.correctAnswer
                      ? 'bg-green-500 text-white border-green-600'
                      : 'bg-red-500 text-white border-red-600'
                    : isDark
                      ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'
                      : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                }`}
                disabled={answers[activity.id] !== undefined}
              >
                <AnimalIcon className="text-6xl mx-auto mb-2 text-orange-500" />
                <div className="text-lg font-bold">{animal.name}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderNumberRecognitionActivity = (activity) => {
    return (
      <div className="text-center space-y-6">
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {activity.question}
        </h3>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {activity.instruction}
        </p>
        
        {/* Number options */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto my-8">
          {(activity.options || [1, 2, 3, 4, 5]).map(num => (
            <button
              key={num}
              onClick={() => handleAnswer(activity.id, num)}
              className={`p-8 text-4xl font-bold rounded-2xl border-2 transition-all transform hover:scale-105 ${
                answers[activity.id] === num
                  ? num === activity.correctAnswer
                    ? 'bg-green-500 text-white border-green-600'
                    : 'bg-red-500 text-white border-red-600'
                  : isDark
                    ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              }`}
              disabled={answers[activity.id] !== undefined}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleAnswer = (activityId, answer) => {
    const activity = activities.find(a => a.id === activityId);
    const isCorrect = answer === activity.correctAnswer;
    
    setAnswers(prev => ({ ...prev, [activityId]: answer }));
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      
      // Provide specific positive feedback based on activity type
      const encouragements = [
        'Excellent! 🌟',
        'Perfect! 🎉',
        'Well done! 👏',
        'Amazing! ✨',
        'Fantastic! 🚀',
        'Great job! 💫'
      ];
      
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      nativeNotificationService.success(randomEncouragement);
    } else {
      // Provide gentle, encouraging feedback for incorrect answers
      const hints = {
        'counting': `Count again! The correct answer is ${activity.correctAnswer} 😊`,
        'addition': `Try adding again! ${activity.items?.[0]} + ${activity.items?.[1]} = ${activity.correctAnswer} 🔢`,
        'subtraction': `Think about taking away! ${activity.items?.[0]} - ${activity.items?.[1]} = ${activity.correctAnswer} ➖`,
        'shape_recognition': `Look for the ${activity.correctAnswer}! 🔺`,
        'color_recognition': `Find the ${activity.correctAnswer} color! 🎨`,
        'letter_recognition': `Look for the letter ${activity.correctAnswer}! 📝`,
        'animal_recognition': `The ${activity.correctAnswer} makes that sound! 🐾`,
        'number_recognition': `Look for the number ${activity.correctAnswer}! 🔢`
      };
      
      const feedback = hints[activity.type] || `Not quite right. The answer is ${activity.correctAnswer} 😊`;
      nativeNotificationService.error(feedback);
    }
    
    // Auto advance after 2.5 seconds (slightly longer for reading feedback)
    setTimeout(() => {
      if (currentActivity < activities.length - 1) {
        setCurrentActivity(prev => prev + 1);
      } else {
        completeHomework();
      }
    }, 2500);
  };

  const completeHomework = async () => {
    setIsCompleted(true);
    setShowResult(true);
    
    const percentage = Math.round((score / activities.length) * 100);
    const results = {
      score,
      totalQuestions: activities.length,
      percentage,
      answers
    };
    
    // Auto-submit interactive homework
    await submitInteractiveHomework(results);
    
    if (onComplete) {
      onComplete(results);
    }
  };

  const submitInteractiveHomework = async (results) => {
    if (hasBeenSubmitted || isSubmitting) {
      console.log('🚫 Submission blocked - already submitted or in progress');
      return; // Prevent duplicate submissions
    }

    try {
      setIsSubmitting(true);
      setSubmissionError(null);
      
      // Prepare submission data for interactive homework
      const formData = new FormData();
      formData.append('child_id', selectedChildId);
      formData.append('interactive_score', results.percentage);
      formData.append('time_spent', Math.round(activities.length * 2)); // Estimated time
      formData.append('answers', JSON.stringify(results.answers));
      formData.append('comments', `Interactive homework completed with ${results.score}/${results.totalQuestions} correct answers (${results.percentage}%)`);
      
      console.log('🎮 Auto-submitting interactive homework:', {
        homework_id: homework.id,
        child_id: selectedChildId,
        child_id_type: typeof selectedChildId,
        score: results.percentage,
        answers: results.answers
      });
      
      // Verify child_id is not null/undefined
      if (!selectedChildId) {
        console.error('❌ selectedChildId is missing:', selectedChildId);
        nativeNotificationService.error('Child ID is missing. Please refresh the page and try again.');
        return;
      }
      
      // Submit to API
      const response = await apiService.homework.submit(homework.id, formData);
      
      if (response.data.success) {
        setHasBeenSubmitted(true);
        setPreviousSubmission({
          score: results.percentage,
          submitted_at: new Date().toISOString(),
          answers_data: JSON.stringify(results.answers)
        });
        nativeNotificationService.success(`🎉 Homework submitted automatically! Score: ${results.percentage}%`);
        console.log('✅ Interactive homework auto-submitted successfully:', response.data);
      } else {
        throw new Error(response.data.message || 'Failed to submit homework');
      }
      
    } catch (error) {
      console.error('❌ Error auto-submitting interactive homework:', error);
      setSubmissionError(error.message || 'Failed to submit homework automatically');
      
      // For interactive homework, if submission fails, we should still lock it
      // because the student already completed the activities
      setHasBeenSubmitted(true);
      
      nativeNotificationService.error('Homework completed but submission failed. Please contact your teacher.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove resetHomework function - interactive homework should not be resetable
  // const resetHomework = () => {
  //   setCurrentActivity(0);
  //   setAnswers({});
  //   setScore(0);
  //   setIsCompleted(false);
  //   setShowResult(false);
  // };

  if (showResult) {
    const percentage = Math.round((score / activities.length) * 100);
    
    return (
      <div className={`rounded-xl p-8 border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="text-center space-y-6">
          <FaTrophy className="text-6xl text-yellow-500 mx-auto animate-bounce" />
          
          <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Homework Complete!
          </h2>
          
          <div className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            You scored <span className="font-bold text-green-500">{score}/{activities.length}</span>
          </div>
          
          <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            That's {percentage}%! 
            {percentage >= 80 ? ' Excellent work! 🌟' : 
              percentage >= 60 ? ' Good job! Keep practicing! 😊' : 
                ' Great effort! 💪'}
          </div>
          
          {/* Submission Status */}
          <div className={`rounded-lg p-4 border ${
            hasBeenSubmitted && !submissionError
              ? isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
              : submissionError
                ? isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                : isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-center">
              <div className={`mr-3 ${
                hasBeenSubmitted && !submissionError ? 'text-green-500' 
                  : submissionError ? 'text-red-500'
                    : 'text-blue-500'
              }`}>
                {hasBeenSubmitted && !submissionError ? '✅' 
                  : submissionError ? '❌'
                    : isSubmitting ? '⏳' : '📤'}
              </div>
              <div>
                <p className={`font-semibold ${
                  hasBeenSubmitted && !submissionError
                    ? isDark ? 'text-green-400' : 'text-green-800'
                    : submissionError
                      ? isDark ? 'text-red-400' : 'text-red-800'
                      : isDark ? 'text-blue-400' : 'text-blue-800'
                }`}>
                  {hasBeenSubmitted && !submissionError ? 'Homework Submitted Successfully!' 
                    : submissionError ? 'Submission Failed'
                      : isSubmitting ? 'Submitting homework...' : 'Submitting homework...'}
                </p>
                <p className={`text-sm ${
                  hasBeenSubmitted && !submissionError
                    ? isDark ? 'text-green-300' : 'text-green-700'
                    : submissionError
                      ? isDark ? 'text-red-300' : 'text-red-700'
                      : isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  {hasBeenSubmitted && !submissionError
                    ? `Your score of ${percentage}% has been recorded and sent to your teacher.`
                    : submissionError
                      ? 'Your homework was completed but could not be submitted. Please contact your teacher.'
                      : 'Your answers and score are being sent to your teacher...'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Note about one-time completion */}
          <div className={`text-sm italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            🔒 Interactive homework can only be completed once and is automatically submitted.
            {previousSubmission && (
              <div className="mt-2 text-xs">
                Originally submitted: {new Date(previousSubmission.submitted_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking for existing submissions
  if (isCheckingSubmission) {
    return (
      <div className={`rounded-xl p-8 border text-center ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Checking homework status...
        </p>
      </div>
    );
  }

  // If homework was already submitted, show locked state
  if (hasBeenSubmitted && showResult) {
    const percentage = previousSubmission ? 
      previousSubmission.score : 
      Math.round((score / activities.length) * 100);
    
    return (
      <div className={`rounded-xl p-8 border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="text-center space-y-6">
          <div className="text-6xl">🔒</div>
          
          <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Homework Already Completed
          </h2>
          
          <div className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Your final score: <span className="font-bold text-green-500">{score}/{activities.length}</span>
          </div>
          
          <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Final Score: {percentage}%! 
            {percentage >= 80 ? ' Excellent work! 🌟' : 
              percentage >= 60 ? ' Good job! 😊' : 
                ' Great effort! 💪'}
          </div>
          
          <div className={`rounded-lg p-4 border ${
            isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-center">
              <div className="text-green-500 mr-3">✅</div>
              <div>
                <p className={`font-semibold ${
                  isDark ? 'text-green-400' : 'text-green-800'
                }`}>
                  Submission Confirmed
                </p>
                <p className={`text-sm ${
                  isDark ? 'text-green-300' : 'text-green-700'
                }`}>
                  Your homework has been submitted and recorded.
                </p>
              </div>
            </div>
          </div>
          
          <div className={`text-sm italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            🔒 Interactive homework can only be completed once.
            {previousSubmission?.submitted_at && (
              <div className="mt-2 text-xs">
                Submitted: {new Date(previousSubmission.submitted_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentActivityData = activities[currentActivity];

  return (
    <div className={`rounded-xl p-6 border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Enhanced Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Question {currentActivity + 1} of {activities.length}
          </span>
          <div className="flex items-center space-x-2">
            <FaTrophy className="text-yellow-500 text-sm" />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Score: {score}/{activities.length}
            </span>
          </div>
        </div>
        <div className={`w-full bg-gray-200 rounded-full h-3 ${isDark ? 'bg-gray-700' : ''} overflow-hidden`}>
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${((currentActivity + 1) / activities.length) * 100}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between mt-1">
          {activities.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentActivity
                  ? 'bg-green-500 scale-110'
                  : 'bg-gray-300 scale-75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Activity content */}
      <div className="min-h-[400px] flex flex-col justify-center">
        {currentActivityData.type === 'counting' && renderCountingActivity(currentActivityData)}
        {currentActivityData.type === 'addition' && renderAdditionActivity(currentActivityData)}
        {currentActivityData.type === 'subtraction' && renderSubtractionActivity(currentActivityData)}
        {currentActivityData.type === 'number_recognition' && renderNumberRecognitionActivity(currentActivityData)}
        {currentActivityData.type === 'shape_recognition' && renderShapeRecognitionActivity(currentActivityData)}
        {currentActivityData.type === 'color_recognition' && renderColorRecognitionActivity(currentActivityData)}
        {currentActivityData.type === 'letter_recognition' && renderLetterRecognitionActivity(currentActivityData)}
        {currentActivityData.type === 'animal_recognition' && renderAnimalRecognitionActivity(currentActivityData)}
        {currentActivityData.type === 'general' && (
          <div className="text-center space-y-6">
            <FaGamepad className="text-6xl text-green-500 mx-auto animate-pulse" />
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentActivityData.question}
            </h3>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentActivityData.instruction}
            </p>
            <button
              onClick={() => handleAnswer(currentActivityData.id, 1)}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors transform hover:scale-105"
            >
              <FaSmile className="w-4 h-4 mr-2" />
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveHomework;
