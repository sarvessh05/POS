import React, { useEffect, useState } from 'react';
import api from '../api';
import { DollarSign, ShoppingBag, TrendingUp, Package } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalItems: 0,
        avgOrderValue: 0,
        todayRevenue: 0,
        todayOrders: 0
    });

    useEffect(() => {
        fetchStats();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchStats();
        }, 30000);

        // Check for day change every minute and refresh
        const checkDayChange = setInterval(() => {
            const now = new Date();
            const lastCheck = localStorage.getItem('lastDashboardCheck');
            const lastCheckDate = lastCheck ? new Date(lastCheck) : null;
            
            if (!lastCheckDate || lastCheckDate.getDate() !== now.getDate()) {
                fetchStats();
                localStorage.setItem('lastDashboardCheck', now.toISOString());
            }
        }, 60000); // Check every minute

        // Cleanup intervals on unmount
        return () => {
            clearInterval(interval);
            clearInterval(checkDayChange);
        };
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch invoices (filtered by admin_id automatically by backend)
            const invoicesRes = await api.get('/invoices/?limit=1000');
            const invoices = invoicesRes.data;

            // Fetch items (filtered by admin_id automatically by backend)
            const itemsRes = await api.get('/items/');
            const items = itemsRes.data;

            // Calculate total revenue
            const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);

            // Calculate today's stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayInvoices = invoices.filter(inv => {
                const invDate = new Date(inv.created_at);
                invDate.setHours(0, 0, 0, 0);
                return invDate.getTime() === today.getTime();
            });

            const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

            // Calculate average order value
            const avgOrderValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

            setStats({
                totalRevenue: totalRevenue,
                totalOrders: invoices.length,
                totalItems: items.length,
                avgOrderValue: avgOrderValue,
                todayRevenue: todayRevenue,
                todayOrders: todayInvoices.length
            });
        } catch (e) {
            console.error('Error fetching stats:', e);
        }
    };

    const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
        <div className="card flex items-center gap-4">
            <div className="p-3" style={{ backgroundColor: color, borderRadius: '0px' }}>
                <Icon size={24} color="white" />
            </div>
            <div>
                <p className="text-muted text-sm mb-2">{title}</p>
                <h2 className="text-2xl font-bold">{value}</h2>
                {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
            </div>
        </div>
    );

    return (
        <div className="page-container">
            <div className="content-area animate-fade-in">
                <div className="mb-8">
                    <h1>Dashboard</h1>
                    <p className="text-muted">Overview of your business performance</p>
                </div>

                <div className="grid grid-cols-auto-fit gap-6 mb-8">
                    <StatCard
                        title="Total Revenue"
                        value={`₹${stats.totalRevenue.toFixed(2)}`}
                        subtitle="All-time sales"
                        icon={DollarSign}
                        color="#10b981"
                    />
                    <StatCard
                        title="Total Orders"
                        value={stats.totalOrders}
                        subtitle="Completed invoices"
                        icon={ShoppingBag}
                        color="#3b82f6"
                    />
                    <StatCard
                        title="Avg Order Value"
                        value={`₹${stats.avgOrderValue.toFixed(2)}`}
                        subtitle="Per invoice"
                        icon={TrendingUp}
                        color="#f59e0b"
                    />
                    <StatCard
                        title="Total Items"
                        value={stats.totalItems}
                        subtitle="In inventory"
                        icon={Package}
                        color="#8b5cf6"
                    />
                </div>

                {/* Today's Stats */}
                <div className="card mb-6">
                    <h2 className="mb-4">Today's Performance</h2>
                    <div className="grid grid-cols-auto-fit gap-6">
                        <div>
                            <p className="text-sm text-muted mb-2">Today's Revenue</p>
                            <h3 className="text-xl font-bold text-green-600">₹{stats.todayRevenue.toFixed(2)}</h3>
                        </div>
                        <div>
                            <p className="text-sm text-muted mb-2">Today's Orders</p>
                            <h3 className="text-xl font-bold text-blue-600">{stats.todayOrders}</h3>
                        </div>
                        <div>
                            <p className="text-sm text-muted mb-2">Today's Average</p>
                            <h3 className="text-xl font-bold text-purple-600">
                                ₹{stats.todayOrders > 0 ? (stats.todayRevenue / stats.todayOrders).toFixed(2) : '0.00'}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Summary */}
                <div className="card">
                    <h2 className="mb-4">Business Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                            <span className="text-sm font-medium">Total Revenue</span>
                            <span className="font-bold text-green-600">₹{stats.totalRevenue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                            <span className="text-sm font-medium">Total Orders</span>
                            <span className="font-bold text-blue-600">{stats.totalOrders}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                            <span className="text-sm font-medium">Average Order Value</span>
                            <span className="font-bold text-purple-600">₹{stats.avgOrderValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                            <span className="text-sm font-medium">Items in Inventory</span>
                            <span className="font-bold text-orange-600">{stats.totalItems}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
