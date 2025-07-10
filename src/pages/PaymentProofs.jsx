import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService.js';
import { 
  FaUpload, 
  FaSpinner, 
  FaCheck, 
  FaTimes, 
  FaMoneyBill, 
  FaArrowLeft,
  FaFileInvoice,
  FaCalendarAlt,
  FaTrash
} from 'react-icons/fa';

const PaymentProofs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [children, setChildren] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProofId, setDeletingProofId] = useState(null);
  const [formData, setFormData] = useState({
    child_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    payment_method: 'bank_transfer',
    proof_file: null
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const childrenResponse = await apiService.children.getByParent(user.id);
        setChildren(childrenResponse.data.children || []);

        try {
          const proofsResponse = await apiService.payments.getProofs();
          setProofs(proofsResponse.data.proofs || []);
        } catch (error) {
          console.error('Error loading payment proofs:', error);
          setProofs([]);
        }
        
        // Load payment summary (approved payments only)
        try {
          const summaryResponse = await apiService.payments.getSummary();
          setPaymentSummary(summaryResponse.data.summary);
        } catch (error) {
          console.error('Error loading payment summary:', error);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        nativeNotificationService.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'proof_file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.proof_file) {
      nativeNotificationService.error('Please select a file to upload');
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      await apiService.payments.submitProof(formDataToSend);
      nativeNotificationService.success('Payment proof submitted successfully!');
      
      setFormData({
        child_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        payment_method: 'bank_transfer',
        proof_file: null
      });
      
      const fileInput = document.getElementById('proof_file');
      if (fileInput) fileInput.value = '';

      try {
        const proofsResponse = await apiService.payments.getProofs();
        setProofs(proofsResponse.data.proofs || []);
        
        // Reload payment summary
        const summaryResponse = await apiService.payments.getSummary();
        setPaymentSummary(summaryResponse.data.summary);
      } catch (error) {
        console.error('Error reloading proofs:', error);
      }
    } catch (error) {
      console.error('Error submitting payment proof:', error);
      nativeNotificationService.error(error.response?.data?.message || 'Failed to submit payment proof');
    } finally {
      setIsSubmitting(false);
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
      return <FaCheck className="w-4 h-4" />;
    case 'rejected':
      return <FaTimes className="w-4 h-4" />;
    default:
      return <FaSpinner className="w-4 h-4 animate-spin" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleDeleteRejectedProof = async (proofId) => {
    if (!confirm('Are you sure you want to delete this rejected payment proof?')) {
      return;
    }
    
    try {
      setDeletingProofId(proofId);
      await apiService.payments.deleteRejectedProof(proofId);
      nativeNotificationService.success('Rejected payment proof deleted successfully');
      
      // Reload proofs and summary
      const proofsResponse = await apiService.payments.getProofs();
      setProofs(proofsResponse.data.proofs || []);
      
      const summaryResponse = await apiService.payments.getSummary();
      setPaymentSummary(summaryResponse.data.summary);
    } catch (error) {
      console.error('Error deleting rejected proof:', error);
      nativeNotificationService.error(error.response?.data?.message || 'Failed to delete rejected proof');
    } finally {
      setDeletingProofId(null);
    }
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
    <div className={`min-h-screen mt-18 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pb-12`}>
      <div className={`sticky top-0 z-10 w-full rounded-xl border-b backdrop-blur-md ${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center justify-between w-full max-w-7xl mx-2 sm:mx-4 px-2 sm:px-4 py-3 sm:py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className={`inline-flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 min-h-[44px] ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-lg' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
            }`}
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
          
          <div className="text-center flex-1 mx-2">
            <h1 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              💰 Payment Proofs
            </h1>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Submit proof of payment for school fees
            </p>
          </div>
          
          <div className="w-16 sm:w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="w-full max-w-7xl mx-2 sm:mx-4 px-2 sm:px-4 space-y-4 sm:space-y-6 mt-4 sm:mt-6">
        {/* Payment Summary */}
        {paymentSummary && (
          <div className={`rounded-xl sm:rounded-2xl shadow-lg border backdrop-blur-sm ${isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'}`}>
            <div className="p-4 sm:p-6">
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 rounded-xl mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <FaMoneyBill className="mr-3" />
                  Payment Summary
                </h2>
                <p className="text-emerald-100 text-sm mt-1">
                  Overview of your approved payments
                </p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className={`p-3 sm:p-4 rounded-xl border-2 ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    R{paymentSummary.total_paid.toFixed(2)}
                  </div>
                  <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Paid (Approved)</div>
                </div>
                
                <div className={`p-3 sm:p-4 rounded-xl border-2 ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
                  <div className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {paymentSummary.total_approved_payments}
                  </div>
                  <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Approved Payments</div>
                </div>
                
                <div className={`p-3 sm:p-4 rounded-xl border-2 ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {paymentSummary.pending_payments}
                  </div>
                  <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending Review</div>
                </div>
                
                <div className={`p-3 sm:p-4 rounded-xl border-2 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
                  <div className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {paymentSummary.rejected_payments}
                  </div>
                  <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rejected</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Submit New Payment Proof - Enhanced styling */}
        <div className={`rounded-xl sm:rounded-2xl shadow-lg border backdrop-blur-sm ${isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'}`}>
          <div className="p-4 sm:p-6">
            {/* Enhanced header with gradient background */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 sm:p-4 rounded-xl mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center">
                <FaMoneyBill className="mr-2 sm:mr-3" />
                Submit Payment Proof
              </h2>
              <p className="text-green-100 text-xs sm:text-sm mt-1">
                Upload your payment receipt or bank statement
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className={`block text-xs sm:text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Child <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="child_id"
                    value={formData.child_id}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 sm:px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 min-h-[44px] ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 shadow-sm'
                    }`}
                  >
                    <option value="">Select Child</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.first_name} {child.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount (R) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full px-3 sm:px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 min-h-[44px] ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 placeholder-gray-500 shadow-sm'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="payment_date"
                    value={formData.payment_date}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 sm:px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 min-h-[44px] ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 shadow-sm'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 sm:px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 min-h-[44px] ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 shadow-sm'
                    }`}
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="eft">EFT</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card Payment</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className={`block text-xs sm:text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Reference Number
                  </label>
                  <input
                    type="text"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleInputChange}
                    placeholder="Optional reference number"
                    className={`w-full px-3 sm:px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 min-h-[44px] ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 placeholder-gray-500 shadow-sm'
                    }`}
                  />
                </div>

                {/* Enhanced file upload area */}
                <div className="lg:col-span-2">
                  <label className={`block text-xs sm:text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Proof File <span className="text-red-500">*</span>
                  </label>
                  <div className={`border-3 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 hover:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700/30' 
                      : 'border-gray-300 bg-gray-50/50'
                  }`}>
                    <FaUpload className={`mx-auto text-4xl sm:text-5xl mb-3 sm:mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`mb-3 sm:mb-4 text-sm sm:text-base font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Upload proof of payment
                    </p>
                    <p className={`text-xs sm:text-sm mb-4 sm:mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Supported formats: PNG, JPG, PDF (Max 10MB)
                    </p>
                    <input
                      type="file"
                      id="proof_file"
                      name="proof_file"
                      onChange={handleInputChange}
                      accept=".png,.jpg,.jpeg,.pdf"
                      required
                      className="hidden"
                    />
                    <label
                      htmlFor="proof_file"
                      className={`inline-flex items-center px-4 sm:px-6 py-3 rounded-xl cursor-pointer font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105 min-h-[44px] ${
                        isDark 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                      }`}
                    >
                      <FaUpload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                    {formData.proof_file && (
                      <div className={`mt-3 sm:mt-4 p-3 rounded-xl ${isDark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                        <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          ✓ Selected: {formData.proof_file.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 min-h-[44px] ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                  } text-white`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                      <span className="text-sm sm:text-base">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FaUpload className="w-4 h-4 mr-2" />
                      <span className="text-sm sm:text-base">Submit Payment Proof</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Recent Payment Proofs - Enhanced styling */}
        <div className={`rounded-xl sm:rounded-2xl shadow-lg border backdrop-blur-sm ${isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'}`}>
          <div className="p-4 sm:p-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-xl mb-4 sm:mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <FaFileInvoice className="mr-2 sm:mr-3" />
                Recent Submissions
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                Track the status of your payment proofs
              </p>
            </div>

            {proofs.length === 0 ? (
              <div className={`text-center py-12 sm:py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <FaFileInvoice className="text-3xl sm:text-4xl opacity-50" />
                </div>
                <p className="text-base sm:text-lg font-medium mb-2">No payment proofs submitted yet</p>
                <p className="text-xs sm:text-sm">Submit your first payment proof using the form above</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {proofs.map((proof, index) => (
                  <div key={proof.id || index} className={`border-2 rounded-xl p-3 sm:p-5 transition-all duration-200 hover:shadow-md ${
                    isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50/50'
                  }`}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className={`p-2 sm:p-3 rounded-xl border-2 flex-shrink-0 ${getStatusColor(proof.status)}`}>
                          {getStatusIcon(proof.status)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`font-semibold text-sm sm:text-lg truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            R{proof.amount} - {proof.child_name}
                          </p>
                          <p className={`text-xs sm:text-sm flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <FaCalendarAlt className="w-3 h-3 mr-1 flex-shrink-0" />
                            {formatDate(proof.payment_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-bold capitalize border-2 ${getStatusColor(proof.status)}`}>
                          <span className="hidden sm:inline">{proof.status || 'pending'}</span>
                          <span className="sm:hidden">{(proof.status || 'pending').charAt(0).toUpperCase()}</span>
                        </span>
                        {proof.status === 'rejected' && (
                          <button
                            onClick={() => handleDeleteRejectedProof(proof.id)}
                            disabled={deletingProofId === proof.id}
                            className={`p-2 rounded-lg transition-all hover:scale-105 min-h-[36px] min-w-[36px] ${
                              deletingProofId === proof.id
                                ? 'bg-gray-400 cursor-not-allowed'
                                : isDark
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                            title="Delete rejected proof"
                          >
                            {deletingProofId === proof.id ? (
                              <FaSpinner className="w-3 h-3 animate-spin" />
                            ) : (
                              <FaTrash className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {proof.reference_number && (
                      <p className={`text-xs sm:text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Reference: {proof.reference_number}
                      </p>
                    )}
                    
                    {proof.admin_notes && (
                      <div className={`p-3 sm:p-4 rounded-xl border-l-4 ${
                        isDark ? 'bg-gray-700 border-blue-400' : 'bg-blue-50 border-blue-400'
                      }`}>
                        <p className={`text-xs sm:text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          💬 Admin Notes:
                        </p>
                        <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {proof.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProofs; 