import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService.js';
import { 
  FaUser, 
  FaChild, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaEdit,
  FaGraduationCap,
  FaCalendarAlt,
  FaIdCard,
  FaArrowLeft
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ParentProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.children.getByParent(user.id);
        setChildren(response.data.children || []);
      } catch (error) {
        console.error('Error fetching children:', error);
        setChildren([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchChildren();
    }
  }, [user]);

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <section className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-sm font-medium rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Parent Profile
          </h1>
          <p className="text-gray-600 bg-blue-500 p-2 rounded-xl text-center dark:text-gray-100 mt-6">
            Manage your account and view your children's information
          </p>
        </header>

        {/* Parent Information Card */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <header className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FaUser className="mr-3 text-blue-500 dark:text-blue-400" />
              Account Information
            </h2>
            <button 
              onClick={() => nativeNotificationService.info('Edit profile feature coming soon!')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            >
              <FaEdit className="mr-2" />
              Edit Profile
            </button>
          </header>
          
          <section className="grid md:grid-cols-2 gap-6">
            <article className="space-y-4">
              <div className="flex items-center">
                <FaUser className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{profileData.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email Address</p>
                  <p className="font-medium text-gray-900 dark:text-white">{profileData.email}</p>
                </div>
              </div>
            </article>
            <article className="space-y-4">
              <div className="flex items-center">
                <FaPhone className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{profileData.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                  <p className="font-medium text-gray-900 dark:text-white">{profileData.address || 'Not provided'}</p>
                </div>
              </div>
            </article>
          </section>
        </section>

        {/* Children Information */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <FaChild className="mr-3 text-green-500 dark:text-green-400" />
            My Children ({children.length})
          </h2>
          
          {children.length === 0 ? (
            <article className="text-center py-8">
              <FaChild className="text-6xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Children Registered</h3>
              <p className="text-gray-600 dark:text-gray-300">Contact the school to register your children.</p>
            </article>
          ) : (
            <section className="space-y-4">
              {children.map((child) => (
                <article 
                  key={child.id} 
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-700"
                >
                  <header className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {child.first_name} {child.last_name}
                    </h3>
                    <button 
                      onClick={() => nativeNotificationService.info('Child details feature coming soon!')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                    >
                      View Details
                    </button>
                  </header>
                  
                  <section className="grid md:grid-cols-2 gap-4 text-sm">
                    <article className="space-y-3">
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">Age:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {child.age || calculateAge(child.date_of_birth)} years old
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaGraduationCap className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">Class:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{child.class_name || 'Not assigned'}</span>
                      </div>
                    </article>
                    <article className="space-y-3">
                      {child.date_of_birth && (
                        <div className="flex items-center">
                          <FaIdCard className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">Date of Birth:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">{formatDate(child.date_of_birth)}</span>
                        </div>
                      )}
                      {child.emergency_contact && (
                        <div className="flex items-center">
                          <FaPhone className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">Emergency Contact:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">{child.emergency_contact}</span>
                        </div>
                      )}
                    </article>
                  </section>
                </article>
              ))}
            </section>
          )}
        </section>

        {/* Quick Actions */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <nav className="grid md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.location.href = '/homework'}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            >
              <FaGraduationCap className="mr-2" />
              View Homework
            </button>
            
            <button 
              onClick={() => nativeNotificationService.info('Communication feature coming soon!')}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            >
              <FaEnvelope className="mr-2" />
              Contact Teachers
            </button>
            
            <button 
              onClick={() => nativeNotificationService.info('Reports feature coming soon!')}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            >
              <FaUser className="mr-2" />
              Progress Reports
            </button>
          </nav>
        </section>
      </section>
    </main>
  );
};

export default ParentProfile;