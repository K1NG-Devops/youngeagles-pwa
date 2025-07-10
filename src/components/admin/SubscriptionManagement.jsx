import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaUser, 
  FaCrown, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaEdit, 
  FaTrash, 
  FaPlus,
  FaHistory,
  FaRefresh,
  FaDownload,
  FaSearch,
  FaFilter,
  FaChartBar
} from 'react-icons/fa';
import apiService from '../../services/apiService';
import nativeNotificationService from '../../services/nativeNotificationService';

const SubscriptionManagement = () => {
  const { isDark } = useTheme();
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchTerm, statusFilter, planFilter]);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
            
      // Load subscriptions and stats
      const [subscriptionsRes, statsRes] = await Promise.all([
        apiService.subscriptions.admin.getAllSubscriptions(100, 0),
        apiService.subscriptions.admin.getStats()
      ]);
            
      setSubscriptions(subscriptionsRes.data.subscriptions || []);
      setStats(statsRes.data.stats);
            
    } catch (error) {
      console.error('Error loading subscription data:', error);
      nativeNotificationService.error('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubscriptions = () => {
    let filtered = subscriptions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sub.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sub.plan_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(sub => sub.plan_id === planFilter);
    }

    setFilteredSubscriptions(filtered);
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (subscriptionId, newStatus, reason = null) => {
    try {
      await apiService.subscriptions.admin.updateSubscriptionStatus(
        subscriptionId, 
        newStatus, 
        reason
      );
            
      nativeNotificationService.success('Subscription status updated successfully');
      loadSubscriptionData();
            
    } catch (error) {
      console.error('Error updating subscription status:', error);
      nativeNotificationService.error('Failed to update subscription status');
    }
  };

  const handleCreateManualSubscription = async (data) => {
    try {
      await apiService.subscriptions.admin.createManualSubscription(data);
      nativeNotificationService.success('Manual subscription created successfully');
      setShowCreateModal(false);
      loadSubscriptionData();
    } catch (error) {
      console.error('Error creating manual subscription:', error);
      nativeNotificationService.error('Failed to create manual subscription');
    }
  };

  const exportSubscriptions = () => {
    const csvData = filteredSubscriptions.map(sub => ({
      'User Email': sub.user_email,
      'Plan': sub.plan_name,
      'Status': sub.status,
      'Start Date': new Date(sub.subscription_start_date).toLocaleDateString(),
      'End Date': new Date(sub.subscription_end_date).toLocaleDateString(),
      'Monthly Price': sub.price_monthly,
      'Annual Price': sub.price_annual,
      'Payment Method': sub.payment_method,
      'Auto Renew': sub.auto_renew ? 'Yes' : 'No'
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Subscription Management
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={exportSubscriptions}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <FaDownload className="inline mr-2" />
                            Export
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <FaPlus className="inline mr-2" />
                            Create Manual Subscription
            </button>
            <button
              onClick={loadSubscriptionData}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <FaRefresh className="inline mr-2" />
                            Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Subscriptions"
              value={stats.total_subscriptions}
              icon={FaUser}
              color="blue"
            />
            <StatCard
              title="Active Subscriptions"
              value={stats.active_subscriptions}
              icon={FaCrown}
              color="green"
            />
            <StatCard
              title="Monthly Revenue"
              value={`R${stats.monthly_recurring_revenue?.toFixed(2) || '0.00'}`}
              icon={FaMoneyBillWave}
              color="purple"
            />
            <StatCard
              title="Avg Revenue Per User"
              value={`R${stats.average_revenue_per_user?.toFixed(2) || '0.00'}`}
              icon={FaChartBar}
              color="yellow"
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search by email, name, or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
                    
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
            <option value="trial">Trial</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="student">Student</option>
            <option value="family">Family</option>
            <option value="institution">Institution</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className={`rounded-lg border overflow-hidden ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>
                                    User
                </th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>
                                    Plan
                </th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>
                                    Status
                </th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>
                                    Dates
                </th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>
                                    Billing
                </th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>
                                    Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentSubscriptions.map((subscription) => (
                <SubscriptionRow
                  key={subscription.id}
                  subscription={subscription}
                  onUpdateStatus={handleUpdateStatus}
                  onViewDetails={setSelectedSubscription}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`px-4 py-3 border-t ${
            isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                                Showing {startIndex + 1}-{Math.min(endIndex, filteredSubscriptions.length)} of {filteredSubscriptions.length} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded border disabled:opacity-50 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                                    Previous
                </button>
                <span className={`px-3 py-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded border disabled:opacity-50 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                                    Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateSubscriptionModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateManualSubscription}
        />
      )}

      {selectedSubscription && (
        <SubscriptionDetailsModal
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
          onUpdate={handleUpdateStatus}
          onRefresh={loadSubscriptionData}
        />
      )}
    </div>
  );
};

// Stats Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const { isDark } = useTheme();
    
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20',
    green: 'text-green-500 bg-green-100 dark:bg-green-900/20',
    purple: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20',
    yellow: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20'
  };

  return (
    <div className={`p-4 rounded-lg border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="text-lg" />
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {title}
          </p>
          <p className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// Subscription Row Component
const SubscriptionRow = ({ subscription, onUpdateStatus, onViewDetails }) => {
  const { isDark } = useTheme();
    
  const getStatusColor = (status) => {
    switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    case 'cancelled':
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    case 'expired':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
    case 'suspended':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    case 'trial':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  return (
    <tr className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
      <td className="px-4 py-3">
        <div>
          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {subscription.user_name || 'Unknown User'}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {subscription.user_email || `User ID: ${subscription.user_id}`}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
          subscription.plan_id === 'institution' 
            ? 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20'
            : subscription.plan_id === 'family'
              ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
              : subscription.plan_id === 'student'
                ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
        }`}>
          {subscription.plan_name}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
          {subscription.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
          <div>Start: {new Date(subscription.subscription_start_date).toLocaleDateString()}</div>
          <div>End: {new Date(subscription.subscription_end_date).toLocaleDateString()}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
          <div>R{subscription.billing_cycle === 'monthly' ? subscription.price_monthly : subscription.price_annual}</div>
          <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {subscription.billing_cycle} | {subscription.payment_method}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(subscription)}
            className="text-blue-500 hover:text-blue-600"
          >
            <FaEdit />
          </button>
          <select
            value={subscription.status}
            onChange={(e) => onUpdateStatus(subscription.id, e.target.value)}
            className={`text-xs px-2 py-1 rounded border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-gray-300' 
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
            <option value="trial">Trial</option>
          </select>
        </div>
      </td>
    </tr>
  );
};

// Create Subscription Modal (placeholder - would need full implementation)
const CreateSubscriptionModal = ({ onClose, onCreate }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    userId: '',
    planId: 'student',
    billingCycle: 'monthly',
    duration: 30
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative max-w-md w-full mx-4 p-6 rounded-xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Create Manual Subscription
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="User ID"
            value={formData.userId}
            onChange={(e) => setFormData({...formData, userId: e.target.value})}
            className={`w-full px-3 py-2 rounded border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
            required
          />
          <select
            value={formData.planId}
            onChange={(e) => setFormData({...formData, planId: e.target.value})}
            className={`w-full px-3 py-2 rounded border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="student">Student Plan</option>
            <option value="family">Family Plan</option>
            <option value="institution">Institution Plan</option>
          </select>
          <input
            type="number"
            placeholder="Duration (days)"
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
            className={`w-full px-3 py-2 rounded border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
            required
          />
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded bg-gray-500 text-white"
            >
                            Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded bg-blue-500 text-white"
            >
                            Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Subscription Details Modal (placeholder)
const SubscriptionDetailsModal = ({ subscription, onClose, onUpdate, onRefresh }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-w-2xl w-full mx-4 p-6 rounded-xl bg-white dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4">Subscription Details</h2>
        <p>Detailed view for subscription {subscription.id}</p>
        <button
          onClick={onClose}
          className="mt-4 py-2 px-4 rounded bg-blue-500 text-white"
        >
                    Close
        </button>
      </div>
    </div>
  );
};

export default SubscriptionManagement; 