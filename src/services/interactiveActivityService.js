// This service will handle assigning interactive activities as homework
import { api } from './httpClient';
import { showTopNotification } from '../components/TopNotificationManager';

const assignActivityAsHomework = async (activity, classId = null) => {
  try {
    // Get teacher's class from their profile if not provided
    let targetClass = classId;
    if (!targetClass) {
      try {
        const profileRes = await api.get('/api/teacher/profile');
        if (profileRes.data.success && profileRes.data.teacher) {
          targetClass = profileRes.data.teacher.className;
        }
      } catch (profileError) {
        console.warn('Could not fetch teacher profile, using fallback');
        targetClass = 'Panda'; // Fallback class
      }
    }
    
    // Get children in the teacher's class - required for homework creation
    let childIds = [];
    try {
      const childrenRes = await api.get('/api/auth/children');
      if (childrenRes.data.children && Array.isArray(childrenRes.data.children)) {
        childIds = childrenRes.data.children.map(child => child.id);
        console.log(`🎯 Found ${childIds.length} children in class ${targetClass}`);
      }
    } catch (childrenError) {
      console.error('❌ Failed to fetch children for homework assignment:', childrenError);
      throw new Error('Could not fetch students for class. Please try again.');
    }
    
    if (childIds.length === 0) {
      throw new Error(`No students found in class ${targetClass}. Cannot assign homework.`);
    }

    const payload = {
      title: `Interactive Activity: ${activity.title}`,
      description: `Complete the interactive activity: ${activity.description}\n\nSubject: ${activity.subject}\nDifficulty: ${activity.difficulty}\nEstimated Duration: ${activity.duration}`,
      class_name: targetClass,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Due in 7 days
      child_ids: childIds, // Required by backend API
      type: 'interactive_activity',
      items: JSON.stringify({
        activityId: activity.id,
        subject: activity.subject,
        difficulty: activity.difficulty,
        duration: activity.duration
      })
    };
    
    console.log('🎮 Assigning interactive activity as homework:', payload);
    
    // Make actual API call to create homework
    const response = await api.post('/homework/create', payload);
    
    if (response.data.success) {
      showTopNotification(`'${activity.title}' assigned as homework successfully!`, 'success');
      return { 
        success: true, 
        data: response.data.homework,
        message: `Assigned to ${targetClass || 'your class'}`
      };
    } else {
      throw new Error(response.data.message || 'Failed to assign homework');
    }

  } catch (error) {
    console.error('Error assigning activity as homework:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to assign activity';
    showTopNotification(`Failed to assign homework: ${errorMessage}`, 'error');
    return { success: false, error: errorMessage };
  }
};

const interactiveActivityService = {
  assignActivityAsHomework,
};

export default interactiveActivityService; 