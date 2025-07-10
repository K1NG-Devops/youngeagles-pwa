import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const Contact = () => {
  const { isDark } = useTheme();

  useEffect(() => {
    document.title = 'Contact Us - YoungEagles';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get in touch with YoungEagles - Contact our education management platform support team for assistance.');
    }
  }, []);

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-4xl mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 sm:p-8`}>
        <h1 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Contact Us
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <h2 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Get in Touch
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We're here to help! Reach out to us with any questions, concerns, or feedback about YoungEagles.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <FaEnvelope className={'text-blue-500 mr-3'} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  support@youngeagles.org.za
                </span>
              </div>
              
              <div className="flex items-center">
                <FaPhone className={'text-blue-500 mr-3'} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  +27 81 523 6000
                </span>
              </div>
              
              <div className="flex items-center">
                <FaMapMarkerAlt className={'text-blue-500 mr-3'} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Pretoria, South Africa
                </span>
              </div>
              
              <div className="flex items-center">
                <FaClock className={'text-blue-500 mr-3'} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Monday - Friday: 8:00 AM - 5:00 PM SAST
                </span>
              </div>
            </div>
          </div>
          
          {/* About Section */}
          <div>
            <h2 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              About YoungEagles
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              YoungEagles is a comprehensive education management platform designed to connect 
              students, parents, and educators in a seamless digital environment.
            </p>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Our mission is to enhance the educational experience through innovative technology, 
              making learning more accessible, organized, and engaging for everyone involved.
            </p>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Whether you're a parent tracking your child's progress, a teacher managing assignments, 
              or a student staying organized, YoungEagles provides the tools you need to succeed.
            </p>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            What We Offer
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Homework Management
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Track assignments and deadlines efficiently
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Communication Tools
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Connect teachers, parents, and students
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Progress Tracking
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Monitor academic progress and achievements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
