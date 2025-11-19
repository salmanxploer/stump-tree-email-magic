import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as HotToaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import OAuthCallback from "./pages/auth/OAuthCallback";

// Shared Pages
import Profile from "./pages/shared/Profile";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminFoods from "./pages/admin/Foods";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";

// Staff Pages
import StaffDashboard from "./pages/staff/Dashboard";

// Customer Pages
import CustomerMenu from "./pages/customer/Menu";
import CustomerCart from "./pages/customer/Cart";
import CustomerOrders from "./pages/customer/Orders";
import OrderTracking from "./pages/customer/OrderTracking";
import InvoicePage from "./pages/customer/Invoice";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Home redirect component
const HomeRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role === 'admin' || (user.email?.toLowerCase() === 'admin@bubt.edu')) {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === 'staff') {
    return <Navigate to="/staff/dashboard" replace />;
  } else {
    return <Navigate to="/customer/menu" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <HotToaster position="top-right" />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                
                {/* Home redirect */}
                <Route path="/" element={<HomeRedirect />} />
                
                {/* Profile Route (All authenticated users) */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/foods"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminFoods />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                
                {/* Staff Routes */}
                <Route
                  path="/staff/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['staff']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* Customer Routes */}
                <Route
                  path="/customer/menu"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <CustomerMenu />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/cart"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <CustomerCart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/orders"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <CustomerOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/orders/:orderId"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <OrderTracking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/invoices/:invoiceId"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <InvoicePage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
