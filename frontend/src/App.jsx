import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider, useUI } from './context/UIContext';
import { WishlistProvider } from './context/WishlistContext';
import { AnimatePresence } from 'framer-motion';

import AuthModal from './context/AuthModal';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail'; 
import AddItem from './pages/AddItem';
import Profile from './pages/Profile';
import Swaps from './pages/Swaps';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/AdminDashboard';
import ResetPassword from './pages/ResetPassword'; // Import kiya
import SwapDetail from './pages/SwapDetail';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location, requireAuth: true }} replace />;
  }

  return children;
};

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openAuthModal } = useUI();

  useEffect(() => {
    if (location.state?.requireAuth) {
      openAuthModal();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, openAuthModal, navigate]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/items" element={<Items />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        
        {/* Reset Password Route Public hai */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/add-item" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/swaps" element={<ProtectedRoute><Swaps /></ProtectedRoute>} />
                <Route path="/swaps/:id" element={<ProtectedRoute><SwapDetail /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <WishlistProvider>
          <Toaster position="top-right" />
          <AppRoutes />
          <AuthModal />
        </WishlistProvider>
      </UIProvider>
    </AuthProvider>
  );
}

export default App;