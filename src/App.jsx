// App.jsx
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

// ============== AuthProvider — изолирован от App ==============
const AuthContext = createContext(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============== PrivateRoute ==============
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// ============== AppShell ==============
function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
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

// ============== Main App ==============
export default function App() {
  const auth = useAuth();
  console.log('Auth context:', auth); // ← должно быть { user, login, logout, loading }
  
  if (!auth) {
    throw new Error('App is not wrapped in AuthProvider!');
  }

  const { loading } = auth;

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <ClipLoader color="#1a5fb4" size={50} />
      </div>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/input" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
  );
}
