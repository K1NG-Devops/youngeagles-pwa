import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaChartLine, 
  FaMoneyBillWave, 
  FaEye, 
  FaMousePointer, 
  FaUsers, 
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaDownload,
  FaSync,
  FaFilter,
  FaChartBar,
  FaPercentage
} from 'react-icons/fa';
import apiService from '../../services/apiService';
import nativeNotificationService from '../../services/nativeNotificationService';

const AdAnalytics = ({ timeRange = '7d', className = '' }) => {
  const { isDark } = useTheme();
  const [analytics, setAnalytics] = useState({
    impressions: 0,
    clicks: 0,
    revenue: 0,
    ctr: 0,
    cpm: 0,
    rpm: 0,
    activeUsers: 0,
    premiumUsers: 0,
    adBlockerUsers: 0
  });
  const [chartData, setChartData] = useState([]);
  const [topPerformingAds, setTopPerformingAds] = useState([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [comparisonData, setComparisonData] = useState(null);

  // Mock data for demonstration - in production, this would come from Google AdSense API
  const mockAnalyticsData = {
    '7d': {
      impressions: 12450,
      clicks: 186,
      revenue: 24.73,
      ctr: 1.49,
      cpm: 1.98,
      rpm: 1.99,
      activeUsers: 847,
      premiumUsers: 23,
      adBlockerUsers: 156,
      chartData: [
        { date: '2024-01-01', impressions: 1650, clicks: 22, revenue: 3.21 },
        { date: '2024-01-02', impressions: 1890, clicks: 31, revenue: 4.15 },
        { date: '2024-01-03', impressions: 1720, clicks: 19, revenue: 2.98 },
        { date: '2024-01-04', impressions: 2100, clicks: 35, revenue: 5.67 },
        { date: '2024-01-05', impressions: 1980, clicks: 28, revenue: 4.22 },
        { date: '2024-01-06', impressions: 1560, clicks: 24, revenue: 2.89 },
        { date: '2024-01-07', impressions: 1550, clicks: 27, revenue: 1.61 }
      ],
      topPerformingAds: [
        { position: 'Header Banner', impressions: 3420, clicks: 68, revenue: 8.45, ctr: 1.99 },
        { position: 'Content Middle', impressions: 2890, clicks: 45, revenue: 6.23, ctr: 1.56 },
        { position: 'Sidebar Rectangle', impressions: 2650, clicks: 38, revenue: 5.12, ctr: 1.43 },
        { position: 'Content Bottom', impressions: 2180, clicks: 22, revenue: 3.45, ctr: 1.01 },
        { position: 'Footer Banner', impressions: 1310, clicks: 13, revenue: 1.48, ctr: 0.99 }
      ],
      revenueBreakdown: [
        { source: 'Display Ads', revenue: 18.45, percentage: 74.6 },
        { source: 'Native Ads', revenue: 4.28, percentage: 17.3 },
        { source: 'Video Ads', revenue: 2.00, percentage: 8.1 }
      ]
    },
    '30d': {
      impressions: 52340,
      clicks: 789,
      revenue: 103.45,
      ctr: 1.51,
      cpm: 1.98,
      rpm: 1.98,
      activeUsers: 3420,
      premiumUsers: 89,
      adBlockerUsers: 634
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // In production, this would call the Google AdSense API
      // For now, we'll use mock data
      const data = mockAnalyticsData[timeRange] || mockAnalyticsData['7d'];
      
      setAnalytics(data);
      setChartData(data.chartData || []);
      setTopPerformingAds(data.topPerformingAds || []);
      setRevenueBreakdown(data.revenueBreakdown || []);
      
      // Calculate comparison data (previous period)
      const previousData = mockAnalyticsData['7d']; // Mock previous period
      setComparisonData({
        impressions: ((data.impressions - previousData.impressions) / previousData.impressions) * 100,
        clicks: ((data.clicks - previousData.clicks) / previousData.clicks) * 100,
        revenue: ((data.revenue - previousData.revenue) / previousData.revenue) * 100,
        ctr: ((data.ctr - previousData.ctr) / previousData.ctr) * 100
      });
      
    } catch (error) {
      console.error('Error loading ad analytics:', error);
      nativeNotificationService.error('Failed to load ad analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Impressions', analytics.impressions],
      ['Clicks', analytics.clicks],
      ['Revenue', `$${analytics.revenue.toFixed(2)}`],
      ['CTR', `${analytics.ctr.toFixed(2)}%`],
      ['CPM', `$${analytics.cpm.toFixed(2)}`],
      ['RPM', `$${analytics.rpm.toFixed(2)}`],
      ['Active Users', analytics.activeUsers],
      ['Premium Users', analytics.premiumUsers],
      ['Ad Blocker Users', analytics.adBlockerUsers]
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ad-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getComparisonIcon = (value) => {
    if (value > 0) return <FaArrowUp className="text-green-500" />;
    if (value < 0) return <FaArrowDown className="text-red-500" />;
    return <FaEquals className="text-gray-500" />;
  };

  const getComparisonColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FaChartLine className="text-2xl text-blue-500" />
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Ad Analytics
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <FaDownload className="inline mr-2" />
            Export
          </button>
          <button
            onClick={loadAnalytics}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaSync className="inline mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Revenue"
          value={`R${analytics.revenue.toFixed(2)}`}
          icon={FaMoneyBillWave}
          color="green"
          comparison={comparisonData?.revenue}
        />
        <MetricCard
          title="Impressions"
          value={analytics.impressions.toLocaleString()}
          icon={FaEye}
          color="blue"
          comparison={comparisonData?.impressions}
        />
        <MetricCard
          title="Clicks"
          value={analytics.clicks.toLocaleString()}
          icon={FaMousePointer}
          color="purple"
          comparison={comparisonData?.clicks}
        />
        <MetricCard
          title="CTR"
          value={`${analytics.ctr.toFixed(2)}%`}
          icon={FaPercentage}
          color="orange"
          comparison={comparisonData?.ctr}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                CPM (Cost Per Mille)
              </p>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                R{analytics.cpm.toFixed(2)}
              </p>
            </div>
            <FaChartBar className="text-blue-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                RPM (Revenue Per Mille)
              </p>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                R{analytics.rpm.toFixed(2)}
              </p>
            </div>
            <FaMoneyBillWave className="text-green-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Active Users
              </p>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.activeUsers.toLocaleString()}
              </p>
            </div>
            <FaUsers className="text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Ad Positions */}
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Top Performing Ad Positions
          </h3>
          <div className="space-y-3">
            {topPerformingAds.map((ad, index) => (
              <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {ad.position}
                  </span>
                  <span className={'text-sm font-semibold text-green-600'}>
                    R{ad.revenue.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    <span className="block">Impressions</span>
                    <span className="font-medium">{ad.impressions.toLocaleString()}</span>
                  </div>
                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    <span className="block">Clicks</span>
                    <span className="font-medium">{ad.clicks}</span>
                  </div>
                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    <span className="block">CTR</span>
                    <span className="font-medium">{ad.ctr.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Revenue Breakdown
          </h3>
          <div className="space-y-3">
            {revenueBreakdown.map((item, index) => (
              <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.source}
                  </span>
                  <span className={'text-sm font-semibold text-green-600'}>
                    R{item.revenue.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.percentage.toFixed(1)}% of total revenue
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Premium Users
              </p>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.premiumUsers}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {((analytics.premiumUsers / analytics.activeUsers) * 100).toFixed(1)}% of active users
              </p>
            </div>
            <FaUsers className="text-yellow-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Ad Blocker Users
              </p>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.adBlockerUsers}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {((analytics.adBlockerUsers / analytics.activeUsers) * 100).toFixed(1)}% of active users
              </p>
            </div>
            <FaFilter className="text-red-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Ad Reach
              </p>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {(((analytics.activeUsers - analytics.adBlockerUsers - analytics.premiumUsers) / analytics.activeUsers) * 100).toFixed(1)}%
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Users seeing ads
              </p>
            </div>
            <FaChartLine className="text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color, comparison }) => {
  const { isDark } = useTheme();
  
  const colorClasses = {
    green: 'text-green-500 bg-green-100 dark:bg-green-900/20',
    blue: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20',
    purple: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20',
    orange: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20'
  };

  const getComparisonIcon = (value) => {
    if (value > 0) return <FaArrowUp className="text-green-500" />;
    if (value < 0) return <FaArrowDown className="text-red-500" />;
    return <FaEquals className="text-gray-500" />;
  };

  const getComparisonColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="text-lg" />
        </div>
        {comparison !== undefined && (
          <div className={`flex items-center text-xs ${getComparisonColor(comparison)}`}>
            {getComparisonIcon(comparison)}
            <span className="ml-1">{Math.abs(comparison).toFixed(1)}%</span>
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
      </div>
    </div>
  );
};

export default AdAnalytics; 