// File: ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Tìm vé thông hành trong bộ nhớ
    const token = localStorage.getItem("token");

    // Nếu KHÔNG CÓ vé -> Đá thẳng về trang /login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Nếu CÓ vé -> Cho phép đi tiếp vào giao diện (children)
    return children;
};

export default ProtectedRoute;