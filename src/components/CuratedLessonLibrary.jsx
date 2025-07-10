import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import nativeNotificationService from '../services/nativeNotificationService.js';
import contentCurationService from '../services/contentCurationService';
import { 
  FaBook, 
  FaDownload, 
  FaEye, 
  FaPlay,
  FaCheckCircle,
  FaSpinner,
  FaFilter,
  FaStar,
  FaClock,
  FaGraduationCap,
  FaTasks,
  FaPlus,
  FaPaperPlane,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
  FaPrint
} from 'react-icons/fa';
import { generateWorksheetPDF } from '../utils/pdfGenerator';

const CuratedLessonLibrary = ({ onAssignHomework, classes = [] }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  // State management
  const [curatedContent, setCuratedContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [downloadingItems, setDownloadingItems] = useState(new Set());
  const [assignmentDetails, setAssignmentDetails] = useState({
    dueDate: '',
    instructions: '',
    selectedClasses: []
  });

  // Load curated content on component mount
  useEffect(() => {
    loadCuratedContent();
  }, []);

  // Filter content when filters change
  useEffect(() => {
    filterContent();
  }, [filterContent]);

  const loadCuratedContent = async () => {
    try {
      setIsLoading(true);
      const content = await contentCurationService.populateLibrary();
      setCuratedContent(content);
      nativeNotificationService.success(`✅ Loaded ${content.length} high-quality educational activities!`);
    } catch (error) {
      console.error('Error loading curated content:', error);
      nativeNotificationService.error('Failed to load educational content');
    } finally {
      setIsLoading(false);
    }
  };

  const filterContent = useCallback(() => {
    let filtered = [...curatedContent];

    // Filter by subject
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(item => item.subject === selectedSubject);
    }

    // Filter by age group
    if (selectedAgeGroup !== 'all') {
      filtered = filtered.filter(item => item.ageGroup === selectedAgeGroup);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.activities.some(activity => 
          activity.toLowerCase().includes(term)
        )
      );
    }

    setFilteredContent(filtered);
  }, [curatedContent, selectedSubject, selectedAgeGroup, searchTerm]);

  const handlePreview = (content) => {
    setPreviewContent(content);
    setShowPreview(true);
  };

  const handleAssign = (content) => {
    setSelectedContent(content);
    setShowAssignModal(true);
  };

  const downloadWorksheet = async (content, worksheet) => {
    const itemKey = `${content.id}-${worksheet.title}`;
    
    if (downloadingItems.has(itemKey)) {
      nativeNotificationService.info('Already downloading this worksheet');
      return;
    }

    setDownloadingItems(prev => new Set(prev).add(itemKey));

    try {
      // Generate PDF content from curated content
      const pdfData = {
        title: worksheet.title,
        subtitle: `${content.title} - Age ${content.ageGroup}`,
        metadata: {
          age: content.ageGroup,
          duration: `${content.duration} minutes`,
          subject: content.subject
        },
        instructions: worksheet.content?.instructions || worksheet.description,
        activities: content.activities,
        materials: content.materials,
        assessment: worksheet.content?.assessment || content.assessment,
        learningObjectives: content.learningObjectives,
        capsAlignment: content.capsAlignment,
        notes: `This worksheet is part of the "${content.title}" activity series. Encourage children to explore and learn at their own pace.`
      };

      const success = await generateWorksheetPDF(pdfData, worksheet.title.replace(/\s+/g, '_') + '.pdf');
      
      if (success) {
        nativeNotificationService.success(
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-green-500" />
            <span>📄 {worksheet.title} downloaded successfully!</span>
          </div>
        );
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('Error downloading worksheet:', error);
      nativeNotificationService.error(`Failed to download ${worksheet.title}`);
    } finally {
      setDownloadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const downloadAllWorksheets = async (content) => {
    nativeNotificationService.info(`Starting download of ${content.worksheets.length} worksheets for "${content.title}"`);
    
    for (const worksheet of content.worksheets) {
      await downloadWorksheet(content, worksheet);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    nativeNotificationService.success(`✅ All worksheets for "${content.title}" downloaded!`);
  };

  const submitAssignment = async () => {
    if (!selectedContent || assignmentDetails.selectedClasses.length === 0) {
      nativeNotificationService.error('Please select at least one class');
      return;
    }

    if (!assignmentDetails.dueDate) {
      nativeNotificationService.error('Please set a due date');
      return;
    }

    try {
      const homeworkData = {
        title: selectedContent.title,
        description: `${selectedContent.description}\n\n${assignmentDetails.instructions}`,
        type: 'curated_lesson',
        content_id: selectedContent.id,
        due_date: assignmentDetails.dueDate,
        materials: selectedContent.materials,
        objectives: selectedContent.learningObjectives,
        duration: selectedContent.duration,
        age_group: selectedContent.ageGroup,
        subject: selectedContent.subject,
        classes: assignmentDetails.selectedClasses,
        worksheets: selectedContent.worksheets
      };

      if (onAssignHomework) {
        await onAssignHomework(homeworkData);
      }

      nativeNotificationService.success(`✅ "${selectedContent.title}" assigned successfully!`);
      setShowAssignModal(false);
      setAssignmentDetails({ dueDate: '', instructions: '', selectedClasses: [] });
    } catch (error) {
      console.error('Error assigning content:', error);
      nativeNotificationService.error('Failed to assign content');
    }
  };

  // Get unique subjects and age groups for filters
  const subjects = ['all', ...new Set(curatedContent.map(item => item.subject))];
  const ageGroups = ['all', ...new Set(curatedContent.map(item => item.ageGroup))];

  const getSubjectIcon = (subject) => {
    const icons = {
      literacy: '📚',
      mathematics: '🔢', 
      science: '🔬',
      creative: '🎨'
    };
    return icons[subject] || '📖';
  };

  const getSubjectColor = (subject) => {
    const colors = {
      literacy: isDark ? 'bg-blue-900/20 border-blue-600' : 'bg-blue-100 border-blue-300',
      mathematics: isDark ? 'bg-green-900/20 border-green-600' : 'bg-green-100 border-green-300',
      science: isDark ? 'bg-purple-900/20 border-purple-600' : 'bg-purple-100 border-purple-300',
      creative: isDark ? 'bg-orange-900/20 border-orange-600' : 'bg-orange-100 border-orange-300'
    };
    return colors[subject] || (isDark ? 'bg-gray-900/20 border-gray-600' : 'bg-gray-100 border-gray-300');
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading curated educational content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pb-6`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-6xl mx-auto">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🌟 Curated Educational Library
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            High-quality, CAPS-aligned activities from trusted educational sources
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                {curatedContent.length}
              </div>
              <div className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Activities</div>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                {curatedContent.reduce((total, item) => total + item.worksheets.length, 0)}
              </div>
              <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Worksheets</div>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                {subjects.length - 1}
              </div>
              <div className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Subjects</div>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>
                100%
              </div>
              <div className={`text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>CAPS Aligned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-6 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search activities..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Subject Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Age Group Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Age Group
              </label>
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {ageGroups.map(age => (
                  <option key={age} value={age}>
                    {age === 'all' ? 'All Ages' : `${age} years`}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Results
              </label>
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {filteredContent.length} activities found
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-6xl mx-auto p-6">
        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <FaBook className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No activities found
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((content) => (
              <div
                key={content.id}
                className={`rounded-xl border-2 p-6 transition-all hover:shadow-lg ${getSubjectColor(content.subject)}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">{getSubjectIcon(content.subject)}</span>
                    <div>
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {content.title}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Age {content.ageGroup} • {content.duration} min
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {content.description}
                </p>

                {/* Learning Objectives */}
                <div className="mb-4">
                  <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    Learning Goals:
                  </h4>
                  <ul className="text-xs space-y-1">
                    {content.learningObjectives.slice(0, 3).map((objective, index) => (
                      <li key={index} className={`flex items-start ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="text-green-500 mr-2">✓</span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Worksheets */}
                <div className="mb-4">
                  <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    Worksheets ({content.worksheets.length}):
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {content.worksheets.map((worksheet, index) => {
                      const itemKey = `${content.id}-${worksheet.title}`;
                      const isDownloading = downloadingItems.has(itemKey);
                      
                      return (
                        <button
                          key={index}
                          onClick={() => downloadWorksheet(content, worksheet)}
                          disabled={isDownloading}
                          className={`text-xs px-2 py-1 rounded-full transition-colors ${
                            isDownloading
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : isDark
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {isDownloading ? (
                            <FaSpinner className="animate-spin inline w-3 h-3" />
                          ) : (
                            <FaDownload className="inline w-3 h-3 mr-1" />
                          )}
                          {worksheet.title.length > 15 
                            ? worksheet.title.substring(0, 12) + '...' 
                            : worksheet.title
                          }
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => handlePreview(content)}
                    className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaEye className="w-4 h-4 mr-2" />
                    Preview
                  </button>
                  
                  <button
                    onClick={() => downloadAllWorksheets(content)}
                    className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      isDark 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    <FaDownload className="w-4 h-4 mr-2" />
                    All PDFs
                  </button>
                  
                  {user?.role === 'teacher' && (
                    <button
                      onClick={() => handleAssign(content)}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        isDark 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    >
                      <FaPaperPlane className="w-4 h-4 mr-2" />
                      Assign
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-4xl w-full max-h-full overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {previewContent.title}
                </h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <FaTimes className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              
              {/* Preview content details */}
              <div className="space-y-6">
                <div>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Description</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{previewContent.description}</p>
                </div>
                
                <div>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Activities</h3>
                  <ul className="space-y-1">
                    {previewContent.activities.map((activity, index) => (
                      <li key={index} className={`flex items-start ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-blue-500 mr-2">•</span>
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Materials Needed</h3>
                  <ul className="space-y-1">
                    {previewContent.materials.map((material, index) => (
                      <li key={index} className={`flex items-start ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-green-500 mr-2">✓</span>
                        {material}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Learning Objectives</h3>
                  <ul className="space-y-1">
                    {previewContent.learningObjectives.map((objective, index) => (
                      <li key={index} className={`flex items-start ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-purple-500 mr-2">⭐</span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>CAPS Alignment</h3>
                  <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                    {previewContent.capsAlignment}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Assign: {selectedContent.title}
                </h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <FaTimes className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Due Date */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={assignmentDetails.dueDate}
                    onChange={(e) => setAssignmentDetails(prev => ({ ...prev, dueDate: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Additional Instructions
                  </label>
                  <textarea
                    value={assignmentDetails.instructions}
                    onChange={(e) => setAssignmentDetails(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Add any specific instructions for this assignment..."
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Classes */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Classes
                  </label>
                  <div className="space-y-2">
                    {classes.map(cls => (
                      <label key={cls.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={assignmentDetails.selectedClasses.includes(cls.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignmentDetails(prev => ({
                                ...prev,
                                selectedClasses: [...prev.selectedClasses, cls.id]
                              }));
                            } else {
                              setAssignmentDetails(prev => ({
                                ...prev,
                                selectedClasses: prev.selectedClasses.filter(id => id !== cls.id)
                              }));
                            }
                          }}
                          className="mr-3 rounded"
                        />
                        <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {cls.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitAssignment}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Assign Activity
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuratedLessonLibrary;
