import React from 'react';
import {
    FaComments,
    FaBookOpen,
    FaLightbulb,
    FaCog,
    FaUserCircle,
} from 'react-icons/fa';

const Sidebar = ({
    activeSection,
    onSectionChange,
    onOpenAccountSettings,
    onOpenChatSettings,
    userName,
    userGrade,
    children,
}) => {
    return (
        <div className="w-64 h-full flex flex-col justify-between p-4 bg-[var(--color-surface)] text-[var(--color-text)] relative">
            {children && (
                <div className="absolute top-4 right-4 z-30">{children}</div>
            )}
            <div>
                <h1
                    className="text-5xl mb-6 mt-4 font-[Modak] text-[var(--color-primary)] hover:cursor-pointer"
                    onClick={() => onSectionChange('/home')}
                >
                    OBUCH.AI
                </h1>

                <nav className="flex flex-col gap-4">
                    <button
                        className={`flex items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer
                            ${
                                activeSection === 'task_help'
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'hover:bg-[var(--color-primary-hover)] hover:text-white'
                            }
                            `}
                        onClick={() => onSectionChange('/task_help')}
                    >
                        <FaBookOpen />
                        <span>Помощь с заданием</span>
                    </button>
                    <button
                        className={`flex items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer
                            ${
                                activeSection === 'explain'
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'hover:bg-[var(--color-primary-hover)] hover:text-white'
                            }
                            `}
                        onClick={() => onSectionChange('/explain')}
                    >
                        <FaLightbulb />
                        <span>Объяснить тему</span>
                    </button>
                    <button
                        className={`flex items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer
                                    ${
                                        activeSection === 'chat'
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'hover:bg-[var(--color-primary-hover)] hover:text-white'
                                    }
                                `}
                        onClick={() => onSectionChange('/chat')}
                    >
                        <FaComments />
                        <span>Чат с репетитором</span>
                    </button>
                </nav>
            </div>

            <div className="flex flex-col gap-4">
                <button
                    className="flex items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer text-[var(--color-text)] hover:bg-[var(--color-primary-hover)] hover:text-white"
                    onClick={onOpenChatSettings}
                >
                    <FaCog />
                    <span>Настройки чата</span>
                </button>
                <button
                    className="flex items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer text-[var(--color-text)] hover:bg-[var(--color-primary-hover)] hover:text-white"
                    onClick={onOpenAccountSettings}
                >
                    <FaUserCircle className="text-3xl text-[var(--color-accent)]" />
                    <div className="text-left">
                        <p className="font-semibold text-[var(--color-text)]">
                            {userName}
                        </p>
                        <p className="text-sm text-[var(--color-muted)]">
                            {userGrade + ' класс'}
                        </p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
