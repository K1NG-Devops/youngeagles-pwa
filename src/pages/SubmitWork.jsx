import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaUpload, FaFile, FaTrash, FaPaperPlane, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaCloudUploadAlt, FaFileImage, FaFilePdf, FaFileWord, FaImage, FaTimes, FaUser, FaBook } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { api } from '../services/httpClient';
import useAuth from '../hooks/useAuth';
import { API_CONFIG } from '../config/api';

const SubmitWork = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { auth } = useAuth();
  
  // Get child_id from URL params first, then localStorage
  const urlChildId = searchParams.get('child_id');
  const urlHomeworkId = searchParams.get('homework_id');
  
  console.log('SubmitWork: URL parameters:', { urlChildId, urlHomeworkId });
  
  const [selectedChild, setSelectedChild] = useState(() => {
    // Priority: URL param > localStorage > empty string
    return urlChildId || localStorage.getItem('selectedChild') || '';
  });
  
  const [selectedHomework, setSelectedHomework] = useState(() => {
    // Priority: URL param > empty string
    return urlHomeworkId || '';
  });
  
  const [children, setChildren] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState({
    children: false,
    homeworks: false
  });
  const [error, setError] = useState(null);

  // More robust authentication data retrieval
  const getAuthData = () => {
    // Get token from multiple sources
    const token = localStorage.getItem('accessToken') || auth?.accessToken;
    
    // Get parent_id from multiple sources
    let parent_id = localStorage.getItem('parent_id');
    if (!parent_id && auth?.user?.id) {
      parent_id = auth.user.id.toString();
      // Store in localStorage for future use
      localStorage.setItem('parent_id', parent_id);
      console.log('SubmitWork: Saved parent_id to localStorage from auth context:', parent_id);
    }
    
    console.log('SubmitWork: Auth data retrieved:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      parent_id
    });
    
    return { token, parent_id };
  };
  
  const { token, parent_id } = getAuthData();

  // Fetch children
  useEffect(() => {
    console.log('SubmitWork: Checking auth data for fetching children:', { 
      hasParentId: !!parent_id, 
      hasToken: !!token
    });
    
    // Don't try to fetch without auth data
    if (!parent_id) {
      console.error('SubmitWork: Missing parent_id, cannot fetch children');
      setError('Missing parent ID. Please try logging out and back in.');
      return;
    }
    
    if (!token) {
      console.error('SubmitWork: Missing token, cannot fetch children');
      setError('Authentication token missing. Please try logging out and back in.');
      return;
    }
    
    const fetchChildren = async () => {
      setLoading(prev => ({ ...prev, children: true }));
      
      try {
        console.log(`SubmitWork: Fetching children for parent_id ${parent_id}`);
        const res = await api.get(
          `${API_CONFIG.ENDPOINTS.CHILDREN}/${parent_id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Request-Source': 'pwa-submit-work-children'
            },
            timeout: 8000
          }
        );
        
        const childrenData = Array.isArray(res.data) ? res.data : res.data.children || [];
        console.log(`SubmitWork: Fetched ${childrenData.length} children`);
        setChildren(childrenData);
        
        // Auto-select first child if no child is selected
        if (childrenData.length > 0 && !selectedChild) {
          const firstChildId = childrenData[0].id.toString();
          console.log(`SubmitWork: Auto-selecting first child: ${firstChildId}`);
          setSelectedChild(firstChildId);
          localStorage.setItem('selectedChild', firstChildId);
        } else if (selectedChild) {
          // Validate that selected child exists in the fetched children
          const childExists = childrenData.some(child => child.id.toString() === selectedChild);
          if (!childExists && childrenData.length > 0) {
            console.log(`SubmitWork: Selected child ${selectedChild} not found in fetched children, selecting first child`);
            const firstChildId = childrenData[0].id.toString();
            setSelectedChild(firstChildId);
            localStorage.setItem('selectedChild', firstChildId);
          }
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        
        if (err.response) {
          const { status } = err.response;
          
          if (status === 401) {
            toast.error('Your session has expired. Please log in again.');
            navigate('/login');
          } else if (status === 403) {
            toast.error('You do not have permission to view children.');
          } else if (status === 404) {
            toast.info('No children found. Please register a child first.');
          } else {
            toast.error('Failed to load children data.');
          }
        } else {
          toast.error('Network error. Please check your connection.');
        }
      } finally {
        setLoading(prev => ({ ...prev, children: false }));
      }
    };

    fetchChildren();
  }, [parent_id, token, selectedChild]);

  // Fetch homeworks when child is selected
  useEffect(() => {
    console.log('SubmitWork: Checking data for fetching homeworks:', { 
      hasParentId: !!parent_id, 
      hasToken: !!token,
      selectedChild
    });
    
    // More detailed checks with better error handling
    if (!parent_id) {
      console.error('SubmitWork: Missing parent_id, cannot fetch homeworks');
      return;
    }
    
    if (!token) {
      console.error('SubmitWork: Missing token, cannot fetch homeworks');
      return;
    }
    
    if (!selectedChild) {
      console.log('SubmitWork: No child selected yet, skipping homework fetch');
      return;
    }
    
    const fetchHomeworks = async () => {
      setLoading(prev => ({ ...prev, homeworks: true }));
      setError(null);
      
      try {
        console.log(`SubmitWork: Fetching homeworks for child_id ${selectedChild}`);
        // Replace placeholders in the endpoint URL
        const homeworkUrl = API_CONFIG.ENDPOINTS.HOMEWORK_FOR_PARENT
          .replace(':parentId', parent_id)
          .replace(':childId', selectedChild);
        const res = await api.get(
          homeworkUrl,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Request-Source': 'pwa-submit-work-homeworks'
            },
            timeout: 8000
          }
        );
        
        const apiResponse = res.data;
        const hwList = Array.isArray(apiResponse.data) ? apiResponse.data : apiResponse.homeworks || [];
        // Filter only pending homeworks
        const pendingHomeworks = hwList.filter(hw => !hw.submitted);
        setHomeworks(pendingHomeworks);
      } catch (err) {
        console.error('Error fetching homeworks:', err);
        
        if (err.response) {
          const { status } = err.response;
          
          if (status === 401) {
            toast.error('Your session has expired. Please log in again.');
            navigate('/login');
          } else if (status === 403) {
            toast.error('You do not have permission to view homeworks.');
          } else if (status === 404) {
            toast.info('No pending homeworks found for this child.');
          } else {
            toast.error('Failed to load homework data.');
          }
        } else {
          toast.error('Network error. Please check your connection.');
        }
      } finally {
        setLoading(prev => ({ ...prev, homeworks: false }));
      }
    };

    fetchHomeworks();
  }, [parent_id, token, selectedChild]);

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
    const validFiles = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    newFiles.forEach(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
      } else if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not a supported format. Please use PDF, DOC, DOCX, JPG, PNG, or GIF.`);
      } else if (files.length + validFiles.length >= 5) {
        toast.error('Maximum 5 files allowed per submission.');
        return;
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added successfully!`);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (file.type.includes('word') || file.type.includes('document')) return <FaFileWord className="text-blue-500" />;
    if (file.type.includes('image')) return <FaFileImage className="text-green-500" />;
    return <FaFile className="text-gray-500" />;
  };

  const getFilePreview = (file) => {
    if (file.type.includes('image')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const isImageFile = (file) => {
    return file.type.includes('image');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedHomework) {
      toast.error('Please select a homework assignment');
      return;
    }
    
    if (files.length === 0) {
      toast.error('Please select at least one file to submit');
      return;
    }
    
    if (!selectedChild) {
      toast.error('Please select a child');
      return;
    }
    
    if (!parent_id) {
      toast.error('Parent ID not found. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('child_id', selectedChild);
      formData.append('parent_id', parent_id);
      formData.append('comment', ''); // Optional comment field
      
      files.forEach((file, index) => {
        formData.append('files', file);
      });

      console.log('SubmitWork: Submitting homework with data:', {
        homeworkId: selectedHomework,
        child_id: selectedChild,
        parent_id: parent_id,
        filesCount: files.length
      });

      // Submit to the new endpoint with homework ID in the URL
      const submitUrl = `/api/homework/submit/${selectedHomework}`;
      await api.upload(
        submitUrl,
        formData,
        (progressEvent) => {
          // Optional progress handler if you want to show upload progress
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      );

      toast.success('Homework submitted successfully! 🎉');
      
      // Reset form
      setSelectedHomework('');
      setFiles([]);
      setUploadProgress(0);
      
      // Refresh homeworks list
      const homeworkUrl = API_CONFIG.ENDPOINTS.HOMEWORK_FOR_PARENT
        .replace(':parentId', parent_id)
        .replace(':childId', selectedChild);
      const res = await api.get(homeworkUrl);
      
      const apiResponse = res.data;
      const hwList = Array.isArray(apiResponse.data) ? apiResponse.data : apiResponse.homeworks || [];
      const pendingHomeworks = hwList.filter(hw => !hw.submitted);
      setHomeworks(pendingHomeworks);
      
    } catch (err) {
      console.error('Error submitting homework:', err);
      setUploadProgress(0);
      
      if (err.response) {
        const { status, data } = err.response;
        
        if (status === 401) {
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
        } else if (status === 403) {
          toast.error('You do not have permission to submit homework.');
        } else if (status === 413) {
          toast.error('Files too large. Total submission must be under 10MB.');
        } else if (status === 422) {
          const validationErrors = data.errors ? 
            data.errors.map(e => e.msg).join(', ') : 
            data.message;
          toast.error(`Validation error: ${validationErrors}`);
        } else {
          toast.error(data.message || 'Failed to submit homework.');
        }
      } else if (err.request) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Error submitting homework: ' + err.message);
      }
      
      // Log additional details for debugging
      if (API_CONFIG.FEATURES.DEBUG_MODE) {
        console.error('Submission error details:', {
          status: err.response?.status,
          data: err.response?.data,
          config: err.config
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const selectedChildData = children.find(child => child.id.toString() === selectedChild);
  const selectedHomeworkData = homeworks.find(hw => hw.id.toString() === selectedHomework);

  // Debug information
  console.log('SubmitWork: Render state:', {
    hasToken: !!token,
    parent_id,
    childrenCount: children.length,
    selectedChild,
    selectedHomework,
    homeworksCount: homeworks.length,
    filesCount: files.length,
    error
  });
  
  return (
    <div className="p-4 space-y-6 max-w-full overflow-x-hidden pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-3 mb-2">
          <FaCloudUploadAlt className="text-2xl" />
          <h1 className="text-2xl font-bold">Submit Homework</h1>
        </div>
        <p className="text-sm text-green-100">Upload your child's completed assignments</p>
      </div>
      
      {/* Error Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Child Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaUser className="mr-2 text-blue-500" />
          Select Child
        </h3>
        {loading.children ? (
          <div className="flex items-center space-x-2 p-4 border rounded-lg bg-gray-50">
            <FaSpinner className="animate-spin text-gray-400" />
            <span className="text-sm text-gray-500">Loading children...</span>
          </div>
        ) : (
          <select
            className="w-full p-4 border border-gray-300 rounded-lg bg-white text-black text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={selectedChild}
            onChange={(e) => {
              setSelectedChild(e.target.value);
              localStorage.setItem('selectedChild', e.target.value);
              setSelectedHomework('');
            }}
          >
            <option value="">Select a child</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name} - {child.className || 'No Class'}
              </option>
            ))}
          </select>
        )}
        {selectedChildData && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <FaCheckCircle className="text-blue-500" />
              <span className="text-sm text-blue-700">
                Selected: <span className="font-medium">{selectedChildData.name}</span> ({selectedChildData.className})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Homework Selection */}
      {selectedChild && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaBook className="mr-2 text-green-500" />
            Select Assignment
          </h3>
          {loading.homeworks ? (
            <div className="flex items-center space-x-2 p-4 border rounded-lg bg-gray-50">
              <FaSpinner className="animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">Loading assignments...</span>
            </div>
          ) : homeworks.length > 0 ? (
            <select
              className="w-full p-4 border border-gray-300 rounded-lg bg-white text-black text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              value={selectedHomework}
              onChange={(e) => setSelectedHomework(e.target.value)}
            >
              <option value="">Select an assignment</option>
              {homeworks.map((homework) => (
                <option key={homework.id} value={homework.id}>
                  {homework.title} - Due: {new Date(homework.due_date).toLocaleDateString()}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-center py-8">
              <FaCheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">All caught up!</p>
              <p className="text-sm text-gray-600">No pending assignments for this child</p>
            </div>
          )}
          {selectedHomeworkData && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">{selectedHomeworkData.title}</h4>
              <p className="text-xs text-yellow-700 mb-2">Due: {new Date(selectedHomeworkData.due_date).toLocaleDateString()}</p>
              {selectedHomeworkData.description && (
                <p className="text-xs text-yellow-600 bg-white/50 p-2 rounded">{selectedHomeworkData.description}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* File Upload */}
      {selectedHomework && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaUpload className="mr-2 text-purple-500" />
            Upload Files
          </h3>
          
          {/* Enhanced File Input with Drag & Drop */}
          <div className="mb-6">
            <label 
              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FaCloudUploadAlt className={`w-12 h-12 mb-4 transition-colors ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (MAX. 10MB each)</p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {/* Selected Files with Enhanced UI and Preview */}
          {files.length > 0 && (
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <FaFile className="mr-2" />
                Selected Files ({files.length}):
              </h4>
              {files.map((file, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {isImageFile(file) ? (
                        <div className="relative">
                          <img 
                            src={getFilePreview(file)} 
                            alt={file.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <FaFileImage className="text-white opacity-0 hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-white rounded-lg border border-gray-300 flex items-center justify-center">
                          {getFileIcon(file)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">{file.name}</p>
                        <p className="text-xs text-gray-500 mb-2">{formatFileSize(file.size)}</p>
                        {isImageFile(file) && (
                          <div className="flex items-center space-x-2 text-xs text-green-600">
                            <FaCheckCircle className="w-3 h-3" />
                            <span>Image preview available</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors ml-2"
                      title="Remove file"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${uploadProgress}%`}}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || files.length === 0}
            className={`w-full p-4 rounded-lg font-medium transition-all duration-200 ${
              isSubmitting || files.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <FaSpinner className="animate-spin" />
                <span>Submitting... {uploadProgress}%</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <FaPaperPlane />
                <span>Submit Homework ({files.length} files)</span>
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SubmitWork;
