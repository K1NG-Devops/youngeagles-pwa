import React, { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService.js';
import { generateWorksheetPDF } from '../utils/pdfGenerator';
import { 
  FaPlay, 
  FaPause, 
  FaStar, 
  FaClock, 
  FaUsers, 
  FaDownload, 
  FaSearch, 
  FaEye,
  FaTimes,
  FaPlus,
  FaPaperPlane,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPrint,
  FaFileAlt,
  FaFileCode
} from 'react-icons/fa';

const LessonLibrary = ({ onAssignHomework, classes = [] }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewLesson, setPreviewLesson] = useState(null);
  const [currentPreviewStep, setCurrentPreviewStep] = useState(0);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [assignmentDetails, setAssignmentDetails] = useState({
    dueDate: '',
    instructions: '',
    points: 10
  });
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());
  const [downloadProgress, setDownloadProgress] = useState({});
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const audioRef = useRef(null);

  // Helper function to convert emojis to text for PDF compatibility
  const convertEmojiToText = (text) => {
    if (!text) return text;
    
    const emojiMap = {
      '😊': '(Happy)',
      '😢': '(Sad)', 
      '😠': '(Angry)',
      '😨': '(Scared)',
      '😄': '(Excited)',
      '😮': '(Surprised)',
      '🙂': '(Smiling)',
      '😟': '(Worried)',
      '😡': '(Very Angry)',
      '😰': '(Anxious)',
      '😆': '(Laughing)',
      '😯': '(Amazed)',
      '🌟': '*',
      '🧰': 'Materials:',
      '💡': 'Tip:',
      '🔍': 'Search',
      '🧪': 'Test',
      '📄': 'PDF',
      '✓': 'Complete'
    };
    
    let result = text;
    Object.entries(emojiMap).forEach(([emoji, replacement]) => {
      result = result.replace(new RegExp(emoji, 'g'), replacement);
    });
    
    return result;
  };

  const generateWorksheetData = (filename) => {
    
    const worksheetTemplates = {
      'ABC_Tracing_Worksheet.pdf': {
        title: 'ABC Letter Tracing Practice',
        subtitle: 'CAPS-Aligned Foundation Phase Activity',
        metadata: {
          age: '3-4 years',
          duration: '15 minutes'
        },
        instructions: 'Use your finger to trace each letter in the air first. Then use a crayon or pencil to trace the dotted letters. Say the letter sound as you trace: /a/, /b/, /c/. Try writing the letter on your own in the empty boxes.',
        activities: [
          'Letter A Practice: Trace A A A A A and a a a a a',
          'Letter B Practice: Trace B B B B B and b b b b b',
          'Letter C Practice: Trace C C C C C and c c c c c',
          'Practice writing letters independently in the boxes provided',
          'Match letters to words: APPLE (A), BALL (B), CAT (C)'
        ],
        materials: [
          'Letter cards A, B, C (provided)',
          'Crayons or colored pencils',
          'Worksheet packet (downloadable)',
          'Mirror for mouth movements'
        ],
        assessment: [
          'Child can identify letter A, B, C',
          'Child says correct sounds /a/, /b/, /c/',
          'Child traces letters with proper formation',
          'Child attempts independent writing'
        ],
        notes: 'Practice daily for 5-10 minutes. Praise effort, not just accuracy. Use multi-sensory approach (sand, finger paint). Connect letters to child\'s name and familiar words.'
      },
      
      'Letter_Sound_Matching.pdf': {
        title: 'Letter-Sound Matching Activity',
        subtitle: 'CAPS-Aligned Phonics Activity',
        metadata: {
          age: '3-4 years',
          duration: '10 minutes'
        },
        instructions: 'Look at each picture below. Say the word out loud. Listen for the first sound. Circle the correct letter.',
        activities: [
          'Match APPLE to letter A',
          'Match BALL to letter B',
          'Match CAT to letter C',
          'Practice saying sounds: /a/, /b/, /c/',
          'Find 3 household objects for each letter sound'
        ],
        materials: [
          'Picture cards (provided)',
          'Pencils or crayons',
          'Letter cards A, B, C'
        ],
        assessment: [
          'Identifies A sound correctly',
          'Identifies B sound correctly',
          'Identifies C sound correctly',
          'Can find objects with target sounds'
        ],
        notes: 'Focus on the first sound of each word. Use exaggerated mouth movements to help children see the differences.'
      },
      
      'ABC_Coloring_Pages.pdf': {
        title: 'ABC Coloring and Recognition',
        subtitle: 'CAPS-Aligned Creative Learning Activity',
        metadata: {
          age: '3-4 years',
          duration: '20 minutes'
        },
        instructions: 'Color each picture. Say the letter name and sound. Think of other words that start with that letter. Practice writing letters while coloring.',
        activities: [
          'Color the APPLE red (Letter A)',
          'Color the BALL orange (Letter B)',
          'Color the CAT any color you like (Letter C)',
          'Draw your own pictures for each letter',
          'Practice writing A a A a, B b B b, C c C c'
        ],
        materials: [
          'Crayons or colored pencils',
          'Paper or worksheet',
          'Examples of objects for each letter'
        ],
        assessment: [
          'Recognizes letter shapes',
          'Associates letters with sounds',
          'Can think of words starting with each letter',
          'Shows creativity in coloring and drawing'
        ],
        notes: 'Let child choose colors freely. Talk about the pictures while coloring. Ask "What sound does this letter make?" Display finished work proudly!'
      },
      
      'Safari_Counting_Worksheet.pdf': {
        title: 'Safari Animal Counting',
        subtitle: 'CAPS-Aligned Mathematics Activity',
        metadata: {
          age: '4-5 years',
          duration: '15 minutes'
        },
        instructions: 'Count the animals in each group. Circle the correct number. Write numbers in the spaces provided. Practice number formation.',
        activities: [
          'Count 3 lions and circle the correct number',
          'Count 5 elephants and circle the correct number',
          'Count 7 zebras and circle the correct number',
          'Count 10 giraffes and circle the correct number',
          'Count stars, trees, and butterflies - write the numbers'
        ],
        materials: [
          'Safari animal cards (provided)',
          'Counting blocks or manipulatives',
          'Number cards 1-10',
          'Pencils or crayons'
        ],
        assessment: [
          'Counts objects 1-10 accurately',
          'Recognizes written numbers 1-10',
          'Uses one-to-one correspondence',
          'Can write numbers 1-5'
        ],
        notes: 'Use finger pointing to count each object once. Practice counting slowly and clearly.'
      },
      
      'Number_Formation_Practice.pdf': {
        title: 'Number Formation Practice 1-10',
        subtitle: 'CAPS-Aligned Mathematics Activity',
        metadata: {
          age: '4-5 years',
          duration: '20 minutes'
        },
        instructions: 'Trace each number with your finger first. Use a pencil to trace the dotted numbers. Practice writing numbers in the empty boxes. Say the number name as you write.',
        activities: [
          'Trace and practice writing number 1 (ONE)',
          'Trace and practice writing number 2 (TWO)',
          'Trace and practice writing number 3 (THREE)',
          'Trace and practice writing number 4 (FOUR)',
          'Trace and practice writing number 5 (FIVE)',
          'Draw correct quantities: 1 star, 2 hearts, 3 circles, 4 triangles, 5 squares'
        ],
        materials: [
          'Number practice sheets (provided)',
          'Pencils with good grip',
          'Counting manipulatives'
        ],
        assessment: [
          'Forms numbers correctly',
          'Counts to 5 accurately',
          'Matches numbers to quantities',
          'Shows good pencil control'
        ],
        notes: 'Start with finger tracing in air, then move to paper. Use proper grip and formation techniques.'
      },
      
      'Weather_Observation_Chart.pdf': {
        title: 'Daily Weather Observation Chart',
        subtitle: 'CAPS-Aligned Science Activity',
        metadata: {
          age: '4-5 years',
          duration: 'Daily use'
        },
        instructions: 'Use weather symbols to track daily conditions. Record the temperature each day. Discuss appropriate clothing choices. Look for and record weather patterns over time.',
        activities: [
          'Daily Weather Tracker: Record date, weather, temperature',
          'Use symbols: (Sun) Sunny, (Cloud) Cloudy, (Rain) Rainy, etc.',
          'Reflect on clothing choices: Draw/write recommendations',
          'Identify weather patterns and common conditions over the week'
        ],
        materials: [
          'Weather chart (provided)',
          'Weather symbols',
          'Crayons or markers',
          'Calendar for recording'
        ],
        assessment: [
          'Records weather daily',
          'Uses weather symbols correctly',
          'Makes appropriate clothing choices',
          'Notices weather patterns'
        ],
        notes: 'Engage children in daily discussions about weather changes. Encourage them to observe and report their own findings.'
      },
      
      'Emotions_Face_Cards.pdf': {
        title: 'Emotions Recognition Cards',
        subtitle: 'CAPS-Aligned Social-Emotional Learning',
        metadata: {
          age: '3-4 years',
          duration: '15 minutes'
        },
        instructions: 'Cut out the emotion cards provided. Discuss each emotion and facial expression. Practice making faces in the mirror. Share stories related to each feeling.',
        activities: [
          'Emotion Cards: Happy, Sad, Angry, Scared, Excited, Surprised',
          'Mirror Practice: Make and identify faces',
          'Emotion Stories: Discuss scenarios and emotions',
          'Feeling Wheel: Show your current emotion with an arrow'
        ],
        materials: [
          'Emotion cards (provided)',
          'Mirror for expressions',
          'Scissors (adult use)',
          'Crayons for coloring'
        ],
        assessment: [
          'Makes appropriate facial expressions',
          'Identifies emotions in others',
          'Expresses own feelings appropriately'
        ],
        notes: 'Validate all emotions as normal. Encourage children to name their feelings and express them constructively.'
      },
      
      'Shape_Hunt_Checklist.pdf': {
        title: 'Shape Detective Hunt Checklist',
        subtitle: 'CAPS-Aligned Mathematics Activity',
        metadata: {
          age: '3-4 years',
          duration: '25 minutes'
        },
        instructions: 'Walk around your house and look for various shapes. Draw and check off each shape as you find them. Count the number of each type of shape. Engage in shape-based creative art activities.',
        activities: [
          'Find and identify circles, squares, triangles, and rectangles',
          'Shape Sorting: Draw shapes in the correct boxes',
          'Shape Count: Record quantities for each shape found',
          'Shape Art: Use shapes to create a house drawing'
        ],
        materials: [
          'Shape hunt checklist (provided)',
          'Pencils or crayons',
          'Magnifying glass (optional)',
          'Shape stickers for rewards'
        ],
        assessment: [
          'Identifies circles correctly',
          'Identifies squares correctly',
          'Identifies triangles correctly',
          'Identifies rectangles correctly',
          'Counts shape properties (sides/corners)',
          'Finds shapes in environment'
        ],
        notes: 'Encourage children to explore and recognize shapes in their surroundings. Promote creativity through shape-based art activities.'
      },
      
      'Rhythm_Pattern_Cards.pdf': {
        title: 'Music & Movement Rhythm Patterns',
        subtitle: 'CAPS-Aligned Creative Arts Activity',
        metadata: {
          age: '3-5 years',
          duration: '20 minutes'
        },
        instructions: 'Follow the rhythm pattern cards provided. Clap, tap, or stomp according to the pattern. Create your own rhythm patterns and practice. Use instruments like shakers or bells to enhance the experience.',
        activities: [
          'Follow and practice simple and medium rhythm patterns',
          'Movement Patterns: March, Jump, Spin, etc.',
          'Instrument Patterns: Use homemade instruments to follow beats',
          'Rhythm Activities: Echo games, Create your own, Music patterns'
        ],
        materials: [
          'Rhythm pattern cards (provided)',
          'Simple instruments (shakers, bells)',
          'Music player or phone',
          'Open space for movement'
        ],
        assessment: [
          'Follows simple rhythm patterns',
          'Keeps steady beat',
          'Coordinates body movements',
          'Creates own patterns',
          'Responds to tempo changes'
        ],
        notes: 'Encourage creativity and fun with rhythm activities. Allow children to express themselves through movement and sound.'
      },
      
      'Plant_Observation_Journal.pdf': {
        title: 'Plant Growth Observation Journal',
        subtitle: 'CAPS-Aligned Science Investigation',
        metadata: {
          age: '4-5 years',
          duration: '2-3 weeks'
        },
        instructions: 'Plant seeds and begin daily observations. Record plant growth in the journal. Label plant parts as they develop. Answer science questions based on observations.',
        activities: [
          'Daily Observations: Record height and appearance',
          'Label Plant Parts: Roots, Stem, Leaves, Flowers',
          'Plant Needs Checklist: Water, Sunlight, Air, Soil',
          'Measuring Plant: Record growth over time'
        ],
        materials: [
          'Bean seeds (fast-growing)',
          'Clear plastic cups',
          'Potting soil',
          'Observation journal (provided)',
          'Ruler for measuring'
        ],
        assessment: [
          'Makes daily observations',
          'Records measurements accurately',
          'Identifies plant parts',
          'Understands plant needs',
          'Asks scientific questions'
        ],
        notes: 'Support students in observing and understanding plant growth. Discuss the importance of each part of the plant and how they contribute to growth.'
      },
      
      'Feelings_Wheel_Activity.pdf': {
        title: 'Feelings Wheel Activity',
        subtitle: 'CAPS-Aligned Social-Emotional Learning',
        metadata: {
          age: '3-4 years',
          duration: '15 minutes'
        },
        instructions: 'Look at the feelings wheel with your child. Point to different emotions and name them together. Practice making the facial expressions for each emotion. Use the wheel to identify how you feel right now.',
        activities: [
          'Identify emotions: Happy, Sad, Angry, Scared, Excited, Surprised',
          'Practice making emotion faces in the mirror',
          'Point to your current feeling on the wheel',
          'Share stories about when you felt different emotions',
          'Draw or color your favorite emotion'
        ],
        materials: [
          'Feelings wheel (provided)',
          'Mirror for making faces',
          'Crayons for coloring',
          'Paper for drawing'
        ],
        assessment: [
          'Names basic emotions correctly',
          'Makes appropriate facial expressions',
          'Identifies own current emotions',
          'Shares emotion stories appropriately',
          'Shows empathy for others\' feelings'
        ],
        notes: 'This feelings wheel helps children develop emotional vocabulary and self-awareness. Encourage them to check in with their feelings throughout the day.'
      },
      
      'default': {
        title: 'CAPS-Aligned Worksheet',
        subtitle: 'Educational Activity',
        metadata: {
          age: 'All ages',
          duration: 'Variable'
        },
        instructions: 'This worksheet contains structured activities designed for Foundation Phase learners. Follow the provided instructions for each activity. Complete activities with minimal assistance where possible. Engage actively with the content.',
        activities: [
          'Age-appropriate skill development',
          'CAPS curriculum alignment',
          'Interactive learning experience',
          'Assessment and progress tracking'
        ],
        materials: [
          'Worksheet (provided)',
          'Pencils or crayons',
          'Additional materials as specified'
        ],
        assessment: [
          'Demonstrates understanding of key concepts',
          'Completes activities with minimal assistance',
          'Shows progress toward learning objectives',
          'Engages actively with content'
        ],
        notes: 'Provide supportive learning environment. Encourage effort and persistence. Celebrate small successes. Connect learning to daily experiences.'
      }
    };
    
    const template = worksheetTemplates[filename] || worksheetTemplates['default'];
    
    // Convert emojis to text for PDF compatibility
    return {
      ...template,
      title: convertEmojiToText(template.title),
      subtitle: convertEmojiToText(template.subtitle),
      instructions: convertEmojiToText(template.instructions),
      activities: template.activities.map(activity => convertEmojiToText(activity)),
      materials: template.materials.map(material => convertEmojiToText(material)),
      assessment: template.assessment.map(item => convertEmojiToText(item)),
      notes: convertEmojiToText(template.notes)
    };
  };

  const handleDownload = async (filename) => {
    if (downloadingFiles.has(filename)) {
      nativeNotificationService.info('Already downloading this file, please wait...');
      return;
    }

    setDownloadingFiles(prev => new Set(prev).add(filename));
    setDownloadProgress(prev => ({ ...prev, [filename]: 0 }));

    try {
      const worksheetData = generateWorksheetData(filename);
      
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => ({
          ...prev,
          [filename]: Math.min((prev[filename] || 0) + 20, 90)
        }));
      }, 200);

      setGeneratingPDF(true);
      
      const success = await generateWorksheetPDF(worksheetData, filename);
      
      clearInterval(progressInterval);
      setDownloadProgress(prev => ({ ...prev, [filename]: 100 }));
      
      if (success) {
        nativeNotificationService.success(
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-green-500" />
            <span>📄 {worksheetData.title} downloaded successfully!</span>
          </div>
        );
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('Error downloading worksheet:', error);
      nativeNotificationService.error(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-red-500" />
          <span>Failed to download worksheet. Please try again.</span>
        </div>
      );
    } finally {
      setGeneratingPDF(false);
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(filename);
        return newSet;
      });
      
      setTimeout(() => {
        setDownloadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[filename];
          return newProgress;
        });
      }, 3000);
    }
  };

  const handleDownloadAllMaterials = async (lesson) => {
    if (lesson.worksheets && lesson.worksheets.length > 0) {
      const totalFiles = lesson.worksheets.length;
      let completed = 0;
      
      nativeNotificationService.info(`Starting download of ${totalFiles} materials for "${lesson.title}"`);
      
      for (const worksheet of lesson.worksheets) {
        try {
          await handleDownload(worksheet);
          completed++;
          
          if (completed === totalFiles) {
            nativeNotificationService.success(
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <span>All materials downloaded successfully!</span>
              </div>
            );
          }
        } catch (error) {
          console.error(`Failed to download ${worksheet}:`, error);
          nativeNotificationService.error(`Failed to download ${worksheet}`);
        }
        
        if (completed < totalFiles) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } else {
      nativeNotificationService.info('No downloadable materials available for this lesson.');
    }
  };

  const handlePreviewLesson = (lesson) => {
    setPreviewLesson(lesson);
    setCurrentPreviewStep(0);
    setShowPreviewModal(true);
    nativeNotificationService.success(`Starting preview of "${lesson.title}"`);
  };

  const handleNextStep = () => {
    if (previewLesson && previewLesson.activities && currentPreviewStep < previewLesson.activities.length - 1) {
      setCurrentPreviewStep(currentPreviewStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentPreviewStep > 0) {
      setCurrentPreviewStep(currentPreviewStep - 1);
    }
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    setPreviewLesson(null);
    setCurrentPreviewStep(0);
  };

  // Test PDF generation functionality
  const testPdfGeneration = async () => {
    const testData = {
      title: 'Test Worksheet - PDF Generation',
      subtitle: 'System Test Document',
      metadata: {
        age: '3-4 years',
        duration: '5 minutes'
      },
      instructions: 'This is a test worksheet to verify PDF generation functionality works correctly.',
      activities: [
        'Test activity 1: Verify PDF creation',
        'Test activity 2: Check formatting',
        'Test activity 3: Validate content structure'
      ],
      materials: [
        'PDF generator (system provided)',
        'Test data (provided)',
        'Browser download capability'
      ],
      assessment: [
        'PDF downloads successfully',
        'Content displays correctly',
        'Format is professional'
      ],
      notes: 'This test document verifies that the PDF generation system is working correctly.'
    };

    try {
      setGeneratingPDF(true);
      nativeNotificationService.info('Testing PDF generation...');
      
      const success = await generateWorksheetPDF(testData, 'test-worksheet.pdf');
      
      if (success) {
        nativeNotificationService.success('✅ PDF generation test passed! System is working correctly.');
        return true;
      } else {
        nativeNotificationService.error('❌ PDF generation test failed. Please check system configuration.');
        return false;
      }
    } catch (error) {
      console.error('PDF generation test error:', error);
      nativeNotificationService.error('❌ PDF generation test encountered an error: ' + error.message);
      return false;
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Enhanced error handling for missing dependencies
  const checkPdfDependencies = () => {
    try {
      // Check if jsPDF is available
      if (typeof generateWorksheetPDF !== 'function') {
        throw new Error('PDF generation utility not available');
      }
      
      return true;
    } catch (error) {
      console.error('PDF dependencies check failed:', error);
      nativeNotificationService.error('PDF generation is not available. Please contact support.');
      return false;
    }
  };

  // Enhanced audio playback with fallback
  const playAudio = (lessonId) => {
    if (playingAudio === lessonId) {
      setPlayingAudio(null);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      setPlayingAudio(lessonId);
      
      // Simulate audio playback (replace with actual audio files)
      if (audioRef.current) {
        // audioRef.current.src = `/audio/lesson-${lessonId}.mp3`;
        // audioRef.current.play().catch(console.error);
      }
      
      // Auto-stop after 3 seconds for demo
      setTimeout(() => setPlayingAudio(null), 3000);
    }
  };

  // Enhanced assignment function with validation
  const handleAssignLesson = async () => {
    // Validation
    if (selectedClasses.length === 0) {
      nativeNotificationService.error('Please select at least one class');
      return;
    }

    if (!assignmentDetails.dueDate) {
      nativeNotificationService.error('Please set a due date');
      return;
    }

    // Check if due date is in the future
    const today = new Date();
    const dueDate = new Date(assignmentDetails.dueDate);
    if (dueDate <= today) {
      nativeNotificationService.error('Due date must be in the future');
      return;
    }

    try {
      const homeworkData = {
        title: selectedLesson.title,
        description: `${selectedLesson.description}\n\n${assignmentDetails.instructions}`,
        type: 'lesson',
        lesson_id: selectedLesson.id,
        due_date: assignmentDetails.dueDate,
        points: assignmentDetails.points,
        materials: selectedLesson.materials,
        objectives: selectedLesson.objectives,
        duration: selectedLesson.duration,
        difficulty: selectedLesson.difficulty,
        classes: selectedClasses
      };

      if (onAssignHomework) {
        await onAssignHomework(homeworkData);
      } else {
        await apiService.homework.create(homeworkData);
      }

      nativeNotificationService.success(`✅ Lesson "${selectedLesson.title}" assigned successfully!`);
      setShowAssignModal(false);
      setSelectedClasses([]);
      setAssignmentDetails({ dueDate: '', instructions: '', points: 10 });
    } catch (error) {
      console.error('Error assigning lesson:', error);
      nativeNotificationService.error('Failed to assign lesson. Please try again.');
    }
  };

  // Complete CAPS-aligned lessons with full content
  const lessons = [
    {
      id: 1,
      title: 'ABC Adventure: Letters A, B, C',
      category: 'literacy',
      age: '3-4',
      duration: '20 min',
      difficulty: 'beginner',
      rating: 4.8,
      views: 1240,
      description: 'Complete interactive lesson teaching letters A-C with phonics, tracing, and fun activities',
      materials: [
        'Letter cards A, B, C (provided)',
        'Crayons or colored pencils',
        'Worksheet packet (downloadable)',
        'Mirror for mouth movements',
        'Small objects starting with A, B, C'
      ],
      objectives: [
        'Recognize and name letters A, B, C',
        'Say the sounds /a/, /b/, /c/',
        'Trace letters correctly',
        'Find objects that start with these letters',
        'Practice proper letter formation'
      ],
      activities: [
        {
          step: 1,
          title: 'Letter Introduction (5 minutes)',
          instructions: 'Show letter cards one by one. Say: "This is the letter A. It says /a/ like in APPLE." Have children repeat.'
        },
        {
          step: 2,
          title: 'Sound Practice (5 minutes)',
          instructions: 'Use mirror to show mouth position. Practice /a/ sound with wide open mouth, /b/ with lips together, /c/ with open mouth.'
        },
        {
          step: 3,
          title: 'Letter Tracing (7 minutes)',
          instructions: 'Use worksheet to trace letters. Start with finger tracing in air, then pencil on paper. Say sound while tracing.'
        },
        {
          step: 4,
          title: 'Object Hunt (3 minutes)',
          instructions: 'Find objects in room starting with A, B, C. Examples: Apple, Ball, Cup. Place next to correct letter card.'
        }
      ],
      assessment: {
        checklist: [
          'Can identify letter A, B, C when shown',
          'Says correct sound for each letter',
          'Traces letters with proper formation',
          'Names at least one object per letter'
        ],
        rubric: 'Emerging (1), Developing (2), Proficient (3), Advanced (4)'
      },
      worksheets: [
        'ABC_Tracing_Worksheet.pdf',
        'Letter_Sound_Matching.pdf',
        'ABC_Coloring_Pages.pdf'
      ],
      image: '🔤',
      color: isDark ? 'bg-blue-900/20' : 'bg-blue-100',
      borderColor: isDark ? 'border-blue-600' : 'border-blue-300'
    },
    {
      id: 2,
      title: 'Counting Safari: Numbers 1-10',
      category: 'math',
      age: '4-5',
      duration: '18 min',
      difficulty: 'intermediate',
      rating: 4.9,
      views: 856,
      description: 'Interactive counting lesson with safari animals, number recognition, and hands-on activities',
      materials: [
        'Safari animal cards (provided)',
        'Counting blocks or manipulatives',
        'Number cards 1-10 (provided)',
        'Safari counting worksheet (downloadable)',
        'Stickers or stamps'
      ],
      objectives: [
        'Count objects from 1-10 accurately',
        'Recognize written numbers 1-10',
        'Match quantities to numerals',
        'Use one-to-one correspondence',
        'Practice number formation'
      ],
      activities: [
        {
          step: 1,
          title: 'Safari Introduction (3 minutes)',
          instructions: 'Show safari scene. Count animals together: "1 lion, 2 elephants, 3 zebras..." Point to each animal while counting.'
        },
        {
          step: 2,
          title: 'Number Recognition (5 minutes)',
          instructions: 'Hold up number cards 1-10. Children identify each number. Practice writing numbers in air with finger.'
        },
        {
          step: 3,
          title: 'Counting Practice (7 minutes)',
          instructions: 'Use animal cards. Place different quantities (1-10). Children count and match to correct number card.'
        },
        {
          step: 4,
          title: 'Safari Worksheet (3 minutes)',
          instructions: 'Complete counting worksheet. Count animals in each group and circle the correct number.'
        }
      ],
      assessment: {
        checklist: [
          'Counts objects 1-10 without skipping',
          'Recognizes numerals 1-10',
          'Matches quantities to numbers correctly',
          'Shows one-to-one correspondence'
        ],
        rubric: 'Below expectation (1), Meets expectation (2), Exceeds expectation (3)'
      },
      worksheets: [
        'Safari_Counting_Worksheet.pdf',
        'Number_Formation_Practice.pdf',
        'Animal_Quantity_Matching.pdf'
      ],
      image: '🦁',
      color: isDark ? 'bg-green-900/20' : 'bg-green-100',
      borderColor: isDark ? 'border-green-600' : 'border-green-300'
    },
    {
      id: 3,
      title: 'Rainbow Colors & Patterns',
      category: 'creative',
      age: '3-5',
      duration: '25 min',
      difficulty: 'beginner',
      rating: 4.7,
      views: 2103,
      description: 'Complete art lesson teaching primary colors, color mixing, and simple pattern creation',
      materials: [
        'Red, blue, yellow paint (primary colors)',
        'Paint brushes (various sizes)',
        'Mixing palette or paper plates',
        'White paper (A4 size)',
        'Sponges for texture',
        'Color wheel worksheet (provided)',
        'Pattern strips (downloadable)'
      ],
      objectives: [
        'Identify primary colors (red, blue, yellow)',
        'Mix colors to create secondary colors',
        'Create simple AB patterns',
        'Use different painting techniques',
        'Express creativity through color'
      ],
      activities: [
        {
          step: 1,
          title: 'Color Introduction (5 minutes)',
          instructions: 'Show primary colors. Sing: "Red and blue and yellow too, these are colors just for you!" Name objects of each color.'
        },
        {
          step: 2,
          title: 'Color Mixing Magic (8 minutes)',
          instructions: 'Mix red + blue = purple, blue + yellow = green, red + yellow = orange. Children predict then observe results.'
        },
        {
          step: 3,
          title: 'Rainbow Painting (10 minutes)',
          instructions: 'Paint rainbow using primary and mixed colors. Use brush for lines, sponge for clouds. Follow color order.'
        },
        {
          step: 4,
          title: 'Pattern Practice (2 minutes)',
          instructions: 'Create AB patterns with colors: red-blue-red-blue. Use finger dots or small brushstrokes.'
        }
      ],
      assessment: {
        checklist: [
          'Names primary colors correctly',
          'Successfully mixes colors',
          'Creates recognizable rainbow',
          'Shows AB pattern understanding'
        ],
        rubric: 'Beginning (1), Developing (2), Proficient (3)'
      },
      worksheets: [
        'Color_Wheel_Activity.pdf',
        'Pattern_Practice_Sheets.pdf',
        'Color_Mixing_Chart.pdf'
      ],
      image: '🌈',
      color: isDark ? 'bg-purple-900/20' : 'bg-purple-100',
      borderColor: isDark ? 'border-purple-600' : 'border-purple-300'
    },
    {
      id: 4,
      title: 'Weather Watchers & Seasons',
      category: 'science',
      age: '4-5',
      duration: '22 min',
      difficulty: 'intermediate',
      rating: 4.6,
      views: 674,
      description: 'Comprehensive weather science lesson with observation, recording, and prediction activities',
      materials: [
        'Weather chart (provided)',
        'Weather symbols cards',
        'Thermometer (toy or real)',
        'Calendar for recording',
        'Weather observation sheet (downloadable)',
        'Clothing cards for different weather'
      ],
      objectives: [
        'Identify different weather types',
        'Understand seasonal changes',
        'Make weather predictions',
        'Record daily observations',
        'Connect weather to appropriate clothing'
      ],
      activities: [
        {
          step: 1,
          title: 'Weather Observation (5 minutes)',
          instructions: 'Look outside window. Describe current weather: sunny, cloudy, rainy, windy. Use weather words vocabulary.'
        },
        {
          step: 2,
          title: 'Weather Symbols (6 minutes)',
          instructions: 'Learn weather symbols: sun for sunny, cloud for cloudy, raindrops for rain. Practice matching symbols to descriptions.'
        },
        {
          step: 3,
          title: 'Seasons Discussion (8 minutes)',
          instructions: 'Talk about four seasons. What weather happens in each? What clothes do we wear? What activities can we do?'
        },
        {
          step: 4,
          title: 'Weather Recording (3 minutes)',
          instructions: 'Complete today\'s weather on observation sheet. Draw symbol and write one weather word.'
        }
      ],
      assessment: {
        checklist: [
          'Identifies 4 main weather types',
          'Knows the four seasons',
          'Matches weather to appropriate clothing',
          'Can record simple weather observations'
        ],
        rubric: 'Needs support (1), Sometimes (2), Usually (3), Always (4)'
      },
      worksheets: [
        'Weather_Observation_Chart.pdf',
        'Seasons_Activity_Sheet.pdf',
        'Weather_Clothing_Match.pdf'
      ],
      image: '⛅',
      color: isDark ? 'bg-yellow-900/20' : 'bg-yellow-100',
      borderColor: isDark ? 'border-yellow-600' : 'border-yellow-300'
    },
    {
      id: 5,
      title: 'Feelings Friends: Emotions',
      category: 'social',
      age: '3-4',
      duration: '15 min',
      difficulty: 'beginner',
      rating: 4.9,
      views: 1456,
      description: 'Social-emotional learning lesson about identifying and expressing basic emotions appropriately',
      materials: [
        'Emotion face cards (provided)',
        'Mirror for facial expressions',
        'Feelings wheel (downloadable)',
        'Drawing paper and crayons',
        'Emotion story cards'
      ],
      objectives: [
        'Identify basic emotions (happy, sad, angry, scared)',
        'Recognize emotions in facial expressions',
        'Express feelings appropriately',
        'Show empathy for others\' feelings',
        'Use feeling words in conversation'
      ],
      activities: [
        {
          step: 1,
          title: 'Emotion Introduction (4 minutes)',
          instructions: 'Show emotion cards. Name each feeling. Make faces in mirror: "This is happy - smile! This is sad - frown."'
        },
        {
          step: 2,
          title: 'Feeling Faces (4 minutes)',
          instructions: 'Practice making emotion faces. Children copy teacher. Describe what each emotion looks like on face.'
        },
        {
          step: 3,
          title: 'Emotion Stories (5 minutes)',
          instructions: 'Read short scenarios: "Emma lost her toy." Ask: "How does Emma feel?" Children show emotion face and name feeling.'
        },
        {
          step: 4,
          title: 'My Feelings Drawing (2 minutes)',
          instructions: 'Draw how you feel today. Share with friend. Talk about why you feel that way.'
        }
      ],
      assessment: {
        checklist: [
          'Names 4 basic emotions',
          'Makes appropriate facial expressions',
          'Identifies emotions in others',
          'Uses feeling words to express self'
        ],
        rubric: 'Emerging (1), Developing (2), Secure (3)'
      },
      worksheets: [
        'Emotions_Face_Cards.pdf',
        'Feelings_Wheel_Activity.pdf',
        'Emotion_Scenarios_Cards.pdf'
      ],
      image: '😊',
      color: isDark ? 'bg-pink-900/20' : 'bg-pink-100',
      borderColor: isDark ? 'border-pink-600' : 'border-pink-300'
    },
    {
      id: 6,
      title: 'Shape Detective Adventure',
      category: 'math',
      age: '3-4',
      duration: '17 min',
      difficulty: 'beginner',
      rating: 4.8,
      views: 923,
      description: 'Interactive geometry lesson teaching basic shapes through exploration and hands-on activities',
      materials: [
        'Shape cards (circle, square, triangle, rectangle)',
        'Magnifying glass (toy)',
        'Shape stickers',
        'Shape sorting tray',
        'Real objects of different shapes',
        'Shape hunt worksheet (downloadable)'
      ],
      objectives: [
        'Identify 4 basic shapes',
        'Describe shape properties',
        'Find shapes in environment',
        'Sort objects by shape',
        'Use shape vocabulary correctly'
      ],
      activities: [
        {
          step: 1,
          title: 'Shape Introduction (4 minutes)',
          instructions: 'Show each shape card. Name and trace with finger: "Circle is round, square has 4 equal sides, triangle has 3 sides."'
        },
        {
          step: 2,
          title: 'Shape Properties (5 minutes)',
          instructions: 'Count sides and corners. Circle has no corners, square has 4 corners, triangle has 3. Use hands to show shapes.'
        },
        {
          step: 3,
          title: 'Shape Hunt (6 minutes)',
          instructions: 'Use magnifying glass to find shapes around room. Clock is circle, book is rectangle, etc. Place shape sticker when found.'
        },
        {
          step: 4,
          title: 'Shape Sorting (2 minutes)',
          instructions: 'Sort mixed shape objects into correct groups. Count how many of each shape were found.'
        }
      ],
      assessment: {
        checklist: [
          'Names all 4 basic shapes',
          'Describes shape properties correctly',
          'Finds shapes in environment',
          'Sorts shapes accurately'
        ],
        rubric: 'Not yet (1), Sometimes (2), Usually (3), Always (4)'
      },
      worksheets: [
        'Shape_Hunt_Checklist.pdf',
        'Shape_Sorting_Activity.pdf',
        'Shape_Tracing_Practice.pdf'
      ],
      image: '🔺',
      color: isDark ? 'bg-green-900/20' : 'bg-green-100',
      borderColor: isDark ? 'border-green-600' : 'border-green-300'
    },
    {
      id: 7,
      title: 'Music & Movement Magic',
      category: 'creative',
      age: '3-5',
      duration: '20 min',
      difficulty: 'beginner',
      rating: 4.9,
      views: 1789,
      description: 'Complete music lesson combining rhythm, movement, and creative expression with simple instruments',
      materials: [
        'Music player or phone',
        'Colorful scarves or ribbons',
        'Simple instruments (shakers, bells)',
        'Movement cards (provided)',
        'Rhythm patterns sheet (downloadable)',
        'Open space for movement'
      ],
      objectives: [
        'Move to different rhythms and tempos',
        'Follow simple beat patterns',
        'Express creativity through movement',
        'Coordinate body movements',
        'Play simple rhythm instruments'
      ],
      activities: [
        {
          step: 1,
          title: 'Rhythm Warm-up (4 minutes)',
          instructions: 'Clap to steady beat. Start slow, get faster. Pat knees, stomp feet. Children copy rhythm patterns.'
        },
        {
          step: 2,
          title: 'Scarf Dancing (6 minutes)',
          instructions: 'Give each child a scarf. Play different tempo music. Move scarves high/low, fast/slow, in circles.'
        },
        {
          step: 3,
          title: 'Instrument Orchestra (7 minutes)',
          instructions: 'Distribute instruments. Play together following conductor (teacher). Practice loud/soft, fast/slow.'
        },
        {
          step: 4,
          title: 'Free Movement (3 minutes)',
          instructions: 'Play favorite song. Children move however they feel. Encourage creative expression and individual style.'
        }
      ],
      assessment: {
        checklist: [
          'Moves to beat of music',
          'Follows rhythm patterns',
          'Uses instruments appropriately',
          'Shows creative movement'
        ],
        rubric: 'Beginning (1), Developing (2), Proficient (3)'
      },
      worksheets: [
        'Rhythm_Pattern_Cards.pdf',
        'Movement_Activity_Guide.pdf',
        'Music_Vocabulary_Sheet.pdf'
      ],
      image: '🎵',
      color: isDark ? 'bg-purple-900/20' : 'bg-purple-100',
      borderColor: isDark ? 'border-purple-600' : 'border-purple-300'
    },
    {
      id: 8,
      title: 'Plant Growth Laboratory',
      category: 'science',
      age: '4-5',
      duration: '30 min',
      difficulty: 'intermediate',
      rating: 4.7,
      views: 1045,
      description: 'Complete science investigation about plant growth, needs, and life cycles with hands-on experiments',
      materials: [
        'Bean seeds (fast-growing)',
        'Clear plastic cups',
        'Potting soil',
        'Water spray bottle',
        'Ruler for measuring',
        'Plant observation journal (downloadable)',
        'Labels for cups'
      ],
      objectives: [
        'Understand what plants need to grow',
        'Observe and record plant changes',
        'Learn plant parts and functions',
        'Practice scientific observation',
        'Make predictions about growth'
      ],
      activities: [
        {
          step: 1,
          title: 'Plant Needs Discussion (6 minutes)',
          instructions: 'Talk about what plants need: water, sunlight, soil, air. Compare to what people need. Introduce vocabulary: roots, stem, leaves.'
        },
        {
          step: 2,
          title: 'Seed Planting (12 minutes)',
          instructions: 'Fill cups with soil. Plant 2 seeds per cup. Water gently. Place labels. Predict how long until sprouting.'
        },
        {
          step: 3,
          title: 'Observation Setup (8 minutes)',
          instructions: 'Draw initial observation in journal. Measure and record cup placement. Discuss daily care responsibilities.'
        },
        {
          step: 4,
          title: 'Growth Predictions (4 minutes)',
          instructions: 'Predict what will happen in 1 day, 3 days, 1 week. Draw predictions in journal. Plan daily observations.'
        }
      ],
      assessment: {
        checklist: [
          'Names what plants need to grow',
          'Plants seeds correctly',
          'Makes detailed observations',
          'Records data accurately'
        ],
        rubric: 'Novice (1), Developing (2), Proficient (3), Advanced (4)'
      },
      worksheets: [
        'Plant_Observation_Journal.pdf',
        'Plant_Parts_Diagram.pdf',
        'Growth_Prediction_Chart.pdf'
      ],
      image: '🌱',
      color: isDark ? 'bg-yellow-900/20' : 'bg-yellow-100',
      borderColor: isDark ? 'border-yellow-600' : 'border-yellow-300'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Lessons', icon: '📚', color: isDark ? 'bg-gray-800' : 'bg-gray-100' },
    { id: 'literacy', name: 'Reading & Writing', icon: '📖', color: isDark ? 'bg-blue-900/20' : 'bg-blue-100' },
    { id: 'math', name: 'Numbers & Math', icon: '🔢', color: isDark ? 'bg-green-900/20' : 'bg-green-100' },
    { id: 'science', name: 'Science Fun', icon: '🔬', color: isDark ? 'bg-yellow-900/20' : 'bg-yellow-100' },
    { id: 'creative', name: 'Arts & Crafts', icon: '🎨', color: isDark ? 'bg-purple-900/20' : 'bg-purple-100' },
    { id: 'social', name: 'Social Skills', icon: '👫', color: isDark ? 'bg-pink-900/20' : 'bg-pink-100' }
  ];

  const filteredLessons = lessons.filter(lesson => {
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const LessonCard = ({ lesson }) => (
    <div className={`${lesson.color} ${lesson.borderColor} border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${isDark ? 'hover:shadow-gray-800/50' : ''}`}
      onClick={() => setSelectedLesson(lesson)}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl mb-2">{lesson.image}</div>
        <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              playAudio(lesson.id);
            }}
            className={`p-2 rounded-full shadow-md hover:shadow-lg transition-shadow ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white'}`}
            title="Play lesson audio"
          >
            {playingAudio === lesson.id ? 
              <FaPause className="w-4 h-4 text-blue-600" /> : 
              <FaPlay className="w-4 h-4 text-blue-600" />
            }
          </button>
          {user?.role === 'teacher' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLesson(lesson);
                setShowAssignModal(true);
              }}
              className={`p-2 rounded-full shadow-md hover:shadow-lg transition-shadow ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white'}`}
              title="Assign as homework"
            >
              <FaPlus className="w-4 h-4 text-green-600" />
            </button>
          )}
        </div>
      </div>
      
      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{lesson.title}</h3>
      <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{lesson.description}</p>
      
      <div className={`flex items-center gap-4 text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="flex items-center gap-1">
          <FaClock className="w-4 h-4" />
          {lesson.duration}
        </div>
        <div className="flex items-center gap-1">
          <FaUsers className="w-4 h-4" />
          Age {lesson.age}
        </div>
        <div className="flex items-center gap-1">
          <FaEye className="w-4 h-4" />
          {lesson.views}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <FaStar className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm font-medium">{lesson.rating}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          lesson.difficulty === 'beginner' ? 'bg-green-200 text-green-800' :
            lesson.difficulty === 'intermediate' ? 'bg-yellow-200 text-yellow-800' :
              'bg-red-200 text-red-800'
        }`}>
          {lesson.difficulty}
        </span>
      </div>
      
      {/* Download Progress Indicators */}
      {lesson.worksheets && lesson.worksheets.some(worksheet => downloadingFiles.has(worksheet)) && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaSpinner className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Downloading materials...</span>
          </div>
          {lesson.worksheets.map(worksheet => {
            const progress = downloadProgress[worksheet];
            if (progress !== undefined) {
              return (
                <div key={worksheet} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="truncate">{worksheet}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );

  const LessonDetail = ({ lesson, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 xs:p-4 z-50">
      <div className={`rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-2 xs:p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-6xl mb-4">{lesson.image}</div>
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{lesson.title}</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} break-words`}>{lesson.description}</p>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close lesson details"
            className={`text-2xl ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <FaClock className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <div className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>{lesson.duration}</div>
            <div className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Duration</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <FaUsers className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <div className={`font-semibold ${isDark ? 'text-green-300' : 'text-green-800'}`}>Age {lesson.age}</div>
            <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Age Range</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
            <FaStar className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <div className={`font-semibold ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>{lesson.rating}</div>
            <div className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>Rating</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Learning Objectives</h3>
            <ul className="space-y-2">
              {lesson.objectives.map((obj, index) => (
                <li key={index} className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Materials Needed</h3>
            <div className="space-y-2">
              {lesson.materials.map((material, index) => (
                <div key={index} className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">{material}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {lesson.activities && (
          <div className="mb-6">
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Step-by-Step Activities</h3>
            <div className="space-y-4">
              {lesson.activities.map((activity, index) => (
                <div key={index} className={`border-l-4 border-blue-500 pl-4 py-2 ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'} rounded-r-lg`}>
                  <h4 className={`font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                    Step {activity.step}: {activity.title}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {activity.instructions}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {lesson.assessment && (
            <div>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Assessment Checklist</h3>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <ul className="space-y-2 mb-3">
                  {lesson.assessment.checklist.map((item, index) => (
                    <li key={index} className={`flex items-start gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-green-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Rubric:</strong> {lesson.assessment.rubric}
                </p>
              </div>
            </div>
          )}

          {lesson.worksheets && (
            <div>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Downloadable Resources</h3>
              <div className="space-y-2">
                {lesson.worksheets.map((worksheet, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center gap-2">
                      <FaDownload className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{worksheet}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePrintToPDF(lesson, worksheet)}
                        className="px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        title="Print to PDF"
                      >
                        Print PDF
                      </button>
                      <button
                        onClick={() => handleDownloadHTML(lesson, worksheet)}
                        className="px-2 py-1 rounded text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                        title="Download as HTML"
                      >
                        HTML
                      </button>
                      <button
                        onClick={() => handleDownloadText(lesson, worksheet)}
                        className="px-2 py-1 rounded text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                        title="Download as Text"
                      >
                        Text
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => handlePreviewLesson(lesson)}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaPlay className="w-5 h-5" />
            Preview Lesson
          </button>
          {user?.role === 'teacher' && (
            <button 
              onClick={() => setShowAssignModal(true)}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaPaperPlane className="w-5 h-5" />
              Assign as Homework
            </button>
          )}
          <div className="flex-1 flex gap-2">
            <button 
              onClick={() => handlePrintToPDF(lesson, `${lesson.title}_All_Materials`)}
              className="flex-1 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <FaPrint className="w-5 h-5" />
              Print All
            </button>
            <button 
              onClick={() => handleDownloadHTML(lesson, `${lesson.title}_All_Materials`)}
              className="flex-1 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700"
            >
              <FaFileAlt className="w-5 h-5" />
              HTML
            </button>
            <button 
              onClick={() => handleDownloadText(lesson, `${lesson.title}_All_Materials`)}
              className="flex-1 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
            >
              <FaFileCode className="w-5 h-5" />
              Text
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const AssignmentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl max-w-md w-full p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Assign Lesson</h3>
          <button 
            onClick={() => setShowAssignModal(false)}
            className={`${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Select Classes
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {classes.map(classItem => (
              <label key={classItem.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(classItem.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedClasses([...selectedClasses, classItem.id]);
                    } else {
                      setSelectedClasses(selectedClasses.filter(id => id !== classItem.id));
                    }
                  }}
                  className="rounded text-blue-600"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {classItem.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Due Date
          </label>
          <input
            type="date"
            value={assignmentDetails.dueDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setAssignmentDetails({ ...assignmentDetails, dueDate: e.target.value })}
            className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Points
          </label>
          <input
            type="number"
            value={assignmentDetails.points}
            onChange={(e) => setAssignmentDetails({...assignmentDetails, points: parseInt(e.target.value)})}
            className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            min="1"
            max="100"
          />
        </div>

        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Additional Instructions
          </label>
          <textarea
            value={assignmentDetails.instructions}
            onChange={(e) => setAssignmentDetails({...assignmentDetails, instructions: e.target.value})}
            className={`w-full p-3 border rounded-lg h-24 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            placeholder="Add any specific instructions for this assignment..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAssignModal(false)}
            className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleAssignLesson}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Assign Lesson
          </button>
        </div>
      </div>
    </div>
  );

  const PreviewModal = ({ lesson, currentStep, onNext, onPrev, onClose }) => {
    if (!lesson || !lesson.activities) return null;

    const currentActivity = lesson.activities[currentStep];
    const progress = ((currentStep + 1) / lesson.activities.length) * 100;
    
    const getStepInfo = (step) => {
      const activity = lesson.activities[step];
      return {
        title: activity.title,
        instructions: activity.instructions,
        duration: activity.title.match(/\(([^)]+)\)/)?.[1] || '5 minutes',
        materials: lesson.materials?.slice(step * 2, (step + 1) * 2) || lesson.materials?.slice(0, 2) || []
      };
    };
    
    const stepInfo = getStepInfo(currentStep);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-6xl mb-4">{lesson.image}</div>
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {lesson.title} - Preview
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Interactive lesson preview • Step {currentStep + 1} of {lesson.activities.length}
              </p>
            </div>
            <button 
              onClick={onClose}
              className={`text-2xl ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FaTimes />
            </button>
          </div>

          <div className="mb-6">
            <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Progress: {Math.round(progress)}% complete
            </p>
          </div>

          <div className={`p-6 rounded-lg border-l-4 border-blue-500 mb-6 ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                {stepInfo.title}
              </h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-200 text-blue-800'}`}>
                {stepInfo.duration}
              </div>
            </div>
            <div className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {stepInfo.instructions}
            </div>
            
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-blue-100'}`}>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>💡 Teaching Tips for This Step:</h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {currentStep === 0 && (
                  <>
                    <li>• Speak clearly and make eye contact</li>
                    <li>• Use enthusiastic tone to engage children</li>
                    <li>• Give children time to repeat after you</li>
                  </>
                )}
                {currentStep === 1 && (
                  <>
                    <li>• Demonstrate mouth movements slowly</li>
                    <li>• Have children practice with you</li>
                    <li>• Make it fun with silly faces</li>
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <li>• Guide children's hands if needed</li>
                    <li>• Praise effort, not just accuracy</li>
                    <li>• Let children trace multiple times</li>
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <li>• Encourage exploration around the room</li>
                    <li>• Help children if they get stuck</li>
                    <li>• Celebrate each discovery</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
              <FaClock className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>{lesson.duration}</div>
              <div className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Total Duration</div>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <FaUsers className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <div className={`font-semibold ${isDark ? 'text-green-300' : 'text-green-800'}`}>Age {lesson.age}</div>
              <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Target Age</div>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
              <div className={`font-semibold text-2xl ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                {currentStep + 1}/{lesson.activities.length}
              </div>
              <div className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Current Step</div>
            </div>
          </div>

          {lesson.materials && (
            <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                🧰 Materials Needed:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {lesson.materials.slice(0, 6).map((material, index) => (
                  <div key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    • {material}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={onPrev}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              ← Previous Step
            </button>

            <div className="flex gap-2">
              {lesson.activities.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                  }`}
                ></div>
              ))}
            </div>

            {currentStep < lesson.activities.length - 1 ? (
              <button
                onClick={onNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Next Step →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Complete Preview ✓
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add this function after the existing PDF generation functions
  const handlePrintToPDF = (lesson, filename) => {
    // Create a new window with the lesson content
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const lessonContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${lesson.title} - Young Eagles Learning</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6; 
            color: #333;
          }
          .header { 
            border-bottom: 2px solid #337ab7; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
          }
          .title { 
            color: #337ab7; 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 5px;
          }
          .subtitle { 
            color: #666; 
            font-size: 16px; 
          }
          .section { 
            margin-bottom: 20px; 
            padding: 15px; 
            border-left: 4px solid #337ab7; 
            background-color: #f8f9fa;
          }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #337ab7; 
            margin-bottom: 10px;
          }
          .materials { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 10px; 
            margin-top: 10px;
          }
          .material-item { 
            background: white; 
            padding: 8px; 
            border-radius: 4px; 
            border: 1px solid #ddd;
          }
          .activities { 
            counter-reset: activity-counter; 
          }
          .activity { 
            counter-increment: activity-counter; 
            margin-bottom: 15px; 
            padding: 10px; 
            background: white; 
            border-radius: 4px;
          }
          .activity::before { 
            content: "Step " counter(activity-counter) ": "; 
            font-weight: bold; 
            color: #337ab7;
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd; 
            font-size: 12px; 
            color: #666;
          }
          ul { 
            margin: 10px 0; 
            padding-left: 20px;
          }
          li { 
            margin-bottom: 5px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">🌟 ${lesson.title}</div>
          <div class="subtitle">Young Eagles Learning Platform</div>
          <div class="subtitle">Age: ${lesson.age} | Duration: ${lesson.duration}</div>
        </div>
        
        <div class="section">
          <div class="section-title">📝 Description</div>
          <p>${lesson.description}</p>
        </div>
        
        ${lesson.materials ? `
          <div class="section">
            <div class="section-title">🧰 Materials Needed</div>
            <div class="materials">
              ${lesson.materials.map(material => `
                <div class="material-item">• ${material}</div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <div class="section">
          <div class="section-title">🎯 Learning Activities</div>
          <div class="activities">
            ${lesson.activities.map(activity => `
              <div class="activity">
                <strong>${activity.title}</strong>
                <p>${activity.instructions}</p>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">📊 Assessment</div>
          <ul>
            <li>Observe student engagement during activities</li>
            <li>Check understanding through verbal responses</li>
            <li>Monitor completion of worksheet activities</li>
            <li>Note areas where students need additional support</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Generated: ${new Date().toLocaleDateString()} | Young Eagles Learning Platform</p>
          <p class="no-print">
            <button onclick="window.print()" style="
              background: #337ab7; 
              color: white; 
              padding: 10px 20px; 
              border: none; 
              border-radius: 4px; 
              cursor: pointer;
              font-size: 14px;
            ">Print / Save as PDF</button>
          </p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(lessonContent);
    printWindow.document.close();
    
    // Auto-focus the print dialog
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Alternative: Download as HTML file
  const handleDownloadHTML = (lesson, filename) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${lesson.title} - Young Eagles Learning</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { border-bottom: 2px solid #337ab7; padding-bottom: 10px; margin-bottom: 20px; }
          .title { color: #337ab7; font-size: 24px; font-weight: bold; }
          .section { margin-bottom: 20px; padding: 15px; border-left: 4px solid #337ab7; background-color: #f8f9fa; }
          .section-title { font-size: 18px; font-weight: bold; color: #337ab7; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">🌟 ${lesson.title}</div>
          <p>Age: ${lesson.age} | Duration: ${lesson.duration}</p>
        </div>
        
        <div class="section">
          <div class="section-title">📝 Description</div>
          <p>${lesson.description}</p>
        </div>
        
        ${lesson.materials ? `
          <div class="section">
            <div class="section-title">🧰 Materials Needed</div>
            <ul>
              ${lesson.materials.map(material => `<li>${material}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        <div class="section">
          <div class="section-title">🎯 Learning Activities</div>
          ${lesson.activities.map((activity, index) => `
            <div style="margin-bottom: 15px;">
              <strong>Step ${index + 1}: ${activity.title}</strong>
              <p>${activity.instructions}</p>
            </div>
          `).join('')}
        </div>
        
        <div class="section">
          <div class="section-title">📊 Assessment</div>
          <ul>
            <li>Observe student engagement during activities</li>
            <li>Check understanding through verbal responses</li>
            <li>Monitor completion of worksheet activities</li>
            <li>Note areas where students need additional support</li>
          </ul>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          Generated: ${new Date().toLocaleDateString()} | Young Eagles Learning Platform
        </p>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.pdf', '.html');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Alternative: Download as Text file
  const handleDownloadText = (lesson, filename) => {
    const textContent = `
YOUNG EAGLES LEARNING PLATFORM
================================

Title: ${lesson.title}
Age: ${lesson.age}
Duration: ${lesson.duration}

DESCRIPTION
-----------
${lesson.description}

${lesson.materials ? `
MATERIALS NEEDED
----------------
${lesson.materials.map(material => `• ${material}`).join('\n')}
` : ''}

LEARNING ACTIVITIES
-------------------
${lesson.activities.map((activity, index) => `
Step ${index + 1}: ${activity.title}
${activity.instructions}
`).join('\n')}

ASSESSMENT
----------
• Observe student engagement during activities
• Check understanding through verbal responses
• Monitor completion of worksheet activities
• Note areas where students need additional support

Generated: ${new Date().toLocaleDateString()}
Young Eagles Learning Platform
    `;
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.pdf', '.txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen p-2 xs:p-6 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            🌟 Learning Library
          </h1>
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Interactive lessons for engaging learning!
          </p>
          {user?.role === 'teacher' && (
            <div className="mt-4">
              <button 
                onClick={testPdfGeneration}
                disabled={generatingPDF}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  generatingPDF 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {generatingPDF ? (
                  <>
                    <FaSpinner className="inline w-4 h-4 animate-spin mr-2" />
                    Testing PDF...
                  </>
                ) : (
                  '🧪 Test PDF Generation'
                )}
              </button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search lessons..."
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`${category.color} px-4 py-2 rounded-full border-2 transition-all duration-200 ${
                  selectedCategory === category.id 
                    ? 'border-blue-500 shadow-md transform scale-105' 
                    : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-6">
          {filteredLessons.map(lesson => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No lessons found</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Try adjusting your search or filter criteria</p>
          </div>
        )}

        {selectedLesson && !showAssignModal && (
          <LessonDetail 
            lesson={selectedLesson} 
            onClose={() => setSelectedLesson(null)} 
          />
        )}

        {showAssignModal && selectedLesson && (
          <AssignmentModal />
        )}

        {showPreviewModal && previewLesson && (
          <PreviewModal
            lesson={previewLesson}
            currentStep={currentPreviewStep}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onClose={closePreview}
          />
        )}
      </div>

      <audio ref={audioRef} />
    </div>
  );
};

export default LessonLibrary;
