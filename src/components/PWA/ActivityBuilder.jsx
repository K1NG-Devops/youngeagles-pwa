import React, { useState } from 'react';
import { FaPlus, FaMinus, FaSave, FaEye, FaPalette, FaGamepad, FaBook, FaMusic, FaRunning } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ActivityBuilder = () => {
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
    { id: 'easy', label: 'Easy', color: 'text-green-600' },
    { id: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { id: 'hard', label: 'Hard', color: 'text-red-600' }
  ];

  const categories = [
    'Learning', 'Art & Craft', 'Music', 'Physical', 'Social', 'Emotional', 'Cognitive', 'Language'
  ];

  const handleInputChange = (field, value) => {
    setActivity(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setActivity(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setActivity(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    if (activity[field].length > 1) {
      setActivity(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSave = async () => {
    if (!activity.title.trim()) {
      toast.error('Please enter an activity title');
      return;
    }

    if (!activity.description.trim()) {
      toast.error('Please enter an activity description');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Saving activity:', activity);
      toast.success('Activity created successfully!');
      
      // Reset form
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
      toast.error('Failed to save activity');
    }
  };

  const ActivityPreview = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{activity.title || 'Activity Title'}</h2>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            difficulties.find(d => d.id === activity.difficulty)?.color
          } bg-gray-100`}>
            {difficulties.find(d => d.id === activity.difficulty)?.label}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {activity.ageGroup} years
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 mb-4">{activity.description || 'Activity description will appear here...'}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-700">Duration</h4>
              <p className="text-gray-600">{activity.duration} minutes</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Category</h4>
              <p className="text-gray-600">{activity.category}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Materials Needed</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {activity.materials.filter(m => m.trim()).map((material, index) => (
                <li key={index}>{material}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
            <ol className="list-decimal list-inside text-gray-600 space-y-1">
              {activity.instructions.filter(i => i.trim()).map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Learning Objectives</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {activity.learningObjectives.filter(o => o.trim()).map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const ActivityForm = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Title *</label>
            <input
              type="text"
              value={activity.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter activity title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={activity.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category.toLowerCase()}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            value={activity.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe what this activity is about..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
            <select
              value={activity.ageGroup}
              onChange={(e) => handleInputChange('ageGroup', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ageGroups.map(group => (
                <option key={group.id} value={group.id}>{group.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={activity.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
              min="5"
              max="120"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={activity.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {difficulties.map(diff => (
                <option key={diff.id} value={diff.id}>{diff.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Type */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {activityTypes.map(type => {
            const IconComponent = type.icon;
            return (
              <label key={type.id} className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                activity.type === type.id 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="activityType"
                  value={type.id}
                  checked={activity.type === type.id}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="sr-only"
                />
                <IconComponent className="text-2xl mb-2" />
                <span className="text-sm font-medium">{type.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Dynamic Lists */}
      {['materials', 'instructions', 'learningObjectives'].map(field => (
        <div key={field} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {field === 'materials' ? 'Materials Needed' : 
               field === 'instructions' ? 'Step-by-Step Instructions' : 
               'Learning Objectives'}
            </h2>
            <button
              onClick={() => addArrayItem(field)}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-1 text-sm" />
              Add
            </button>
          </div>
          
          <div className="space-y-3">
            {activity[field].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange(field, index, e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    field === 'materials' ? 'e.g., Colored paper, scissors, glue' :
                    field === 'instructions' ? 'e.g., Gather all materials on the table' :
                    'e.g., Develop fine motor skills'
                  }
                />
                {activity[field].length > 1 && (
                  <button
                    onClick={() => removeArrayItem(field, index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaMinus />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Activity Builder</h1>
            <p className="text-gray-600">Create engaging activities for your students</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                previewMode 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <FaEye className="mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
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

        {/* Content */}
        {previewMode ? <ActivityPreview /> : <ActivityForm />}
      </div>
    </div>
  );
};

export default ActivityBuilder; 