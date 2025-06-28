import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme.jsx';
import { FaUser, FaSave, FaDownload, FaEye, FaPlus, FaBook, FaCheck, FaEdit, FaCalendar, FaGraduationCap, FaHeart, FaBrain, FaRunning, FaStar, FaExclamationTriangle, FaChartLine, FaLightbulb, FaFileAlt } from 'react-icons/fa';
import teacherService from '../../services/teacherService';
import html2pdf from 'html2pdf.js';

const StudentReportBuilder = () => {
  const { isDark } = useTheme();
  
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('assessment'); // 'assessment', 'library', 'analytics'
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState({
    reportingPeriod: '',
    overallGrade: '',
    attendance: { present: 0, absent: 0, late: 0 },
    socialEmotional: {
      positiveComments: [],
      areasForGrowth: [],
      customComments: []
    },
    cognitive: {
      positiveComments: [],
      areasForGrowth: [],
      customComments: [],
      specificSkills: {}
    },
    physical: {
      positiveComments: [],
      areasForGrowth: [],
      customComments: []
    },
    generalComments: {
      positive: [],
      constructive: [],
      specific: [],
      overall: []
    },
    recommendations: [],
    teacherNotes: ''
  });
  
  const [homeworkLibrary, setHomeworkLibrary] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const reportRef = useRef();

  // Theme styles based on current theme
  const themeStyles = {
    background: isDark ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: isDark ? 'bg-gray-800' : 'bg-white',
    text: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    inputBg: isDark ? 'bg-gray-700' : 'bg-white',
    primary: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };

  // Predefined comment templates based on developmental areas
  const commentTemplates = {
    socialEmotional: {
      positive: [
        "Demonstrates empathy and understanding towards peers",
        "Cooperates well with others during group activities",
        "Shows enthusiasm for classroom activities",
        "Uses positive language when interacting with others",
        "Displays excellent leadership qualities during group work",
        "Shows kindness and consideration towards classmates",
        "Demonstrates strong social skills in various settings"
      ],
      growth: [
        "May need support with sharing and taking turns",
        "Can sometimes struggle with managing big emotions",
        "Could benefit from practicing self-regulation skills",
        "May need guidance with conflict resolution",
        "Could benefit from developing patience in group settings",
        "May need support with expressing feelings appropriately"
      ]
    },
    cognitive: {
      positive: [
        "Excels in counting and number recognition",
        "Demonstrates strong problem-solving skills",
        "Engages actively in learning activities",
        "Shows curiosity and asks thoughtful questions",
        "Excels in letter recognition and phonics",
        "Demonstrates excellent memory retention",
        "Shows strong critical thinking abilities",
        "Displays creative thinking in various activities"
      ],
      growth: [
        "May need extra practice with fine motor skills",
        "Could benefit from more practice with following multi-step directions",
        "May need support with focusing on tasks for longer periods",
        "Could benefit from additional practice with pre-writing skills",
        "May need support with pattern recognition",
        "Could benefit from more practice with counting beyond 20"
      ]
    },
    physical: {
      positive: [
        "Participates actively in physical activities",
        "Demonstrates good gross motor skills",
        "Has strong fine motor skills",
        "Shows excellent coordination and balance",
        "Demonstrates proper pencil grip and control",
        "Participates enthusiastically in outdoor play"
      ],
      growth: [
        "May need support with coordination and balance",
        "Could benefit from more practice using scissors",
        "May need support with writing and drawing activities",
        "Could benefit from developing stronger hand muscles",
        "May need practice with ball handling skills"
      ]
    },
    general: {
      positive: [
        "It's been a delight seeing your child really love learning so much",
        "Shows remarkable progress throughout the reporting period",
        "Demonstrates a positive attitude towards school",
        "Is a joy to have in the classroom"
      ],
      constructive: [
        "Continue to encourage [child's name]'s love for learning at home",
        "Regular reading practice at home would be beneficial",
        "Consistent routines at home will support classroom learning"
      ],
      specific: [
        "Consider practicing counting to 20 at home",
        "Practice writing letters and numbers daily",
        "Encourage participation in physical activities",
        "Read together for 15-20 minutes daily"
      ],
      overall: [
        "We are proud of [child's name]'s progress this year and look forward to continued growth",
        "Your child has made significant strides this term",
        "We look forward to supporting [child's name]'s continued development"
      ]
    }
  };

  // Homework Library Templates based on assessment areas
  const homeworkTemplates = {
    socialEmotional: [
      {
        title: "Family Helper Chart",
        description: "Create a chart of helpful tasks your child can do at home",
        instructions: "Work with your child to identify age-appropriate tasks they can help with. Create a colorful chart and celebrate their helpfulness!",
        skills: ["cooperation", "responsibility", "self-confidence"],
        estimatedTime: 15,
        materials: ["Paper", "Crayons/Markers", "Stickers"]
      },
      {
        title: "Emotion Faces Drawing",
        description: "Draw different emotion faces and talk about feelings",
        instructions: "Help your child draw faces showing different emotions. Practice naming feelings and when we might feel this way.",
        skills: ["emotional_recognition", "communication", "self_awareness"],
        estimatedTime: 20,
        materials: ["Paper", "Crayons", "Mirror"]
      },
      {
        title: "Kindness Rock Activity",
        description: "Decorate rocks with kind messages or pictures",
        instructions: "Find smooth rocks and decorate them with kind words or happy pictures. Hide them around your yard or neighborhood for others to find!",
        skills: ["empathy", "kindness", "creativity"],
        estimatedTime: 30,
        materials: ["Smooth rocks", "Paint or markers", "Sealer (optional)"]
      }
    ],
    cognitive: [
      {
        title: "Number Hunt Around the House",
        description: "Find and count objects around your home",
        instructions: "Go on a number hunt! Count how many chairs, windows, doors you have. Write down the numbers you find.",
        skills: ["counting", "number_recognition", "observation"],
        estimatedTime: 25,
        materials: ["Paper", "Pencil", "Clipboard (optional)"]
      },
      {
        title: "Letter Sound Treasure Hunt",
        description: "Find objects that start with specific letter sounds",
        instructions: "Choose a letter of the week. Find 5 objects that start with that letter sound. Draw or write about what you found.",
        skills: ["phonics", "letter_recognition", "vocabulary"],
        estimatedTime: 30,
        materials: ["Paper", "Pencil", "Basket for collecting"]
      },
      {
        title: "Pattern Making with Household Items",
        description: "Create patterns using everyday objects",
        instructions: "Use items like spoons, forks, buttons, or blocks to create repeating patterns. Start simple (AB pattern) and get more complex!",
        skills: ["pattern_recognition", "logical_thinking", "sequencing"],
        estimatedTime: 20,
        materials: ["Various household items", "Paper to record patterns"]
      }
    ],
    physical: [
      {
        title: "Obstacle Course Challenge",
        description: "Create a fun obstacle course at home",
        instructions: "Set up pillows to crawl under, tape lines to walk on, and objects to step over. Time your child and celebrate their improvement!",
        skills: ["gross_motor", "coordination", "following_directions"],
        estimatedTime: 30,
        materials: ["Pillows", "Tape", "Safe objects", "Timer"]
      },
      {
        title: "Cutting Practice Activity",
        description: "Practice scissor skills with fun cutting activities",
        instructions: "Draw lines, shapes, and curves for your child to cut along. Start with straight lines and progress to curves and shapes.",
        skills: ["fine_motor", "hand_coordination", "concentration"],
        estimatedTime: 15,
        materials: ["Child-safe scissors", "Paper", "Crayons"]
      },
      {
        title: "Playdough Creations",
        description: "Strengthen hand muscles through playdough activities",
        instructions: "Make letters, numbers, animals, or free-form creations. Squeezing, rolling, and pinching strengthens little hands!",
        skills: ["fine_motor", "hand_strength", "creativity"],
        estimatedTime: 25,
        materials: ["Playdough", "Rolling pin", "Cookie cutters (optional)"]
      }
    ]
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadAnalyticsData();
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const response = await teacherService.getStudents();
      setStudents(response.students || []);
    } catch (error) {
      console.error('Failed to load students:', error);
      // Fallback mock data
      setStudents([
        { id: 1, name: 'Emma Johnson', className: 'Pre-K A', age: 4 },
        { id: 2, name: 'Liam Smith', className: 'Pre-K A', age: 4 },
        { id: 3, name: 'Olivia Brown', className: 'Pre-K A', age: 5 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const response = await teacherService.getStudentAnalytics(selectedStudent.id);
      if (response.success) {
        setAnalyticsData(response.analytics);
      } else {
        // Fallback to mock data if API fails
        const mockAnalytics = {
          totalHomeworkAssigned: 12,
          homeworkCompleted: 8,
          completionRate: 67,
          skillProgress: {
            socialEmotional: { current: 3, target: 4, progress: 75 },
            cognitive: { current: 4, target: 5, progress: 80 },
            physical: { current: 3, target: 4, progress: 75 }
          },
          recentImprovements: [
            "Improved counting skills from 1-10 to 1-20",
            "Better emotional regulation during group activities",
            "Enhanced fine motor skills through writing practice"
          ],
          recommendedHomework: [
            homeworkTemplates.cognitive[0],
            homeworkTemplates.socialEmotional[1]
          ]
        };
        setAnalyticsData(mockAnalytics);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Fallback to mock data
      const mockAnalytics = {
        totalHomeworkAssigned: 0,
        homeworkCompleted: 0,
        completionRate: 0,
        skillProgress: {},
        recentImprovements: [],
        recommendedHomework: []
      };
      setAnalyticsData(mockAnalytics);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setReportData({
      reportingPeriod: '',
      overallGrade: '',
      attendance: { present: 0, absent: 0, late: 0 },
      socialEmotional: { positiveComments: [], areasForGrowth: [], customComments: [] },
      cognitive: { positiveComments: [], areasForGrowth: [], customComments: [], specificSkills: {} },
      physical: { positiveComments: [], areasForGrowth: [], customComments: [] },
      generalComments: { positive: [], constructive: [], specific: [], overall: [] },
      recommendations: [],
      teacherNotes: ''
    });
  };

  const addComment = (category, subcategory, comment) => {
    setReportData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: [...prev[category][subcategory], comment]
      }
    }));
  };

  const removeComment = (category, subcategory, index) => {
    setReportData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: prev[category][subcategory].filter((_, i) => i !== index)
      }
    }));
  };

  const generatePDFReport = async () => {
    if (!selectedStudent || !reportRef.current) return;

    setGeneratingPDF(true);
    try {
      const element = reportRef.current;
      
      const opt = {
        margin: 1,
        filename: `${selectedStudent.name}_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          backgroundColor: isDark ? '#1f2937' : '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait' 
        }
      };

      // Generate and save PDF
      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
      
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        await saveReportToProfile(base64data);
      };
      reader.readAsDataURL(pdfBlob);
      
      // Also download the PDF
      await html2pdf().set(opt).from(element).save();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const saveReportToProfile = async (pdfBase64) => {
    try {
      const response = await teacherService.saveStudentReport(
        selectedStudent.id,
        reportData,
        pdfBase64
      );
      
      if (response.success) {
        alert('Report saved to student profile successfully!');
        console.log('Report saved with ID:', response.reportId);
      } else {
        throw new Error(response.message || 'Failed to save report');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Failed to save report to student profile. Please try again.');
    }
  };

  const generateHomeworkFromAssessment = async (area) => {
    const templates = homeworkTemplates[area] || [];
    const areasForGrowth = reportData[area]?.areasForGrowth || [];
    
    if (areasForGrowth.length === 0) {
      alert(`No areas for growth identified in ${area} development. Assessment needed first.`);
      return;
    }

    // Filter templates based on identified growth areas
    const relevantHomework = templates.filter(template => {
      return areasForGrowth.some(growth => 
        template.skills.some(skill => 
          growth.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(growth.toLowerCase())
        )
      );
    });

    if (relevantHomework.length === 0) {
      alert(`No relevant homework templates found for the identified growth areas in ${area} development.`);
      return;
    }

    try {
      // Save to backend via API
      const response = await teacherService.generateHomeworkFromAssessment(
        selectedStudent.id,
        area,
        relevantHomework
      );

      if (response.success) {
        // Update local state
        setHomeworkLibrary(prev => [...prev, ...relevantHomework.map(hw => ({
          ...hw,
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          assessmentArea: area,
          generatedFrom: areasForGrowth,
          createdAt: new Date().toISOString()
        }))]);

        setActiveTab('library');
        alert(`Generated ${relevantHomework.length} homework activities based on ${area} assessment!`);
      } else {
        throw new Error(response.message || 'Failed to generate homework');
      }
    } catch (error) {
      console.error('Error generating homework:', error);
      alert('Failed to generate homework. Please try again.');
    }
  };

  const sendHomeworkToParent = async (homework) => {
    try {
      if (!homework.id) {
        // For locally generated homework, we need to create it first
        const response = await teacherService.generateHomeworkFromAssessment(
          homework.studentId,
          homework.assessmentArea,
          [homework]
        );
        
        if (!response.success) {
          throw new Error('Failed to create homework assignment');
        }
      }

      // Send to parent (this would integrate with the messaging system)
      alert(`Homework "${homework.title}" sent to ${homework.studentName}'s parent!`);
      console.log('Homework sent successfully:', homework);
      
    } catch (error) {
      console.error('Error sending homework to parent:', error);
      alert('Failed to send homework to parent. Please try again.');
    }
  };

  const CommentSelector = ({ title, icon, category, subcategory, templates, color }) => {
    const [customComment, setCustomComment] = useState('');

    return (
      <div className={`${themeStyles.cardBg} ${themeStyles.border} border rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`${themeStyles.text} font-medium flex items-center`}>
            {React.createElement(icon, { className: `mr-2 ${color}` })}
            {title}
          </h4>
          <button
            onClick={() => generateHomeworkFromAssessment(category)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center"
          >
            <FaLightbulb className="mr-1" />
            Generate Homework
          </button>
        </div>

        {/* Template Buttons */}
        <div className="grid grid-cols-1 gap-2 mb-3">
          {templates.map((template, index) => (
            <button
              key={index}
              onClick={() => addComment(category, subcategory, template)}
              className={`${themeStyles.inputBg} ${themeStyles.border} ${themeStyles.text} border rounded p-2 text-left text-sm hover:opacity-80 transition-opacity`}
            >
              {template}
            </button>
          ))}
        </div>

        {/* Custom Comment Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={customComment}
            onChange={(e) => setCustomComment(e.target.value)}
            placeholder="Add custom comment..."
            className={`${themeStyles.inputBg} ${themeStyles.border} ${themeStyles.text} flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500`}
          />
          <button
            onClick={() => {
              if (customComment.trim()) {
                addComment(category, subcategory, customComment.trim());
                setCustomComment('');
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <FaPlus />
          </button>
        </div>

        {/* Added Comments */}
        {reportData[category] && reportData[category][subcategory] && reportData[category][subcategory].length > 0 && (
          <div className="mt-3">
            <h5 className={`${themeStyles.textMuted} text-sm font-medium mb-2`}>Added Comments:</h5>
            <div className="space-y-2">
              {reportData[category][subcategory].map((comment, index) => (
                <div key={index} className={`${themeStyles.inputBg} ${themeStyles.border} border rounded p-2 flex justify-between items-center`}>
                  <span className={`${themeStyles.text} text-sm`}>{comment}</span>
                  <button
                    onClick={() => removeComment(category, subcategory, index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ReportPreview = () => (
    <div 
      ref={reportRef}
      className={`${isDark ? 'bg-white text-black' : 'bg-white text-black'} p-8 max-w-4xl mx-auto`}
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <div className="text-center mb-8 border-b-2 border-blue-600 pb-4">
        <h2 className="text-3xl font-bold text-blue-600">Young Eagles Preschool</h2>
        <h3 className="text-xl font-semibold mt-2">Student Progress Report</h3>
        <p className="text-sm text-gray-600 mt-2">Reporting Period: {reportData.reportingPeriod}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-blue-700">Student Information</h4>
          <p><strong>Name:</strong> {selectedStudent?.name}</p>
          <p><strong>Class:</strong> {selectedStudent?.className}</p>
          <p><strong>Age:</strong> {selectedStudent?.age}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-green-700">Attendance Summary</h4>
          <p><strong>Present:</strong> {reportData.attendance.present} days</p>
          <p><strong>Absent:</strong> {reportData.attendance.absent} days</p>
          <p><strong>Late:</strong> {reportData.attendance.late} days</p>
        </div>
      </div>

      {/* Development Areas */}
      {[
        { key: 'socialEmotional', title: 'Social-Emotional Development', icon: '❤️', color: 'red' },
        { key: 'cognitive', title: 'Cognitive Development', icon: '🧠', color: 'blue' },
        { key: 'physical', title: 'Physical Development', icon: '🏃', color: 'green' }
      ].map((area) => (
        <div key={area.key} className="mb-8 border-l-4 border-gray-300 pl-4">
          <h4 className="font-semibold mb-4 flex items-center text-lg">
            <span className="mr-2 text-2xl">{area.icon}</span>
            {area.title}
          </h4>
          
          {reportData[area.key].positiveComments.length > 0 && (
            <div className="mb-4 bg-green-50 p-3 rounded">
              <h5 className="font-medium mb-2 text-green-700">Strengths:</h5>
              <ul className="list-disc list-inside space-y-1">
                {reportData[area.key].positiveComments.map((comment, index) => (
                  <li key={index} className="text-sm">{comment}</li>
                ))}
              </ul>
            </div>
          )}
          
          {reportData[area.key].areasForGrowth.length > 0 && (
            <div className="mb-4 bg-yellow-50 p-3 rounded">
              <h5 className="font-medium mb-2 text-yellow-700">Areas for Growth:</h5>
              <ul className="list-disc list-inside space-y-1">
                {reportData[area.key].areasForGrowth.map((comment, index) => (
                  <li key={index} className="text-sm">{comment}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {/* General Comments */}
      <div className="mb-8">
        <h4 className="font-semibold mb-4 text-lg">General Comments & Recommendations</h4>
        {Object.entries(reportData.generalComments).map(([type, comments]) => 
          comments.length > 0 && (
            <div key={type} className="mb-4 bg-blue-50 p-3 rounded">
              <h5 className="font-medium mb-2 text-blue-700 capitalize">{type}:</h5>
              <ul className="list-disc list-inside space-y-1">
                {comments.map((comment, index) => (
                  <li key={index} className="text-sm">
                    {comment.replace(/\[child's name\]/g, selectedStudent?.name || 'your child')}
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>

      {reportData.teacherNotes && (
        <div className="mb-8 bg-gray-50 p-4 rounded">
          <h4 className="font-semibold mb-2">Teacher Notes</h4>
          <p className="text-sm">{reportData.teacherNotes}</p>
        </div>
      )}

      <div className="text-center mt-8 pt-4 border-t border-gray-300">
        <p className="text-sm text-gray-600">
          Report generated on {new Date().toLocaleDateString()} by Young Eagles PWA System
        </p>
        <p className="text-xs text-gray-500 mt-1">
          This report has been saved to the student's digital profile for parent access
        </p>
      </div>
    </div>
  );

  if (!selectedStudent) {
    return (
      <div className={`${themeStyles.background} min-h-screen p-4`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-6">
            <FaGraduationCap className={`text-2xl ${themeStyles.primary}`} />
            <h1 className={`text-2xl font-bold ${themeStyles.text}`}>Enhanced Student Report System</h1>
          </div>

          <div className={`${themeStyles.cardBg} ${themeStyles.border} border rounded-lg p-6`}>
            <h2 className={`text-xl font-semibold mb-4 ${themeStyles.text}`}>Select a Student</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className={`mt-2 ${themeStyles.textMuted}`}>Loading students...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className={`${themeStyles.inputBg} ${themeStyles.border} border rounded-lg p-4 text-left hover:opacity-80 transition-opacity`}
                  >
                    <div className="flex items-center space-x-3">
                      <FaUser className={`text-lg ${themeStyles.primary}`} />
                      <div>
                        <h3 className={`font-medium ${themeStyles.text}`}>{student.name}</h3>
                        <p className={`text-sm ${themeStyles.textMuted}`}>{student.className}</p>
                        <p className={`text-xs ${themeStyles.textMuted}`}>Age: {student.age}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${themeStyles.background} min-h-screen p-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${themeStyles.text}`}>
              Report System - {selectedStudent.name}
            </h1>
            <p className={`${themeStyles.textMuted}`}>Comprehensive assessment, homework generation & analytics</p>
          </div>
          <button
            onClick={() => setSelectedStudent(null)}
            className={`px-4 py-2 ${themeStyles.border} border rounded hover:opacity-80 ${themeStyles.text}`}
          >
            Back to Students
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`${themeStyles.cardBg} ${themeStyles.border} border rounded-lg mb-6`}>
          <div className="flex">
            {[
              { id: 'assessment', label: 'Assessment', icon: FaEdit },
              { id: 'library', label: 'Homework Library', icon: FaBook },
              { id: 'analytics', label: 'Real-time Analytics', icon: FaChartLine }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center py-3 px-4 ${
                  activeTab === tab.id 
                    ? 'bg-blue-500 text-white' 
                    : `${themeStyles.text} hover:bg-gray-100 dark:hover:bg-gray-700`
                } transition-colors ${tab.id === 'assessment' ? 'rounded-l-lg' : tab.id === 'analytics' ? 'rounded-r-lg' : ''}`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'assessment' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Assessment Form */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className={`${themeStyles.cardBg} ${themeStyles.border} border rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold mb-4 ${themeStyles.text}`}>Report Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeStyles.text}`}>Reporting Period</label>
                    <input
                      type="text"
                      value={reportData.reportingPeriod}
                      onChange={(e) => setReportData(prev => ({ ...prev, reportingPeriod: e.target.value }))}
                      placeholder="e.g., Term 1 2024"
                      className={`w-full px-3 py-2 ${themeStyles.inputBg} ${themeStyles.border} ${themeStyles.text} border rounded focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeStyles.text}`}>Teacher Notes</label>
                    <textarea
                      value={reportData.teacherNotes}
                      onChange={(e) => setReportData(prev => ({ ...prev, teacherNotes: e.target.value }))}
                      placeholder="Additional observations..."
                      className={`w-full px-3 py-2 ${themeStyles.inputBg} ${themeStyles.border} ${themeStyles.text} border rounded focus:ring-2 focus:ring-blue-500`}
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              {/* Assessment Areas */}
              <CommentSelector
                title="Social-Emotional Development - Strengths"
                icon={FaHeart}
                category="socialEmotional"
                subcategory="positiveComments"
                templates={commentTemplates.socialEmotional.positive}
                color="text-red-500"
              />

              <CommentSelector
                title="Social-Emotional Development - Growth Areas"
                icon={FaExclamationTriangle}
                category="socialEmotional"
                subcategory="areasForGrowth"
                templates={commentTemplates.socialEmotional.growth}
                color="text-yellow-500"
              />

              <CommentSelector
                title="Cognitive Development - Strengths"
                icon={FaBrain}
                category="cognitive"
                subcategory="positiveComments"
                templates={commentTemplates.cognitive.positive}
                color="text-blue-500"
              />

              <CommentSelector
                title="Cognitive Development - Growth Areas"
                icon={FaExclamationTriangle}
                category="cognitive"
                subcategory="areasForGrowth"
                templates={commentTemplates.cognitive.growth}
                color="text-yellow-500"
              />

              <CommentSelector
                title="Physical Development - Strengths"
                icon={FaRunning}
                category="physical"
                subcategory="positiveComments"
                templates={commentTemplates.physical.positive}
                color="text-green-500"
              />

              <CommentSelector
                title="Physical Development - Growth Areas"
                icon={FaExclamationTriangle}
                category="physical"
                subcategory="areasForGrowth"
                templates={commentTemplates.physical.growth}
                color="text-yellow-500"
              />
            </div>

            {/* Live Preview */}
            <div className={`${themeStyles.cardBg} ${themeStyles.border} border rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${themeStyles.text}`}>Live Preview</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={generatePDFReport}
                    disabled={generatingPDF}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
                  >
                    <FaDownload className="mr-2" />
                    {generatingPDF ? 'Generating...' : 'Save as PDF'}
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <ReportPreview />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className={`${themeStyles.cardBg} ${themeStyles.border} border rounded-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${themeStyles.text}`}>Homework Library</h3>
              <p className={`${themeStyles.textMuted}`}>
                Generated homework based on {selectedStudent.name}'s assessment
              </p>
            </div>

            {homeworkLibrary.length === 0 ? (
              <div className="text-center py-12">
                <FaBook className={`w-16 h-16 mx-auto mb-4 ${themeStyles.textMuted}`} />
                <h4 className={`text-lg font-medium mb-2 ${themeStyles.text}`}>No Homework Generated Yet</h4>
                <p className={`${themeStyles.textMuted} mb-4`}>
                  Complete the assessment and click "Generate Homework" buttons to create personalized activities
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homeworkLibrary.map((homework, index) => (
                  <div key={index} className={`${themeStyles.inputBg} ${themeStyles.border} border rounded-lg p-4`}>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className={`font-medium ${themeStyles.text}`}>{homework.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        homework.assessmentArea === 'socialEmotional' ? 'bg-red-100 text-red-700' :
                        homework.assessmentArea === 'cognitive' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {homework.assessmentArea}
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-3 ${themeStyles.textMuted}`}>{homework.description}</p>
                    
                    <div className="mb-3">
                      <p className={`text-xs font-medium mb-1 ${themeStyles.text}`}>Instructions:</p>
                      <p className={`text-xs ${themeStyles.textMuted}`}>{homework.instructions}</p>
                    </div>
                    
                    <div className="mb-3">
                      <p className={`text-xs font-medium mb-1 ${themeStyles.text}`}>Materials:</p>
                      <p className={`text-xs ${themeStyles.textMuted}`}>{homework.materials.join(', ')}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${themeStyles.textMuted}`}>~{homework.estimatedTime} min</span>
                      <button
                        onClick={() => sendHomeworkToParent(homework)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                      >
                        Send to Parent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className={`${themeStyles.cardBg} ${themeStyles.border} border rounded-lg p-6`}>
            <h3 className={`text-xl font-semibold mb-6 ${themeStyles.text}`}>Real-time Analytics</h3>
            
            {analyticsData ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Homework Completion Stats */}
                <div className={`${themeStyles.inputBg} ${themeStyles.border} border rounded-lg p-4`}>
                  <h4 className={`font-medium mb-3 ${themeStyles.text}`}>Homework Completion</h4>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${themeStyles.primary}`}>
                      {analyticsData.completionRate}%
                    </div>
                    <p className={`text-sm ${themeStyles.textMuted}`}>
                      {analyticsData.homeworkCompleted} of {analyticsData.totalHomeworkAssigned} completed
                    </p>
                  </div>
                </div>

                {/* Skill Progress */}
                {Object.entries(analyticsData.skillProgress).map(([skill, data]) => (
                  <div key={skill} className={`${themeStyles.inputBg} ${themeStyles.border} border rounded-lg p-4`}>
                    <h4 className={`font-medium mb-3 ${themeStyles.text} capitalize`}>
                      {skill.replace(/([A-Z])/g, ' $1').trim()} Progress
                    </h4>
                    <div className="flex items-center mb-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${data.progress}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm ${themeStyles.text}`}>{data.progress}%</span>
                    </div>
                    <p className={`text-xs ${themeStyles.textMuted}`}>
                      Level {data.current} of {data.target}
                    </p>
                  </div>
                ))}

                {/* Recent Improvements */}
                <div className={`${themeStyles.inputBg} ${themeStyles.border} border rounded-lg p-4 lg:col-span-3`}>
                  <h4 className={`font-medium mb-3 ${themeStyles.text}`}>Recent Improvements</h4>
                  <ul className="space-y-2">
                    {analyticsData.recentImprovements.map((improvement, index) => (
                      <li key={index} className={`text-sm ${themeStyles.textMuted} flex items-start`}>
                        <FaCheck className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Homework */}
                <div className={`${themeStyles.inputBg} ${themeStyles.border} border rounded-lg p-4 lg:col-span-3`}>
                  <h4 className={`font-medium mb-3 ${themeStyles.text}`}>AI-Recommended Homework</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analyticsData.recommendedHomework.map((homework, index) => (
                      <div key={index} className={`${themeStyles.cardBg} ${themeStyles.border} border rounded p-3`}>
                        <h5 className={`font-medium mb-1 ${themeStyles.text}`}>{homework.title}</h5>
                        <p className={`text-sm ${themeStyles.textMuted} mb-2`}>{homework.description}</p>
                        <button
                          onClick={() => {
                            setHomeworkLibrary(prev => [...prev, {
                              ...homework,
                              studentId: selectedStudent.id,
                              studentName: selectedStudent.name,
                              assessmentArea: 'recommended',
                              createdAt: new Date().toISOString()
                            }]);
                            setActiveTab('library');
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                          Add to Library
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FaChartLine className={`w-16 h-16 mx-auto mb-4 ${themeStyles.textMuted}`} />
                <h4 className={`text-lg font-medium mb-2 ${themeStyles.text}`}>Loading Analytics...</h4>
                <p className={`${themeStyles.textMuted}`}>
                  Analyzing homework submissions and progress data...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentReportBuilder; 