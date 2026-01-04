import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRedirect from './components/DashboardRedirect';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SystemDashboard from './pages/SystemDashboard';
import POS from './pages/POS';
import Items from './pages/Items';
import History from './pages/History';
import AdminManagement from './pages/AdminManagement';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardRedirect />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/system" element={<SystemDashboard />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/items" element={<Items />} />
              <Route path="/history" element={<History />} />
              <Route path="/admin" element={<AdminManagement />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
