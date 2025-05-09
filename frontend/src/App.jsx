import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

import MessageList from './components/MessageList';
import ExplainTopic from './components/ExplainTopic';
import ChatInput from './components/ChatInput';
import useChat from './hooks/useChat';
import useLocalStorage from './hooks/useLocalStorage';
import AuthForm from './components/AuthForm';
import AccountSettings from './components/AccountSettings';
import Sidebar from './components/Sidebar';
import Modal from './components/Modal';
import { API_CONFIG, AUTH_CONFIG, USER_CONFIG, UI_CONFIG } from './config';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Главный компонент приложения
 * Управляет аутентификацией, настройками пользователя и отображением различных секций
 */
const App = () => {
    // Хук для управления чатом
    const { messages, sendMessage, loadMessages, clearMessages, isLoading } = useChat();

    // Состояние аутентификации и интерфейса
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeSection, setActiveSection] = useState(UI_CONFIG.SECTIONS.CHAT);
    const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
    const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(true);

    // Используем useLocalStorage для пользовательских настроек
    const [userName, setUserName] = useLocalStorage(USER_CONFIG.STORAGE_KEYS.NAME, USER_CONFIG.DEFAULT_VALUES.NAME);
    const [userGrade, setUserGrade] = useLocalStorage(USER_CONFIG.STORAGE_KEYS.GRADE, USER_CONFIG.DEFAULT_VALUES.GRADE);
    const [userTone, setUserTone] = useLocalStorage(USER_CONFIG.STORAGE_KEYS.TONE, USER_CONFIG.DEFAULT_VALUES.TONE);
    const [hintLevel, setHintLevel] = useLocalStorage(USER_CONFIG.STORAGE_KEYS.HINT_LEVEL, USER_CONFIG.DEFAULT_VALUES.HINT_LEVEL);

    /**
     * Обработчик успешной аутентификации
     */
    const handleLogin = () => {
        setIsLoggedIn(true);
        loadMessages();
    };

    /**
     * Проверка токена при загрузке приложения
     * Если токен действителен, выполняет автоматический вход
     */
    useEffect(() => {
        const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const now = Date.now() / 1000;

                if (decoded.exp && decoded.exp < now) {
                    // токен истёк
                    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
                    setIsLoggedIn(false);
                } else {
                    setIsLoggedIn(true);
                    loadMessages();
                }
            } catch (error) {
                console.error('Ошибка при проверке токена:', error);
                localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
            }
        }
    }, []);

    /**
     * Загрузка настроек пользователя с сервера
     */
    useEffect(() => {
        const fetchSettings = async () => {
            const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
            if (!token) return;

            let userId;
            try {
                const decoded = jwtDecode(token);
                userId = decoded.userId;
            } catch (error) {
                console.error('Ошибка при декодировании токена:', error);
                return;
            }

            try {
                const response = await axios.get(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SETTINGS}/${userId}`
                );
                const data = response.data;

                setUserName(data.name || USER_CONFIG.DEFAULT_VALUES.NAME);
                setUserGrade(data.grade || USER_CONFIG.DEFAULT_VALUES.GRADE);
                setUserTone(data.tone || USER_CONFIG.DEFAULT_VALUES.TONE);
                setHintLevel(data.hint_level || USER_CONFIG.DEFAULT_VALUES.HINT_LEVEL);
            } catch (error) {
                console.error(
                    'Ошибка при загрузке настроек пользователя:',
                    error
                );
            }
        };

        if (isLoggedIn) {
            fetchSettings();
        }
    }, [isLoggedIn, setUserName, setUserGrade, setUserTone, setHintLevel]);

    /**
     * Обработчик выхода из системы
     * Очищает все данные пользователя и возвращает к экрану входа
     */
    const handleLogout = () => {
        setIsLoggedIn(false);
        clearMessages();
        setUserName(USER_CONFIG.DEFAULT_VALUES.NAME);
        setUserGrade(USER_CONFIG.DEFAULT_VALUES.GRADE);
        setUserTone(USER_CONFIG.DEFAULT_VALUES.TONE);
        setHintLevel(USER_CONFIG.DEFAULT_VALUES.HINT_LEVEL);
        setActiveSection(UI_CONFIG.SECTIONS.CHAT);
        setIsAccountSettingsOpen(false);
        setIsChatSettingsOpen(false);
        localStorage.clear();
    };

    /**
     * Обработчики открытия/закрытия модальных окон
     */
    const openAccountSettings = () => setIsAccountSettingsOpen(true);
    const closeAccountSettings = () => setIsAccountSettingsOpen(false);

    // Если пользователь не авторизован, показываем форму входа
    if (!isLoggedIn) {
        return <AuthForm onAuth={handleLogin} />;
    }

    return (
        <div className="h-screen relative overflow-hidden">
            {/* Sidebar абсолютно позиционирован */}
            <div className={
                sidebarVisible
                    ? 'w-64 h-full absolute left-0 top-0 z-30 transition-transform duration-300 translate-x-0'
                    : 'w-64 h-full absolute left-0 top-0 z-30 transition-transform duration-300 -translate-x-full pointer-events-none'
            }>
                <Sidebar
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                    onOpenAccountSettings={openAccountSettings}
                    onOpenChatSettings={() => setIsChatSettingsOpen(true)}
                    userName={userName}
                    userGrade={userGrade}
                />
            </div>

            {/* Кнопка скрытия Sidebar за пределами справа */}
            {sidebarVisible && (
                <button
                    className="absolute top-4 left-64 z-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full p-1 shadow hover:bg-[var(--color-primary-hover)] transition-colors"
                    onClick={() => setSidebarVisible(false)}
                    title="Скрыть меню"
                >
                    <ChevronLeft size={20} />
                </button>
            )}

            {/* Кнопка возврата Sidebar */}
            {!sidebarVisible && (
                <button
                    className="fixed top-6 left-2 z-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full p-2 shadow hover:bg-[var(--color-primary-hover)] transition-colors"
                    onClick={() => setSidebarVisible(true)}
                    title="Показать меню"
                >
                    <ChevronRight size={24} />
                </button>
            )}

            {isAccountSettingsOpen && (
                <Modal onClose={closeAccountSettings}>
                    <AccountSettings
                        userName={userName}
                        userGrade={userGrade}
                        userTone={userTone}
                        hintLevel={hintLevel}
                        onUpdateName={setUserName}
                        onUpdateClass={setUserGrade}
                        onUpdateTone={setUserTone}
                        onUpdateHintLevel={setHintLevel}
                        onClose={closeAccountSettings}
                        onLogout={handleLogout}
                    />
                </Modal>
            )}

            {/* main с анимацией margin-left */}
            <main className={`flex-1 flex flex-col h-screen transition-all duration-300 ${sidebarVisible ? 'ml-64' : 'ml-0'}`}>
                {activeSection === UI_CONFIG.SECTIONS.CHAT && (
                    <div className="w-full max-w-3xl mx-auto pb-3 flex flex-col h-full">
                        
                            <MessageList
                                messages={messages}
                                isLoading={isLoading}
                            />
                        <ChatInput onSendMessage={sendMessage} />
                    </div>
                )}
                {activeSection === UI_CONFIG.SECTIONS.EXPLAIN && (
                    <div className="w-full max-w-3xl mx-auto pb-3 flex flex-col flex-1">
                        <ExplainTopic userGrade={userGrade} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
