import React, { useState, useEffect } from 'react';
import { FaBaby, FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaUserGraduate, FaCalendarAlt } from 'react-icons/fa';
import adminService from '../../services/adminService';
import { showTopNotification } from '../TopNotificationManager';

const ChildrenManagement = ({ isDark = false }) => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [parents, setParents] = useState([]);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [newChild, setNewChild] = useState({
    name: '',
    age: '',
    parent_id: '',
    class_name: '',
    allergies: '',
    medical_notes: '',
    emergency_contact: ''
  });

  const classOptions = [
    'Little Explorers (Below 2 years)',
    'Curious Cubs (2-3 years)',
    'Panda (4-6 years)'
  ];

  useEffect(() => {
    loadChildren();
    loadParents();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      // Get ALL children using the getAllChildren parameter
      const response = await adminService.getChildren(1, 500, '', true); // Use getAllChildren = true
      setChildren(response.data || []);
      console.log(`✅ Loaded ${response.data?.length || 0} children total (showing ALL children from database)`);
      setIsFallbackMode(false);
    } catch (error) {
      console.error('Failed to load children:', error);
      
      // Handle 500 errors gracefully with fallback data
      if (error.response?.status === 500) {
        console.warn('Backend children API not available, using fallback data');
        toast.warning('Children management API is currently unavailable. Using demo data.');
        setIsFallbackMode(true);
        
        // Provide fallback demo data
        const fallbackChildren = [
          {
            id: 1,
            name: 'Emma Johnson',
            age: 4,
            parent_id: 1,
            parent_name: 'Sarah Johnson',
            class_name: 'Explorer Cubs',
            allergies: 'Peanuts',
            medical_notes: 'Asthma inhaler needed',
            emergency_contact: '123-456-7890',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Liam Smith',
            age: 3,
            parent_id: 2,
            parent_name: 'Mike Smith',
            class_name: 'Panda Explorers',
            allergies: 'None',
            medical_notes: '',
            emergency_contact: '098-765-4321',
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            name: 'Olivia Brown',
            age: 5,
            parent_id: 3,
            parent_name: 'Jessica Brown',
            class_name: 'Pioneer Leaders',
            allergies: 'Dairy',
            medical_notes: 'Lactose intolerant',
            emergency_contact: '555-123-4567',
            created_at: new Date().toISOString()
          }
        ];
        setChildren(fallbackChildren);
      } else {
        toast.error('Failed to load children data');
        setIsFallbackMode(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadParents = async () => {
    try {
      const response = await adminService.getUsers(1, 100, ''); // Get all parents
      const allUsers = response.data || [];
      const parentUsers = allUsers.filter(user => user.role === 'parent');
      setParents(parentUsers);
    } catch (error) {
      console.error('Failed to load parents:', error);
      
      // Provide fallback parent data
      if (error.response?.status === 500) {
        const fallbackParents = [
          { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com' },
          { id: 2, name: 'Mike Smith', email: 'mike@example.com' },
          { id: 3, name: 'Jessica Brown', email: 'jessica@example.com' }
        ];
        setParents(fallbackParents);
      }
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    try {
      await adminService.createChild(newChild);
      toast.success('Child enrolled successfully!');
      setShowAddModal(false);
      setNewChild({
        name: '',
        age: '',
        parent_id: '',
        class_name: '',
        allergies: '',
        medical_notes: '',
        emergency_contact: ''
      });
      loadChildren();
    } catch (error) {
      console.error('Failed to add child:', error);
      
      if (error.response?.status === 500) {
        toast.error('Children enrollment API is currently unavailable. Please try again later.');
      } else {
        toast.error('Failed to enroll child');
      }
    }
  };

  const handleEditChild = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateChild(selectedChild.id, selectedChild);
      toast.success('Child information updated successfully!');
      setShowEditModal(false);
      setSelectedChild(null);
      loadChildren();
    } catch (error) {
      console.error('Failed to update child:', error);
      
      if (error.response?.status === 500) {
        toast.error('Children update API is currently unavailable. Please try again later.');
      } else {
        toast.error('Failed to update child information');
      }
    }
  };

  const handleDeleteChild = async (childId, childName) => {
    if (window.confirm(`Are you sure you want to remove ${childName} from the system?`)) {
      try {
        await adminService.deleteChild(childId);
        toast.success('Child removed successfully');
        loadChildren();
      } catch (error) {
        console.error('Failed to delete child:', error);
        
        if (error.response?.status === 500) {
          toast.error('Children deletion API is currently unavailable. Please try again later.');
        } else {
          toast.error('Failed to remove child');
        }
      }
    }
  };

  const filteredChildren = children.filter(child =>
    child.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.parent_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAgeGroup = (age) => {
    if (age < 3) return 'Toddler';
    if (age < 4) return 'Young Learner';
    if (age < 5) return 'Explorer';
    return 'Pioneer';
  };

  const getClassColor = (className) => {
    if (className?.includes('Cubs')) return 'bg-blue-100 text-blue-800';
    if (className?.includes('Panda')) return 'bg-green-100 text-green-800';
    if (className?.includes('Explorer')) return 'bg-purple-100 text-purple-800';
    if (className?.includes('Pioneer')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`px-3 py-4 sm:p-6 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg transition-colors duration-200`}>
      {/* Fallback Mode Indicator */}
      {isFallbackMode && (
        <div className={`mb-4 p-3 ${isDark ? 'bg-yellow-900 border-yellow-600' : 'bg-yellow-50 border-yellow-400'} border-l-4 rounded-lg transition-colors duration-200`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${isDark ? 'text-yellow-300' : 'text-yellow-400'}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className={`text-sm ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>
                <strong>Demo Mode:</strong> Backend API unavailable. Showing sample data for demonstration.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
            <FaBaby className="text-blue-500" />
            Children Management
          </h2>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Manage student enrollment and information</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-base sm:text-sm"
          disabled={isFallbackMode}
        >
          <FaPlus size={16} />
          Enroll Child
        </button>
      </div>

      {/* Mobile-First Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search by name, class, or parent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 sm:py-2 text-base sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </div>

      {/* Mobile-First Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} p-4 rounded-lg transition-colors duration-200`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-blue-200' : 'text-gray-600'}`}>Total Children</p>
              <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>{children.length}</p>
            </div>
            <FaBaby className="text-blue-500 text-xl sm:text-2xl" />
          </div>
        </div>
        <div className={`${isDark ? 'bg-green-900' : 'bg-green-50'} p-4 rounded-lg transition-colors duration-200`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-green-200' : 'text-gray-600'}`}>Active Classes</p>
              <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                {new Set(children.map(c => c.class_name)).size}
              </p>
            </div>
            <FaUserGraduate className="text-green-500 text-xl sm:text-2xl" />
          </div>
        </div>
        <div className={`${isDark ? 'bg-purple-900' : 'bg-purple-50'} p-4 rounded-lg transition-colors duration-200`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>Average Age</p>
              <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                {children.length > 0 ? Math.round(children.reduce((sum, c) => sum + (c.age || 0), 0) / children.length) : 0}
              </p>
            </div>
            <FaCalendarAlt className="text-purple-500 text-xl sm:text-2xl" />
          </div>
        </div>
        <div className={`${isDark ? 'bg-orange-900' : 'bg-orange-50'} p-4 rounded-lg transition-colors duration-200`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-orange-200' : 'text-gray-600'}`}>New This Month</p>
              <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
                {children.filter(c => {
                  if (!c.created_at) return false;
                  const createdDate = new Date(c.created_at);
                  const now = new Date();
                  return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <FaPlus className="text-orange-500 text-xl sm:text-2xl" />
          </div>
        </div>
      </div>

      {/* Mobile-First Children Cards */}
      <div className="block sm:hidden space-y-4">
        {filteredChildren.map((child) => (
          <div key={child.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 border ${isDark ? 'border-gray-600' : 'border-gray-200'} transition-colors duration-200`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${isDark ? 'bg-blue-800' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                  <FaBaby className="text-blue-500" />
                </div>
                <div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{child.name}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getClassColor(child.class_name)}`}>
                    {child.class_name || 'Not Assigned'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedChild(child);
                    setShowEditModal(true);
                  }}
                  className={`p-2 text-blue-600 ${isDark ? 'hover:bg-blue-900' : 'hover:bg-blue-50'} rounded-lg transition-colors duration-200`}
                  disabled={isFallbackMode}
                >
                  <FaEdit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteChild(child.id, child.name)}
                  className={`p-2 text-red-600 ${isDark ? 'hover:bg-red-900' : 'hover:bg-red-50'} rounded-lg transition-colors duration-200`}
                  disabled={isFallbackMode}
                >
                  <FaTrash size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Age:</span>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{child.age} years old</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Parent:</span>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{child.parent_name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Emergency:</span>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{child.emergency_contact || 'Not provided'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className={`min-w-full divide-y ${isDark ? 'divide-gray-600' : 'divide-gray-200'} transition-colors duration-200`}>
          <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Child</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Age & Class</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Parent</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Emergency Contact</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Enrolled</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`${isDark ? 'bg-gray-800 divide-gray-600' : 'bg-white divide-gray-200'} divide-y transition-colors duration-200`}>
            {filteredChildren.map((child) => (
              <tr key={child.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${isDark ? 'bg-blue-800' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                      <FaBaby className="text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{child.name}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{getAgeGroup(child.age)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{child.age} years old</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getClassColor(child.class_name)}`}>
                    {child.class_name || 'Not Assigned'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{child.parent_name || 'Unknown'}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{child.parent_email || ''}</div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  {child.emergency_contact || 'Not provided'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {child.created_at ? new Date(child.created_at).toLocaleDateString() : 'Unknown'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedChild(child);
                        setShowEditModal(true);
                      }}
                      className={`text-blue-600 ${isDark ? 'hover:text-blue-400' : 'hover:text-blue-900'} transition-colors duration-200`}
                      title="Edit"
                      disabled={isFallbackMode}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteChild(child.id, child.name)}
                      className={`text-red-600 ${isDark ? 'hover:text-red-400' : 'hover:text-red-900'} transition-colors duration-200`}
                      title="Delete"
                      disabled={isFallbackMode}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredChildren.length === 0 && (
        <div className="text-center py-8">
          <FaBaby className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <h3 className={`mt-2 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>No children found</h3>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by enrolling a new child.'}
          </p>
        </div>
      )}

      {/* Add Child Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto transition-colors duration-200`}>
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Enroll New Child</h3>
            <form onSubmit={handleAddChild}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Child's Name</label>
                  <input
                    type="text"
                    required
                    value={newChild.name}
                    onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Age</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={newChild.age}
                    onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Parent</label>
                  <select
                    required
                    value={newChild.parent_id}
                    onChange={(e) => setNewChild({ ...newChild, parent_id: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select a parent</option>
                    {parents.map(parent => (
                      <option key={parent.id} value={parent.id}>{parent.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Class</label>
                  <select
                    required
                    value={newChild.class_name}
                    onChange={(e) => setNewChild({ ...newChild, class_name: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select a class</option>
                    {classOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Emergency Contact</label>
                  <input
                    type="text"
                    value={newChild.emergency_contact}
                    onChange={(e) => setNewChild({ ...newChild, emergency_contact: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Phone number or contact info"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Allergies</label>
                  <textarea
                    value={newChild.allergies}
                    onChange={(e) => setNewChild({ ...newChild, allergies: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Any known allergies..."
                    rows="2"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Medical Notes</label>
                  <textarea
                    value={newChild.medical_notes}
                    onChange={(e) => setNewChild({ ...newChild, medical_notes: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Any medical conditions or notes..."
                    rows="2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-200 ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors duration-200"
                >
                  Enroll Child
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Child Modal */}
      {showEditModal && selectedChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Child Information</h3>
            <form onSubmit={handleEditChild}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Child's Name</label>
                  <input
                    type="text"
                    required
                    value={selectedChild.name}
                    onChange={(e) => setSelectedChild({ ...selectedChild, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={selectedChild.age}
                    onChange={(e) => setSelectedChild({ ...selectedChild, age: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Class</label>
                  <select
                    required
                    value={selectedChild.class_name}
                    onChange={(e) => setSelectedChild({ ...selectedChild, class_name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Class</option>
                    {classOptions.map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                  <input
                    type="text"
                    value={selectedChild.emergency_contact || ''}
                    onChange={(e) => setSelectedChild({ ...selectedChild, emergency_contact: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone number or contact person"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Allergies</label>
                  <textarea
                    value={selectedChild.allergies || ''}
                    onChange={(e) => setSelectedChild({ ...selectedChild, allergies: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Any known allergies..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Medical Notes</label>
                  <textarea
                    value={selectedChild.medical_notes || ''}
                    onChange={(e) => setSelectedChild({ ...selectedChild, medical_notes: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Any medical conditions or notes..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedChild(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Update Child
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildrenManagement; 