import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { BannerAd } from '../components/ads';
import { 
  FaGraduationCap, 
  FaBookOpen, 
  FaUsers, 
  FaMobile, 
  FaBell, 
  FaChartLine,
  FaArrowRight,
  FaStar,
  FaShieldAlt,
  FaRocket
} from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  if (isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full mx-4 p-8 rounded-2xl shadow-xl text-center ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="mb-6">
            <FaRocket className={`text-6xl mx-auto mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome back!</h2>
            <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Ready to continue your journey?</p>
          </div>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Go to Dashboard
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: FaBookOpen,
      title: 'Homework Management',
      description: 'Track assignments, deadlines, and submissions with ease',
      color: 'text-blue-500'
    },
    {
      icon: FaUsers,
      title: 'Teacher Communication',
      description: "Stay connected with your child's teachers and get real-time updates",
      color: 'text-green-500'
    },
    {
      icon: FaChartLine,
      title: 'Progress Tracking',
      description: "Monitor your child's academic progress and achievements",
      color: 'text-purple-500'
    },
    {
      icon: FaBell,
      title: 'Smart Notifications',
      description: 'Never miss important announcements or deadlines',
      color: 'text-yellow-500'
    },
    {
      icon: FaMobile,
      title: 'Mobile Ready',
      description: 'Works perfectly on any device, online or offline',
      color: 'text-red-500'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security',
      color: 'text-indigo-500'
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <FaGraduationCap className="text-8xl text-white mx-auto mb-6 animate-bounce" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Young Eagles
              <span className="block text-3xl md:text-4xl font-light text-blue-200 mt-2">
                Education Management
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Empowering parents, teachers, and students with a comprehensive platform 
              for managing educational journeys, tracking progress, and fostering collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/login" 
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Get Started Today
                <FaArrowRight className="ml-3" />
              </Link>
              <div className="flex items-center text-blue-200">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm">Trusted by 1000+ families</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Everything You Need
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Comprehensive tools designed to enhance the educational experience for everyone
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                  isDark 
                    ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' 
                    : 'bg-white border border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`inline-flex p-4 rounded-full bg-opacity-10 mb-6 ${feature.color.replace('text-', 'bg-')}`}>
                  <feature.icon className={`text-3xl ${feature.color}`} />
                </div>
                <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Ad Section */}
        <BannerAd className="mt-16" />
      </div>

      {/* CTA Section */}
      <div className={`py-16 ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Ready to Transform Your Educational Experience?
          </h2>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Join thousands of families already using Young Eagles to stay connected and organized.
          </p>
          <Link 
            to="/login" 
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Start Your Journey
            <FaArrowRight className="ml-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 