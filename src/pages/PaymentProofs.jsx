import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';
import { 
  FaUpload, 
  FaSpinner, 
  FaCheck, 
  FaTimes, 
  FaMoneyBill, 
  FaArrowLeft,
  FaFileInvoice,
  FaCalendarAlt
} from 'react-icons/fa';

const PaymentProofs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [children, setChildren] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
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
      toast.error('Please select a file to upload');
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
      toast.success('Payment proof submitted successfully!');
      
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
      } catch (error) {
        console.error('Error reloading proofs:', error);
      }
    } catch (error) {
      console.error('Error submitting payment proof:', error);
      toast.error(error.response?.data?.message || 'Failed to submit payment proof');
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
        <div className="flex items-center justify-between max-w-4xl">
          <button
            onClick={() => navigate('/dashboard')}
            className={`inline-flex pr-10 mr-4 items-center rounded-lg font-medium transition-all duration-200 ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-lg' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
            }`}
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="text-center">
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              💰 Payment Proofs
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Submit proof of payment for school fees
            </p>
          </div>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 mt-6">
        {/* Submit New Payment Proof - Enhanced styling */}
        <div className={`rounded-2xl shadow-lg border backdrop-blur-sm ${isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'}`}>
          <div className="p-6">
            {/* Enhanced header with gradient background */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <FaMoneyBill className="mr-3" />
                Submit Payment Proof
              </h2>
              <p className="text-green-100 text-sm mt-1">
                Upload your payment receipt or bank statement
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Child <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="child_id"
                    value={formData.child_id}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
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
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
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
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 placeholder-gray-500 shadow-sm'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="payment_date"
                    value={formData.payment_date}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 shadow-sm'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
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

                <div className="md:col-span-2">
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Reference Number
                  </label>
                  <input
                    type="text"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleInputChange}
                    placeholder="Optional reference number"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 placeholder-gray-500 shadow-sm'
                    }`}
                  />
                </div>

                {/* Enhanced file upload area */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Proof File <span className="text-red-500">*</span>
                  </label>
                  <div className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 hover:border-blue-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700/30' 
                      : 'border-gray-300 bg-gray-50/50'
                  }`}>
                    <FaUpload className={`mx-auto text-5xl mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`mb-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Upload proof of payment
                    </p>
                    <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
                      className={`inline-flex items-center px-6 py-3 rounded-xl cursor-pointer font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
                        isDark 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                      }`}
                    >
                      <FaUpload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                    {formData.proof_file && (
                      <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                        <p className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          ✓ Selected: {formData.proof_file.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                  } text-white`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaUpload className="w-4 h-4 mr-2" />
                      Submit Payment Proof
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Recent Payment Proofs - Enhanced styling */}
        <div className={`rounded-2xl shadow-lg border backdrop-blur-sm ${isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'}`}>
          <div className="p-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <FaFileInvoice className="mr-3" />
                Recent Submissions
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                Track the status of your payment proofs
              </p>
            </div>

            {proofs.length === 0 ? (
              <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <FaFileInvoice className="text-4xl opacity-50" />
                </div>
                <p className="text-lg font-medium mb-2">No payment proofs submitted yet</p>
                <p className="text-sm">Submit your first payment proof using the form above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proofs.map((proof, index) => (
                  <div key={proof.id || index} className={`border-2 rounded-xl p-5 transition-all duration-200 hover:shadow-md ${
                    isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50/50'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl border-2 ${getStatusColor(proof.status)}`}>
                          {getStatusIcon(proof.status)}
                        </div>
                        <div>
                          <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            R{proof.amount} - {proof.child_name}
                          </p>
                          <p className={`text-sm flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <FaCalendarAlt className="w-3 h-3 mr-1" />
                            {formatDate(proof.payment_date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize border-2 ${getStatusColor(proof.status)}`}>
                          {proof.status || 'pending'}
                        </span>
                      </div>
                    </div>
                    
                    {proof.reference_number && (
                      <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Reference: {proof.reference_number}
                      </p>
                    )}
                    
                    {proof.admin_notes && (
                      <div className={`p-4 rounded-xl border-l-4 ${
                        isDark ? 'bg-gray-700 border-blue-400' : 'bg-blue-50 border-blue-400'
                      }`}>
                        <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          💬 Admin Notes:
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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