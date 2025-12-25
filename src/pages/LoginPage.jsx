// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function LoginPage() {
    const { user, login, refresh } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/input';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [retrying, setRetrying] = useState(false);

    const handleRetry = async () => {
        setError('');
        setRetrying(true);
        setBusy(true);
        try {
            const r = await refresh();
            console.log('LoginPage: manual refresh result:', r);
            if (!r) setError('Повторная попытка не принесла данных пользователя. Проверьте Set-Cookie в ответе /api/auth/login.');
        } catch (err) {
            setError('Ошибка при повторной попытке: ' + (err.message || err));
        } finally {
            setRetrying(false);
            setBusy(false);
        }
    };

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
            console.log('LoginPage: /api/auth/login response:', resp);

            // Pass response into auth.login which now attempts to refresh /api/auth/me if needed
            const resultUser = await login(resp);
            console.log('LoginPage: auth.login returned:', resultUser);

            if (!resultUser) {
                setError('Login succeeded but no user data returned');
            }
            // ❌ НЕ ПИШИТЕ navigate() здесь! (редирект произойдёт при изменении user через useEffect)
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
                    {error && error.toLowerCase().includes('no user') && (
                        <div style={{ marginBottom: 8 }}>
                            <button className="secondary-btn" type="button" onClick={handleRetry} disabled={busy || retrying}>
                                {retrying ? 'Повторяем...' : 'Повторить получение данных'}
                            </button>
                        </div>
                    )}
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