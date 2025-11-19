import React from 'react';
import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';
import AdminLayout from './admin/AdminLayout';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminRoute;
