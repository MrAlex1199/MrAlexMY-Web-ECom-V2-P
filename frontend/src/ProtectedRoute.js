import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAdmin, children }) => {
  if (!isAdmin) {
    // Redirect to login page if user is not an admin
    return <Navigate to="/admin-login" />;
  }

  // Render the children components if user is an admin
  return children;
};

export default ProtectedRoute;