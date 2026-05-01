import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const RegisterForm = () => {
    // 1. Khai báo thêm state fullName để khớp với User.java
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState(''); // Thêm cái này
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // 2. Gửi đúng các trường: username, fullName, email, password
            const response = await axios.post("http://localhost:8080/api/auth/register", {
                username: username,
                fullName: fullName, // Phải viết đúng camelCase như trong User.java
                email: email,
                password: password
            });

            if (response.status === 201 || response.status === 200) {
                alert("Đăng ký thành công! Hãy đăng nhập.");
                navigate("/login");
            }
        } catch (err) {
            console.error("Lỗi đăng ký:", err);
            // Hiển thị lỗi từ backend nếu có (ví dụ: username đã tồn tại)
            setError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-surface p-6">
            <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-outline-variant/20 shadow-2xl">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold font-headline text-primary tracking-tight">Tham gia Financial Management</h2>
                    <p className="text-on-surface-variant text-sm mt-2">Bắt đầu hành trình quản l tài chính ngay hôm nay</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-error-container text-on-error-container text-xs font-bold rounded-xl border border-error/20">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleRegister}>
                    {/* Ô NHẬP USERNAME */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Tên đăng nhập</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-5 py-3 rounded-2xl bg-surface-container-low border border-outline-variant focus:border-primary outline-none transition-all placeholder:text-slate-400"
                            placeholder="alex_nguyen"
                        />
                    </div>

                    {/* Ô NHẬP FULL NAME (Đã bổ sung để khớp với Database) */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Họ và Tên</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-5 py-3 rounded-2xl bg-surface-container-low border border-outline-variant focus:border-primary outline-none transition-all"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    {/* Ô NHẬP EMAIL */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-3 rounded-2xl bg-surface-container-low border border-outline-variant focus:border-primary outline-none transition-all"
                            placeholder="alex@architect.io"
                        />
                    </div>

                    {/* Ô NHẬP MẬT KHẨU */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Mật khẩu</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-3 rounded-2xl bg-surface-container-low border border-outline-variant focus:border-primary outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-on-primary py-4 rounded-2xl font-extrabold text-lg shadow-lg hover:bg-primary-container hover:scale-[1.01] active:scale-95 transition-all mt-2"
                    >
                        Tạo tài khoản
                    </button>
                </form>

                <p className="text-center text-sm text-on-surface-variant mt-8">
                    Đã có tài khoản? <Link to="/login" className="text-primary font-bold hover:underline">Đăng nhập ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;