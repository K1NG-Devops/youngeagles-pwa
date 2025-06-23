import React, { useState, useCallback } from 'react';
import { FaPlus, FaMinus, FaSave, FaEye, FaPalette, FaGamepad, FaBook, FaMusic, FaRunning } from 'react-icons/fa';
import { showTopNotification } from '../TopNotificationManager';
import { useTheme } from '../../hooks/useTheme.jsx';

const ActivityBuilder = () => {
  const { isDark } = useTheme();
  const [activity, setActivity] = useState({
    title: '',
    description: '',
    type: 'educational',
    ageGroup: '3-4',
    duration: 30,
    materials: [''],
    instructions: [''],
    learningObjectives: [''],
    difficulty: 'easy',
    category: 'learning'
  });

  const [previewMode, setPreviewMode] = useState(false);

  const activityTypes = [
    { id: 'educational', label: 'Educational', icon: FaBook },
    { id: 'creative', label: 'Creative Arts', icon: FaPalette },
    { id: 'physical', label: 'Physical Activity', icon: FaRunning },
    { id: 'music', label: 'Music & Rhythm', icon: FaMusic },
    { id: 'game', label: 'Game/Play', icon: FaGamepad }
  ];

  const ageGroups = [
    { id: '2-3', label: '2-3 years' },
    { id: '3-4', label: '3-4 years' },
    { id: '4-5', label: '4-5 years' },
    { id: '5-6', label: '5-6 years' },
    { id: 'mixed', label: 'Mixed Ages' }
  ];

  const difficulties = [
    { id: 'easy', label: 'Easy', color: isDark ? 'text-green-400' : 'text-green-600' },
    { id: 'medium', label: 'Medium', color: isDark ? 'text-yellow-400' : 'text-yellow-600' },
    { id: 'hard', label: 'Hard', color: isDark ? 'text-red-400' : 'text-red-600' }
  ];

  const categories = [
    'Learning', 'Art & Craft', 'Music', 'Physical', 'Social', 'Emotional', 'Cognitive', 'Language'
  ];

  // Stable event handlers
  const handleTitleChange = useCallback((e) => {
    setActivity(prev => ({ ...prev, title: e.target.value }));
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setActivity(prev => ({ ...prev, description: e.target.value }));
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setActivity(prev => ({ ...prev, category: e.target.value }));
  }, []);

  const handleAgeGroupChange = useCallback((e) => {
    setActivity(prev => ({ ...prev, ageGroup: e.target.value }));
  }, []);

  const handleDurationChange = useCallback((e) => {
    setActivity(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }));
  }, []);

  const handleDifficultyChange = useCallback((e) => {
    setActivity(prev => ({ ...prev, difficulty: e.target.value }));
  }, []);

  const handleTypeChange = useCallback((e) => {
    setActivity(prev => ({ ...prev, type: e.target.value }));
  }, []);

  const handleMaterialChange = useCallback((index, value) => {
    setActivity(prev => ({
      ...prev,
      materials: prev.materials.map((item, i) => i === index ? value : item)
    }));
  }, []);

  const handleInstructionChange = useCallback((index, value) => {
    setActivity(prev => ({
      ...prev,
      instructions: prev.instructions.map((item, i) => i === index ? value : item)
    }));
  }, []);

  const handleObjectiveChange = useCallback((index, value) => {
    setActivity(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.map((item, i) => i === index ? value : item)
    }));
  }, []);

  const addMaterial = useCallback(() => {
    setActivity(prev => ({
      ...prev,
      materials: [...prev.materials, '']
    }));
  }, []);

  const addInstruction = useCallback(() => {
    setActivity(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  }, []);

  const addObjective = useCallback(() => {
    setActivity(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }));
  }, []);

  const removeMaterial = useCallback((index) => {
    if (activity.materials.length > 1) {
      setActivity(prev => ({
        ...prev,
        materials: prev.materials.filter((_, i) => i !== index)
      }));
    }
  }, [activity.materials.length]);

  const removeInstruction = useCallback((index) => {
    if (activity.instructions.length > 1) {
      setActivity(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index)
      }));
    }
  }, [activity.instructions.length]);

  const removeObjective = useCallback((index) => {
    if (activity.learningObjectives.length > 1) {
      setActivity(prev => ({
        ...prev,
        learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
      }));
    }
  }, [activity.learningObjectives.length]);

  const handleSave = async () => {
    if (!activity.title.trim()) {
      showTopNotification('Please enter an activity title', 'error');
      return;
    }

    if (!activity.description.trim()) {
      showTopNotification('Please enter an activity description', 'error');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Saving activity:', activity);
      showTopNotification('Activity created successfully!', 'success');
      
      setActivity({
        title: '',
        description: '',
        type: 'educational',
        ageGroup: '3-4',
        duration: 30,
        materials: [''],
        instructions: [''],
        learningObjectives: [''],
        difficulty: 'easy',
        category: 'learning'
      });
      
    } catch (error) {
      console.error('Error saving activity:', error);
      showTopNotification('Failed to save activity', 'error');
    }
  };

  const togglePreview = useCallback(() => {
    setPreviewMode(prev => !prev);
  }, []);

  // Pre-computed CSS classes
  const containerClass = `min-h-screen p-4 transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`;
  const cardClass = `rounded-lg shadow-sm p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`;
  const titleClass = `text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`;
  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const inputClass = `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
    isDark 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'border-gray-300 bg-white text-gray-900'
  }`;

  if (previewMode) {
    return (
      <div className={containerClass}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Activity Builder</h1>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Create engaging activities for your students</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={togglePreview}
                className="flex items-center px-4 py-2 rounded-lg transition-colors bg-gray-600 text-white hover:bg-gray-700"
              >
                <FaEye className="mr-2" />
                Edit
              </button>
              
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaSave className="mr-2" />
                Save Activity
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {activity.title || 'Activity Title'}
              </h2>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  difficulties.find(d => d.id === activity.difficulty)?.color
                } ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {difficulties.find(d => d.id === activity.difficulty)?.label}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                }`}>
                  {activity.ageGroup} years
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Description</h3>
                <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {activity.description || 'Activity description will appear here...'}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Duration</h4>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{activity.duration} minutes</p>
                  </div>
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Category</h4>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{activity.category}</p>
                  </div>
                </div>

                <div>
                  <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Materials Needed</h4>
                  <ul className={`list-disc list-inside space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {activity.materials.filter(m => m.trim()).map((material, index) => (
                      <li key={index}>{material}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Instructions</h4>
                  <ol className={`list-decimal list-inside space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {activity.instructions.filter(i => i.trim()).map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Learning Objectives</h4>
                  <ul className={`list-disc list-inside space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {activity.learningObjectives.filter(o => o.trim()).map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Activity Builder</h1>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Create engaging activities for your students</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={togglePreview}
              className="flex items-center px-4 py-2 rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700"
            >
              <FaEye className="mr-2" />
              Preview
            </button>
            
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaSave className="mr-2" />
              Save Activity
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className={cardClass}>
            <h2 className={titleClass}>Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Activity Title *</label>
                <input
                  type="text"
                  value={activity.title}
                  onChange={handleTitleChange}
                  className={inputClass}
                  placeholder="Enter activity title..."
                />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={activity.category}
                  onChange={handleCategoryChange}
                  className={inputClass}
                >
                  {categories.map(category => (
                    <option key={category} value={category.toLowerCase()}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className={labelClass}>Description *</label>
              <textarea
                value={activity.description}
                onChange={handleDescriptionChange}
                rows={3}
                className={inputClass}
                placeholder="Describe what this activity is about..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className={labelClass}>Age Group</label>
                <select
                  value={activity.ageGroup}
                  onChange={handleAgeGroupChange}
                  className={inputClass}
                >
                  {ageGroups.map(group => (
                    <option key={group.id} value={group.id}>{group.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Duration (minutes)</label>
                <input
                  type="number"
                  value={activity.duration}
                  onChange={handleDurationChange}
                  min="5"
                  max="120"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Difficulty</label>
                <select
                  value={activity.difficulty}
                  onChange={handleDifficultyChange}
                  className={inputClass}
                >
                  {difficulties.map(diff => (
                    <option key={diff.id} value={diff.id}>{diff.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Activity Type */}
          <div className={cardClass}>
            <h2 className={titleClass}>Activity Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {activityTypes.map(type => {
                const IconComponent = type.icon;
                const isSelected = activity.type === type.id;
                const buttonClass = `flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : `${isDark ? 'border-gray-600 hover:border-gray-500 text-white' : 'border-gray-300 hover:border-gray-400'}`
                }`;
                return (
                  <label key={type.id} className={buttonClass}>
                    <input
                      type="radio"
                      name="activityType"
                      value={type.id}
                      checked={isSelected}
                      onChange={handleTypeChange}
                      className="sr-only"
                    />
                    <IconComponent className="text-2xl mb-2" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Materials */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={titleClass}>Materials Needed</h2>
              <button
                onClick={addMaterial}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-1 text-sm" />
                Add
              </button>
            </div>
            
            <div className="space-y-3">
              {activity.materials.map((material, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => handleMaterialChange(index, e.target.value)}
                    className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    placeholder="e.g., Colored paper, scissors, glue"
                  />
                  {activity.materials.length > 1 && (
                    <button
                      onClick={() => removeMaterial(index)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-red-400 hover:bg-red-900' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <FaMinus />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={titleClass}>Step-by-Step Instructions</h2>
              <button
                onClick={addInstruction}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-1 text-sm" />
                Add
              </button>
            </div>
            
            <div className="space-y-3">
              {activity.instructions.map((instruction, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    placeholder="e.g., Gather all materials on the table"
                  />
                  {activity.instructions.length > 1 && (
                    <button
                      onClick={() => removeInstruction(index)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-red-400 hover:bg-red-900' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <FaMinus />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Learning Objectives */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={titleClass}>Learning Objectives</h2>
              <button
                onClick={addObjective}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-1 text-sm" />
                Add
              </button>
            </div>
            
            <div className="space-y-3">
              {activity.learningObjectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    placeholder="e.g., Develop fine motor skills"
                  />
                  {activity.learningObjectives.length > 1 && (
                    <button
                      onClick={() => removeObjective(index)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-red-400 hover:bg-red-900' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <FaMinus />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityBuilder; 