import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useNavigate,
} from 'react-router-dom';
import supabase from './services/supabase';

import MessageList from './components/MessageList';
import ExplainTopic from './components/ExplainTopic';
import ChatInput from './components/ChatInput';
import useChat from './hooks/useChat';
import useLocalStorage from './hooks/useLocalStorage';
import AuthForm from './components/AuthForm';
import AccountSettings from './components/AccountSettings';
import Sidebar from './components/Sidebar';
import Modal from './components/Modal';
import TaskHelp from './components/TaskHelp';
import Home from './components/Home';
import { USER_CONFIG } from './config';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MainLayout = ({ children }) => {
    const { messages, sendMessage, loadMessages, clearMessages, isLoading } =
        useChat();

    const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
    const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [userName, setUserName] = useLocalStorage(
        USER_CONFIG.STORAGE_KEYS.NAME,
        USER_CONFIG.DEFAULT_VALUES.NAME
    );
    const [userGrade, setUserGrade] = useLocalStorage(
        USER_CONFIG.STORAGE_KEYS.GRADE,
        USER_CONFIG.DEFAULT_VALUES.GRADE
    );
    const [userTone, setUserTone] = useLocalStorage(
        USER_CONFIG.STORAGE_KEYS.TONE,
        USER_CONFIG.DEFAULT_VALUES.TONE
    );
    const [hintLevel, setHintLevel] = useLocalStorage(
        USER_CONFIG.STORAGE_KEYS.HINT_LEVEL,
        USER_CONFIG.DEFAULT_VALUES.HINT_LEVEL
    );

    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            if (session) {
                loadMessages();
            }
        };

        checkSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
            if (session) {
                loadMessages();
            } else {
                clearMessages();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('name, grade, tone, hint_level')
                    .eq('id', user.id)
                    .single();

                if (error) throw new Error(error.message);

                setUserName(data.name || USER_CONFIG.DEFAULT_VALUES.NAME);
                setUserGrade(data.grade || USER_CONFIG.DEFAULT_VALUES.GRADE);
                setUserTone(data.tone || USER_CONFIG.DEFAULT_VALUES.TONE);
                setHintLevel(
                    data.hint_level || USER_CONFIG.DEFAULT_VALUES.HINT_LEVEL
                );
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
    }, [isLoggedIn]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        clearMessages();
        setUserName(USER_CONFIG.DEFAULT_VALUES.NAME);
        setUserGrade(USER_CONFIG.DEFAULT_VALUES.GRADE);
        setUserTone(USER_CONFIG.DEFAULT_VALUES.TONE);
        setHintLevel(USER_CONFIG.DEFAULT_VALUES.HINT_LEVEL);
        setIsAccountSettingsOpen(false);
        setIsChatSettingsOpen(false);
        navigate('/chat');
    };

    if (!isLoggedIn) {
        return <AuthForm />;
    }

    return (
        <div className="h-screen relative overflow-hidden">
            {/* Sidebar */}
            <div
                className={
                    sidebarVisible
                        ? 'w-64 h-full absolute left-0 top-0 z-30 transition-transform duration-300 translate-x-0'
                        : 'w-64 h-full absolute left-0 top-0 z-30 transition-transform duration-300 -translate-x-full pointer-events-none'
                }
            >
                <Sidebar
                    onSectionChange={(path) => navigate(path)}
                    onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
                    onOpenChatSettings={() => setIsChatSettingsOpen(true)}
                    userName={userName}
                    userGrade={userGrade}
                />
            </div>

            {/* Sidebar toggles */}
            {sidebarVisible ? (
                <button
                    className="fixed top-6 left-66 z-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full p-1 shadow hover:bg-[var(--color-primary-hover)] transition-colors"
                    onClick={() => setSidebarVisible(false)}
                    title="Скрыть меню"
                >
                    <ChevronLeft size={30} />
                </button>
            ) : (
                <button
                    className="fixed top-6 left-2 z-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full p-2 shadow hover:bg-[var(--color-primary-hover)] transition-colors"
                    onClick={() => setSidebarVisible(true)}
                    title="Показать меню"
                >
                    <ChevronRight size={24} />
                </button>
            )}

            {/* Account Settings */}
            {isAccountSettingsOpen && (
                <Modal onClose={() => setIsAccountSettingsOpen(false)}>
                    <AccountSettings
                        userName={userName}
                        userGrade={userGrade}
                        userTone={userTone}
                        hintLevel={hintLevel}
                        onUpdateName={setUserName}
                        onUpdateClass={setUserGrade}
                        onUpdateTone={setUserTone}
                        onUpdateHintLevel={setHintLevel}
                        onClose={() => setIsAccountSettingsOpen(false)}
                        onLogout={handleLogout}
                    />
                </Modal>
            )}

            {/* Main content */}
            <main
                className={`flex-1 flex flex-col h-screen transition-all duration-300 ${
                    sidebarVisible ? 'ml-64' : 'ml-0'
                }`}
            >
                {children({
                    messages,
                    sendMessage,
                    isLoading,
                    userGrade,
                    navigate,
                })}
            </main>
        </div>
    );
};

const App = () => (
    <Router>
        <Routes>
            <Route
                path="/"
                element={
                    <MainLayout>
                        {({ navigate }) => (
                            <div className="w-full max-w-3xl mx-auto pb-3 flex flex-col flex-1">
                                <Home
                                    onSectionChange={(path) => navigate(path)}
                                />
                            </div>
                        )}
                    </MainLayout>
                }
            />
            <Route
                path="/chat"
                element={
                    <MainLayout>
                        {({ messages, sendMessage, isLoading }) => (
                            <div className="w-full max-w-3xl mx-auto pb-3 flex flex-col h-full">
                                <MessageList
                                    messages={messages}
                                    isLoading={isLoading}
                                />
                                <ChatInput onSendMessage={sendMessage} />
                            </div>
                        )}
                    </MainLayout>
                }
            />
            <Route
                path="/explain"
                element={
                    <MainLayout>
                        {({ userGrade }) => (
                            <div className="w-full max-w-3xl mx-auto pb-3 flex flex-col flex-1">
                                <ExplainTopic userGrade={userGrade} />
                            </div>
                        )}
                    </MainLayout>
                }
            />
            <Route
                path="/task_help"
                element={
                    <MainLayout>
                        {() => (
                            <div className="w-full max-w-3xl mx-auto pb-3 flex flex-col flex-1">
                                <TaskHelp />
                            </div>
                        )}
                    </MainLayout>
                }
            />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    </Router>
);

export default App;
