import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaChalkboardTeacher } from 'react-icons/fa';
import classService from '../../services/classService';
import { showTopNotification } from '../TopNotificationManager';
import { useTheme } from '../../hooks/useTheme.jsx';

const ClassManagement = () => {
  const { isDark } = useTheme();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    ageGroup: '',
    capacity: 20,
    teacher_id: '',
    schedule: ''
  });

  const ageGroups = [
    { value: 'Nursery', label: 'Nursery (0-1 years)' },
    { value: 'Curious Cubs', label: 'Curious Cubs (1-3 years)' },
    { value: 'Panda', label: 'Panda (4-6 years)' }
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch classes, teachers, and students in parallel
      const [classesData, teachersData, studentsData] = await Promise.all([
        classService.getClasses(),
        classService.getAvailableTeachers(),
        classService.getAvailableStudents()
      ]);
      
      setClasses(classesData || []);
      setTeachers(teachersData || []);
      setStudents(studentsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      showTopNotification('Failed to load data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.ageGroup) {
      showTopNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      const classData = {
        name: form.name.trim(),
        description: form.description.trim(),
        age_group: form.ageGroup,
        max_students: form.capacity,
        teacher_id: form.teacher_id || null,
        schedule: form.schedule.trim()
      };

      if (editingClass) {
        await classService.updateClass(editingClass.id, classData);
        showTopNotification('Class updated successfully!', 'success');
      } else {
        await classService.createClass(classData);
        showTopNotification('Class created successfully!', 'success');
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving class:', err);
      showTopNotification(err.message || 'Failed to save class', 'error');
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setForm({
      name: classItem.name,
      description: classItem.description || '',
      ageGroup: classItem.ageGroup,
      capacity: classItem.capacity,
      teacher_id: classItem.teacher_id || '',
      schedule: classItem.schedule || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    
    try {
      await classService.deleteClass(classId);
      showTopNotification('Class deleted successfully!', 'success');
      fetchData();
    } catch (err) {
      console.error('Error deleting class:', err);
      showTopNotification(err.message || 'Failed to delete class', 'error');
    }
  };

  const handleAssignTeacher = async (classId, teacherId) => {
    if (!teacherId) return;
    
    try {
      const teacher = teachers.find(t => t.id == teacherId);
      if (teacher) {
        // Update the class with the new teacher
        await classService.updateClass(classId, { teacher_id: teacherId });
        showTopNotification(`${teacher.name} assigned to class successfully!`, 'success');
        
        // Update local state
        setClasses(prev => prev.map(c => 
          c.id === classId 
            ? { ...c, teacher_id: teacherId, teacher_name: teacher.name }
            : c
        ));
      }
    } catch (err) {
      console.error('Error assigning teacher:', err);
      showTopNotification(err.message || 'Failed to assign teacher', 'error');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      ageGroup: '',
      capacity: 20,
      teacher_id: '',
      schedule: ''
    });
    setEditingClass(null);
    setShowCreateForm(false);
  };

  const getAvailableTeachers = () => {
    const assignedTeacherIds = classes.map(c => c.teacher_id).filter(Boolean);
    return teachers.filter(t => !assignedTeacherIds.includes(t.id) || t.id === form.teacher_id);
  };

  // Theme-aware classes
  const containerClass = `p-6 max-w-7xl mx-auto transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`;
  const cardClass = `rounded-xl shadow-sm p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;
  const titleClass = `text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`;
  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const inputClass = `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
    isDark 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'border-gray-300 bg-white text-gray-900'
  }`;

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between mb-6">
        <h1 className={titleClass}>Class Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" />
          Create New Class
        </button>
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-xl p-6 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingClass ? 'Edit Class' : 'Create New Class'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Class Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Panda Class A"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className={inputClass}
                  placeholder="Brief description of the class..."
                  rows="3"
                />
              </div>

              <div>
                <label className={labelClass}>Age Group *</label>
                <select
                  value={form.ageGroup}
                  onChange={(e) => handleFormChange('ageGroup', e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Select age group</option>
                  {ageGroups.map(group => (
                    <option key={group.value} value={group.value}>{group.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Class Capacity</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => handleFormChange('capacity', parseInt(e.target.value) || 0)}
                  className={inputClass}
                  min="1"
                  max="30"
                />
              </div>

              <div>
                <label className={labelClass}>Assign Teacher *</label>
                <select
                  value={form.teacher_id}
                  onChange={(e) => handleFormChange('teacher_id', e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Select a teacher</option>
                  {getAvailableTeachers().map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Schedule</label>
                <input
                  type="text"
                  value={form.schedule}
                  onChange={(e) => handleFormChange('schedule', e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Monday-Friday 9:00-12:00"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingClass ? 'Update Class' : 'Create Class'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-gray-600 text-white hover:bg-gray-700' 
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Classes Grid */}
      {isLoading ? (
        <div className={`text-center py-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Loading classes...
        </div>
      ) : classes.length === 0 ? (
        <div className={cardClass}>
          <div className="text-center py-8">
            <FaChalkboardTeacher className={`mx-auto text-6xl mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
              No Classes Yet
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Create your first class to get started with organizing students and teachers.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(classItem => (
            <div key={classItem.id} className={cardClass}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {classItem.name}
                  </h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {classItem.ageGroup}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(classItem)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(classItem.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {classItem.description && (
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {classItem.description}
                </p>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Teacher:</span>
                  <div className="flex items-center space-x-2">
                    {classItem.teacher_name && classItem.teacher_name !== 'Unassigned' ? (
                      <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        {classItem.teacher_name}
                      </span>
                    ) : (
                      <select
                        onChange={(e) => handleAssignTeacher(classItem.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        defaultValue=""
                      >
                        <option value="">Assign Teacher</option>
                        {getAvailableTeachers().map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Students:</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {classItem.student_count || 0} / {classItem.capacity}
                  </span>
                </div>

                {classItem.schedule && (
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Schedule:</span>
                    <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {classItem.schedule}
                    </span>
                  </div>
                )}
              </div>

              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <FaUsers className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Capacity: {classItem.capacity}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    (classItem.student_count || 0) >= classItem.capacity
                      ? (isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                      : (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                  }`}>
                    {(classItem.student_count || 0) >= classItem.capacity ? 'Full' : 'Available'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassManagement; 