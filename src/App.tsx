import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TableProvider } from "@/contexts/TableContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Customer Pages
import HomePage from "./pages/customer/HomePage";
import MenuPage from "./pages/customer/MenuPage";
import CartPage from "./pages/customer/CartPage";
import BookingPage from "./pages/customer/BookingPage";
import DinePage from "./pages/customer/DinePage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminTables from "./pages/admin/AdminTables";
import AdminLogin from "./pages/admin/AdminLogin";

// Waiter Pages
import WaiterOrders from "./pages/waiter/WaiterOrders";

// Captain Pages
import CaptainLogin from "./pages/captain/Login";
import CaptainDashboard from "./pages/captain/Dashboard";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TableProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/dine/:qr_token" element={<DinePage />} />
                <Route path="/admin-login" element={<AdminLogin />} />

                {/* Admin Routes (Bypassing protection temporarily for preview) */}
                <Route path="/admin/*">
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="menu" element={<AdminMenu />} />
                  <Route path="staff" element={<AdminStaff />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="tables" element={<AdminTables />} />
                </Route>

                {/* Protected Waiter Routes */}
                <Route 
                  path="/waiter" 
                  element={
                    <ProtectedRoute>
                      <WaiterOrders />
                    </ProtectedRoute>
                  } 
                />

                {/* Captain Routes */}
                <Route path="/login-captain" element={<CaptainLogin />} />
                <Route path="/captain" element={<CaptainDashboard />} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </TableProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

