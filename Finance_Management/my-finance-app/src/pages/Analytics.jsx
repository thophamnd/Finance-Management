import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Analytics = () => {
    const navigate = useNavigate();

    // --- STATE DỮ LIỆU ---
    const [profileData, setProfileData] = useState({ fullName: '', email: '' });
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]); // THÊM STATE ĐỂ LƯU NGÂN SÁCH
    const [loading, setLoading] = useState(true);

    // --- STATE TÍNH TOÁN THỐNG KÊ ---
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        savingAmount: 0,
        savingPercent: 0,
        budgetBreakdown: [] // Đổi từ categoryBreakdown sang budgetBreakdown
    });

    // --- STATE CHO AI ADVISOR ---
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAdvice, setAiAdvice] = useState(null);

    // Lấy chuỗi tháng hiện tại (VD: "2026-04")
    const getCurrentMonthString = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    // 1. GỌI API LẤY DỮ LIỆU (Bao gồm cả Budgets)
    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const monthStr = getCurrentMonthString();

            // Gọi đồng thời 3 API: Profile, Transactions và Budgets
            const [profileRes, transRes, budgetRes] = await Promise.all([
                axios.get("http://localhost:8080/api/auth/profile", { headers }).catch(() => ({ data: {} })),
                axios.get("http://localhost:8080/api/transactions", { headers }).catch(() => ({ data: [] })),
                axios.get(`http://localhost:8080/api/budgets?month=${monthStr}`, { headers }).catch(() => ({ data: [] }))
            ]);

            setProfileData({
                fullName: profileRes.data.fullName || profileRes.data.username || 'Người dùng',
                email: profileRes.data.email || 'Chưa cập nhật'
            });

            const transData = Array.isArray(transRes.data) ? transRes.data : [];
            const budgetData = Array.isArray(budgetRes.data) ? budgetRes.data : [];

            setTransactions(transData);
            setBudgets(budgetData);

            // Tính toán dựa trên cả Giao dịch và Ngân sách
            calculateStats(transData, budgetData);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. HÀM TÍNH TOÁN TIẾN ĐỘ NGÂN SÁCH
    const calculateStats = (transData, budgetData) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let income = 0;
        let expense = 0;

        // Tính tổng Thu/Chi thực tế từ Giao dịch
        transData.forEach(t => {
            const d = new Date(t.transactionDate);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                const amount = parseFloat(t.amount || 0);
                if (t.type === 'INCOME') {
                    income += amount;
                } else if (t.type === 'EXPENSE') {
                    expense += amount;
                }
            }
        });

        // Tính tiến độ cho từng Ngân sách (Lọ)
        const breakdown = budgetData.map(b => {
            const limit = parseFloat(b.limitAmount || 0);
            const spent = parseFloat(b.spentAmount || 0);
            const percent = limit > 0 ? (spent / limit) * 100 : 0;

            // Tự động gán màu sắc tùy theo mức độ tiêu hao
            let color = 'bg-blue-500';
            let statusText = 'An toàn';
            if (percent >= 100) {
                color = 'bg-red-500';
                statusText = 'Vượt hạn mức!';
            } else if (percent >= 80) {
                color = 'bg-orange-500';
                statusText = 'Sắp hết!';
            }

            return {
                id: b.id,
                name: b.name,
                icon: b.icon || 'category',
                limit: limit,
                spent: spent,
                percent: parseFloat(percent.toFixed(1)),
                color: color,
                statusText: statusText
            };
        }).sort((a, b) => b.percent - a.percent); // Sắp xếp lọ nào sắp cạn lên đầu

        // Tính số dư tổng
        const saving = income - expense;
        const savingPct = income > 0 ? Math.max(0, ((saving / income) * 100)).toFixed(1) : 0;

        setStats({
            totalIncome: income,
            totalExpense: expense,
            savingAmount: saving,
            savingPercent: savingPct,
            budgetBreakdown: breakdown
        });
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // 3. AI ADVISOR (Bây giờ đã biết đọc Ngân sách)
    const handleAnalyzeAI = () => {
        setIsAnalyzing(true);
        setAiAdvice(null);

        setTimeout(() => {
            let advice = `📊 **Đánh giá Ngân sách tháng này:**\n\n`;

            if (stats.budgetBreakdown.length === 0) {
                advice += `Bạn chưa thiết lập Ngân sách (6 chiếc lọ) cho tháng này. Hãy vào mục 'Budgets' để tạo ngân sách trước nhé, AI mới có thể tư vấn chuẩn xác được!`;
            } else {
                // Phân loại các lọ
                const overBudgets = stats.budgetBreakdown.filter(b => b.percent >= 100);
                const warningBudgets = stats.budgetBreakdown.filter(b => b.percent >= 80 && b.percent < 100);
                const safeBudgets = stats.budgetBreakdown.filter(b => b.percent < 80);

                if (overBudgets.length > 0) {
                    advice += `🚨 **Báo động đỏ:** Bạn đã chi VƯỢT hạn mức ở các quỹ: ${overBudgets.map(b => `'${b.name}'`).join(', ')}. Hãy lập tức ngừng chi tiêu ở các nhóm này để tránh vỡ nợ cuối tháng!\n\n`;
                }

                if (warningBudgets.length > 0) {
                    advice += `⚠️ **Cần chú ý:** Các quỹ ${warningBudgets.map(b => `'${b.name}'`).join(', ')} đang ở mức báo động (trên 80%). Bạn chỉ còn một chút ngân sách nữa là cạn kiệt.\n\n`;
                }

                if (overBudgets.length === 0 && warningBudgets.length === 0) {
                    advice += `🌟 **Tuyệt vời!** Tất cả các quỹ của bạn đều đang nằm trong vòng an toàn. Kỷ luật tài chính của bạn đang rất tốt!\n\n`;
                }

                if (stats.savingAmount > 0 && safeBudgets.some(b => b.name.includes("Tiết kiệm") || b.name.includes("Đầu tư"))) {
                    advice += `💡 **Gợi ý:** Bạn đang còn dư ${formatMoney(stats.savingAmount)}. Hệ thống thấy quỹ Đầu tư/Tiết kiệm của bạn vẫn còn trống, hãy chuyển phần tiền dư này vào đó để sinh lời nhé!`;
                }
            }

            setAiAdvice(advice);
            setIsAnalyzing(false);
        }, 2500);
    };

    const currentMonthName = new Date().toLocaleString('vi-VN', { month: 'long', year: 'numeric' });

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Đang tải dữ liệu...</div>;

    const strokeColor = stats.totalExpense > stats.totalIncome && stats.totalIncome > 0 ? '#ef4444' : '#00357f';
    let dashOffset = 251.2;
    if (stats.totalIncome > 0) {
        const percentFill = Math.min(stats.totalExpense / stats.totalIncome, 1);
        dashOffset = 251.2 - (251.2 * percentFill);
    } else if (stats.totalExpense > 0 && stats.totalIncome === 0) {
        dashOffset = 0;
    }

    return (
        <div className="bg-slate-50 text-slate-800 min-h-screen flex font-sans antialiased">

            {/* Sidebar */}
            <aside className="h-full w-64 fixed left-0 top-0 bg-white flex flex-col p-4 border-r border-slate-200 z-50">
                <div className="mb-8 px-4 pt-4">
                    <h1 className="font-extrabold text-blue-900 text-2xl tracking-tight cursor-pointer" onClick={() => navigate('/dashboard')}>Financial Management</h1>
                    <p className="text-xs font-medium text-slate-500 tracking-wide uppercase mt-1">Premium Tier</p>
                </div>
                <nav className="flex-1 space-y-2">
                    <NavItem icon="dashboard" label="Dashboard" onClick={() => navigate('/dashboard')} />
                    <NavItem icon="receipt_long" label="Activity" onClick={() => navigate('/activity')} />
                    <NavItem icon="add_circle" label="Add New" onClick={() => navigate('/addnew')} />
                    <NavItem icon="pie_chart" label="Analytics" active />
                    <NavItem icon="account_balance_wallet" label="Budgets" onClick={() => navigate('/budget')} />
                </nav>
                <div className="mt-auto pt-4 border-t border-slate-200 space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold border border-blue-200 uppercase">
                            {(profileData.fullName || 'U').charAt(0)}
                        </div>
                        <div className="flex flex-col overflow-hidden w-full">
                            <span className="text-sm font-bold truncate">{profileData.fullName}</span>
                            <span className="text-[10px] uppercase text-slate-500 truncate">{profileData.email}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight">Báo cáo & Phân tích</h2>
                        <p className="text-slate-500 mt-1">Theo dõi tiến độ Ngân sách tháng hiện tại</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-white border border-slate-200 px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                            {currentMonthName}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-6">

                    {/* KHU VỰC TRỢ LÝ AI (Giữ nguyên giao diện, đổi nội dung AI sinh ra) */}
                    <div className="col-span-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-8 rounded-2xl shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <span className="material-symbols-outlined text-9xl">auto_awesome</span>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                                    <span className="material-symbols-outlined">psychology</span>
                                </div>
                                <h3 className="text-xl font-bold text-blue-900">Chuyên gia Tài chính AI</h3>
                            </div>

                            {!aiAdvice && !isAnalyzing && (
                                <div>
                                    <p className="text-blue-800 mb-6 max-w-2xl text-sm">
                                        Hệ thống AI sẽ đối chiếu các khoản chi tiêu của bạn với <b>Hạn mức Ngân sách (6 chiếc lọ)</b> để đưa ra cảnh báo sớm về nguy cơ cạn kiệt tài chính.
                                    </p>
                                    <button
                                        onClick={handleAnalyzeAI}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                        Khởi chạy Phân tích ngay
                                    </button>
                                </div>
                            )}

                            {isAnalyzing && (
                                <div className="space-y-3 max-w-3xl">
                                    <div className="h-4 bg-blue-200/50 rounded-full animate-pulse w-full"></div>
                                    <div className="h-4 bg-blue-200/50 rounded-full animate-pulse w-5/6"></div>
                                    <div className="h-4 bg-blue-200/50 rounded-full animate-pulse w-4/6"></div>
                                    <p className="text-xs text-blue-600 font-bold mt-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
                                        Đang đối chiếu {stats.budgetBreakdown.length} hạn mức ngân sách...
                                    </p>
                                </div>
                            )}

                            {aiAdvice && (
                                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                    <div className="whitespace-pre-line text-slate-700 text-sm leading-relaxed">
                                        {aiAdvice}
                                    </div>
                                    <button
                                        onClick={() => setAiAdvice(null)}
                                        className="mt-6 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                                        Phân tích lại
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bento Cell: Khuyến khích (Dòng tiền chung) */}
                    <div className={`col-span-12 lg:col-span-4 p-8 rounded-2xl text-white relative overflow-hidden shadow-lg ${stats.savingAmount >= 0 ? 'bg-gradient-to-br from-blue-700 to-indigo-800' : 'bg-gradient-to-br from-red-500 to-red-700'}`}>
                        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="z-10 relative">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">Dòng Tiền Tổng Quan</span>
                            <h3 className="text-3xl font-extrabold mb-4 leading-tight">
                                {stats.savingAmount >= 0 ? 'Tài chính Ổn định!' : 'Báo động đỏ!'}
                            </h3>
                            <p className="text-sm opacity-90">
                                Dòng tiền dương hiện tại của bạn chiếm <span className="font-bold text-lg">{stats.savingPercent}%</span> tổng thu nhập.
                            </p>
                        </div>
                        <div className="mt-8 z-10 relative flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-full text-white">
                                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>
                                    {stats.savingAmount >= 0 ? 'savings' : 'warning'}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">
                                    {stats.savingAmount >= 0 ? 'Dư ra' : 'Thâm hụt'}
                                </p>
                                <p className="text-2xl font-bold">{formatMoney(Math.abs(stats.savingAmount))}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bento Cell: Donut Chart & PROGRESS BAR NGÂN SÁCH */}
                    <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-2xl shadow-sm flex flex-col md:flex-row gap-10 items-center border border-slate-100">

                        <div className="flex-1 w-full max-w-[200px] relative">
                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f5" strokeWidth="12" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke={strokeColor} strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={dashOffset} className="transition-all duration-1000 ease-out" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tổng chi</span>
                                <span className={`text-xl font-extrabold ${stats.totalExpense > stats.totalIncome ? 'text-red-500' : 'text-blue-900'}`}>
                                    {formatMoney(stats.totalExpense).replace('₫','')}
                                </span>
                            </div>
                        </div>

                        {/* DANH SÁCH TIẾN ĐỘ NGÂN SÁCH */}
                        <div className="flex-1 w-full max-h-[250px] overflow-y-auto pr-2 scrollbar-hide space-y-4">
                            {stats.budgetBreakdown.length > 0 ? stats.budgetBreakdown.map((budget, i) => (
                                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px] text-slate-500">{budget.icon}</span>
                                            <span className="text-sm font-bold text-slate-700">{budget.name}</span>
                                        </div>
                                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase ${budget.percent >= 100 ? 'bg-red-100 text-red-600' : budget.percent >= 80 ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {budget.statusText}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2 overflow-hidden">
                                        <div
                                            className={`${budget.color} h-2.5 rounded-full transition-all duration-700`}
                                            style={{ width: `${Math.min(budget.percent, 100)}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-500">Đã tiêu: <span className="text-slate-800">{formatMoney(budget.spent)}</span></span>
                                        <span className="text-slate-400">/ {formatMoney(budget.limit)}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center text-sm text-slate-400 py-8 flex flex-col items-center gap-3">
                                    <span className="material-symbols-outlined text-4xl opacity-50">account_balance_wallet</span>
                                    <p>Chưa có ngân sách cho tháng này.<br/>Hãy sang tab <b>Budgets</b> để thiết lập nhé!</p>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </main>

            <button
                onClick={() => navigate('/addnew')}
                className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60]"
            >
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:translate-x-1 
        ${active ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
    >
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-sm font-semibold">{label}</span>
    </button>
);

export default Analytics;