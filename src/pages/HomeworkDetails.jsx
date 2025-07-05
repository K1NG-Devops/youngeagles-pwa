import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';
import EnhancedHomeworkDetail from '../components/EnhancedHomeworkDetail';
import { FaSpinner, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

const HomeworkDetails = () => {
  const { homeworkId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [homework, setHomework] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const selectedChildId = searchParams.get('child_id');

  useEffect(() => {
    const fetchHomeworkDetails = async () => {
      if (!homeworkId) {
        setError('No homework ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiService.get(`/api/homework/${homeworkId}`);
        setHomework(response.data.homework);
      } catch (error) {
        console.error('Error fetching homework details:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load homework details');
        toast.error('Failed to load homework details');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworkDetails();
  }, [homeworkId]);

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
        <div className="text-center max-w-md mx-auto p-6">
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
        <div className="text-center">
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No homework details available</p>
        </div>
      </div>
    );
  }

  return <EnhancedHomeworkDetail homework={homework} selectedChildId={selectedChildId} />;
};

export default HomeworkDetails;
