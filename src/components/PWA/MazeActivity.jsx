import React, { useState, useEffect } from 'react';
import { FaUndo, FaPlay, FaCheckCircle } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const MazeActivity = ({ onComplete, difficulty = 'easy', onLevelChange }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  // Load saved state from localStorage
  const loadSavedState = () => {
    try {
      const savedState = localStorage.getItem('mazeGameState');
      if (savedState) {
        const state = JSON.parse(savedState);
        // Only restore state if it's from the same difficulty level
        if (state.difficulty === difficulty) {
          // If we have a saved state, make sure we set the correct difficulty level
          if (onLevelChange) {
            onLevelChange(state.difficulty);
          }
          return state;
        }
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
    return null;
  };

  // Initialize state with saved values or defaults
  const savedState = loadSavedState();
  const [commands, setCommands] = useState(savedState?.commands || []);
  const [robotPosition, setRobotPosition] = useState(savedState?.robotPosition || { x: 0, y: 0 });
  const [isExecuting, setIsExecuting] = useState(false);
  const [gameStatus, setGameStatus] = useState(savedState?.gameStatus || 'idle');
  const [score, setScore] = useState(savedState?.score || 0);
  const [attempts, setAttempts] = useState(savedState?.attempts || 0);
  const [timeElapsed, setTimeElapsed] = useState(savedState?.timeElapsed || 0);
  const [isTimerRunning, setIsTimerRunning] = useState(savedState?.isTimerRunning || false);
  const [completedLevels, setCompletedLevels] = useState(() => {
    try {
      const saved = localStorage.getItem('mazeGameProgress');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNextLevelPrompt, setShowNextLevelPrompt] = useState(false);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [nextLevel, setNextLevel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [attemptStatus, setAttemptStatus] = useState(null);

  // Load attempt status
  useEffect(() => {
    const loadAttemptStatus = async () => {
      try {
        const response = await apiService.get('/api/activities/attempt-status/maze-robot');
        setAttemptStatus(response.data.status);
      } catch (error) {
        console.error('Error loading attempt status:', error);
      }
    };

    loadAttemptStatus();
  }, []);

  // Different maze configurations based on difficulty - 5 levels total
  const mazes = {
    easy: {
      grid: [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 2]
      ],
      size: 5,
      maxCommands: 8,
      name: 'Beginner'
      // description: 'Simple maze with basic obstacles'
    },
    medium: {
      grid: [
        [0, 0, 1, 0, 0, 0],
        [0, 1, 1, 0, 1, 0],
        [0, 0, 0, 0, 1, 0],
        [1, 1, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0, 2]
      ],
      size: 6,
      maxCommands: 12,
      name: 'Intermediate',
      description: 'More walls and tricky paths'
    },
    hard: {
      grid: [
        [0, 0, 1, 0, 0, 0, 0],
        [0, 1, 1, 0, 1, 1, 0],
        [0, 0, 0, 0, 1, 0, 0],
        [1, 1, 0, 1, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 1],
        [0, 1, 1, 1, 0, 1, 1],
        [0, 0, 0, 0, 0, 0, 2]
      ],
      size: 7,
      maxCommands: 15,
      name: 'Advanced',
      description: 'Complex maze with multiple dead ends'
    },
    expert: {
      grid: [
        [0, 0, 1, 0, 0, 1, 0, 0],
        [0, 1, 1, 0, 1, 1, 0, 1],
        [0, 0, 0, 0, 1, 0, 0, 0],
        [1, 1, 0, 1, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 1, 1, 0, 1, 2]
      ],
      size: 8,
      maxCommands: 18,
      name: 'Expert',
      description: 'Large maze with intricate patterns'
    },
    master: {
      grid: [
        [0, 0, 1, 0, 0, 1, 0, 0, 0],
        [0, 1, 1, 0, 1, 1, 0, 1, 0],
        [0, 0, 0, 0, 1, 0, 0, 1, 0],
        [1, 1, 0, 1, 1, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 1],
        [0, 1, 1, 1, 0, 1, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 1, 1, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 2]
      ],
      size: 9,
      maxCommands: 22,
      name: 'Master',
      description: 'Ultimate challenge - largest and most complex maze'
    }
  };
  const levelOrder = ['easy', 'medium', 'hard', 'expert', 'master'];
  // Check if a level is unlocked
  const isLevelUnlocked = (level) => {
    if (level === 'easy') return true; // First level is always unlocked
    const levelIndex = levelOrder.indexOf(level);
    if (levelIndex === -1) return false; // Invalid level
    const previousLevel = levelOrder[levelIndex - 1];
    return completedLevels.includes(previousLevel);
  };

  // Ensure we're using a valid difficulty level
  const validDifficulty = levelOrder.includes(difficulty) && isLevelUnlocked(difficulty) ? difficulty : 'easy';
  const currentMaze = mazes[validDifficulty];
  // Save progress to localStorage
  const saveProgress = (level) => {
    const updatedProgress = [...completedLevels];
    if (!updatedProgress.includes(level)) {
      updatedProgress.push(level);
      setCompletedLevels(updatedProgress);
      localStorage.setItem('mazeGameProgress', JSON.stringify(updatedProgress));
      console.log(`Level ${level} completed and saved. Progress:`, updatedProgress);
    } else {
      console.log(`Level ${level} already completed. Progress:`, updatedProgress);
    }
  };
  // Reset all progress (for testing or if player wants to start over)
  const resetProgress = () => {
    setCompletedLevels([]);
    localStorage.removeItem('mazeGameProgress');
    if (onLevelChange) {
      onLevelChange('easy'); // Go back to first level
    }
  };
  // Handle level change with unlock validation
  const handleLevelChange = (level) => {
    if (isLevelUnlocked(level) && onLevelChange) {
      onLevelChange(level);
    }
  };
  
  // Use handleLevelChange function to avoid unused variable warning
  React.useEffect(() => {
    // This effect ensures the function is "used" in the component
    if (typeof handleLevelChange === 'function') {
      // Function is available if needed
    }
  }, []);

  // Save state to localStorage
  const saveState = () => {
    if (gameStatus === 'completed') {
      // Don't save completed state to avoid restoring to a completed level
      localStorage.removeItem('mazeGameState');
      return;
    }

    try {
      const state = {
        commands,
        robotPosition,
        gameStatus,
        score,
        attempts,
        timeElapsed,
        isTimerRunning,
        difficulty
      };
      localStorage.setItem('mazeGameState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  // Save state whenever relevant values change
  useEffect(() => {
    if (!isExecuting) { // Only save when not executing commands
      saveState();
    }
  }, [commands, robotPosition, gameStatus, score, attempts, timeElapsed, isTimerRunning, difficulty, isExecuting]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          // Update saved state with new time
          const savedState = JSON.parse(localStorage.getItem('mazeGameState') || '{}');
          localStorage.setItem('mazeGameState', JSON.stringify({
            ...savedState,
            timeElapsed: newTime
          }));
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Clear saved state when changing difficulty
  useEffect(() => {
    if (validDifficulty !== difficulty) {
      localStorage.removeItem('mazeGameState');
    }
  }, [validDifficulty, difficulty]);

  const getScoreColor = () => {
    if (score >= 150) return 'text-green-500';
    if (score >= 120) return 'text-yellow-500';
    return 'text-orange-500';
  };
  // Notify parent if difficulty was auto-corrected
  useEffect(() => {
    if (validDifficulty !== difficulty && onLevelChange) {
      onLevelChange(validDifficulty);
    }
  }, [validDifficulty, difficulty, onLevelChange]);
  
  // Auto-reset when component unmounts (user leaves the game)
  useEffect(() => {
    return () => {
      // Reset game state when leaving the component
      setCommands([]);
      setRobotPosition({ x: 0, y: 0 });
      setGameStatus('idle');
      setIsExecuting(false);
      setTimeElapsed(0);
      setIsTimerRunning(false);
      setShowConfetti(false);
      setShowNextLevelPrompt(false);
      setShowGameComplete(false);
      setScore(0);
      setAttempts(0);
      setAttemptStatus(null); // Reset attempt status
    };
  }, []);

  // Load last submission
  useEffect(() => {
    const loadLastSubmission = async () => {
      try {
        const response = await apiService.get('/api/activities/history');
        const submissions = response.data.submissions || [];
        const lastMazeSubmission = submissions.find(s => s.activity_type === 'maze');
        if (lastMazeSubmission) {
          setLastSubmission(lastMazeSubmission);
        }
      } catch (error) {
        console.error('Error loading submission history:', error);
      }
    };

    loadLastSubmission();
  }, []);

  // Function to submit activity results
  const submitActivity = async (result, isFinal = false) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const submission = {
        activityId: 'maze-robot',
        activityType: 'maze',
        score: result.score,
        timeElapsed: result.timeElapsed,
        attempts: result.attempts,
        commandsUsed: result.commandsUsed,
        completed: result.completed,
        difficulty: result.difficulty,
        isFinal,
        metadata: {
          commands: result.commands,
          robotPosition: result.robotPosition,
          levelProgress: result.levelProgress
        }
      };

      const response = await apiService.post('/api/activities/submit', submission);
      
      if (response.data.success) {
        setLastSubmission({
          ...submission,
          submitted_at: new Date().toISOString()
        });
        setAttemptStatus(response.data.attemptStatus);
      }

      return response.data;
    } catch (error) {
      console.error('Error submitting activity:', error);
      setSubmitError('Failed to submit activity. Please try again.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modify the existing handleActivityComplete function
  const handleActivityComplete = async (result) => {
    try {
      // Submit the activity result
      await submitActivity({
        ...result,
        commands,
        robotPosition,
        levelProgress: completedLevels,
        completed: true
      });

      // Call the original onComplete handler if provided
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error('Error handling activity completion:', error);
    }
  };

  // Add submission status display
  const renderSubmissionStatus = () => {
    if (isSubmitting) {
      return (
        <div className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
          Submitting activity...
        </div>
      );
    }

    if (submitError) {
      return (
        <div className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
          {submitError}
        </div>
      );
    }

    if (lastSubmission) {
      return (
        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Last submitted: {new Date(lastSubmission.submitted_at).toLocaleString()}
          {lastSubmission.completed && ' (Completed)'}
        </div>
      );
    }

    return null;
  };

  // Add attempt status display
  const renderAttemptStatus = () => {
    if (!attemptStatus) return null;

    const statusColor = attemptStatus.canSubmit 
      ? isDark ? 'text-green-300' : 'text-green-600'
      : isDark ? 'text-red-300' : 'text-red-600';

    return (
      <div className={`text-sm ${statusColor}`}>
        {attemptStatus.hasFinalSubmission ? (
          'Final submission completed. Waiting for admin reset.'
        ) : (
          `Attempts remaining: ${attemptStatus.attemptsRemaining} of 2`
        )}
      </div>
    );
  };

  // Add the submission status to the UI
  const addCommand = (direction) => {
    if (commands.length < currentMaze.maxCommands && gameStatus === 'idle') {
      setCommands([...commands, direction]);
      if (!isTimerRunning) {
        setIsTimerRunning(true);
      }
    }
  };
  const removeLastCommand = () => {
    if (commands.length > 0 && gameStatus === 'idle') {
      setCommands(commands.slice(0, -1));
    }
  };
  const clearCommands = () => {
    if (gameStatus === 'idle') {
      setCommands([]);
      setRobotPosition({ x: 0, y: 0 });
      // Don't clear saved state here to allow undo
    }
  };
  const resetGame = () => {
    setCommands([]);
    setRobotPosition({ x: 0, y: 0 });
    setGameStatus('idle');
    setIsExecuting(false);
    setTimeElapsed(0);
    setIsTimerRunning(false);
    // Clear saved state when explicitly resetting
    localStorage.removeItem('mazeGameState');
  };
  // Modify the executeCommands function to handle attempt limits
  const executeCommands = async () => {
    if (commands.length === 0) return;
    
    // Check if we can still submit
    if (!attemptStatus?.canSubmit) {
      setGameStatus('locked');
      return;
    }

    setIsExecuting(true);
    setGameStatus('running');
    setAttempts(prev => prev + 1);
    let currentPos = { x: 0, y: 0 };

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      const newPos = { ...currentPos };
      // Calculate new position based on command
      switch (command) {
      case 'up':
        newPos.y = Math.max(0, currentPos.y - 1);
        break;
      case 'down':
        newPos.y = Math.min(currentMaze.size - 1, currentPos.y + 1);
        break;
      case 'left':
        newPos.x = Math.max(0, currentPos.x - 1);
        break;
      case 'right':
        newPos.x = Math.min(currentMaze.size - 1, currentPos.x + 1);
        break;
      default:
        break;
      }
      // Check if robot hits a wall
      if (currentMaze.grid[newPos.y][newPos.x] === 1) {
        setGameStatus('failed');
        setIsExecuting(false);
        setIsTimerRunning(false);
        return;
      }
      // Update position with animation delay
      currentPos = newPos;
      setRobotPosition(newPos);

      // Wait for smooth animation transition
      await new Promise(resolve => setTimeout(resolve, 300));
      // Check if robot reached the goal
      if (currentMaze.grid[newPos.y][newPos.x] === 2) {
        // Enhanced scoring system based on difficulty
        const difficultyMultiplier = {
          easy: 1,
          medium: 1.5,
          hard: 2,
          expert: 2.5,
          master: 3
        }[validDifficulty];
        const baseScore = 100 * difficultyMultiplier;
        const timeBonus = Math.max(0, (120 - timeElapsed) * difficultyMultiplier);
        const commandsBonus = Math.max(0, (currentMaze.maxCommands - commands.length) * 10 * difficultyMultiplier);
        const attemptsBonus = Math.max(0, (4 - attempts) * 20 * difficultyMultiplier);
        const perfectBonus = (attempts === 1 && commands.length <= currentMaze.maxCommands * 0.7) ? 50 * difficultyMultiplier : 0;

        const totalScore = Math.round(baseScore + timeBonus + commandsBonus + attemptsBonus + perfectBonus);

        setScore(totalScore);
        setGameStatus('completed');
        setIsExecuting(false);
        setIsTimerRunning(false);

        // Save progress for this level
        saveProgress(validDifficulty);

        if (onComplete) {
          onComplete({
            difficulty: validDifficulty,
            score: totalScore,
            timeElapsed,
            attempts,
            commandsUsed: commands.length
          });
        }

        // Show celebration and prompt for next level or game completion
        const currentLevelIndex = levelOrder.indexOf(validDifficulty);
        const nextLevelId = levelOrder[currentLevelIndex + 1];

        setShowConfetti(true);
        
        if (validDifficulty === 'master') {
          // Final level completed - show game completion celebration
          setTimeout(() => {
            setShowGameComplete(true);
          }, 2000); // Show game complete modal after longer celebration
        } else if (nextLevelId && onLevelChange) {
          // Regular level completion - show next level prompt
          setNextLevel(nextLevelId);
          setTimeout(() => {
            setShowNextLevelPrompt(true);
          }, 1500); // Show prompt after celebration
        }
        return;
      }
    }
    // If we reach here, robot didn't reach goal but didn't hit wall either
    setGameStatus('failed');
    setIsExecuting(false);
    setIsTimerRunning(false);
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleNextLevel = () => {
    setShowConfetti(false);
    setShowNextLevelPrompt(false);
    resetGame();
    if (nextLevel && onLevelChange) {
      // Use Tailwind's transform and transition classes for smooth level change
      const mazeContainer = document.getElementById('maze-container');
      if (mazeContainer) {
        mazeContainer.className += ' -translate-x-full opacity-0';
        setTimeout(() => {
          onLevelChange(nextLevel);
          mazeContainer.className = mazeContainer.className.replace(' -translate-x-full opacity-0', ' translate-x-0 opacity-100');
        }, 300);
      } else {
        onLevelChange(nextLevel);
      }
    }
  };

  const handleGameComplete = () => {
    setShowConfetti(false);
    setShowGameComplete(false);
    resetGame();
    // Optionally reset to first level or keep on master level
    if (onLevelChange) {
      onLevelChange('easy'); // Reset to first level for replay
    }
  };

  // Add a new function to handle manual state reset
  const resetAllProgress = () => {
    localStorage.removeItem('mazeGameState');
    localStorage.removeItem('mazeGameProgress');
    setCommands([]);
    setRobotPosition({ x: 0, y: 0 });
    setGameStatus('idle');
    setIsExecuting(false);
    setTimeElapsed(0);
    setIsTimerRunning(false);
    setScore(0);
    setAttempts(0);
    setCompletedLevels([]);
    setAttemptStatus(null); // Reset attempt status
    if (onLevelChange) {
      onLevelChange('easy');
    }
  };

  // Add a reset button to the UI
  const renderResetButton = () => {
    if (savedState) {
      return (
        <button
          onClick={resetAllProgress}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDark 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          Reset All Progress
        </button>
      );
    }
    return null;
  };

  // Update the UI to show attempt status and submission state
  return (
    <div className={`min-h-screen mt-18 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-2`}>
      <div id="maze-container" className={`w-full max-w-4xl mx-auto px-3 rounded-xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-lg relative transition-all duration-500 ease-in-out transform ${gameStatus === 'completed' ? 'scale-105' : ''}`}>
        {/* Header */}
        <div className="text-center mb-4 pt-4">
          <div className="flex justify-between items-center px-4">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              🤖 Robot Maze Navigator
            </h2>
            <div className="flex flex-col items-end">
              {renderAttemptStatus()}
              {renderSubmissionStatus()}
            </div>
            {renderResetButton()}
          </div>
          
          {/* Rest of the existing header content */}
          <div className={`inline-flex items-center px-4 py-2 rounded-lg mb-2 ${validDifficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
            validDifficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
              validDifficulty === 'hard' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                validDifficulty === 'expert' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
          }`}>
            <span className="font-semibold">Level {Object.keys(mazes).indexOf(validDifficulty) + 1}: {currentMaze.name}</span>
            {validDifficulty === 'easy' && <span className="ml-2">⭐</span>}
            {validDifficulty === 'medium' && <span className="ml-2">⭐⭐</span>}
            {validDifficulty === 'hard' && <span className="ml-2">⭐⭐⭐</span>}
            {validDifficulty === 'expert' && <span className="ml-2">⭐⭐⭐⭐</span>}
            {validDifficulty === 'master' && <span className="ml-2">⭐⭐⭐⭐⭐</span>}
          </div>

          {/* Level Auto-Correction Notice */}
          {validDifficulty !== difficulty && (
            <div className={`text-xs px-3 py-1 rounded-full mb-2 ${isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
              ⚠️ Level {Object.keys(mazes).indexOf(difficulty) + 1} is locked. Complete previous levels to unlock it!
            </div>
          )}

          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
            {currentMaze.description}
          </p>

          {/* Overall Progress */}
          <div className="flex items-center justify-center space-x-2">
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Progress:</span>
            <div className="flex space-x-1">
              {levelOrder.map((level, index) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-full ${completedLevels.includes(level)
                    ? 'bg-green-500'
                    : level === validDifficulty
                      ? 'bg-blue-500'
                      : isLevelUnlocked(level)
                        ? isDark ? 'bg-gray-600' : 'bg-gray-300'
                        : isDark ? 'bg-gray-800' : 'bg-gray-200'
                  }`}
                  title={`Level ${index + 1}: ${mazes[level].name} ${completedLevels.includes(level) ? '(Completed)' :
                    level === difficulty ? '(Current)' :
                      isLevelUnlocked(level) ? '(Available)' : '(Locked)'
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {completedLevels.length}/{levelOrder.length}
            </span>
          </div>
        </div>

        {/* Maze Game Container */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Maze Grid */}
          <div className="flex-1 flex justify-center">
            <div className="maze-grid" style={{ gridTemplateColumns: `repeat(${currentMaze.size}, 1fr)` }}>
              {currentMaze.grid.map((row, y) =>
                row.map((cell, x) => {
                  const isRobot = robotPosition.x === x && robotPosition.y === y;
                  let cellClass = 'maze-cell ';

                  if (isRobot) {
                    cellClass += 'maze-cell-robot';
                  } else if (cell === 1) {
                    cellClass += 'maze-cell-wall';
                  } else if (cell === 2) {
                    cellClass += 'maze-cell-goal';
                  } else {
                    cellClass += 'maze-cell-empty';
                  }

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={cellClass}
                    >
                      {isRobot && '🤖'}
                      {!isRobot && cell === 2 && '🎯'}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Controls Panel */}
          <div className="flex-1 max-w-md mx-auto lg:mx-0">
            {/* Execute Button */}
            <div className="flex justify-center mb-4">
              <button
                onClick={executeCommands}
                disabled={isExecuting || commands.length === 0 || gameStatus === 'running' || !attemptStatus?.canSubmit}
                className={`flex items-center px-6 py-3 rounded-lg hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed transition-colors font-medium ${
                  attemptStatus?.canSubmit
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-400 text-white'
                }`}
              >
                <FaPlay className="mr-2" />
                {isExecuting ? 'Running...' : attemptStatus?.canSubmit ? 'Execute Commands' : 'Submission Locked'}
              </button>
            </div>

            {/* Command Buttons */}
            <div className="mb-4">
              <h3 className={`text-base font-semibold mb-2 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Add Commands
              </h3>
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] sm:max-w-xs">
                  <div></div>
                  <button
                    onClick={() => addCommand('up')}
                    disabled={isExecuting || commands.length >= currentMaze.maxCommands || gameStatus !== 'idle'}
                    className="px-2 text-xl bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    ↑
                  </button>
                  <div></div>

                  <button
                    onClick={() => addCommand('left')}
                    disabled={isExecuting || commands.length >= currentMaze.maxCommands || gameStatus !== 'idle'}
                    className="px-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    ←
                  </button>
                  <div></div>
                  <button
                    onClick={() => addCommand('right')}
                    disabled={isExecuting || commands.length >= currentMaze.maxCommands || gameStatus !== 'idle'}
                    className="px-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    →
                  </button>

                  <div></div>
                  <button
                    onClick={() => addCommand('down')}
                    disabled={isExecuting || commands.length >= currentMaze.maxCommands || gameStatus !== 'idle'}
                    className="px-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    ↓
                  </button>
                  <div></div>
                </div>
              </div>
            </div>

            {/* Commands Display */}
            <div className="mb-4">
              <h3 className={`text-base font-semibold mb-2 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Command Sequence
              </h3>
              <div className={`min-h-[60px] p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                {commands.length === 0 ? (
                  <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No commands yet. Add some directions above!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {commands.map((command, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium"
                      >
                        {command}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <button
                onClick={removeLastCommand}
                disabled={isExecuting || commands.length === 0 || gameStatus !== 'idle'}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaUndo className="mr-2" />
                Undo
              </button>

              <button
                onClick={clearCommands}
                disabled={isExecuting || gameStatus === 'running'}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Clear All
              </button>

              <button
                onClick={resetGame}
                className="flex items-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Reset Game
              </button>

              {/* Reset Progress Button (for development/testing) */}
              {(completedLevels.length > 0 && process.env.NODE_ENV === 'development') && (
                <button
                  onClick={resetProgress}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs"
                  title="Reset all level progress"
                >
                  🔄 Reset Progress
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-40 animate-confetti">
            {[...Array(validDifficulty === 'master' ? 100 : 50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-3 rounded-full"
                style={{
                  backgroundColor: validDifficulty === 'master' 
                    ? ['#FFD700', '#FF69B4', '#00FF00', '#4169E1', '#FF4500', '#9400D3', '#FF1493'][i % 7]
                    : ['#FFD700', '#FF69B4', '#00FF00', '#4169E1'][i % 4],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `confetti-fall ${1 + Math.random() * 3}s linear forwards`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
            {/* Extra celebration elements for game completion */}
            {validDifficulty === 'master' && [
              ...Array(20).fill(0).map((_, i) => (
                <div
                  key={`star-${i}`}
                  className="absolute text-2xl animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `star-twinkle ${2 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                  ⭐
                </div>
              ))
            ]}
          </div>
        )}

        {/* Next Level Prompt */}
        {showNextLevelPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
            <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 scale-100`}>
              <h3 className="text-xl font-bold mb-3 text-center">🎉 Level Complete!</h3>
              <p className="text-sm mb-4 text-center">
                Ready to take on the next challenge?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleNextLevel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                >
                  Next Level →
                </button>
                <button
                  onClick={() => {
                    setShowConfetti(false);
                    setShowNextLevelPrompt(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
                >
                  Stay Here
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Complete Celebration Modal */}
        {showGameComplete && (
          <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 bg-opacity-95 flex items-center justify-center z-50 overflow-hidden">
            <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 border-4 border-yellow-400 relative overflow-hidden max-h-[90vh] overflow-y-hidden`}>
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 opacity-10 animate-pulse"></div>
              
              {/* Trophy and celebration content */}
              <div className="relative z-10 text-center">
                <div className="text-4xl mb-3 animate-bounce">🏆</div>
                <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent">
                  GAME COMPLETE!
                </h2>
                <div className="text-sm mb-3 flex justify-center items-center gap-2">
                  <span>🎉</span>
                  <span className="font-semibold">MAZE MASTER ACHIEVED!</span>
                  <span>🎉</span>
                </div>
                
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                  <p className="text-sm font-semibold mb-2">🌟 Congratulations! 🌟</p>
                  <p className="text-xs mb-2">
                    You've successfully completed all {levelOrder.length} levels of the Robot Maze Navigator!
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                    You are now officially a <strong>Maze Navigation Expert!</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                    <div className="text-green-600 dark:text-green-400 font-semibold text-xs">Levels Completed</div>
                    <div className="text-lg font-bold">{levelOrder.length}/5</div>
                  </div>
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <div className="text-blue-600 dark:text-blue-400 font-semibold text-xs">Final Score</div>
                    <div className="text-lg font-bold">{score}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-4">
                  <button
                    onClick={handleGameComplete}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 font-medium text-sm"
                  >
                    🔄 Play Again
                  </button>
                  <button
                    onClick={() => {
                      setShowConfetti(false);
                      setShowGameComplete(false);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 font-medium text-sm"
                  >
                    🎯 Stay & Explore
                  </button>
                </div>

                {/* Achievement badges */}
                <div className="flex justify-center gap-1 flex-wrap">
                  <span className="px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold">🥇 CHAMPION</span>
                  <span className="px-2 py-1 bg-purple-500 text-white rounded-full text-xs font-bold">🧠 GENIUS</span>
                  <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">🤖 ROBOT WHISPERER</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Status Messages */}
        {gameStatus === 'completed' && (
          <div className={`p-3 rounded-lg border-l-4 border-green-500 ${isDark ? 'bg-green-900/20' : 'bg-green-50'} mb-3`}>
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-3" />
              <div className="flex-1">
                <h4 className={`font-bold ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                🎉 Level {Object.keys(mazes).indexOf(validDifficulty) + 1} Complete!
                </h4>
                <div className={`${isDark ? 'text-green-400' : 'text-green-700'} mb-2`}>
                  <p className="font-semibold">Final Score: {score} points</p>
                  <div className="text-sm grid grid-cols-2 gap-2 mt-1">
                    <span>⏱️ Time: {formatTime(timeElapsed)}</span>
                    <span>🎯 Commands: {commands.length}/{currentMaze.maxCommands}</span>
                    <span>🔄 Attempts: {attempts}</span>
                    <span>📊 Efficiency: {Math.round((currentMaze.maxCommands - commands.length) / currentMaze.maxCommands * 100)}%</span>
                  </div>
                </div>
                {/* Level progression hint */}
                {validDifficulty !== 'master' && (
                  <div className={`text-sm ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                    <p className="mb-1">
                    🎉 Level {Object.keys(mazes).indexOf(validDifficulty) + 1} completed!
                      {levelOrder.indexOf(validDifficulty) < levelOrder.length - 1 && (
                        <span className="font-semibold"> Next level unlocked!</span>
                      )}
                    </p>
                    {levelOrder.indexOf(validDifficulty) < levelOrder.length - 1 && (
                      <p>💡 Ready for the next challenge? Try Level {Object.keys(mazes).indexOf(validDifficulty) + 2}!</p>
                    )}
                  </div>
                )}
                {validDifficulty === 'master' && (
                  <p className={`text-sm font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                  🏆 MASTER LEVEL CONQUERED! You've completed all {levelOrder.length} levels! You're a maze navigation expert!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {gameStatus === 'failed' && (
          <div className={`p-3 rounded-lg border-l-4 border-red-500 ${isDark ? 'bg-red-900/20' : 'bg-red-50'} mb-3`}>
            <div className="flex items-center">
              <div className="text-red-500 mr-3">⚠️</div>
              <div>
                <h4 className={`font-bold ${isDark ? 'text-red-300' : 'text-red-800'}`}>
                Oops! The robot hit a wall or didn't reach the target.
                </h4>
                <p className={`${isDark ? 'text-red-400' : 'text-red-700'}`}>
                Try adjusting your commands and run again!
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Instructions */}
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
          <h3 className={`font-semibold mb-2 text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
            How to Play:
          </h3>
          <ul className={`text-xs space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>• Click the arrow buttons to add movement commands</li>
            <li>• Guide the robot 🤖 to the target 🎯</li>
            <li>• Avoid walls 🧱 - hitting them will fail the mission</li>
            <li>• Use fewer commands and complete faster for higher scores</li>
            <li>• Complete each level to unlock the next challenge</li>
            <li>• Maximum commands allowed: {currentMaze.maxCommands}</li>
            <li>• Progress is saved automatically across sessions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default MazeActivity;