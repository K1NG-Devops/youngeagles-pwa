import { API_CONFIG } from '../config/api';

class ClassService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get all classes
  async getClasses() {
    try {
      const response = await fetch(`${this.baseURL}/api/classes`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  }

  // Get single class by ID
  async getClass(classId) {
    try {
      const response = await fetch(`${this.baseURL}/api/classes/${classId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching class:', error);
      throw error;
    }
  }

  // Create new class
  async createClass(classData) {
    try {
      const response = await fetch(`${this.baseURL}/api/classes`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(classData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }

  // Update existing class
  async updateClass(classId, classData) {
    try {
      const response = await fetch(`${this.baseURL}/api/classes/${classId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(classData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }

  // Delete class
  async deleteClass(classId) {
    try {
      const response = await fetch(`${this.baseURL}/api/classes/${classId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  // Get available teachers for assignment
  async getAvailableTeachers() {
    try {
      const response = await fetch(`${this.baseURL}/api/classes/teachers/available`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available teachers:', error);
      throw error;
    }
  }

  // Get available students for assignment
  async getAvailableStudents() {
    try {
      const response = await fetch(`${this.baseURL}/api/classes/students/available`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available students:', error);
      throw error;
    }
  }

  // Assign student to class
  async assignStudentToClass(classId, studentId) {
    try {
      const response = await fetch(`${this.baseURL}/api/classes/${classId}/students`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ student_id: studentId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning student to class:', error);
      throw error;
    }
  }

  // Remove student from class
  async removeStudentFromClass(classId, studentId) {
    try {
      const response = await fetch(`${this.baseURL}/api/classes/${classId}/students/${studentId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing student from class:', error);
      throw error;
    }
  }
}

// Export singleton instance
const classService = new ClassService();
export default classService; 