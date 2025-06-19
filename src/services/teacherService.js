import { api } from './httpClient.js';
import { API_CONFIG } from '../config/api.js';

class TeacherService {
  // Get teacher dashboard data
  async getDashboardData() {
    const response = await api.get(API_CONFIG.ENDPOINTS.TEACHER_DASHBOARD);
    return response.data;
  }

  // Get teacher's classes
  async getClasses() {
    const response = await api.get(API_CONFIG.ENDPOINTS.TEACHER_CLASSES);
    return response.data;
  }

  // Get students in teacher's classes
  async getStudents(classId = null) {
    const url = classId 
      ? `/teacher/students?class_id=${classId}`
      : '/teacher/students';
    
    const response = await api.get(url);
    return response.data;
  }

  // Create homework assignment
  async createHomework(homeworkData) {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.HOMEWORK_CREATE, homeworkData);
      return response.data;
    } catch (error) {
      console.error('Failed to create homework:', error);
      throw error;
    }
  }

  // Get homework assignments created by teacher
  async getHomeworkAssignments() {
    const response = await api.get('/teacher/homework');
    return response.data;
  }

  // Get homework submissions
  async getHomeworkSubmissions(homeworkId = null) {
    const url = homeworkId 
      ? `/teacher/submissions?homework_id=${homeworkId}`
      : '/teacher/submissions';
    
    const response = await api.get(url);
    return response.data;
  }

  // Grade homework submission
  async gradeSubmission(submissionId, gradeData) {
    try {
      const response = await api.patch(`/teacher/submissions/${submissionId}/grade`, gradeData);
      return response.data;
    } catch (error) {
      console.error('Failed to grade submission:', error);
      throw error;
    }
  }

  // Send message to parent
  async sendMessage(messageData) {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.SEND_MESSAGE, messageData);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // Get teacher's messages
  async getMessages() {
    const response = await api.get(API_CONFIG.ENDPOINTS.MESSAGES);
    return response.data;
  }

  // Update attendance
  async updateAttendance(attendanceData) {
    try {
      const response = await api.post('/teacher/attendance', attendanceData);
      return response.data;
    } catch (error) {
      console.error('Failed to update attendance:', error);
      throw error;
    }
  }

  // Mock data for development/fallback
  getMockDashboardData() {
    return {
      teacherStats: {
        totalHomeworks: 12,
        totalSubmissions: 45,
        totalStudents: 25,
        submissionRate: 75
      },
      recentSubmissions: [
        {
          id: 1,
          student_name: 'Emma Johnson',
          homework_title: 'Math Worksheet',
          submitted_at: new Date().toISOString(),
          status: 'submitted'
        },
        {
          id: 2,
          student_name: 'Liam Brown',
          homework_title: 'Science Project',
          submitted_at: new Date(Date.now() - 3600000).toISOString(),
          status: 'submitted'
        },
        {
          id: 3,
          student_name: 'Sofia Davis',
          homework_title: 'Reading Assignment',
          submitted_at: new Date(Date.now() - 7200000).toISOString(),
          status: 'graded'
        }
      ],
      teacherClass: 'Grade 3A',
      upcomingDeadlines: [
        {
          id: 1,
          title: 'Science Project',
          dueDate: new Date(Date.now() + 172800000).toISOString(),
          submissionsCount: 8,
          totalStudents: 25
        },
        {
          id: 2,
          title: 'Math Quiz',
          dueDate: new Date(Date.now() + 432000000).toISOString(),
          submissionsCount: 0,
          totalStudents: 25
        }
      ]
    };
  }

  getMockClasses() {
    return [
      {
        id: 1,
        name: 'Grade 3A',
        subject: 'Mathematics',
        studentCount: 25,
        room: 'Room 101'
      },
      {
        id: 2,
        name: 'Grade 3B',
        subject: 'Science',
        studentCount: 23,
        room: 'Room 102'
      }
    ];
  }

  getMockStudents() {
    return [
      {
        id: 1,
        name: 'Emma Johnson',
        grade: 'Grade 3A',
        parentName: 'Sarah Johnson',
        parentEmail: 'sarah.johnson@email.com',
        profileImage: '/avatars/emma.jpg',
        attendance: 95,
        performance: 'Excellent'
      },
      {
        id: 2,
        name: 'Liam Brown',
        grade: 'Grade 3A',
        parentName: 'Michael Brown',
        parentEmail: 'michael.brown@email.com',
        profileImage: '/avatars/liam.jpg',
        attendance: 88,
        performance: 'Good'
      },
      {
        id: 3,
        name: 'Sofia Davis',
        grade: 'Grade 3A',
        parentName: 'Lisa Davis',
        parentEmail: 'lisa.davis@email.com',
        profileImage: '/avatars/sofia.jpg',
        attendance: 92,
        performance: 'Very Good'
      }
    ];
  }

  getMockHomeworkAssignments() {
    return [
      {
        id: 1,
        title: 'Math Worksheet - Addition',
        subject: 'Mathematics',
        description: 'Complete pages 12-15 in your math workbook',
        assignedDate: new Date(Date.now() - 172800000).toISOString(),
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        classId: 1,
        className: 'Grade 3A',
        submissions: 18,
        totalStudents: 25,
        status: 'active'
      },
      {
        id: 2,
        title: 'Science Experiment Report',
        subject: 'Science',
        description: 'Write a report about your plant growth experiment',
        assignedDate: new Date(Date.now() - 86400000).toISOString(),
        dueDate: new Date(Date.now() + 259200000).toISOString(),
        classId: 2,
        className: 'Grade 3B',
        submissions: 12,
        totalStudents: 23,
        status: 'active'
      }
    ];
  }

  getMockSubmissions() {
    return [
      {
        id: 1,
        homeworkId: 1,
        homeworkTitle: 'Math Worksheet - Addition',
        studentId: 1,
        studentName: 'Emma Johnson',
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        grade: null,
        feedback: null,
        attachments: [
          {
            name: 'math_homework.pdf',
            url: '/submissions/math_homework.pdf',
            type: 'pdf'
          }
        ]
      },
      {
        id: 2,
        homeworkId: 1,
        homeworkTitle: 'Math Worksheet - Addition',
        studentId: 2,
        studentName: 'Liam Brown',
        submittedAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'graded',
        grade: 85,
        feedback: 'Great work! Pay attention to decimal places.',
        attachments: [
          {
            name: 'liam_math.jpg',
            url: '/submissions/liam_math.jpg',
            type: 'image'
          }
        ]
      }
    ];
  }

  getMockMessages() {
    return [
      {
        id: 1,
        to: 'Sarah Johnson',
        toRole: 'parent',
        subject: 'Emma\'s Excellent Progress',
        message: 'I wanted to let you know that Emma is doing exceptional work in mathematics.',
        date: new Date(Date.now() - 3600000).toISOString(),
        sent: true,
        thread: []
      },
      {
        id: 2,
        from: 'Michael Brown',
        fromRole: 'parent',
        subject: 'Liam\'s Homework Question',
        message: 'Could you provide some extra practice materials for Liam?',
        date: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        thread: []
      }
    ];
  }
}

// Create singleton instance
const teacherService = new TeacherService();

export default teacherService;

