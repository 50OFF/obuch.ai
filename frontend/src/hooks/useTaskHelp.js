import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, USER_CONFIG } from '../config';
import supabase from '../services/supabase';

const getLocalStorageValue = (key, defaultValue = '') => {
    try {
        const value = localStorage.getItem(key);
        return value || defaultValue;
    } catch (error) {
        console.error(`Ошибка при чтении ${key} из localStorage:`, error);
        return defaultValue;
    }
};

const generateTaskHelpId = () => {
    return parseInt(Date.now().toString().slice(-9));
};

const useTaskHelp = () => {
    const [taskHelpResult, setTaskHelpResult] = useState(null);
    const [taskHelpId, setTaskHelpId] = useState(null);
    const [taskInput, setTaskInput] = useState(null);
    const [taskHelps, setTaskHelps] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getUserId = useCallback(async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
            console.error('Ошибка при получении пользователя:', error);
            return null;
        }
        return data.user.id;
    }, []);

    useEffect(() => {
        const loadTaskHelps = async () => {
            const userId = await getUserId();
            if (!userId) return;

            const { data, error } = await supabase
                .from('task_help')
                .select('*')
                .eq('user_id', userId);

            if (error) {
                console.error('Ошибка при загрузке taskHelp:', error);
                setError('Не удалось загрузить задачи');
                return;
            }

            const taskHelpMap = {};
            for (const item of data) {
                taskHelpMap[item.id] = {
                    question: item.question,
                    message: {
                        role: 'assistant',
                        content: item.help_content,
                    },
                };
            }

            setTaskHelps(taskHelpMap);
        };

        loadTaskHelps();
    }, [getUserId]);

    const requestTaskHelp = useCallback(
        async ({ mode, text, file }) => {
            setIsLoading(true);
            setError(null);
            setTaskInput({ mode, text, file });

            try {
                const userId = await getUserId();
                if (!userId) {
                    setError('Пользователь не авторизован');
                    return;
                }

                const newId = generateTaskHelpId();
                setTaskHelpId(newId);
                setTaskHelpResult({
                    role: 'assistant',
                    content: 'Загрузка помощи...',
                });

                // Сохраняем черновик в Supabase
                const { error: insertError } = await supabase
                    .from('task_help')
                    .insert([
                        {
                            id: newId,
                            user_id: userId,
                            question: text,
                            help_content: 'Загрузка помощи...',
                        },
                    ]);

                if (insertError) throw insertError;

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
                formData.append('help_mode', mode);
                if (text) formData.append('text', text);
                if (file) formData.append('image', file); // Если файл,

                const response = await fetch(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE}`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

                const result = await response.json();
                const helpContent =
                    result.message?.content || 'Ответ не получен';

                const { error: updateError } = await supabase
                    .from('task_help')
                    .update({ help_content: helpContent })
                    .eq('id', newId);

                if (updateError) throw updateError;

                setTaskHelpResult({ role: 'assistant', content: helpContent });

                setTaskHelps((prev) => ({
                    ...prev,
                    [newId]: {
                        question: text,
                        message: { role: 'assistant', content: helpContent },
                    },
                }));
            } catch (e) {
                console.error('Ошибка при запросе помощи:', e);
                setError('Не удалось получить помощь');
            } finally {
                setIsLoading(false);
            }
        },
        [getUserId]
    );

    const loadTaskHelp = (id) => {
        if (!taskHelps[id]) {
            setError('Задача не найдена');
            return;
        }

        setTaskHelpId(id);
        setTaskHelpResult(taskHelps[id].message);
        setTaskInput({
            mode: 'text',
            text: taskHelps[id].question,
            file: null,
        });
    };

    const deleteTaskHelp = async (id) => {
        try {
            const { error: deleteError } = await supabase
                .from('task_help')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setTaskHelps((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });

            if (taskHelpId === id) {
                clearTaskHelp();
            }
        } catch (e) {
            console.error('Ошибка при удалении taskHelp:', e);
            setError('Не удалось удалить помощь');
        }
    };

    const clearTaskHelp = () => {
        setTaskHelpId(null);
        setTaskHelpResult(null);
        setTaskInput(null);
        setError(null);
    };

    return {
        taskHelpResult,
        taskHelpId,
        taskInput,
        taskHelps,
        isLoading,
        error,
        requestTaskHelp,
        loadTaskHelp,
        deleteTaskHelp,
        clearTaskHelp,
    };
};

export default useTaskHelp;
