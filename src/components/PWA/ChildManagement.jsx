import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../../config/api';
import { api } from '../../services/httpClient';
import { toast } from 'react-toastify';
import { FaChild, FaPlus, FaEdit, FaTrash, FaPen, FaSpinner, FaUserPlus, FaList, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';

const getClassByAge = (age) => {
  if (age >= 1 && age <= 3) return 'Curious Cubs';
  if (age === 4 || age === 5 || age === 6) return 'Panda';
  return '';
};

const getGradeByAge = (age) => {
  if (age >= 1 && age <= 3) return 'Nursery';
  if (age === 4 || age === 5) return 'RR';
  if (age === 6) return 'R';
  return '';
};

const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};

const ChildManagement = () => {
  const navigate = useNavigate();
  
  // State for tab management
  const [activeTab, setActiveTab] = useState('register');
  
  // State for child registration form
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    age: '',
    gender: '',
    grade: '',
    className: '',
    parent_id: null,
  });
  
  // State for edit form
  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    dob: '',
    age: '',
    gender: '',
    grade: '',
    className: '',
  });
  
  // State for children list
  const [children, setChildren] = useState([]);
  const [editingChild, setEditingChild] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingChildId, setDeletingChildId] = useState(null);
  
  // Loading and response states
  const [loading, setLoading] = useState({
    register: false,
    fetch: false,
    edit: false,
    delete: false
  });
  const [responseMessage, setResponseMessage] = useState('');

  // Get parent ID and fetch children on component mount
  useEffect(() => {
    const storedParentId = localStorage.getItem('parent_id');
    const parsedParentId =
      storedParentId && !isNaN(parseInt(storedParentId, 10))
        ? parseInt(storedParentId, 10)
        : null;

    if (parsedParentId) {
      setFormData((prev) => ({ ...prev, parent_id: parsedParentId }));
      fetchChildren(parsedParentId);
    } else {
      toast.error('Parent ID not found. Please log in again.');
      navigate('/login');
    }
  }, [navigate]);
  
  // Function to fetch children for the parent
  const fetchChildren = async (parentId) => {
    setLoading(prev => ({ ...prev, fetch: true }));
    
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.CHILDREN}/${parentId}`);
      const childrenData = Array.isArray(response.data) ? response.data : response.data.children || [];
      setChildren(childrenData);
    } catch (error) {
      console.error('Error fetching children:', error);
      
      if (error.response) {
        const { status } = error.response;
        
        if (status === 401) {
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
        } else if (status === 404) {
          // No children found is not an error
          setChildren([]);
        } else {
          toast.error('Failed to load children data.');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'dob') {
      const age = calculateAge(value);
      const className = getClassByAge(age);
      const grade = getGradeByAge(age);
      setFormData((prev) => ({
        ...prev,
        dob: value,
        age,
        className,
        grade,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Edit child form handlers
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dob') {
      const age = calculateAge(value);
      const className = getClassByAge(age);
      const grade = getGradeByAge(age);
      setEditFormData(prev => ({
        ...prev,
        dob: value,
        age,
        className,
        grade,
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  // Start editing a child
  const startEditing = (child) => {
    setEditFormData({
      id: child.id,
      name: child.name,
      dob: formatDate(child.dob),
      age: child.age,
      gender: child.gender,
      grade: child.grade,
      className: child.className,
    });
    setEditingChild(child.id);
    setIsEditing(true);
    setActiveTab('edit');
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingChild(null);
    setIsEditing(false);
    setActiveTab('manage');
  };
  
  // Submit edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, edit: true }));
    
    const parentId = formData.parent_id;
    
    if (!parentId) {
      toast.error('Parent ID is missing or invalid. Please log in again.');
      setLoading(prev => ({ ...prev, edit: false }));
      return;
    }
    
    if (
      !editFormData.name ||
      !editFormData.dob ||
      !editFormData.gender ||
      !editFormData.age ||
      !editFormData.grade ||
      !editFormData.className
    ) {
      toast.error('Please fill out all required fields.');
      setLoading(prev => ({ ...prev, edit: false }));
      return;
    }
    
    const data = {
      id: editFormData.id,
      name: editFormData.name,
      dob: editFormData.dob,
      age: parseInt(editFormData.age, 10),
      gender: editFormData.gender,
      grade: editFormData.grade,
      className: editFormData.className,
      parent_id: parentId,
    };
    
    try {
      const response = await api.put(
        `${API_CONFIG.ENDPOINTS.CHILDREN}/${editFormData.id}`,
        data
      );
      
      toast.success('Child updated successfully!');
      setIsEditing(false);
      setEditingChild(null);
      setActiveTab('manage');
      
      // Refresh the children list
      fetchChildren(parentId);
    } catch (error) {
      console.error('Error updating child:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
        } else {
          const errorText = data.errors
            ? data.errors.map((e) => e.msg).join(', ')
            : data.message || 'Update failed. Please try again.';
          toast.error(errorText);
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setLoading(prev => ({ ...prev, edit: false }));
    }
  };
  
  // Delete child
  const handleDeleteChild = async (childId) => {
    setIsDeleting(true);
    setDeletingChildId(childId);
    setLoading(prev => ({ ...prev, delete: true }));
    
    const parentId = formData.parent_id;
    
    try {
      await api.delete(`${API_CONFIG.ENDPOINTS.CHILDREN}/${childId}`);
      
      toast.success('Child deleted successfully!');
      
      // Refresh the children list
      fetchChildren(parentId);
    } catch (error) {
      console.error('Error deleting child:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
        } else {
          const errorText = data.message || 'Delete failed. Please try again.';
          toast.error(errorText);
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setIsDeleting(false);
      setDeletingChildId(null);
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, register: true }));
    setResponseMessage('');

    const parentId =
      formData.parent_id && Number.isInteger(formData.parent_id)
        ? formData.parent_id
        : null;

    if (!parentId) {
      setResponseMessage('Parent ID is missing or invalid. Please log in again.');
      setLoading(prev => ({ ...prev, register: false }));
      return;
    }

    if (
      !formData.name ||
      !formData.dob ||
      !formData.gender ||
      !formData.age ||
      !formData.grade ||
      !formData.className
    ) {
      setResponseMessage('Please fill out all required fields.');
      setLoading(prev => ({ ...prev, register: false }));
      return;
    }

    const data = {
      name: formData.name,
      dob: formData.dob,
      age: parseInt(formData.age, 10),
      gender: formData.gender,
      grade: formData.grade,
      className: formData.className,
      parent_id: parentId,
    };

    try {
      const response = await api.post(
        '/auth/register-child',
        data
      );

      toast.success('Child registered successfully!');
      setResponseMessage('Child registered successfully!');
      setFormData({
        name: '',
        dob: '',
        age: '',
        gender: '',
        grade: '',
        className: '',
        parent_id: parentId,
      });
      
      // Refresh the children list
      fetchChildren(parentId);
      
      // Switch to manage tab after successful registration
      setTimeout(() => {
        setActiveTab('manage');
      }, 1500);
    } catch (error) {
      console.error('Error registering child:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
        } else {
          const errorText = data.errors
            ? data.errors.map((e) => e.msg).join(', ')
            : data.message || 'Registration failed. Please try again.';
          setResponseMessage(errorText);
          toast.error(errorText);
        }
      } else {
        const errorMsg = 'Network error. Please check your connection.';
        setResponseMessage(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(prev => ({ ...prev, register: false }));
    }
  };

  // Render tab navigation
  const renderTabs = () => (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        onClick={() => setActiveTab('register')}
        className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
          activeTab === 'register'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <FaUserPlus className="mr-2" />
        Register New Child
      </button>
      <button
        onClick={() => setActiveTab('manage')}
        className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
          activeTab === 'manage' || activeTab === 'edit'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <FaList className="mr-2" />
        Manage Children
      </button>
    </div>
  );

  // Render child registration form
  const renderRegisterForm = () => (
    <>
      <h3 className="text-xl font-bold mb-4 text-blue-700">
        Register New Child
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              readOnly
              className="w-full p-2 border border-gray-300 bg-gray-100 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">Grade</label>
            <input
              type="text"
              name="grade"
              value={formData.grade}
              readOnly
              className="w-full p-2 border border-gray-300 bg-gray-100 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Class Name</label>
            <input
              type="text"
              name="className"
              value={formData.className}
              readOnly
              required
              className="w-full p-2 border border-gray-300 bg-gray-100 rounded-md"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
          disabled={loading.register}
        >
          {loading.register ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Registering...
            </>
          ) : (
            <>
              <FaUserPlus className="mr-2" />
              Register Child
            </>
          )}
        </button>
      </form>
      {responseMessage && (
        <div className="mt-4 p-4 text-center text-white bg-blue-500 rounded-md">
          {responseMessage}
        </div>
      )}
    </>
  );

  // Render children list for management
  const renderChildrenList = () => (
    <>
      <h3 className="text-xl font-bold mb-4 text-blue-700">
        Manage Your Children
      </h3>
      
      {loading.fetch ? (
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-blue-500 mr-2" />
          <span>Loading children...</span>
        </div>
      ) : children.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FaChild className="text-gray-400 text-5xl mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No children registered yet.</p>
          <button 
            onClick={() => setActiveTab('register')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            Register a Child
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map(child => (
            <div key={child.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold">{child.name}</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Age:</span> {child.age}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Gender:</span> {child.gender}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Grade:</span> {child.grade}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Class:</span> {child.className}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Date of Birth:</span> {new Date(child.dob).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditing(child)}
                    className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteChild(child.id)}
                    className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition"
                    title="Delete"
                    disabled={isDeleting && deletingChildId === child.id}
                  >
                    {isDeleting && deletingChildId === child.id ? 
                      <FaSpinner className="animate-spin" /> : 
                      <FaTrash />
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // Render edit form
  const renderEditForm = () => (
    <>
      <div className="flex items-center mb-4">
        <button 
          onClick={cancelEditing}
          className="mr-2 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft />
        </button>
        <h3 className="text-xl font-bold text-blue-700">
          Edit Child Information
        </h3>
      </div>
      
      <form onSubmit={handleEditSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Full Name</label>
            <input
              type="text"
              name="name"
              value={editFormData.name}
              onChange={handleEditChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={editFormData.dob}
              onChange={handleEditChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Age</label>
            <input
              type="number"
              name="age"
              value={editFormData.age}
              readOnly
              className="w-full p-2 border border-gray-300 bg-gray-100 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Gender</label>
            <select
              name="gender"
              value={editFormData.gender}
              onChange={handleEditChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">Grade</label>
            <input
              type="text"
              name="grade"
              value={editFormData.grade}
              readOnly
              className="w-full p-2 border border-gray-300 bg-gray-100 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Class Name</label>
            <input
              type="text"
              name="className"
              value={editFormData.className}
              readOnly
              required
              className="w-full p-2 border border-gray-300 bg-gray-100 rounded-md"
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
            disabled={loading.edit}
          >
            {loading.edit ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <FaCheck className="mr-2" />
                Save Changes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={cancelEditing}
            className="flex-1 bg-gray-600 text-white font-semibold py-2 rounded-md hover:bg-gray-700 transition flex items-center justify-center"
          >
            <FaTimes className="mr-2" />
            Cancel
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 shadow-xl rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Child Management
        </h2>
        
        {renderTabs()}
        
        {activeTab === 'register' && renderRegisterForm()}
        {activeTab === 'manage' && renderChildrenList()}
        {activeTab === 'edit' && renderEditForm()}
        
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="block text-center bg-gray-600 text-white font-semibold py-2 rounded-md hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChildManagement;
