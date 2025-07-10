import React from 'react';
import PropTypes from 'prop-types';
import NativeDialog from './NativeDialog';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationCircle,
  FaChartLine,
  FaLightbulb,
  FaComments
} from 'react-icons/fa';

const StudentProgressModal = ({ student, onClose }) => {
  if (!student) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <FaCheckCircle style={{ color: getScoreColor(score) }} />;
    if (score >= 60) return <FaExclamationCircle style={{ color: getScoreColor(score) }} />;
    return <FaTimesCircle style={{ color: getScoreColor(score) }} />;
  };

  return (
    <NativeDialog
      isOpen={true}
      onClose={onClose}
      title={`Student Progress Report - ${student.name} (${student.class})`}
      size="large"
      actions={[
        {
          label: 'Close',
          onClick: onClose,
          variant: 'secondary'
        },
        {
          label: 'Download Report',
          onClick: () => alert('Download functionality coming soon!'),
          variant: 'primary'
        }
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Overall Progress */}
        <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <FaChartLine style={{ marginRight: '0.5rem', color: '#3b82f6' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Overall Progress</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem', margin: 0 }}>Average Score</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getScoreColor(student.averageScore), margin: 0 }}>
                {student.averageScore}%
              </p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem', margin: 0 }}>Completed</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>
                {student.completedAssignments}
              </p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem', margin: 0 }}>Pending</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>
                {student.pendingAssignments}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Assignments */}
        <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <FaLightbulb style={{ marginRight: '0.5rem', color: '#f59e0b' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Recent Assignments</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {student.recentAssignments?.map((assignment) => (
              <div
                key={assignment.id}
                style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: '500', margin: 0 }}>{assignment.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {getScoreIcon(assignment.score)}
                    <span style={{ marginLeft: '0.5rem', color: getScoreColor(assignment.score), fontWeight: '500' }}>
                      {assignment.score}%
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                  {assignment.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <FaComments style={{ marginRight: '0.5rem', color: '#10b981' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>AI Recommendations</h3>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {student.recommendations?.map((rec, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ marginRight: '0.5rem', color: '#10b981' }}>•</span>
                  <span style={{ color: '#374151' }}>
                    {rec}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </NativeDialog>
  );
};

StudentProgressModal.propTypes = {
  student: PropTypes.shape({
    name: PropTypes.string.isRequired,
    class: PropTypes.string.isRequired,
    averageScore: PropTypes.number.isRequired,
    completedAssignments: PropTypes.number.isRequired,
    pendingAssignments: PropTypes.number.isRequired,
    recentAssignments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired,
      feedback: PropTypes.string.isRequired
    })),
    recommendations: PropTypes.arrayOf(PropTypes.string)
  }),
  onClose: PropTypes.func.isRequired
};

export default StudentProgressModal;
