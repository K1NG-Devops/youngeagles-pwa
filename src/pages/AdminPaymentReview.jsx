import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService.js';
import { 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaDownload,
  FaMoneyBillWave, 
  FaArrowLeft,
  FaCalendarAlt,
  FaUser,
  FaFileAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaTrash
} from 'react-icons/fa';
import Header from '../components/Header';

const AdminPaymentReview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [paymentProofs, setPaymentProofs] = useState([]);
  const [filteredProofs, setFilteredProofs] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [deletingProofId, setDeletingProofId] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  // Always call hooks unconditionally
  useEffect(() => {
    // Only load payment proofs if user has admin privileges
    if (user && (user.role === 'admin' || user.userType === 'admin')) {
      loadPaymentProofs();
    }
  }, [user]);

  useEffect(() => {
    filterProofs();
  }, [paymentProofs, filters]);

  // Check if user is admin after hooks are called
  if (!user || (user.role !== 'admin' && user.userType !== 'admin')) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Access Denied</h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const loadPaymentProofs = async () => {
    try {
      setIsLoading(true);
      
      // Fetch payment summary (approved payments only)
      try {
        const summaryResponse = await apiService.payments.getAdminSummary();
        setPaymentSummary(summaryResponse.data.summary);
      } catch (error) {
        console.log('Payment summary API not available');
      }
      
      // Try to fetch all payment proofs for admin review
      const response = await apiService.payments.getAllProofs();
      const proofs = response.data.proofs || [];
      setPaymentProofs(proofs);
    } catch (error) {
      console.error('Error loading payment proofs:', error);
      // If the admin endpoint doesn't exist, try the regular endpoint and show mock data
      const mockProofs = [
        {
          id: 1,
          parent_name: 'John Smith',
          child_name: 'Emma Smith',
          amount: 150.00,
          payment_date: '2024-01-15',
          reference_number: 'REF123456',
          payment_method: 'bank_transfer',
          status: 'pending',
          submitted_at: '2024-01-16T10:30:00Z',
          proof_file_url: '/uploads/proof1.pdf'
        },
        {
          id: 2,
          parent_name: 'Mary Johnson',
          child_name: 'Michael Johnson',
          amount: 200.00,
          payment_date: '2024-01-14',
          reference_number: 'REF789012',
          payment_method: 'eft',
          status: 'pending',
          submitted_at: '2024-01-15T14:20:00Z',
          proof_file_url: '/uploads/proof2.jpg'
        },
        {
          id: 3,
          parent_name: 'Sarah Wilson',
          child_name: 'Lisa Wilson',
          amount: 175.00,
          payment_date: '2024-01-13',
          reference_number: 'REF345678',
          payment_method: 'bank_transfer',
          status: 'approved',
          submitted_at: '2024-01-14T09:15:00Z',
          approved_at: '2024-01-14T11:30:00Z',
          proof_file_url: '/uploads/proof3.pdf'
        },
        {
          id: 4,
          parent_name: 'David Brown',
          child_name: 'Tom Brown',
          amount: 125.00,
          payment_date: '2024-01-12',
          reference_number: 'REF901234',
          payment_method: 'cash_deposit',
          status: 'rejected',
          submitted_at: '2024-01-13T16:45:00Z',
          rejected_at: '2024-01-13T18:00:00Z',
          rejection_reason: 'Receipt unclear, please resubmit with clearer image',
          proof_file_url: '/uploads/proof4.jpg'
        }
      ];
      setPaymentProofs(mockProofs);
      nativeNotificationService.info('Showing demo data - Admin payment review endpoint not yet implemented');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProofs = () => {
    let filtered = [...paymentProofs];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(proof => proof.status === filters.status);
    }

    // Filter by search term (parent name, child name, reference number)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(proof => 
        proof.parent_name?.toLowerCase().includes(searchTerm) ||
        proof.child_name?.toLowerCase().includes(searchTerm) ||
        proof.reference_number?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(proof => 
        new Date(proof.payment_date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(proof => 
        new Date(proof.payment_date) <= new Date(filters.dateTo)
      );
    }

    setFilteredProofs(filtered);
  };

  const handleApprove = async (proofId) => {
    try {
      setActionLoading(`approve-${proofId}`);
      await apiService.payments.approveProof(proofId);
      
      // Update local state
      setPaymentProofs(prev => prev.map(proof => 
        proof.id === proofId 
          ? { ...proof, status: 'approved', approved_at: new Date().toISOString() }
          : proof
      ));
      
      nativeNotificationService.success('Payment proof approved successfully!');
      setShowModal(false);
    } catch (error) {
      console.error('Error approving payment proof:', error);
      nativeNotificationService.error('Failed to approve payment proof');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (proofId, reason) => {
    try {
      setActionLoading(`reject-${proofId}`);
      await apiService.payments.rejectProof(proofId, { reason });
      
      // Update local state
      setPaymentProofs(prev => prev.map(proof => 
        proof.id === proofId 
          ? { 
            ...proof, 
            status: 'rejected', 
            rejected_at: new Date().toISOString(),
            rejection_reason: reason || 'No reason provided'
          }
          : proof
      ));
      
      nativeNotificationService.success('Payment proof rejected');
      setShowModal(false);
    } catch (error) {
      console.error('Error rejecting payment proof:', error);
      nativeNotificationService.error('Failed to reject payment proof');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRejectedProof = async (proofId) => {
    if (!confirm('Are you sure you want to delete this rejected payment proof?')) {
      return;
    }
    
    try {
      setDeletingProofId(proofId);
      await apiService.payments.deleteRejectedProof(proofId);
      nativeNotificationService.success('Rejected payment proof deleted successfully');
      
      // Remove from local state
      setPaymentProofs(prev => prev.filter(proof => proof.id !== proofId));
      
      // Reload payment summary
      try {
        const summaryResponse = await apiService.payments.getAdminSummary();
        setPaymentSummary(summaryResponse.data.summary);
      } catch (error) {
        console.log('Payment summary API not available');
      }
      
      // Close modal if this proof was being viewed
      if (selectedProof && selectedProof.id === proofId) {
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error deleting rejected proof:', error);
      nativeNotificationService.error(error.response?.data?.message || 'Failed to delete rejected proof');
    } finally {
      setDeletingProofId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
    case 'approved':
      return isDark ? 'text-green-400 bg-green-900/20 border-green-800' : 'text-green-600 bg-green-50 border-green-200';
    case 'rejected':
      return isDark ? 'text-red-400 bg-red-900/20 border-red-800' : 'text-red-600 bg-red-50 border-red-200';
    default:
      return isDark ? 'text-yellow-400 bg-yellow-900/20 border-yellow-800' : 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
    case 'approved':
      return <FaCheckCircle className="w-4 h-4" />;
    case 'rejected':
      return <FaTimesCircle className="w-4 h-4" />;
    default:
      return <FaSpinner className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading payment proofs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      
      <div className="pt-20 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/dashboard')}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin Dashboard
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <FaMoneyBillWave className="mr-3" />
                Payment Proof Review
              </h1>
              <p className="text-blue-100">
                Review and approve payment proofs submitted by parents
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className={`p-6 rounded-xl shadow-sm border mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Search
                </label>
                <div className="relative">
                  <FaSearch className={`absolute left-3 top-3 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Parent name, child, reference..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className={`w-full pl-10 p-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <FaSpinner className="text-2xl text-yellow-500 mr-3" />
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {filteredProofs.filter(p => p.status === 'pending').length}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <FaCheckCircle className="text-2xl text-green-500 mr-3" />
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {filteredProofs.filter(p => p.status === 'approved').length}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Approved</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <FaTimesCircle className="text-2xl text-red-500 mr-3" />
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {filteredProofs.filter(p => p.status === 'rejected').length}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rejected</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <FaMoneyBillWave className="text-2xl text-blue-500 mr-3" />
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {paymentSummary ? formatCurrency(paymentSummary.total_paid) : formatCurrency(filteredProofs.filter(p => p.status === 'approved').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0))}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Approved Amount</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Proofs List */}
          <div className={`rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            {filteredProofs.length === 0 ? (
              <div className="p-8 text-center">
                <FaFileAlt className={`text-6xl mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  No Payment Proofs Found
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No payment proofs match your current filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        Parent / Child
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        Amount
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        Payment Date
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        Reference
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredProofs.map((proof) => (
                      <tr key={proof.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {proof.parent_name}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {proof.child_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(parseFloat(proof.amount) || 0)}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {proof.payment_method}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {formatDate(proof.payment_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {proof.reference_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(proof.status)}`}>
                            {getStatusIcon(proof.status)}
                            <span className="ml-1 capitalize">{proof.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => { setSelectedProof(proof); setShowModal(true); }}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            
                            {proof.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(proof.id)}
                                  disabled={actionLoading === `approve-${proof.id}`}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                  title="Approve"
                                >
                                  {actionLoading === `approve-${proof.id}` ? (
                                    <FaSpinner className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <FaCheck className="w-4 h-4" />
                                  )}
                                </button>
                                
                                <button
                                  onClick={() => handleReject(proof.id, 'Rejected by admin')}
                                  disabled={actionLoading === `reject-${proof.id}`}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                  title="Reject"
                                >
                                  {actionLoading === `reject-${proof.id}` ? (
                                    <FaSpinner className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <FaTimes className="w-4 h-4" />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for viewing proof details */}
      {showModal && selectedProof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-2xl rounded-xl shadow-lg ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Payment Proof Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className={`rounded-lg p-2 hover:bg-opacity-10 ${
                    isDark ? 'hover:bg-gray-300' : 'hover:bg-gray-600'
                  }`}
                >
                  <FaTimes className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Parent Name
                    </label>
                    <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedProof.parent_name}
                    </p>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Child Name
                    </label>
                    <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedProof.child_name}
                    </p>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Amount
                    </label>
                    <p className={`mt-1 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(parseFloat(selectedProof.amount) || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Payment Method
                    </label>
                    <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedProof.payment_method.replace('_', ' ')}
                    </p>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Payment Date
                    </label>
                    <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(selectedProof.payment_date)}
                    </p>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Reference Number
                    </label>
                    <p className={`mt-1 font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedProof.reference_number}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1 ${getStatusColor(selectedProof.status)}`}>
                    {getStatusIcon(selectedProof.status)}
                    <span className="ml-1 capitalize">{selectedProof.status}</span>
                  </span>
                </div>
                
                {selectedProof.rejection_reason && (
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Rejection Reason
                    </label>
                    <p className={'mt-1 text-red-600'}>
                      {selectedProof.rejection_reason}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Proof File
                  </label>
                  <div className="mt-2">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <FaDownload className="mr-2 w-4 h-4" />
                      Download Proof
                    </button>
                  </div>
                </div>
              </div>
              
              {selectedProof.status === 'pending' && (
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleReject(selectedProof.id, 'Rejected by admin')}
                    disabled={actionLoading === `reject-${selectedProof.id}`}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                  >
                    {actionLoading === `reject-${selectedProof.id}` ? (
                      <FaSpinner className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <FaTimes className="w-4 h-4 mr-2" />
                    )}
                    Reject
                  </button>
                  
                  <button
                    onClick={() => handleApprove(selectedProof.id)}
                    disabled={actionLoading === `approve-${selectedProof.id}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {actionLoading === `approve-${selectedProof.id}` ? (
                      <FaSpinner className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <FaCheck className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </button>
                </div>
              )}
              
              {selectedProof.status === 'rejected' && (
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleDeleteRejectedProof(selectedProof.id)}
                    disabled={deletingProofId === selectedProof.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                  >
                    {deletingProofId === selectedProof.id ? (
                      <FaSpinner className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <FaTrash className="w-4 h-4 mr-2" />
                    )}
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentReview;
