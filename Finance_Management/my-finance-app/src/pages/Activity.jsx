import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const Activity = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // STATE TÌM KIẾM
    const [searchTerm, setSearchTerm] = useState("");

    // STATE PHÂN TRANG
    const [currentPage, setCurrentPage] = useState(1);
    const [transactionsPerPage] = useState(10); // Hiển thị 10 giao dịch trên 1 trang

    // Reset về trang 1 mỗi khi gõ tìm kiếm mới
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // GỌI API LẤY LỊCH SỬ GIAO DỊCH
    useEffect(() => {
        const fetchTransactions = async () => {
            const token = localStorage.getItem("token");
            if (!token) return navigate("/login");

            try {
                const res = await axios.get("http://localhost:8080/api/transactions", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data && Array.isArray(res.data)) {
                    const sortedData = res.data.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
                    setTransactions(sortedData);
                } else {
                    setTransactions([]);
                }
            } catch (error) {
                console.error("Lỗi tải giao dịch:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [navigate]);

    // Format tiền Việt Nam
    const formatMoney = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(amount)
            .replace('₫', 'VND');
    };

    const formatTime = (dateString) => {
        const d = new Date(dateString);
        const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        return timeStr === '00:00' ? '--:--' : timeStr;
    };

    // 1. LỌC TÌM KIẾM TRƯỚC
    const filteredTransactions = transactions.filter(t => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const noteMatch = (t.note || '').toLowerCase().includes(searchLower);
        const categoryMatch = (t.categoryName || '').toLowerCase().includes(searchLower);
        const amountMatch = (t.amount || '').toString().includes(searchLower);
        return noteMatch || categoryMatch || amountMatch;
    });

    // 2. TÍNH TOÁN PHÂN TRANG TỪ DANH SÁCH ĐÃ LỌC
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
    const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

    // Chuyển trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // 3. NHÓM DỮ LIỆU CỦA TRANG HIỆN TẠI (Thay vì nhóm tất cả)
    const groupedTransactions = currentTransactions.reduce((groups, t) => {
        const d = new Date(t.transactionDate);
        const dateKey = d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(t);
        return groups;
    }, {});

    return (
        <div className="bg-surface text-on-surface antialiased flex min-h-screen">
            {/* Sidebar Navigation */}
            <aside className="h-full w-64 fixed left-0 top-0 bg-slate-50 border-r border-slate-200 flex flex-col p-4 z-40 hidden md:flex">
                <div className="mb-8 px-4">
                    <h1 className="font-headline font-extrabold text-blue-900 text-xl">Financial Management</h1>
                    <p className="text-xs text-on-surface-variant font-medium">Premium Tier</p>
                </div>
                <nav>
                    <SideNavItem icon="dashboard" label="Dashboard" to="/dashboard" />
                    <SideNavItem icon="receipt_long" label="Activity" to="/activity" active />
                    <SideNavItem icon="add_circle" label="Add New" to="/addnew" />
                    <SideNavItem icon="pie_chart" label="Analytics" to="/analyst" />
                    <SideNavItem icon="account_balance_wallet" label="Budgets" to="/budget" />
                </nav>
                <div className="mt-auto pt-4 border-t border-slate-200 space-y-1">
                    <SideNavItem icon="settings" label="Settings" />
                    <SideNavItem icon="help_outline" label="Support" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen bg-surface">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-[0_12px_40px_rgba(0,53,127,0.06)] px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-headline font-bold text-primary tracking-tight">Transactions</h2>
                        <p className="text-sm text-on-surface-variant">Review your detailed financial history</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/addnew')} className="bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-sm">add</span>
                            Quick Add
                        </button>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed bg-primary-fixed text-primary flex items-center justify-center font-bold">
                                U
                            </div>
                        </div>
                    </div>
                </header>

                {/* Filters Section */}
                <section className="p-6">
                    <div className="bg-surface-container-lowest rounded-[2rem] p-6 space-y-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            <div className="md:col-span-5 relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                                <input
                                    className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-on-surface-variant/60"
                                    placeholder="Tìm theo ghi chú, danh mục hoặc số tiền..."
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-7 flex flex-wrap gap-3 justify-end">
                                <div className="inline-flex bg-surface-container-low p-1 rounded-xl">
                                    <button className="px-4 py-2 text-xs font-semibold bg-white text-primary rounded-lg shadow-sm">This Month</button>
                                    <button className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors">Last Month</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Transactions Table & Pagination */}
                <section className="px-6 pb-20">
                    <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                <tr className="bg-surface-container-low border-b border-surface-container">
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Transaction</th>
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Type / Jar</th>
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Action</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-container/50">
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-slate-400 font-medium">Đang tải dữ liệu...</td></tr>
                                ) : Object.keys(groupedTransactions).length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-slate-400 font-medium">
                                        {searchTerm ? 'Không tìm thấy giao dịch nào phù hợp!' : 'Chưa có giao dịch nào!'}
                                    </td></tr>
                                ) : (
                                    Object.keys(groupedTransactions).map(dateKey => (
                                        <React.Fragment key={dateKey}>
                                            <DateHeader label={dateKey} />
                                            {groupedTransactions[dateKey].map(t => {
                                                const isExpense = t.type === 'EXPENSE';
                                                const amountPrefix = isExpense ? '-' : '+';
                                                const displayIcon = t.categoryIcon || (isExpense ? 'payments' : 'account_balance_wallet');
                                                const displayTitle = t.categoryName || (isExpense ? 'Chi tiêu' : 'Thu nhập');
                                                const displayCategory = isExpense ? 'CHI TIÊU' : 'THU NHẬP';

                                                return (
                                                    <TransactionRow
                                                        key={t.id}
                                                        time={formatTime(t.transactionDate)}
                                                        icon={displayIcon}
                                                        title={displayTitle}
                                                        desc={t.note || (isExpense ? 'Không có ghi chú' : 'Tiền vào ví')}
                                                        category={displayCategory}
                                                        amount={`${amountPrefix}${formatMoney(t.amount)}`}
                                                        isExpense={isExpense}
                                                    />
                                                );
                                            })}
                                        </React.Fragment>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* THANH ĐIỀU HƯỚNG PHÂN TRANG (Pagination Controls) */}
                        {totalPages > 0 && (
                            <div className="flex items-center justify-between px-6 py-5 border-t border-surface-container bg-white">
                                <span className="text-sm font-medium text-slate-500">
                                    Hiển thị <span className="font-bold text-slate-800">{indexOfFirstTransaction + 1}</span> đến <span className="font-bold text-slate-800">{Math.min(indexOfLastTransaction, filteredTransactions.length)}</span> trong số <span className="font-bold text-slate-800">{filteredTransactions.length}</span> giao dịch
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => paginate(i + 1)}
                                                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

/* --- Các Component con --- */
const SideNavItem = ({ icon, label, to = "#", active = false }) => (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:translate-x-1 ${active ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>
        <span className="material-symbols-outlined">{icon}</span>
        <span className="font-body text-sm">{label}</span>
    </Link>
);

const DateHeader = ({ label }) => (
    <tr className="bg-surface-container-low/30">
        <td className="px-6 py-2 text-[10px] font-extrabold text-primary/60 uppercase tracking-tighter" colSpan="5">{label}</td>
    </tr>
);

const TransactionRow = ({ time, icon, title, desc, category, amount, isExpense = false }) => (
    <tr className="hover:bg-slate-50 transition-colors group">
        <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{time}</td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isExpense ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'}`}>
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>{icon}</span>
                </div>
                <div>
                    <p className="text-sm font-semibold text-on-surface">{title}</p>
                    <p className="text-[11px] text-on-surface-variant/70">{desc}</p>
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <span className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase ${isExpense ? 'bg-surface-container-high text-on-surface-variant' : 'bg-secondary text-white'}`}>
                {category}
            </span>
        </td>
        <td className="px-6 py-4 text-right">
            <span className={`text-sm font-bold ${isExpense ? 'text-error' : 'text-secondary'}`}>{amount}</span>
        </td>
        <td className="px-6 py-4 text-right">
            <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-surface-container rounded-full transition-all">
                <span className="material-symbols-outlined text-sm">more_vert</span>
            </button>
        </td>
    </tr>
);

export default Activity;