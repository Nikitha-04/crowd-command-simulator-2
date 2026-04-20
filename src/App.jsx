import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useStore from './store/useStore';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ViewerDashboard from './pages/ViewerDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const currentUser = useStore(state => state.currentUser);
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && currentUser.role.toLowerCase() !== requiredRole.toLowerCase()) {
    // If they try to access wrong dashboard, redirect to their proper one
    return <Navigate to={currentUser.role.toLowerCase() === 'organizer' ? "/dashboard" : "/viewer"} replace />;
  }
  
  return children;
};

function App() {
  const { connectSocket, disconnectSocket, currentUser, theme } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Only connect socket if logged in to save resources
    if (currentUser) {
      connectSocket();
    }
    return () => disconnectSocket();
  }, [connectSocket, disconnectSocket, currentUser]);

  return (
    <Router>
      <div className="min-h-screen bg-dark-bg text-gray-100 font-sans">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={
            currentUser ? <Navigate to={currentUser.role.toLowerCase() === 'organizer' ? "/dashboard" : "/viewer"} replace /> : <Login />
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="Organizer">
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/viewer" element={
            <ProtectedRoute requiredRole="Viewer">
              <ViewerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
