import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import classService from '../../services/classService';
import { showTopNotification } from '../TopNotificationManager';
import { FaSpinner, FaEye, FaEyeSlash, FaUserGraduate, FaExclamationCircle } from 'react-icons/fa';
import { useTheme } from '../../hooks/useTheme.jsx';

const AdminTeachers = () => {
  const { isDark } = useTheme();
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [isLoading, setIsLoading] = useState({ teachers: false, classes: false });
  const [errors, setErrors] = useState({ teachers: null, classes: null });
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    classId: '',
    qualification: '',
    experience: '',
    specialization: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const fetchTeachers = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, teachers: true }));
    setErrors(prev => ({ ...prev, teachers: null }));
    try {
      const response = await adminService.getUsers(1, 100, '', 'teacher');
      const users = response.data || [];
      const teacherUsers = users.filter(u => u.role === 'teacher');
      
      console.log('👨‍🏫 Fetched teachers:', teacherUsers.map(t => ({
        id: t.id,
        name: t.name,
        class_id: t.class_id,
        class_id_type: typeof t.class_id
      })));
      
      setTeachers(teacherUsers);
    } catch (err) {
      console.error('❌ Error fetching teachers:', err);
      setErrors(prev => ({ ...prev, teachers: 'Failed to load teachers.' }));
      showTopNotification('Failed to load teachers', 'error');
    } finally {
      setIsLoading(prev => ({ ...prev, teachers: false }));
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, classes: true }));
    setErrors(prev => ({ ...prev, classes: null }));
    try {
      const response = await classService.getClasses();
      console.log('📚 Classes API Response:', response);
      
      // Try different response structures
      let classData = [];
      if (response && response.data && Array.isArray(response.data)) {
        classData = response.data;
      } else if (response && Array.isArray(response.classes)) {
        classData = response.classes;
      } else if (Array.isArray(response)) {
        classData = response;
      } else {
        console.warn('⚠️ Unexpected response structure:', response);
        classData = [];
      }
      
      console.log('📚 Final Classes Data:', classData);
      console.log('📚 Classes count:', classData.length);
      console.log('📚 Sample class:', classData[0]);
      
      setClasses(classData);
      
      // Show success message if classes loaded
      if (classData.length > 0) {
        console.log(`✅ Successfully loaded ${classData.length} classes`);
      } else {
        console.warn('⚠️ No classes found in response');
      }
    } catch (err) {
      console.error('❌ Error fetching classes:', err);
      setErrors(prev => ({ ...prev, classes: 'Failed to load classes.' }));
      showTopNotification('Could not load class list', 'error');
    } finally {
      setIsLoading(prev => ({ ...prev, classes: false }));
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, [fetchTeachers, fetchClasses]);

  const handleEdit = useCallback((teacher) => {
    console.log('📝 Editing teacher data:', teacher);
    console.log('📝 Teacher class_id:', teacher.class_id, 'Type:', typeof teacher.class_id);
    
    const formData = {
      name: teacher.name || '',
      email: teacher.email || '',
      password: '',
      classId: teacher.class_id ? teacher.class_id.toString() : '',
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      specialization: teacher.specialization || '',
      phone: teacher.phone || '',
      emergencyContact: teacher.emergencyContact || '',
      emergencyPhone: teacher.emergencyPhone || ''
    };
    
    console.log('📝 Setting form data:', formData);
    
    setEditingId(teacher.id);
    setForm(formData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showTopNotification('Please fix the form errors', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Ensure class_id is properly formatted
      const classId = form.classId ? parseInt(form.classId, 10) : null;
      console.log('🎯 Form classId value:', {
        originalValue: form.classId,
        convertedValue: classId,
        isValidNumber: !isNaN(classId) && classId !== null
      });

      const teacherData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        class_id: classId,
        role: 'teacher',
        qualification: form.qualification,
        experience: form.experience,
        specialization: form.specialization,
        emergencyContact: form.emergencyContact,
        emergencyPhone: form.emergencyPhone
      };

      if (!editingId || form.password.trim()) {
        teacherData.password = form.password.trim();
      }

      if (editingId) {
        console.log('🔄 Updating teacher with data:', teacherData);
        const updateResponse = await adminService.updateUser(editingId, teacherData);
        console.log('✅ Teacher update response:', updateResponse);
        showTopNotification('Teacher updated successfully!', 'success');
        
        // Immediately fetch fresh data to update the list
        console.log('🔄 Refreshing teachers list after update...');
        await fetchTeachers();
      } else {
        console.log('🆕 Creating teacher with data:', teacherData);
        const createResponse = await adminService.createUser(teacherData);
        console.log('✅ Teacher create response:', createResponse);
        showTopNotification('Teacher created successfully!', 'success');
        
        // Immediately fetch fresh data to update the list
        console.log('🔄 Refreshing teachers list after create...');
        await fetchTeachers();
      }
      
      setForm({
        name: '',
        email: '',
        password: '',
        classId: '',
        qualification: '',
        experience: '',
        specialization: '',
        phone: '',
        emergencyContact: '',
        emergencyPhone: ''
      });
      setEditingId(null);
    } catch (err) {
      showTopNotification(err.message || 'Failed to save teacher', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    setDeletingId(id);
    try {
      await adminService.deleteTeacher(id);
      showTopNotification('Teacher deleted successfully!', 'success');
      fetchTeachers();
    } catch (err) {
      showTopNotification(err.message || 'Failed to delete teacher', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      name: '',
      email: '',
      password: '',
      classId: '',
      qualification: '',
      experience: '',
      specialization: '',
      phone: '',
      emergencyContact: '',
      emergencyPhone: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    console.log('🔍 Validating form with data:', form);
    
    if (!form.name?.trim()) errors.name = 'Name is required';
    if (!form.email?.trim()) errors.email = 'Email is required';
    if (!editingId && !form.password?.trim()) errors.password = 'Password is required for new teachers';
    // Temporarily remove class requirement to test if data is being sent
    // if (!form.classId) errors.classId = 'Class assignment is required';
    if (!form.phone?.trim()) errors.phone = 'Phone number is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (form.phone && !phoneRegex.test(form.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    console.log('🔍 Validation errors:', errors);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    console.log('📋 Form field changed:', { name, value, type: e.target.type });
    
    setForm(prev => {
      const newForm = { ...prev, [name]: value };
      console.log('📋 Updated form state:', newForm);
      return newForm;
    });
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getClassNameById = (classId) => {
    console.log('🔍 getClassNameById called with:', {
      classId,
      classIdType: typeof classId,
      classesLength: classes.length,
      availableClasses: classes.map(c => ({ id: c.id, name: c.name, idType: typeof c.id }))
    });
    
    if (!classId || classes.length === 0) {
      console.log('🔍 Returning null - no classId or no classes available');
      return null;
    }
    
    const foundClass = classes.find(c => c.id.toString() === classId.toString());
    console.log('🔍 Found class:', foundClass);
    
    return foundClass ? foundClass.name : 'Invalid Class';
  };

  const inputClass = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
    isDark 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  }`;

  const errorClass = 'text-red-500 text-sm mt-1';

  // Debug: Log current form state
  console.log('🔍 Current form state in render:', form);
  console.log('🔍 Current editing ID:', editingId);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-8">
      <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {editingId ? 'Edit Teacher' : 'Create New Teacher'}
      </h2>
      
      <form onSubmit={handleSubmit} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow p-6 space-y-4 border`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Basic Information</h3>
            
            <div>
              <input
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                placeholder="Full Name"
                className={`${inputClass} ${formErrors.name ? 'border-red-500' : ''}`}
                autoComplete="off"
              />
              {formErrors.name && <p className={errorClass}>{formErrors.name}</p>}
            </div>

            <div>
              <input
                name="email"
                value={form.email || ''}
                onChange={handleChange}
                placeholder="Email"
                type="email"
                className={`${inputClass} ${formErrors.email ? 'border-red-500' : ''}`}
                autoComplete="off"
              />
              {formErrors.email && <p className={errorClass}>{formErrors.email}</p>}
            </div>

            <div className="relative">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={editingId ? 'New Password (optional)' : 'Password'}
                type={showPassword ? 'text' : 'password'}
                className={`${inputClass} ${formErrors.password ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {formErrors.password && <p className={errorClass}>{formErrors.password}</p>}
            </div>

            <div>
              <select
                name="classId"
                value={form.classId || ''}
                onChange={handleChange}
                className={`${inputClass} ${formErrors.classId ? 'border-red-500' : ''}`}
              >
                <option value="">-- Unassigned --</option>
                {isLoading.classes ? (
                  <option>Loading classes...</option>
                ) : classes.length > 0 ? (
                  classes.map(cls => {
                    console.log('🎯 Rendering class option:', cls);
                    return (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    );
                  })
                ) : (
                  <option disabled>No classes available</option>
                )}
              </select>
              {errors.classes && <p className={errorClass}>{errors.classes}</p>}
              {formErrors.classId && <p className={errorClass}>{formErrors.classId}</p>}
              
              {/* Debug info */}
              <div className="text-xs text-gray-500 mt-1">
                Debug: {classes.length} classes loaded, Loading: {isLoading.classes ? 'Yes' : 'No'}
                {classes.length > 0 && <span> - Classes: {classes.map(c => c.name).join(', ')}</span>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Professional Information</h3>
            
            <div>
              <input
                name="phone"
                value={form.phone || ''}
                onChange={handleChange}
                placeholder="Phone Number"
                className={`${inputClass} ${formErrors.phone ? 'border-red-500' : ''}`}
                autoComplete="off"
              />
              {formErrors.phone && <p className={errorClass}>{formErrors.phone}</p>}
            </div>

            <div>
              <input
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                placeholder="Qualification"
                className={inputClass}
              />
            </div>

            <div>
              <input
                name="experience"
                value={form.experience}
                onChange={handleChange}
                placeholder="Years of Experience"
                className={inputClass}
              />
            </div>

            <div>
              <input
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Specialization"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="emergencyContact"
              value={form.emergencyContact}
              onChange={handleChange}
              placeholder="Emergency Contact Name"
              className={inputClass}
            />
            <input
              name="emergencyPhone"
              value={form.emergencyPhone}
              onChange={handleChange}
              placeholder="Emergency Contact Phone"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex space-x-2 pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg text-white font-medium flex items-center space-x-2 ${
              isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isSubmitting && <FaSpinner className="animate-spin" />}
            <span>{isSubmitting ? (editingId ? 'Saving...' : 'Creating...') : (editingId ? 'Save Changes' : 'Create Teacher')}</span>
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className={`px-4 py-2 rounded-lg font-medium ${
                isDark 
                  ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow p-6 border`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Teachers List</h3>
        
        {isLoading.teachers ? (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-3xl text-blue-500" />
          </div>
        ) : errors.teachers ? (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {errors.teachers}
          </div>
        ) : teachers.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No teachers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  <th className="text-left py-3">Name</th>
                  <th className="text-left py-3">Email</th>
                  <th className="text-left py-3">Class</th>
                  <th className="text-left py-3">Phone</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {teachers.map(t => (
                  <tr key={t.id} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="py-3">{t.name}</td>
                    <td className="py-3">{t.email}</td>
                    <td className="py-3">
                      {getClassNameById(t.class_id) || <span className="text-yellow-500 italic">Unassigned</span>}
                    </td>
                    <td className="py-3">{t.phone || <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Not provided</span>}</td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className={`px-3 py-1 text-white rounded text-sm ${
                            deletingId === t.id
                              ? 'bg-red-400 cursor-not-allowed'
                              : 'bg-red-500 hover:bg-red-600'
                          }`}
                        >
                          {deletingId === t.id ? 'Deleting...' : 'Delete'}
                        </button>
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
  );
};

export default AdminTeachers; 