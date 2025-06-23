import React, { useState, useCallback } from 'react';
import { FaBook, FaGraduationCap, FaMicrophone, FaImage, FaPlay, FaStop, FaUpload, FaChevronLeft, FaChevronRight, FaCheck, FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import { showTopNotification } from '../TopNotificationManager';

// Import API config
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://youngeagles-api-server.up.railway.app';

// Academic Framework for Preschool (3-6 years)
const LEARNING_OBJECTIVES = {
  mathematics: {
    title: 'Mathematics',
    icon: '🔢',
    skills: [
      { id: 'counting', name: 'Counting & Numbers', description: 'Number recognition, counting sequences' },
      { id: 'shapes', name: 'Shapes & Geometry', description: 'Basic shapes, patterns, spatial awareness' },
      { id: 'measurement', name: 'Measurement', description: 'Size, length, weight comparisons' },
      { id: 'sorting', name: 'Sorting & Classification', description: 'Grouping objects by attributes' }
    ]
  },
  literacy: {
    title: 'Literacy',
    icon: '📚',
    skills: [
      { id: 'letters', name: 'Letter Recognition', description: 'Uppercase/lowercase identification' },
      { id: 'phonics', name: 'Phonics & Sounds', description: 'Letter sounds, beginning sounds' },
      { id: 'vocabulary', name: 'Vocabulary', description: 'Word meaning, language development' },
      { id: 'writing', name: 'Pre-Writing', description: 'Fine motor, tracing, letter formation' }
    ]
  },
  science: {
    title: 'Science',
    icon: '🔬',
    skills: [
      { id: 'observation', name: 'Observation', description: 'Using senses to explore' },
      { id: 'nature', name: 'Nature & Environment', description: 'Living vs non-living, seasons' },
      { id: 'experiments', name: 'Simple Experiments', description: 'Cause and effect, predictions' },
      { id: 'health', name: 'Health & Body', description: 'Body parts, healthy habits' }
    ]
  },
  socialEmotional: {
    title: 'Social-Emotional',
    icon: '💖',
    skills: [
      { id: 'emotions', name: 'Emotion Recognition', description: 'Identifying feelings in self/others' },
      { id: 'sharing', name: 'Sharing & Cooperation', description: 'Taking turns, working together' },
      { id: 'independence', name: 'Independence', description: 'Self-help skills, following directions' },
      { id: 'empathy', name: 'Empathy & Kindness', description: 'Understanding others\' feelings' }
    ]
  },
  creative: {
    title: 'Creative Arts',
    icon: '🎨',
    skills: [
      { id: 'art', name: 'Visual Arts', description: 'Drawing, coloring, creating' },
      { id: 'music', name: 'Music & Movement', description: 'Rhythm, singing, dancing' },
      { id: 'drama', name: 'Dramatic Play', description: 'Role-playing, storytelling' },
      { id: 'creativity', name: 'Creative Expression', description: 'Original thinking, imagination' }
    ]
  }
};

const DIFFICULTY_LEVELS = [
  { level: 1, name: 'Beginner', description: 'Introduction to new concept', color: 'green' },
  { level: 2, name: 'Developing', description: 'Practice with guidance', color: 'blue' },
  { level: 3, name: 'Proficient', description: 'Independent application', color: 'purple' },
  { level: 4, name: 'Advanced', description: 'Creative extension', color: 'orange' },
  { level: 5, name: 'Mastery', description: 'Teaching others/complex application', color: 'red' }
];

const AdvancedHomeworkCreator = ({ onSave, onCancel, isDark, initialData = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [homework, setHomework] = useState({
    // Basic Information
    title: initialData?.title || '',
    subject: initialData?.subject || 'mathematics',
    estimatedTime: initialData?.estimatedTime || 15,
    difficultyLevel: initialData?.difficultyLevel || 1,
    
    // Academic Objectives
    selectedSkills: initialData?.selectedSkills || [],
    customObjectives: initialData?.customObjectives || [],
    
    // Instructions
    description: initialData?.description || '',
    parentGuidance: initialData?.parentGuidance || '',
    childInstructions: initialData?.childInstructions || '',
    audioInstructions: initialData?.audioInstructions || null,
    visualAids: initialData?.visualAids || [],
    
    // Assessment Criteria
    assessmentCriteria: initialData?.assessmentCriteria || {
      completionWeight: 40,
      accuracyWeight: 30,
      creativityWeight: 20,
      effortWeight: 10
    },
    
    // Assignment Details
    dueDate: initialData?.dueDate || '',
    assignedClasses: initialData?.assignedClasses || []
  });

  const steps = [
    { id: 1, title: 'Basic Info', icon: FaBook },
    { id: 2, title: 'Academic Planning', icon: FaGraduationCap },
    { id: 3, title: 'Instructions', icon: FaMicrophone },
    { id: 4, title: 'Assessment', icon: FaCheck }
  ];

  // Update homework state
  const updateHomework = useCallback((field, value) => {
    setHomework(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle skill selection
  const toggleSkill = useCallback((skillId, subject) => {
    setHomework(prev => {
      const skillKey = `${subject}_${skillId}`;
      const isSelected = prev.selectedSkills.includes(skillKey);
      
      return {
        ...prev,
        selectedSkills: isSelected 
          ? prev.selectedSkills.filter(id => id !== skillKey)
          : [...prev.selectedSkills, skillKey]
      };
    });
  }, []);

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        updateHomework('audioInstructions', audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      showTopNotification('Could not access microphone. Please check permissions.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Handle visual aids upload
  const handleVisualAidsUpload = (event) => {
    const files = Array.from(event.target.files);
    const newVisualAids = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    
    updateHomework('visualAids', [...homework.visualAids, ...newVisualAids]);
  };

  // Remove visual aid
  const removeVisualAid = (aidId) => {
    setHomework(prev => ({
      ...prev,
      visualAids: prev.visualAids.filter(aid => aid.id !== aidId)
    }));
  };

  // Add custom objective
  const addCustomObjective = () => {
    const objective = prompt('Enter custom learning objective:');
    if (objective && objective.trim()) {
      setHomework(prev => ({
        ...prev,
        customObjectives: [...prev.customObjectives, objective.trim()]
      }));
    }
  };

  // Remove custom objective
  const removeCustomObjective = (index) => {
    setHomework(prev => ({
      ...prev,
      customObjectives: prev.customObjectives.filter((_, i) => i !== index)
    }));
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // **NEW: Submit homework to backend API**
  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!homework.title || !homework.dueDate) {
        showTopNotification('Please fill in title and due date', 'error');
        return;
      }

      // Get teacher info from localStorage
      const teacherId = localStorage.getItem('teacherId') || localStorage.getItem('userId');
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!teacherId || !token) {
        showTopNotification('Authentication required. Please log in again.', 'error');
        return;
      }

      // Get teacher's class from localStorage or API
      const teacherClass = localStorage.getItem('teacherClass') || 'Default Class';

      // Prepare form data for multipart upload
      const formData = new FormData();
      
      // Add homework data
      formData.append('title', homework.title);
      formData.append('subject', homework.subject);
      formData.append('estimatedTime', homework.estimatedTime.toString());
      formData.append('difficultyLevel', homework.difficultyLevel.toString());
      formData.append('selectedSkills', JSON.stringify(homework.selectedSkills));
      formData.append('customObjectives', JSON.stringify(homework.customObjectives));
      formData.append('description', homework.description);
      formData.append('parentGuidance', homework.parentGuidance);
      formData.append('childInstructions', homework.childInstructions);
      formData.append('assessmentCriteria', JSON.stringify(homework.assessmentCriteria));
      formData.append('dueDate', homework.dueDate);
      formData.append('assignedClasses', JSON.stringify([teacherClass]));

      // Add audio file if exists
      if (homework.audioInstructions) {
        formData.append('audioInstructions', homework.audioInstructions, 'instructions.wav');
      }

      // Add visual aids
      homework.visualAids.forEach((aid, index) => {
        if (aid.file) {
          formData.append('visualAids', aid.file);
        }
      });

      console.log('🚀 Submitting advanced homework:', {
        title: homework.title,
        subject: homework.subject,
        skillsCount: homework.selectedSkills.length,
        hasAudio: !!homework.audioInstructions,
        visualAidsCount: homework.visualAids.length
      });

      // Submit to API
      const response = await fetch(`${API_BASE_URL}/api/homework/advanced/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showTopNotification('🎉 Advanced homework created successfully!', 'success');
        console.log('✅ Homework created:', result.homework);
        
        // Call the parent's onSave callback
        if (onSave) {
          onSave(result.homework);
        }
        
        // Close the modal
        if (onCancel) {
          onCancel();
        }
      } else {
        console.error('❌ API Error:', result);
        showTopNotification(result.error || 'Failed to create homework', 'error');
      }

    } catch (error) {
      console.error('❌ Network Error:', error);
      showTopNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Component for skill selection
  const SkillCard = ({ skill, subject, isSelected, onToggle }) => (
    <div
      onClick={() => onToggle(skill.id, subject)}
      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 text-blue-700' 
          : `border-gray-200 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'} hover:border-gray-300`
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-sm">{skill.name}</h4>
          <p className="text-xs opacity-75">{skill.description}</p>
        </div>
        {isSelected && <FaCheck className="text-blue-500" />}
      </div>
    </div>
  );

  // Component for difficulty slider
  const DifficultySlider = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Difficulty Level: {DIFFICULTY_LEVELS[homework.difficultyLevel - 1]?.name}
        </h4>
        <span className={`px-2 py-1 rounded text-xs font-medium bg-${DIFFICULTY_LEVELS[homework.difficultyLevel - 1]?.color}-100 text-${DIFFICULTY_LEVELS[homework.difficultyLevel - 1]?.color}-700`}>
          Level {homework.difficultyLevel}
        </span>
      </div>
      
      <input
        type="range"
        min="1"
        max="5"
        value={homework.difficultyLevel}
        onChange={(e) => updateHomework('difficultyLevel', parseInt(e.target.value))}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-gray-500">
        {DIFFICULTY_LEVELS.map((level, index) => (
          <span key={index} className="text-center">
            {level.name}
          </span>
        ))}
      </div>
      
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {DIFFICULTY_LEVELS[homework.difficultyLevel - 1]?.description}
      </p>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
      {/* Header with Steps */}
      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Advanced Homework Creator
        </h2>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : isCompleted 
                      ? 'border-green-500 bg-green-50 text-green-600'
                      : `border-gray-300 ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'}`
                }`}>
                  {isCompleted ? <FaCheck /> : <StepIcon />}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive 
                    ? 'text-blue-600' 
                    : isCompleted 
                      ? 'text-green-600'
                      : isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6 min-h-[500px]">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              📚 Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Homework Title *
                </label>
                <input
                  type="text"
                  value={homework.title}
                  onChange={(e) => updateHomework('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., Counting to 10 with Fun Objects"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject Area
                </label>
                <select
                  value={homework.subject}
                  onChange={(e) => updateHomework('subject', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {Object.entries(LEARNING_OBJECTIVES).map(([key, subject]) => (
                    <option key={key} value={key}>
                      {subject.icon} {subject.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Estimated Time (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={homework.estimatedTime}
                  onChange={(e) => updateHomework('estimatedTime', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={homework.dueDate}
                  onChange={(e) => updateHomework('dueDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                value={homework.description}
                onChange={(e) => updateHomework('description', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Brief description of what students will do..."
              />
            </div>
            
            <DifficultySlider />
          </div>
        )}

        {/* Step 2: Academic Planning */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              🎯 Academic Planning & Learning Objectives
            </h3>
            
            {/* Skills Selection by Subject */}
            <div className="space-y-6">
              {Object.entries(LEARNING_OBJECTIVES).map(([subjectKey, subject]) => (
                <div key={subjectKey}>
                  <h4 className={`text-lg font-medium mb-3 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <span className="mr-2">{subject.icon}</span>
                    {subject.title}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subject.skills.map(skill => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        subject={subjectKey}
                        isSelected={homework.selectedSkills.includes(`${subjectKey}_${skill.id}`)}
                        onToggle={toggleSkill}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Custom Objectives */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Custom Learning Objectives
                </h4>
                <button
                  onClick={addCustomObjective}
                  className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FaPlus className="mr-1" />
                  Add Custom
                </button>
              </div>
              
              {homework.customObjectives.map((objective, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{objective}</span>
                  <button
                    onClick={() => removeCustomObjective(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Multi-Modal Instructions */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              📝 Multi-Modal Instructions
            </h3>
            
            {/* Parent Guidance */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                👨‍👩‍👧‍👦 Parent Guidance
              </label>
              <textarea
                value={homework.parentGuidance}
                onChange={(e) => updateHomework('parentGuidance', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Instructions for parents on how to support their child with this homework..."
              />
            </div>
            
            {/* Child Instructions */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                🧒 Child Instructions (Simple Language)
              </label>
              <textarea
                value={homework.childInstructions}
                onChange={(e) => updateHomework('childInstructions', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Simple, clear instructions that a preschooler can understand..."
              />
            </div>
            
            {/* Audio Instructions */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                🎵 Audio Instructions (Optional)
              </label>
              <div className="flex items-center space-x-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <FaMicrophone className="mr-2" />
                    Record Instructions
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <FaStop className="mr-2" />
                    Stop Recording
                  </button>
                )}
                
                {audioBlob && (
                  <div className="flex items-center space-x-2">
                    <audio controls src={URL.createObjectURL(audioBlob)} />
                    <button
                      onClick={() => {
                        setAudioBlob(null);
                        updateHomework('audioInstructions', null);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Visual Aids */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                🖼️ Visual Aids (Images, Diagrams, Examples)
              </label>
              <div className="space-y-3">
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                }`}>
                  <input
                    type="file"
                    id="visual-aids"
                    multiple
                    accept="image/*"
                    onChange={handleVisualAidsUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="visual-aids"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <FaUpload className={`text-3xl mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Click to upload images
                    </span>
                  </label>
                </div>
                
                {/* Display uploaded visual aids */}
                {homework.visualAids.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {homework.visualAids.map(aid => (
                      <div key={aid.id} className="relative">
                        <img
                          src={aid.url}
                          alt={aid.name}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeVisualAid(aid.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Assessment Criteria */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              📊 Assessment Criteria
            </h3>
            
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Set the weights for different aspects of assessment. Total should equal 100%.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'completionWeight', label: 'Completion', description: 'Did the student finish the task?' },
                { key: 'accuracyWeight', label: 'Accuracy', description: 'How correct was the work?' },
                { key: 'creativityWeight', label: 'Creativity', description: 'Did they show original thinking?' },
                { key: 'effortWeight', label: 'Effort', description: 'Did they try their best?' }
              ].map(criterion => (
                <div key={criterion.key} className={`p-4 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {criterion.label}
                    </label>
                    <span className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {homework.assessmentCriteria[criterion.key]}%
                    </span>
                  </div>
                  <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {criterion.description}
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={homework.assessmentCriteria[criterion.key]}
                    onChange={(e) => updateHomework('assessmentCriteria', {
                      ...homework.assessmentCriteria,
                      [criterion.key]: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'
            } border`}>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  Total Weight:
                </span>
                <span className={`text-lg font-bold ${
                  Object.values(homework.assessmentCriteria).reduce((sum, val) => sum + val, 0) === 100
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {Object.values(homework.assessmentCriteria).reduce((sum, val) => sum + val, 0)}%
                </span>
              </div>
              {Object.values(homework.assessmentCriteria).reduce((sum, val) => sum + val, 0) !== 100 && (
                <p className="text-sm text-red-600 mt-2">
                  Total should equal 100% for balanced assessment
                </p>
              )}
            </div>
            
            {/* Summary Preview */}
            <div className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Homework Summary
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>Title:</strong> {homework.title || 'Untitled'}</p>
                <p><strong>Subject:</strong> {LEARNING_OBJECTIVES[homework.subject]?.title}</p>
                <p><strong>Estimated Time:</strong> {homework.estimatedTime} minutes</p>
                <p><strong>Difficulty:</strong> {DIFFICULTY_LEVELS[homework.difficultyLevel - 1]?.name}</p>
                <p><strong>Skills Selected:</strong> {homework.selectedSkills.length + homework.customObjectives.length}</p>
                <p><strong>Visual Aids:</strong> {homework.visualAids.length} images</p>
                <p><strong>Audio Instructions:</strong> {homework.audioInstructions ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Navigation */}
      <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaChevronLeft className="mr-2" />
                Previous
              </button>
            )}
            
            <button
              onClick={onCancel}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
          </div>
          
          <div className="flex space-x-3">
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Next
                <FaChevronRight className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <FaCheck className="mr-2" />
                Create Homework
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedHomeworkCreator; 