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
  FaSync,
  FaDownload,
  FaSearch,
  FaFilter,
  FaChartBar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaEye,
  FaUserCheck,
  FaUserTimes,
  FaChartLine,
  FaGift,
  FaPercent
} from 'react-icons/fa';
import apiService from '../../services/apiService';
import nativeNotificationService from '../../services/nativeNotificationService';

const EnhancedSubscriptionManagement = () => {
  const { isDark } = useTheme();
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 20;

  // Real-time subscription analytics
  const [revenueMetrics, setRevenueMetrics] = useState({
    totalRevenue: 0,
    monthlyRecurring: 0,
    annualRecurring: 0,
    averageRevenue: 0,
    churnRate: 0,
    growthRate: 0,
    lifetimeValue: 0,
    conversionRate: 0
  });

  const [upcomingRenewals, setUpcomingRenewals] = useState([]);
  const [expiringTrials, setExpiringTrials] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadSubscriptionData();
    loadAnalytics();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadSubscriptionData();
      loadAnalytics();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchTerm, statusFilter, planFilter, dateRangeFilter, sortField, sortDirection]);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      
      // Load comprehensive subscription data
      const [subscriptionsRes, statsRes, renewalsRes, trialsRes, activityRes] = await Promise.all([
        apiService.subscriptions.admin.getAllSubscriptions(1000, 0, {
          sort: sortField,
          direction: sortDirection,
          include_analytics: true
        }),
        apiService.subscriptions.admin.getStats(),
        apiService.subscriptions.admin.getUpcomingRenewals(30), // Next 30 days
        apiService.subscriptions.admin.getExpiringTrials(7), // Next 7 days
        apiService.subscriptions.admin.getRecentActivity(50)
      ]);
      
      setSubscriptions(subscriptionsRes.data.subscriptions || []);
      setStats(statsRes.data.stats);
      setUpcomingRenewals(renewalsRes.data.renewals || []);
      setExpiringTrials(trialsRes.data.trials || []);
      setRecentActivity(activityRes.data.activity || []);
      
    } catch (error) {
      console.error('Error loading subscription data:', error);
      nativeNotificationService.error('Failed to load subscription data');
      
      // Fallback to mock data for development
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsRes = await apiService.subscriptions.admin.getAnalytics({
        period: '30d',
        include_predictions: true
      });
      
      setAnalytics(analyticsRes.data.analytics);
      setRevenueMetrics(analyticsRes.data.revenue_metrics);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Use mock analytics data
      setRevenueMetrics({
        totalRevenue: 12450.00,
        monthlyRecurring: 8750.00,
        annualRecurring: 3700.00,
        averageRevenue: 45.50,
        churnRate: 2.3,
        growthRate: 12.5,
        lifetimeValue: 245.00,
        conversionRate: 8.7
      });
    }
  };

  const loadMockData = () => {
    // Mock data for development
    const mockSubscriptions = [
      {
        id: 1,
        user_id: 101,
        user_name: 'John Smith',
        user_email: 'john.smith@example.com',
        plan_id: 'family',
        plan_name: 'Family Plan',
        status: 'active',
        billing_cycle: 'monthly',
        price_monthly: 29.99,
        price_annual: 299.99,
        subscription_start_date: '2024-01-01',
        subscription_end_date: '2024-02-01',
        payment_method: 'credit_card',
        auto_renew: true,
        trial_end_date: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        user_id: 102,
        user_name: 'Mary Johnson',
        user_email: 'mary.johnson@example.com',
        plan_id: 'student',
        plan_name: 'Student Plan',
        status: 'trial',
        billing_cycle: 'monthly',
        price_monthly: 19.99,
        price_annual: 199.99,
        subscription_start_date: '2024-01-15',
        subscription_end_date: '2024-02-15',
        payment_method: 'payfast',
        auto_renew: false,
        trial_end_date: '2024-01-29',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      }
    ];

    setSubscriptions(mockSubscriptions);
    setStats({
      total_subscriptions: 2,
      active_subscriptions: 1,
      trial_subscriptions: 1,
      cancelled_subscriptions: 0,
      monthly_recurring_revenue: 29.99,
      annual_recurring_revenue: 0,
      average_revenue_per_user: 24.99,
      churn_rate: 0,
      growth_rate: 100
    });
  };

  const filterSubscriptions = () => {
    let filtered = [...subscriptions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.plan_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.id.toString().includes(searchTerm)
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

    // Date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRangeFilter) {
      case '7d':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        filterDate.setDate(now.getDate() - 90);
        break;
      default:
        break;
      }
      
      if (dateRangeFilter !== 'all') {
        filtered = filtered.filter(sub => new Date(sub.created_at) >= filterDate);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField.includes('date')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredSubscriptions(filtered);
    setCurrentPage(1);
  };

  const handleBulkAction = async (action) => {
    if (selectedSubscriptions.length === 0) {
      nativeNotificationService.warning('Please select subscriptions to perform bulk action');
      return;
    }

    try {
      switch (action) {
      case 'activate':
        await apiService.subscriptions.admin.bulkUpdateStatus(selectedSubscriptions, 'active');
        nativeNotificationService.success(`${selectedSubscriptions.length} subscriptions activated`);
        break;
      case 'suspend':
        await apiService.subscriptions.admin.bulkUpdateStatus(selectedSubscriptions, 'suspended');
        nativeNotificationService.success(`${selectedSubscriptions.length} subscriptions suspended`);
        break;
      case 'cancel':
        await apiService.subscriptions.admin.bulkUpdateStatus(selectedSubscriptions, 'cancelled');
        nativeNotificationService.success(`${selectedSubscriptions.length} subscriptions cancelled`);
        break;
      case 'extend':
        // Show extend modal
        setShowBulkExtendModal(true);
        return;
      default:
        break;
      }
      
      setSelectedSubscriptions([]);
      loadSubscriptionData();
      
    } catch (error) {
      console.error('Error performing bulk action:', error);
      nativeNotificationService.error('Failed to perform bulk action');
    }
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
      'ID': sub.id,
      'User Email': sub.user_email,
      'User Name': sub.user_name,
      'Plan': sub.plan_name,
      'Status': sub.status,
      'Billing Cycle': sub.billing_cycle,
      'Monthly Price': sub.price_monthly,
      'Annual Price': sub.price_annual,
      'Start Date': new Date(sub.subscription_start_date).toLocaleDateString(),
      'End Date': new Date(sub.subscription_end_date).toLocaleDateString(),
      'Payment Method': sub.payment_method,
      'Auto Renew': sub.auto_renew ? 'Yes' : 'No',
      'Trial End': sub.trial_end_date ? new Date(sub.trial_end_date).toLocaleDateString() : 'N/A',
      'Created': new Date(sub.created_at).toLocaleDateString(),
      'Updated': new Date(sub.updated_at).toLocaleDateString()
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
            Enhanced Subscription Management
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
              <FaSync className="inline mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <EnhancedStatCard
              title="Total Subscriptions"
              value={stats.total_subscriptions}
              icon={FaUser}
              color="blue"
              trend={stats.growth_rate}
              subtitle={`${stats.active_subscriptions} active`}
            />
            <EnhancedStatCard
              title="Monthly Revenue"
              value={`R${revenueMetrics.monthlyRecurring?.toFixed(2) || '0.00'}`}
              icon={FaMoneyBillWave}
              color="green"
              trend={revenueMetrics.growthRate}
              subtitle={`R${revenueMetrics.averageRevenue?.toFixed(2) || '0.00'} avg/user`}
            />
            <EnhancedStatCard
              title="Churn Rate"
              value={`${revenueMetrics.churnRate?.toFixed(1) || '0.0'}%`}
              icon={FaChartLine}
              color="red"
              trend={-revenueMetrics.churnRate}
              subtitle="Last 30 days"
            />
            <EnhancedStatCard
              title="Conversion Rate"
              value={`${revenueMetrics.conversionRate?.toFixed(1) || '0.0'}%`}
              icon={FaPercent}
              color="purple"
              trend={revenueMetrics.conversionRate}
              subtitle="Trial to paid"
            />
          </div>
        )}

        {/* Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <QuickInsightCard
            title="Upcoming Renewals"
            value={upcomingRenewals.length}
            icon={FaCalendarAlt}
            color="blue"
            subtitle="Next 30 days"
            onClick={() => setShowUpcomingRenewals(true)}
          />
          <QuickInsightCard
            title="Expiring Trials"
            value={expiringTrials.length}
            icon={FaClock}
            color="orange"
            subtitle="Next 7 days"
            onClick={() => setShowExpiringTrials(true)}
          />
          <QuickInsightCard
            title="Lifetime Value"
            value={`R${revenueMetrics.lifetimeValue?.toFixed(0) || '0'}`}
            icon={FaGift}
            color="green"
            subtitle="Average LTV"
          />
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search by email, name, plan, or ID..."
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
            <option value="trial">Trial</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
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

          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedSubscriptions.length > 0 && (
          <div className={`p-4 rounded-lg border mb-4 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${isDark ? 'text-white' : 'text-blue-900'}`}>
                {selectedSubscriptions.length} subscriptions selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                >
                  Suspend
                </button>
                <button
                  onClick={() => handleBulkAction('cancel')}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setSelectedSubscriptions([])}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Subscriptions Table */}
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
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubscriptions(currentSubscriptions.map(sub => sub.id));
                      } else {
                        setSelectedSubscriptions([]);
                      }
                    }}
                    checked={selectedSubscriptions.length === currentSubscriptions.length && currentSubscriptions.length > 0}
                  />
                </th>
                <SortableHeader
                  field="user_email"
                  label="User"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={(field, direction) => {
                    setSortField(field);
                    setSortDirection(direction);
                  }}
                />
                <SortableHeader
                  field="plan_name"
                  label="Plan"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={(field, direction) => {
                    setSortField(field);
                    setSortDirection(direction);
                  }}
                />
                <SortableHeader
                  field="status"
                  label="Status"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={(field, direction) => {
                    setSortField(field);
                    setSortDirection(direction);
                  }}
                />
                <SortableHeader
                  field="subscription_start_date"
                  label="Dates"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={(field, direction) => {
                    setSortField(field);
                    setSortDirection(direction);
                  }}
                />
                <SortableHeader
                  field="price_monthly"
                  label="Revenue"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={(field, direction) => {
                    setSortField(field);
                    setSortDirection(direction);
                  }}
                />
                <th className={`px-4 py-3 text-left text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentSubscriptions.map((subscription) => (
                <EnhancedSubscriptionRow
                  key={subscription.id}
                  subscription={subscription}
                  onUpdateStatus={handleUpdateStatus}
                  onViewDetails={setSelectedSubscription}
                  isSelected={selectedSubscriptions.includes(subscription.id)}
                  onSelect={(id, selected) => {
                    if (selected) {
                      setSelectedSubscriptions([...selectedSubscriptions, id]);
                    } else {
                      setSelectedSubscriptions(selectedSubscriptions.filter(s => s !== id));
                    }
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded border disabled:opacity-50 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  First
                </button>
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
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded border disabled:opacity-50 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Last
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

// Enhanced Stat Card Component
const EnhancedStatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => {
  const { isDark } = useTheme();
  
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20',
    green: 'text-green-500 bg-green-100 dark:bg-green-900/20',
    red: 'text-red-500 bg-red-100 dark:bg-red-900/20',
    purple: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20',
    orange: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20'
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <FaArrowUp className="text-green-500" />;
    if (value < 0) return <FaArrowDown className="text-red-500" />;
    return <FaEquals className="text-gray-500" />;
  };

  return (
    <div className={`p-4 rounded-lg border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="text-lg" />
        </div>
        {trend !== undefined && (
          <div className="flex items-center text-xs">
            {getTrendIcon(trend)}
            <span className={`ml-1 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div>
        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {title}
        </p>
        <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </p>
        {subtitle && (
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

// Quick Insight Card Component
const QuickInsightCard = ({ title, value, icon: Icon, color, subtitle, onClick }) => {
  const { isDark } = useTheme();
  
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20',
    green: 'text-green-500 bg-green-100 dark:bg-green-900/20',
    orange: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20',
    purple: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20'
  };

  return (
    <div 
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="text-lg" />
        </div>
        <div className="text-right">
          <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </p>
          {subtitle && (
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Sortable Header Component
const SortableHeader = ({ field, label, sortField, sortDirection, onSort }) => {
  const { isDark } = useTheme();
  
  const isActive = sortField === field;
  
  return (
    <th 
      className={`px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
        isDark ? 'text-gray-300' : 'text-gray-500'
      }`}
      onClick={() => onSort(field, isActive && sortDirection === 'asc' ? 'desc' : 'asc')}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {isActive && (
          sortDirection === 'asc' ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />
        )}
      </div>
    </th>
  );
};

// Enhanced Subscription Row Component
const EnhancedSubscriptionRow = ({ subscription, onUpdateStatus, onViewDetails, isSelected, onSelect }) => {
  const { isDark } = useTheme();
  
  const getStatusColor = (status) => {
    switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    case 'trial':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    case 'cancelled':
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    case 'expired':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
    case 'suspended':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getPlanColor = (planId) => {
    switch (planId) {
    case 'institution':
      return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
    case 'family':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    case 'student':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const isTrialExpiring = subscription.trial_end_date && 
    new Date(subscription.trial_end_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-750 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(subscription.id, e.target.checked)}
        />
      </td>
      <td className="px-4 py-3">
        <div>
          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {subscription.user_name || 'Unknown User'}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {subscription.user_email || `User ID: ${subscription.user_id}`}
          </div>
          {subscription.id && (
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              ID: {subscription.id}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(subscription.plan_id)}`}>
          {subscription.plan_name}
        </span>
        <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {subscription.billing_cycle}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
            {subscription.status}
          </span>
          {isTrialExpiring && (
            <FaExclamationTriangle className="text-orange-500 text-sm" title="Trial expiring soon" />
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
          <div>Start: {new Date(subscription.subscription_start_date).toLocaleDateString()}</div>
          <div>End: {new Date(subscription.subscription_end_date).toLocaleDateString()}</div>
          {subscription.trial_end_date && (
            <div className={`text-xs ${isTrialExpiring ? 'text-orange-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Trial: {new Date(subscription.trial_end_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
          <div className="font-medium">
            R{subscription.billing_cycle === 'monthly' ? subscription.price_monthly : subscription.price_annual}
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {subscription.payment_method}
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {subscription.auto_renew ? 'Auto-renew' : 'Manual'}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(subscription)}
            className="text-blue-500 hover:text-blue-600"
            title="View Details"
          >
            <FaEye />
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
            <option value="trial">Trial</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </td>
    </tr>
  );
};

// Create Subscription Modal (enhanced)
const CreateSubscriptionModal = ({ onClose, onCreate }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    userId: '',
    userEmail: '',
    planId: 'student',
    billingCycle: 'monthly',
    duration: 30,
    startDate: new Date().toISOString().split('T')[0],
    trialDays: 0,
    autoRenew: true,
    paymentMethod: 'manual',
    notes: ''
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
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="User ID"
              value={formData.userId}
              onChange={(e) => setFormData({...formData, userId: e.target.value})}
              className={`px-3 py-2 rounded border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <input
              type="email"
              placeholder="User Email"
              value={formData.userEmail}
              onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
              className={`px-3 py-2 rounded border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>
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
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.billingCycle}
              onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
              className={`px-3 py-2 rounded border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
            <input
              type="number"
              placeholder="Duration (days)"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
              className={`px-3 py-2 rounded border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            className={`w-full px-3 py-2 rounded border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Trial Days"
              value={formData.trialDays}
              onChange={(e) => setFormData({...formData, trialDays: parseInt(e.target.value)})}
              className={`px-3 py-2 rounded border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              className={`px-3 py-2 rounded border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="manual">Manual</option>
              <option value="credit_card">Credit Card</option>
              <option value="payfast">PayFast</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRenew"
              checked={formData.autoRenew}
              onChange={(e) => setFormData({...formData, autoRenew: e.target.checked})}
            />
            <label htmlFor="autoRenew" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Auto-renew subscription
            </label>
          </div>
          <textarea
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className={`w-full px-3 py-2 rounded border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
            rows="3"
          />
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded bg-gray-500 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Create Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Subscription Details Modal (enhanced)
const SubscriptionDetailsModal = ({ subscription, onClose, onUpdate, onRefresh }) => {
  const { isDark } = useTheme();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative max-w-4xl w-full mx-4 p-6 rounded-xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Subscription Details
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <FaTimesCircle className={isDark ? 'text-gray-400' : 'text-gray-500'} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              User Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Name
                </label>
                <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {subscription.user_name || 'Unknown User'}
                </p>
              </div>
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Email
                </label>
                <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {subscription.user_email || 'No email'}
                </p>
              </div>
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  User ID
                </label>
                <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {subscription.user_id}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Subscription Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Plan
                </label>
                <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {subscription.plan_name}
                </p>
              </div>
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Status
                </label>
                <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {subscription.status}
                </p>
              </div>
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Billing Cycle
                </label>
                <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {subscription.billing_cycle}
                </p>
              </div>
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Price
                </label>
                <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                  R{subscription.billing_cycle === 'monthly' ? subscription.price_monthly : subscription.price_annual}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
          <button
            onClick={() => {
              onRefresh();
              onClose();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Refresh & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSubscriptionManagement; 