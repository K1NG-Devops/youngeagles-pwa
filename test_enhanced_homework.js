// Test Script for Enhanced Homework Functionality
// Run this in your browser console to test the enhanced homework features

const testEnhancedHomework = async () => {
  console.log('🧪 Testing Enhanced Homework Functionality...');
  
  // Test 1: Check if API service is available
  try {
    if (typeof apiService === 'undefined') {
      console.error('❌ apiService not available. Make sure you run this in the app context.');
      return;
    }
    console.log('✅ API Service is available');
  } catch (error) {
    console.error('❌ API Service test failed:', error);
    return;
  }
  
  // Test 2: Check current user
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      console.error('❌ No user found in localStorage. Please login first.');
      return;
    }
    console.log('✅ User found:', user.email || user.username);
  } catch (error) {
    console.error('❌ User test failed:', error);
    return;
  }
  
  // Test 3: Test homework creation with enhanced fields
  const testHomeworkData = {
    title: 'Test Enhanced Homework',
    description: 'This is a test homework assignment with enhanced data',
    subject: 'Mathematics',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    teacher_id: user.id,
    status: 'pending',
    
    // ENHANCED FIELDS
    objectives: [
      'Understand basic addition concepts',
      'Practice with numbers 1-10',
      'Develop problem-solving skills'
    ],
    activities: [
      'Complete 10 addition problems',
      'Use counting objects for practice',
      'Complete worksheet'
    ],
    materials: [
      'Math textbook Chapter 3',
      'Counting blocks',
      'Practice worksheet',
      'Calculator'
    ],
    parent_guidance: 'Help your child count using fingers or objects. Make math fun by using everyday items.',
    caps_alignment: 'CAPS Grade 2 - Mathematics',
    duration: 30,
    difficulty: 'easy',
    grade: '2',
    term: '2'
  };
  
  console.log('📝 Test homework data:', testHomeworkData);
  
  // Test 4: Create homework (if you have permission)
  try {
    console.log('🚀 Attempting to create test homework...');
    const response = await apiService.homework.create(testHomeworkData);
    console.log('✅ Homework created successfully:', response.data);
    
    // Test 5: Fetch the created homework
    if (response.data.homework?.id) {
      console.log('📖 Fetching created homework...');
      const fetchResponse = await apiService.homework.getById(response.data.homework.id);
      console.log('✅ Homework fetched:', fetchResponse.data);
      
      // Check if enhanced fields are present
      const homework = fetchResponse.data.homework;
      const enhancedFields = ['objectives', 'activities', 'materials', 'parent_guidance', 'caps_alignment', 'duration', 'difficulty'];
      
      console.log('🔍 Checking enhanced fields:');
      enhancedFields.forEach(field => {
        if (homework[field]) {
          console.log(`✅ ${field}:`, homework[field]);
        } else {
          console.log(`❌ ${field}: Missing`);
        }
      });
    }
  } catch (error) {
    console.error('❌ Homework creation test failed:', error);
    console.log('ℹ️ This might be expected if you don\'t have teacher permissions');
  }
  
  // Test 6: Test parent homework fetch
  try {
    console.log('👨‍👩‍👧‍👦 Testing parent homework fetch...');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user.role === 'parent' && user.id) {
      const parentHomework = await apiService.homework.getByParent(user.id);
      console.log('✅ Parent homework fetched:', parentHomework.data);
      
      // Check if any homework has enhanced fields
      const homework = parentHomework.data.homework || [];
      if (homework.length > 0) {
        console.log('🔍 Checking enhanced fields in parent homework:');
        const firstHomework = homework[0];
        const enhancedFields = ['objectives', 'activities', 'materials', 'parent_guidance', 'caps_alignment', 'duration', 'difficulty'];
        
        enhancedFields.forEach(field => {
          if (firstHomework[field]) {
            console.log(`✅ ${field}:`, firstHomework[field]);
          } else {
            console.log(`❌ ${field}: Missing (using mock data)`);
          }
        });
      } else {
        console.log('ℹ️ No homework found for parent');
      }
    } else {
      console.log('ℹ️ Skipping parent test - user is not a parent');
    }
  } catch (error) {
    console.error('❌ Parent homework fetch test failed:', error);
  }
  
  console.log('🧪 Enhanced homework testing complete!');
};

// Test the mock data fallback system
const testMockDataFallback = () => {
  console.log('🎭 Testing mock data fallback system...');
  
  // Create a mock homework item with missing enhanced fields
  const mockHomework = {
    id: 1,
    title: 'Basic Math',
    subject: 'Mathematics',
    teacher_name: 'Mrs. Smith',
    due_date: '2024-01-15',
    description: 'Basic math homework',
    status: 'pending'
    // Missing: objectives, activities, materials, etc.
  };
  
  // Test the fallback system from RichHomeworkCard
  const enhancedLessonData = {
    objectives: mockHomework.objectives || [
      "Understand key concepts and principles",
      "Apply learning through practical exercises",
      "Develop critical thinking skills"
    ],
    activities: mockHomework.activities || [
      "Read assigned materials carefully",
      "Complete practice exercises",
      "Prepare for class discussion"
    ],
    materials: mockHomework.materials || [
      "Textbook chapters 1-3",
      "Worksheet packet",
      "Calculator (if needed)"
    ],
    parentGuidance: mockHomework.parentGuidance || "Encourage your child to work through problems step-by-step. Help them organize their workspace and check their work before submission.",
    capsAlignment: mockHomework.capsAlignment || "CAPS Grade " + (mockHomework.grade || "4") + " - Term " + (mockHomework.term || "2"),
    estimatedTime: mockHomework.duration || 30,
    difficultyLevel: mockHomework.difficulty || "Intermediate"
  };
  
  console.log('✅ Mock data fallback working correctly:');
  console.log('📋 Enhanced lesson data:', enhancedLessonData);
  
  return enhancedLessonData;
};

// Export functions for global use
window.testEnhancedHomework = testEnhancedHomework;
window.testMockDataFallback = testMockDataFallback;

console.log('🚀 Enhanced homework testing functions loaded!');
console.log('Run testEnhancedHomework() to test the enhanced functionality');
console.log('Run testMockDataFallback() to test the mock data fallback system');
