import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import apiService from '../../services/apiService';
import nativeNotificationService from '../../services/nativeNotificationService';
import { 
  FaUsers, 
  FaChild, 
  FaUserCheck, 
  FaUserClock, 
  FaUserTimes, 
  FaBell, 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaSearch,
  FaFilter,
  FaDownload,
  FaSchool,
  FaExternalLinkAlt,
  FaSpinner,
  FaUserShield,
  FaExclamationTriangle
} from 'react-icons/fa';

const AdminParentManagement = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('pending-registrations');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Data states
  const [pendingChildRegistrations, setPendingChildRegistrations] = useState([]);
  const [pendingParentLinks, setPendingParentLinks] = useState([]);
  const [allParents, setAllParents] = useState([]);
  const [stats, setStats] = useState({
    totalParents: 0,
    youngEaglesParents: 0,
    externalParents: 0,
    pendingApprovals: 0,
    referredParents: 0
  });

  // Parent categories
  const PARENT_CATEGORIES = {
    'young_eagles': { 
      label: 'Young Eagles Parent', 
      color: 'blue', 
      description: 'Parent of a Young Eagles student' 
    },
    'external': { 
      label: 'External Parent', 
      color: 'green', 
      description: 'Not currently a Young Eagles parent' 
    },
    'referred': { 
      label: 'Referred Parent', 
      color: 'purple', 
      description: 'Referred by a Young Eagles parent' 
    },
    'prospective': { 
      label: 'Prospective Parent', 
      color: 'orange', 
      description: 'Interested in Young Eagles' 
    }
  };

  // Fetch all admin data
  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      
      const [
        pendingChildRegsRes,
        pendingLinksRes,
        parentsRes,
        statsRes
      ] = await Promise.allSettled([
        apiService.admin.getPendingChildRegistrations(),
        apiService.admin.getPendingParentLinks(),
        apiService.admin.getAllParents(),
        apiService.admin.getParentStats()
      ]);

      // Handle pending child registrations
      if (pendingChildRegsRes.status === 'fulfilled') {
        setPendingChildRegistrations(pendingChildRegsRes.value.data.registrations || []);
      } else {
        console.error('Failed to fetch pending child registrations:', pendingChildRegsRes.reason);
        setPendingChildRegistrations([]);
      }

      // Handle pending parent links
      if (pendingLinksRes.status === 'fulfilled') {
        setPendingParentLinks(pendingLinksRes.value.data.links || []);
      } else {
        console.error('Failed to fetch pending parent links:', pendingLinksRes.reason);
        setPendingParentLinks([]);
      }

      // Handle all parents
      if (parentsRes.status === 'fulfilled') {
        setAllParents(parentsRes.value.data.parents || []);
      } else {
        console.error('Failed to fetch all parents:', parentsRes.reason);
        setAllParents([]);
      }

      // Handle stats
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.stats || stats);
      } else {
        console.error('Failed to fetch parent stats:', statsRes.reason);
        // Keep default stats
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      nativeNotificationService.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  // Approve child registration
  const handleApproveChildRegistration = async (registrationId, parentCategory = 'external') => {
    try {
      const response = await apiService.admin.approveChildRegistration(registrationId, {
        parentCategory,
        adminNotes: `Approved by ${user.name}`
      });

      if (response.data.success) {
        nativeNotificationService.success('Child registration approved successfully!');
        
        // Send notification to parent
        await apiService.notifications.send({
          recipientId: response.data.parentId,
          title: 'Child Registration Approved',
          message: 'Your child registration has been approved! You can now access all features.',
          type: 'approval',
          priority: 'high'
        });

        // Refresh data
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error approving child registration:', error);
      nativeNotificationService.error('Failed to approve registration');
    }
  };

  // Reject child registration
  const handleRejectChildRegistration = async (registrationId, reason) => {
    try {
      const response = await apiService.admin.rejectChildRegistration(registrationId, {
        reason,
        adminNotes: `Rejected by ${user.name}: ${reason}`
      });

      if (response.data.success) {
        nativeNotificationService.success('Child registration rejected');
        
        // Send notification to parent
        await apiService.notifications.send({
          recipientId: response.data.parentId,
          title: 'Child Registration Rejected',
          message: `Your child registration was rejected: ${reason}`,
          type: 'rejection',
          priority: 'high'
        });

        // Refresh data
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error rejecting child registration:', error);
      nativeNotificationService.error('Failed to reject registration');
    }
  };

  // Approve parent-child link
  const handleApproveParentLink = async (linkId) => {
    try {
      const response = await apiService.admin.approveParentLink(linkId);

      if (response.data.success) {
        nativeNotificationService.success('Parent-child link approved!');
        
        // Send notification to parent
        await apiService.notifications.send({
          recipientId: response.data.parentId,
          title: 'Child Link Approved',
          message: 'Your request to link with your child has been approved!',
          type: 'approval',
          priority: 'high'
        });

        // Refresh data
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error approving parent link:', error);
      nativeNotificationService.error('Failed to approve link');
    }
  };

  // Update parent category
  const handleUpdateParentCategory = async (parentId, newCategory) => {
    try {
      const response = await apiService.admin.updateParentCategory(parentId, {
        category: newCategory,
        adminNotes: `Category updated by ${user.name}`
      });

      if (response.data.success) {
        nativeNotificationService.success('Parent category updated successfully!');
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error updating parent category:', error);
      nativeNotificationService.error('Failed to update parent category');
    }
  };

  // Export parents data
  const handleExportParents = async () => {
    try {
      const response = await apiService.admin.exportParents();
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `young_eagles_parents_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      nativeNotificationService.success('Parents data exported successfully!');
    } catch (error) {
      console.error('Error exporting parents data:', error);
      nativeNotificationService.error('Failed to export data');
    }
  };

  // Filter data based on search and filter criteria
  const getFilteredData = (data, searchFields) => {
    return data.filter(item => {
      const matchesSearch = searchTerm === '' || searchFields.some(field => 
        item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesFilter = filter === 'all' || item.category === filter || item.status === filter;
      
      return matchesSearch && matchesFilter;
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <FaUserShield className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <FaSpinner className="text-4xl animate-spin text-blue-500 mx-auto mb-4" />
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading parent management data...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'pending-registrations', label: 'Pending Registrations', icon: FaUserClock, count: pendingChildRegistrations.length },
    { id: 'pending-links', label: 'Pending Links', icon: FaUserCheck, count: pendingParentLinks.length },
    { id: 'all-parents', label: 'All Parents', icon: FaUsers, count: allParents.length }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 lg:p-6`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className={`text-2xl lg:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Parent Management
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage parent registrations, categorizations, and approvals
            </p>
          </div>
          
          <button
            onClick={handleExportParents}
            className="mt-4 lg:mt-0 inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <FaDownload className="mr-2" />
            Export Data
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <FaUsers className="text-2xl text-blue-500 mr-3" />
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalParents}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Parents</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <FaSchool className="text-2xl text-blue-600 mr-3" />
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.youngEaglesParents}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Young Eagles</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <FaExternalLinkAlt className="text-2xl text-green-500 mr-3" />
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.externalParents}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>External</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <FaBell className="text-2xl text-yellow-500 mr-3" />
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pendingApprovals}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <FaUserCheck className="text-2xl text-purple-500 mr-3" />
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.referredParents}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Referred</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 mr-2 mb-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? isDark 
                      ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' 
                      : 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : isDark 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-2" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="Search parents, children, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`px-4 py-3 rounded-lg border ${
            isDark 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <option value="all">All Categories</option>
          {Object.entries(PARENT_CATEGORIES).map(([key, category]) => (
            <option key={key} value={key}>{category.label}</option>
          ))}
        </select>
      </div>

      {/* Content based on active tab */}
      <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        {activeTab === 'pending-registrations' && (
          <div className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Pending Child Registrations
            </h3>
            
            {pendingChildRegistrations.length === 0 ? (
              <div className="text-center py-8">
                <FaUserCheck className={`text-6xl mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No pending child registrations
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredData(pendingChildRegistrations, ['parentName', 'parentEmail', 'childFirstName', 'childLastName']).map((registration) => (
                  <div key={registration.id} className={`p-4 border rounded-lg ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <FaChild className="text-blue-500 mr-2" />
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {registration.childFirstName} {registration.childLastName}
                          </h4>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            registration.isExistingStudent 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {registration.isExistingStudent ? 'Existing Student' : 'New Registration'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Parent:</p>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {registration.parentName}
                            </p>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {registration.parentEmail}
                            </p>
                          </div>
                          
                          <div>
                            <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Child Details:</p>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Grade {registration.childGrade} • {registration.childGender}
                            </p>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              DOB: {new Date(registration.childDateOfBirth).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div>
                            <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Submitted:</p>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {new Date(registration.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {registration.notes && (
                          <div className="mt-3">
                            <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Notes:</p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {registration.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2">
                        {/* Category Selection */}
                        <select
                          defaultValue="external"
                          className={`px-3 py-2 rounded-lg border text-sm ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          onChange={(e) => {
                            registration.selectedCategory = e.target.value;
                          }}
                        >
                          {Object.entries(PARENT_CATEGORIES).map(([key, category]) => (
                            <option key={key} value={key}>{category.label}</option>
                          ))}
                        </select>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const category = registration.selectedCategory || 'external';
                              handleApproveChildRegistration(registration.id, category);
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center text-sm"
                          >
                            <FaCheck className="mr-1" />
                            Approve
                          </button>
                          
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for rejection:');
                              if (reason) {
                                handleRejectChildRegistration(registration.id, reason);
                              }
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center text-sm"
                          >
                            <FaTimes className="mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending-links' && (
          <div className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Pending Parent-Child Links
            </h3>
            
            {pendingParentLinks.length === 0 ? (
              <div className="text-center py-8">
                <FaUserCheck className={`text-6xl mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No pending parent-child links
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredData(pendingParentLinks, ['parentName', 'parentEmail', 'childName']).map((link) => (
                  <div key={link.id} className={`p-4 border rounded-lg ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <FaUsers className="text-purple-500 mr-2" />
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Link Request
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Parent:</p>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {link.parentName} ({link.parentEmail})
                            </p>
                          </div>
                          
                          <div>
                            <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Child:</p>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {link.childName} (Grade {link.childGrade})
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Submitted:</p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(link.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 lg:mt-0 lg:ml-6 flex gap-2">
                        <button
                          onClick={() => handleApproveParentLink(link.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center text-sm"
                        >
                          <FaCheck className="mr-1" />
                          Approve
                        </button>
                        
                        <button
                          onClick={() => {
                            const reason = prompt('Reason for rejection:');
                            if (reason) {
                              // Handle rejection
                            }
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center text-sm"
                        >
                          <FaTimes className="mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'all-parents' && (
          <div className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              All Parents
            </h3>
            
            {allParents.length === 0 ? (
              <div className="text-center py-8">
                <FaUsers className={`text-6xl mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No parents found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Parent
                      </th>
                      <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Children
                      </th>
                      <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Category
                      </th>
                      <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Joined
                      </th>
                      <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredData(allParents, ['name', 'email', 'childrenNames']).map((parent) => (
                      <tr key={parent.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="py-4 px-4">
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {parent.name}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {parent.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {parent.childrenCount} {parent.childrenCount === 1 ? 'child' : 'children'}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {parent.childrenNames}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={parent.category}
                            onChange={(e) => handleUpdateParentCategory(parent.id, e.target.value)}
                            className={`px-3 py-1 rounded-lg border text-sm ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {Object.entries(PARENT_CATEGORIES).map(([key, category]) => (
                              <option key={key} value={key}>{category.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {new Date(parent.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => {
                              // View parent details
                              console.log('View parent details:', parent);
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminParentManagement;
