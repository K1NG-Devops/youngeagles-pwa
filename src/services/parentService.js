import { api } from './httpClient.js';
import { API_CONFIG } from '../config/api.js';

class ParentService {
  // Get parent dashboard data
  async getDashboardData() {
    const response = await api.get(API_CONFIG.ENDPOINTS.PARENT_DASHBOARD);
    return response.data;
  }

  // Get children list
  async getChildren() {
    const response = await api.get(API_CONFIG.ENDPOINTS.CHILDREN);
    return response.data;
  }

  // Get homework list
  async getHomework(childId = null, parentId = null) {
    try {
      if (!childId || !parentId) {
        throw new Error('Child ID and Parent ID are required');
      }

      const url = API_CONFIG.ENDPOINTS.HOMEWORK_FOR_PARENT
        .replace(':parentId', parentId)
        .replace(':childId', childId);
      
      const response = await api.get(url, {
        headers: {
          'X-Request-Source': 'pwa-parent-homework',
          'Cache-Control': 'no-cache'
        },
        timeout: API_CONFIG.TIMEOUT.DEFAULT
      });

      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Error fetching homework:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Submit homework
  async submitHomework(homeworkId, submissionData) {
    try {
      const response = await api.post(
        `${API_CONFIG.ENDPOINTS.HOMEWORK_SUBMIT}/${homeworkId}`,
        submissionData
      );
      return response.data;
    } catch (error) {
      console.error('Failed to submit homework:', error);
      throw error;
    }
  }

  // Get notifications
  async getNotifications() {
    const response = await api.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
    return response.data;
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await api.patch(`${API_CONFIG.ENDPOINTS.MARK_READ}/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Get messages
  async getMessages() {
    const response = await api.get(API_CONFIG.ENDPOINTS.MESSAGES);
    return response.data;
  }

  // Send message
  async sendMessage(messageData) {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.SEND_MESSAGE, messageData);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // Mock data for development/fallback
  getMockDashboardData() {
    return {
      stats: {
        totalHomework: 8,
        completedHomework: 6,
        pendingHomework: 2,
        upcomingEvents: 3
      },
      recentActivity: [
        {
          id: 1,
          type: 'homework_submitted',
          title: 'Math Worksheet Submitted',
          description: 'Emma submitted her math homework',
          date: new Date().toISOString(),
          child: 'Emma'
        },
        {
          id: 2,
          type: 'event_reminder',
          title: 'School Event Tomorrow',
          description: 'Don\'t forget about the school picnic',
          date: new Date(Date.now() - 86400000).toISOString(),
          child: null
        }
      ],
      upcomingHomework: [
        {
          id: 1,
          title: 'Science Project',
          subject: 'Science',
          dueDate: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
          child: 'Emma',
          priority: 'high'
        },
        {
          id: 2,
          title: 'Reading Assignment',
          subject: 'English',
          dueDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
          child: 'Liam',
          priority: 'medium'
        }
      ]
    };
  }

  getMockChildren() {
    return [
      {
        id: 1,
        name: 'Emma Johnson',
        grade: 'Grade 3',
        teacher: 'Mrs. Smith',
        profileImage: '/avatars/emma.jpg'
      },
      {
        id: 2,
        name: 'Liam Johnson',
        grade: 'Grade 1',
        teacher: 'Mr. Brown',
        profileImage: '/avatars/liam.jpg'
      }
    ];
  }

  getMockHomework() {
    return [
      {
        id: 1,
        title: 'Math Worksheet - Addition',
        subject: 'Mathematics',
        description: 'Complete pages 12-15 in your math workbook',
        dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        assignedDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: 'pending',
        priority: 'medium',
        child: 'Emma Johnson',
        teacher: 'Mrs. Smith',
        attachments: [
          {
            name: 'math_worksheet.pdf',
            url: '/homework/math_worksheet.pdf',
            type: 'pdf'
          }
        ]
      },
      {
        id: 2,
        title: 'Science Experiment Report',
        subject: 'Science',
        description: 'Write a report about your plant growth experiment',
        dueDate: new Date(Date.now() + 259200000).toISOString(), // 3 days
        assignedDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        status: 'in_progress',
        priority: 'high',
        child: 'Emma Johnson',
        teacher: 'Ms. Davis',
        attachments: []
      },
      {
        id: 3,
        title: 'Reading Practice',
        subject: 'English',
        description: 'Read chapter 3 and answer the questions',
        dueDate: new Date(Date.now() + 432000000).toISOString(), // 5 days
        assignedDate: new Date().toISOString(), // Today
        status: 'completed',
        priority: 'low',
        child: 'Liam Johnson',
        teacher: 'Mr. Brown',
        attachments: [
          {
            name: 'chapter_3_questions.docx',
            url: '/homework/chapter_3_questions.docx',
            type: 'docx'
          }
        ]
      }
    ];
  }

  getMockNotifications() {
    return [
      {
        id: 1,
        title: 'New Homework Assigned',
        message: 'Math worksheet has been assigned to Emma',
        type: 'homework',
        read: false,
        date: new Date().toISOString(),
        priority: 'medium'
      },
      {
        id: 2,
        title: 'Parent-Teacher Conference',
        message: 'Schedule your conference for next week',
        type: 'event',
        read: false,
        date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        priority: 'high'
      },
      {
        id: 3,
        title: 'Homework Completed',
        message: 'Liam completed his reading assignment',
        type: 'homework',
        read: true,
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        priority: 'low'
      }
    ];
  }

  getMockMessages() {
    return [
      {
        id: 1,
        from: 'Mrs. Smith',
        fromRole: 'teacher',
        subject: 'Emma\'s Progress',
        message: 'Emma is doing excellent work in math class. Keep up the good work!',
        date: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        thread: []
      },
      {
        id: 2,
        from: 'School Admin',
        fromRole: 'admin',
        subject: 'School Event Reminder',
        message: 'Don\'t forget about the school picnic this Friday at 2 PM.',
        date: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        thread: []
      }
    ];
  }
}

// Create singleton instance
const parentService = new ParentService();

// Export both the class and the singleton instance
export { ParentService, parentService };
export default parentService;

