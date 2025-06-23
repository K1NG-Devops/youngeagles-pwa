import React, { useState, useEffect } from 'react';
import { FaUser, FaStar, FaChartBar, FaEdit, FaSave, FaTimes, FaPlus, FaEye, FaSpinner, FaGraduationCap, FaBook, FaLightbulb } from 'react-icons/fa';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { showTopNotification } from '../TopNotificationManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://youngeagles-api-server.up.railway.app';

const MASTERY_LEVELS = {
  emerging: { name: 'Emerging', color: '#EF4444', level: 1 },
  developing: { name: 'Developing', color: '#F59E0B', level: 2 },
  proficient: { name: 'Proficient', color: '#10B981', level: 3 },
  advanced: { name: 'Advanced', color: '#3B82F6', level: 4 },
  mastery: { name: 'Mastery', color: '#8B5CF6', level: 5 }
};

const SKILL_CATEGORIES = {
  mathematics: { name: 'Mathematics', color: '#3B82F6', icon: '🔢' },
  literacy: { name: 'Literacy', color: '#10B981', icon: '📚' },
  science: { name: 'Science', color: '#8B5CF6', icon: '🔬' },
  socialEmotional: { name: 'Social-Emotional', color: '#F59E0B', icon: '💖' },
  creative: { name: 'Creative Arts', color: '#EF4444', icon: '🎨' }
};

