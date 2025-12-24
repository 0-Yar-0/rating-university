import React, { useEffect, useState, createContext, useContext } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Api } from './api';
import InputPage from './pages/InputPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ClipLoader from 'react-spinners/ClipLoader';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// ✅ Простой PrivateRoute — без лишней логики
const PrivateRoute = ({ children }) => {
  const { user } = useAuth(); // ❗️ убрали `loading` — оно мешает при логине
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="app-root">
      <header className="top-bar">
        <div className="top-bar-left display-flex">
          <img src="ystu_logo.svg" className="logo-img" alt="ЯГТУ" />
          <span className="logo-text">Рейтинг <br /> ЯГТУ</span>
        </div>
        {user && (
          <div className="top-bar-right">
            <span className="user-name">{user.name || user.email}</span>
            <button className="icon-btn" onClick={handleLogout} title="Выйти">
              <img src="logout.svg" alt="Выйти" />
            </button>
          </div>
        )}
      </header>
      <main className="page-body">{children}</main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Инициализация — один раз при старте
    const init = async () => {
      try {
        const me = await Api.me();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = (userData) => setUser(userData);
  const logout = async () => {
    await Api.logout().catch(() => {});
    setUser(null);
  };

  // 🔥 Ключевое: пока loading — НЕ рендерим роуты, а показываем спиннер
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <ClipLoader color="#1a5fb4" size={50} />
        <p style={{ marginTop: '16px', color: '#666' }}>Загрузка...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <AppShell>
        <Routes>
          {/* Простые редиректы без PrivateRoute */}
          <Route path="/" element={<Navigate to="/input" replace />} />
          
          {/* Публичные */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Защищённые */}
          <Route
            path="/input"
            element={
              <PrivateRoute>
                <InputPage />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </AuthContext.Provider>
  );
}