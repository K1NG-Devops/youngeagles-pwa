import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaFile, FaTrash, FaPaperPlane, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { API_CONFIG } from '../config/api';

const SubmitWork = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [selectedChild, setSelectedChild] = useState(localStorage.getItem('selectedChild') || '');
  const [children, setChildren] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [selectedHomework, setSelectedHomework] = useState('');
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState({
    children: false,
    homeworks: false
  });

  const parent_id = localStorage.getItem('parent_id');
  const token = localStorage.getItem('accessToken');

  // Fetch children
  useEffect(() => {
    const fetchChildren = async () => {
      if (!parent_id || !token) return;
      
      setLoading(prev => ({ ...prev, children: true }));
      
      try {
        const res = await axios.get(
          `${API_CONFIG.getApiUrl()}/auth/parents/${parent_id}/children`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const childrenData = Array.isArray(res.data) ? res.data : res.data.children || [];
        setChildren(childrenData);
        
        // Auto-select first child if no child is selected
        if (childrenData.length > 0 && !selectedChild) {
          const firstChildId = childrenData[0].id.toString();
          setSelectedChild(firstChildId);
          localStorage.setItem('selectedChild', firstChildId);
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        toast.error('No Homeworks found');
      } finally {
        setLoading(prev => ({ ...prev, children: false }));
      }
    };

    fetchChildren();
  }, [parent_id, token]);

  // Fetch homeworks when child is selected
  useEffect(() => {
    const fetchHomeworks = async () => {
      if (!parent_id || !token || !selectedChild) return;
      
      setLoading(prev => ({ ...prev, homeworks: true }));
      
      try {
        const res = await axios.get(
          `${API_CONFIG.getApiUrl()}/homeworks/for-parent/${parent_id}?child_id=${selectedChild}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const hwList = Array.isArray(res.data) ? res.data : res.data.homeworks || [];
        // Filter only pending homeworks
        const pendingHomeworks = hwList.filter(hw => !hw.submitted);
        setHomeworks(pendingHomeworks);
      } catch (err) {
        console.error('Error fetching homeworks:', err);
        if (err.response?.status !== 404) {
          toast.message('No homeworks found');
        }
      } finally {
        setLoading(prev => ({ ...prev, homeworks: false }));
      }
    };

    fetchHomeworks();
  }, [selectedChild, parent_id, token]);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = selectedFiles.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('homework_id', selectedHomework);
      formData.append('child_id', selectedChild);
      
      files.forEach((file, index) => {
        formData.append('files', file);
      });

      await axios.post(
        `${API_CONFIG.getApiUrl()}/homeworks/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Homework submitted successfully!');
      
      // Reset form
      setSelectedHomework('');
      setFiles([]);
      
      // Refresh homeworks list
      const res = await axios.get(
        `${API_CONFIG.getApiUrl()}/homeworks/for-parent/${parent_id}?child_id=${selectedChild}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const hwList = Array.isArray(res.data) ? res.data : res.data.homeworks || [];
      const pendingHomeworks = hwList.filter(hw => !hw.submitted);
      setHomeworks(pendingHomeworks);
      
    } catch (err) {
      console.error('Error submitting homework:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit homework';
      toast.error(errorMessage);
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

  return (
    <div className="p-4 space-y-4 max-w-full overflow-x-hidden pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
        <h1 className="text-xl font-bold mb-1">Submit Homework</h1>
        <p className="text-sm text-green-100">Upload your child's completed assignments</p>
      </div>

      {/* Child Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Child</h3>
        {loading.children ? (
          <div className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50">
            <FaSpinner className="animate-spin text-gray-400" />
            <span className="text-sm text-gray-500">Loading children...</span>
          </div>
        ) : (
          <select
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
            Selected: <span className="font-medium">{selectedChildData.name}</span> ({selectedChildData.className})
          </div>
        )}
      </div>

      {/* Homework Selection */}
      {selectedChild && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Assignment</h3>
          {loading.homeworks ? (
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50">
              <FaSpinner className="animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">Loading assignments...</span>
            </div>
          ) : homeworks.length > 0 ? (
            <select
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <FaCheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No pending assignments for this child</p>
            </div>
          )}
          {selectedHomeworkData && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">{selectedHomeworkData.title}</p>
              <p className="text-xs text-yellow-700">Due: {new Date(selectedHomeworkData.due_date).toLocaleDateString()}</p>
              {selectedHomeworkData.description && (
                <p className="text-xs text-yellow-600 mt-1">{selectedHomeworkData.description}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* File Upload */}
      {selectedHomework && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Upload Files</h3>
          
          {/* File Input */}
          <div className="mb-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FaUpload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (MAX. 10MB each)</p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FaFile className="text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || files.length === 0}
            className={`w-full mt-4 p-3 rounded-lg font-medium transition-all ${
              isSubmitting || files.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <FaSpinner className="animate-spin" />
                <span>Submitting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <FaPaperPlane />
                <span>Submit Homework</span>
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SubmitWork;
