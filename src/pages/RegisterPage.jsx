import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Api } from '../api.js';
import { useAuth } from '../auth.jsx'; // или путь к вашему AuthProvider

export default function RegisterPage() {
    const { user, login, refresh } = useAuth(); // ← добавили user
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/input'; // ← откуда пришли

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pwd1, setPwd1] = useState('');
    const [pwd2, setPwd2] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [passError, setPassError] = useState('');
    const [retrying, setRetrying] = useState(false);

    const handleRetry = async () => {
        setError('');
        setRetrying(true);
        setBusy(true);
        try {
            const r = await refresh();
            console.log('RegisterPage: manual refresh result:', r);
            if (!r) setError('Повторная попытка не принесла данных пользователя. Проверьте Set-Cookie в ответе /api/auth/register.');
        } catch (err) {
            setError('Ошибка при повторной попытке: ' + (err.message || err));
        } finally {
            setRetrying(false);
            setBusy(false);
        }
    };

    // ✅ Редирект после регистрации (аналогично LoginPage)
    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    const handlePasswordChange = (evt) => {
        const password = evt.target.value;
        setPwd1(password);
        if (password.length < 6) {
            setPassError('Пароль должен быть не менее 6 символов');
        } else {
            setPassError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (pwd1 !== pwd2) {
            setError('Пароли не совпадают');
            return;
        }
        if (passError) return; // не отправляем, если пароль неверный

        setBusy(true);
        try {
            const resp = await Api.register({ name, email, password: pwd1 });
            console.log('RegisterPage: /api/auth/register response:', resp);

            // Pass response into auth.login which now attempts to refresh /api/auth/me if needed
            const resultUser = await login(resp);
            console.log('RegisterPage: auth.login returned:', resultUser);

            if (!resultUser) {
                setError('Регистрация успешна, но нет данных пользователя');
            }
            // ❌ НЕ НАДО: navigate('/input');
        } catch (err) {
            setError(err.message || 'Ошибка регистрации');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Регистрация</h1>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        className="auth-input"
                        placeholder="Имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Пароль"
                        value={pwd1}
                        onChange={handlePasswordChange}
                        required
                    />
                    {passError && <div className="auth-error">{passError}</div>}
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Повтор пароля"
                        value={pwd2}
                        onChange={(e) => setPwd2(e.target.value)}
                        required
                    />
                    {error && <div className="auth-error">{error}</div>}
                    {error && error.toLowerCase().includes('нет данных пользователя') && (
                        <div style={{ marginBottom: 8 }}>
                            <button className="secondary-btn" type="button" onClick={handleRetry} disabled={busy || retrying}>
                                {retrying ? 'Повторяем...' : 'Повторить получение данных'}
                            </button>
                        </div>
                    )}
                    <button
                        className="primary-btn spinner-btn"
                        type="submit"
                        disabled={busy || passError}
                    >
                        {busy ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                <span>Регистрация...</span>
                            </>
                        ) : (
                            'Регистрация'
                        )}
                    </button>
                </form>
                <div className="auth-sub">
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </div>
            </div>
        </div>
    );
}