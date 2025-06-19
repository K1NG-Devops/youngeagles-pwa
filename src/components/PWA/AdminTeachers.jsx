import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';

const CLASS_OPTIONS = [
  { value: 'Panda', label: 'Panda (4-6)' },
  { value: 'Curious Cubs', label: 'Curious Cubs (1-3)' },
  { value: 'Nursery', label: 'Nursery (below 1)' },
];

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', className: CLASS_OPTIONS[0].value });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const users = await adminService.getUsers();
      setTeachers(users.filter(u => u.role === 'teacher'));
    } catch (err) {
      toast.error('Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setCreating(true);
    try {
      if (editingId) {
        // Edit teacher
        await adminService.updateUser(editingId, { ...form, role: 'teacher' });
        toast.success('Teacher updated!');
      } else {
        // Create teacher
        await adminService.createUser({ ...form, role: 'teacher' });
        toast.success('Teacher created!');
      }
      setForm({ name: '', email: '', password: '', className: CLASS_OPTIONS[0].value });
      setEditingId(null);
      fetchTeachers();
    } catch (err) {
      toast.error(err.message || 'Failed to save teacher');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = teacher => {
    setEditingId(teacher.id);
    setForm({
      name: teacher.name || '',
      email: teacher.email || '',
      password: '', // Don't prefill password
      className: teacher.className || CLASS_OPTIONS[0].value,
    });
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    setDeletingId(id);
    try {
      await adminService.deleteUser(id);
      toast.success('Teacher deleted!');
      fetchTeachers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete teacher');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', email: '', password: '', className: CLASS_OPTIONS[0].value });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-4">Manage Teachers</h2>
      {/* Create/Edit Teacher Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4 border">
        <h3 className="text-lg font-semibold mb-2">{editingId ? 'Edit Teacher' : 'Create New Teacher'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="border rounded-lg px-3 py-2" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required className="border rounded-lg px-3 py-2" />
          <input name="password" value={form.password} onChange={handleChange} placeholder={editingId ? 'New Password (optional)' : 'Password'} type="password" className="border rounded-lg px-3 py-2" />
          <select name="className" value={form.className} onChange={handleChange} className="border rounded-lg px-3 py-2">
            {CLASS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2 mt-2">
          <button type="submit" disabled={creating} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
            {creating ? (editingId ? 'Saving...' : 'Creating...') : (editingId ? 'Save Changes' : 'Create Teacher')}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
          )}
        </div>
      </form>
      {/* Teachers List */}
      <div className="bg-white rounded-xl shadow p-6 border">
        <h3 className="text-lg font-semibold mb-4">Teachers List</h3>
        {isLoading ? (
          <div>Loading...</div>
        ) : teachers.length === 0 ? (
          <div className="text-gray-500">No teachers found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Class</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(t => (
                <tr key={t.id} className="border-t">
                  <td className="py-2">{t.name}</td>
                  <td className="py-2">{t.email}</td>
                  <td className="py-2">{t.className || <span className="text-gray-400">Unassigned</span>}</td>
                  <td className="py-2 flex space-x-2">
                    <button onClick={() => handleEdit(t)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">Edit</button>
                    <button onClick={() => handleDelete(t.id)} disabled={deletingId === t.id} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs disabled:opacity-50">
                      {deletingId === t.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminTeachers; 