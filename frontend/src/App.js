import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import Chat from './components/Chat';
import { useAuth } from './context/AuthContext';

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" />;
  }
  return children;
};

// Protected Route Component for Users
const ProtectedUserRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        user ? (
          user.role === 'admin' ? 
          <Navigate to="/admin" /> : 
          <Navigate to="/chat" />
        ) : (
          <Navigate to="/login" />
        )
      } />
      
      {/* Public Routes */}
      <Route path="/login" element={
        user ? (
          user.role === 'admin' ? 
          <Navigate to="/admin" /> : 
          <Navigate to="/chat" />
        ) : (
          <Login />
        )
      } />
      <Route path="/register" element={
        user ? (
          user.role === 'admin' ? 
          <Navigate to="/admin" /> : 
          <Navigate to="/chat" />
        ) : (
          <Register />
        )
      } />
      <Route path="/admin/login" element={
        user?.role === 'admin' ? 
        <Navigate to="/admin" /> : 
        <AdminLogin />
      } />
      
      {/* Protected User Routes */}
      <Route
        path="/chat"
        element={
          <ProtectedUserRoute>
            <Chat standalone={true} />
          </ProtectedUserRoute>
        }
      />
      
      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  );
}

export default App;