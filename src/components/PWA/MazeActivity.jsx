import React, { useState, useEffect } from 'react';
import { FaRobot, FaUndo, FaPlay, FaCheckCircle } from 'react-icons/fa';
import { useTheme } from '../../hooks/useTheme';

const MazeActivity = ({ onComplete, difficulty = 'easy', onLevelChange }) => {
  const { isDark } = useTheme();
  const [commands, setCommands] = useState([]);
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0 });
  const [isExecuting, setIsExecuting] = useState(false);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, running, completed, failed
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedLevels, setCompletedLevels] = useState(() => {
    // Load completed levels from localStorage
    try {
      const saved = localStorage.getItem('mazeGameProgress');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
      name: 'Beginner',
      description: 'Simple maze with basic obstacles'
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

  // Notify parent if difficulty was auto-corrected
  useEffect(() => {
    if (validDifficulty !== difficulty && onLevelChange) {
      onLevelChange(validDifficulty);
    }
  }, [validDifficulty, difficulty, onLevelChange]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

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
    }
  };

  const resetGame = () => {
    setCommands([]);
    setRobotPosition({ x: 0, y: 0 });
    setGameStatus('idle');
    setIsExecuting(false);
    setTimeElapsed(0);
    setIsTimerRunning(false);
  };

  const executeCommands = async () => {
    if (commands.length === 0) return;

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
      
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 500));

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

  const getScoreColor = () => {
    if (score >= 150) return 'text-green-500';
    if (score >= 120) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          🤖 Robot Maze Navigator
        </h2>
        <div className={`inline-flex items-center px-4 py-2 rounded-lg mb-2 ${
          validDifficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
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
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
          Grid Size: {currentMaze.size}×{currentMaze.size} • Max Commands: {currentMaze.maxCommands}
        </p>
        
        {/* Overall Progress */}
        <div className="flex items-center justify-center space-x-2">
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Progress:</span>
          <div className="flex space-x-1">
            {levelOrder.map((level, index) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-full ${
                  completedLevels.includes(level)
                    ? 'bg-green-500'
                    : level === validDifficulty
                      ? 'bg-blue-500'
                      : isLevelUnlocked(level)
                        ? isDark ? 'bg-gray-600' : 'bg-gray-300'
                        : isDark ? 'bg-gray-800' : 'bg-gray-200'
                }`}
                title={`Level ${index + 1}: ${mazes[level].name} ${
                  completedLevels.includes(level) ? '(Completed)' :
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

      {/* Level Selection */}
      {onLevelChange && (
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-3 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Choose Your Challenge
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(mazes).map(([level, maze], index) => {
              const isUnlocked = isLevelUnlocked(level);
              const isCompleted = completedLevels.includes(level);
              const isCurrentLevel = validDifficulty === level;
              
              return (
                <button
                  key={level}
                  onClick={() => handleLevelChange(level)}
                  disabled={gameStatus === 'running' || isExecuting || !isUnlocked}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                    !isUnlocked
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60' 
                      : isCurrentLevel
                        ? level === 'easy' ? 'bg-green-500 text-white' :
                          level === 'medium' ? 'bg-yellow-500 text-white' :
                            level === 'hard' ? 'bg-orange-500 text-white' :
                              level === 'expert' ? 'bg-red-500 text-white' :
                                'bg-purple-500 text-white'
                        : isCompleted
                          ? isDark 
                            ? 'bg-green-700 text-green-200 hover:bg-green-600 border-2 border-green-400'
                            : 'bg-green-100 text-green-800 hover:bg-green-200 border-2 border-green-500'
                          : isDark 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title={!isUnlocked ? `Complete Level ${index} to unlock` : ''}
                >
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-1">
                      {!isUnlocked && <span className="text-xs">🔒</span>}
                      {isCompleted && <span className="text-xs">✅</span>}
                      <span>Level {index + 1}</span>
                    </div>
                    <span className="text-xs">{maze.name}</span>
                    <div className="flex mt-1">
                      {Array.from({ length: index + 1 }, (_, i) => (
                        <span key={i} className="text-xs">⭐</span>
                      ))}
                    </div>
                  </div>
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {formatTime(timeElapsed)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Time</div>
        </div>
        <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {commands.length}/{currentMaze.maxCommands}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Commands</div>
        </div>
        <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {attempts}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Attempts</div>
        </div>
        <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className={`text-lg font-bold ${getScoreColor()}`}>
            {score}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Score</div>
        </div>
      </div>

      {/* Maze Grid */}
      <div className="mb-6 flex justify-center">
        <div 
          className="grid gap-1 p-4 rounded-lg border-2 border-dashed border-blue-300 max-w-full overflow-hidden"
          style={{ 
            gridTemplateColumns: `repeat(${currentMaze.size}, 1fr)`,
            width: 'fit-content',
            maxWidth: '90vw'
          }}
        >
          {currentMaze.grid.map((row, y) =>
            row.map((cell, x) => {
              const isRobotHere = robotPosition.x === x && robotPosition.y === y;
              const isGoal = cell === 2;
              const isWall = cell === 1;
              const isEmpty = cell === 0;

              // Dynamic cell size based on maze size
              const cellSize = currentMaze.size <= 5 ? 'w-12 h-12 text-lg' : 
                currentMaze.size <= 7 ? 'w-10 h-10 text-base' : 
                  'w-8 h-8 text-sm';

              return (
                <div
                  key={`${x}-${y}`}
                  className={`${cellSize} flex items-center justify-center font-bold border-2 rounded-lg transition-all duration-300 ${
                    isRobotHere
                      ? 'bg-blue-500 border-blue-600 transform scale-110'
                      : isGoal
                        ? 'bg-green-500 border-green-600'
                        : isWall
                          ? isDark 
                            ? 'bg-gray-900 border-gray-800' 
                            : 'bg-gray-800 border-gray-700'
                          : isEmpty
                            ? isDark
                              ? 'bg-gray-700 border-gray-600'
                              : 'bg-gray-100 border-gray-300'
                            : ''
                  }`}
                >
                  {isRobotHere ? (
                    <FaRobot className={`text-white animate-bounce ${currentMaze.size > 7 ? 'text-xs' : ''}`} />
                  ) : isGoal ? (
                    <span className={currentMaze.size > 7 ? 'text-xs' : ''}>🎯</span>
                  ) : isWall ? (
                    <span className={currentMaze.size > 7 ? 'text-xs' : ''}>🧱</span>
                  ) : (
                    ''
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Command Buttons */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-3 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Add Commands
        </h3>
        <div className="flex justify-center">
          <div className="grid grid-cols-3 gap-2 max-w-xs">
            <div></div>
            <button
              onClick={() => addCommand('up')}
              disabled={isExecuting || commands.length >= currentMaze.maxCommands || gameStatus !== 'idle'}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              ↑
            </button>
            <div></div>
            
            <button
              onClick={() => addCommand('left')}
              disabled={isExecuting || commands.length >= currentMaze.maxCommands || gameStatus !== 'idle'}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              ←
            </button>
            <div></div>
            <button
              onClick={() => addCommand('right')}
              disabled={isExecuting || commands.length >= currentMaze.maxCommands || gameStatus !== 'idle'}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              →
            </button>
            
            <div></div>
            <button
              onClick={() => addCommand('down')}
              disabled={isExecuting || commands.length >= currentMaze.maxCommands || gameStatus !== 'idle'}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              ↓
            </button>
            <div></div>
          </div>
        </div>
      </div>

      {/* Commands Display */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-3 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
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
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <button
          onClick={executeCommands}
          disabled={isExecuting || commands.length === 0 || gameStatus === 'running'}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <FaPlay className="mr-2" />
          {isExecuting ? 'Running...' : 'Execute Commands'}
        </button>
        
        <button
          onClick={removeLastCommand}
          disabled={isExecuting || commands.length === 0 || gameStatus !== 'idle'}
          className="flex items-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <FaUndo className="mr-2" />
          Undo
        </button>
        
        <button
          onClick={clearCommands}
          disabled={isExecuting || gameStatus === 'running'}
          className="flex items-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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

      {/* Status Messages */}
      {gameStatus === 'completed' && (
        <div className={`p-4 rounded-lg border-l-4 border-green-500 ${isDark ? 'bg-green-900/20' : 'bg-green-50'} mb-4`}>
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
        <div className={`p-4 rounded-lg border-l-4 border-red-500 ${isDark ? 'bg-red-900/20' : 'bg-red-50'} mb-4`}>
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
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          How to Play:
        </h3>
        <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
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
  );
};

export default MazeActivity; 