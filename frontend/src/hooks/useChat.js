import { useState, useCallback } from 'react';
import { encoding_for_model } from '@dqbd/tiktoken';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG, CHAT_CONFIG, USER_CONFIG, AUTH_CONFIG } from '../config';

import supabase from '../services/supabase';

/**
 * Вспомогательная функция для безопасного получения значения из localStorage
 */
const getLocalStorageValue = (key, defaultValue = '') => {
    try {
        const value = localStorage.getItem(key);
        if (!value) return defaultValue;
        return value;
    } catch (error) {
        console.error(`Ошибка при чтении ${key} из localStorage:`, error);
        return defaultValue;
    }
};

/**
 * Хук для управления чатом
 * Предоставляет функции для отправки сообщений, загрузки истории и управления состоянием чата
 */
const useChat = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Получает ID пользователя через Supabase
     */
    const getUserIdFromSupabase = useCallback(async () => {
        try {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error) {
                console.error(
                    'Ошибка при получении пользователя из Supabase:',
                    error
                );
                return null;
            }

            return user?.id ?? null;
        } catch (err) {
            console.error('Ошибка при получении пользователя:', err);
            return null;
        }
    }, []);

    /**
     * Очищает все сообщения в чате
     */
    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    /**
     * Загружает историю сообщений с сервера через Supabase
     */
    const loadMessages = useCallback(async () => {
        const userId = await getUserIdFromSupabase();
        if (userId) {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                setMessages(
                    data.map((msg) => ({
                        content: msg.message_content,
                        role: msg.role,
                    }))
                );
            } catch (error) {
                console.error('Ошибка при загрузке сообщений:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [getUserIdFromSupabase]);

    /**
     * Подсчитывает количество токенов в сообщениях
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
     */
    const trimMessages = useCallback(
        async (msgs) => {
            const trimmed = [...msgs];
            let totalTokens = await countTokens(trimmed);

            while (totalTokens > CHAT_CONFIG.MAX_TOKENS) {
                trimmed.shift();
                totalTokens = await countTokens(trimmed);
            }

            return trimmed;
        },
        [countTokens]
    );

    /**
     * Отправляет сообщение пользователя и получает ответ от бота
     */
    const sendMessage = useCallback(
        async (messageContent) => {
            setIsLoading(true);
            const newMessage = { content: messageContent, role: 'user' };
            const userId = await getUserIdFromSupabase();

            // Обновление состояния сообщений
            setMessages((prevMessages) => [...prevMessages, newMessage]);

            try {
                // Сохраняем сообщение пользователя на сервер через Supabase
                const { error } = await supabase.from('messages').insert([
                    {
                        user_id: userId,
                        message_content: messageContent,
                        role: 'user',
                    },
                ]);

                if (error) throw error;

                // Получаем текущие сообщения
                const updatedMessages = [...messages, newMessage];

                // Обрезаем при необходимости
                const trimmedMessages = await trimMessages(updatedMessages);

                // Получаем значения из localStorage
                const name = getLocalStorageValue(
                    USER_CONFIG.STORAGE_KEYS.NAME,
                    USER_CONFIG.DEFAULT_VALUES.NAME
                );
                const grade = getLocalStorageValue(
                    USER_CONFIG.STORAGE_KEYS.GRADE,
                    USER_CONFIG.DEFAULT_VALUES.GRADE
                );
                const tone = getLocalStorageValue(
                    USER_CONFIG.STORAGE_KEYS.TONE,
                    USER_CONFIG.DEFAULT_VALUES.TONE
                );
                const hintLevel = getLocalStorageValue(
                    USER_CONFIG.STORAGE_KEYS.HINT_LEVEL,
                    USER_CONFIG.DEFAULT_VALUES.HINT_LEVEL
                );

                // Запрос к серверу (например, к GPT-API или аналогичному)
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

                // Сохраняем ответ бота на сервер через Supabase
                await supabase.from('messages').insert([
                    {
                        user_id: userId,
                        message_content: botMessage.content,
                        role: 'assistant',
                    },
                ]);

                // Обновляем сообщения с ответом бота
                setMessages((prevMessages) => [...prevMessages, botMessage]);
            } catch (error) {
                console.error('Ошибка при отправке сообщения:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [getUserIdFromSupabase, trimMessages, messages]
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
