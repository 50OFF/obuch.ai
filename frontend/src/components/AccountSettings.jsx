import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import supabase from '../services/supabase';
import ToggleSelector from './ToggleSelector';

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
    const [hint, setHint] = useState(hintLevel || 'mid');

    const handleSave = async () => {
        try {
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError) {
                console.error('Ошибка при получении пользователя:', authError);
                return;
            }

            const userId = user?.id;
            if (!userId) {
                console.error('Пользователь не найден');
                return;
            }

            const updates = {
                name: name?.trim() === '' ? null : name,
                grade: grade === '' || grade === null ? null : Number(grade),
                tone: tone,
                hint_level: hint,
            };

            const { error: updateError } = await supabase
                .from('users')
                .update(updates)
                .eq('id', userId);

            if (updateError) {
                console.error(
                    'Ошибка при обновлении данных в Supabase:',
                    updateError
                );
                return;
            }

            // Обновляем локальные данные
            onUpdateName(name);
            onUpdateClass(grade);
            onUpdateTone(tone);
            onUpdateHintLevel(hint);
            localStorage.setItem('name', name);
            localStorage.setItem('grade', grade);
            localStorage.setItem('tone', tone);
            localStorage.setItem('hint_level', hint);
        } catch (err) {
            console.error('Ошибка при сохранении настроек:', err);
        }
    };

    return (
        <div className="text-[var(--color-text)] p-4 rounded-3xl shadow-md w-full max-w-xl mx-auto my-6 bg-[var(--color-surface)]">
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
                <ToggleSelector
                    options={[
                        { value: '1', label: '1' },
                        { value: '2', label: '2' },
                        { value: '3', label: '3' },
                        { value: '4', label: '4' },
                        { value: '5', label: '5' },
                        { value: '6', label: '6' },
                        { value: '7', label: '7' },
                        { value: '8', label: '8' },
                        { value: '9', label: '9' },
                        { value: '10', label: '10' },
                        { value: '11', label: '11' },
                    ]}
                    value={String(grade)}
                    onChange={(val) => setGrade(Number(val))}
                />
            </div>

            <div className="mb-4">
                <label className="block mb-1">Стиль общения:</label>
                <ToggleSelector
                    options={[
                        { value: 'friendly', label: 'Дружелюбный' },
                        { value: 'strict', label: 'Строгий' },
                        { value: 'neutral', label: 'Нейтральный' },
                    ]}
                    value={tone}
                    onChange={setTone}
                />
            </div>

            <div className="mb-4">
                <label className="block mb-1">Степень подсказывания:</label>
                <ToggleSelector
                    options={[
                        { value: 'high', label: 'Ответ сразу' },
                        { value: 'mid', label: 'По шагам' },
                        { value: 'low', label: 'Без подсказок' },
                    ]}
                    value={hint}
                    onChange={setHint}
                />
            </div>

            <div className="flex justify-between mt-6">
                <button
                    onClick={onLogout}
                    className="px-4 py-2 rounded-full bg-[var(--color-primary)] text-black font-semibold transition cursor-pointer hover:bg-[var(--color-primary-hover)]"
                >
                    Выйти
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-full bg-[var(--color-border)] text-[var(--color-text)] font-semibold transition cursor-pointer hover:bg-[var(--color-primary)] hover:text-[var(--color-surface)]"
                    >
                        Закрыть
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-full bg-[var(--color-primary)] text-black font-semibold transition cursor-pointer hover:bg-[var(--color-primary-hover)]"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
