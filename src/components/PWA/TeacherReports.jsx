import React, { useState } from 'react';
import { FaFileAlt, FaDownload, FaCalendarAlt, FaChartBar, FaUsers, FaTasks, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const TeacherReports = () => {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState('this_week');
  const [selectedClass, setSelectedClass] = useState('all');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const reportTypes = [
    { id: 'attendance', label: 'Attendance Report', icon: FaUsers },
    { id: 'homework', label: 'Homework Completion', icon: FaTasks },
    { id: 'progress', label: 'Student Progress', icon: FaChartBar },
    { id: 'class_summary', label: 'Class Summary', icon: FaFileAlt }
  ];

  const dateRanges = [
    { id: 'this_week', label: 'This Week' },
    { id: 'last_week', label: 'Last Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' }
  ];

  const classes = ['Panda Class', 'Curious Cubs', 'Little Explorers'];

  const generateReport = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData = {
        attendance: {
          title: 'Attendance Report',
          summary: { totalStudents: 15, averageAttendance: 92, perfectAttendance: 8, belowThreshold: 2 },
          details: [
            { student: 'Emma Johnson', attendance: 95, daysPresent: 19, totalDays: 20 },
            { student: 'Liam Johnson', attendance: 90, daysPresent: 18, totalDays: 20 },
            { student: 'Sophia Davis', attendance: 100, daysPresent: 20, totalDays: 20 }
          ]
        },
        homework: {
          title: 'Homework Completion Report',
          summary: { totalAssignments: 12, averageCompletion: 85, onTimeSubmissions: 78, lateSubmissions: 15 },
          details: [
            { student: 'Emma Johnson', completion: 88, onTime: 10, late: 1, missing: 1 },
            { student: 'Liam Johnson', completion: 75, onTime: 9, late: 2, missing: 1 },
            { student: 'Sophia Davis', completion: 95, onTime: 11, late: 1, missing: 0 }
          ]
        },
        progress: {
          title: 'Student Progress Report',
          summary: { improvingStudents: 12, consistentPerformers: 8, needsAttention: 3, overallGrade: 'B+' },
          details: [
            { student: 'Emma Johnson', grade: 'A-', improvement: '+5%', areas: 'Math, Reading' },
            { student: 'Liam Johnson', grade: 'B', improvement: '+2%', areas: 'Art, Social' },
            { student: 'Sophia Davis', grade: 'A+', improvement: '+1%', areas: 'All Areas' }
          ]
        },
        class_summary: {
          title: 'Class Summary Report',
          summary: { totalStudents: 15, activeParents: 14, completedActivities: 45, upcomingEvents: 3 },
          details: [
            { metric: 'Average Age', value: '4.5 years' },
            { metric: 'Class Capacity', value: '18 students' },
            { metric: 'Parent Engagement', value: '93%' },
            { metric: 'Activity Participation', value: '87%' }
          ]
        }
      };

      setReportData(mockData[reportType]);
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;
    
    let csvContent = `${reportData.title}\n\n`;
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n`;
    csvContent += `Date Range: ${dateRanges.find(d => d.id === dateRange)?.label}\n`;
    csvContent += `Class: ${selectedClass === 'all' ? 'All Classes' : selectedClass}\n\n`;
    
    csvContent += 'SUMMARY\n';
    Object.entries(reportData.summary).forEach(([key, value]) => {
      csvContent += `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}\n`;
    });
    
    csvContent += '\nDETAILS\n';
    if (reportData.details && reportData.details.length > 0) {
      const headers = Object.keys(reportData.details[0]);
      csvContent += headers.join(',') + '\n';
      reportData.details.forEach(row => {
        csvContent += headers.map(header => row[header]).join(',') + '\n';
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Report downloaded!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Generate Reports</h1>
          <p className="text-gray-600">Create detailed reports for your classes and students</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <div className="space-y-2">
                {reportTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <label key={type.id} className="flex items-center">
                      <input
                        type="radio"
                        name="reportType"
                        value={type.id}
                        checked={reportType === type.id}
                        onChange={(e) => setReportType(e.target.value)}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <IconComponent className="mr-2 text-gray-400" />
                      <span className="text-sm">{type.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {dateRanges.map((range) => (
                  <option key={range.id} value={range.id}>{range.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Classes</option>
                {classes.map((className) => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              onClick={generateReport}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FaChartBar className="mr-2" />
                  Generate Report
                </>
              )}
            </button>

            {reportData && (
              <button
                onClick={downloadReport}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload className="mr-2" />
                Download CSV
              </button>
            )}
          </div>
        </div>

        {reportData && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{reportData.title}</h2>
              <div className="flex items-center text-sm text-gray-500">
                <FaCalendarAlt className="mr-2" />
                Generated: {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(reportData.summary).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{value}</div>
                  <div className="text-sm text-gray-600">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                </div>
              ))}
            </div>

            {reportData.details && reportData.details.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(reportData.details[0]).map((header) => (
                          <th key={header} className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                            {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.details.map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherReports; 