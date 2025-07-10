import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaSpinner, FaCrown, FaArrowRight } from 'react-icons/fa';
import nativeNotificationService from '../services/nativeNotificationService.js';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const PaymentSuccess = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { upgradePlan, plans } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get payment parameters from URL
        const paymentId = searchParams.get('pf_payment_id');
        const amount = searchParams.get('amount_gross');
        const planId = searchParams.get('custom_str2');
        const userId = searchParams.get('custom_str1');

        console.log('Payment success parameters:', {
          paymentId,
          amount,
          planId,
          userId,
          currentUser: user?.id
        });

        if (!paymentId || !planId) {
          throw new Error('Missing payment information');
        }

        // Verify the user matches
        if (userId && user?.id && userId !== user.id.toString()) {
          throw new Error('Payment user mismatch');
        }

        // Set payment data for display
        setPaymentData({
          paymentId,
          amount: parseFloat(amount),
          planId,
          plan: plans[planId]
        });

        // Upgrade the user's subscription
        if (planId && plans[planId]) {
          const result = await upgradePlan(planId);
          if (result.success) {
            nativeNotificationService.success(`Successfully upgraded to ${plans[planId].name} plan!`);
          } else {
            throw new Error('Failed to update subscription');
          }
        }

        setIsProcessing(false);

        // Auto redirect after 5 seconds
        setTimeout(() => {
          navigate('/management');
        }, 5000);

      } catch (error) {
        console.error('Payment processing error:', error);
        nativeNotificationService.error(`Payment processing failed: ${error.message}`);
        setIsProcessing(false);
        
        // Redirect to management page on error
        setTimeout(() => {
          navigate('/management');
        }, 3000);
      }
    };

    if (user) {
      processPayment();
    }
  }, [user, searchParams, upgradePlan, plans, navigate]);

  if (isProcessing) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <FaSpinner className={`text-6xl mx-auto mb-4 animate-spin ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Processing Payment...
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Please wait while we confirm your payment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full mx-4 p-8 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Success Icon */}
        <div className="text-center mb-6">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Payment Successful!
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your subscription has been upgraded successfully
          </p>
        </div>

        {/* Payment Details */}
        {paymentData && (
          <div className={`border rounded-lg p-4 mb-6 ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Payment Details
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Payment ID:</span>
                <span className={`font-mono ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                  {paymentData.paymentId}
                </span>
              </div>
              
              {paymentData.plan && (
                <>
                  <div className="flex justify-between">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Plan:</span>
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                      {paymentData.plan.name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Amount:</span>
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                      R{paymentData.amount}
                    </span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between">
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
                <span className="text-green-600 font-medium">Completed</span>
              </div>
            </div>
          </div>
        )}

        {/* Plan Benefits */}
        {paymentData?.plan && (
          <div className={`border rounded-lg p-4 mb-6 ${isDark ? 'border-purple-700 bg-purple-900/20' : 'border-purple-200 bg-purple-50'}`}>
            <div className="flex items-center mb-3">
              <FaCrown className="text-yellow-500 mr-2" />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your New Benefits
              </h3>
            </div>
            
            <ul className="space-y-1 text-sm">
              <li className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                • Up to {paymentData.plan.features.maxChildren === -1 ? 'unlimited' : paymentData.plan.features.maxChildren} children
              </li>
              <li className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                • {paymentData.plan.features.maxFileSize}MB file uploads
              </li>
              <li className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                • {paymentData.plan.features.storage}MB total storage
              </li>
              {paymentData.plan.features.messaging && (
                <li className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  • Parent-teacher messaging
                </li>
              )}
              {paymentData.plan.features.analytics === 'advanced' && (
                <li className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  • Advanced analytics
                </li>
              )}
            </ul>
          </div>
        )}

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
            Go to Account Management
            <FaArrowRight className="ml-2" />
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Back to Dashboard
          </button>
        </div>

        {/* Auto redirect notice */}
        <p className={`text-center text-xs mt-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          You'll be automatically redirected to Account Management in 5 seconds
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
