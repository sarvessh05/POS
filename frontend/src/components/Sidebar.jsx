import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, Package, FileText, Settings, LogOut, Shield, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'sysadmin';
    const isSysAdmin = user?.role === 'sysadmin';

    return (
        <div className="sidebar p-4">
            <div className="mb-8 p-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center">
                    <span className="font-bold text-white">R</span>
                </div>
                <div>
                    <h1 className="font-bold leading-none">RECO POS</h1>
                    <span className="text-[10px] text-slate-400 block leading-none mt-1">by Ailexity</span>
                </div>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
                {/* Dashboard - Only for admin, NOT sysadmin */}
                {!isSysAdmin && (
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Home size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                )}

                {/* System Dashboard - Only sysadmin */}
                {isSysAdmin && (
                    <NavLink to="/system" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <BarChart3 size={20} />
                        <span>System Dashboard</span>
                    </NavLink>
                )}

                {/* Only show POS, History, Items to admin - NOT sysadmin */}
                {!isSysAdmin && (
                    <>
                        <NavLink to="/pos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <ShoppingCart size={20} />
                            <span>Billing</span>
                        </NavLink>

                        <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <FileText size={20} />
                            <span>History</span>
                        </NavLink>

                        {isAdmin && (
                            <NavLink to="/items" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                <Package size={20} />
                                <span>Items</span>
                            </NavLink>
                        )}
                    </>
                )}

                {/* System Admin - only for sysadmin */}
                {isSysAdmin && (
                    <>
                        <div style={{ margin: '0.5rem 0', borderTop: '1px solid #475569' }}></div>

                        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Shield size={20} />
                            <span>System Admin</span>
                        </NavLink>
                    </>
                )}
            </nav>

            <div className="mt-auto border-t border-slate-700 pt-4">
                <div className="p-2 mb-2">
                    <div className="text-sm font-medium text-main">{user?.username}</div>
                    <div className="text-xs text-slate-400 capitalize">{user?.role}</div>
                </div>
                <button onClick={logout} className="nav-item w-full text-left" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
