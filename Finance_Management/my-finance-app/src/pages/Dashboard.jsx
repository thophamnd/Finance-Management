import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import ProfileOverlay from './ProfileOverlay';

const Dashboard = () => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // --- State Dữ liệu ---
    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        balance: 0,
        username: ''
    });
    const [accounts, setAccounts] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);

    // --- State Modal Tạo Nguồn tiền ---
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [newAccount, setNewAccount] = useState({ accountName: '', balance: '' });
    const [loading, setLoading] = useState(false);

    // Hàm gọi API lấy dữ liệu
    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };

            const [profileRes, accountsRes, transactionsRes] = await Promise.all([
                axios.get("http://localhost:8080/api/auth/profile", { headers }),
                axios.get("http://localhost:8080/api/accounts", { headers }).catch(() => ({ data: [] })),
                axios.get("http://localhost:8080/api/transactions", { headers }).catch(() => ({ data: [] }))
            ]);

            setProfileData({
                fullName: profileRes.data.fullName || profileRes.data.username || 'Người dùng',
                email: profileRes.data.email || profileRes.data.username || 'Chưa cập nhật email',
                balance: profileRes.data.account?.balance || 0,
                username: profileRes.data.username
            });

            if (accountsRes.data && Array.isArray(accountsRes.data)) {
                setAccounts(accountsRes.data);
            }

            if (transactionsRes.data && Array.isArray(transactionsRes.data)) {
                setAllTransactions(transactionsRes.data);
                setRecentTransactions(transactionsRes.data.slice(0, 3));
            }

        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Tổng số dư
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const displayBalance = accounts.length > 0 ? totalBalance : profileData.balance;

    const handleCreateAccount = async () => {
        if (!newAccount.accountName) return alert("Vui lòng nhập tên tài khoản/ngân hàng!");
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:8080/api/accounts", {
                accountName: newAccount.accountName,
                balance: parseFloat(newAccount.balance) || 0
            }, { headers: { Authorization: `Bearer ${token}` } });
            setShowAccountModal(false);
            setNewAccount({ accountName: '', balance: '' });
            alert("Đã thêm nguồn tiền thành công!");
            await fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi thêm nguồn tiền!");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Bạn có chắc chắn muốn xóa ví này không? Lịch sử giao dịch liên quan có thể bị ảnh hưởng.")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8080/api/accounts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Đã xóa ví thành công!");
            await fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi xóa ví!");
        }
    };

    // =========================================================================
    // LOGIC TÍNH TOÁN BIỂU ĐỒ
    // =========================================================================
    const currentYear = new Date().getFullYear();
    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
        label: `T${i + 1}`,
        income: 0,
        expense: 0
    }));

    allTransactions.forEach(t => {
        const d = new Date(t.transactionDate);
        if (d.getFullYear() === currentYear) {
            const monthIndex = d.getMonth();
            const amount = parseFloat(t.amount || 0);

            if (t.type === 'INCOME') {
                monthlyStats[monthIndex].income += amount;
            } else if (t.type === 'EXPENSE') {
                monthlyStats[monthIndex].expense += amount;
            }
        }
    });

    const maxAmount = Math.max(...monthlyStats.map(m => Math.max(m.income, m.expense)), 1000);

    return (
        <div className="bg-surface text-on-surface min-h-screen">
            <aside className="hidden md:flex flex-col h-screen p-4 border-r border-outline-variant/10 bg-surface-container-low w-64 fixed left-0 top-0 font-body text-sm antialiased">
                <div className="mb-10 px-4">
                    <Link to="/dashboard">
                        <h1 className="font-['Manrope'] font-extrabold text-blue-900 text-xl cursor-pointer">
                            Financial Management
                        </h1>
                    </Link>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1 font-bold">Premium Tier</p>
                </div>

                <nav className="flex-1 flex flex-col gap-1">
                    <NavItem icon="dashboard" label="Dashboard" active />
                    <NavItem icon="receipt_long" label="Activity" to="/activity" />
                    <NavItem icon="add_circle" label="Add New" to="/addnew" />
                    <NavItem icon="pie_chart" label="Analytics" to="/analyst" />
                    <NavItem icon="account_balance_wallet" label="Budgets" to="/budget" />
                </nav>

                <div className="mt-auto border-t border-outline-variant/20 pt-4 flex flex-col gap-1">
                    <NavItem icon="settings" label="Settings" />
                    <NavItem icon="help_outline" label="Support" />

                    <div
                        onClick={() => setIsProfileOpen(true)}
                        className="mt-6 px-4 py-2 flex items-center gap-3 hover:bg-surface-container rounded-2xl cursor-pointer transition-all active:scale-95"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm shrink-0">
                            {(profileData.fullName || profileData.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden w-full">
                            <p className="font-semibold text-on-surface text-xs leading-tight truncate">
                                {profileData.fullName || 'Người dùng'}
                            </p>
                            <p className="text-[10px] text-on-surface-variant font-medium truncate mt-0.5">
                                {profileData.email}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="md:ml-64 p-6 lg:p-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-primary headline tracking-tight font-headline">
                            Chào buổi sáng, {profileData.fullName ? profileData.fullName.split(' ')[0] : 'Bạn'}
                        </h2>
                        <p className="text-on-surface-variant body-md mt-1">Dưới đây là tóm tắt tài chính của bạn trong ngày hôm nay.</p>
                    </div>
                    <button
                        onClick={() => navigate('/addnew')}
                        className="bg-primary text-on-primary px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Thêm giao dịch mới
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Hero Balance */}
                    <section className="lg:col-span-8 bg-gradient-to-br from-primary to-primary-container p-8 rounded-[2rem] text-on-primary shadow-xl flex flex-col justify-between min-h-[240px] relative overflow-hidden">
                        <div className="relative z-10">
                            <span className="text-on-primary-container font-medium text-xs tracking-widest uppercase opacity-80">Tổng số dư các ví</span>
                            <h1 className="text-5xl font-extrabold font-headline mt-2">
                                {displayBalance.toLocaleString('vi-VN')} <span className="text-2xl font-normal opacity-70">VND</span>
                            </h1>
                        </div>
                        <div className="flex gap-10 mt-8 relative z-10">
                            <BalanceStat label="Tài khoản hiện có" value={`${accounts.length} Ví`} />
                            <BalanceStat label="Tiết kiệm tháng" value="+12.5%" />
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    </section>

                    {/* Nguồn Tiền */}
                    <section className="lg:col-span-4 bg-white p-8 rounded-[2rem] shadow-sm border border-outline-variant/10 flex flex-col max-h-[240px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-primary font-headline">Nguồn tiền của bạn</h3>
                            <button
                                onClick={() => setShowAccountModal(true)}
                                className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                            {accounts.length > 0 ? accounts.map(acc => (
                                <div key={acc.id} className="p-3 rounded-2xl border border-slate-100 flex justify-between items-center bg-slate-50 relative group transition-all hover:bg-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                            <span className="material-symbols-outlined text-sm">account_balance</span>
                                        </div>
                                        <span className="font-bold text-xs text-on-surface truncate max-w-[100px]">{acc.accountName}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-xs text-primary">{(acc.balance || 0).toLocaleString('vi-VN')}đ</span>
                                        <button
                                            onClick={(e) => handleDeleteAccount(e, acc.id)}
                                            className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                            title="Xóa ví này"
                                        >
                                            <span className="material-symbols-outlined text-[14px] font-bold">close</span>
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center mt-6">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Chưa có ví nào</p>
                                    <button onClick={() => setShowAccountModal(true)} className="text-xs text-primary font-bold hover:underline">Tạo tài khoản đầu tiên</button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* BIỂU ĐỒ 12 THÁNG DỮ LIỆU THẬT */}
                    <section className="lg:col-span-7 bg-white p-8 rounded-[2rem] shadow-sm border border-outline-variant/10">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-primary font-headline">So sánh theo tháng (Năm {currentYear})</h3>
                            <div className="flex gap-4">
                                <LegendItem color="bg-primary" label="Thu nhập" />
                                <LegendItem color="bg-primary-fixed-dim" label="Chi tiêu" />
                            </div>
                        </div>

                        {/* Khu vực vẽ biểu đồ */}
                        <div className="flex items-end justify-between h-56 gap-1 md:gap-2 pt-4">
                            {monthlyStats.map(stat => {
                                const h1 = (stat.income / maxAmount) * 100;
                                const h2 = (stat.expense / maxAmount) * 100;

                                return (
                                    <BarChartColumn
                                        key={stat.label}
                                        label={stat.label}
                                        h1={h1}
                                        h2={h2}
                                        income={stat.income}      // Truyền dữ liệu thật vào Component
                                        expense={stat.expense}    // Truyền dữ liệu thật vào Component
                                    />
                                );
                            })}
                        </div>
                    </section>

                    {/* GIAO DỊCH GẦN ĐÂY */}
                    <section className="lg:col-span-5 bg-white p-8 rounded-[2rem] shadow-sm border border-outline-variant/10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-primary font-headline">Giao dịch gần đây</h3>
                            <button onClick={() => navigate('/activity')} className="text-primary font-bold text-xs hover:underline">Xem tất cả</button>
                        </div>
                        <div className="space-y-6">
                            {recentTransactions.length > 0 ? recentTransactions.map(t => {
                                const isExpense = t.type === 'EXPENSE';
                                const amountPrefix = isExpense ? '-' : '+';

                                return (
                                    <TransactionItem
                                        key={t.id}
                                        icon={t.categoryIcon || (isExpense ? 'payments' : 'account_balance_wallet')}
                                        title={t.categoryName || (isExpense ? 'Chi tiêu' : 'Thu nhập')}
                                        sub={`${t.accountName || 'Ví'} • ${new Date(t.transactionDate).toLocaleDateString('vi-VN')}`}
                                        amount={`${amountPrefix}${t.amount.toLocaleString('vi-VN')}`}
                                        isExpense={isExpense}
                                    />
                                );
                            }) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-slate-400 italic">Chưa có giao dịch nào.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            <ProfileOverlay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

            {/* MODAL TẠO TÀI KHOẢN NGÂN HÀNG / VÍ */}
            {showAccountModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in transition-all">
                    <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl slide-in-from-bottom-4 transition-all">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                            </div>
                            <h3 className="text-xl font-black text-primary">Thêm nguồn tiền</h3>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tên ví / Ngân hàng</label>
                                <input
                                    className="w-full bg-slate-50 p-4 rounded-xl font-bold border-none focus:ring-2 focus:ring-primary/10 mt-1"
                                    placeholder="Ví MoMo, Vietcombank..."
                                    value={newAccount.accountName}
                                    onChange={(e) => setNewAccount({...newAccount, accountName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Số dư ban đầu (VNĐ)</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-50 p-4 rounded-xl font-bold border-none focus:ring-2 focus:ring-primary/10 mt-1"
                                    placeholder="0"
                                    value={newAccount.balance}
                                    onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowAccountModal(false)} disabled={loading} className="flex-1 py-4 bg-slate-100 font-bold rounded-xl text-slate-500 hover:bg-slate-200 transition-all">Hủy</button>
                                <button onClick={handleCreateAccount} disabled={loading} className="flex-1 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                                    {loading ? 'Đang lưu...' : 'Thêm ngay'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Các Component con ---
const NavItem = ({ icon, label, to = "#", active = false }) => (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:translate-x-1 ${active ? 'bg-primary-container text-white font-bold' : 'text-on-surface-variant hover:bg-surface-container'}`}>
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
    </Link>
);

const BalanceStat = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">{label}</span>
        <span className="text-xl font-bold mt-1">{value}</span>
    </div>
);

// [ĐÃ NÂNG CẤP]: Component Cột Biểu Đồ có hiệu ứng Hover Tooltip
const BarChartColumn = ({ label, h1, h2, income, expense }) => (
    <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative cursor-pointer">

        {/* TOOLTIP: Sẽ nổi lên khi người dùng di chuột vào cột */}
        <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap shadow-xl scale-95 group-hover:scale-100">
            <p className="font-bold text-center border-b border-slate-600 pb-1 mb-1.5 uppercase tracking-wider">{label}</p>
            <p className="text-blue-300 font-semibold mb-1">Thu: +{income.toLocaleString('vi-VN')} đ</p>
            <p className="text-red-400 font-semibold">Chi: -{expense.toLocaleString('vi-VN')} đ</p>
            {/* Tam giác trỏ xuống cho tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></div>
        </div>

        {/* Các cột dữ liệu */}
        <div className="w-full flex justify-center gap-1 md:gap-1.5 h-full items-end relative">
            <div
                className="w-2 md:w-3 bg-primary rounded-t-full transition-all duration-700 ease-out group-hover:brightness-125"
                style={{ height: `${h1}%`, minHeight: h1 > 0 ? '4px' : '0' }}
            ></div>
            <div
                className="w-2 md:w-3 bg-primary-fixed-dim rounded-t-full transition-all duration-700 ease-out group-hover:brightness-90"
                style={{ height: `${h2}%`, minHeight: h2 > 0 ? '4px' : '0' }}
            ></div>
        </div>
        <span className="text-[9px] md:text-[10px] font-bold text-on-surface-variant group-hover:text-primary transition-colors">{label}</span>
    </div>
);

const TransactionItem = ({ icon, title, sub, amount, isExpense = false }) => (
    <div className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all">
        <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${isExpense ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'}`}>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>{icon}</span>
            </div>
            <div>
                <p className="font-bold text-on-surface text-sm leading-tight">{title}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5 uppercase font-medium">{sub}</p>
            </div>
        </div>
        <span className={`font-black text-sm ${isExpense ? 'text-error' : 'text-secondary'}`}>{amount} VND</span>
    </div>
);

const LegendItem = ({ color, label }) => (
    <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
        <span className="text-[10px] text-on-surface-variant font-bold uppercase">{label}</span>
    </div>
);

export default Dashboard;