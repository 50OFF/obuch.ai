import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG, AUTH_CONFIG, USER_CONFIG } from '../config';

/**
 * Вспомогательная функция для безопасного получения значения из localStorage
 * Ожидает, что значение хранится в виде строки
 * 
 * @param {string} key - Ключ для получения значения
 * @param {any} defaultValue - Значение по умолчанию
 * @returns {any} - Значение из localStorage или значение по умолчанию
 */
const getLocalStorageValue = (key, defaultValue = '') => {
    try {
        const value = localStorage.getItem(key);
        if (!value) return defaultValue;
        
        // Возвращаем значение как есть, без парсинга JSON
        return value;
    } catch (error) {
        console.error(`Ошибка при чтении ${key} из localStorage:`, error);
        return defaultValue;
    }
};

/**
 * Генерирует уникальный ID для объяснения
 * @returns {number} - Уникальный числовой ID
 */
const generateExplanationId = () => {
    // Используем только последние 9 цифр timestamp, что даст нам число в пределах integer
    return parseInt(Date.now().toString().slice(-9));
};

/**
 * Хук для управления объяснениями тем
 * @returns {Object} - Объект с состоянием и методами для работы с объяснениями
 */
const useExplainTopic = () => {
    const [explanation, setExplanation] = useState(null);
    const [prevExplanation, setPrevExplanation] = useState(null);
    const [explanationId, setExplanationId] = useState(null);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [explanations, setExplanations] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Получает ID пользователя из JWT токена
     * @returns {string|null} - ID пользователя или null, если токен недействителен
     */
    const getUserIdFromToken = useCallback(() => {
        const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
        if (token) {
            try {
                const decoded = jwtDecode(token);
                return decoded.userId;
            } catch (error) {
                console.error('Ошибка при декодировании токена:', error);
                return null;
            }
        }
        return null;
    }, []);

    // Загрузка объяснений при монтировании компонента
    useEffect(() => {
        const loadExplanations = async () => {
            const userId = getUserIdFromToken();
            if (!userId) return;
            
            try {
                const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPLANATIONS}/${userId}`);
                const data = response.data;
                
                const explanationsMap = data.reduce((acc, item) => {
                    acc[item.id] = {
                        subject: item.subject,
                        topic: item.topic,
                        message: {
                            role: 'assistant',
                            content: item.explanation_content
                        }
                    };
                    return acc;
                }, {});
                
                setExplanations(explanationsMap);
            } catch (error) {
                console.error('Ошибка при загрузке объяснений:', error);
                setError('Не удалось загрузить объяснения');
            }
        };

        loadExplanations();
    }, [getUserIdFromToken]);

    /**
     * Объяснение новой темы
     * @param {string} subject - Предмет
     * @param {string} topic - Тема
     */
    const explainTopic = async (subject, topic) => {
        const userId = getUserIdFromToken();
        if (!userId) {
            setError('Пользователь не авторизован');
            return;
        }

        setIsLoading(true);
        setError(null);
        setCurrentTopic({ subject, topic });

        try {
            // Генерируем новый ID для объяснения
            const newId = generateExplanationId();
            setExplanationId(newId);

            // Создаем новое объяснение в БД
            const newExplanation = {
                id: newId,
                userId: userId,
                explanationContent: 'Загрузка объяснения...',
                subject,
                topic
            };

            await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPLANATIONS}`, newExplanation);

            // Обновляем локальное состояние
            setExplanation({
                role: 'assistant',
                content: 'Загрузка объяснения...'
            });

            // Получаем значения из localStorage
            const name = getLocalStorageValue(USER_CONFIG.STORAGE_KEYS.NAME, USER_CONFIG.DEFAULT_VALUES.NAME);
            const grade = getLocalStorageValue(USER_CONFIG.STORAGE_KEYS.GRADE, USER_CONFIG.DEFAULT_VALUES.GRADE);

            // Запрос к API для генерации объяснения
            const response = await axios.post(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE}`,
                {
                    mode: 'explain',
                    name,
                    grade,
                    topic
                }
            );

            const explanationContent = response.data.message.content;

            // Обновляем объяснение в БД
            await axios.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPLANATIONS}/${newId}`, {
                explanationContent
            });

            // Обновляем локальное состояние
            setExplanation({
                role: 'assistant',
                content: explanationContent
            });

            setExplanations(prev => ({
                ...prev,
                [newId]: {
                    subject,
                    topic,
                    message: {
                        role: 'assistant',
                        content: explanationContent
                    }
                }
            }));
        } catch (error) {
            console.error('Ошибка при создании объяснения:', error);
            setError('Не удалось создать объяснение');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Получение дополнительного объяснения для текущей темы
     */
    const explainMore = async () => {
        if (!explanationId || !currentTopic) {
            setError('Нет активного объяснения');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Сохраняем текущее объяснение
            setPrevExplanation(explanation);

            // Получаем значения из localStorage
            const name = getLocalStorageValue(USER_CONFIG.STORAGE_KEYS.NAME, USER_CONFIG.DEFAULT_VALUES.NAME);
            const grade = getLocalStorageValue(USER_CONFIG.STORAGE_KEYS.GRADE, USER_CONFIG.DEFAULT_VALUES.GRADE);

            // Запрос к API для генерации дополнительного объяснения
            const response = await axios.post(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE}`,
                {
                    mode: 'explain',
                    name,
                    grade,
                    topic: currentTopic.topic,
                    prevExplanation: {
                        role: 'assistant',
                        content: explanation.content
                    }
                }
            );

            const additionalContent = response.data.message.content;

            // Обновляем объяснение в БД
            await axios.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPLANATIONS}/${explanationId}`, {
                explanationContent: additionalContent
            });

            // Обновляем локальное состояние
            setExplanation({
                role: 'assistant',
                content: additionalContent
            });

            setExplanations(prev => ({
                ...prev,
                [explanationId]: {
                    ...prev[explanationId],
                    message: {
                        role: 'assistant',
                        content: additionalContent
                    }
                }
            }));
        } catch (error) {
            console.error('Ошибка при получении дополнительного объяснения:', error);
            setError('Не удалось получить дополнительное объяснение');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Загрузка существующего объяснения
     * @param {number} id - ID объяснения
     */
    const loadExplanation = async (id) => {
        if (!explanations[id]) {
            setError('Объяснение не найдено');
            return;
        }

        setExplanationId(id);
        setCurrentTopic({
            subject: explanations[id].subject,
            topic: explanations[id].topic
        });
        setExplanation(explanations[id].message);
    };

    /**
     * Удаление объяснения
     * @param {number} id - ID объяснения
     */
    const deleteExplanation = async (id) => {
        try {
            await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPLANATIONS}/${id}`);
            
            setExplanations(prev => {
                const newExplanations = { ...prev };
                delete newExplanations[id];
                return newExplanations;
            });

            if (explanationId === id) {
                clearExplanation();
            }
        } catch (error) {
            console.error('Ошибка при удалении объяснения:', error);
            setError('Не удалось удалить объяснение');
        }
    };

    /**
     * Очистка текущего объяснения
     */
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
        loadExplanation
    };
};

export default useExplainTopic; 