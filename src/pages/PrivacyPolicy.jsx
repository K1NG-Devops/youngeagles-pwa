import React, { useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

const PrivacyPolicy = () => {
  const { isDark } = useTheme();

  useEffect(() => {
    document.title = 'Privacy Policy - YoungEagles';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Privacy Policy for YoungEagles - Learn how we collect, use, and protect your personal information.');
    }
  }, []);

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-4xl mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 sm:p-8`}>
        <h1 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Privacy Policy
        </h1>
        
        <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : ''}`}>
          <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Information We Collect
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              YoungEagles collects information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support. This may include your name, email address, and 
              educational information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              How We Use Your Information
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We use the information we collect to provide, maintain, and improve our services, 
              communicate with you, and ensure the security of our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Information Sharing
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this privacy policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Cookies and Tracking
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We use cookies and similar tracking technologies to enhance your experience on our site. 
              This includes advertising cookies from Google AdSense to serve relevant advertisements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Contact Us
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              Email: privacy@youngeagles.org.za
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
