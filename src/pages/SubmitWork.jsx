import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaUpload, 
  FaFile, 
  FaPaperPlane, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaCloudUploadAlt, 
  FaFileImage, 
  FaFilePdf, 
  FaFileWord, 
  FaTimes, 
  FaArrowLeft,
  FaDownload,
  FaGraduationCap,
  FaCalendarAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import apiService from '../services/apiService';

const SubmitWork = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  
  // Get parameters from URL
  const urlHomeworkId = searchParams.get('homework_id');
  const urlChildId = searchParams.get('child_id');
  
  // State management
  const [homework, setHomework] = useState(null);
  const [selectedChild, setSelectedChild] = useState(urlChildId || '');
  const [children, setChildren] = useState([]);
  const [files, setFiles] = useState([]);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch children for selection
  useEffect(() => {
    const fetchChildren = async () => {
      if (!user?.id) return;
      
      try {
        if (user.role === 'parent') {
          const response = await apiService.children.getByParent(user.id);
          const childrenData = response.data.children || [];
          setChildren(childrenData);
          
          // Auto-select first child if none selected
          if (!selectedChild && childrenData.length > 0) {
            setSelectedChild(childrenData[0].id.toString());
          }
        }
      } catch (error) {
        console.error('Error fetching children:', error);
        toast.error('Failed to load children data');
      }
    };

    fetchChildren();
  }, [user, selectedChild]);

  // Fetch homework details
  useEffect(() => {
    const fetchHomeworkDetails = async () => {
      if (!urlHomeworkId) {
        setError('No homework ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch homework details including lessons and resources
        const response = await apiService.homework.getById(urlHomeworkId);
        const homeworkData = response.data.homework;
        
        setHomework(homeworkData);
      } catch (error) {
        console.error('Error fetching homework details:', error);
        setError(error.response?.data?.message || 'Failed to load homework details');
        toast.error('Failed to load homework details');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworkDetails();
  }, [urlHomeworkId]);

  // File handling functions
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndAddFiles(droppedFiles);
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    validateAndAddFiles(selectedFiles);
  };

  const validateAndAddFiles = (newFiles) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    const validFiles = newFiles.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not a supported type.`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return FaFileImage;
    if (file.type === 'application/pdf') return FaFilePdf;
    if (file.type.includes('word')) return FaFileWord;
    return FaFile;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!homework?.id) {
      toast.error('No homework selected');
      return;
    }

    if (!selectedChild) {
      toast.error('Please select a child');
      return;
    }

    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('homework_id', homework.id);
      formData.append('child_id', selectedChild);
      formData.append('comments', comments);
      
      // Add all files
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Submit the homework
      await apiService.homework.submit(homework.id, formData);
      
      toast.success('Homework submitted successfully!');
      navigate('/homework');
    } catch (error) {
      console.error('Error submitting homework:', error);
      toast.error(error.response?.data?.message || 'Failed to submit homework');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading homework details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center max-w-md mx-auto px-4 sm:px-6 p-6">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Error Loading Homework
          </h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!homework) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center px-4 sm:px-6">
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No homework details available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <div className={`text-sm font-medium px-4 py-2 rounded-lg ${
            isDark ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-100'
          }`}>
            <FaUpload className="w-4 h-4 mr-2 inline" />
            Submit Work
          </div>
        </div>

        {/* Homework Details */}
        <div className={`rounded-lg shadow-lg overflow-hidden border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`px-6 py-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              {homework.title}
            </h1>
            {homework.class_name && (
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'
              }`}>
                <FaGraduationCap className="w-4 h-4 mr-2" />
                {homework.class_name}
              </div>
            )}
            
            {/* Due Date */}
            {homework.due_date && (
              <div className="flex items-center text-sm">
                <FaCalendarAlt className="w-4 h-4 mr-2 text-orange-600" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  Due: {formatDate(homework.due_date)}
                </span>
              </div>
            )}
          </div>

          {/* Instructions */}
          {homework.description && (
            <div className="p-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                Instructions
              </h2>
              <div className={`rounded-lg p-4 border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap leading-relaxed`}>
                  {homework.description}
                </p>
              </div>
            </div>
          )}

          {/* Resources */}
          {homework.resources?.file_url && (
            <div className="px-6 pb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                Resources
              </h2>
              <div className={`rounded-lg p-4 border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <a 
                  href={homework.resources.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-purple-900/20 text-purple-400 hover:bg-purple-800/30' 
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <FaDownload className="w-4 h-4 mr-2" />
                  Download Assignment File
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Child Selection */}
          {children.length > 1 && (
            <div className={`rounded-lg shadow-sm p-6 border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Select Child
              </label>
              <select 
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className={`form-select block w-full max-w-xs rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
                required
              >
                <option value="">Choose a child...</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.first_name} {child.last_name} - {child.class_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* File Upload */}
          <div className={`rounded-lg shadow-sm p-6 border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Upload Your Work
            </h3>
            
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : isDark
                    ? 'border-gray-600 bg-gray-700'
                    : 'border-gray-300 bg-gray-50'
              }`}
            >
              <FaCloudUploadAlt className={`text-4xl mx-auto mb-4 ${
                isDragOver ? 'text-blue-500' : isDark ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <p className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Drop files here or click to browse
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX (Max 10MB each)
              </p>
              <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <FaUpload className="w-4 h-4 mr-2" />
                Choose Files
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Selected Files ({files.length})
                </h4>
                {files.map((file, index) => {
                  const IconComponent = getFileIcon(file);
                  return (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <IconComponent className="text-blue-500 text-xl" />
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {file.name}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className={`rounded-lg shadow-sm p-6 border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder="Add any comments about your work..."
              className={`block w-full rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Submit Button */}
          <div className={`rounded-lg shadow-sm p-6 border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Ready to submit?
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Make sure you've uploaded all required files.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || files.length === 0 || !selectedChild}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="w-4 h-4 mr-2" />
                    Submit Work
                  </>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            {isSubmitting && uploadProgress > 0 && (
              <div className="mt-4">
                <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Uploading: {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitWork; 