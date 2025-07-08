import React, { useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

const TermsOfService = () => {
  const { isDark } = useTheme();

  useEffect(() => {
    document.title = 'Terms of Service - YoungEagles';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Terms of Service for YoungEagles - Understanding your rights and responsibilities when using our platform.');
    }
  }, []);

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-4xl mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 sm:p-8`}>
        <h1 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Terms of Service
        </h1>
        
        <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : ''}`}>
          <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Acceptance of Terms
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              By accessing and using YoungEagles, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Use License
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Permission is granted to temporarily use YoungEagles for personal, non-commercial 
              transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              User Responsibilities
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Users are responsible for maintaining the confidentiality of their account information 
              and for all activities that occur under their account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Disclaimer
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              The materials on YoungEagles are provided on an 'as is' basis. YoungEagles makes 
              no warranties, expressed or implied, and hereby disclaims all other warranties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Contact Information
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              Email: legal@youngeagles.org.za
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
