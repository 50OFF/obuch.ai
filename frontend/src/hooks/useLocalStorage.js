import { useState, useEffect } from 'react';

/**
 * Хук для работы с localStorage
 * Хранит данные в виде строк без JSON сериализации
 * 
 * @param {string} key - Ключ для хранения значения
 * @param {any} initialValue - Начальное значение
 * @returns {[any, Function]} - Массив с текущим значением и функцией для его обновления
 */
const useLocalStorage = (key, initialValue) => {
    // Получаем начальное значение из localStorage или используем переданное
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item || initialValue;
        } catch (error) {
            console.error(`Ошибка при чтении ${key} из localStorage:`, error);
            return initialValue;
        }
    });

    // Функция для обновления значения в localStorage и состоянии
    const setValue = (value) => {
        try {
            // Если value - функция, вызываем её с текущим значением
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            
            // Сохраняем значение в состоянии
            setStoredValue(valueToStore);
            
            // Сохраняем значение в localStorage как строку
            localStorage.setItem(key, valueToStore);
        } catch (error) {
            console.error(`Ошибка при сохранении ${key} в localStorage:`, error);
        }
    };

    // Слушаем изменения в localStorage из других вкладок
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key) {
                setStoredValue(e.newValue || initialValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, initialValue]);

    return [storedValue, setValue];
};

export default useLocalStorage; 