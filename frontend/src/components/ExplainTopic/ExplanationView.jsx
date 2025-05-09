import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, MessageSquarePlus } from 'lucide-react';
import ChatMessage from '../ChatMessage';

const ExplanationView = ({
    currentTopic,
    explanation,
    explanationId,
    isLoading,
    error,
    onBack,
    onDelete,
    onExplainMore
}) => (
    <motion.div
        key="explanation-view"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl rounded-2xl p-8 shadow-md flex flex-col gap-6 relative border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
    >
        <div className="flex items-center justify-between mb-2">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-[var(--color-muted)] transition-colors cursor-pointer hover:bg-[var(--color-primary-hover)] rounded-lg px-2 py-1"
            >
                <ArrowLeft size={22} />
                <span>Назад</span>
            </button>
            {explanationId && (
                <button
                    onClick={onDelete}
                    className="flex items-center gap-2 text-[var(--color-error)] transition cursor-pointer hover:text-red-400 rounded-lg px-2 py-1"
                >
                    <Trash2 size={20} />
                    <span>Удалить</span>
                </button>
            )}
        </div>
        <div className="mb-2 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]">
            <h2 className="text-xl font-semibold mb-1 text-[var(--color-text)]">{currentTopic?.subject}</h2>
            <p className="text-base opacity-90 text-[var(--color-muted)]">{currentTopic?.topic}</p>
        </div>
        <div className="overflow-y-auto custom-scrollbar rounded-lg px-2 py-2 border border-[var(--color-border)] bg-[var(--color-surface)]" style={{ maxHeight: '40vh' }}>
            <ChatMessage
                message={explanation}
                backgroundColor={'var(--color-surface)'}
                textColor={'var(--color-text)'}
            />
        </div>
        <div className="flex gap-3 mt-2">
            <button
                onClick={onExplainMore}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium bg-[var(--color-primary)] text-white cursor-pointer hover:bg-[var(--color-primary-hover)]"
            >
                <MessageSquarePlus size={20} />
                <span>{isLoading ? 'Загрузка...' : 'Объяснить подробнее'}</span>
            </button>
        </div>
        {error && <div className="text-[var(--color-error)] text-center mt-2">{error}</div>}
    </motion.div>
);

export default ExplanationView; 