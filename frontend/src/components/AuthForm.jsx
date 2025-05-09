import React, { useState } from 'react';
import axios from 'axios';

const color1 = import.meta.env.VITE_COLOR1;
const color2 = import.meta.env.VITE_COLOR2;
const color3 = import.meta.env.VITE_COLOR3;
const color4 = import.meta.env.VITE_COLOR4;

const AuthForm = ({ onAuth }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password || (!isLoginMode && !confirmPassword)) {
            return setError('Все поля обязательны');
        }

        if (!isLoginMode && password !== confirmPassword) {
            return setError('Пароли не совпадают');
        }

        try {
            const url = `http://localhost:5000/api/auth/${
                isLoginMode ? 'login' : 'register'
            }`;
            const response = await axios.post(url, { email, password });

            const { token } = response.data;
            if (token) {
                localStorage.setItem('token', token);
                onAuth(); // сообщаем App, что пользователь авторизован
            } else {
                throw new Error('Токен не получен');
            }
        } catch (err) {
            if (
                err.response?.data?.message ===
                'User with this email already exists'
            ) {
                setError('Пользователь с таким email уже существует');
            } else {
                setError(err.response?.data?.message || 'Ошибка сервера');
            }
        }
    };

    return (
        <div
            className="flex justify-center items-center h-screen bg-[var(--color-surface)] text-[var(--color-text)]"
        >
            <form
                onSubmit={handleSubmit}
                className="p-6 rounded-lg shadow-lg w-full max-w-md bg-[var(--color-background)]"
            >
                <h2 className="text-2xl mb-4 text-center">
                    {isLoginMode ? 'Вход' : 'Регистрация'}
                </h2>

                {error && <div className="text-[var(--color-error)] mb-4">{error}</div>}

                <div className="mb-4">
                    <label htmlFor="email" className="block mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-2 border border-[var(--color-border)] rounded w-full focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text)] bg-[var(--color-surface)] transition-colors"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block mb-2">
                        Пароль
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 border border-[var(--color-border)] rounded w-full focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text)] bg-[var(--color-surface)] transition-colors"
                        required
                    />
                </div>

                {!isLoginMode && (
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block mb-2">
                            Подтверждение пароля
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="p-2 border border-[var(--color-border)] rounded w-full focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text)] bg-[var(--color-surface)] transition-colors"
                            required
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="p-2 rounded w-full mb-2 bg-[var(--color-primary)] text-[var(--color-surface)] font-semibold transition cursor-pointer hover:bg-[var(--color-primary-hover)]"
                >
                    {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
                </button>

                <button
                    type="button"
                    onClick={toggleMode}
                    className="text-sm hover:underline cursor-pointer text-[var(--color-primary)]"
                >
                    {isLoginMode
                        ? 'Нет аккаунта? Зарегистрироваться'
                        : 'Уже есть аккаунт? Войти'}
                </button>
            </form>
        </div>
    );
};

export default AuthForm;
