import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';
import { FaUser, FaBook, FaUpload, FaBrain, FaBell, FaArrowRight } from 'react-icons/fa';
import Header from '../components/Header';
import { useTheme } from '../hooks/useTheme';
import { YoungEaglesMainDisplay } from '../components/ads';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    children: 0,
    classes: 0,
    homework: 0,
    pending: 0,
    submitted: 0,
    completionRate: 0
  });
  const [, setChildren] = useState([]);
  const [, setHomeworkData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch different data based on user role
        if (user?.role === 'parent') {
          // For parents, get their children and homework data
          const childrenResponse = await apiService.children.getByParent(user.id);
          const childrenData = childrenResponse.data.children || [];
          setChildren(childrenData);
          
          // Fetch homework data for the parent
          try {
            const homeworkResponse = await apiService.homework.getByParent(user.id);
            const homework = homeworkResponse.data.homework || [];
            setHomeworkData(homework);
            
            // Calculate homework stats
            const totalHomework = homework.length;
            const submittedHomework = homework.filter(hw => hw.status === 'submitted' || hw.status === 'graded').length;
            const completionRate = totalHomework > 0 ? Math.round((submittedHomework / totalHomework) * 100) : 0;
            
            setStats({
              children: childrenData.length,
              classes: 0,
              homework: totalHomework,
              pending: totalHomework - submittedHomework,
              submitted: submittedHomework,
              completionRate
            });
          } catch {
            console.log('Homework API not available, using empty state');
            setStats({
              children: childrenData.length,
              classes: 0,
              homework: 0,
              pending: 0,
              submitted: 0,
              completionRate: 0
            });
          }
        } else {
          // For teachers/admin, get all children and classes
          const [childrenResponse, classesResponse] = await Promise.all([
            apiService.children.getAll(),
            apiService.classes.getAll()
          ]);
          
          // Try to fetch homework data for teachers
          try {
            const homeworkResponse = await apiService.homework.getByTeacher(user.id);
            const homework = homeworkResponse.data.homework || [];
            setHomeworkData(homework);
            
            setStats({
              children: childrenResponse.data.children?.length || 0,
              classes: classesResponse.data.classes?.length || 0,
              homework: homework.length,
              pending: homework.filter(hw => hw.status === 'assigned').length,
              submitted: 0,
              completionRate: 0
            });
          } catch {
            console.log('Homework API not available for teachers');
            setStats({
              children: childrenResponse.data.children?.length || 0,
              classes: classesResponse.data.classes?.length || 0,
              homework: 0,
              pending: 0,
              submitted: 0,
              completionRate: 0
            });
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use empty stats when API is not available
        setStats({
          children: 0,
          classes: 0,
          homework: 0,
          pending: 0,
          submitted: 0,
          completionRate: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Route teachers to TeacherDashboard
  if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  }

  // Route admins to AdminDashboard
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      
      {/* Main Content Container */}
      <div className="pt-24 pb-4">
        {/* Welcome Section */}
        

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-gradient-to-r border-b-2 mb-5 border-blue-500 rounded-xl from-blue-500 to-purple-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
              <p className="text-blue-100 text-sm md:text-base">Track your child's learning progress and stay connected</p>
            </div>
          </div>
          
          {/* YoungEagles Ad */}
          <YoungEaglesMainDisplay 
            className="mb-6"
            style={{ maxWidth: '100%' }}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Main Actions */}
            <div className="lg:col-span-2 space-y-6">

              {/* Quick Actions for Parents */}
              {user?.role === 'parent' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment Proofs */}
                  <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Payment Proofs 💳
                        </h3>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Submit proof of payment for school fees
                        </p>
                      </div>
                      <FaUpload className={`text-2xl ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                    </div>
                    <Link 
                      to="/payment-proofs"
                      className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center"
                    >
              Submit POP
                    </Link>
                  </div>

                  {/* AI Assistant */}
                  <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          AI Assistant 🧠
                        </h3>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Get personalized insights into your child's progress
                        </p>
                      </div>
                      <FaBrain className={`text-2xl ${isDark ? 'text-pink-400' : 'text-pink-500'}`} />
                    </div>
                    <button 
                      onClick={() => toast.info('AI Assistant feature coming soon!')}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center"
                    >
              Activate Assistant
                    </button>
                  </div>
                </div>
              )}

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* View Homework */}
                <Link
                  to="/homework"
                  className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md hover:scale-105 ${
                    isDark ? 'bg-blue-800 border-blue-700 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  <div className="text-center text-white">
                    <FaBook className="text-3xl mx-auto mb-3" />
                    <div className="text-2xl font-bold mb-1">{stats.homework}</div>
                    <div className="text-sm font-medium">Homework</div>
                    <div className="text-xs opacity-75 mt-1">View assignments</div>
                  </div>
                </Link>

                {/* Submit Work */}
                <Link
                  to="/submit-work"
                  className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md hover:scale-105 ${
                    isDark ? 'bg-green-800 border-green-700 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  <div className="text-center text-white">
                    <FaUpload className="text-3xl mx-auto mb-3" />
                    <div className="text-2xl font-bold mb-1">{stats.pending}</div>
                    <div className="text-sm font-medium">Pending</div>
                    <div className="text-xs opacity-75 mt-1">Submit work</div>
                  </div>
                </Link>

                {/* Manage Children */}
                <Link
                  to="/children"
                  className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md hover:scale-105 ${
                    isDark ? 'bg-purple-800 border-purple-700 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
                  }`}
                >
                  <div className="text-center text-white">
                    <FaUser className="text-3xl mx-auto mb-3" />
                    <div className="text-2xl font-bold mb-1">{stats.children}</div>
                    <div className="text-sm font-medium">Children</div>
                    <div className="text-xs opacity-75 mt-1">Manage profiles</div>
                  </div>
                </Link>

                {/* Notifications */}
                <button
                  onClick={() => toast.info('Events feature coming soon!')}
                  className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md hover:scale-105 ${
                    isDark ? 'bg-orange-800 border-orange-700 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  <div className="text-center text-white">
                    <FaBell className="text-3xl mx-auto mb-3" />
                    <div className="text-2xl font-bold mb-1">3</div>
                    <div className="text-sm font-medium">Alerts</div>
                    <div className="text-xs opacity-75 mt-1">View updates</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Column - Progress & Reports */}
            <div className="space-y-6">

              {/* Homework Progress */}
              <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Homework Progress
                </h3>
          
                {/* Progress Circle */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className={`${isDark ? 'stroke-gray-700' : 'stroke-gray-200'}`}
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="stroke-blue-500"
                        strokeWidth="3"
                        strokeDasharray={`${stats.completionRate}, 100`}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {stats.completionRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total:</span>
                    <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{stats.homework}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Completed:</span>
                    <span className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{stats.submitted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Pending:</span>
                    <span className={`font-semibold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{stats.pending}</span>
                  </div>
                </div>
          
                {stats.homework === 0 && (
                  <div className={`mt-4 p-4 rounded-lg text-center ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                    <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                      No homework assignments available yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Report */}
              <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Progress Report
                  </h3>
                  <FaArrowRight className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  Detailed academic progress and insights
                </p>
                <button 
                  onClick={() => toast.info('Progress reports coming soon!')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isDark 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  View Full Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 