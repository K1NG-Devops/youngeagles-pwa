import React, { useState, useEffect } from 'react';
import { 
  FaStar,
  FaHeart,
  FaAppleAlt,
  FaCube,
  FaGamepad,
  FaTrophy,
  FaSmile
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

  // Define interactive activities based on homework type
  const getActivities = () => {
    if (homework.title.includes('Basic Addition 1-5')) {
      return [
        {
          id: 1,
          type: 'counting',
          question: 'Count the apples!',
          instruction: 'How many apples do you see?',
          items: 3,
          icon: FaAppleAlt,
          color: 'text-red-500',
          correctAnswer: 3
        },
        {
          id: 2,
          type: 'addition',
          question: '2 + 1 = ?',
          instruction: 'Add the blocks together',
          items: [2, 1],
          icon: FaCube,
          color: 'text-blue-500',
          correctAnswer: 3
        },
        {
          id: 3,
          type: 'addition',
          question: '3 + 2 = ?',
          instruction: 'Count all the hearts',
          items: [3, 2],
          icon: FaHeart,
          color: 'text-pink-500',
          correctAnswer: 5
        },
        {
          id: 4,
          type: 'addition',
          question: '1 + 4 = ?',
          instruction: 'Add the stars together',
          items: [1, 4],
          icon: FaStar,
          color: 'text-yellow-500',
          correctAnswer: 5
        },
        {
          id: 5,
          type: 'number_recognition',
          question: 'Which number is 4?',
          instruction: 'Click on the number 4',
          options: [2, 4, 3, 1, 5],
          correctAnswer: 4
        }
      ];
    }
    
    // Default activities for other homework types
    return [
      {
        id: 1,
        type: 'general',
        question: 'Let\'s get started!',
        instruction: 'This homework has interactive activities coming soon!',
        icon: FaGamepad,
        color: 'text-green-500',
        correctAnswer: 1
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
        <div className="flex justify-center gap-4 my-8">
          {items.map((_, index) => (
            <IconComponent 
              key={index}
              className={`text-6xl ${activity.color} animate-bounce`}
              style={{ animationDelay: `${index * 0.2}s` }}
            />
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
          {activity.options.map(num => (
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
      nativeNotificationService.success('Correct! Well done! 🎉');
    } else {
      nativeNotificationService.error(`Not quite right. The answer is ${activity.correctAnswer} 😊`);
    }
    
    // Auto advance after 2 seconds
    setTimeout(() => {
      if (currentActivity < activities.length - 1) {
        setCurrentActivity(prev => prev + 1);
      } else {
        completeHomework();
      }
    }, 2000);
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
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Question {currentActivity + 1} of {activities.length}
          </span>
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Score: {score}/{activities.length}
          </span>
        </div>
        <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-gray-700' : ''}`}>
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentActivity + 1) / activities.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Activity content */}
      <div className="min-h-[400px] flex flex-col justify-center">
        {currentActivityData.type === 'counting' && renderCountingActivity(currentActivityData)}
        {currentActivityData.type === 'addition' && renderAdditionActivity(currentActivityData)}
        {currentActivityData.type === 'number_recognition' && renderNumberRecognitionActivity(currentActivityData)}
        {currentActivityData.type === 'general' && (
          <div className="text-center space-y-6">
            <FaGamepad className="text-6xl text-green-500 mx-auto" />
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentActivityData.question}
            </h3>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentActivityData.instruction}
            </p>
            <button
              onClick={() => handleAnswer(currentActivityData.id, 1)}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
