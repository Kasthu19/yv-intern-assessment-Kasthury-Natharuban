import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import MemberDashboard from './pages/MemberDashboard';
import StaffDashboard from './pages/StaffDashboard';
import MembersList from './pages/MembersList';
import ChairmanDashboard from './pages/ChairmanDashboard';
import AuditLogPage from './pages/AuditLogPage';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MemberDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/applications"
                element={
                  <ProtectedRoute requiredPermission="application.view">
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/members"
                element={
                  <ProtectedRoute requiredPermission="member.view">
                    <MembersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chairman"
                element={
                  <ProtectedRoute requiredPermission="role.manage">
                    <ChairmanDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute requiredPermission="audit.view">
                    <AuditLogPage />
                  </ProtectedRoute>
                }
              />

              {/* Default Redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
