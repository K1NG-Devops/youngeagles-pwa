import React, { useState } from 'react';
import { FaFileAlt, FaDownload, FaCalendarAlt, FaChartBar, FaUsers, FaTasks, FaSpinner } from 'react-icons/fa';
import { showTopNotification } from '../../utils/notifications';

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

  const classes = ['Panda', 'Curious Cubs', 'Little Explorers'];

  const generateReport = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Implement real API calls for report generation
      console.log(`Generating ${reportType} report for ${dateRange} period and class: ${selectedClass}`);
      
      showTopNotification('Report generation requires API implementation', 'info');
      setReportData({
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        summary: { status: 'API implementation required' },
        details: []
      });
    } catch (error) {
      console.error('Error generating report:', error);
      showTopNotification('Failed to generate report', 'error');
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
    
    showTopNotification('Report downloaded!', 'success');
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