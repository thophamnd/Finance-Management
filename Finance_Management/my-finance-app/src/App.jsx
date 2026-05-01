import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import Dashboard from "./pages/Dashboard";
import Activity from "./pages/Activity";
import AddNew from "./pages/AddTransaction.jsx";
import Analytics from "./pages/Analytics.jsx";
import Budgets  from "./pages/Budgets.jsx";
import ProtectedRoute from './pages/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* =========================================
                    KHU VỰC CÔNG KHAI (Không cần bảo mật)
                ========================================= */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/login" element={<LoginForm />} />

                {/* =========================================
                    KHU VỰC BẢO MẬT (Đã bọc ProtectedRoute)
                ========================================= */}
                <Route
                    path="/dashboard"
                    element={<ProtectedRoute><Dashboard/></ProtectedRoute>}
                />

                <Route
                    path="/activity"
                    element={<ProtectedRoute><Activity /></ProtectedRoute>}
                />

                <Route
                    path="/addnew"
                    element={<ProtectedRoute><AddNew /></ProtectedRoute>}
                />

                <Route
                    path="/analyst"
                    element={<ProtectedRoute><Analytics/></ProtectedRoute>}
                />

                <Route
                    path="/budget"
                    element={<ProtectedRoute><Budgets/></ProtectedRoute>}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;