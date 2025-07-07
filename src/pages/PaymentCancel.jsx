import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const PaymentCancel = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full mx-4 p-8 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Cancel Icon */}
        <div className="text-center mb-6">
          <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Payment Cancelled
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your payment was cancelled. No charges have been made to your account.
          </p>
        </div>

        {/* Information */}
        <div className={`border rounded-lg p-4 mb-6 ${isDark ? 'border-yellow-700 bg-yellow-900/20' : 'border-yellow-200 bg-yellow-50'}`}>
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>
            What happened?
          </h3>
          <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
            You cancelled the payment process before it was completed. This could happen if you:
          </p>
          <ul className={`text-sm mt-2 space-y-1 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
            <li>• Clicked the back button</li>
            <li>• Closed the payment window</li>
            <li>• Chose to cancel the transaction</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/management')}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <FaCreditCard className="mr-2" />
            Try Payment Again
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Help Text */}
        <div className={`text-center mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Need help? Contact our support team if you're experiencing issues with payments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
