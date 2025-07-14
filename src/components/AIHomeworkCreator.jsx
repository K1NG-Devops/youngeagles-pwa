// Enhanced AI-Powered Homework Assignment System
// State-of-the-art assignment creation with AI assistance

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaRobot, 
  FaMagic, 
  FaBrain, 
  FaGamepad,
  FaUpload,
  FaSparkles,
  FaChartLine,
  FaUsers,
  FaClock,
  FaLightbulb,
  FaCheck,
  FaPlay,
  FaWand,
  FaEye,
  FaPalette,
  FaStar,
  FaHeart,
  FaRocket,
  FaGraduationCap,
  FaBookOpen,
  FaMusic,
  FaPuzzlePiece,
  FaCamera,
  FaMicrophone,
  FaEdit,
  FaSync,
  FaSave,
  FaShare,
  FaSliders,
  FaTrophy,
  FaAward,
  FaCertificate,
  FaSpinner
} from 'react-icons/fa';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService';
import HomeworkTemplateLibrary from './HomeworkTemplateLibrary';

const AIHomeworkCreator = ({ onHomeworkCreated, onClose }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [animationState, setAnimationState] = useState('idle');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const aiProcessRef = useRef(null);
  
  const [formData, setFormData] = useState({
    // Learning Parameters
    subject: 'Mathematics',
    topic: '',
    learningObjective: '',
    ageGroup: '4-6',
    difficulty: 'medium',
    
    // Enhanced AI Generation Settings
    contentType: 'interactive', // interactive, traditional, mixed
    activityStyle: 'visual', // visual, kinesthetic, auditory, mixed
    engagementLevel: 'high',
    personalizedFor: [], // specific student needs
    aiPersonality: 'friendly', // friendly, encouraging, playful, professional
    multimodalSupport: true,
    adaptiveDifficulty: true,
    gamificationLevel: 'medium',
    
    // Assignment Configuration
    estimatedDuration: 30,
    dueDate: '',
    dueTime: '17:00',
    assignmentType: 'class',
    selectedClass: '',
    selectedChildren: [],
    
    // Enhanced AI Generated Content
    generatedActivities: [],
    generatedInstructions: '',
    parentGuidance: '',
    assessmentCriteria: [],
    adaptiveFeatures: true,
    rewardSystem: null,
    progressMilestones: [],
    celebrationTriggers: [],
    
    // Advanced Settings
    realTimeHints: true,
    errorAnalysis: true,
    voiceInstructions: false,
    offlineCapable: false,
    parentInsights: true,
    peerCollaboration: false
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [classes, setClasses] = useState([]);
  const [children, setChildren] = useState([]);

  // Load teacher data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [classesResponse, childrenResponse] = await Promise.all([
          apiService.classes.getByTeacher(user.id),
          apiService.children.getAll()
        ]);
        
        setClasses(classesResponse.data.classes || []);
        setChildren(childrenResponse.data.children || []);
        
        if (classesResponse.data.classes?.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            selectedClass: classesResponse.data.classes[0].id 
          }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, [user.id]);

  // Enhanced AI-Powered Content Generation with Animation
  const generateAIContent = async () => {
    setIsGenerating(true);
    setAnimationState('generating');
    setGenerationProgress(0);
    
    try {
      // Simulate realistic AI generation process with progress updates
      const stages = [
        { name: 'Analyzing learning objectives...', progress: 20 },
        { name: 'Generating interactive activities...', progress: 40 },
        { name: 'Creating adaptive assessments...', progress: 60 },
        { name: 'Personalizing content...', progress: 80 },
        { name: 'Finalizing homework structure...', progress: 100 }
      ];
      
      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setGenerationProgress(stage.progress);
      }
      
      // Generate enhanced AI content
      const aiGeneratedContent = {
        activities: generateEnhancedActivities(formData.topic, formData.contentType, formData.ageGroup),
        instructions: generatePersonalizedInstructions(formData.topic, formData.ageGroup, formData.aiPersonality),
        parentGuidance: generateAdvancedParentGuidance(formData.topic, formData.ageGroup),
        assessmentCriteria: generateSmartAssessmentCriteria(formData.topic, formData.difficulty),
        adaptiveElements: generateAdaptiveFeatures(formData.difficulty),
        rewardSystem: generateRewardSystem(formData.gamificationLevel),
        progressMilestones: generateProgressMilestones(formData.topic),
        celebrationTriggers: generateCelebrationTriggers(formData.engagementLevel)
      };
      
      setFormData(prev => ({
        ...prev,
        generatedActivities: aiGeneratedContent.activities,
        generatedInstructions: aiGeneratedContent.instructions,
        parentGuidance: aiGeneratedContent.parentGuidance,
        assessmentCriteria: aiGeneratedContent.assessmentCriteria,
        rewardSystem: aiGeneratedContent.rewardSystem,
        progressMilestones: aiGeneratedContent.progressMilestones,
        celebrationTriggers: aiGeneratedContent.celebrationTriggers
      }));
      
      setAnimationState('success');
      setTimeout(() => {
        setStep(3); // Move to preview step
        setAnimationState('idle');
      }, 1500);
      
      nativeNotificationService.success('🎉 AI homework generated successfully!');
      
    } catch (error) {
      setAnimationState('error');
      nativeNotificationService.error('Failed to generate AI content');
      setTimeout(() => setAnimationState('idle'), 2000);
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 1500);
    }
  };

  // Enhanced AI Content Generation Helpers
  const generateEnhancedActivities = (topic, contentType, ageGroup) => {
    const activityDatabase = {
      'Counting 1-10': [
        {
          type: 'counting_adventure',
          title: '🌟 Magical Number Quest',
          description: 'Join Luna the counting fairy on a magical adventure to find hidden numbers in the enchanted forest',
          interactiveElements: ['drag-drop', 'sound-effects', 'animations', 'voice-guidance'],
          difficulty: 'easy',
          estimatedTime: 6,
          rewards: ['stars', 'badges', 'virtual-stickers'],
          adaptiveFeatures: ['hint-system', 'auto-adjust-pace', 'celebration-animations'],
          multimodal: {
            visual: 'animated-forest-scene',
            audio: 'nature-sounds-narration',
            kinesthetic: 'touch-and-drag-numbers'
          },
          gamification: {
            points: 10,
            achievements: ['First Counter', 'Number Explorer'],
            progression: 'unlock-next-level'
          }
        },
        {
          type: 'counting_carnival',
          title: '🎪 Counting Carnival Games',
          description: 'Step right up to the counting carnival! Play fun games to practice counting with carnival prizes',
          interactiveElements: ['mini-games', 'carnival-music', 'prize-wheel', 'confetti-effects'],
          difficulty: 'easy',
          estimatedTime: 8,
          rewards: ['carnival-tickets', 'toy-prizes', 'photo-booth-frames'],
          adaptiveFeatures: ['multiple-attempts', 'encouraging-cheers', 'personalized-mascot'],
          multimodal: {
            visual: 'colorful-carnival-scene',
            audio: 'carnival-music-cheers',
            kinesthetic: 'tap-and-count-games'
          },
          gamification: {
            points: 15,
            achievements: ['Carnival Champion', 'Ring Toss Master'],
            progression: 'unlock-bonus-games'
          }
        }
      ],
      'Basic Addition': [
        {
          type: 'addition_bakery',
          title: '🧁 Sweet Addition Bakery',
          description: 'Help Chef Cookie bake the perfect treats by adding ingredients together',
          interactiveElements: ['ingredient-mixing', 'oven-timer', 'recipe-following', 'taste-testing'],
          difficulty: 'medium',
          estimatedTime: 12,
          rewards: ['recipe-cards', 'chef-hat-stickers', 'virtual-cupcakes'],
          adaptiveFeatures: ['recipe-difficulty-scaling', 'visual-step-guides', 'mistake-recovery'],
          multimodal: {
            visual: 'animated-kitchen-scene',
            audio: 'cooking-sounds-music',
            kinesthetic: 'drag-ingredients-mix'
          },
          gamification: {
            points: 20,
            achievements: ['Master Baker', 'Recipe Collector'],
            progression: 'unlock-new-recipes'
          }
        },
        {
          type: 'space_addition',
          title: '🚀 Galactic Math Mission',
          description: 'Join Captain Numbers on a space mission to solve addition problems and save the galaxy',
          interactiveElements: ['spaceship-controls', 'alien-encounters', 'planet-exploration', 'rocket-launch'],
          difficulty: 'medium',
          estimatedTime: 10,
          rewards: ['space-badges', 'planet-collectibles', 'astronaut-gear'],
          adaptiveFeatures: ['mission-difficulty-scaling', 'co-pilot-hints', 'mission-replay'],
          multimodal: {
            visual: 'space-adventure-scenes',
            audio: 'space-music-sound-effects',
            kinesthetic: 'touch-controls-navigation'
          },
          gamification: {
            points: 25,
            achievements: ['Space Explorer', 'Galaxy Saver'],
            progression: 'unlock-new-planets'
          }
        }
      ],
      'Shape Recognition': [
        {
          type: 'shape_detective',
          title: '🕵️ Shape Detective Mystery',
          description: 'Become a shape detective and solve mysteries by finding and identifying shapes in the city',
          interactiveElements: ['mystery-solving', 'clue-finding', 'magnifying-glass', 'case-files'],
          difficulty: 'easy',
          estimatedTime: 9,
          rewards: ['detective-badge', 'case-solved-certificates', 'magnifying-glass-stickers'],
          adaptiveFeatures: ['difficulty-case-scaling', 'hint-magnifier', 'case-replay'],
          multimodal: {
            visual: 'detective-city-scenes',
            audio: 'mystery-music-sound-clues',
            kinesthetic: 'tap-to-investigate'
          },
          gamification: {
            points: 18,
            achievements: ['Junior Detective', 'Shape Sleuth'],
            progression: 'unlock-advanced-cases'
          }
        }
      ]
    };
    
    return activityDatabase[topic] || activityDatabase['Counting 1-10'];
  };

  const generatePersonalizedInstructions = (topic, ageGroup, personality) => {
    const personalityStyles = {
      friendly: {
        greeting: 'Hello there, my wonderful learner! 👋',
        encouragement: "You're going to do amazing!",
        tone: 'warm and welcoming'
      },
      encouraging: {
        greeting: "You're a superstar ready to shine! ⭐",
        encouragement: 'I believe in you completely!',
        tone: 'motivational and uplifting'
      },
      playful: {
        greeting: "Ready for some learning fun? Let's play! 🎮",
        encouragement: 'This is going to be so much fun!',
        tone: 'energetic and fun'
      },
      professional: {
        greeting: 'Welcome to your learning session! 📚',
        encouragement: 'You have all the tools to succeed!',
        tone: 'clear and supportive'
      }
    };
    
    const style = personalityStyles[personality] || personalityStyles.friendly;
    
    return `${style.greeting}

🌟 Welcome to your ${topic} adventure! This special homework is designed just for ${ageGroup}-year-olds like you.

🎯 What makes this homework special:
• Interactive activities that adapt to how you learn best
• Instant feedback and celebration when you succeed
• Fun characters and stories to guide your learning
• The ability to take breaks whenever you need them
• Rewards and achievements to celebrate your progress

${style.encouragement}

🚀 How to get started:
1. Find a comfortable, quiet place to learn
2. Make sure you have good lighting and space
3. Take your time - there's no rush!
4. Click the help button anytime you need assistance
5. Remember: mistakes help us learn and grow!

💡 Special features just for you:
• Voice instructions if you prefer listening
• Visual guides for every step
• Fun animations to keep you engaged
• The ability to repeat activities until you feel confident

Ready to begin your learning adventure? Let's go! 🎉`;
  };

  const generateAdvancedParentGuidance = (topic, ageGroup) => {
    return `🏠 Advanced Parent Guide for ${topic} Activities

👨‍👩‍👧‍👦 Creating the Optimal Learning Environment:

📱 Technology Setup:
• Ensure device is fully charged or plugged in
• Use headphones for better audio experience
• Adjust screen brightness for comfort
• Have a backup device ready if needed

🧠 Supporting Your Child's Learning Journey:

✅ Before Starting:
• Review the activities together briefly
• Set up a comfortable, distraction-free workspace
• Prepare healthy snacks and water nearby
• Establish a positive, encouraging atmosphere

✅ During Activities:
• Sit nearby but allow independence
• Celebrate effort and progress, not just correct answers
• Ask open-ended questions: "How did you figure that out?"
• Encourage breaks every 10-15 minutes for ${ageGroup}-year-olds
• Take photos/videos of proud moments (if child agrees)

✅ After Completion:
• Discuss what they learned and enjoyed most
• Connect learning to real-world examples
• Plan related activities for later
• Review progress reports together

🎯 Extension Activities at Home:
• Practice counting during daily routines (stairs, toys, snacks)
• Create math stories using family members or pets
• Use household items for hands-on learning
• Play number games during car rides or walks

📊 Understanding Progress Reports:
• Focus on growth over perfection
• Notice patterns in learning preferences
• Use insights to support future learning
• Celebrate all forms of progress

🆘 When to Offer Help:
• If frustration levels rise significantly
• After 2-3 unsuccessful attempts
• When child specifically asks for assistance
• If technical issues arise

💝 Building Confidence:
• Praise specific efforts: "I love how you tried different strategies!"
• Share your own learning experiences and mistakes
• Create a learning celebration ritual
• Keep a portfolio of their work to show progress

⏰ Recommended Schedule:
• Total time: 20-30 minutes with breaks
• Activity chunks: 5-8 minutes each
• Break time: 2-3 minutes between activities
• Review time: 5 minutes at the end

Remember: Your encouragement and support are the most powerful learning tools your child has! 🌟`;
  };

  const generateSmartAssessmentCriteria = (topic, difficulty) => {
    const baseCriteria = [
      {
        criterion: 'Conceptual Understanding',
        description: 'Demonstrates grasp of core mathematical concepts',
        weight: 35,
        levels: [
          { name: 'Emerging', description: 'Beginning to understand basic concepts', points: 1 },
          { name: 'Developing', description: 'Shows understanding with some support', points: 2 },
          { name: 'Proficient', description: 'Demonstrates clear understanding', points: 3 },
          { name: 'Advanced', description: 'Shows deep understanding and makes connections', points: 4 }
        ],
        adaptiveFactors: ['response-time', 'hint-usage', 'error-patterns']
      },
      {
        criterion: 'Problem-Solving Approach',
        description: 'Uses logical strategies to solve problems',
        weight: 25,
        levels: [
          { name: 'Needs Guidance', description: 'Requires significant support', points: 1 },
          { name: 'Guided Practice', description: 'Uses strategies with some help', points: 2 },
          { name: 'Independent', description: 'Applies strategies independently', points: 3 },
          { name: 'Creative Problem-Solver', description: 'Uses multiple strategies creatively', points: 4 }
        ],
        adaptiveFactors: ['strategy-variety', 'persistence', 'self-correction']
      },
      {
        criterion: 'Engagement & Persistence',
        description: 'Shows sustained interest and effort',
        weight: 20,
        levels: [
          { name: 'Minimal Engagement', description: 'Limited participation', points: 1 },
          { name: 'Good Effort', description: 'Consistent participation', points: 2 },
          { name: 'High Engagement', description: 'Enthusiastic participation', points: 3 },
          { name: 'Exceptional Drive', description: 'Self-motivated and curious', points: 4 }
        ],
        adaptiveFactors: ['time-on-task', 'voluntary-repetition', 'exploration-behavior']
      },
      {
        criterion: 'Communication of Learning',
        description: 'Expresses mathematical thinking clearly',
        weight: 20,
        levels: [
          { name: 'Limited Expression', description: 'Difficulty explaining thinking', points: 1 },
          { name: 'Basic Communication', description: 'Simple explanations', points: 2 },
          { name: 'Clear Communication', description: 'Explains thinking well', points: 3 },
          { name: 'Rich Expression', description: 'Detailed, confident explanations', points: 4 }
        ],
        adaptiveFactors: ['verbal-responses', 'gesture-use', 'digital-expression']
      }
    ];
    
    return baseCriteria;
  };

  const generateRewardSystem = (gamificationLevel) => {
    const rewardSystems = {
      low: {
        pointsPerActivity: 5,
        achievements: ['Participation Star', 'Good Effort Medal'],
        unlockables: ['New Activity Themes'],
        celebrations: ['Gentle Applause', 'Encouraging Words']
      },
      medium: {
        pointsPerActivity: 10,
        achievements: ['Learning Champion', 'Problem Solver', 'Creative Thinker', 'Persistent Learner'],
        unlockables: ['Character Customization', 'New Game Modes', 'Bonus Activities'],
        celebrations: ['Confetti Animation', 'Character Dance', 'Achievement Fanfare']
      },
      high: {
        pointsPerActivity: 15,
        achievements: [
          'Math Wizard', 'Speed Demon', 'Perfect Score', 'Help Master',
          'Explorer', 'Innovator', 'Teacher\'s Pride', 'Class Hero'
        ],
        unlockables: [
          'Premium Themes', 'Advanced Challenges', 'Multiplayer Mode',
          'Create Your Own Problems', 'Teacher Mode', 'Parent Sharing'
        ],
        celebrations: [
          'Epic Fireworks', 'Victory Parade', 'Superhero Transformation',
          'Trophy Ceremony', 'Class Announcement'
        ]
      }
    };
    
    return rewardSystems[gamificationLevel] || rewardSystems.medium;
  };

  const generateProgressMilestones = (topic) => {
    return [
      {
        milestone: 'First Steps',
        description: 'Completed first activity successfully',
        reward: 'Welcome Badge',
        percentage: 25
      },
      {
        milestone: 'Getting Confident',
        description: 'Completed activities with minimal hints',
        reward: 'Confidence Star',
        percentage: 50
      },
      {
        milestone: 'Almost There',
        description: 'Demonstrated consistent understanding',
        reward: 'Progress Trophy',
        percentage: 75
      },
      {
        milestone: 'Mission Complete!',
        description: 'Mastered all learning objectives',
        reward: 'Master Certificate',
        percentage: 100
      }
    ];
  };

  const generateCelebrationTriggers = (engagementLevel) => {
    const celebrations = {
      low: ['correct_answer', 'completion'],
      medium: ['correct_answer', 'improvement', 'persistence', 'completion', 'milestone'],
      high: ['correct_answer', 'improvement', 'persistence', 'completion', 'milestone', 'creativity', 'helping_others', 'self_correction']
    };
    
    return celebrations[engagementLevel] || celebrations.medium;
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      subject: template.subject,
      topic: template.topic,
      ageGroup: template.ageGroup,
      difficulty: template.difficulty,
      estimatedDuration: template.duration,
      contentType: template.type,
      activityStyle: template.learningStyle,
      gamificationLevel: template.gamification,
      // Pre-populate with template data
      generatedActivities: template.preview?.activities?.map(title => ({
        title,
        description: `${title} activity from ${template.title} template`,
        type: template.type,
        difficulty: template.difficulty,
        estimatedTime: Math.floor(template.duration / template.activities),
        rewards: template.preview?.rewards || [],
        interactiveElements: template.features || []
      })) || []
    }));
    setStep(2); // Skip to generation step
    setShowTemplateLibrary(false);
  };

  // Generate enhanced AI suggestions
  const generateSmartSuggestions = async (field, value) => {
    if (field === 'topic' && value.length > 2) {
      const suggestions = [
        'Counting 1-10',
        'Basic Addition 1-5',
        'Shape Recognition',
        'Color Patterns',
        'Number Writing Practice',
        'Simple Subtraction',
        'Measurement Basics',
        'Time Concepts',
        'Letter Recognition',
        'Phonics Practice',
        'Animal Sounds',
        'Story Sequencing',
        'Color Mixing',
        'Pattern Making',
        'Fine Motor Skills',
        'Spatial Awareness'
      ].filter(s => s.toLowerCase().includes(value.toLowerCase()));
      
      setAiSuggestions(suggestions);
    }
  };

  // Handle form updates
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'topic') {
      generateSmartSuggestions(field, value);
    }
  };

  // Submit the generated homework
  const handleSubmit = async () => {
    try {
      setIsGenerating(true);
      
      const homeworkData = {
        title: `${formData.topic} - AI Generated Activity`,
        description: formData.generatedInstructions,
        content_type: formData.contentType,
        subject: formData.subject,
        grade: formData.ageGroup,
        difficulty: formData.difficulty,
        estimated_duration: formData.estimatedDuration,
        due_date: `${formData.dueDate} ${formData.dueTime}`,
        assignment_type: formData.assignmentType,
        class_id: formData.assignmentType === 'class' ? formData.selectedClass : null,
        child_ids: formData.assignmentType === 'individual' ? formData.selectedChildren : null,
        ai_generated: true,
        activities_data: JSON.stringify(formData.generatedActivities),
        parent_guidance: formData.parentGuidance,
        assessment_criteria: JSON.stringify(formData.assessmentCriteria),
        adaptive_features: true
      };
      
      const response = await apiService.homework.create(homeworkData);
      
      if (response.data.success) {
        nativeNotificationService.success('AI-generated homework created successfully!');
        
        if (onHomeworkCreated) {
          onHomeworkCreated(response.data.homework);
        }
        
        onClose();
      }
    } catch (error) {
      console.error('Error creating homework:', error);
      nativeNotificationService.error('Failed to create homework');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <FaBrain className={`text-5xl mx-auto mb-3 transition-all duration-300 ${
            animationState === 'generating' ? 'animate-pulse text-purple-400' : 'text-purple-500'
          }`} />
          {animationState === 'generating' && (
            <div className="absolute inset-0 animate-ping">
              <FaBrain className="text-5xl text-purple-300 opacity-75" />
            </div>
          )}
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
          AI Homework Creator
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Create personalized, engaging homework with state-of-the-art AI assistance
        </p>
      </div>

      {/* Quick Start Options */}
      <div className={`p-6 rounded-xl border-2 ${
        isDark ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300'
      } shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <FaRocket className="inline mr-2 text-blue-500" />
          Quick Start Options
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowTemplateLibrary(true)}
            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              isDark 
                ? 'bg-gray-800 border-gray-600 hover:border-purple-500 text-white' 
                : 'bg-white border-gray-200 hover:border-purple-400 text-gray-900'
            }`}
          >
            <FaBookOpen className="text-2xl text-purple-500 mb-2" />
            <h4 className="font-medium mb-1">Template Library</h4>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Choose from pre-designed templates
            </p>
          </button>
          
          <button
            onClick={() => {
              setFormData(prev => ({ ...prev, topic: 'Counting 1-10' }));
              generateAIContent();
            }}
            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              isDark 
                ? 'bg-gray-800 border-gray-600 hover:border-green-500 text-white' 
                : 'bg-white border-gray-200 hover:border-green-400 text-gray-900'
            }`}
          >
            <FaSparkles className="text-2xl text-green-500 mb-2" />
            <h4 className="font-medium mb-1">AI Quick Generate</h4>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Let AI create instantly
            </p>
          </button>
          
          <div className={`p-4 rounded-lg border-2 ${
            isDark 
              ? 'bg-gray-800 border-gray-600 text-white' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <FaSliders className="text-2xl text-orange-500 mb-2" />
            <h4 className="font-medium mb-1">Custom Setup</h4>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Configure all options below
            </p>
          </div>
        </div>
      </div>

      {/* Template Selection Display */}
      {selectedTemplate && (
        <div className={`p-4 rounded-lg border-2 ${
          isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{selectedTemplate.thumbnail}</div>
              <div>
                <h4 className={`font-medium ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                  Template Selected: {selectedTemplate.title}
                </h4>
                <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {selectedTemplate.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedTemplate(null)}
              className={`p-2 rounded-full ${
                isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'
              }`}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Learning Parameters */}
      <div className={`p-6 rounded-xl border-2 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <FaGraduationCap className="inline mr-2 text-blue-500" />
          Learning Foundation
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Subject Area
            </label>
            <select
              value={formData.subject}
              onChange={(e) => updateFormData('subject', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 focus:border-blue-500'
              }`}
            >
              <option value="Mathematics">🔢 Mathematics</option>
              <option value="Language Arts">📚 Language Arts</option>
              <option value="Science">🔬 Science</option>
              <option value="Art">🎨 Creative Arts</option>
              <option value="Music">🎵 Music</option>
              <option value="Social Studies">🌍 Social Studies</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Age Group
            </label>
            <select
              value={formData.ageGroup}
              onChange={(e) => updateFormData('ageGroup', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 focus:border-blue-500'
              }`}
            >
              <option value="2-3">👶 2-3 years (Toddlers)</option>
              <option value="4-6">🧒 4-6 years (Preschool/Kindergarten)</option>
              <option value="7-9">👦 7-9 years (Early Elementary)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Topic / Learning Objective
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => updateFormData('topic', e.target.value)}
                placeholder="e.g., Counting 1-10, Basic Addition, Color Recognition"
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-white border-gray-300 focus:border-purple-500'
                }`}
              />
              <FaLightbulb className="absolute right-3 top-3 text-yellow-500" />
            </div>
            
            {/* Enhanced AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="mt-3">
                <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FaSparkles className="inline mr-1" /> AI Suggestions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => updateFormData('topic', suggestion)}
                      className={`px-3 py-1 text-xs rounded-full transition-all hover:scale-105 ${
                        isDark 
                          ? 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50 border border-purple-700' 
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300'
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Personality & Style */}
      <div className={`p-6 rounded-xl border-2 ${
        isDark ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
      } shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <FaRobot className="inline mr-2 text-purple-500" />
          AI Teaching Personality
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { value: 'friendly', icon: FaHeart, label: 'Friendly', color: 'text-pink-500' },
            { value: 'encouraging', icon: FaStar, label: 'Encouraging', color: 'text-yellow-500' },
            { value: 'playful', icon: FaGamepad, label: 'Playful', color: 'text-green-500' },
            { value: 'professional', icon: FaGraduationCap, label: 'Professional', color: 'text-blue-500' }
          ].map(personality => (
            <label key={personality.value} 
              className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all border-2 ${
                formData.aiPersonality === personality.value
                  ? isDark ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-100 border-purple-500'
                  : isDark ? 'bg-gray-800 border-gray-600 hover:border-gray-500' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="aiPersonality"
                value={personality.value}
                checked={formData.aiPersonality === personality.value}
                onChange={(e) => updateFormData('aiPersonality', e.target.value)}
                className="sr-only"
              />
              <personality.icon className={`text-2xl mb-2 ${personality.color}`} />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {personality.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Enhanced AI Generation Settings */}
      <div className={`p-6 rounded-xl border-2 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <FaSliders className="inline mr-2 text-green-500" />
          Advanced AI Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Content Type
            </label>
            <div className="space-y-3">
              {[
                { value: 'interactive', icon: FaGamepad, label: 'Interactive Games', desc: 'Engaging activities' },
                { value: 'traditional', icon: FaUpload, label: 'Traditional Upload', desc: 'File submissions' },
                { value: 'mixed', icon: FaPalette, label: 'Mixed Format', desc: 'Best of both' }
              ].map(option => (
                <label key={option.value} className={`flex items-start p-3 rounded-lg cursor-pointer transition-all border ${
                  formData.contentType === option.value
                    ? isDark ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-50 border-blue-500'
                    : isDark ? 'bg-gray-700 border-gray-600 hover:border-gray-500' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="contentType"
                    value={option.value}
                    checked={formData.contentType === option.value}
                    onChange={(e) => updateFormData('contentType', e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <option.icon className="mr-2 text-blue-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {option.label}
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {option.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Learning Style Focus
            </label>
            <select
              value={formData.activityStyle}
              onChange={(e) => updateFormData('activityStyle', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500' : 'bg-white border-gray-300 focus:border-green-500'
              }`}
            >
              <option value="visual">👁️ Visual Learning</option>
              <option value="kinesthetic">✋ Hands-on Activities</option>
              <option value="auditory">👂 Audio-Enhanced</option>
              <option value="mixed">🌈 Multi-Modal</option>
            </select>

            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Gamification Level
              </label>
              <select
                value={formData.gamificationLevel}
                onChange={(e) => updateFormData('gamificationLevel', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-yellow-500' : 'bg-white border-gray-300 focus:border-yellow-500'
                }`}
              >
                <option value="low">🌱 Minimal - Focus on Learning</option>
                <option value="medium">🎯 Balanced - Learning + Fun</option>
                <option value="high">🚀 High - Game-like Experience</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Difficulty & Duration
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => updateFormData('difficulty', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg transition-all mb-4 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500' : 'bg-white border-gray-300 focus:border-orange-500'
              }`}
            >
              <option value="easy">🌱 Easy - Building Foundations</option>
              <option value="medium">🌿 Medium - Developing Skills</option>
              <option value="hard">🌳 Challenging - Advanced Practice</option>
            </select>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Estimated Duration: {formData.estimatedDuration} minutes
              </label>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={formData.estimatedDuration}
                onChange={(e) => updateFormData('estimatedDuration', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10m</span>
                <span>60m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Feature Toggles */}
        <div className="mt-6 pt-6 border-t border-gray-300">
          <h4 className={`text-md font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <FaSparkles className="inline mr-2 text-purple-500" />
            Advanced Features
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'realTimeHints', label: 'Real-time Hints', icon: FaLightbulb },
              { key: 'voiceInstructions', label: 'Voice Guide', icon: FaMicrophone },
              { key: 'parentInsights', label: 'Parent Analytics', icon: FaChartLine },
              { key: 'adaptiveDifficulty', label: 'Auto-Adjust', icon: FaSync }
            ].map(feature => (
              <label key={feature.key} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[feature.key]}
                  onChange={(e) => updateFormData(feature.key, e.target.checked)}
                  className="mr-2"
                />
                <feature.icon className="mr-2 text-purple-500" />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {feature.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onClose}
          className={`px-6 py-3 rounded-lg transition-all hover:scale-105 ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          Cancel
        </button>
        
        <button
          onClick={() => setStep(2)}
          disabled={!formData.topic}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:opacity-50 shadow-lg"
        >
          Generate with AI
          <FaMagic className="ml-2 inline" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative inline-block mb-4">
          {animationState === 'generating' ? (
            <div className="relative">
              <div className="animate-spin text-6xl">🧠</div>
              <div className="absolute inset-0 animate-pulse">
                <div className="w-16 h-16 bg-purple-500 rounded-full opacity-30 animate-ping"></div>
              </div>
            </div>
          ) : animationState === 'success' ? (
            <div className="relative">
              <div className="text-6xl animate-bounce">✨</div>
              <div className="absolute inset-0">
                <div className="w-16 h-16 bg-green-500 rounded-full opacity-20 animate-ping"></div>
              </div>
            </div>
          ) : (
            <FaWand className="text-5xl text-purple-500 animate-pulse" />
          )}
        </div>
        
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
          {animationState === 'generating' ? 'AI Creating Your Homework...' : 
            animationState === 'success' ? 'Generation Complete!' :
              'Ready to Generate AI Content'}
        </h2>
        
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {animationState === 'generating' 
            ? 'Our advanced AI is crafting personalized learning experiences'
            : 'Click below to let AI create amazing homework activities'
          }
        </p>
      </div>

      {isGenerating ? (
        <div className="space-y-6">
          {/* Enhanced Generation Progress */}
          <div className={`p-6 rounded-xl border-2 ${
            isDark ? 'bg-gray-800 border-purple-700' : 'bg-white border-purple-200'
          } shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AI Generation Progress
              </h3>
              <span className={`text-sm font-medium ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                {generationProgress}%
              </span>
            </div>
            
            {/* Animated Progress Bar */}
            <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
              <div 
                className="h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${generationProgress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
              </div>
            </div>
            
            {/* Generation Stages */}
            <div className="mt-4 space-y-2">
              {[
                { stage: 'Analyzing learning objectives...', completed: generationProgress >= 20 },
                { stage: 'Generating interactive activities...', completed: generationProgress >= 40 },
                { stage: 'Creating adaptive assessments...', completed: generationProgress >= 60 },
                { stage: 'Personalizing content...', completed: generationProgress >= 80 },
                { stage: 'Finalizing homework structure...', completed: generationProgress >= 100 }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    item.completed 
                      ? 'bg-green-500 text-white' 
                      : generationProgress > index * 20 
                        ? 'bg-purple-500 animate-pulse' 
                        : isDark ? 'bg-gray-600' : 'bg-gray-300'
                  }`}>
                    {item.completed ? (
                      <FaCheck className="text-xs" />
                    ) : generationProgress > index * 20 ? (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    ) : null}
                  </div>
                  <span className={`text-sm ${
                    item.completed ? isDark ? 'text-green-400' : 'text-green-600' :
                      generationProgress > index * 20 ? isDark ? 'text-purple-300' : 'text-purple-600' :
                        isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {item.stage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights During Generation */}
          <div className={`p-4 rounded-xl ${
            isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-start space-x-3">
              <FaLightbulb className="text-yellow-500 mt-1 animate-pulse" />
              <div>
                <h4 className={`font-medium mb-1 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  AI Insight
                </h4>
                <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                  {generationProgress < 40 ? 
                    `Creating ${formData.contentType} activities tailored for ${formData.ageGroup}-year-olds with ${formData.aiPersonality} personality.` :
                    generationProgress < 80 ?
                      `Incorporating ${formData.activityStyle} learning style with ${formData.gamificationLevel} gamification level.` :
                      'Finalizing adaptive features and personalized assessment criteria for optimal learning outcomes.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Fun Animation Elements */}
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Generation Preview */}
          <div className={`p-6 rounded-xl border-2 ${
            isDark ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'
          } shadow-lg`}>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
              <FaRocket className="inline mr-2" />
              Ready to Generate:
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FaGamepad className="text-purple-500" />
                  <span className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                    {formData.contentType === 'interactive' ? 'Interactive games' : 
                      formData.contentType === 'traditional' ? 'Traditional worksheets' : 
                        'Mixed format activities'} for "{formData.topic}"
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaBrain className="text-green-500" />
                  <span className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                    {formData.aiPersonality.charAt(0).toUpperCase() + formData.aiPersonality.slice(1)} AI personality
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaClock className="text-orange-500" />
                  <span className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                    ~{formData.estimatedDuration} minute duration
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FaTrophy className="text-yellow-500" />
                  <span className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                    {formData.gamificationLevel.charAt(0).toUpperCase() + formData.gamificationLevel.slice(1)} gamification level
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaEye className="text-pink-500" />
                  <span className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                    {formData.activityStyle.charAt(0).toUpperCase() + formData.activityStyle.slice(1)} learning style focus
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaChartLine className="text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                    Smart assessment & parent insights
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Features Preview */}
          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <FaSparkles className="inline mr-2 text-purple-500" />
              Enhanced Features Included:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { feature: 'Real-time hints', enabled: formData.realTimeHints, icon: FaLightbulb },
                { feature: 'Voice guidance', enabled: formData.voiceInstructions, icon: FaMicrophone },
                { feature: 'Parent analytics', enabled: formData.parentInsights, icon: FaChartLine },
                { feature: 'Auto-adjustment', enabled: formData.adaptiveDifficulty, icon: FaSync }
              ].map(item => (
                <div key={item.feature} className={`flex items-center space-x-2 p-2 rounded ${
                  item.enabled 
                    ? isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                    : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                }`}>
                  <item.icon className={`text-sm ${item.enabled ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-xs">{item.feature}</span>
                  {item.enabled && <FaCheck className="text-xs text-green-500" />}
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateAIContent}
            className="w-full py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 hover:from-purple-700 hover:via-blue-700 hover:to-green-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-semibold text-lg"
          >
            <div className="flex items-center justify-center space-x-3">
              <FaBrain className="text-xl" />
              <span>Generate AI Homework</span>
              <FaSparkles className="text-xl animate-pulse" />
            </div>
          </button>
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <button
          onClick={() => setStep(1)}
          disabled={isGenerating}
          className={`px-6 py-3 rounded-lg transition-all ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-50' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50'
          }`}
        >
          Back to Settings
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <FaCertificate className="text-5xl text-green-500 animate-pulse" />
          <div className="absolute -top-1 -right-1">
            <FaSparkles className="text-yellow-500 text-lg animate-bounce" />
          </div>
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
          Preview & Customize
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Review your AI-generated homework and make final adjustments
        </p>
      </div>

      {/* Interactive Preview Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className={`flex p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <button
            onClick={() => setIsPreviewMode(false)}
            className={`px-4 py-2 rounded-md transition-all ${
              !isPreviewMode
                ? 'bg-purple-600 text-white shadow-md'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaEdit className="mr-2 inline" />
            Edit Mode
          </button>
          <button
            onClick={() => setIsPreviewMode(true)}
            className={`px-4 py-2 rounded-md transition-all ${
              isPreviewMode
                ? 'bg-green-600 text-white shadow-md'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaPlay className="mr-2 inline" />
            Preview Mode
          </button>
        </div>
      </div>

      {isPreviewMode ? (
        /* Student Preview Mode */
        <div className={`p-6 rounded-xl border-2 ${
          isDark ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-600' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300'
        } shadow-lg`}>
          <div className="text-center mb-6">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              Student Preview: {formData.topic}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              How students will experience this homework
            </p>
          </div>

          {/* Sample Activity Preview */}
          <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-800' : 'bg-white'} border-2 border-dashed border-purple-300`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🌟 {formData.generatedActivities[0]?.title || 'Magical Number Quest'}
              </h4>
              <div className="flex items-center space-x-2">
                <FaTrophy className="text-yellow-500" />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>15 pts</span>
              </div>
            </div>
            
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {formData.generatedActivities[0]?.description || 'Join Luna the counting fairy on a magical adventure!'}
            </p>
            
            {/* Mock Interactive Element */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(num => (
                <div key={num} className={`aspect-square border-2 border-purple-400 rounded-lg flex items-center justify-center cursor-pointer hover:bg-purple-100 transition-colors ${
                  isDark ? 'bg-gray-700 hover:bg-purple-900/30' : 'bg-gray-50'
                }`}>
                  <span className="text-lg font-bold text-purple-600">{num}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition-colors">
                  <FaLightbulb className="mr-1 inline" />Hint
                </button>
                <button className="px-3 py-1 bg-green-500 text-white rounded-full text-sm hover:bg-green-600 transition-colors">
                  <FaMicrophone className="mr-1 inline" />Listen
                </button>
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                ⭐ Progress: 3/5
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              This is how students will interact with the homework activities
            </p>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-6">
          {/* Generated Activities Management */}
          <div className={`p-6 rounded-xl border-2 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FaGamepad className="inline mr-2 text-purple-500" />
                Generated Activities ({formData.generatedActivities.length})
              </h3>
              <button className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700 transition-colors">
                <FaRocket className="mr-1 inline" />Regenerate
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.generatedActivities.map((activity, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  isDark ? 'bg-gray-700 border-gray-600 hover:border-purple-500' : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {activity.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          activity.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            activity.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                        }`}>
                          {activity.difficulty}
                        </span>
                      </div>
                      
                      <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {activity.description}
                      </p>
                      
                      {/* Activity Features */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {activity.interactiveElements?.map((element, idx) => (
                          <span key={idx} className={`px-2 py-1 rounded text-xs ${
                            isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {element}
                          </span>
                        ))}
                      </div>
                      
                      {/* Gamification Elements */}
                      {activity.gamification && (
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <FaStar className="text-yellow-500" />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                              {activity.gamification.points} pts
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FaAward className="text-purple-500" />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                              {activity.gamification.achievements?.length || 0} achievements
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <div className="flex items-center space-x-1">
                        <FaClock className="text-gray-400" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {activity.estimatedTime}m
                        </span>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-purple-500 transition-colors">
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reward System Preview */}
          {formData.rewardSystem && (
            <div className={`p-6 rounded-xl border-2 ${
              isDark ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-700' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
            } shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                <FaTrophy className="inline mr-2" />
                Reward System
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>Points</h4>
                  <p className={`text-sm ${isDark ? 'text-yellow-100' : 'text-yellow-600'}`}>
                    {formData.rewardSystem.pointsPerActivity} points per activity
                  </p>
                </div>
                
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>Achievements</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.rewardSystem.achievements?.slice(0, 3).map((achievement, idx) => (
                      <span key={idx} className={`px-2 py-1 rounded text-xs ${
                        isDark ? 'bg-yellow-800/50 text-yellow-200' : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {achievement}
                      </span>
                    ))}
                    {formData.rewardSystem.achievements?.length > 3 && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        isDark ? 'bg-yellow-800/30 text-yellow-300' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        +{formData.rewardSystem.achievements.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>Unlockables</h4>
                  <p className={`text-xs ${isDark ? 'text-yellow-100' : 'text-yellow-600'}`}>
                    {formData.rewardSystem.unlockables?.length || 0} special unlocks
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Assignment Configuration */}
          <div className={`p-6 rounded-xl border-2 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FaUsers className="inline mr-2 text-blue-500" />
              Assignment Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Due Date & Time
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => updateFormData('dueDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 focus:border-blue-500'
                    }`}
                  />
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => updateFormData('dueTime', e.target.value)}
                    className={`px-3 py-2 border-2 rounded-lg transition-all ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Assignment Type
                </label>
                <select
                  value={formData.assignmentType}
                  onChange={(e) => updateFormData('assignmentType', e.target.value)}
                  className={`w-full px-3 py-2 border-2 rounded-lg transition-all ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500' : 'bg-white border-gray-300 focus:border-green-500'
                  }`}
                >
                  <option value="class">👥 Assign to Entire Class</option>
                  <option value="individual">👤 Assign to Selected Students</option>
                </select>
              </div>
            </div>

            {/* Class/Student Selection */}
            {formData.assignmentType === 'class' && (
              <div className="mt-4">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Class
                </label>
                <select
                  value={formData.selectedClass}
                  onChange={(e) => updateFormData('selectedClass', e.target.value)}
                  className={`w-full px-3 py-2 border-2 rounded-lg transition-all ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-white border-gray-300 focus:border-purple-500'
                  }`}
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(2)}
          className={`px-6 py-3 rounded-lg transition-all hover:scale-105 ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <FaWand className="mr-2 inline" />
          Regenerate
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-6 py-3 rounded-lg transition-all border-2 ${
              isDark 
                ? 'border-blue-500 text-blue-400 hover:bg-blue-900/20' 
                : 'border-blue-500 text-blue-600 hover:bg-blue-50'
            }`}
          >
            {isPreviewMode ? <FaEdit className="mr-2 inline" /> : <FaEye className="mr-2 inline" />}
            {isPreviewMode ? 'Edit' : 'Preview'}
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!formData.dueDate || isGenerating}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:opacity-50 shadow-lg"
          >
            {isGenerating ? (
              <>
                <FaSpinner className="animate-spin mr-2 inline" />
                Creating...
              </>
            ) : (
              <>
                <FaRocket className="mr-2 inline" />
                Create & Assign
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {/* Enhanced Header with Progress */}
          <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-6">
              {[1, 2, 3].map(stepNum => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    stepNum < step 
                      ? 'bg-green-500 text-white scale-110' 
                      : stepNum === step
                        ? 'bg-purple-600 text-white scale-125 shadow-lg'
                        : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNum < step ? (
                      <FaCheck className="animate-bounce" />
                    ) : stepNum === step ? (
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    ) : (
                      stepNum
                    )}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-16 h-2 mx-3 rounded-full transition-all duration-500 ${
                      stepNum < step ? 'bg-green-500' : 
                        stepNum === step - 1 ? 'bg-gradient-to-r from-purple-500 to-gray-300' :
                          isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Titles */}
            <div className="flex justify-center">
              <div className="flex space-x-8 text-sm">
                {[
                  { title: 'Setup & Configuration', icon: FaSliders },
                  { title: 'AI Generation', icon: FaBrain },
                  { title: 'Preview & Assign', icon: FaRocket }
                ].map((stepInfo, index) => (
                  <div key={index} className={`flex items-center space-x-2 transition-all ${
                    index + 1 === step 
                      ? isDark ? 'text-purple-300' : 'text-purple-600'
                      : index + 1 < step
                        ? isDark ? 'text-green-400' : 'text-green-600'
                        : isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <stepInfo.icon className={index + 1 === step ? 'animate-pulse' : ''} />
                    <span className="font-medium">{stepInfo.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Step Content with Animations */}
            <div className={`transition-all duration-500 ${
              animationState === 'generating' ? 'transform scale-105' : ''
            }`}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </div>
          </div>

          {/* Footer with AI Branding */}
          <div className={`p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <FaSparkles className="text-purple-500 animate-pulse" />
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Powered by Advanced AI Technology
              </span>
              <FaSparkles className="text-purple-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <HomeworkTemplateLibrary
          onTemplateSelect={handleTemplateSelect}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}
    </>
  );
};

export default AIHomeworkCreator;
