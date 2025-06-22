import axios from 'axios';
import { API_CONFIG, buildUrl, logApiCall } from '../config/api';

class AssignmentService {
  constructor() {
    this.apiUrl = API_CONFIG.getApiUrl();
  }

  // Helper to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Helper to handle API responses
  handleResponse(response) {
    if (response.data) {
      return response.data;
    }
    return response;
  }

  // Helper to handle API errors
  handleError(error, operation) {
    console.error(`❌ Assignment Service Error [${operation}]:`, error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'Server error';
      throw new Error(`${operation} failed: ${message}`);
    } else if (error.request) {
      // Request made but no response received
      throw new Error(`${operation} failed: No response from server`);
    } else {
      // Something else happened
      throw new Error(`${operation} failed: ${error.message}`);
    }
  }

  // =============================================================================
  // ASSIGNMENT CRUD OPERATIONS
  // =============================================================================

  /**
   * Create a new assignment
   * @param {Object} assignmentData - Assignment details
   * @param {string} assignmentData.title - Assignment title
   * @param {string} assignmentData.description - Assignment description
   * @param {string} assignmentData.class_name - Class name
   * @param {string} assignmentData.due_date - Due date (ISO string)
   * @param {Array<number>} assignmentData.child_ids - Array of child IDs
   * @returns {Promise<Object>} Created assignments
   */
  async createAssignment(assignmentData) {
    const operation = 'Create Assignment';
    logApiCall('POST', `${this.apiUrl}${API_CONFIG.ENDPOINTS.ASSIGNMENT_CREATE}`, assignmentData);

    try {
      const response = await axios.post(
        buildUrl(API_CONFIG.ENDPOINTS.ASSIGNMENT_CREATE),
        assignmentData,
        { headers: this.getAuthHeaders() }
      );

      console.log('✅ Assignment created successfully:', response.data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, operation);
    }
  }

  /**
   * Get all assignments for a teacher
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<Object>} Teacher assignments
   */
  async getTeacherAssignments(teacherId) {
    const operation = 'Get Teacher Assignments';
    const endpoint = API_CONFIG.ENDPOINTS.HOMEWORK_FOR_TEACHER.replace(':teacherId', teacherId);
    logApiCall('GET', `${this.apiUrl}${endpoint}`);

    try {
      const response = await axios.get(
        buildUrl(endpoint),
        { headers: this.getAuthHeaders() }
      );

      console.log('✅ Teacher assignments fetched:', response.data);
      
      // Handle the corrected API response format
      const data = this.handleResponse(response);
      
      if (data.success && data.homeworks) {
        // Transform the data to match expected format
        return {
          success: true,
          data: data.homeworks.map(hw => ({
            id: hw.id,
            title: hw.title,
            instructions: hw.instructions,
            due_date: hw.due_date,
            class_name: hw.class_name,
            grade: hw.grade,
            submissionCount: hw.submissionCount || 0,
            totalStudents: hw.totalStudents || 0,
            completionRate: hw.completionRate || 0,
            created_at: hw.created_at,
            assignments: [hw] // Wrap single homework in assignments array for compatibility
          })),
          individualAssignments: data.totalHomeworks || 0,
          teacher: data.teacher
        };
      }
      
      return data;
    } catch (error) {
      this.handleError(error, operation);
    }
  }

  /**
   * Update an assignment
   * @param {number} homeworkId - Assignment ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated assignment
   */
  async updateAssignment(homeworkId, updateData) {
    const operation = 'Update Assignment';
    const endpoint = API_CONFIG.ENDPOINTS.ASSIGNMENT_UPDATE.replace(':homeworkId', homeworkId);
    logApiCall('PUT', `${this.apiUrl}${endpoint}`, updateData);

    try {
      const response = await axios.put(
        buildUrl(endpoint),
        updateData,
        { headers: this.getAuthHeaders() }
      );

      console.log('✅ Assignment updated successfully:', response.data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, operation);
    }
  }

  /**
   * Delete an assignment
   * @param {number} homeworkId - Assignment ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteAssignment(homeworkId) {
    const operation = 'Delete Assignment';
    const endpoint = API_CONFIG.ENDPOINTS.ASSIGNMENT_DELETE.replace(':homeworkId', homeworkId);
    logApiCall('DELETE', `${this.apiUrl}${endpoint}`);

    try {
      const response = await axios.delete(
        buildUrl(endpoint),
        { headers: this.getAuthHeaders() }
      );

      console.log('✅ Assignment deleted successfully:', response.data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, operation);
    }
  }

  // =============================================================================
  // SUBMISSION MANAGEMENT
  // =============================================================================

  /**
   * Get all submissions for an assignment
   * @param {number} homeworkId - Assignment ID
   * @returns {Promise<Object>} Assignment submissions
   */
  async getAssignmentSubmissions(homeworkId) {
    const operation = 'Get Assignment Submissions';
    const endpoint = API_CONFIG.ENDPOINTS.ASSIGNMENT_SUBMISSIONS.replace(':homeworkId', homeworkId);
    logApiCall('GET', `${this.apiUrl}${endpoint}`);

    try {
      const response = await axios.get(
        buildUrl(endpoint),
        { headers: this.getAuthHeaders() }
      );

      console.log('✅ Assignment submissions fetched:', response.data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, operation);
    }
  }

