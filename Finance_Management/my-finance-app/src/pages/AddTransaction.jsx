import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddTransaction = () => {
    const navigate = useNavigate();

    // HÀM LẤY GIỜ HIỆN TẠI (Theo chuẩn ISO 8601 YYYY-MM-DDTHH:mm để nhét vào thẻ input)
    const getVNDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    // --- State Giao dịch ---
    const [amount, setAmount] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedAccountId, setSelectedAccountId] = useState(null);

    // ĐÃ SỬA: Lấy sẵn cả ngày lẫn giờ lúc người dùng mới mở trang
    const [date, setDate] = useState(getVNDateTime());

    const [note, setNote] = useState('');
    const [transactionType, setTransactionType] = useState('EXPENSE');

    // --- State Người dùng & Dropdown ---
    const [profileData, setProfileData] = useState({ fullName: '', email: '' });
    const [showDropdown, setShowDropdown] = useState(false);

    // --- State Dữ liệu hệ thống ---
    const [categories, setCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [newCat, setNewCat] = useState({ name: '', jarType: 'NECESSITIES', icon: 'home' });

    const jarOptions = [
        { label: 'Thiết yếu (55%)', val: 'NECESSITIES', icon: 'home' },
        { label: 'Giáo dục (10%)', val: 'EDUCATION', icon: 'school' },
        { label: 'Hưởng thụ (10%)', val: 'PLAY', icon: 'movie' },
        { label: 'Đầu tư (10%)', val: 'FINANCIAL_FREE', icon: 'trending_up' },
        { label: 'Tiết kiệm (10%)', val: 'LONG_TERM_SAVE', icon: 'savings' },
        { label: 'Cho đi (5%)', val: 'GIVE', icon: 'volunteer_activism' },
    ];

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [resCat, resAcc, profileRes] = await Promise.all([
                axios.get("http://localhost:8080/api/categories", { headers }),
                axios.get("http://localhost:8080/api/accounts", { headers }),
                axios.get("http://localhost:8080/api/auth/profile", { headers }).catch(() => ({ data: {} }))
            ]);

            if (resCat.data && Array.isArray(resCat.data)) setCategories(resCat.data);

            if (resAcc.data && Array.isArray(resAcc.data)) {
                setAccounts(resAcc.data);
                if (resAcc.data.length > 0 && !selectedAccountId) {
                    setSelectedAccountId(resAcc.data[0].id);
                }
            }

            if (profileRes.data) {
                setProfileData({
                    fullName: profileRes.data.fullName || profileRes.data.username || 'Người dùng',
                    email: profileRes.data.email || 'Chưa cập nhật email'
                });
            }

        } catch (err) {
            console.error("Lỗi lấy dữ liệu:", err);
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleJarChange = (val) => {
        const selectedOption = jarOptions.find(opt => opt.val === val);
        setNewCat({ ...newCat, jarType: val, icon: selectedOption.icon });
    };

    const handleCreateCategory = async () => {
        if (!newCat.name) return alert("Vui lòng nhập tên danh mục!");
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:8080/api/categories", newCat, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            setNewCat({ name: '', jarType: 'NECESSITIES', icon: 'home' });
            await fetchData();
        } catch (err) {
            console.error(err);
            alert("Lỗi: Không thể tạo danh mục.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8080/api/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (selectedCategoryId === id) setSelectedCategoryId(null);
            await fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Không thể xóa danh mục này!");
        }
    };

    const handleSaveTransaction = async () => {
        if (!amount || amount <= 0) return alert("Vui lòng nhập số tiền hợp lệ!");
        if (!selectedAccountId) return alert("Vui lòng chọn nguồn tiền!");

        if (transactionType === 'EXPENSE' && !selectedCategoryId) {
            return alert("Vui lòng chọn danh mục (Icon)!");
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:8080/api/transactions", {
                amount: parseFloat(amount),
                categoryId: transactionType === 'EXPENSE' ? selectedCategoryId : null,
                accountId: selectedAccountId,
                transactionDate: date, // Chuỗi lúc này đã dài 16 ký tự, Backend sẽ tự cắt
                note: note,
                type: transactionType
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert("Lưu giao dịch thành công!");
            navigate("/activity");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Lỗi khi lưu giao dịch!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-10 font-body antialiased">
            <nav className="bg-white p-4 shadow-sm mb-8 border-b border-slate-100 relative z-40">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-primary transition-all active:scale-95"
                            title="Quay lại Dashboard"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <span onClick={() => navigate('/dashboard')} className="text-xl font-black text-primary cursor-pointer tracking-tight">
                            Financial Management
                        </span>
                    </div>

                    <div className="relative">
                        <div
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-all select-none"
                            title="Tùy chọn tài khoản"
                        >
                            {(profileData.fullName || 'U').charAt(0).toUpperCase()}
                        </div>

                        {showDropdown && (
                            <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2">
                                <div className="px-3 py-3 border-b border-slate-100 mb-2">
                                    <p className="text-sm font-bold text-slate-800 truncate">{profileData.fullName}</p>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">{profileData.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-3 active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-sm">logout</span>
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4">
                <div className="flex bg-white p-1 rounded-2xl w-full max-w-sm mx-auto mb-8 shadow-sm border border-slate-100 relative">
                    <button
                        onClick={() => setTransactionType('EXPENSE')}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all z-10 ${transactionType === 'EXPENSE' ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Khoản chi
                    </button>
                    <button
                        onClick={() => setTransactionType('INCOME')}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all z-10 ${transactionType === 'INCOME' ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Khoản thu
                    </button>
                    <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-out ${transactionType === 'EXPENSE' ? 'left-1 bg-error' : 'left-[calc(50%+2px)] bg-secondary'}`}></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-6">

                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm text-center border border-slate-100">
                            <input
                                className={`w-full text-6xl font-black text-center outline-none placeholder:text-slate-100 transition-colors ${transactionType === 'EXPENSE' ? 'text-error' : 'text-secondary'}`}
                                type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)}
                                autoFocus
                            />
                            <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-[0.2em]">Số tiền {transactionType === 'EXPENSE' ? 'chi tiêu' : 'thu nhập'} (VNĐ)</p>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest px-2">{transactionType === 'EXPENSE' ? 'Nguồn tiền (Trừ từ)' : 'Chuyển vào ví'}</h3>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {accounts.length > 0 ? accounts.map(acc => (
                                    <button
                                        key={acc.id} onClick={() => setSelectedAccountId(acc.id)}
                                        className={`px-5 py-3 rounded-2xl border-2 whitespace-nowrap font-bold text-sm transition-all 
                                        ${selectedAccountId === acc.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 text-slate-400 hover:border-slate-200'}`}
                                    >
                                        <span className="material-symbols-outlined text-sm mr-1">payments</span>
                                        {acc.accountName}
                                    </button>
                                )) : (
                                    <p className="text-xs text-slate-400 italic">Chưa có tài khoản. Vui lòng thêm ở Dashboard.</p>
                                )}
                            </div>
                        </div>

                        {transactionType === 'EXPENSE' && (
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-6 tracking-widest px-2">Danh mục</h3>
                                <div className="grid grid-cols-4 gap-y-8 min-h-[150px]">
                                    {fetching ? (
                                        <div className="col-span-4 text-center py-4 text-slate-300 text-xs italic">Đang tải danh mục...</div>
                                    ) : categories.length > 0 ? (
                                        categories.map(cat => (
                                            <div key={cat.id} onClick={() => setSelectedCategoryId(cat.id)} className="flex flex-col items-center gap-2 cursor-pointer group relative">
                                                <button
                                                    onClick={(e) => handleDeleteCategory(e, cat.id)}
                                                    className="absolute -top-2 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10 shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-[12px] font-bold">close</span>
                                                </button>

                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 
                                                    ${selectedCategoryId === cat.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                                    <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>
                                                        {cat.icon || 'category'}
                                                    </span>
                                                </div>
                                                <span className={`text-[10px] font-bold text-center tracking-tight truncate w-full px-1 ${selectedCategoryId === cat.id ? 'text-primary' : 'text-slate-500'}`}>
                                                    {cat.name}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-4 text-center py-4 text-slate-400 text-xs italic">Chưa có danh mục nào. Hãy bấm "Thêm mới".</div>
                                    )}

                                    <div onClick={() => setShowModal(true)} className="flex flex-col items-center gap-2 cursor-pointer group">
                                        <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-primary group-hover:text-primary transition-all">
                                            <span className="material-symbols-outlined text-2xl">add</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 tracking-tight">Thêm mới</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Thời gian giao dịch</label>
                                {/* ĐÃ SỬA: Thay type="date" thành type="datetime-local" */}
                                <input
                                    type="datetime-local"
                                    className="w-full bg-slate-50 p-4 rounded-xl font-bold border-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ghi chú</label>
                                <textarea className="w-full bg-slate-50 p-4 rounded-xl resize-none border-none font-medium text-sm focus:ring-2 focus:ring-primary/10 transition-all" placeholder={transactionType === 'EXPENSE' ? 'Bạn đã chi cho việc gì?...' : 'Nguồn thu nhập từ đâu?...'} rows="4" value={note} onChange={(e) => setNote(e.target.value)} />
                            </div>
                        </div>
                        <button onClick={handleSaveTransaction} disabled={loading || fetching} className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all ${loading || fetching ? 'bg-slate-300' : 'bg-primary text-white hover:scale-[1.01] active:scale-95 shadow-primary/20'}`}>
                            {loading ? 'Đang xử lý...' : 'Lưu giao dịch'}
                        </button>
                    </div>
                </div>
            </main>

            {/* MODAL TẠO DANH MỤC */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in transition-all">
                    <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl slide-in-from-bottom-4 transition-all">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>{newCat.icon}</span>
                            </div>
                            <h3 className="text-xl font-black text-primary">Danh mục mới</h3>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tên danh mục</label>
                                <input className="w-full bg-slate-50 p-4 rounded-xl font-bold border-none focus:ring-2 focus:ring-primary/10 mt-1" placeholder="Ăn sáng, Lương..." value={newCat.name} onChange={(e) => setNewCat({...newCat, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Chiếc lọ áp dụng</label>
                                <select className="w-full bg-slate-50 p-4 rounded-xl font-bold border-none focus:ring-2 focus:ring-primary/10 mt-1 cursor-pointer" value={newCat.jarType} onChange={(e) => handleJarChange(e.target.value)}>
                                    {jarOptions.map(jar => <option key={jar.val} value={jar.val}>{jar.label}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowModal(false)} disabled={loading} className="flex-1 py-4 bg-slate-100 font-bold rounded-xl text-slate-500 hover:bg-slate-200">Hủy</button>
                                <button onClick={handleCreateCategory} disabled={loading} className="flex-1 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">
                                    {loading ? 'Đang tạo...' : 'Tạo ngay'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddTransaction;