import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Budgets = () => {
    const navigate = useNavigate();

    // 1. QUẢN LÝ THÁNG
    const getCurrentMonthString = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    // --- THÊM: HÀM LẤY MỐC CHẶN THỜI GIAN TRONG QUÁ KHỨ ---
    const getCurrentMonthMin = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    const [currentMonth, setCurrentMonth] = useState(getCurrentMonthString());
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(false);

    // 2. FETCH DỮ LIỆU TỪ BACKEND KHI ĐỔI THÁNG
    useEffect(() => {
        const fetchBudgets = async () => {
            const token = localStorage.getItem("token");
            if (!token) return navigate("/login");

            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:8080/api/budgets?month=${currentMonth}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const formattedData = res.data.map(b => ({
                    id: b.id,
                    name: b.name,
                    limit: b.limitAmount,
                    spent: b.spentAmount || 0,
                    icon: b.icon,
                    month: b.monthString
                }));

                setBudgets(formattedData);
            } catch (err) {
                console.error("Lỗi lấy ngân sách:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBudgets();
    }, [currentMonth, navigate]);

    // 3. POPUP STATE
    const [showPopup, setShowPopup] = useState(false);
    const [targetMonth, setTargetMonth] = useState(getCurrentMonthString());
    const [inputAmount, setInputAmount] = useState('');

    // 4. LƯU NGÂN SÁCH (6 LỌ)
    const handleSaveBudget = async () => {
        const amount = parseFloat(inputAmount);
        if (!amount || amount <= 0) {
            alert("Vui lòng nhập số tiền thu nhập hợp lệ!");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            await axios.post("http://localhost:8080/api/budgets/auto-6-jars", {
                income: amount,
                month: targetMonth
            }, { headers: { Authorization: `Bearer ${token}` }});

            alert(`Đã phân bổ 6 lọ thành công cho tháng ${targetMonth}!`);

            setCurrentMonth(targetMonth); // Tự động chọn về tháng vừa tạo
            setShowPopup(false);
            setInputAmount('');

            // Tải lại dữ liệu
            const res = await axios.get(`http://localhost:8080/api/budgets?month=${targetMonth}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const formattedData = res.data.map(b => ({
                id: b.id, name: b.name, limit: b.limitAmount, spent: b.spentAmount || 0, icon: b.icon, month: b.monthString
            }));
            setBudgets(formattedData);

        } catch (err) {
            alert("Đã xảy ra lỗi khi tạo ngân sách! Kiểm tra lại Backend đã chạy chưa nhé.");
            console.error(err);
        }
    };

    // 5. TÍNH TOÁN CÁC CHỈ SỐ CHO GIAO DIỆN
    const totalLimit = budgets.reduce((sum, item) => sum + item.limit, 0);
    const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
    const remaining = totalLimit - totalSpent;
    const spentPercent = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

    // Tính xem có bao nhiêu danh mục vượt ngưỡng 80% để báo động
    const overLimitCount = budgets.filter(b => (b.limit > 0 ? (b.spent / b.limit) * 100 : 0) > 80).length;

    return (
        <div className="bg-surface text-on-surface flex min-h-screen relative">
            {/* Sidebar (Giữ nguyên của em) */}
            <aside className="h-full w-64 fixed left-0 top-0 bg-slate-50 border-r border-slate-200 flex flex-col p-4 z-40 hidden md:flex">
                <div className="mb-10 px-4">
                    <h1 className="font-headline font-extrabold text-blue-900 text-xl cursor-pointer" onClick={() => navigate('/dashboard')}>Financial Management</h1>
                    <p className="text-xs text-slate-500 font-medium tracking-wide">Premium Tier</p>
                </div>
                <nav className="flex-grow space-y-1">
                    <NavItem icon="dashboard" label="Dashboard" onClick={() => navigate('/dashboard')} />
                    <NavItem icon="receipt_long" label="Activity" onClick={() => navigate('/activity')} />
                    <NavItem icon="add_circle" label="Add New" onClick={() => navigate('/addnew')} />
                    <NavItem icon="pie_chart" label="Analytics" onClick={() => navigate('/analyst')} />
                    <NavItem icon="account_balance_wallet" label="Budgets" active />
                </nav>
                <div className="mt-auto pt-4 border-t border-slate-200 space-y-1">
                    <NavItem icon="settings" label="Settings" />
                    <NavItem icon="help_outline" label="Support" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 flex-1 p-8 lg:p-12">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-primary tracking-tight font-headline">Thiết lập Ngân sách</h2>

                        {/* BỘ LỌC THÁNG */}
                        <div className="flex items-center gap-3 mt-3 bg-white w-max px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                            <span className="material-symbols-outlined text-slate-400">calendar_month</span>
                            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Xem tháng:</span>
                            <input
                                type="month"
                                value={currentMonth}
                                onChange={(e) => setCurrentMonth(e.target.value)}
                                min={getCurrentMonthMin()} /* CHẶN KHÔNG CHO XEM THÁNG CŨ */
                                className="bg-transparent border-none font-extrabold text-primary cursor-pointer focus:ring-0 p-0 text-lg"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setTargetMonth(currentMonth);
                            setShowPopup(true);
                        }}
                        className="bg-primary text-on-primary px-6 py-3 rounded-md font-semibold flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined">add</span>
                        <span>Tạo ngân sách (6 Lọ)</span>
                    </button>
                </header>

                {/* Trạng thái Loading hoặc Trống */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="bg-white p-12 rounded-[2rem] text-center border border-dashed border-slate-300">
                        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-4xl">account_balance_wallet</span>
                        </div>
                        <h3 className="text-xl font-bold text-primary">Chưa có ngân sách nào</h3>
                        <p className="text-slate-500 mt-2">Tháng {currentMonth.split('-')[1]} hiện chưa được thiết lập hạn mức.</p>

                        <button
                            onClick={() => {
                                setTargetMonth(currentMonth);
                                setShowPopup(true);
                            }}
                            className="mt-6 text-primary font-bold hover:underline"
                        >
                            Phân bổ ngay
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                            {/* Blue Card */}
                            <div className="lg:col-span-2 bg-gradient-to-br from-primary to-primary-container p-8 rounded-xl text-on-primary relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-blue-200 font-medium mb-2">Tổng ngân sách tháng này</p>
                                    <h3 className="text-5xl font-extrabold font-headline mb-6">{totalLimit.toLocaleString('vi-VN')}đ</h3>
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-xs text-blue-200 uppercase tracking-wider font-bold">Đã chi</p>
                                            <p className="text-xl font-semibold">{totalSpent.toLocaleString('vi-VN')}đ</p>
                                        </div>
                                        <div className="h-10 w-px bg-white/20"></div>
                                        <div>
                                            <p className="text-xs text-blue-200 uppercase tracking-wider font-bold">Còn lại</p>
                                            <p className="text-xl font-semibold">{remaining.toLocaleString('vi-VN')}đ</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                            </div>

                            {/* Warning Card */}
                            <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className={`flex items-center gap-2 mb-4 ${spentPercent >= 80 ? 'text-error' : 'text-secondary'}`}>
                                        <span className="material-symbols-outlined">{spentPercent >= 80 ? 'warning' : 'check_circle'}</span>
                                        <span className="font-bold text-sm uppercase">{spentPercent >= 80 ? 'CẢNH BÁO CHI TIÊU' : 'NGÂN SÁCH AN TOÀN'}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Bạn đã sử dụng <span className="font-bold text-on-surface">{spentPercent}%</span> tổng ngân sách.
                                        {overLimitCount > 0 ? ` ${overLimitCount} danh mục đã vượt ngưỡng an toàn (80%).` : ' Các danh mục đều ở mức an toàn.'}
                                    </p>
                                </div>
                                <div className="mt-6 flex flex-col gap-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>Tiến độ tổng</span>
                                        <span className={spentPercent >= 80 ? 'text-error' : 'text-secondary'}>{spentPercent}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`${spentPercent >= 80 ? 'bg-error' : 'bg-secondary'} h-full transition-all duration-500`} style={{ width: `${Math.min(spentPercent, 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Categories List */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-xl font-bold font-headline text-primary">Danh mục chi tiêu</h4>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <StatusLabel color="bg-secondary" text="An toàn" />
                                    <StatusLabel color="bg-amber-500" text="Cảnh báo" />
                                    <StatusLabel color="bg-error" text="Vượt mức" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {budgets.map(item => (
                                    <BudgetItem key={item.id} data={item} />
                                ))}
                            </div>
                        </section>

                        <footer className="mt-16 bg-slate-100 rounded-xl p-8 flex items-center gap-8 border border-slate-200/50">
                            <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-white shadow-inner">
                                <img alt="Budget Tip" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1512358959174-b704cd9b52e1?auto=format&fit=crop&q=80&w=200" />
                            </div>
                            <div>
                                <h5 className="text-lg font-bold text-primary mb-2">Mẹo tiết kiệm tháng này</h5>
                                <p className="text-slate-600 text-sm max-w-2xl">
                                    Dựa trên thói quen chi tiêu của bạn, việc bám sát <span className="font-bold text-on-surface">Lọ Thiết Yếu (55%)</span> và không lấn sang các quỹ khác có thể giúp bạn tiết kiệm thêm một khoản đáng kể vào cuối tháng.
                                </p>
                            </div>
                        </footer>
                    </>
                )}
            </main>

            {/* POPUP NHẬP THU NHẬP 6 LỌ */}
            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl relative slide-in-from-bottom-4">
                        <button onClick={() => setShowPopup(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-extrabold text-primary font-headline">Phân Bổ Ngân Sách</h3>
                            <p className="text-sm text-slate-500 mt-2">Hệ thống sẽ chia ngân sách theo quy tắc 6 chiếc lọ.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Tháng áp dụng</label>
                                <input
                                    type="month"
                                    value={targetMonth}
                                    onChange={(e) => setTargetMonth(e.target.value)}
                                    min={getCurrentMonthMin()} /* CHẶN KHÔNG CHO TẠO NGÂN SÁCH THÁNG CŨ */
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Tổng thu nhập dự kiến (VND)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₫</span>
                                    <input
                                        type="number"
                                        value={inputAmount}
                                        onChange={(e) => setInputAmount(e.target.value)}
                                        placeholder="VD: 20000000"
                                        className="w-full p-4 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-xl font-black text-primary"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveBudget}
                                className="w-full py-4 mt-2 bg-primary text-white font-extrabold rounded-xl hover:brightness-110 active:scale-95 shadow-lg transition-all flex justify-center items-center gap-2"
                            >
                                <span className="material-symbols-outlined">auto_awesome</span>
                                Tạo Ngân Sách Tự Động
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-components ---
const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:translate-x-1 
        ${active ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
    >
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-sm antialiased">{label}</span>
    </button>
);

const StatusLabel = ({ color, text }) => (
    <span className="flex items-center gap-1">
        <span className={`w-3 h-3 rounded-full ${color}`}></span> {text}
    </span>
);

const BudgetItem = ({ data }) => {
    const percent = data.limit > 0 ? Math.round((data.spent / data.limit) * 100) : 0;

    let currentStatus = 'safe';
    if (percent >= 100) currentStatus = 'danger';
    else if (percent >= 80) currentStatus = 'warning';

    const statusConfig = {
        danger: { bg: 'bg-error-container', text: 'text-error', bar: 'bg-error', iconBg: 'bg-error-container' },
        warning: { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500', iconBg: 'bg-amber-100' },
        safe: { bg: 'bg-primary-fixed', text: 'text-primary', bar: 'bg-secondary', iconBg: 'bg-primary-fixed' }
    };

    const config = statusConfig[currentStatus];

    return (
        <div className="bg-white p-6 rounded-xl transition-all hover:bg-slate-50 border border-slate-100 group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 min-w-[240px]">
                    <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center ${config.text}`}>
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>{data.icon}</span>
                    </div>
                    <div>
                        <p className="font-bold text-on-surface">{data.name}</p>
                        <p className="text-xs text-slate-500 font-medium">Cập nhật tự động</p>
                    </div>
                </div>
                <div className="flex-grow max-w-xl">
                    <div className="flex justify-between mb-2 text-sm">
                        <span className="text-slate-600">
                            <span className="font-bold text-on-surface">{data.spent.toLocaleString('vi-VN')}đ</span> / {data.limit.toLocaleString('vi-VN')}đ
                        </span>
                        <span className={`font-bold ${config.text}`}>{percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`${config.bar} h-full transition-all duration-500`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-md hover:bg-slate-100 text-slate-400"><span className="material-symbols-outlined">edit</span></button>
                    <button className="p-2 rounded-md hover:bg-slate-100 text-slate-400"><span className="material-symbols-outlined">more_vert</span></button>
                </div>
            </div>
        </div>
    );
};

export default Budgets;