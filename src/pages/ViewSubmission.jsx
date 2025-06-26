import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaFilePdf, FaFileImage, FaFileWord, FaFile, FaSpinner, FaArrowLeft, FaCheckCircle, FaUser, FaChalkboardTeacher, FaCalendarAlt, FaGraduationCap } from 'react-icons/fa';
import { api } from '../services/httpClient';
import { useTheme } from '../hooks/useTheme';
import { formatDate } from '../utils/dateUtils';
import { toast } from 'react-toastify';

const ViewSubmission = () => {
  const { submissionId } = useParams();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/submission/${submissionId}`);
        if (res.data.success) {
          setSubmission(res.data.submission);
        } else {
          throw new Error(res.data.message || 'Failed to fetch submission details.');
        }
      } catch (err) {
        console.error('Error fetching submission:', err);
        setError(err.response?.data?.message || err.message || 'An unknown error occurred.');
        toast.error(err.response?.data?.message || 'Could not load submission.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId]);

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.pdf')) return <FaFilePdf className="text-red-500 text-2xl" />;
    if (/\.(jpg|jpeg|png|gif)$/i.test(fileName)) return <FaFileImage className="text-green-500 text-2xl" />;
    if (/\.(doc|docx)$/i.test(fileName)) return <FaFileWord className="text-blue-500 text-2xl" />;
    return <FaFile className="text-gray-500 text-2xl" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-center px-4">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Failed to Load Submission</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!submission) {
    return <div className="text-center py-10">No submission found.</div>;
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isDark ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Submission Details
          </h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 space-y-6">

          {/* Assignment Title */}
          <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">{submission.homeworkTitle}</h2>
          </div>

          {/* Submission Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <FaUser className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Student</p>
                <p className="font-medium">{submission.studentName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaChalkboardTeacher className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Teacher</p>
                <p className="font-medium">{submission.teacherName || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaCalendarAlt className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Submitted On</p>
                <p className="font-medium">{formatDate(submission.submissionDate)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaCheckCircle className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className="font-medium capitalize">{submission.submissionStatus}</p>
              </div>
            </div>
          </div>

          {/* Grade and Feedback Section */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Grade & Feedback</h3>
            {submission.grade ? (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {submission.grade}
                  </div>
                  <div>
                    <p className="font-semibold">Your child's work has been graded.</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Feedback from the teacher will appear here once available.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">This submission has not been graded yet.</p>
              </div>
            )}
          </div>


          {/* Submitted Files Section */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Submitted Files</h3>
            <div className="space-y-3">
              {submission.submittedFiles.length > 0 ? (
                submission.submittedFiles.map((file, index) => (
                  <a 
                    href={`${API_CONFIG.getApiUrl()}/${file}`} // Note: This assumes files are served statically from the API
                    target="_blank" 
                    rel="noopener noreferrer" 
                    key={index}
                    className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {getFileIcon(file)}
                    <span className="ml-4 text-sm font-medium">{file.split('/').pop()}</span>
                  </a>
                ))
              ) : (
                <p className="text-sm text-gray-500">No files were submitted.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewSubmission; 