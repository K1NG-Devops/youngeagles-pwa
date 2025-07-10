import React, { useState, useEffect, useCallback } from 'react';
import { FaCreditCard, FaUpload, FaFileInvoice, FaHistory, FaShieldAlt, FaStar, FaCrown, FaPaperPlane, FaEnvelope, FaReceipt, FaUsers } from 'react-icons/fa';
import nativeNotificationService from '../services/nativeNotificationService.js';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const Management = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { subscription, getCurrentPlan, getDaysRemaining, plans, updateUsage } = useSubscription();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subscription');
  const [actualChildrenCount, setActualChildrenCount] = useState(0);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  
  // Invoice/Receipt functionality state
  const [invoiceData, setInvoiceData] = useState({
    recipients: [],
    subject: '',
    message: '',
    invoiceType: 'invoice', // 'invoice' or 'receipt'
    amount: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, price: 0 }]
  });
  const [allUsers, setAllUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);

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
    ...((user?.role === 'admin' || user?.userType === 'admin') ? [{ id: 'send-invoices', label: 'Send Invoices/Receipts', icon: FaPaperPlane }] : []),
    { id: 'history', label: 'History', icon: FaHistory }
  ];

  // Fetch actual children count and sync with subscription usage
  useEffect(() => {
    const fetchAndSyncChildrenCount = async () => {
      if (!user) return;
      
      try {
        setIsLoadingChildren(true);
        let response;
        
        if (user.role === 'parent') {
          response = await apiService.children.getByParent(user.id);
        } else {
          response = await apiService.children.getAll();
        }
        
        const childrenCount = response.data.children?.length || 0;
        setActualChildrenCount(childrenCount);
        
        // Sync with subscription usage if different
        if (subscription && subscription.usage.children !== childrenCount) {
          updateUsage({ children: childrenCount });
        }
      } catch (error) {
        console.error('Error fetching children for usage sync:', error);
        // Don't show error toast as this is background sync
      } finally {
        setIsLoadingChildren(false);
      }
    };

    fetchAndSyncChildrenCount();
  }, [user, subscription, updateUsage]);


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // TODO: Implement actual file upload to server
      nativeNotificationService.success(`Payment proof "${file.name}" uploaded successfully!`);
    }
  };

  // Load all users for invoice/receipt functionality
  const loadAllUsers = useCallback(async () => {
    if (user?.role !== 'admin' && user?.userType !== 'admin') return;
    
    try {
      setIsLoadingUsers(true);
      const response = await apiService.users.getAll();
      setAllUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      nativeNotificationService.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [user]);

  // Handle invoice/receipt form changes
  const handleInvoiceChange = (field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new item to invoice
  const addInvoiceItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, price: 0 }]
    }));
  };

  // Remove item from invoice
  const removeInvoiceItem = (index) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update invoice item
  const updateInvoiceItem = (index, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Calculate total amount
  const calculateTotal = () => {
    return invoiceData.items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0).toFixed(2);
  };

  // Send invoice/receipt
  const sendInvoiceReceipt = async () => {
    if (!invoiceData.recipients.length) {
      nativeNotificationService.error('Please select at least one recipient');
      return;
    }

    if (!invoiceData.subject.trim()) {
      nativeNotificationService.error('Please enter a subject');
      return;
    }

    try {
      setIsSendingInvoice(true);
      
      const invoicePayload = {
        ...invoiceData,
        totalAmount: calculateTotal(),
        sentBy: user.id,
        sentAt: new Date().toISOString()
      };

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      nativeNotificationService.success(`${invoiceData.invoiceType === 'invoice' ? 'Invoice' : 'Receipt'} sent successfully to ${invoiceData.recipients.length} recipient(s)!`);
      
      // Reset form
      setInvoiceData({
        recipients: [],
        subject: '',
        message: '',
        invoiceType: 'invoice',
        amount: '',
        dueDate: '',
        items: [{ description: '', quantity: 1, price: 0 }]
      });
      
    } catch (error) {
      console.error('Error sending invoice/receipt:', error);
      nativeNotificationService.error('Failed to send invoice/receipt');
    } finally {
      setIsSendingInvoice(false);
    }
  };

  // Load users when admin accesses invoice tab
  useEffect(() => {
    if (activeTab === 'send-invoices' && (user?.role === 'admin' || user?.userType === 'admin')) {
      loadAllUsers();
    }
  }, [activeTab, user, loadAllUsers]);

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
              {isLoadingChildren ? (
                <div className="animate-pulse">-</div>
              ) : (
                `${actualChildrenCount}/${currentPlan?.features.maxChildren === -1 ? '∞' : currentPlan?.features.maxChildren}`
              )}
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

  const renderSendInvoicesTab = () => (
    <div className="space-y-6">
      {/* Invoice/Receipt Type Selection */}
      <div className={`rounded-lg p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Send Invoice/Receipt</h3>
        
        {/* Type Selection */}
        <div className="mb-6">
          <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Document Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['invoice', 'receipt'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleInvoiceChange('invoiceType', type)}
                className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  invoiceData.invoiceType === type
                    ? isDark
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : isDark
                      ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border-2 border-gray-600'
                      : 'bg-gray-100/50 text-gray-600 hover:bg-gray-200/50 border-2 border-gray-200'
                }`}
                disabled={isSendingInvoice}
              >
                {type === 'invoice' ? '📄 Invoice' : '🧾 Receipt'}
              </button>
            ))}
          </div>
        </div>

        {/* Recipients */}
        <div className="mb-6">
          <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Recipients *
          </label>
          {isLoadingUsers ? (
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading users...</p>
            </div>
          ) : (
            <div className={`max-h-40 overflow-y-auto border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50'}`}>
              {allUsers.map((user) => (
                <label key={user.id} className={`flex items-center p-3 hover:bg-opacity-50 cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                }`}>
                  <input
                    type="checkbox"
                    checked={invoiceData.recipients.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInvoiceChange('recipients', [...invoiceData.recipients, user.id]);
                      } else {
                        handleInvoiceChange('recipients', invoiceData.recipients.filter(id => id !== user.id));
                      }
                    }}
                    className="mr-3 rounded"
                    disabled={isSendingInvoice}
                  />
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user.email} ({user.role})</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Subject */}
        <div className="mb-6">
          <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Subject *
          </label>
          <input
            type="text"
            value={invoiceData.subject}
            onChange={(e) => handleInvoiceChange('subject', e.target.value)}
            placeholder={`Enter ${invoiceData.invoiceType} subject`}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
              isDark 
                ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            disabled={isSendingInvoice}
          />
        </div>

        {/* Items */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Items/Services
            </label>
            <button
              type="button"
              onClick={addInvoiceItem}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                isDark 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={isSendingInvoice}
            >
              + Add Item
            </button>
          </div>
          
          <div className="space-y-3">
            {invoiceData.items.map((item, index) => (
              <div key={index} className={`p-4 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50'}`}>
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                      className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      disabled={isSendingInvoice}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      placeholder="Qty"
                      min="1"
                      className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      disabled={isSendingInvoice}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateInvoiceItem(index, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="Price (R)"
                      step="0.01"
                      min="0"
                      className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      disabled={isSendingInvoice}
                    />
                  </div>
                  <div className="col-span-2 text-center">
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      R{(item.quantity * item.price).toFixed(2)}
                    </div>
                    {invoiceData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInvoiceItem(index)}
                        className="text-red-500 hover:text-red-700 text-xs mt-1"
                        disabled={isSendingInvoice}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Total */}
          <div className={`mt-4 p-4 rounded-lg text-right ${isDark ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'}`}>
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Total: R{calculateTotal()}
            </div>
          </div>
        </div>

        {/* Due Date (for invoices only) */}
        {invoiceData.invoiceType === 'invoice' && (
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Due Date
            </label>
            <input
              type="date"
              value={invoiceData.dueDate}
              onChange={(e) => handleInvoiceChange('dueDate', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                isDark 
                  ? 'bg-gray-700/50 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              disabled={isSendingInvoice}
            />
          </div>
        )}

        {/* Message */}
        <div className="mb-6">
          <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Additional Message (Optional)
          </label>
          <textarea
            value={invoiceData.message}
            onChange={(e) => handleInvoiceChange('message', e.target.value)}
            placeholder="Add any additional notes or instructions..."
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
              isDark 
                ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            disabled={isSendingInvoice}
          />
        </div>

        {/* Send Button */}
        <div className="flex justify-end">
          <button
            onClick={sendInvoiceReceipt}
            disabled={isSendingInvoice || !invoiceData.recipients.length || !invoiceData.subject.trim()}
            className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all transform hover:scale-105 ${
              isSendingInvoice || !invoiceData.recipients.length || !invoiceData.subject.trim()
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
            }`}
          >
            {isSendingInvoice ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <FaPaperPlane />
                <span>Send {invoiceData.invoiceType === 'invoice' ? 'Invoice' : 'Receipt'}</span>
              </>
            )}
          </button>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pt-20 md:pt-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Management</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage your subscription, payments, and account settings</p>
        </div>

        {/* Tabs */}
        <div className={`border-b mb-6 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="overflow-x-auto scrollbar-hide">
            <nav className="flex space-x-8 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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
        </div>

        {/* Tab Content */}
        {activeTab === 'subscription' && renderSubscriptionTab()}
        {activeTab === 'proofs' && renderPaymentProofsTab()}
        {activeTab === 'send-invoices' && renderSendInvoicesTab()}
        {['payments', 'invoices', 'history'].includes(activeTab) && renderComingSoonTab()}
      </div>
    </div>
  );
};

export default Management;
