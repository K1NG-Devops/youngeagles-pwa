import React, { useState } from 'react';
import { FaCreditCard, FaUpload, FaFileInvoice, FaHistory, FaShieldAlt, FaStar, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

const Management = () => {
  const { isDark } = useTheme();
  const { subscription, getCurrentPlan, getDaysRemaining, plans } = useSubscription();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subscription');

  // Get current subscription info
  const currentPlan = getCurrentPlan();
  const daysRemaining = getDaysRemaining();
  const subscriptionInfo = {
    plan: currentPlan?.name || 'Basic',
    status: subscription?.status === 'active' ? 'Active' : subscription?.status === 'trial' ? 'Trial' : 'Inactive',
    nextBilling: subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A',
    amount: `R${currentPlan?.price}/${currentPlan?.period}`,
    features: [
      `Up to ${currentPlan?.features.maxChildren === -1 ? 'unlimited' : currentPlan?.features.maxChildren} children`,
      `${currentPlan?.features.maxFileSize}MB file uploads`,
      `${currentPlan?.features.storage}MB storage`,
      currentPlan?.features.messaging ? 'Parent-teacher messaging' : 'Basic communication',
      currentPlan?.features.analytics === 'advanced' ? 'Advanced analytics' : 'Basic progress reports'
    ]
  };

  const tabs = [
    { id: 'subscription', label: 'Subscription', icon: FaCrown },
    { id: 'payments', label: 'Payments', icon: FaCreditCard },
    { id: 'proofs', label: 'Payment Proofs', icon: FaUpload },
    { id: 'invoices', label: 'Invoices', icon: FaFileInvoice },
    { id: 'history', label: 'History', icon: FaHistory }
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
            ? 'bg-purple-900/20 border-purple-700/30' 
            : 'bg-purple-50 border-purple-200'
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
              <div className={`font-bold text-xl ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{subscriptionInfo.amount}</div>
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

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              {subscription?.usage?.children || 0}/{currentPlan?.features.maxChildren === -1 ? '∞' : currentPlan?.features.maxChildren}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Children Added</div>
          </div>
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {subscription?.usage?.storage || 0}MB
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Storage Used ({currentPlan?.features.storage}MB limit)
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{daysRemaining} days</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Days Remaining</div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className={`rounded-lg p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Change Plan</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {Object.values(plans).map((plan, index) => {
            const isCurrentPlan = plan.id === currentPlan?.id;
            const colorClasses = isCurrentPlan 
              ? isDark ? 'border-purple-400 bg-purple-900/20' : 'border-purple-500 bg-purple-50'
              : isDark ? 'border-gray-600 bg-gray-700/50 hover:border-purple-500' : 'border-gray-200 bg-white hover:border-purple-300';
            
            return (
              <div key={index} className={`border rounded-xl p-6 relative transition-all transform hover:scale-105 ${
                colorClasses
              } ${plan.popular ? 'ring-2 ring-purple-500 shadow-lg' : 'shadow-md'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-medium shadow-lg">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h4 className={`font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h4>
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{plan.description}</p>
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>R{plan.price}</span>
                    <span className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>/{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h5 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>What's included:</h5>
                  <ul className="space-y-2">
                    <li className={`flex items-start space-x-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <FaStar className="text-green-500 text-xs mt-1 flex-shrink-0" />
                      <span>Up to {plan.features.maxChildren === -1 ? 'unlimited' : plan.features.maxChildren} children</span>
                    </li>
                    <li className={`flex items-start space-x-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <FaStar className="text-green-500 text-xs mt-1 flex-shrink-0" />
                      <span>{plan.features.maxFileSize}MB file uploads</span>
                    </li>
                    <li className={`flex items-start space-x-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <FaStar className="text-green-500 text-xs mt-1 flex-shrink-0" />
                      <span>{plan.features.storage}MB total storage</span>
                    </li>
                    <li className={`flex items-start space-x-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <FaStar className="text-green-500 text-xs mt-1 flex-shrink-0" />
                      <span>{plan.features.messaging ? 'Parent-teacher messaging' : 'Basic communication'}</span>
                    </li>
                    <li className={`flex items-start space-x-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <FaStar className="text-green-500 text-xs mt-1 flex-shrink-0" />
                      <span>{plan.features.analytics === 'advanced' ? 'Advanced analytics' : plan.features.analytics === 'enterprise' ? 'Enterprise analytics' : 'Basic analytics'}</span>
                    </li>
                  </ul>
                </div>


                <button 
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    isCurrentPlan
                      ? isDark 
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                  }`}
                  disabled={isCurrentPlan}
                  onClick={() => {
                    if (!isCurrentPlan) {
                      navigate(`/checkout?plan=${plan.id}`);
                    }
                  }}
                >
                  {isCurrentPlan ? '✅ Current Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
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