  /**
   * Grade a submission
   * @param {number} submissionId - Submission ID
   * @param {Object} gradeData - Grading data
   * @param {string} gradeData.grade - Grade (A+, A, B+, B, C, Incomplete)
   * @param {string} gradeData.feedback - Teacher feedback
   * @param {string} gradeData.status - Submission status
   * @returns {Promise<Object>} Graded submission
   */
  async gradeSubmission(submissionId, gradeData) {
    const operation = 'Grade Submission';
    const endpoint = API_CONFIG.ENDPOINTS.SUBMISSION_GRADE.replace(':submissionId', submissionId);
    logApiCall('PUT', `${this.apiUrl}${endpoint}`, gradeData);

    try {
      const response = await axios.put(
        buildUrl(endpoint),
        gradeData,
        { headers: this.getAuthHeaders() }
      );

      console.log('✅ Submission graded successfully:', response.data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error, operation);
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  /**
   * Get available children for assignment creation (filtered by teacher's class)
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<Array>} Available children in teacher's class
   */
  async getAvailableChildren(teacherId) {
    const operation = 'Get Available Children';
    
    try {
      console.log(`🔍 Fetching children for teacher ${teacherId} from backend...`);
      
      const response = await axios.get(
        buildUrl(`/teacher/${teacherId}/children`),
        { headers: this.getAuthHeaders() }
      );
      
      const children = response.data || response;
      console.log(`✅ Found ${children.length} children in teacher's class`);
      return children;
    } catch (error) {
      console.error('Error getting available children:', error);
      this.handleError(error, operation);
      
      // Fallback to mock data if backend fails
      return [
        { id: 1, name: 'Emma Johnson', age: 5, className: 'Panda Class' },
        { id: 3, name: 'Sophia Davis', age: 6, className: 'Panda Class' }
      ];
    }
  }

  /**
   * Get teacher's assigned class
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<string>} Teacher's class name
   */
  async getTeacherClass(teacherId) {
    const operation = 'Get Teacher Class';
    
    try {
      console.log(`🎯 Fetching class assignment for teacher ${teacherId}...`);
      
      const response = await axios.get(
        buildUrl(`/teacher/${teacherId}/class`),
        { headers: this.getAuthHeaders() }
      );
      
      const classData = response.data || response;
      const className = classData.className || classData.class_name || 'Panda Class';
      console.log(`✅ Teacher ${teacherId} is assigned to: ${className}`);
      return className;
    } catch (error) {
      console.error('Error getting teacher class:', error);
      this.handleError(error, operation);
      
      // Fallback to default class
      return 'Panda Class';
    }
  }

  /**
   * Get assignment statistics for teacher dashboard
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<Object>} Assignment statistics
   */
  async getAssignmentStats(teacherId) {
    const operation = 'Get Assignment Stats';
    
    try {
      const assignments = await this.getTeacherAssignments(teacherId);
      
      if (!assignments.success || !assignments.data) {
        return {
          totalAssignments: 0,
          totalStudents: 0,
          pendingSubmissions: 0,
          completedSubmissions: 0
        };
      }

      const assignmentGroups = assignments.data;
      const totalAssignments = assignmentGroups.length;
      const totalIndividualAssignments = assignments.individualAssignments || 0;
      
      // Calculate unique students
      const allAssignments = assignmentGroups.flatMap(group => group.assignments || []);
      const uniqueStudents = new Set(allAssignments.map(a => a.child_id)).size;

      return {
        totalAssignments,
        totalStudents: uniqueStudents,
        individualAssignments: totalIndividualAssignments,
        assignmentGroups: assignmentGroups
      };
    } catch (error) {
      console.error('Error getting assignment stats:', error);
      return {
        totalAssignments: 0,
        totalStudents: 0,
        pendingSubmissions: 0,
        completedSubmissions: 0
      };
    }
  }

  /**
   * Format due date for display
   * @param {string} dueDateString - Due date string
   * @returns {Object} Formatted date info
   */
  formatDueDate(dueDateString) {
    const dueDate = new Date(dueDateString);
    const now = new Date();
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status = 'upcoming';
    let message = '';
    let color = 'text-gray-600';

    if (diffDays < 0) {
      status = 'overdue';
      message = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
      color = 'text-red-600';
    } else if (diffDays === 0) {
      status = 'today';
      message = 'Due today';
      color = 'text-orange-600';
    } else if (diffDays === 1) {
      status = 'tomorrow';
      message = 'Due tomorrow';
      color = 'text-orange-500';
    } else if (diffDays <= 7) {
      status = 'this-week';
      message = `Due in ${diffDays} days`;
      color = 'text-blue-600';
    } else {
      status = 'upcoming';
      message = `Due in ${diffDays} days`;
      color = 'text-gray-600';
    }

    return {
      status,
      message,
      color,
      date: dueDate.toLocaleDateString(),
      time: dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }
}

// Export singleton instance
export default new AssignmentService();