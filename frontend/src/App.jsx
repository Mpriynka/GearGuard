import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import RequestDetail from './pages/RequestDetail';
import RequestList from './pages/RequestList';
import Categories from './pages/Categories';
import Teams from './pages/Teams';
import EquipmentDetail from './pages/EquipmentDetail';
import CalendarPage from './pages/CalendarPage';
import Reporting from './pages/Reporting';
import WorkCenters from './pages/WorkCenters';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { token, user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/login" />;

  // If we have a token but no user yet, wait for AuthContext to decode it.
  // Prevents premature redirect or "Unauthorized" state during hydration.
  if (token && !user) return <div>Loading User...</div>;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If on dashboard and unauthorized? That's weird. 
    // But if trying to access restricted page, go to dashboard.
    // If already on dashboard and unauthorized, maybe login?
    return <Navigate to="/dashboard" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'TECHNICIAN', 'EMPLOYEE']}><Dashboard /></PrivateRoute>} />

          <Route path="/equipment" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'TECHNICIAN', 'EMPLOYEE']}><Equipment /></PrivateRoute>} />
          <Route path="/equipment/:id" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'TECHNICIAN', 'EMPLOYEE']}><EquipmentDetail /></PrivateRoute>} />

          <Route path="/requests" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'TECHNICIAN']}><RequestList /></PrivateRoute>} />
          <Route path="/maintenance" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'TECHNICIAN']}><RequestList /></PrivateRoute>} />
          <Route path="/maintenance/:id" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'TECHNICIAN', 'EMPLOYEE']}><RequestDetail /></PrivateRoute>} /> {/* Employees can view/create but maybe not edit all fields? */}

          <Route path="/work-centers" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'EMPLOYEE']}><WorkCenters /></PrivateRoute>} />

          <Route path="/categories" element={<PrivateRoute allowedRoles={['ADMIN']}><Categories /></PrivateRoute>} />
          <Route path="/teams" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}><Teams /></PrivateRoute>} />
          <Route path="/reporting" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}><Reporting /></PrivateRoute>} />
          <Route path="/calendar" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}><CalendarPage /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
