import { useState, useCallback } from 'react';
import { encoding_for_model } from '@dqbd/tiktoken';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG, CHAT_CONFIG, USER_CONFIG, AUTH_CONFIG } from '../config';

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
 * Хук для управления чатом
 * Предоставляет функции для отправки сообщений, загрузки истории и управления состоянием чата
 * @returns {Object} - Объект с функциями и состоянием чата
 */
const useChat = () => {
    // Состояние сообщений и индикатор загрузки
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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

    /**
     * Очищает все сообщения в чате
     */
    const clearMessages = useCallback(async () => {
        setMessages([]);
    }, []);

    /**
     * Загружает историю сообщений с сервера
     */
    const loadMessages = useCallback(async () => {
        const userId = getUserIdFromToken();

        if (userId) {
            try {
                setIsLoading(true);
                const response = await axios.get(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MESSAGES}/${userId}`
                );
                
                if (
                    response.data.message !==
                    'Нет сообщений для данного пользователя'
                ) {
                    const msgs = response.data;
                    setMessages(
                        msgs
                            .sort(
                                (a, b) =>
                                    new Date(a.created_at) -
                                    new Date(b.created_at)
                            )
                            .map((msg) => ({
                                content: msg.message_content,
                                role: msg.role,
                            }))
                    );
                }
            } catch (error) {
                console.error('Ошибка при загрузке сообщений:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [getUserIdFromToken]);

    /**
     * Подсчитывает количество токенов в сообщениях
     * @param {Array} msgs - Массив сообщений
     * @returns {Promise<number>} - Количество токенов
     */
    const countTokens = useCallback(async (msgs) => {
        const encoder = await encoding_for_model(CHAT_CONFIG.MODEL);
        return msgs.reduce(
            (acc, msg) => acc + encoder.encode(msg.content).length,
            0
        );
    }, []);

    /**
     * Обрезает сообщения, чтобы они не превышали максимальное количество токенов
     * @param {Array} msgs - Массив сообщений
     * @returns {Promise<Array>} - Обрезанный массив сообщений
     */
    const trimMessages = useCallback(async (msgs) => {
        const trimmed = [...msgs];
        let totalTokens = await countTokens(trimmed);

        while (totalTokens > CHAT_CONFIG.MAX_TOKENS) {
            trimmed.shift();
            totalTokens = await countTokens(trimmed);
        }

        return trimmed;
    }, [countTokens]);

    /**
     * Отправляет сообщение пользователя и получает ответ от бота
     * @param {string} messageContent - Текст сообщения
     */
    const sendMessage = useCallback(
        async (messageContent) => {
            setIsLoading(true);
            const newMessage = { content: messageContent, role: 'user' };
            const userId = getUserIdFromToken();

            // Используем функциональное обновление состояния
            setMessages((prevMessages) => [...prevMessages, newMessage]);

            try {
                // Сохраняем сообщение пользователя на сервер
                await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MESSAGES}`, {
                    userId,
                    messageContent,
                    role: 'user',
                });

                // Получаем текущие сообщения через функциональное обновление
                const updatedMessages = await new Promise((resolve) => {
                    setMessages((prevMessages) => {
                        resolve([...prevMessages]);
                        return prevMessages;
                    });
                });

                // Обрезаем при необходимости
                const trimmedMessages = await trimMessages(updatedMessages);

                // Получаем значения из localStorage с правильной обработкой
                const name = getLocalStorageValue(USER_CONFIG.STORAGE_KEYS.NAME, USER_CONFIG.DEFAULT_VALUES.NAME);
                const grade = getLocalStorageValue(USER_CONFIG.STORAGE_KEYS.GRADE, USER_CONFIG.DEFAULT_VALUES.GRADE);
                const tone = getLocalStorageValue(USER_CONFIG.STORAGE_KEYS.TONE, USER_CONFIG.DEFAULT_VALUES.TONE);
                const hintLevel = getLocalStorageValue(USER_CONFIG.STORAGE_KEYS.HINT_LEVEL, USER_CONFIG.DEFAULT_VALUES.HINT_LEVEL);

                // Запрос к серверу
                const response = await axios.post(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE}`,
                    {
                        mode: 'chat',
                        name,
                        grade,
                        tone,
                        hint_level: hintLevel,
                        messages: trimmedMessages,
                    }
                );

                const botMessage = {
                    content: response.data.message.content,
                    role: 'assistant',
                };

                // Сохраняем ответ бота на сервер
                await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MESSAGES}`, {
                    userId,
                    messageContent: botMessage.content,
                    role: 'assistant',
                });

                // Добавляем ответ бота в чат используя функциональное обновление
                setMessages((prevMessages) => [...prevMessages, botMessage]);
            } catch (error) {
                console.error('Ошибка при отправке сообщения:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [getUserIdFromToken, trimMessages]
    );

    return {
        messages,
        sendMessage,
        loadMessages,
        clearMessages,
        isLoading,
    };
};

export default useChat;
