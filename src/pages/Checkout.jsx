import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FaCreditCard, FaUniversity, FaMobileAlt, FaLock, FaCheckCircle, FaArrowLeft, FaSpinner, FaTimes } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import nativeNotificationService from '../services/nativeNotificationService.js';
import payfastService from '../services/payfastService';

const Checkout = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { plans, upgradePlan } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'basic';
  
  const [paymentMethod, setPaymentMethod] = useState('payfast');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // User details for PayFast
    firstName: user?.first_name || user?.firstName || '',
    lastName: user?.last_name || user?.lastName || '',
    email: user?.email || '',
    
    // Legacy card fields (for future card-only payments)
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    bankName: '',
    accountNumber: '',
    branchCode: '',
    accountType: 'current',
    phoneNumber: ''
  });

  const selectedPlan = plans[planId];

  useEffect(() => {
    if (!selectedPlan) {
      navigate('/management');
    }
  }, [selectedPlan, navigate]);

  const paymentMethods = [
    {
      id: 'payfast',
      name: 'PayFast (Secure Payment)',
      icon: FaLock,
      description: 'All major cards, EFT, instant transfers',
      popular: true,
      recommended: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card (Direct)',
      icon: FaCreditCard,
      description: 'Visa, Mastercard, American Express',
      popular: false,
      disabled: true, // Disable for now, use PayFast instead
      comingSoon: true
    },
    {
      id: 'eft',
      name: 'Bank Transfer (EFT)',
      icon: FaUniversity,
      description: 'Direct bank transfer',
      popular: false,
      disabled: true,
      comingSoon: true
    },
    {
      id: 'mobile',
      name: 'Mobile Money',
      icon: FaMobileAlt,
      description: 'Coming soon',
      disabled: true,
      comingSoon: true
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      handleInputChange('cardNumber', formatted);
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) { // MM/YY
      handleInputChange('expiryDate', formatted);
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      handleInputChange('cvv', value);
    }
  };

  const validateForm = () => {
    if (paymentMethod === 'payfast') {
      const { firstName, lastName, email } = formData;
      if (!firstName || !lastName || !email) {
        nativeNotificationService.error('Please fill in all required details');
        return false;
      }
      if (!email.includes('@')) {
        nativeNotificationService.error('Please enter a valid email address');
        return false;
      }
    } else if (paymentMethod === 'card') {
      const { cardNumber, expiryDate, cvv, cardholderName } = formData;
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        nativeNotificationService.error('Please fill in all card details');
        return false;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        nativeNotificationService.error('Please enter a valid card number');
        return false;
      }
      if (cvv.length < 3) {
        nativeNotificationService.error('Please enter a valid CVV');
        return false;
      }
    } else if (paymentMethod === 'eft') {
      const { bankName, accountNumber, branchCode } = formData;
      if (!bankName || !accountNumber || !branchCode) {
        nativeNotificationService.error('Please fill in all bank details');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (paymentMethod === 'payfast') {
        // Use PayFast for payment processing
        const subscriptionData = {
          userId: user.id,
          user: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email
          },
          plan: selectedPlan,
          metadata: {
            source: 'checkout_page',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        };

        console.log('Processing PayFast payment for:', {
          user: subscriptionData.user,
          plan: selectedPlan.name,
          amount: selectedPlan.price
        });

        // Process payment through PayFast
        await payfastService.processPayment(subscriptionData);
        
        // The page will redirect to PayFast, so we don't need to do anything else here
        // Payment completion will be handled by the success/cancel pages
        
      } else {
        // Legacy payment processing (for other methods)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const result = await upgradePlan(planId);
        
        if (result.success) {
          nativeNotificationService.success('Payment successful! Welcome to your new plan!');
          navigate('/management?upgraded=true');
        } else {
          throw new Error(result.error?.message || 'Payment failed');
        }
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      nativeNotificationService.error(`Payment failed: ${error.message}`);
      setLoading(false);
    }
  };

  if (!selectedPlan) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <button
              onClick={() => navigate('/management')}
              className={`inline-flex items-center text-sm transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Account Management
            </button>
            
            <button
              onClick={() => navigate('/management')}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Close checkout"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Complete Your Purchase
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Upgrade to {selectedPlan.name} plan
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className={`rounded-lg p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Payment Details
            </h2>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Payment Method
              </h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      disabled={method.disabled}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        method.disabled
                          ? 'opacity-50 cursor-not-allowed'
                          : paymentMethod === method.id
                            ? isDark
                              ? 'border-blue-500 bg-blue-900/20'
                              : 'border-blue-500 bg-blue-50'
                            : isDark
                              ? 'border-gray-600 hover:border-gray-500'
                              : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className={`text-lg ${
                            paymentMethod === method.id && !method.disabled
                              ? 'text-blue-500'
                              : isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <div>
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {method.name}
                              {method.popular && (
                                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {method.description}
                            </div>
                          </div>
                        </div>
                        {paymentMethod === method.id && !method.disabled && (
                          <FaCheckCircle className="text-blue-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmit}>
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={formData.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={handleExpiryChange}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                        CVV
                      </label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={handleCvvChange}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'eft' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                      Bank Name
                    </label>
                    <select
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    >
                      <option value="">Select your bank</option>
                      <option value="fnb">FNB</option>
                      <option value="standard">Standard Bank</option>
                      <option value="absa">ABSA</option>
                      <option value="nedbank">Nedbank</option>
                      <option value="capitec">Capitec</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="1234567890"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                      Branch Code
                    </label>
                    <input
                      type="text"
                      value={formData.branchCode}
                      onChange={(e) => handleInputChange('branchCode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="123456"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/management')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  } text-white`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Pay R${selectedPlan.price} / ${selectedPlan.period}`
                  )}
                </button>
              </div>

              {/* Security Notice */}
              <div className={`mt-4 flex items-center justify-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <FaLock className="w-4 h-4 mr-2" />
                Your payment information is secure and encrypted
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className={`rounded-lg p-6 shadow-lg h-fit ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Order Summary
            </h2>
            
            <div className={`p-4 rounded-lg border ${
              isDark ? 'bg-purple-900/20 border-purple-700/30' : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedPlan.name} Plan
                </h3>
                {selectedPlan.popular && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    ⭐ Most Popular
                  </span>
                )}
              </div>
              
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedPlan.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Plan price</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    R{selectedPlan.price}/{selectedPlan.period}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Setup fee</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    R0
                  </span>
                </div>
                <hr className={`my-2 ${isDark ? 'border-gray-600' : 'border-gray-200'}`} />
                <div className="flex justify-between">
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Total</span>
                  <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    R{selectedPlan.price}
                  </span>
                </div>
              </div>
              
              <div className={`text-xs p-3 rounded ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  • Billing cycle starts immediately<br />
                  • Cancel anytime before next billing<br />
                  • 7-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