const SkillProgressTracker = ({ isDark = false }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [skillProgress, setSkillProgress] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  const [loading, setLoading] = useState({
    students: true,
    skills: false,
    updating: false
  });

  const teacherId = localStorage.getItem('teacherId') || localStorage.getItem('userId');
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const teacherClass = localStorage.getItem('teacherClass');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchSkillProgress();
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      setLoading(prev => ({ ...prev, students: true }));
      
      // For now, we'll fetch from children table filtered by teacher's class
      const response = await fetch(`${API_BASE_URL}/api/teacher/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStudents(result.students || []);
        
        // Auto-select first student
        if (result.students?.length > 0) {
          setSelectedStudent(result.students[0]);
        }
      } else {
        toast.error('Failed to load students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error loading students');
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  const fetchSkillProgress = async () => {
    if (!selectedStudent) return;

    try {
      setLoading(prev => ({ ...prev, skills: true }));
      
      const response = await fetch(
        `${API_BASE_URL}/api/homework/skills/progress/${selectedStudent.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSkillProgress(result);
      } else {
        console.error('Failed to fetch skill progress');
        toast.error('Failed to load skill progress');
      }
    } catch (error) {
      console.error('Error fetching skill progress:', error);
      toast.error('Error loading skill progress');
    } finally {
      setLoading(prev => ({ ...prev, skills: false }));
    }
  };

  const updateSkillProgress = async (skillId, updates) => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      
      const response = await fetch(`${API_BASE_URL}/api/homework/skills/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          skillId,
          ...updates
        })
      });

      if (response.ok) {
        toast.success('Skill progress updated successfully!');
        await fetchSkillProgress(); // Refresh data
        setEditingSkill(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update skill progress');
      }
    } catch (error) {
      console.error('Error updating skill progress:', error);
      toast.error('Error updating skill progress');
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  const getRadarData = () => {
    if (!skillProgress?.progressByCategory) return [];
    
    return Object.entries(skillProgress.progressByCategory).map(([category, data]) => {
      const avgProficiency = data.skills.length > 0 
        ? data.skills.reduce((sum, skill) => sum + skill.proficiency_level, 0) / data.skills.length
        : 0;
      
      return {
        subject: data.title,
        proficiency: avgProficiency,
        fullMark: 5,
        color: SKILL_CATEGORIES[category]?.color || '#6B7280'
      };
    });
  };

  const getMasteryDistribution = () => {
    if (!skillProgress?.allProgress) return [];
    
    const distribution = {};
    Object.keys(MASTERY_LEVELS).forEach(level => {
      distribution[level] = 0;
    });
    
    skillProgress.allProgress.forEach(skill => {
      if (distribution.hasOwnProperty(skill.mastery_status)) {
        distribution[skill.mastery_status]++;
      }
    });
    
    return Object.entries(distribution).map(([level, count]) => ({
      name: MASTERY_LEVELS[level].name,
      count,
      color: MASTERY_LEVELS[level].color
    }));
  };

  const SkillCard = ({ skill, categoryName }) => {
    const isEditing = editingSkill?.id === skill.id;
    const [editData, setEditData] = useState({
      proficiency_level: skill.proficiency_level,
      mastery_status: skill.mastery_status,
      teacher_notes: skill.teacher_notes || ''
    });

    const handleEdit = () => {
      setEditingSkill(skill);
      setEditData({
        proficiency_level: skill.proficiency_level,
        mastery_status: skill.mastery_status,
        teacher_notes: skill.teacher_notes || ''
      });
    };

    const handleSave = () => {
      updateSkillProgress(skill.skill_id, editData);
    };

    const handleCancel = () => {
      setEditingSkill(null);
    };

    return (
      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } hover:shadow-md transition-shadow`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{skill.skill_name}</h4>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {skill.skill_description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaEdit className="text-xs text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            {/* Proficiency Level */}
            <div>
              <label className="block text-xs font-medium mb-1">Proficiency Level</label>
              <select
                value={editData.proficiency_level}
                onChange={(e) => setEditData(prev => ({ ...prev, proficiency_level: parseInt(e.target.value) }))}
                className={`w-full p-2 text-sm rounded border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              >
                {[1, 2, 3, 4, 5].map(level => (
                  <option key={level} value={level}>{level} - {Object.values(MASTERY_LEVELS)[level - 1]?.name}</option>
                ))}
              </select>
            </div>

            {/* Mastery Status */}
            <div>
              <label className="block text-xs font-medium mb-1">Mastery Status</label>
              <select
                value={editData.mastery_status}
                onChange={(e) => setEditData(prev => ({ ...prev, mastery_status: e.target.value }))}
                className={`w-full p-2 text-sm rounded border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              >
                {Object.entries(MASTERY_LEVELS).map(([key, level]) => (
                  <option key={key} value={key}>{level.name}</option>
                ))}
              </select>
            </div>

            {/* Teacher Notes */}
            <div>
              <label className="block text-xs font-medium mb-1">Teacher Notes</label>
              <textarea
                value={editData.teacher_notes}
                onChange={(e) => setEditData(prev => ({ ...prev, teacher_notes: e.target.value }))}
                className={`w-full p-2 text-sm rounded border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
                rows={2}
                placeholder="Add observations or notes..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={loading.updating}
                className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading.updating ? <FaSpinner className="animate-spin" /> : <FaSave />}
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Current Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Proficiency:</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map(level => (
                  <FaStar
                    key={level}
                    className={`text-xs ${
                      level <= skill.proficiency_level ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Mastery:</span>
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: MASTERY_LEVELS[skill.mastery_status]?.color + '20',
                  color: MASTERY_LEVELS[skill.mastery_status]?.color
                }}
              >
                {MASTERY_LEVELS[skill.mastery_status]?.name}
              </span>
            </div>

            {skill.teacher_notes && (
              <div className="mt-2">
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Notes: {skill.teacher_notes}
                </p>
              </div>
            )}

            {skill.demonstration_date && (
              <div className="text-xs text-gray-500">
                Last updated: {new Date(skill.demonstration_date).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading.students) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <span className="ml-3 text-lg">Loading students...</span>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FaGraduationCap className="text-3xl text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">Skill Progress Tracker</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Monitor and update student skill development
              </p>
            </div>
          </div>
        </div>

        {/* Student Selection */}
        <div className="max-w-md">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Select Student
          </label>
          <select
            value={selectedStudent?.id || ''}
            onChange={(e) => {
              const student = students.find(s => s.id.toString() === e.target.value);
              setSelectedStudent(student);
            }}
            className={`w-full p-3 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Choose a student</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedStudent && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Skills</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {skillProgress?.totalSkills || 0}
                  </p>
                </div>
                <FaBook className="text-blue-500 text-xl" />
              </div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Mastered</p>
                  <p className="text-2xl font-bold text-green-500">
                    {skillProgress?.masteredSkills || 0}
                  </p>
                </div>
                <FaStar className="text-green-500 text-xl" />
              </div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Proficient</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {skillProgress?.proficientSkills || 0}
                  </p>
                </div>
                <FaGraduationCap className="text-purple-500 text-xl" />
              </div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg. Level</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {skillProgress?.averageProficiency || 0}
                  </p>
                </div>
                <FaChartBar className="text-orange-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills Radar Chart */}
            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Skills Overview</h3>
              {loading.skills ? (
                <div className="flex items-center justify-center h-64">
                  <FaSpinner className="animate-spin text-2xl text-blue-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getRadarData()}>
                    <PolarGrid stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 5]} 
                      tick={{ fontSize: 10, fill: isDark ? '#9CA3AF' : '#6B7280' }}
                    />
                    <Radar
                      name="Proficiency"
                      dataKey="proficiency"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Mastery Distribution */}
            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">Mastery Distribution</h3>
              {loading.skills ? (
                <div className="flex items-center justify-center h-64">
                  <FaSpinner className="animate-spin text-2xl text-blue-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getMasteryDistribution()}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="name" stroke={isDark ? '#9CA3AF' : '#6B7280'} />
                    <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Skills by Category */}
          {skillProgress?.progressByCategory && (
            <div className="space-y-6">
              {Object.entries(skillProgress.progressByCategory).map(([categoryName, categoryData]) => (
                <div key={categoryName} className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{SKILL_CATEGORIES[categoryName]?.icon}</span>
                    <h3 className="text-lg font-semibold">{categoryData.title}</h3>
                    <span className={`text-sm px-2 py-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      {categoryData.skills.length} skills
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryData.skills.map(skill => (
                      <SkillCard 
                        key={skill.id} 
                        skill={skill} 
                        categoryName={categoryName}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!selectedStudent && !loading.students && (
        <div className={`text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
          <FaUser className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Select a Student</h3>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Choose a student from the dropdown above to track their skill progress
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillProgressTracker; 