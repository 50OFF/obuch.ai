/**
 * Конфигурационный файл проекта
 * Содержит все константы, настройки и URL-адреса API
 */

// API настройки
export const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    ENDPOINTS: {
        MESSAGES: '/messages',
        EXPLANATIONS: '/explanations',
        SETTINGS: '/settings',
        GENERATE: '/generate',
        AUTH: '/auth',
    },
};

// Настройки чата
export const CHAT_CONFIG = {
    MAX_TOKENS: 2048,
    MODEL: 'gpt-3.5-turbo',
    DEFAULT_TONE: 'friendly',
    DEFAULT_HINT_LEVEL: 'middle',
};

// Настройки аутентификации
export const AUTH_CONFIG = {
    TOKEN_KEY: 'token',
    TOKEN_EXPIRY_CHECK_INTERVAL: 60000, // 1 минута
};

// Настройки пользователя
export const USER_CONFIG = {
    STORAGE_KEYS: {
        NAME: 'name',
        GRADE: 'grade',
        TONE: 'tone',
        HINT_LEVEL: 'hint_level',
    },
    DEFAULT_VALUES: {
        NAME: 'Пользователь',
        GRADE: '7',
        TONE: 'friendly',
        HINT_LEVEL: 'middle',
    },
};

// Настройки интерфейса
export const UI_CONFIG = {
    SECTIONS: {
        HOME: 'home',
        TASK_HELP: 'task_help',
        CHAT: 'chat',
        EXPLAIN: 'explain',
    },
    MODAL_TYPES: {
        ACCOUNT_SETTINGS: 'accountSettings',
        CHAT_SETTINGS: 'chatSettings',
    },
};
