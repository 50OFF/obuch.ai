import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG, AUTH_CONFIG, USER_CONFIG } from '../config';

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

const generateExplanationId = () => {
    return parseInt(Date.now().toString().slice(-9));
};

const useExplainTopic = () => {
    const [explanation, setExplanation] = useState(null);
    const [prevExplanation, setPrevExplanation] = useState(null);
    const [explanationId, setExplanationId] = useState(null);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [explanations, setExplanations] = useState({});
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
        const loadExplanations = async () => {
            const userId = await getUserId();
            if (!userId) return;

            const { data, error } = await supabase
                .from('explanations')
                .select('*')
                .eq('user_id', userId);

            if (error) {
                console.error('Ошибка при загрузке объяснений:', error);
                setError('Не удалось загрузить объяснения');
                return;
            }

            const explanationsMap = {};
            for (const item of data) {
                explanationsMap[item.id] = {
                    subject: item.subject,
                    topic: item.topic,
                    message: {
                        role: 'assistant',
                        content: item.explanation_content,
                    },
                };
            }

            setExplanations(explanationsMap);
        };

        loadExplanations();
    }, [getUserId]);

    const explainTopic = async (subject, topic) => {
        const userId = await getUserId();
        if (!userId) {
            setError('Пользователь не авторизован');
            return;
        }

        setIsLoading(true);
        setError(null);
        setCurrentTopic({ subject, topic });

        try {
            const newId = generateExplanationId();
            setExplanationId(newId);

            // Добавляем запись в Supabase
            const { error: insertError } = await supabase
                .from('explanations')
                .insert([
                    {
                        id: newId,
                        user_id: userId,
                        subject,
                        topic,
                        explanation_content: 'Загрузка объяснения...',
                    },
                ]);

            if (insertError) throw insertError;

            setExplanation({
                role: 'assistant',
                content: 'Загрузка объяснения...',
            });

            const name = getLocalStorageValue(
                USER_CONFIG.STORAGE_KEYS.NAME,
                USER_CONFIG.DEFAULT_VALUES.NAME
            );
            const grade = getLocalStorageValue(
                USER_CONFIG.STORAGE_KEYS.GRADE,
                USER_CONFIG.DEFAULT_VALUES.GRADE
            );

            // Здесь должен быть вызов вашего кастомного API для генерации текста
            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mode: 'explain',
                        name,
                        grade,
                        topic,
                    }),
                }
            );

            const result = await response.json();
            const explanationContent = result.message.content;

            // Обновляем запись
            const { error: updateError } = await supabase
                .from('explanations')
                .update({ explanation_content: explanationContent })
                .eq('id', newId);

            if (updateError) throw updateError;

            setExplanation({ role: 'assistant', content: explanationContent });

            setExplanations((prev) => ({
                ...prev,
                [newId]: {
                    subject,
                    topic,
                    message: { role: 'assistant', content: explanationContent },
                },
            }));
        } catch (e) {
            console.error('Ошибка при создании объяснения:', e);
            setError('Не удалось создать объяснение');
        } finally {
            setIsLoading(false);
        }
    };

    const explainMore = async () => {
        if (!explanationId || !currentTopic) {
            setError('Нет активного объяснения');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            setPrevExplanation(explanation);

            const name = getLocalStorageValue(
                USER_CONFIG.STORAGE_KEYS.NAME,
                USER_CONFIG.DEFAULT_VALUES.NAME
            );
            const grade = getLocalStorageValue(
                USER_CONFIG.STORAGE_KEYS.GRADE,
                USER_CONFIG.DEFAULT_VALUES.GRADE
            );

            const response = await fetch('/api/generate-explanation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'explain',
                    name,
                    grade,
                    topic: currentTopic.topic,
                    prevExplanation: explanation,
                }),
            });

            const result = await response.json();
            const additionalContent = result.message.content;

            const { error: updateError } = await supabase
                .from('explanations')
                .update({ explanation_content: additionalContent })
                .eq('id', explanationId);

            if (updateError) throw updateError;

            setExplanation({ role: 'assistant', content: additionalContent });

            setExplanations((prev) => ({
                ...prev,
                [explanationId]: {
                    ...prev[explanationId],
                    message: { role: 'assistant', content: additionalContent },
                },
            }));
        } catch (e) {
            console.error('Ошибка при дополнительном объяснении:', e);
            setError('Не удалось получить дополнительное объяснение');
        } finally {
            setIsLoading(false);
        }
    };

    const loadExplanation = (id) => {
        if (!explanations[id]) {
            setError('Объяснение не найдено');
            return;
        }

        setExplanationId(id);
        setCurrentTopic({
            subject: explanations[id].subject,
            topic: explanations[id].topic,
        });
        setExplanation(explanations[id].message);
    };

    const deleteExplanation = async (id) => {
        try {
            const { error: deleteError } = await supabase
                .from('explanations')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setExplanations((prev) => {
                const newExplanations = { ...prev };
                delete newExplanations[id];
                return newExplanations;
            });

            if (explanationId === id) {
                clearExplanation();
            }
        } catch (e) {
            console.error('Ошибка при удалении объяснения:', e);
            setError('Не удалось удалить объяснение');
        }
    };

    const clearExplanation = () => {
        setExplanation(null);
        setPrevExplanation(null);
        setExplanationId(null);
        setCurrentTopic(null);
        setError(null);
    };

    return {
        explanation,
        prevExplanation,
        explanationId,
        currentTopic,
        explanations,
        isLoading,
        error,
        explainTopic,
        explainMore,
        clearExplanation,
        deleteExplanation,
        loadExplanation,
    };
};

export default useExplainTopic;
