import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';

const Classes = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classChildren, setClassChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.classes.getAll();
        setClasses(response.data.classes || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleViewClassChildren = async (classId, className) => {
    try {
      setIsLoadingChildren(true);
      setSelectedClass(className);
      const response = await apiService.classes.getChildren(classId);
      setClassChildren(response.data.children || []);
    } catch (error) {
      console.error('Error fetching class children:', error);
      toast.error('Failed to load class children');
    } finally {
      setIsLoadingChildren(false);
    }
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setClassChildren([]);
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Show class children view
  if (selectedClass) {
    return (
      <div>
        <div className="card">
          <div className="flex justify-between items-center">
            <h2>Children in {selectedClass}</h2>
            <button 
              onClick={handleBackToClasses}
              className="btn btn-secondary"
            >
              ← Back to Classes
            </button>
          </div>
          <p>Total: {classChildren.length} children</p>
        </div>

        {isLoadingChildren ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : classChildren.length === 0 ? (
          <div className="card text-center">
            <p>No children found in this class.</p>
          </div>
        ) : (
          <div className="grid" style={{ gap: '1rem' }}>
            {classChildren.map((child) => (
              <div key={child.id} className="card">
                <h3>{child.first_name} {child.last_name}</h3>
                <p><strong>Age:</strong> {child.age || 'Not specified'}</p>
                {child.parent_name && (
                  <p><strong>Parent:</strong> {child.parent_name}</p>
                )}
                {child.emergency_contact && (
                  <p><strong>Emergency Contact:</strong> {child.emergency_contact}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show classes list
  if (classes.length === 0) {
    return (
      <div className="card text-center">
        <h2>No Classes Found</h2>
        <p>No classes are currently available in the system.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2>Classes</h2>
        <p>Total: {classes.length} classes</p>
      </div>

      <div className="grid" style={{ gap: '1rem' }}>
        {classes.map((classItem) => (
          <div key={classItem.id} className="card">
            <h3>{classItem.class_name}</h3>
            
            <div style={{ marginTop: '1rem' }}>
              {classItem.description && (
                <p><strong>Description:</strong> {classItem.description}</p>
              )}
              {classItem.teacher_name && (
                <p><strong>Teacher:</strong> {classItem.teacher_name}</p>
              )}
              {classItem.capacity && (
                <p><strong>Capacity:</strong> {classItem.capacity} students</p>
              )}
              {classItem.age_group && (
                <p><strong>Age Group:</strong> {classItem.age_group}</p>
              )}
            </div>
            
            <div className="mt-4 flex gap-4">
              {(user?.role === 'teacher' || user?.role === 'admin') && (
                <button 
                  className="btn btn-primary"
                  onClick={() => handleViewClassChildren(classItem.id, classItem.class_name)}
                >
                  View Children
                </button>
              )}
              <button 
                className="btn btn-secondary"
                onClick={() => toast.info('Class details feature coming soon!')}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Classes; 