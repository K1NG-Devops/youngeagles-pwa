import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaFileAlt, FaDownload, FaEye, FaCalendar, FaGraduationCap, FaUser, FaSpinner } from 'react-icons/fa';
import parentService from '../../services/parentService';

const ChildReportsViewer = () => {
  const { isDark } = useTheme();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState({ children: false, reports: false });
  const [viewingReport, setViewingReport] = useState(false);

  // Theme styles
  const themeStyles = {
    background: isDark ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: isDark ? 'bg-gray-800' : 'bg-white',
    text: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    inputBg: isDark ? 'bg-gray-700' : 'bg-white',
    primary: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500'
  };

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadReports();
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    setIsLoading(prev => ({ ...prev, children: true }));
    try {
      const response = await parentService.getChildren();
      if (response.success) {
        setChildren(response.children || []);
        if (response.children?.length === 1) {
          setSelectedChild(response.children[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Failed to load children:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, children: false }));
    }
  };

  const loadReports = async () => {
    if (!selectedChild) return;
    
    setIsLoading(prev => ({ ...prev, reports: true }));
    try {
      // Mock API call - in production this would fetch real reports
      const mockReports = [
        {
          id: 1,
          reportingPeriod: 'Term 1 2024',
          createdAt: '2024-03-15',
          teacherName: 'Ms. Johnson',
          status: 'completed',
          summary: 'Excellent progress in social-emotional development. Shows strong counting skills and improved fine motor coordination.'
        },
        {
          id: 2,
          reportingPeriod: 'Term 2 2024',
          createdAt: '2024-06-20',
          teacherName: 'Ms. Johnson',
          status: 'completed',
          summary: 'Continued growth in cognitive abilities. Demonstrates empathy and cooperation during group activities.'
        }
      ];
      
      setReports(mockReports);
    } catch (error) {
      console.error('Failed to load reports:', error);
      setReports([]);
    } finally {
      setIsLoading(prev => ({ ...prev, reports: false }));
    }
  };

  const viewReport = (report) => {
    setSelectedReport(report);
    setViewingReport(true);
  };

  const downloadReport = (report) => {
    // Mock download - in production this would download the actual PDF
    alert(`Downloading report: ${report.reportingPeriod}`);
    console.log('Downloading report:', report);
  };

  const ReportViewer = () => (
    <div className={`${themeStyles.cardBg} ${themeStyles.border} border rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${themeStyles.text}`}>
          Report: {selectedReport.reportingPeriod}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => downloadReport(selectedReport)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          >
            <FaDownload className="mr-2" />
            Download PDF
          </button>
          <button
            onClick={() => setViewingReport(false)}
            className={`px-4 py-2 ${themeStyles.border} border rounded hover:opacity-80 ${themeStyles.text}`}
          >
            Back to Reports
          </button>
        </div>
      </div>

      {/* Mock Report Content */}
      <div className="bg-white text-black p-8 rounded border" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="text-center mb-8 border-b-2 border-blue-600 pb-4">
          <h2 className="text-3xl font-bold text-blue-600">Young Eagles Preschool</h2>
          <h3 className="text-xl font-semibold mt-2">Student Progress Report</h3>
          <p className="text-sm text-gray-600 mt-2">Reporting Period: {selectedReport.reportingPeriod}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-blue-700">Student Information</h4>
            <p><strong>Name:</strong> {children.find(c => c.id.toString() === selectedChild)?.name}</p>
            <p><strong>Class:</strong> {children.find(c => c.id.toString() === selectedChild)?.className}</p>
            <p><strong>Teacher:</strong> {selectedReport.teacherName}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-green-700">Report Summary</h4>
            <p className="text-sm">{selectedReport.summary}</p>
          </div>
        </div>

        {/* Development Areas */}
        <div className="mb-8 border-l-4 border-red-300 pl-4">
          <h4 className="font-semibold mb-4 flex items-center text-lg">
            <span className="mr-2 text-2xl">❤️</span>
            Social-Emotional Development
          </h4>
          <div className="mb-4 bg-green-50 p-3 rounded">
            <h5 className="font-medium mb-2 text-green-700">Strengths:</h5>
            <ul className="list-disc list-inside space-y-1">
              <li className="text-sm">Demonstrates empathy and understanding towards peers</li>
              <li className="text-sm">Cooperates well with others during group activities</li>
              <li className="text-sm">Shows enthusiasm for classroom activities</li>
            </ul>
          </div>
          <div className="mb-4 bg-yellow-50 p-3 rounded">
            <h5 className="font-medium mb-2 text-yellow-700">Areas for Growth:</h5>
            <ul className="list-disc list-inside space-y-1">
              <li className="text-sm">Could benefit from practicing patience in group settings</li>
            </ul>
          </div>
        </div>

        <div className="mb-8 border-l-4 border-blue-300 pl-4">
          <h4 className="font-semibold mb-4 flex items-center text-lg">
            <span className="mr-2 text-2xl">🧠</span>
            Cognitive Development
          </h4>
          <div className="mb-4 bg-green-50 p-3 rounded">
            <h5 className="font-medium mb-2 text-green-700">Strengths:</h5>
            <ul className="list-disc list-inside space-y-1">
              <li className="text-sm">Excels in counting and number recognition</li>
              <li className="text-sm">Demonstrates strong problem-solving skills</li>
              <li className="text-sm">Shows curiosity and asks thoughtful questions</li>
            </ul>
          </div>
        </div>

        <div className="mb-8 border-l-4 border-green-300 pl-4">
          <h4 className="font-semibold mb-4 flex items-center text-lg">
            <span className="mr-2 text-2xl">🏃</span>
            Physical Development
          </h4>
          <div className="mb-4 bg-green-50 p-3 rounded">
            <h5 className="font-medium mb-2 text-green-700">Strengths:</h5>
            <ul className="list-disc list-inside space-y-1">
              <li className="text-sm">Demonstrates proper pencil grip and control</li>
              <li className="text-sm">Participates actively in physical activities</li>
            </ul>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-semibold mb-4 text-lg">General Comments & Recommendations</h4>
          <div className="mb-4 bg-blue-50 p-3 rounded">
            <h5 className="font-medium mb-2 text-blue-700">Teacher Comments:</h5>
            <p className="text-sm">It's been a delight seeing your child really love learning so much. Continue to encourage their love for learning at home through reading together daily.</p>
          </div>
        </div>

        <div className="text-center mt-8 pt-4 border-t border-gray-300">
          <p className="text-sm text-gray-600">
            Report generated on {new Date(selectedReport.createdAt).toLocaleDateString()} by Young Eagles PWA System
          </p>
        </div>
      </div>
    </div>
  );

  if (viewingReport && selectedReport) {
    return (
      <div className={`${themeStyles.background} min-h-screen p-4`}>
        <div className="max-w-4xl mx-auto">
          <ReportViewer />
        </div>
      </div>
    );
  }

  return (
    <div className={`${themeStyles.background} min-h-screen p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <FaGraduationCap className={`text-2xl ${themeStyles.primary}`} />
          <h1 className={`text-2xl font-bold ${themeStyles.text}`}>Student Progress Reports</h1>
        </div>

        {/* Child Selection */}
        <div className={`${themeStyles.cardBg} ${themeStyles.border} border rounded-lg p-6 mb-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${themeStyles.text}`}>Select Child</h2>
          
          {isLoading.children ? (
            <div className="flex items-center space-x-2">
              <FaSpinner className="animate-spin" />
              <span className={themeStyles.textMuted}>Loading children...</span>
            </div>
          ) : children.length > 0 ? (
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className={`w-full px-4 py-2 ${themeStyles.inputBg} ${themeStyles.border} ${themeStyles.text} border rounded focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select a child</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name} - {child.className}
                </option>
              ))}
            </select>
          ) : (
            <p className={themeStyles.textMuted}>No children found</p>
          )}
        </div>

        {/* Reports List */}
        {selectedChild && (
          <div className={`${themeStyles.cardBg} ${themeStyles.border} border rounded-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${themeStyles.text}`}>Available Reports</h2>
            
            {isLoading.reports ? (
              <div className="flex items-center space-x-2 py-8">
                <FaSpinner className="animate-spin" />
                <span className={themeStyles.textMuted}>Loading reports...</span>
              </div>
            ) : reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className={`${themeStyles.inputBg} ${themeStyles.border} border rounded-lg p-4 flex items-center justify-between`}
                  >
                    <div className="flex items-center space-x-4">
                      <FaFileAlt className={`text-lg ${themeStyles.primary}`} />
                      <div>
                        <h3 className={`font-medium ${themeStyles.text}`}>{report.reportingPeriod}</h3>
                        <p className={`text-sm ${themeStyles.textMuted}`}>
                          Created: {new Date(report.createdAt).toLocaleDateString()} by {report.teacherName}
                        </p>
                        <p className={`text-sm ${themeStyles.textMuted} mt-1`}>
                          {report.summary.length > 100 ? report.summary.substring(0, 100) + '...' : report.summary}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewReport(report)}
                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                      >
                        <FaEye className="mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => downloadReport(report)}
                        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                      >
                        <FaDownload className="mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaFileAlt className={`w-16 h-16 mx-auto mb-4 ${themeStyles.textMuted}`} />
                <h3 className={`text-lg font-medium mb-2 ${themeStyles.text}`}>No Reports Available</h3>
                <p className={`${themeStyles.textMuted}`}>
                  No progress reports have been generated for this child yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildReportsViewer; 