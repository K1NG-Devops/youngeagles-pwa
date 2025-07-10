import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import nativeNotificationService from '../services/nativeNotificationService.js';
import { 
  generateWorksheetPDF, 
  generateProgressReportPDF, 
  generateCustomPDF 
} from '../utils/pdfGenerator';
import { 
  FaFilePdf, 
  FaDownload, 
  FaChartBar, 
  FaClipboardList,
  FaCog
} from 'react-icons/fa';

const PDFGenerator = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('worksheet');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample worksheet data
  const sampleWorksheetData = {
    title: 'Sample Worksheet',
    subtitle: 'CAPS-Aligned Foundation Phase Activity',
    metadata: {
      age: '4-5 years',
      duration: '20 minutes'
    },
    instructions: [
      'Read each instruction carefully',
      'Complete all activities in order',
      'Use pencils or crayons as needed',
      'Ask for help if you need it'
    ],
    activities: [
      'Practice writing letters A, B, C',
      'Count objects from 1 to 10',
      'Identify basic shapes and colors',
      'Complete the pattern matching exercise'
    ],
    materials: [
      'Pencils or crayons',
      'Ruler for straight lines',
      'Eraser for corrections'
    ],
    assessment: [
      'Completes tasks independently',
      'Shows good fine motor control',
      'Follows instructions accurately',
      'Demonstrates understanding of concepts'
    ],
    notes: 'This is a sample worksheet to demonstrate PDF generation capabilities. Encourage students and provide positive feedback.'
  };

  // Sample student progress data
  const sampleStudentData = {
    name: 'Emma Johnson',
    class: 'Grade R',
    age: '5 years',
    reportPeriod: 'Term 1, 2024',
    subjects: [
      { name: 'Literacy', score: 85, grade: 'B+', progress: 'Excellent' },
      { name: 'Mathematics', score: 78, grade: 'B', progress: 'Good' },
      { name: 'Science', score: 92, grade: 'A-', progress: 'Outstanding' },
      { name: 'Creative Arts', score: 88, grade: 'B+', progress: 'Excellent' }
    ],
    achievements: [
      'Excellent letter recognition and phonics skills',
      'Shows strong problem-solving abilities in math',
      'Demonstrates curiosity in science activities',
      'Creates beautiful artwork with attention to detail'
    ],
    improvements: [
      'Continue practicing number formation',
      'Work on following multi-step instructions',
      'Develop confidence in group discussions'
    ],
    comments: 'Emma is a delightful student who approaches learning with enthusiasm. She shows particular strength in literacy and science activities. With continued support and practice, she will excel in all areas.'
  };

  // Sample custom content
  const sampleCustomContent = {
    title: 'Young Eagles Learning Report',
    subtitle: 'Educational Progress Summary',
    sections: [
      {
        heading: 'Overview',
        icon: '📊',
        text: 'This report demonstrates the comprehensive PDF generation capabilities of the Young Eagles Learning Platform. Our system can create various types of educational documents with professional formatting.'
      },
      {
        heading: 'Features',
        icon: '🌟',
        list: [
          'Professional header and footer with branding',
          'Structured content with proper typography',
          'Tables for data presentation',
          'Checklists for assessments',
          'Automatic page breaks and pagination'
        ],
        listType: 'bullet'
      },
      {
        heading: 'Assessment Criteria',
        icon: '✅',
        list: [
          'Content is age-appropriate and engaging',
          'Layout is clear and easy to follow',
          'Instructions are simple and understandable',
          'Assessment methods are fair and comprehensive'
        ],
        listType: 'checklist'
      },
      {
        heading: 'Technical Specifications',
        icon: '⚙️',
        table: {
          headers: ['Feature', 'Capability', 'Status'],
          rows: [
            ['PDF Generation', 'jsPDF Library', 'Active'],
            ['Image Support', 'html2canvas', 'Active'],
            ['Font Support', 'Multiple Fonts', 'Active'],
            ['Page Layout', 'A4 Portrait/Landscape', 'Active']
          ]
        }
      }
    ]
  };

  const handleGenerateWorksheet = async () => {
    setIsGenerating(true);
    try {
      const success = generateWorksheetPDF(sampleWorksheetData, 'sample_worksheet.pdf');
      if (success) {
        nativeNotificationService.success('📄 Sample worksheet PDF generated successfully!');
      } else {
        nativeNotificationService.error('Failed to generate worksheet PDF');
      }
    } catch (error) {
      console.error('Error generating worksheet:', error);
      nativeNotificationService.error('Error generating worksheet PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateProgressReport = async () => {
    setIsGenerating(true);
    try {
      const success = generateProgressReportPDF(sampleStudentData, 'sample_progress_report.pdf');
      if (success) {
        nativeNotificationService.success('📊 Sample progress report PDF generated successfully!');
      } else {
        nativeNotificationService.error('Failed to generate progress report PDF');
      }
    } catch (error) {
      console.error('Error generating progress report:', error);
      nativeNotificationService.error('Error generating progress report PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCustom = async () => {
    setIsGenerating(true);
    try {
      const success = generateCustomPDF(sampleCustomContent, 'sample_custom_document.pdf');
      if (success) {
        nativeNotificationService.success('📄 Custom document PDF generated successfully!');
      } else {
        nativeNotificationService.error('Failed to generate custom PDF');
      }
    } catch (error) {
      console.error('Error generating custom document:', error);
      nativeNotificationService.error('Error generating custom PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs = [
    { id: 'worksheet', label: 'Worksheets', icon: FaClipboardList },
    { id: 'progress', label: 'Progress Reports', icon: FaChartBar },
    { id: 'custom', label: 'Custom Documents', icon: FaCog }
  ];

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaFilePdf className="text-4xl text-red-500 mr-3" />
            <h1 className="text-3xl font-bold">PDF Generator</h1>
          </div>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Generate professional PDFs for worksheets, reports, and custom documents
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className={`flex rounded-lg p-1 ${isDark ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-md transition-all ${
                    activeTab === tab.id
                      ? isDark 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-500 text-white'
                      : isDark
                        ? 'text-gray-300 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
          {activeTab === 'worksheet' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <FaClipboardList className="mr-3 text-blue-500" />
                Worksheet Generator
              </h2>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Generate CAPS-aligned educational worksheets with structured activities, 
                assessments, and professional formatting.
              </p>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Sample Worksheet Preview:</h3>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-bold text-blue-600">{sampleWorksheetData.title}</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {sampleWorksheetData.subtitle}
                  </p>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Age: {sampleWorksheetData.metadata.age} | Duration: {sampleWorksheetData.metadata.duration}
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateWorksheet}
                disabled={isGenerating}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
                  isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <FaDownload className="mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Sample Worksheet'}
              </button>
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <FaChartBar className="mr-3 text-green-500" />
                Progress Report Generator
              </h2>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Create comprehensive student progress reports with academic performance, 
                achievements, and teacher comments.
              </p>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Sample Progress Report Preview:</h3>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-bold text-green-600">Student Progress Report</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {sampleStudentData.name} - {sampleStudentData.class}
                  </p>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Report Period: {sampleStudentData.reportPeriod}
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateProgressReport}
                disabled={isGenerating}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
                  isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <FaDownload className="mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Sample Progress Report'}
              </button>
            </div>
          )}

          {activeTab === 'custom' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <FaCog className="mr-3 text-purple-500" />
                Custom Document Generator
              </h2>
              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Generate custom PDF documents with flexible content including text, 
                lists, tables, and structured sections.
              </p>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Sample Custom Document Preview:</h3>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-bold text-purple-600">{sampleCustomContent.title}</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {sampleCustomContent.subtitle}
                  </p>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Sections: {sampleCustomContent.sections.length}
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateCustom}
                disabled={isGenerating}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
                  isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                <FaDownload className="mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Sample Custom Document'}
              </button>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className={`mt-8 rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
          <h3 className="text-xl font-bold mb-4">PDF Generation Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '📄', title: 'Professional Layout', desc: 'Clean, professional PDF layouts with proper typography' },
              { icon: '🎨', title: 'Custom Branding', desc: 'Young Eagles branding with consistent design elements' },
              { icon: '📊', title: 'Data Tables', desc: 'Structured tables for presenting data and information' },
              { icon: '✅', title: 'Checklists', desc: 'Interactive checklists for assessments and activities' },
              { icon: '📝', title: 'Rich Content', desc: 'Support for headings, paragraphs, lists, and more' },
              { icon: '🔄', title: 'Auto Pagination', desc: 'Automatic page breaks and page numbering' }
            ].map((feature, index) => (
              <div key={index} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h4 className="font-semibold mb-1">{feature.title}</h4>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;
