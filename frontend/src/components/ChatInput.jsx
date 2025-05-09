import React, { useState, useRef } from 'react';
import { ArrowUp, Paperclip } from 'lucide-react';

const MAX_ROWS = 8;
const ROW_HEIGHT = 28;

const ChatInput = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef(null);

    const handleChange = (event) => {
        setMessage(event.target.value);
    };

    const handleSubmit = (event) => {
        if (event) event.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    // Автоматический resize textarea (до 8 строк)
    const handleInput = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const maxHeight = MAX_ROWS * ROW_HEIGHT;
            textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
        }
    };

    // Enter — отправка, Shift+Enter — перенос строки
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="w-full flex justify-center px-2 pb-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-3xl flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-2 shadow-lg"
            >
                <div className="px-2">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleChange}
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder="Задавай вопрос здесь..."
                        rows={1}
                        className="w-full resize-none bg-transparent text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none border-none focus:ring-0 focus:outline-none max-h-[224px] min-h-[28px] overflow-y-auto input-custom-scrollbar mb-2 mt-2"
                        style={{ boxShadow: 'none' }}
                    />
                </div>
                <div className="flex flex-row items-end justify-between w-full">
                    <button
                        type="button"
                        className="flex items-center gap-1 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors px-2 py-1 rounded-lg text-sm font-medium"
                        tabIndex={-1}
                        disabled
                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    >
                        <Paperclip size={18} />
                        <span className="hidden sm:inline">Прикрепить файл</span>
                    </button>
                    <button
                        type="submit"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!message.trim()}
                        tabIndex={0}
                        aria-label="Отправить"
                    >
                        <ArrowUp size={22} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatInput;
