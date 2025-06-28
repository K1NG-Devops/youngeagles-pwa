import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.jsx';
import { FaRobot, FaCalculator, FaPalette, FaLeaf, FaSortAmountUp, FaSpellCheck, FaShapes, FaEye, FaPlay, FaCheck, FaHome } from 'react-icons/fa';
import interactiveActivityService from '../../services/interactiveActivityService';

const InteractiveActivitiesHub = () => {
  const { isDark } = useTheme();
  const [selectedActivity, setSelectedActivity] = useState(null);

  const activities = [
    {
      id: 'maze-robot',
      title: 'Robot Maze Navigator',
      description: 'Guide a robot through a maze using directional commands',
      icon: FaRobot,
      subject: 'Coding',
      ageGroup: '4-6',
      duration: '15-20 min',
      difficulty: 'Easy',
      color: 'bg-blue-500'
    },
    {
      id: 'counting-fruits',
      title: 'Fruit Counter',
      description: 'Count fruits and match with numbers',
      icon: FaCalculator,
      subject: 'Math',
      ageGroup: '4-6',
      duration: '10-15 min',
      difficulty: 'Easy',
      color: 'bg-green-500'
    },
    {
      id: 'color-matching',
      title: 'Color Matching Game',
      description: 'Match objects with their corresponding colors',
      icon: FaPalette,
      subject: 'Colors',
      ageGroup: '4-6',
      duration: '10-15 min',
      difficulty: 'Easy',
      color: 'bg-pink-500'
    },
    {
      id: 'shape-sorter',
      title: 'Shape Sorter',
      description: 'Sort different shapes into correct categories',
      icon: FaShapes,
      subject: 'Sorting',
      ageGroup: '4-6',
      duration: '15-20 min',
      difficulty: 'Easy',
      color: 'bg-purple-500'
    },
    {
      id: 'letter-finder',
      title: 'Letter Finder',
      description: 'Find and identify letters in words',
      icon: FaSpellCheck,
      subject: 'English',
      ageGroup: '4-6',
      duration: '15-20 min',
      difficulty: 'Easy',
      color: 'bg-yellow-500'
    },
    {
      id: 'nature-explorer',
      title: 'Nature Explorer',
      description: 'Identify different plants and animals',
      icon: FaLeaf,
      subject: 'Nature',
      ageGroup: '4-6',
      duration: '20-25 min',
      difficulty: 'Medium',
      color: 'bg-green-600'
    },
    {
      id: 'pattern-builder',
      title: 'Pattern Builder',
      description: 'Create and complete visual patterns',
      icon: FaSortAmountUp,
      subject: 'Logic',
      ageGroup: '4-6',
      duration: '15-20 min',
      difficulty: 'Medium',
      color: 'bg-indigo-500'
    },
    {
      id: 'memory-cards',
      title: 'Memory Cards',
      description: 'Match pairs of cards to improve memory',
      icon: FaEye,
      subject: 'Memory',
      ageGroup: '4-6',
      duration: '10-15 min',
      difficulty: 'Easy',
      color: 'bg-red-500'
    }
  ];

  const ActivityCard = ({ activity }) => {
    const IconComponent = activity.icon;

    const handleAssign = async (e) => {
      e.stopPropagation(); // Prevent the card click from firing
      await interactiveActivityService.assignActivityAsHomework(activity);
    };
    
    return (
      <div 
        className={`p-6 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg flex flex-col ${
          isDark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'
        }`}
        onClick={() => setSelectedActivity(activity)}
      >
        <div className="flex-grow">
          <div className={`w-12 h-12 rounded-full ${activity.color} flex items-center justify-center mb-4`}>
            <IconComponent className="text-white text-xl" />
          </div>
          
          <h3 className="text-lg font-bold mb-2">{activity.title}</h3>
          <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {activity.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}>
              {activity.subject}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
            }`}>
              {activity.ageGroup} years
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {activity.duration}
            </span>
            <span className={`text-sm font-medium ${
              activity.difficulty === 'Easy' ? 'text-green-500' : 
              activity.difficulty === 'Medium' ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {activity.difficulty}
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleAssign}
          className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors ${
          isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}>
          <FaPlay className="inline mr-2" />
          Assign as Homework
        </button>
      </div>
    );
  };

  if (selectedActivity) {
    const handleAssignFromDetail = async () => {
      await interactiveActivityService.assignActivityAsHomework(selectedActivity);
    };

    return (
      <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedActivity(null)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-100 text-gray-900'
              }`}
            >
              <FaHome className="mr-2" />
              Back to Activities
            </button>
            
            <button 
              onClick={handleAssignFromDetail}
              className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${
              isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}>
              <FaCheck className="mr-2" />
              Assign as Homework
            </button>
          </div>
          
          <ActivityRenderer activity={selectedActivity} isDark={isDark} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Interactive Activities Hub</h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Ready-to-use interactive activities for your students
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple activity renderer without scoring
const ActivityRenderer = ({ activity, isDark }) => {
  const getActivityComponent = () => {
    switch (activity.id) {
      case 'maze-robot':
        return <MazeRobotActivity isDark={isDark} />;
      case 'counting-fruits':
        return <CountingFruitsActivity isDark={isDark} />;
      case 'color-matching':
        return <ColorMatchingActivity isDark={isDark} />;
      case 'shape-sorter':
        return <ShapeSorterActivity isDark={isDark} />;
      case 'letter-finder':
        return <LetterFinderActivity isDark={isDark} />;
      case 'nature-explorer':
        return <NatureExplorerActivity isDark={isDark} />;
      case 'pattern-builder':
        return <PatternBuilderActivity isDark={isDark} />;
      case 'memory-cards':
        return <MemoryCardsActivity isDark={isDark} />;
      default:
        return <div>Activity not implemented yet</div>;
    }
  };

  return (
    <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{activity.title}</h2>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {activity.description}
        </p>
      </div>
      
      {getActivityComponent()}
    </div>
  );
};

// Simplified activity components without scoring
const MazeRobotActivity = ({ isDark }) => {
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0 });
  const [commands, setCommands] = useState([]);

  const maze = [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [0, 0, 0, 0, 2]
  ];

  const addCommand = (direction) => {
    setCommands([...commands, direction]);
  };

  const executeCommands = () => {
    let pos = { x: 0, y: 0 };
    commands.forEach(command => {
      const newPos = { ...pos };
      switch (command) {
        case 'up': newPos.y = Math.max(0, pos.y - 1); break;
        case 'down': newPos.y = Math.min(4, pos.y + 1); break;
        case 'left': newPos.x = Math.max(0, pos.x - 1); break;
        case 'right': newPos.x = Math.min(4, pos.x + 1); break;
      }
      if (maze[newPos.y][newPos.x] !== 1) {
        pos = newPos;
      }
    });
    setRobotPosition(pos);
  };

  const resetActivity = () => {
    setRobotPosition({ x: 0, y: 0 });
    setCommands([]);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-1 max-w-xs mx-auto">
        {maze.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-12 h-12 border-2 flex items-center justify-center text-lg font-bold ${
                robotPosition.x === x && robotPosition.y === y
                  ? 'bg-blue-500 text-white'
                  : cell === 1
                  ? 'bg-gray-800 text-white'
                  : cell === 2
                  ? 'bg-green-500 text-white'
                  : isDark
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              {robotPosition.x === x && robotPosition.y === y ? '🤖' : cell === 2 ? '🎯' : ''}
            </div>
          ))
        )}
      </div>

      <div className="text-center space-y-4">
        <div className="flex justify-center gap-2 flex-wrap">
          {['up', 'down', 'left', 'right'].map(direction => (
            <button
              key={direction}
              onClick={() => addCommand(direction)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {direction.charAt(0).toUpperCase() + direction.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={executeCommands}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            Execute Commands
          </button>
          <button
            onClick={resetActivity}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isDark ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            Reset
          </button>
        </div>

        <div className="text-sm">
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Commands: {commands.join(' → ') || 'None'}
          </p>
        </div>
      </div>
    </div>
  );
};

const CountingFruitsActivity = ({ isDark }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');

  const questions = [
    { fruits: '🍎🍎🍎', answer: 3, text: 'How many apples?' },
    { fruits: '🍌🍌🍌🍌🍌', answer: 5, text: 'How many bananas?' },
    { fruits: '🍊🍊', answer: 2, text: 'How many oranges?' }
  ];

  const checkAnswer = () => {
    const correct = parseInt(userAnswer) === questions[currentQuestion].answer;
    setFeedback(correct ? 'Correct! Well done!' : 'Try again!');
    
    if (correct && currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setUserAnswer('');
        setFeedback('');
      }, 1500);
    }
  };

  const resetActivity = () => {
    setCurrentQuestion(0);
    setUserAnswer('');
    setFeedback('');
  };

  return (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">
        {questions[currentQuestion].fruits}
      </div>
      
      <h3 className="text-xl font-semibold">
        {questions[currentQuestion].text}
      </h3>
      
      <div className="space-y-4">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className={`w-20 h-12 text-center text-xl border-2 rounded-lg ${
            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
          min="0"
          max="10"
        />
        
        <div className="flex justify-center gap-4">
          <button
            onClick={checkAnswer}
            disabled={!userAnswer}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              !userAnswer
                ? 'bg-gray-400 cursor-not-allowed'
                : isDark
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            Check Answer
          </button>
          
          <button
            onClick={resetActivity}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isDark ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            Reset
          </button>
        </div>
        
        {feedback && (
          <p className={`text-lg font-semibold ${
            feedback.includes('Correct') ? 'text-green-500' : 'text-red-500'
          }`}>
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
};

const ColorMatchingActivity = ({ isDark }) => {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [matches, setMatches] = useState([]);
  const [feedback, setFeedback] = useState('');

  const colors = [
    { name: 'Red', value: '#ef4444', emoji: '🔴' },
    { name: 'Blue', value: '#3b82f6', emoji: '🔵' },
    { name: 'Green', value: '#10b981', emoji: '🟢' },
    { name: 'Yellow', value: '#f59e0b', emoji: '🟡' }
  ];

  const objects = [
    { name: 'Apple', emoji: '🍎', color: 'Red' },
    { name: 'Sky', emoji: '☁️', color: 'Blue' },
    { name: 'Grass', emoji: '🌱', color: 'Green' },
    { name: 'Sun', emoji: '☀️', color: 'Yellow' }
  ];

  const checkMatch = () => {
    if (selectedColor && selectedObject) {
      const correct = selectedColor.name === selectedObject.color;
      if (correct) {
        setMatches([...matches, { color: selectedColor, object: selectedObject }]);
        setFeedback('Perfect match!');
      } else {
        setFeedback('Try a different color!');
      }
      
      setTimeout(() => {
        setSelectedColor(null);
        setSelectedObject(null);
        setFeedback('');
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Colors</h3>
          <div className="grid grid-cols-2 gap-3">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedColor?.name === color.name
                    ? 'border-blue-500 scale-105'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">{color.emoji}</div>
                <div className="text-sm font-medium">{color.name}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Objects</h3>
          <div className="grid grid-cols-2 gap-3">
            {objects.map((object) => (
              <button
                key={object.name}
                onClick={() => setSelectedObject(object)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedObject?.name === object.name
                    ? 'border-blue-500 scale-105'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">{object.emoji}</div>
                <div className="text-sm font-medium">{object.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={checkMatch}
          disabled={!selectedColor || !selectedObject}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            !selectedColor || !selectedObject
              ? 'bg-gray-400 cursor-not-allowed'
              : isDark
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Check Match
        </button>
        
        {feedback && (
          <p className={`mt-4 text-lg font-semibold ${
            feedback.includes('Perfect') ? 'text-green-500' : 'text-orange-500'
          }`}>
            {feedback}
          </p>
        )}
        
        <div className="mt-4">
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Matches found: {matches.length}/{objects.length}
          </p>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other activities
const ShapeSorterActivity = ({ isDark }) => (
  <div className="text-center p-8">
    <div className="text-4xl mb-4">🔷🔶🔵🟢</div>
    <h3 className="text-xl font-semibold mb-4">Shape Sorter</h3>
    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
      Sort shapes by dragging them to the correct categories
    </p>
  </div>
);

const LetterFinderActivity = ({ isDark }) => (
  <div className="text-center p-8">
    <div className="text-4xl mb-4">🔤📝</div>
    <h3 className="text-xl font-semibold mb-4">Letter Finder</h3>
    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
      Find and identify letters in different words
    </p>
  </div>
);

const NatureExplorerActivity = ({ isDark }) => (
  <div className="text-center p-8">
    <div className="text-4xl mb-4">🌿🦋🌸</div>
    <h3 className="text-xl font-semibold mb-4">Nature Explorer</h3>
    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
      Explore and identify different plants and animals
    </p>
  </div>
);

const PatternBuilderActivity = ({ isDark }) => (
  <div className="text-center p-8">
    <div className="text-4xl mb-4">🔴🔵🔴🔵</div>
    <h3 className="text-xl font-semibold mb-4">Pattern Builder</h3>
    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
      Create and complete visual patterns with shapes and colors
    </p>
  </div>
);

const MemoryCardsActivity = ({ isDark }) => (
  <div className="text-center p-8">
    <div className="text-4xl mb-4">🃏🎴</div>
    <h3 className="text-xl font-semibold mb-4">Memory Cards</h3>
    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
      Match pairs of cards to test your memory skills
    </p>
  </div>
);

export default InteractiveActivitiesHub;
