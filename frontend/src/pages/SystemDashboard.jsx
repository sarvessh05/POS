import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, TrendingUp, DollarSign, ShoppingCart, Package, BarChart3, Shield } from 'lucide-react';

const SystemDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        totalSysAdmins: 0,
        totalInvoices: 0,
        totalRevenue: 0,
        totalItems: 0,
        recentActivity: []
    });
    const [users, setUsers] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Security: Redirect if not sysadmin
    useEffect(() => {
        if (user && user.role !== 'sysadmin') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchSystemStats();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchSystemStats();
        }, 30000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    const fetchSystemStats = async () => {
        try {
            // Fetch users
            const usersRes = await api.get('/users/');
            const usersData = usersRes.data;

            // Fetch invoices
            const invoicesRes = await api.get('/invoices/');
            const invoicesData = invoicesRes.data;

            // Fetch items
            const itemsRes = await api.get('/items/');
            const itemsData = itemsRes.data;

            // Calculate per-admin statistics
            const usersWithStats = usersData.map(u => {
                if (u.role === 'admin') {
                    // Calculate revenue for this admin
                    const adminInvoices = invoicesData.filter(inv => inv.admin_id === u.id);
                    const adminRevenue = adminInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
                    const adminItems = itemsData.filter(item => item.admin_id === u.id);

                    return {
                        ...u,
                        totalRevenue: adminRevenue,
                        totalInvoices: adminInvoices.length,
                        totalItems: adminItems.length
                    };
                }
                return {
                    ...u,
                    totalRevenue: 0,
                    totalInvoices: 0,
                    totalItems: 0
                };
            });

            setUsers(usersWithStats);

            // Calculate overall stats
            const totalRevenue = invoicesData.reduce((sum, inv) => sum + inv.total_amount, 0);
            const totalAdmins = usersData.filter(u => u.role === 'admin').length;
            const totalSysAdmins = usersData.filter(u => u.role === 'sysadmin').length;

            setStats({
                totalUsers: usersData.length,
                totalAdmins: totalAdmins,
                totalSysAdmins: totalSysAdmins,
                totalInvoices: invoicesData.length,
                totalRevenue: totalRevenue,
                totalItems: itemsData.length,
                recentActivity: invoicesData.slice(-10).reverse()
            });

            setLoading(false);
        } catch (err) {
            console.error('Error fetching system stats:', err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted">Loading system statistics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div className="header-section">
                <div className="flex items-center gap-3">
                    <div style={{ width: '40px', height: '40px', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart3 size={24} color="white" />
                    </div>
                    <div>
                        <h1>System Dashboard</h1>
                        <p className="text-muted text-sm">Overview of all system activities and users</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="content-area">
                {/* Stats Grid */}
                <div className="grid grid-cols-auto-fit gap-6 mb-6">
                    {/* Total Users */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted mb-2">Total Users</p>
                                <h2 className="text-2xl font-bold">{stats.totalUsers}</h2>
                                <p className="text-xs text-muted mt-1">All system users</p>
                            </div>
                            <div className="p-3" style={{ background: '#eef2ff' }}>
                                <Users size={28} color="#4f46e5" />
                            </div>
                        </div>
                    </div>

                    {/* Administrators */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted mb-2">Administrators</p>
                                <h2 className="text-2xl font-bold">{stats.totalAdmins}</h2>
                                <p className="text-xs text-muted mt-1">Active admins</p>
                            </div>
                            <div className="p-3" style={{ background: '#fef3c7' }}>
                                <Shield size={28} color="#f59e0b" />
                            </div>
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted mb-2">Total Revenue</p>
                                <h2 className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</h2>
                                <p className="text-xs text-muted mt-1">All-time sales</p>
                            </div>
                            <div className="p-3" style={{ background: '#d1fae5' }}>
                                <DollarSign size={28} color="#10b981" />
                            </div>
                        </div>
                    </div>

                    {/* Total Invoices */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted mb-2">Total Invoices</p>
                                <h2 className="text-2xl font-bold">{stats.totalInvoices}</h2>
                                <p className="text-xs text-muted mt-1">Completed orders</p>
                            </div>
                            <div className="p-3" style={{ background: '#fce7f3' }}>
                                <ShoppingCart size={28} color="#ec4899" />
                            </div>
                        </div>
                    </div>

                    {/* Total Items */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted mb-2">Total Items</p>
                                <h2 className="text-2xl font-bold">{stats.totalItems}</h2>
                                <p className="text-xs text-muted mt-1">In inventory</p>
                            </div>
                            <div className="p-3" style={{ background: '#e0e7ff' }}>
                                <Package size={28} color="#6366f1" />
                            </div>
                        </div>
                    </div>

                    {/* Average Order Value */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted mb-2">Avg Order Value</p>
                                <h2 className="text-2xl font-bold">
                                    ₹{stats.totalInvoices > 0 ? (stats.totalRevenue / stats.totalInvoices).toFixed(2) : '0.00'}
                                </h2>
                                <p className="text-xs text-muted mt-1">Per invoice</p>
                            </div>
                            <div className="p-3" style={{ background: '#ddd6fe' }}>
                                <TrendingUp size={28} color="#7c3aed" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card mb-6">
                    <h2 className="mb-4">All System Users & Statistics</h2>
                    <div className="overflow-hidden">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Business Name</th>
                                    <th>Role</th>
                                    <th>Total Revenue</th>
                                    <th>Invoices</th>
                                    <th>Items</th>
                                    <th>Subscription</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td className="font-medium">
                                            {u.username}
                                            <div className="text-xs text-muted">{u.phone || 'No phone'}</div>
                                        </td>
                                        <td>{u.business_name || '-'}</td>
                                        <td>
                                            <span className={`badge ${u.role === 'sysadmin' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                                {u.role === 'sysadmin' ? 'System Admin' : 'Admin'}
                                            </span>
                                        </td>
                                        <td className="font-bold text-green-600">
                                            {u.role === 'admin' ? `₹${u.totalRevenue.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="text-center">
                                            {u.role === 'admin' ? u.totalInvoices : '-'}
                                        </td>
                                        <td className="text-center">
                                            {u.role === 'admin' ? u.totalItems : '-'}
                                        </td>
                                        <td>
                                            <span className={`badge ${u.subscription_status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
                                                {u.subscription_status || 'Active'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h2 className="mb-4">Recent System Activity</h2>
                    <div className="overflow-hidden">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentActivity.length > 0 ? (
                                    stats.recentActivity.map(inv => (
                                        <tr key={inv.id}>
                                            <td className="font-medium">{inv.invoice_number}</td>
                                            <td>{inv.customer_name || 'Walk-in Customer'}</td>
                                            <td className="font-bold text-green-600">₹{inv.total_amount.toFixed(2)}</td>
                                            <td>
                                                <span className="badge bg-blue-500">{inv.payment_mode}</span>
                                            </td>
                                            <td className="text-sm text-muted">
                                                {new Date(inv.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted">
                                            No recent activity
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemDashboard;
