// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/input';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    // ✅ Единственный правильный способ — редирект при изменении user
    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            const resp = await Api.login({ email, password });
            // Поддержка разных форм ответов: { user } или прямо объект пользователя
            login(resp?.user || resp); // ← setState → user изменится → useEffect сработает
            // ❌ НЕ ПИШИТЕ navigate() здесь!
        } catch (err) {
            setError(err.message || 'Неверный логин или пароль');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Вход</h1>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="Логин (email)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                    {error && <div className="auth-error">{error}</div>}
                    <button
                        className="primary-btn spinner-btn"
                        type="submit"
                        disabled={busy}
                    >
                        {busy ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span>Вход...</span>
                            </>
                        ) : (
                            'Войти'
                        )}
                    </button>
                </form>
                <div className="auth-sub">
                    Нет аккаунта? <Link to="/register">Регистрация</Link>
                </div>
            </div>
        </div>
    );
}