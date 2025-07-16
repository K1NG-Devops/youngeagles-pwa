import lessonsData from '../../data/lessons.json';

class LessonService {
  constructor() {
    this.lessons = lessonsData;
  }

  // Get all lessons for a specific age group
  getLessonsByAgeGroup(ageGroup) {
    return this.lessons[ageGroup] || [];
  }

  // Get all lessons
  getAllLessons() {
    return {
      age_1_3: this.lessons.age_1_3,
      age_4_6: this.lessons.age_4_6
    };
  }

  // Get lesson by ID
  getLessonById(id) {
    const allLessons = [...this.lessons.age_1_3, ...this.lessons.age_4_6];
    return allLessons.find(lesson => lesson.id === id);
  }

  // Convert lesson to homework assignment
  convertToHomework(lessonId, teacherId, classId, dueDate, additionalInstructions = '') {
    const lesson = this.getLessonById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Create homework object based on lesson
    const homework = {
      title: lesson.title,
      subject: this.getSubjectFromLesson(lesson),
      description: lesson.objective,
      instructions: this.generateInstructions(lesson, additionalInstructions),
      objectives: [lesson.objective],
      activities: lesson.activities,
      materials: lesson.materials,
      parent_guidance: lesson.parent_guide,
      teacher_guidance: lesson.teacher_guide,
      duration: lesson.duration,
      difficulty: lesson.difficulty,
      content_type: this.determineContentType(lesson),
      due_date: dueDate,
      teacher_id: teacherId,
      class_id: classId,
      rubric: lesson.rubric,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return homework;
  }

  // Determine subject based on lesson content
  getSubjectFromLesson(lesson) {
    const title = lesson.title.toLowerCase();
    
    if (title.includes('addition') || title.includes('counting') || title.includes('number')) {
      return 'Mathematics';
    }
    if (title.includes('letter') || title.includes('story') || title.includes('reading')) {
      return 'English';
    }
    if (title.includes('science') || title.includes('experiment')) {
      return 'Science';
    }
    if (title.includes('geography') || title.includes('environment')) {
      return 'Social Studies';
    }
    if (title.includes('music') || title.includes('rhythm')) {
      return 'Music';
    }
    if (title.includes('emotion') || title.includes('family')) {
      return 'Social Skills';
    }
    if (title.includes('hygiene') || title.includes('health')) {
      return 'Health';
    }
    
    return 'General Studies';
  }

  // Determine content type based on lesson
  determineContentType(lesson) {
    const hasInteractiveElements = lesson.activities.some(activity => 
      activity.toLowerCase().includes('game') || 
      activity.toLowerCase().includes('interactive') ||
      activity.toLowerCase().includes('app') ||
      activity.toLowerCase().includes('matching')
    );

    const isBasicSkill = lesson.title.toLowerCase().includes('addition') ||
                        lesson.title.toLowerCase().includes('counting') ||
                        lesson.title.toLowerCase().includes('letter') ||
                        lesson.title.toLowerCase().includes('color') ||
                        lesson.title.toLowerCase().includes('shape');

    return (hasInteractiveElements && isBasicSkill) ? 'interactive' : 'traditional';
  }

  // Generate comprehensive instructions for homework
  generateInstructions(lesson, additionalInstructions) {
    let instructions = `**Learning Objective:** ${lesson.objective}\n\n`;
    
    instructions += `**Activities to Complete:**\n`;
    lesson.activities.forEach((activity, index) => {
      instructions += `${index + 1}. ${activity}\n`;
    });
    
    instructions += `\n**Required Materials:**\n`;
    lesson.materials.forEach((material, index) => {
      instructions += `• ${material}\n`;
    });
    
    instructions += `\n**Teacher Guidance:**\n${lesson.teacher_guide}\n\n`;
    instructions += `**Parent Guidance:**\n${lesson.parent_guide}\n\n`;
    
    if (additionalInstructions) {
      instructions += `**Additional Instructions:**\n${additionalInstructions}\n\n`;
    }
    
    instructions += `**Assessment Rubric:**\n`;
    instructions += `• **Excellent:** ${lesson.rubric.excellent}\n`;
    instructions += `• **Good:** ${lesson.rubric.good}\n`;
    instructions += `• **Developing:** ${lesson.rubric.developing}\n`;
    instructions += `• **Needs Support:** ${lesson.rubric.needs_support}\n`;
    
    return instructions;
  }

  // Get lessons suitable for specific age range
  getLessonsForAge(minAge, maxAge) {
    let suitableLessons = [];
    
    if (minAge <= 3) {
      suitableLessons = [...suitableLessons, ...this.lessons.age_1_3];
    }
    
    if (maxAge >= 4) {
      suitableLessons = [...suitableLessons, ...this.lessons.age_4_6];
    }
    
    return suitableLessons;
  }

  // Search lessons by keyword
  searchLessons(keyword) {
    const allLessons = [...this.lessons.age_1_3, ...this.lessons.age_4_6];
    const searchTerm = keyword.toLowerCase();
    
    return allLessons.filter(lesson => 
      lesson.title.toLowerCase().includes(searchTerm) ||
      lesson.objective.toLowerCase().includes(searchTerm) ||
      lesson.activities.some(activity => activity.toLowerCase().includes(searchTerm))
    );
  }

  // Get lessons by difficulty
  getLessonsByDifficulty(difficulty) {
    const allLessons = [...this.lessons.age_1_3, ...this.lessons.age_4_6];
    return allLessons.filter(lesson => lesson.difficulty === difficulty);
  }

  // Get lessons by duration range
  getLessonsByDuration(minDuration, maxDuration) {
    const allLessons = [...this.lessons.age_1_3, ...this.lessons.age_4_6];
    return allLessons.filter(lesson => 
      lesson.duration >= minDuration && lesson.duration <= maxDuration
    );
  }

  // Generate lesson plan for teacher
  generateLessonPlan(lessonId, customizations = {}) {
    const lesson = this.getLessonById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const lessonPlan = {
      title: lesson.title,
      objective: lesson.objective,
      duration: customizations.duration || lesson.duration,
      difficulty: lesson.difficulty,
      
      // Pre-lesson preparation
      preparation: {
        materials: lesson.materials,
        setup: `Prepare ${lesson.materials.join(', ')} before class begins.`,
        safety: 'Ensure all materials are safe and age-appropriate.'
      },
      
      // Lesson structure
      structure: {
        introduction: `Begin with a brief discussion about ${lesson.title.toLowerCase()}. Ask children what they already know.`,
        mainActivities: lesson.activities,
        conclusion: 'Review what was learned and praise participation.'
      },
      
      // Assessment
      assessment: {
        formative: 'Observe children during activities and provide immediate feedback.',
        summative: lesson.rubric,
        documentation: 'Take photos of children\'s work and note individual progress.'
      },
      
      // Differentiation
      differentiation: {
        support: 'Provide additional visual aids and one-on-one assistance for struggling learners.',
        challenge: 'Offer extension activities for advanced learners.',
        adaptations: 'Modify activities for children with special needs.'
      },
      
      // Parent communication
      parentCommunication: {
        guidance: lesson.parent_guide,
        homeExtension: 'Suggestions for continuing learning at home.',
        reportingCriteria: lesson.rubric
      },
      
      // Follow-up
      followUp: {
        homework: 'Create take-home activities to reinforce learning.',
        nextSteps: 'Plan subsequent lessons building on this foundation.'
      }
    };

    return lessonPlan;
  }

  // Generate progress tracking template
  generateProgressTracker(lessonId) {
    const lesson = this.getLessonById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    return {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      objective: lesson.objective,
      trackingCriteria: lesson.rubric,
      assessmentDate: null,
      studentProgress: {
        // Will be populated with student data
      },
      teacherNotes: '',
      parentFeedback: '',
      recommendedActions: []
    };
  }
}

export default new LessonService();
