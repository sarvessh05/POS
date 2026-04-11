import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Customer Pages
import HomePage from "./pages/customer/HomePage";
import MenuPage from "./pages/customer/MenuPage";
import CartPage from "./pages/customer/CartPage";
import BookingPage from "./pages/customer/BookingPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMenu from "./pages/admin/AdminMenu";

// Waiter Pages
import WaiterOrders from "./pages/waiter/WaiterOrders";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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

              {/* Protected Admin Routes */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="menu" element={<AdminMenu />} />
                    </Routes>
                  </ProtectedRoute>
                } 
              />

              {/* Protected Waiter Routes */}
              <Route 
                path="/waiter" 
                element={
                  <ProtectedRoute>
                    <WaiterOrders />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

