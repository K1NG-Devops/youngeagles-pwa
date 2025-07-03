import React, { useState } from 'react';
import { FaCreditCard, FaUpload, FaFileInvoice, FaHistory, FaShieldAlt, FaStar, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTheme } from '../hooks/useTheme';

const Management = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('subscription');

  // Subscription data - would be fetched from API in production
  const [subscriptionInfo] = useState({
    plan: 'Premium',
    status: 'Active',
    nextBilling: '2025-08-02',
    amount: 'R199/month',
    features: ['Unlimited homework tracking', 'Priority support', 'Advanced analytics', 'File uploads up to 50MB']
  });

  const tabs = [
    { id: 'subscription', label: 'Subscription', icon: FaCrown },
    { id: 'payments', label: 'Payments', icon: FaCreditCard },
    { id: 'proofs', label: 'Payment Proofs', icon: FaUpload },
    { id: 'invoices', label: 'Invoices', icon: FaFileInvoice },
    { id: 'history', label: 'History', icon: FaHistory }
  ];

  const plans = [
    {
      name: 'Basic',
      price: 'R99',
      period: 'month',
      features: ['Up to 2 children', 'Basic homework tracking', 'Email support', '10MB file uploads'],
      current: false
    },
    {
      name: 'Premium',
      price: 'R199',
      period: 'month',
      features: ['Up to 5 children', 'Advanced homework tracking', 'Priority support', '50MB file uploads', 'Progress analytics'],
      current: true,
      popular: true
    },
    {
      name: 'Family',
      price: 'R299',
      period: 'month',
      features: ['Unlimited children', 'All premium features', '24/7 phone support', '100MB file uploads', 'Custom reports'],
      current: false
    }
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // TODO: Implement actual file upload to server
      toast.success(`Payment proof "${file.name}" uploaded successfully!`);
    }
  };

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      {/* Current Subscription */}
      <div className={`rounded-lg p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Current Subscription</h3>
        <div className={`rounded-lg p-4 border ${
          isDark 
            ? 'bg-blue-900/20 border-blue-700/30' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FaCrown className="text-yellow-500" />
              <span className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{subscriptionInfo.plan} Plan</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                {subscriptionInfo.status}
              </span>
            </div>
            <div className="text-right">
              <div className={`font-bold text-xl ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{subscriptionInfo.amount}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Next billing: {subscriptionInfo.nextBilling}</div>
            </div>
          </div>
          <div className="space-y-1">
            {subscriptionInfo.features.map((feature, index) => (
              <div key={index} className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaStar className="text-yellow-400 text-xs" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className={`rounded-lg p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Change Plan</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, index) => (
            <div key={index} className={`border rounded-lg p-4 relative transition-all ${
              plan.current 
                ? isDark 
                  ? 'border-blue-400 bg-blue-900/20' 
                  : 'border-blue-500 bg-blue-50'
                : isDark 
                  ? 'border-gray-600 bg-gray-700/50' 
                  : 'border-gray-200 bg-white'
            } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-4">
                <h4 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h4>
                <div className="mt-2">
                  <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>/{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <FaStar className="text-yellow-400 text-xs" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  plan.current
                    ? isDark 
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : isDark
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={plan.current}
                onClick={() => toast.info(`Upgrading to ${plan.name} plan...`)}
              >
                {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPaymentProofsTab = () => (
    <div className="space-y-6">
      <div className={`rounded-lg p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Upload Payment Proof</h3>
        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDark 
            ? 'border-gray-600 bg-gray-700/30 hover:border-gray-500' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}>
          <FaUpload className={`mx-auto text-4xl mb-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Upload proof of payment (PNG, JPG, PDF)</p>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="payment-proof"
          />
          <label
            htmlFor="payment-proof"
            className={`inline-block py-2 px-4 rounded-lg font-medium cursor-pointer transition-colors ${
              isDark 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Choose File
          </label>
        </div>
      </div>

      <div className={`rounded-lg p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Uploads</h3>
        <div className="space-y-3">
          {[
            { name: 'Payment_July_2025.pdf', date: '2025-07-01', status: 'Verified' },
            { name: 'Bank_Transfer_June.jpg', date: '2025-06-01', status: 'Pending' }
          ].map((file, index) => (
            <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
              isDark ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3">
                <FaFileInvoice className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{file.name}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{file.date}</div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                file.status === 'Verified' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {file.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderComingSoonTab = () => (
    <div className={`rounded-lg p-6 shadow-lg text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <FaShieldAlt className={`mx-auto text-6xl mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
      <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Coming Soon</h3>
      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>This feature is under development and will be available soon.</p>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Management</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage your subscription, payments, and account settings</p>
        </div>

        {/* Tabs */}
        <div className={`border-b mb-6 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? isDark 
                        ? 'border-blue-400 text-blue-400'
                        : 'border-blue-500 text-blue-600'
                      : isDark
                        ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'subscription' && renderSubscriptionTab()}
        {activeTab === 'proofs' && renderPaymentProofsTab()}
        {['payments', 'invoices', 'history'].includes(activeTab) && renderComingSoonTab()}
      </div>
    </div>
  );
};

export default Management;
