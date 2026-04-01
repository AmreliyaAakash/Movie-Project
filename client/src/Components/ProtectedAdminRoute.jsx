import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
    const isAuth = localStorage.getItem('adminAuth') === 'true';
    const expiry = localStorage.getItem('adminSessionExpiry');

    if (!isAuth || (expiry && Date.now() > parseInt(expiry))) {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminSessionExpiry');
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};

export default ProtectedAdminRoute;





