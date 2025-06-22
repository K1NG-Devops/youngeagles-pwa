import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../../config/api';
import { api } from '../../services/httpClient';
import { toast } from 'react-toastify';
import { 
  FaChild, FaPlus, FaEdit, FaTrash, FaPen, FaSpinner, FaUserPlus, FaList, 
  FaCheck, FaTimes, FaArrowLeft, FaUser, FaMedkit, FaPhone, FaUtensils, 
  FaGraduationCap, FaCamera, FaStickyNote, FaHeart, FaEye, FaEyeSlash,
  FaCalendar, FaMapMarkerAlt, FaAllergies, FaPrescriptionBottle
} from 'react-icons/fa';

const getClassByAge = (age) => {
  if (age < 2) return 'Little Explorers';
  if (age >= 2 && age <= 3) return 'Curious Cubs';
  if (age >= 4 && age <= 6) return 'Panda Class';
  return 'General Class';
};

const getGradeByAge = (age) => {
  if (age < 2) return 'Nursery';
  if (age >= 2 && age <= 3) return 'Elementary';
  if (age === 4 || age === 5) return 'Grade RR';
  if (age === 6) return 'Grade R';
  return 'General';
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
  return date.toISOString().split('T')[0];
};

const ChildManagement = () => {
  const navigate = useNavigate();
  
  // State for tab management
  const [activeTab, setActiveTab] = useState('register');
  const [activeProfileSection, setActiveProfileSection] = useState('basic');
  
  // State for comprehensive child profile form
  const [profileData, setProfileData] = useState({
    // Basic Information
    name: '',
    dob: '',
    age: '',
    gender: '',
    grade: '',
    className: '',
    parent_id: null,
    
    // Medical Information
    allergies: '',
    medications: '',
    medicalConditions: '',
    doctorName: '',
    doctorPhone: '',
    medicalNotes: '',
    
    // Emergency Contacts
    emergencyContacts: [
      { name: '', relationship: '', phone: '', email: '', isPrimary: true },
      { name: '', relationship: '', phone: '', email: '', isPrimary: false }
    ],
    
    // Dietary Requirements
    dietaryRestrictions: '',
    foodAllergies: '',
    preferredFoods: '',
    dislikedFoods: '',
    specialDietNotes: '',
    
    // Academic Information
    learningStyle: '',
    strengths: '',
    challenges: '',
    specialNeeds: '',
    accommodations: '',
    previousSchool: '',
    academicNotes: '',
    
    // Profile & Preferences
    profilePicture: null,
    interests: '',
    hobbies: '',
    favoriteSubjects: '',
    extracurriculars: '',
    personalityTraits: '',
    
    // Parent Notes
    parentNotes: '',
    teacherCommunication: '',
    behaviorNotes: '',
    routinePreferences: ''
  });
  
  // State for edit form
  const [editProfileData, setEditProfileData] = useState({ ...profileData });
  
  // State for children list
  const [children, setChildren] = useState([]);
  const [editingChild, setEditingChild] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingChildId, setDeletingChildId] = useState(null);
  const [viewingChild, setViewingChild] = useState(null);
  
  // Loading and response states
  const [loading, setLoading] = useState({
    register: false,
    fetch: false,
    edit: false,
    delete: false,
    upload: false
  });
  const [responseMessage, setResponseMessage] = useState('');

  // Get parent ID and fetch children on component mount
  useEffect(() => {
    // Try multiple sources for parent_id like PWAParentDashboard does
    const authUserId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))?.id : null;
    const storedParentId = localStorage.getItem('parent_id');
    const parentId = authUserId || storedParentId;
    
    console.log('ChildManagement: Looking for parent_id:', {
      authUserId,
      storedParentId,
      finalParentId: parentId
    });
    
    const parsedParentId = parentId && !isNaN(parseInt(parentId, 10))
      ? parseInt(parentId, 10) : null;

    if (parsedParentId) {
      console.log('ChildManagement: Using parent_id:', parsedParentId);
      setProfileData(prev => ({ ...prev, parent_id: parsedParentId }));
      
      // Store parent_id for future use
      localStorage.setItem('parent_id', parsedParentId.toString());
      
      fetchChildren(parsedParentId);
    } else {
      console.warn('ChildManagement: No valid parent_id found');
      toast.error('Parent ID not found. Please log in again.');
      navigate('/login');
    }
  }, [navigate]);
  
  // Function to fetch children for the parent
  const fetchChildren = async (parentId) => {
    console.log('ChildManagement: fetchChildren called with parentId:', parentId);
    setLoading(prev => ({ ...prev, fetch: true }));
    
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.CHILDREN}/${parentId}`;
      console.log('ChildManagement: Calling API endpoint:', endpoint);
      
      const response = await api.get(endpoint);
      
      console.log('ChildManagement: API response:', {
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data)
      });
      
      const childrenData = Array.isArray(response.data) ? response.data : response.data.children || [];
      
      console.log('ChildManagement: Processed children data:', {
        count: childrenData.length,
        children: childrenData.map(child => ({ id: child.id, name: child.name }))
      });
      
      setChildren(childrenData);
      
      if (childrenData.length === 0) {
        console.log('ChildManagement: No children found for parent', parentId);
      }
    } catch (error) {
      console.error('ChildManagement: Error fetching children:', error);
      
      if (error.response) {
        const { status } = error.response;
        console.log('ChildManagement: API error status:', status);
        
        if (status === 401) {
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
        } else if (status === 404) {
          console.log('ChildManagement: 404 - Setting empty children array');
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

  // Handle form changes
  const handleProfileChange = useCallback((e) => {
    const { name, value, type, files } = e.target;
    const setCurrentData = isEditing ? setEditProfileData : setProfileData;

    if (type === 'file') {
      setCurrentData(prev => ({ ...prev, [name]: files[0] }));
    } else if (name === 'dob') {
      const age = calculateAge(value);
      const className = getClassByAge(age);
      const grade = getGradeByAge(age);
      setCurrentData(prev => ({
        ...prev,
        dob: value,
        age,
        className,
        grade,
      }));
    } else {
      setCurrentData(prev => ({ ...prev, [name]: value }));
    }
  }, [isEditing]);

  // Handle emergency contact changes
  const handleEmergencyContactChange = (index, field, value) => {
    const currentData = isEditing ? editProfileData : profileData;
    const setCurrentData = isEditing ? setEditProfileData : setProfileData;
    
    setCurrentData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  // Add emergency contact
  const addEmergencyContact = () => {
    const currentData = isEditing ? editProfileData : profileData;
    const setCurrentData = isEditing ? setEditProfileData : setProfileData;
    
    setCurrentData(prev => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        { name: '', relationship: '', phone: '', email: '', isPrimary: false }
      ]
    }));
  };

  // Remove emergency contact
  const removeEmergencyContact = (index) => {
    const currentData = isEditing ? editProfileData : profileData;
    const setCurrentData = isEditing ? setEditProfileData : setProfileData;
    
    if (currentData.emergencyContacts.length > 1) {
      setCurrentData(prev => ({
        ...prev,
        emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
      }));
    }
  };

  // Submit comprehensive profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const loadingKey = isEditing ? 'edit' : 'register';
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    setResponseMessage('');

    const currentData = isEditing ? editProfileData : profileData;
    const parentId = currentData.parent_id || profileData.parent_id;

    if (!parentId) {
      setResponseMessage('Parent ID is missing or invalid. Please log in again.');
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
      return;
    }

    // Validate required fields
    if (!currentData.name || !currentData.dob || !currentData.gender) {
      setResponseMessage('Please fill out all required basic information fields.');
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
      return;
    }

    const data = {
      // Basic info
      name: currentData.name,
      dob: currentData.dob,
      age: parseInt(currentData.age, 10),
      gender: currentData.gender,
      grade: currentData.grade,
      className: currentData.className,
      parent_id: parentId,
      
      // Extended profile data (JSON format for flexibility)
      profile_data: {
        medical: {
          allergies: currentData.allergies,
          medications: currentData.medications,
          medicalConditions: currentData.medicalConditions,
          doctorName: currentData.doctorName,
          doctorPhone: currentData.doctorPhone,
          medicalNotes: currentData.medicalNotes
        },
        emergencyContacts: currentData.emergencyContacts.filter(contact => contact.name),
        dietary: {
          restrictions: currentData.dietaryRestrictions,
          allergies: currentData.foodAllergies,
          preferred: currentData.preferredFoods,
          disliked: currentData.dislikedFoods,
          notes: currentData.specialDietNotes
        },
        academic: {
          learningStyle: currentData.learningStyle,
          strengths: currentData.strengths,
          challenges: currentData.challenges,
          specialNeeds: currentData.specialNeeds,
          accommodations: currentData.accommodations,
          previousSchool: currentData.previousSchool,
          notes: currentData.academicNotes
        },
        preferences: {
          interests: currentData.interests,
          hobbies: currentData.hobbies,
          favoriteSubjects: currentData.favoriteSubjects,
          extracurriculars: currentData.extracurriculars,
          personalityTraits: currentData.personalityTraits
        },
        parentNotes: {
          general: currentData.parentNotes,
          teacherCommunication: currentData.teacherCommunication,
          behavior: currentData.behaviorNotes,
          routine: currentData.routinePreferences
        }
      }
    };

    try {
      let response;
      
      if (isEditing) {
        // Update existing child
        response = await api.put(`${API_CONFIG.ENDPOINTS.CHILDREN}/${currentData.id}`, data);
        toast.success('Child profile updated successfully!');
        setResponseMessage('Child profile updated successfully!');
        
        // Reset editing state
        setIsEditing(false);
        setEditingChild(null);
        setActiveTab('manage');
      } else {
        // Create new child
        response = await api.post('/auth/register-child', data);
        toast.success('Child profile created successfully!');
        setResponseMessage('Child profile created successfully!');
        
        // Reset form
        setProfileData({
          name: '', dob: '', age: '', gender: '', grade: '', className: '', parent_id: parentId,
          allergies: '', medications: '', medicalConditions: '', doctorName: '', doctorPhone: '', medicalNotes: '',
          emergencyContacts: [
            { name: '', relationship: '', phone: '', email: '', isPrimary: true },
            { name: '', relationship: '', phone: '', email: '', isPrimary: false }
          ],
          dietaryRestrictions: '', foodAllergies: '', preferredFoods: '', dislikedFoods: '', specialDietNotes: '',
          learningStyle: '', strengths: '', challenges: '', specialNeeds: '', accommodations: '', previousSchool: '', academicNotes: '',
          profilePicture: null, interests: '', hobbies: '', favoriteSubjects: '', extracurriculars: '', personalityTraits: '',
          parentNotes: '', teacherCommunication: '', behaviorNotes: '', routinePreferences: ''
        });
        
        // Switch to manage tab
        setTimeout(() => {
          setActiveTab('manage');
        }, 1500);
      }
      
      // Refresh children list
      fetchChildren(parentId);
      
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'registering'} child:`, error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
        } else {
          const errorText = data.errors
            ? data.errors.map((e) => e.msg).join(', ')
            : data.message || `${isEditing ? 'Update' : 'Registration'} failed. Please try again.`;
          setResponseMessage(errorText);
          toast.error(errorText);
        }
      } else {
        const errorMsg = 'Network error. Please check your connection.';
        setResponseMessage(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // View child profile
  const viewChildProfile = (child) => {
    setViewingChild(child);
    setActiveTab('view');
  };

  // Start editing a child
  const startEditing = (child) => {
    // Load existing data if available
    const profile = child.profile_data || {};
    
    setEditProfileData({
      id: child.id,
      name: child.name,
      dob: formatDate(child.dob),
      age: child.age,
      gender: child.gender,
      grade: child.grade,
      className: child.className,
      
      // Medical
      allergies: profile.medical?.allergies || '',
      medications: profile.medical?.medications || '',
      medicalConditions: profile.medical?.medicalConditions || '',
      doctorName: profile.medical?.doctorName || '',
      doctorPhone: profile.medical?.doctorPhone || '',
      medicalNotes: profile.medical?.medicalNotes || '',
      
      // Emergency contacts
      emergencyContacts: profile.emergencyContacts || [
        { name: '', relationship: '', phone: '', email: '', isPrimary: true },
        { name: '', relationship: '', phone: '', email: '', isPrimary: false }
      ],
      
      // Dietary
      dietaryRestrictions: profile.dietary?.restrictions || '',
      foodAllergies: profile.dietary?.allergies || '',
      preferredFoods: profile.dietary?.preferred || '',
      dislikedFoods: profile.dietary?.disliked || '',
      specialDietNotes: profile.dietary?.notes || '',
      
      // Academic
      learningStyle: profile.academic?.learningStyle || '',
      strengths: profile.academic?.strengths || '',
      challenges: profile.academic?.challenges || '',
      specialNeeds: profile.academic?.specialNeeds || '',
      accommodations: profile.academic?.accommodations || '',
      previousSchool: profile.academic?.previousSchool || '',
      academicNotes: profile.academic?.notes || '',
      
      // Preferences
      interests: profile.preferences?.interests || '',
      hobbies: profile.preferences?.hobbies || '',
      favoriteSubjects: profile.preferences?.favoriteSubjects || '',
      extracurriculars: profile.preferences?.extracurriculars || '',
      personalityTraits: profile.preferences?.personalityTraits || '',
      
      // Parent notes
      parentNotes: profile.parentNotes?.general || '',
      teacherCommunication: profile.parentNotes?.teacherCommunication || '',
      behaviorNotes: profile.parentNotes?.behavior || '',
      routinePreferences: profile.parentNotes?.routine || ''
    });
    
    setEditingChild(child.id);
    setIsEditing(true);
    setActiveTab('edit');
    setActiveProfileSection('basic');
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingChild(null);
    setIsEditing(false);
    setActiveTab('manage');
  };

  // Delete child
  const handleDeleteChild = async (childId) => {
    if (!window.confirm('Are you sure you want to delete this child\'s profile? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    setDeletingChildId(childId);
    setLoading(prev => ({ ...prev, delete: true }));
    
    const parentId = profileData.parent_id;
    
    try {
      await api.delete(`${API_CONFIG.ENDPOINTS.CHILDREN}/${childId}`);
      
      toast.success('Child profile deleted successfully!');
      
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

  // Render tab navigation
  const renderTabs = useCallback(() => (
    <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
      <button
        onClick={() => setActiveTab('register')}
        className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
          activeTab === 'register'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <FaUserPlus className="mr-2" />
        Create Profile
      </button>
      <button
        onClick={() => setActiveTab('manage')}
        className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
          activeTab === 'manage'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <FaList className="mr-2" />
        Manage Children
      </button>
      {activeTab === 'view' && (
        <button
          className="flex items-center px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap border-blue-500 text-blue-600"
        >
          <FaEye className="mr-2" />
          View Profile
        </button>
      )}
      {activeTab === 'edit' && (
        <button
          className="flex items-center px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap border-blue-500 text-blue-600"
        >
          <FaEdit className="mr-2" />
          Edit Profile
        </button>
      )}
    </div>
  ), [activeTab]);

  // Render profile section navigation
  const renderProfileSectionTabs = useCallback(() => (
    <div className="flex border-b border-gray-100 mb-6 overflow-x-auto bg-gray-50 rounded-t-lg">
      {[
        { key: 'basic', label: 'Basic Info', icon: FaUser },
        { key: 'medical', label: 'Medical', icon: FaMedkit },
        { key: 'emergency', label: 'Emergency', icon: FaPhone },
        { key: 'dietary', label: 'Dietary', icon: FaUtensils },
        { key: 'academic', label: 'Academic', icon: FaGraduationCap },
        { key: 'preferences', label: 'Interests', icon: FaHeart },
        { key: 'notes', label: 'Parent Notes', icon: FaStickyNote }
      ].map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveProfileSection(key)}
          className={`flex items-center px-3 py-2 border-b-2 font-medium text-xs whitespace-nowrap ${
            activeProfileSection === key
              ? 'border-blue-500 text-blue-600 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Icon className="mr-1 text-sm" />
          {label}
        </button>
      ))}
    </div>
  ), [activeProfileSection]);

  // Render comprehensive profile form sections
  const renderBasicInfoSection = (data, isEdit = false) => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-blue-700 flex items-center">
        <FaUser className="mr-2" />
        Basic Information
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-semibold text-red-500">Full Name *</label>
          <input
            type="text"
            name="name"
            value={data.name}
            onChange={handleProfileChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter child's full name"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-red-500">Date of Birth *</label>
          <input
            type="date"
            name="dob"
            value={data.dob}
            onChange={handleProfileChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Age</label>
          <input
            type="number"
            name="age"
            value={data.age}
            readOnly
            className="w-full p-2 border border-gray-300 bg-gray-100 rounded-md"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-red-500">Gender *</label>
          <select
            name="gender"
            value={data.gender}
            onChange={handleProfileChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            value={data.grade}
            readOnly
            className="w-full p-2 border border-gray-300 bg-gray-100 rounded-md"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Class</label>
          <input
            type="text"
            name="className"
            value={data.className}
            readOnly
            className="w-full p-2 border border-gray-300 bg-gray-100 rounded-md"
          />
        </div>
      </div>
    </div>
  );

  const renderMedicalSection = (data) => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-red-600 flex items-center">
        <FaMedkit className="mr-2" />
        Medical Information
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block mb-1 font-semibold flex items-center">
            <FaAllergies className="mr-1 text-red-500" />
            Allergies
          </label>
          <textarea
            name="allergies"
            value={data.allergies}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="List any known allergies (food, environmental, medication, etc.)"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-semibold flex items-center">
            <FaPrescriptionBottle className="mr-1 text-blue-500" />
            Current Medications
          </label>
          <textarea
            name="medications"
            value={data.medications}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="List current medications, dosage, and frequency"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-semibold">Medical Conditions</label>
          <textarea
            name="medicalConditions"
            value={data.medicalConditions}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any ongoing medical conditions or special health needs"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Doctor's Name</label>
          <input
            type="text"
            name="doctorName"
            value={data.doctorName}
            onChange={handleProfileChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Primary care physician"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Doctor's Phone</label>
          <input
            type="tel"
            name="doctorPhone"
            value={data.doctorPhone}
            onChange={handleProfileChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Doctor's contact number"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-semibold">Medical Notes</label>
          <textarea
            name="medicalNotes"
            value={data.medicalNotes}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional medical information teachers should know"
          />
        </div>
      </div>
    </div>
  );

  const renderEmergencySection = (data) => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-orange-600 flex items-center">
        <FaPhone className="mr-2" />
        Emergency Contacts
      </h4>
      {data.emergencyContacts.map((contact, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-semibold text-gray-700">
              Contact #{index + 1} {contact.isPrimary && <span className="text-orange-500">(Primary)</span>}
            </h5>
            {data.emergencyContacts.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmergencyContact(index)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-semibold">Name</label>
              <input
                type="text"
                value={contact.name}
                onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Relationship</label>
              <select
                value={contact.relationship}
                onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select relationship</option>
                <option value="parent">Parent</option>
                <option value="guardian">Guardian</option>
                <option value="grandparent">Grandparent</option>
                <option value="aunt">Aunt</option>
                <option value="uncle">Uncle</option>
                <option value="sibling">Sibling</option>
                <option value="friend">Family Friend</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold">Phone Number</label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Email</label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => handleEmergencyContactChange(index, 'email', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email address"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={contact.isPrimary}
                onChange={(e) => handleEmergencyContactChange(index, 'isPrimary', e.target.checked)}
                className="mr-2"
              />
              Primary emergency contact
            </label>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addEmergencyContact}
        className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition flex items-center justify-center"
      >
        <FaPlus className="mr-2" />
        Add Another Emergency Contact
      </button>
    </div>
  );

  const renderDietarySection = (data) => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-green-600 flex items-center">
        <FaUtensils className="mr-2" />
        Dietary Information
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block mb-1 font-semibold text-red-500">Food Allergies</label>
          <textarea
            name="foodAllergies"
            value={data.foodAllergies}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any food allergies or intolerances"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-semibold">Dietary Restrictions</label>
          <textarea
            name="dietaryRestrictions"
            value={data.dietaryRestrictions}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Vegetarian, vegan, religious restrictions, etc."
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Preferred Foods</label>
          <textarea
            name="preferredFoods"
            value={data.preferredFoods}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Foods your child enjoys"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Foods to Avoid</label>
          <textarea
            name="dislikedFoods"
            value={data.dislikedFoods}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Foods your child dislikes or refuses"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-semibold">Special Diet Notes</label>
          <textarea
            name="specialDietNotes"
            value={data.specialDietNotes}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional dietary information or instructions"
          />
        </div>
      </div>
    </div>
  );

  const renderAcademicSection = (data) => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-purple-600 flex items-center">
        <FaGraduationCap className="mr-2" />
        Academic Information
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-semibold">Learning Style</label>
          <select
            name="learningStyle"
            value={data.learningStyle}
            onChange={handleProfileChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select learning style</option>
            <option value="visual">Visual Learner</option>
            <option value="auditory">Auditory Learner</option>
            <option value="kinesthetic">Kinesthetic Learner</option>
            <option value="reading">Reading/Writing Learner</option>
            <option value="mixed">Mixed Learning Style</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Previous School</label>
          <input
            type="text"
            name="previousSchool"
            value={data.previousSchool}
            onChange={handleProfileChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Previous school or daycare"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-semibold">Strengths</label>
          <textarea
            name="strengths"
            value={data.strengths}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Academic and personal strengths"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-semibold">Challenges</label>
          <textarea
            name="challenges"
            value={data.challenges}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Areas where your child needs extra support"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-semibold">Special Needs</label>
          <textarea
            name="specialNeeds"
            value={data.specialNeeds}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any special educational needs or diagnoses"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-semibold">Accommodations Needed</label>
          <textarea
            name="accommodations"
            value={data.accommodations}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any accommodations or modifications needed"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-semibold">Academic Notes</label>
          <textarea
            name="academicNotes"
            value={data.academicNotes}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional academic information for teachers"
          />
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = (data) => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-pink-600 flex items-center">
        <FaHeart className="mr-2" />
        Interests & Preferences
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-semibold">Interests</label>
          <textarea
            name="interests"
            value={data.interests}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What does your child enjoy doing?"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Hobbies</label>
          <textarea
            name="hobbies"
            value={data.hobbies}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Current hobbies and activities"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Favorite Subjects</label>
          <textarea
            name="favoriteSubjects"
            value={data.favoriteSubjects}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Subjects your child enjoys most"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Extracurricular Activities</label>
          <textarea
            name="extracurriculars"
            value={data.extracurriculars}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Sports, music, art, etc."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-semibold">Personality Traits</label>
          <textarea
            name="personalityTraits"
            value={data.personalityTraits}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your child's personality (shy, outgoing, creative, etc.)"
          />
        </div>
      </div>
    </div>
  );

  const renderNotesSection = (data) => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-indigo-600 flex items-center">
        <FaStickyNote className="mr-2" />
        Parent Notes & Communication
      </h4>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">General Notes</label>
          <textarea
            name="parentNotes"
            value={data.parentNotes}
            onChange={handleProfileChange}
            rows="4"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional information you'd like teachers to know about your child"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Teacher Communication Preferences</label>
          <textarea
            name="teacherCommunication"
            value={data.teacherCommunication}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="How would you prefer teachers to communicate with you?"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Behavioral Notes</label>
          <textarea
            name="behaviorNotes"
            value={data.behaviorNotes}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Behavioral patterns, triggers, or strategies that work well"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Routine Preferences</label>
          <textarea
            name="routinePreferences"
            value={data.routinePreferences}
            onChange={handleProfileChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Daily routines, nap schedules, or other preferences"
          />
        </div>
      </div>
    </div>
  );

  // Render child registration form
  const renderRegisterForm = useCallback(() => (
    <>
      <h3 className="text-2xl font-bold mb-4 text-blue-700">
        Create Comprehensive Child Profile
      </h3>
      <p className="text-gray-600 mb-6">
        Please fill out as much information as possible to help us provide the best care for your child. 
        Fields marked with * are required.
      </p>
      
      {renderProfileSectionTabs()}
      
      <form onSubmit={handleProfileSubmit}>
        <div className="min-h-[400px]">
          {activeProfileSection === 'basic' && renderBasicInfoSection(profileData)}
          {activeProfileSection === 'medical' && renderMedicalSection(profileData)}
          {activeProfileSection === 'emergency' && renderEmergencySection(profileData)}
          {activeProfileSection === 'dietary' && renderDietarySection(profileData)}
          {activeProfileSection === 'academic' && renderAcademicSection(profileData)}
          {activeProfileSection === 'preferences' && renderPreferencesSection(profileData)}
          {activeProfileSection === 'notes' && renderNotesSection(profileData)}
        </div>
        
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Section {['basic', 'medical', 'emergency', 'dietary', 'academic', 'preferences', 'notes'].indexOf(activeProfileSection) + 1} of 7
          </div>
          <div className="space-x-3">
            {activeProfileSection !== 'basic' && (
              <button
                type="button"
                onClick={() => {
                  const sections = ['basic', 'medical', 'emergency', 'dietary', 'academic', 'preferences', 'notes'];
                  const currentIndex = sections.indexOf(activeProfileSection);
                  setActiveProfileSection(sections[currentIndex - 1]);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
              >
                Previous
              </button>
            )}
            {activeProfileSection !== 'notes' ? (
              <button
                type="button"
                onClick={() => {
                  const sections = ['basic', 'medical', 'emergency', 'dietary', 'academic', 'preferences', 'notes'];
                  const currentIndex = sections.indexOf(activeProfileSection);
                  setActiveProfileSection(sections[currentIndex + 1]);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition flex items-center"
                disabled={loading.register}
              >
                {loading.register ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Create Profile
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
      
      {responseMessage && (
        <div className="mt-4 p-4 text-center text-white bg-blue-500 rounded-md">
          {responseMessage}
        </div>
      )}
    </>
  ), [profileData, handleProfileChange, handleProfileSubmit, loading.register, responseMessage, activeProfileSection, renderProfileSectionTabs]);

  // Render children list for management
  const renderChildrenList = () => (
    <>
      <h3 className="text-2xl font-bold mb-4 text-blue-700">
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
            Create First Profile
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map(child => {
            const profile = child.profile_data || {};
            const hasExtendedProfile = Object.keys(profile).length > 0;
            
            return (
              <div key={child.id} className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition">
                {/* Child Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaChild className="text-blue-600 text-xl" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{child.name}</h4>
                          <p className="text-sm text-gray-500">
                            {child.age} years old • {child.className}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewChildProfile(child)}
                        className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition"
                        title="View Full Profile"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => startEditing(child)}
                        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
                        title="Edit Profile"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteChild(child.id)}
                        className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition"
                        title="Delete Profile"
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
                
                {/* Quick Info */}
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Gender:</span>
                      <p className="capitalize">{child.gender}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Grade:</span>
                      <p>{child.grade}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Date of Birth:</span>
                      <p>{new Date(child.dob).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Profile Status:</span>
                      <p className={hasExtendedProfile ? "text-green-600" : "text-orange-600"}>
                        {hasExtendedProfile ? "Complete" : "Basic Only"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Profile Highlights */}
                  {hasExtendedProfile && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {profile.medical?.allergies && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <FaAllergies className="mr-1" />
                            Has Allergies
                          </span>
                        )}
                        {profile.dietary?.allergies && (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <FaUtensils className="mr-1" />
                            Food Allergies
                          </span>
                        )}
                        {profile.academic?.specialNeeds && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <FaGraduationCap className="mr-1" />
                            Special Needs
                          </span>
                        )}
                        {profile.emergencyContacts?.length > 0 && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <FaPhone className="mr-1" />
                            {profile.emergencyContacts.length} Emergency Contact{profile.emergencyContacts.length > 1 ? 's' : ''}
                          </span>
                        )}
                        {!hasExtendedProfile && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            Click "Edit" to add more details
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!hasExtendedProfile && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Incomplete Profile:</strong> Add medical information, emergency contacts, and preferences for better care.
                        </p>
                        <button
                          onClick={() => startEditing(child)}
                          className="mt-2 text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition"
                        >
                          Complete Profile
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  // Render profile view
  const renderProfileView = () => {
    if (!viewingChild) return null;
    
    const profile = viewingChild.profile_data || {};
    
    return (
      <>
        <div className="flex items-center mb-6">
          <button 
            onClick={() => {
              setViewingChild(null);
              setActiveTab('manage');
            }}
            className="mr-3 text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FaChild className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-700">{viewingChild.name}</h3>
              <p className="text-gray-600">{viewingChild.age} years old • {viewingChild.className}</p>
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => startEditing(viewingChild)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center"
            >
              <FaEdit className="mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-700 flex items-center mb-4">
              <FaUser className="mr-2" />
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <p className="mt-1 text-gray-900">{viewingChild.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="mt-1 text-gray-900">{new Date(viewingChild.dob).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Age</label>
                <p className="mt-1 text-gray-900">{viewingChild.age} years old</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Gender</label>
                <p className="mt-1 text-gray-900 capitalize">{viewingChild.gender}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Grade</label>
                <p className="mt-1 text-gray-900">{viewingChild.grade}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Class</label>
                <p className="mt-1 text-gray-900">{viewingChild.className}</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          {profile.medical && Object.values(profile.medical).some(val => val) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-red-700 flex items-center mb-4">
                <FaMedkit className="mr-2" />
                Medical Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.medical.allergies && (
                  <div>
                    <label className="block text-sm font-medium text-red-600">Allergies</label>
                    <p className="mt-1 text-gray-900">{profile.medical.allergies}</p>
                  </div>
                )}
                {profile.medical.medications && (
                  <div>
                    <label className="block text-sm font-medium text-red-600">Current Medications</label>
                    <p className="mt-1 text-gray-900">{profile.medical.medications}</p>
                  </div>
                )}
                {profile.medical.medicalConditions && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-red-600">Medical Conditions</label>
                    <p className="mt-1 text-gray-900">{profile.medical.medicalConditions}</p>
                  </div>
                )}
                {(profile.medical.doctorName || profile.medical.doctorPhone) && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-red-600">Primary Doctor</label>
                    <p className="mt-1 text-gray-900">
                      {profile.medical.doctorName} {profile.medical.doctorPhone && `• ${profile.medical.doctorPhone}`}
                    </p>
                  </div>
                )}
                {profile.medical.medicalNotes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-red-600">Additional Medical Notes</label>
                    <p className="mt-1 text-gray-900">{profile.medical.medicalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emergency Contacts */}
          {profile.emergencyContacts && profile.emergencyContacts.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-orange-700 flex items-center mb-4">
                <FaPhone className="mr-2" />
                Emergency Contacts
              </h4>
              <div className="space-y-4">
                {profile.emergencyContacts.map((contact, index) => (
                  <div key={index} className="bg-white border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{contact.name}</h5>
                      {contact.isPrimary && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          Primary Contact
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Relationship:</span> {contact.relationship}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Phone:</span> {contact.phone}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Email:</span> {contact.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dietary Information */}
          {profile.dietary && Object.values(profile.dietary).some(val => val) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-green-700 flex items-center mb-4">
                <FaUtensils className="mr-2" />
                Dietary Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.dietary.allergies && (
                  <div>
                    <label className="block text-sm font-medium text-green-600">Food Allergies</label>
                    <p className="mt-1 text-gray-900">{profile.dietary.allergies}</p>
                  </div>
                )}
                {profile.dietary.restrictions && (
                  <div>
                    <label className="block text-sm font-medium text-green-600">Dietary Restrictions</label>
                    <p className="mt-1 text-gray-900">{profile.dietary.restrictions}</p>
                  </div>
                )}
                {profile.dietary.preferred && (
                  <div>
                    <label className="block text-sm font-medium text-green-600">Preferred Foods</label>
                    <p className="mt-1 text-gray-900">{profile.dietary.preferred}</p>
                  </div>
                )}
                {profile.dietary.disliked && (
                  <div>
                    <label className="block text-sm font-medium text-green-600">Foods to Avoid</label>
                    <p className="mt-1 text-gray-900">{profile.dietary.disliked}</p>
                  </div>
                )}
                {profile.dietary.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-green-600">Special Diet Notes</label>
                    <p className="mt-1 text-gray-900">{profile.dietary.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Academic Information */}
          {profile.academic && Object.values(profile.academic).some(val => val) && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-purple-700 flex items-center mb-4">
                <FaGraduationCap className="mr-2" />
                Academic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.academic.learningStyle && (
                  <div>
                    <label className="block text-sm font-medium text-purple-600">Learning Style</label>
                    <p className="mt-1 text-gray-900">{profile.academic.learningStyle}</p>
                  </div>
                )}
                {profile.academic.previousSchool && (
                  <div>
                    <label className="block text-sm font-medium text-purple-600">Previous School</label>
                    <p className="mt-1 text-gray-900">{profile.academic.previousSchool}</p>
                  </div>
                )}
                {profile.academic.strengths && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-purple-600">Strengths</label>
                    <p className="mt-1 text-gray-900">{profile.academic.strengths}</p>
                  </div>
                )}
                {profile.academic.challenges && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-purple-600">Challenges</label>
                    <p className="mt-1 text-gray-900">{profile.academic.challenges}</p>
                  </div>
                )}
                {profile.academic.specialNeeds && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-purple-600">Special Needs</label>
                    <p className="mt-1 text-gray-900">{profile.academic.specialNeeds}</p>
                  </div>
                )}
                {profile.academic.accommodations && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-purple-600">Accommodations</label>
                    <p className="mt-1 text-gray-900">{profile.academic.accommodations}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interests & Preferences */}
          {profile.preferences && Object.values(profile.preferences).some(val => val) && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-pink-700 flex items-center mb-4">
                <FaHeart className="mr-2" />
                Interests & Preferences
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.preferences.interests && (
                  <div>
                    <label className="block text-sm font-medium text-pink-600">Interests</label>
                    <p className="mt-1 text-gray-900">{profile.preferences.interests}</p>
                  </div>
                )}
                {profile.preferences.hobbies && (
                  <div>
                    <label className="block text-sm font-medium text-pink-600">Hobbies</label>
                    <p className="mt-1 text-gray-900">{profile.preferences.hobbies}</p>
                  </div>
                )}
                {profile.preferences.favoriteSubjects && (
                  <div>
                    <label className="block text-sm font-medium text-pink-600">Favorite Subjects</label>
                    <p className="mt-1 text-gray-900">{profile.preferences.favoriteSubjects}</p>
                  </div>
                )}
                {profile.preferences.extracurriculars && (
                  <div>
                    <label className="block text-sm font-medium text-pink-600">Extracurricular Activities</label>
                    <p className="mt-1 text-gray-900">{profile.preferences.extracurriculars}</p>
                  </div>
                )}
                {profile.preferences.personalityTraits && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-pink-600">Personality Traits</label>
                    <p className="mt-1 text-gray-900">{profile.preferences.personalityTraits}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parent Notes */}
          {profile.parentNotes && Object.values(profile.parentNotes).some(val => val) && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-indigo-700 flex items-center mb-4">
                <FaStickyNote className="mr-2" />
                Parent Notes & Communication
              </h4>
              <div className="space-y-4">
                {profile.parentNotes.general && (
                  <div>
                    <label className="block text-sm font-medium text-indigo-600">General Notes</label>
                    <p className="mt-1 text-gray-900">{profile.parentNotes.general}</p>
                  </div>
                )}
                {profile.parentNotes.teacherCommunication && (
                  <div>
                    <label className="block text-sm font-medium text-indigo-600">Communication Preferences</label>
                    <p className="mt-1 text-gray-900">{profile.parentNotes.teacherCommunication}</p>
                  </div>
                )}
                {profile.parentNotes.behavior && (
                  <div>
                    <label className="block text-sm font-medium text-indigo-600">Behavioral Notes</label>
                    <p className="mt-1 text-gray-900">{profile.parentNotes.behavior}</p>
                  </div>
                )}
                {profile.parentNotes.routine && (
                  <div>
                    <label className="block text-sm font-medium text-indigo-600">Routine Preferences</label>
                    <p className="mt-1 text-gray-900">{profile.parentNotes.routine}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!profile || Object.keys(profile).length === 0) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <FaChild className="text-gray-400 text-5xl mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">Basic Profile Only</h4>
              <p className="text-gray-500 mb-4">
                This child has only basic information. Add more details to provide better care and communication.
              </p>
              <button
                onClick={() => startEditing(viewingChild)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Complete Profile
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  // Render edit form
  const renderEditForm = () => (
    <>
      <div className="flex items-center mb-6">
        <button 
          onClick={cancelEditing}
          className="mr-3 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h3 className="text-2xl font-bold text-blue-700">
            Edit {editProfileData.name}'s Profile
          </h3>
          <p className="text-gray-600">
            Update your child's information to help us provide the best care.
          </p>
        </div>
      </div>
      
      {renderProfileSectionTabs()}
      
      <form onSubmit={handleProfileSubmit}>
        <div className="min-h-[400px]">
          {activeProfileSection === 'basic' && renderBasicInfoSection(editProfileData, true)}
          {activeProfileSection === 'medical' && renderMedicalSection(editProfileData)}
          {activeProfileSection === 'emergency' && renderEmergencySection(editProfileData)}
          {activeProfileSection === 'dietary' && renderDietarySection(editProfileData)}
          {activeProfileSection === 'academic' && renderAcademicSection(editProfileData)}
          {activeProfileSection === 'preferences' && renderPreferencesSection(editProfileData)}
          {activeProfileSection === 'notes' && renderNotesSection(editProfileData)}
        </div>
        
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Section {['basic', 'medical', 'emergency', 'dietary', 'academic', 'preferences', 'notes'].indexOf(activeProfileSection) + 1} of 7
          </div>
          <div className="space-x-3">
            {activeProfileSection !== 'basic' && (
              <button
                type="button"
                onClick={() => {
                  const sections = ['basic', 'medical', 'emergency', 'dietary', 'academic', 'preferences', 'notes'];
                  const currentIndex = sections.indexOf(activeProfileSection);
                  setActiveProfileSection(sections[currentIndex - 1]);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
              >
                Previous
              </button>
            )}
            <button
              type="button"
              onClick={cancelEditing}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition flex items-center"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
            {activeProfileSection !== 'notes' ? (
              <button
                type="button"
                onClick={() => {
                  const sections = ['basic', 'medical', 'emergency', 'dietary', 'academic', 'preferences', 'notes'];
                  const currentIndex = sections.indexOf(activeProfileSection);
                  setActiveProfileSection(sections[currentIndex + 1]);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition flex items-center"
                disabled={loading.edit}
              >
                {loading.edit ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg">
        <div className="p-6 md:p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
            Child Profile Management
          </h2>
          
          {renderTabs()}
          
          {activeTab === 'register' && renderRegisterForm()}
          {activeTab === 'manage' && renderChildrenList()}
          {activeTab === 'view' && renderProfileView()}
          {activeTab === 'edit' && renderEditForm()}
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              to="/dashboard"
              className="block text-center bg-gray-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildManagement;
