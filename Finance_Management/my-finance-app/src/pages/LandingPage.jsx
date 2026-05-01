import React from 'react';
import { Link } from "react-router-dom";

const LandingPage = () => {
    // Hàm xử lý cuộn mượt xuống khu vực Demo
    const scrollToDemo = () => {
        const demoSection = document.getElementById('demo-section');
        if (demoSection) {
            demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="bg-surface text-on-surface antialiased min-h-screen relative isolate overflow-x-hidden">
            {/* CSS Inline cho Gradient và Animation Băng chuyền */}
            <style>{`
                .text-gradient {
                    background: linear-gradient(to right, #00357f, #004aad);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .headline { font-family: 'Manrope', sans-serif; }
                
                /* Hiệu ứng trôi ngang vô tận cho Demo Section */
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-infinite-scroll {
                    animation: scroll 25s linear infinite;
                    width: max-content;
                }
                .animate-infinite-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>

            {/* HIỆU ỨNG ĐỔ BÓNG TRÊN CÙNG */}
            <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                     style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex justify-between items-center px-6 lg:px-20 py-6 sticky top-0 bg-white/70 backdrop-blur-lg z-50 border-b border-outline-variant/10 shadow-sm">
                <div className="flex items-center gap-2">
                    <h1 className="font-['Manrope'] font-extrabold text-primary text-2xl tracking-tight ">Financial Management</h1>
                </div>

                <div className="flex gap-4">
                    <Link to="/login" className="text-primary font-bold text-sm px-4 py-2 hover:bg-primary/5 rounded-full transition-colors">
                        Đăng nhập
                    </Link>
                    <Link to="/register" className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                        Bắt đầu ngay
                    </Link>
                </div>
            </nav>

            {/* Header */}
            <header className="px-6 lg:px-20 pt-20 pb-24 text-center max-w-6xl mx-auto relative z-10">
                <span className="bg-blue-100 text-blue-700 border border-blue-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                    Giải pháp tài chính thông minh
                </span>

                <h1 className="text-4xl lg:text-6xl font-extrabold headline mt-8 leading-[1.2] tracking-tighter">
                    <span className="text-gradient">Bạn đang gặp khó khăn</span><br/>về quản lý tài chính?
                </h1>

                {/* KHUNG GIỚI THIỆU VIỀN GRADIENT */}
                <div className="mt-12 relative p-1 rounded-3xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 max-w-4xl mx-auto shadow-2xl hover:scale-[1.01] transition-transform duration-500">
                    <div className="bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-[22px] text-slate-600 text-base md:text-lg leading-relaxed text-justify md:text-center shadow-inner">
                        <p>
                            <strong className="text-primary font-extrabold">T. Harv Eker</strong> là một doanh nhân, diễn giả truyền cảm hứng người Canada và là tác giả của cuốn sách bán chạy toàn cầu "Bí mật tư duy triệu phú". Từ trải nghiệm thăng trầm tay trắng vươn lên làm giàu, ông nhận ra rằng sự khác biệt giữa người giàu và người nghèo không nằm ở số tiền họ kiếm được, mà nằm ở <b>tư duy và cách thức quản lý dòng tiền</b>.
                        </p>
                        <p className="mt-4">
                            Dựa trên triết lý đó, phương pháp quản lý <strong className="text-primary">"6 chiếc lọ" (JARS System)</strong> ra đời. Trang web này được xây dựng nhằm số hóa phương pháp kinh điển đó, kết hợp cùng Trí tuệ nhân tạo (AI) giúp bạn tự động hóa việc định hình lại thói quen quản lý tài sản một cách bền vững!
                        </p>
                    </div>
                </div>

                <div className="mt-14 flex flex-col md:flex-row justify-center gap-4">
                    <button onClick={() => window.location.href='/register'} className="bg-primary text-on-primary px-10 py-4 rounded-full font-extrabold text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                        Dùng thử miễn phí
                    </button>
                    {/* NÚT BẤM KÍCH HOẠT SCROLL DEMO */}
                    <button onClick={scrollToDemo} className="bg-white border border-slate-200 px-10 py-4 rounded-full font-bold text-lg text-primary flex items-center justify-center gap-2 hover:bg-slate-50 hover:shadow-md transition-all">
                        <span className="material-symbols-outlined">play_circle</span> Xem demo
                    </button>
                </div>
            </header>

            {/* HIỆU ỨNG ĐỔ BÓNG GIỮA TRANG */}
            <div aria-hidden="true" className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(50%-30rem)] pointer-events-none">
                <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                     style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}>
                </div>
            </div>

            {/* ========================================== */}
            {/* DEMO SECTION TỰ ĐỘNG CHUYỂN ĐỘNG (MARQUEE) */}
            {/* ========================================== */}
            <section id="demo-section" className="py-20 bg-slate-900 overflow-hidden relative z-10 border-y border-slate-800">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold headline text-center text-white">
                        Khám phá hệ sinh thái <span className="text-blue-400">Financial Management</span>
                    </h2>
                    <p className="text-slate-400 text-center mt-4 max-w-2xl mx-auto">Giao diện trực quan, tính năng mạnh mẽ được thiết kế tỉ mỉ đến từng Pixel.</p>
                </div>

                {/* Khung cuộn vô tận */}
                {/* Khung cuộn vô tận */}
                <div className="flex animate-infinite-scroll gap-6 px-6">
                    {/* Nhóm 1: 4 Màn hình */}
                    <DemoCard title="Dashboard" desc="Tổng quan tài chính" icon="dashboard" color="text-blue-500 bg-blue-100" imagePath="/public/demo-dashboard.png" />
                    <DemoCard title="Activity" desc="Lịch sử giao dịch" icon="receipt_long" color="text-green-500 bg-green-100" imagePath="/public/demo-activity.png" />
                    <DemoCard title="Budgets" desc="Ngân sách 6 chiếc lọ" icon="account_balance_wallet" color="text-purple-500 bg-purple-100" imagePath="/public/demo-budget.png" />
                    <DemoCard title="Analytics" desc="Báo cáo & Trợ lý AI" icon="pie_chart" color="text-orange-500 bg-orange-100" imagePath="/public/demo-analytics.png" />
                    <DemoCard title="Analytics" desc="Giao dịch " icon="pie_chart" color="text-orange-500 bg-orange-100" imagePath="/public/demo-transaction.png" />
                    {/* Nhóm 2: Bản sao để tạo vòng lặp */}
                    <DemoCard title="Dashboard" desc="Tổng quan tài chính" icon="dashboard" color="text-blue-500 bg-blue-100" imagePath="/public/demo-dashboard.png" />
                    <DemoCard title="Activity" desc="Lịch sử giao dịch" icon="receipt_long" color="text-green-500 bg-green-100" imagePath="/public/demo-activity.png" />
                    <DemoCard title="Budgets" desc="Ngân sách 6 chiếc lọ" icon="account_balance_wallet" color="text-purple-500 bg-purple-100" imagePath="/public/demo-budget.png" />
                    <DemoCard title="Analytics" desc="Báo cáo & Trợ lý AI" icon="pie_chart" color="text-orange-500 bg-orange-100" imagePath="/public/demo-analytics.png" />
                    <DemoCard title="Analytics" desc="Giao dịch" icon="pie_chart" color="text-orange-500 bg-orange-100" imagePath="/public/demo-transaction.png" />

                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="px-6 lg:px-20 py-24 bg-surface/80 backdrop-blur-xl relative z-10">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold headline text-center mb-16 text-slate-800">Tại sao chọn chúng tôi?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 text-center hover:-translate-y-2 transition-transform duration-300">
                            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-6 shadow-sm border border-blue-100">
                                <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 headline text-slate-800">Tự động chia lọ</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Giao dịch của bạn được tự động phân loại vào 6 chiếc lọ (Thiết yếu, Giáo dục, Hưởng thụ...) cực kỳ khoa học.</p>
                        </div>

                        <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 text-center md:mt-12 hover:-translate-y-2 transition-transform duration-300">
                            <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-6 shadow-sm border border-green-100">
                                <span className="material-symbols-outlined text-3xl">security</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 headline text-slate-800">Bảo mật cấp ngân hàng</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Mật khẩu được mã hóa BCrypt đa lớp và dữ liệu tài chính của bạn được bảo vệ mã hóa tuyệt đối trên Cloud.</p>
                        </div>

                        <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 text-center hover:-translate-y-2 transition-transform duration-300">
                            <div className="mx-auto w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-6 shadow-sm border border-orange-100">
                                <span className="material-symbols-outlined text-3xl">monitoring</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 headline text-slate-800">Phân tích bằng AI</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Hệ thống Trí tuệ nhân tạo sẽ cảnh báo ngay lập tức nếu bạn có dấu hiệu tiêu xài vượt quá hạn mức ngân sách.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-6 lg:px-20 py-20 relative z-10">
                <div className="bg-gradient-to-br from-primary to-blue-900 rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                        <span className="material-symbols-outlined text-9xl">account_balance_wallet</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-extrabold headline relative z-10">Sẵn sàng kiến tạo lại tương lai tài chính?</h2>
                    <p className="text-blue-200 mt-6 text-lg relative z-10 max-w-xl mx-auto">Bắt đầu áp dụng phương pháp của các triệu phú thế giới ngay hôm nay.</p>
                    <button onClick={() => window.location.href='/register'} className="mt-10 bg-white text-primary px-12 py-5 rounded-full font-extrabold text-lg hover:scale-105 active:scale-95 transition-all relative z-10 shadow-xl">
                        Bắt đầu hành trình - Miễn phí
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 lg:px-20 py-12 border-t border-slate-200 bg-white flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">architecture</span>
                    <p className="text-slate-500 text-sm font-bold">© 2026 The Architect. Đề án tốt nghiệp NEU.</p>
                </div>
                <div className="flex gap-6 text-slate-500 font-bold text-sm">
                    <a href="#" className="hover:text-primary transition-colors">Quyền riêng tư</a>
                    <a href="#" className="hover:text-primary transition-colors">Điều khoản</a>
                    <a href="#" className="hover:text-primary transition-colors">Liên hệ</a>
                </div>
            </footer>
        </div>
    );
};

// COMPONENT CON: THẺ DEMO ĐÃ ĐƯỢC NÂNG CẤP ĐỂ HIỂN THỊ ẢNH THẬT
const DemoCard = ({ title, desc, icon, color, imagePath }) => (
    // Tăng nhẹ chiều rộng (w-[400px]) để hiển thị ảnh màn hình rõ ràng hơn
    <div className="w-80 md:w-[400px] flex-shrink-0 bg-white p-6 rounded-[2rem] border border-slate-700 shadow-2xl hover:border-blue-400 transition-colors cursor-pointer relative overflow-hidden group">
        <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${color}`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <div>
                <h3 className="text-xl font-bold headline text-slate-800">{title}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{desc}</p>
            </div>
        </div>

        {/* KHU VỰC HIỂN THỊ ẢNH THẬT CỦA ỨNG DỤNG */}
        <div className="h-48 md:h-56 bg-slate-100 rounded-xl border border-slate-200 relative overflow-hidden shadow-inner">
            {/* Thẻ img gọi thẳng đến thư mục public/images/ */}
            <img
                src={imagePath}
                alt={`Màn hình ${title}`}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Overlay làm tối ảnh và hiện chữ lúc Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                <span className="text-white font-bold text-sm bg-primary/90 backdrop-blur-sm px-6 py-2.5 rounded-full shadow-2xl border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    Khám phá tính năng
                </span>
            </div>
        </div>
    </div>
);
export default LandingPage;