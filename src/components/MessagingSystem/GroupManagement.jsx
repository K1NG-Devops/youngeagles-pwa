import React, { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaTrash, FaEdit, FaUserPlus, FaTimes, FaSpinner } from 'react-icons/fa';
import { showTopNotification } from '../../utils/notifications';

const GroupManagement = ({ isDark }) => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'custom',
    members: []
  });
  const [newMemberType, setNewMemberType] = useState('parent');
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');

  // Fetch groups on mount
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setGroups(data.groups);
      } else {
        showTopNotification(data.message, 'error');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      showTopNotification('Failed to fetch groups', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.success) {
        showTopNotification('Group created successfully', 'success');
        setShowCreateModal(false);
        setFormData({ name: '', description: '', type: 'custom', members: [] });
        fetchGroups();
      } else {
        showTopNotification(data.message, 'error');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      showTopNotification('Failed to create group', 'error');
    }
  };

  const handleAddMembers = async (groupId, newMembers) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ members: newMembers })
      });
      const data = await response.json();
      
      if (data.success) {
        showTopNotification('Members added successfully', 'success');
        setShowAddMembersModal(false);
        fetchGroups();
      } else {
        showTopNotification(data.message, 'error');
      }
    } catch (error) {
      console.error('Error adding members:', error);
      showTopNotification('Failed to add members', 'error');
    }
  };

  const handleRemoveMember = async (groupId, userId, userType) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${userId}/${userType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        showTopNotification('Member removed successfully', 'success');
        fetchGroups();
      } else {
        showTopNotification(data.message, 'error');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      showTopNotification('Failed to remove member', 'error');
    }
  };

  return (
    <div className={`p-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaUsers /> Group Management
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg
            hover:bg-blue-600 transition-colors"
        >
          <FaPlus /> Create Group
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <FaSpinner className="animate-spin text-3xl text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(group => (
            <div
              key={group.id}
              className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowAddMembersModal(true);
                    }}
                    className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900
                      rounded-full transition-colors"
                    title="Add members"
                  >
                    <FaUserPlus />
                  </button>
                  <button
                    onClick={() => handleRemoveMember(group.id, group.members[0].userId, group.members[0].userType)}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900
                      rounded-full transition-colors"
                    title="Delete group"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {group.description || 'No description'}
              </p>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{group.member_count} members</span>
                <span>{group.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md p-6 rounded-lg ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Group</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateGroup(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Group Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                    placeholder="Enter group name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                    placeholder="Enter group description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Group Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="class">Class</option>
                    <option value="staff">Staff</option>
                    <option value="parents">Parents</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={`px-4 py-2 rounded-lg ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Create Group
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Members Modal */}
      {showAddMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md p-6 rounded-lg ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add Members to {selectedGroup?.name}</h3>
              <button
                onClick={() => setShowAddMembersModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Member Type</label>
                <select
                  value={newMemberType}
                  onChange={(e) => setNewMemberType(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="parent">Parent</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Member ID</label>
                <input
                  type="number"
                  value={newMemberId}
                  onChange={(e) => setNewMemberId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter member ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowAddMembersModal(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddMembers(selectedGroup.id, [{
                    userId: parseInt(newMemberId),
                    userType: newMemberType,
                    role: newMemberRole
                  }])}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManagement; 