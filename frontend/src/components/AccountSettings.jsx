import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const color1 = import.meta.env.VITE_COLOR1;
const color2 = import.meta.env.VITE_COLOR2;
const color3 = import.meta.env.VITE_COLOR3;
const color4 = import.meta.env.VITE_COLOR4;

const AccountSettings = ({
    userName,
    userGrade,
    userTone,
    hintLevel,
    onUpdateName,
    onUpdateClass,
    onUpdateTone,
    onUpdateHintLevel,
    onClose,
    onLogout,
}) => {
    const [name, setName] = useState(userName);
    const [grade, setGrade] = useState(userGrade);
    const [tone, setTone] = useState(userTone || 'friendly');
    const [hint, setHint] = useState(hintLevel || 'middle');

    const getUserIdFromToken = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                return decoded.userId;
            } catch (error) {
                console.error('Ошибка при декодировании токена:', error);
            }
        }
        return null;
    };

    const userId = getUserIdFromToken();

    const handleSave = async () => {
        if (!userId) return;

        try {
            await axios.put(`http://localhost:5000/api/settings/${userId}`, {
                name: name?.trim() === '' ? null : name,
                grade: grade === '' || grade === null ? null : Number(grade),
                tone: tone,
                hint_level: hint,
            });

            // Передаём обновлённые данные обратно в родительский компонент
            onUpdateName(name);
            onUpdateClass(grade);
            onUpdateTone(tone);
            onUpdateHintLevel(hint);
            localStorage.setItem('name', name);
            localStorage.setItem('grade', grade);
            localStorage.setItem('tone', tone);
            localStorage.setItem('hint_level', hint);
        } catch (error) {
            console.error('Ошибка при сохранении настроек:', error);
        }
    };

    return (
        <div
            className="text-[var(--color-text)] p-4 rounded-2xl shadow-md w-full max-w-xl mx-auto my-6 bg-[var(--color-surface)]"
        >
            <h2 className="text-xl font-bold mb-4">Настройки аккаунта</h2>

            <div className="mb-4">
                <label className="block mb-1">Имя:</label>
                <input
                    type="text"
                    className="w-full border border-[var(--color-border)] px-2 py-1 rounded focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text)] bg-[var(--color-background)] transition-colors"
                    value={name ?? ''}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="block mb-1">Класс:</label>
                <select
                    className="w-full border border-[var(--color-border)] px-2 py-1 rounded focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text)] bg-[var(--color-background)] transition-colors cursor-pointer"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                >
                    <option value="">Не выбрано</option>
                    {[...Array(11)].map((_, i) => (
                        <option key={i + 1} value={i + 1} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                            {i + 1}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="block mb-1">Стиль общения:</label>
                <select
                    className="w-full border border-[var(--color-border)] px-2 py-1 rounded focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text)] bg-[var(--color-background)] transition-colors cursor-pointer"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                >
                    <option value="friendly" className="bg-[var(--color-surface)] text-[var(--color-text)]">Дружелюбный</option>
                    <option value="strict" className="bg-[var(--color-surface)] text-[var(--color-text)]">Строгий</option>
                    <option value="neutral" className="bg-[var(--color-surface)] text-[var(--color-text)]">Нейтральный</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="block mb-1">Степень подсказывания:</label>
                <select
                    className="w-full border border-[var(--color-border)] px-2 py-1 rounded focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text)] bg-[var(--color-background)] transition-colors cursor-pointer"
                    value={hint}
                    onChange={(e) => setHint(e.target.value)}
                >
                    <option value="high" className="bg-[var(--color-surface)] text-[var(--color-text)]">Давать ответ сразу</option>
                    <option value="middle" className="bg-[var(--color-surface)] text-[var(--color-text)]">Подсказывать по шагам</option>
                    <option value="low" className="bg-[var(--color-surface)] text-[var(--color-text)]">Не подсказывать</option>
                </select>
            </div>

            <div className="flex justify-between mt-6">
                <button
                    onClick={onLogout}
                    className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-surface)] font-semibold transition cursor-pointer hover:bg-[var(--color-primary-hover)]"
                >
                    Выйти
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-[var(--color-border)] text-[var(--color-text)] font-semibold transition cursor-pointer hover:bg-[var(--color-primary)] hover:text-[var(--color-surface)]"
                    >
                        Закрыть
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-surface)] font-semibold transition cursor-pointer hover:bg-[var(--color-primary-hover)]"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
