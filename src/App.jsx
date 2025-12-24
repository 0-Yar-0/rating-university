import React, { useEffect, useState, createContext, useContext } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from 'react-router-dom';
import { Api } from './api';
import InputPage from './pages/InputPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ClipLoader from 'react-spinners/ClipLoader';

// ============== Контекст аутентификации ==============
const AuthContext = createContext(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ============== PrivateRoute — защищённый маршрут ==============
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Пока идёт первоначальная загрузка — показываем спиннер
  if (loading) {
    return (
      <div className="auth-loading" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '16px'
      }}>
        <ClipLoader size={40} color="#3498db" />
        <p>Проверка сессии...</p>
      </div>
    );
  }

  // Если пользователь не авторизован — перенаправляем на /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// ============== AppShell — обёртка с шапкой ==============
function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <div className="app-root">
      <header className="top-bar">
        <div className="top-bar-left display-flex">
          <img src="ystu_logo.svg" className="logo-img" alt="Логотип ЯГТУ" />
          <span className="logo-text">
            Рейтинг <br />
            ЯГТУ
          </span>
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

// ============== Основное приложение ==============
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true только при первом запуске

  // 🔁 Инициализация: проверка сессии через /me
  useEffect(() => {
    const initAuth = async () => {
      try {
        const me = await Api.me();
        setUser(me);
      } catch (err) {
        console.warn('No active session');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 📥 Вход
  const login = (userData) => {
    setUser(userData);
    // ❗️ Не ставим loading = true — это не начальная загрузка!
  };

  // 🚪 Выход
  const logout = async () => {
    try {
      await Api.logout();
    } catch (e) {
      console.warn('Logout API failed, still clearing session');
    } finally {
      setUser(null);
    }
  };

  const authValue = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={authValue}>
      {loading ? (
        // Показываем глобальный спиннер ТОЛЬКО при первом запуске
        <div
          className="loading-overlay"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f8f9fa',
            gap: '20px',
          }}
        >
          <ClipLoader size={60} color="#1a5fb4" loading />
          <div className="loading-text" style={{ fontSize: '18px', color: '#555' }}>
            Загрузка приложения...
          </div>
        </div>
      ) : (
        <AppShell>
          <Routes>
            {/* Главная → сразу на /input */}
            <Route path="/" element={<Navigate to="/input" replace />} />

            {/* Публичные маршруты */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Защищённые маршруты */}
            <Route
              path="/input"
              element={
                <PrivateRoute>
                  <InputPage />
                </PrivateRoute>
              }
            />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      )}
    </AuthContext.Provider>
  );
}