import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Edit, Trash2, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

const AdminManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'admin',
        business_name: '',
        phone: '',
        subscription_status: 'active'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    // Security: Redirect if not sysadmin
    useEffect(() => {
        if (user && user.role !== 'sysadmin') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/');
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/users/', formData);
            setShowAddModal(false);
            setFormData({
                username: '',
                password: '',
                role: 'admin',
                business_name: '',
                phone: '',
                subscription_status: 'active'
            });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create user');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.put(`/users/${selectedUser.id}`, formData);
            setShowEditModal(false);
            setSelectedUser(null);
            setFormData({
                username: '',
                password: '',
                role: 'admin',
                business_name: '',
                phone: '',
                subscription_status: 'active'
            });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.delete(`/users/${userId}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to delete user');
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            password: '',
            role: user.role,
            business_name: user.business_name || '',
            phone: user.phone || '',
            subscription_status: user.subscription_status || 'active'
        });
        setShowEditModal(true);
        setError('');
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div className="header-section">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div style={{ width: '40px', height: '40px', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={24} color="white" />
                        </div>
                        <div>
                            <h1>System Administration</h1>
                            <p className="text-muted text-sm">Manage users and access control</p>
                        </div>
                    </div>
                    <button className="btn" onClick={() => { setShowAddModal(true); setError(''); }}>
                        <UserPlus size={18} />
                        Add New User
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="content-area">
                {/* Stats Cards */}
                <div className="grid grid-cols-auto-fit gap-6 mb-6">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted mb-2">Total Users</p>
                                <h2 className="text-2xl font-bold">{users.length}</h2>
                            </div>
                            <div className="p-3" style={{ background: '#eef2ff' }}>
                                <Users size={24} color="#4f46e5" />
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted mb-2">Administrators</p>
                                <h2 className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</h2>
                            </div>
                            <div className="p-3" style={{ background: '#fef3c7' }}>
                                <Shield size={24} color="#f59e0b" />
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted mb-2">System Admins</p>
                                <h2 className="text-2xl font-bold">{users.filter(u => u.role === 'sysadmin').length}</h2>
                            </div>
                            <div className="p-3" style={{ background: '#ddd6fe' }}>
                                <Shield size={24} color="#7c3aed" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card">
                    <h2 className="mb-4">User Management</h2>
                    <div className="overflow-hidden">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Business Name</th>
                                    <th>Role</th>
                                    <th>Subscription</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td className="font-medium">
                                            {u.username}
                                            <div className="text-xs text-muted">{u.phone || ''}</div>
                                        </td>
                                        <td>{u.business_name || '-'}</td>
                                        <td>
                                            <span className={`badge ${u.role === 'admin' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                                {u.role === 'admin' ? 'Admin' : 'System Admin'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.subscription_status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
                                                {u.subscription_status || 'active'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge bg-green-500">
                                                {u.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => openEditModal(u)}
                                                    title="Edit User"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                {u.id !== user?.id && (
                                                    <button
                                                        className="btn-icon danger"
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="card max-w-lg w-full">
                        <h2 className="mb-4">Add New User</h2>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2">
                                <AlertCircle size={18} color="#dc2626" />
                                <span className="text-sm text-red-600">{error}</span>
                            </div>
                        )}
                        <form onSubmit={handleAddUser}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Username</label>
                                <input
                                    className="input"
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Business Name</label>
                                <input
                                    className="input"
                                    type="text"
                                    value={formData.business_name}
                                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Phone</label>
                                <input
                                    className="input"
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        className="input"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Role</label>
                                <select
                                    className="input"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="sysadmin">System Administrator</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Subscription Status</label>
                                <select
                                    className="input"
                                    value={formData.subscription_status}
                                    onChange={(e) => setFormData({ ...formData, subscription_status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="trial">Trial</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="btn flex-1">Create User</button>
                                <button type="button" className="btn-secondary flex-1" onClick={() => { setShowAddModal(false); setError(''); }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="card max-w-lg w-full">
                        <h2 className="mb-4">Edit User</h2>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2">
                                <AlertCircle size={18} color="#dc2626" />
                                <span className="text-sm text-red-600">{error}</span>
                            </div>
                        )}
                        <form onSubmit={handleUpdateUser}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Username</label>
                                <input
                                    className="input"
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Business Name</label>
                                <input
                                    className="input"
                                    type="text"
                                    value={formData.business_name}
                                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Phone</label>
                                <input
                                    className="input"
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">New Password (leave blank to keep current)</label>
                                <div className="relative">
                                    <input
                                        className="input"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Enter new password or leave blank"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Role</label>
                                <select
                                    className="input"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="sysadmin">System Administrator</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Subscription Status</label>
                                <select
                                    className="input"
                                    value={formData.subscription_status}
                                    onChange={(e) => setFormData({ ...formData, subscription_status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="trial">Trial</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="btn flex-1">Update User</button>
                                <button type="button" className="btn-secondary flex-1" onClick={() => { setShowEditModal(false); setError(''); }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
