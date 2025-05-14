import { useState, useCallback } from 'react';
import { API_CONFIG, USER_CONFIG } from '../config';

const getLocalStorageValue = (key, defaultValue = '') => {
    try {
        const value = localStorage.getItem(key);
        return value || defaultValue;
    } catch (error) {
        console.error(`Ошибка при чтении ${key} из localStorage:`, error);
        return defaultValue;
    }
};

const useTaskHelp = () => {
    const [taskHelpResult, setTaskHelpResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [taskInput, setTaskInput] = useState(null);

    const requestTaskHelp = useCallback(async ({ text, file }) => {
        setIsLoading(true);
        setError(null);
        setTaskInput({ text, file });
        setTaskHelpResult({ role: 'assistant', content: 'Загрузка помощи...' });

        try {
            const name = getLocalStorageValue(
                USER_CONFIG.STORAGE_KEYS.NAME,
                USER_CONFIG.DEFAULT_VALUES.NAME
            );
            const grade = getLocalStorageValue(
                USER_CONFIG.STORAGE_KEYS.GRADE,
                USER_CONFIG.DEFAULT_VALUES.GRADE
            );

            const formData = new FormData();
            formData.append('mode', 'task_help');
            formData.append('name', name);
            formData.append('grade', grade);
            if (text) formData.append('text', text);
            if (file) formData.append('image', file); // Если файл, добавляем его в форму

            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE}`,
                {
                    method: 'POST',
                    body: formData, // не указываем Content-Type вручную
                }
            );

            const result = await response.json();
            if (result.error) {
                throw new Error(result.error);
            }
            setTaskHelpResult(result.message);
        } catch (e) {
            console.error('Ошибка при получении помощи по задаче:', e);
            setError('Не удалось получить помощь по задаче');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearTaskHelp = () => {
        setTaskHelpResult(null);
        setTaskInput(null);
        setError(null);
    };

    return {
        taskHelpResult,
        taskInput,
        isLoading,
        error,
        requestTaskHelp,
        clearTaskHelp,
    };
};

export default useTaskHelp;
