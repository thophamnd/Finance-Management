import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const LoginForm = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log("Đang gửi yêu cầu đăng nhập...");
            const response = await axios.post("http://localhost:8080/api/auth/login", {
                username: username,
                password: password
            });

            console.log("Dữ liệu từ Server trả về:", response.data);

            if (response.data && response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("username", response.data.username || username);

                alert("Đăng nhập thành công!");
                navigate("/dashboard");
            } else {
                setError("Server không trả về Token xác thực!");
            }
        } catch (err) {
            console.error("Lỗi chi tiết:", err);

            if (!err.response) {
                setError("Không thể kết nối tới Server (Kiểm tra lại Backend đã chạy chưa?)");
            } else if (err.response.status === 401) {
                setError("Tên đăng nhập hoặc mật khẩu không đúng!");
            } else if (err.response.status === 403) {
                setError("Lỗi bảo mật (CORS): Backend đang chặn Frontend!");
            } else {
                setError("Đã xảy ra lỗi: " + (err.response.data?.message || "Vui lòng thử lại"));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-surface p-6 relative">

            {/* NÚT QUAY LẠI TỔNG THỂ (Bên ngoài Card, góc trên bên trái) */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary hover:-translate-x-1 transition-all"
            >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Trang chủ
            </button>

            <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-outline-variant/20 shadow-2xl relative">

                <div className="text-center mb-10">
                    {/* Icon trang trí nhẹ nhàng */}
                    <div className="w-16 h-16 bg-primary-fixed text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <span className="material-symbols-outlined text-3xl">login</span>
                    </div>
                    <h2 className="text-3xl font-extrabold font-headline text-primary tracking-tight">Chào mừng trở lại</h2>
                    <p className="text-sm text-on-surface-variant mt-2 font-medium">Đăng nhập để quản lý tài chính của bạn</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Tên đăng nhập</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="Nhập username"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Mật khẩu</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex justify-end">
                        <a href="#" className="text-xs font-bold text-primary hover:underline">Quên mật khẩu?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-extrabold text-lg shadow-[0_8px_30px_rgb(0,53,127,0.12)] transition-all flex items-center justify-center gap-2 
                        ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary text-on-primary hover:scale-[1.02] active:scale-95'}`}
                    >
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Đang xác thực...
                            </>
                        ) : 'Đăng nhập'}
                    </button>
                </form>

                {/* PHẦN CHUYỂN TỚI TRANG ĐĂNG KÝ */}
                <div className="mt-8 text-center text-sm font-medium text-on-surface-variant">
                    Bạn chưa có tài khoản?{' '}
                    <Link to="/register" className="font-bold text-primary hover:underline ml-1">
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;