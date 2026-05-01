import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfileOverlay = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    // State hiển thị
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get("http://localhost:8080/api/auth/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
        } catch (err) {
            setError("Không thể lấy thông tin cá nhân. Vui lòng đăng nhập lại.");
        } finally {
            setLoading(false);
        }
    };

    // --- HÀM XỬ LÝ ĐĂNG XUẤT ---
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        onClose();
        navigate("/login");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">

                {/* Nút Đóng */}
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-slate-600">close</span>
                </button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-500 font-medium">Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-10 text-red-500 font-medium">{error}</div>
                ) : profile ? (
                    <>
                        {/* Thông tin User */}
                        <div className="text-center mb-8 pt-4">
                            <div className="w-24 h-24 bg-primary-fixed rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-lg">
                                <span className="text-4xl font-bold text-primary">{profile.fullName?.charAt(0) || 'U'}</span>
                            </div>
                            <h2 className="text-2xl font-headline font-extrabold text-primary">{profile.fullName || 'Người dùng'}</h2>
                            <p className="text-sm text-slate-500 mt-1">{profile.email || `@${profile.username}`}</p>
                        </div>

                        {/* Nút Đăng xuất */}
                        <div className="pt-2 border-t border-slate-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-4 mt-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                Đăng xuất khỏi hệ thống
                            </button>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default ProfileOverlay;