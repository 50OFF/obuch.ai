import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquarePlus } from 'lucide-react';

const TopicInput = ({
    selectedSubject,
    topic,
    setTopic,
    isLoading,
    error,
    suggestions,
    onSubmit,
    onBack,
    onSuggestionClick
}) => (
    <motion.div
        key="topic-input"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg rounded-2xl p-8 shadow-md flex flex-col gap-6 relative border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
    >
        <button
            onClick={onBack}
            className="absolute left-4 top-4 p-2 rounded-lg transition-colors cursor-pointer hover:bg-[var(--color-primary-hover)]"
        >
            <ArrowLeft size={28} />
        </button>
        <h2 className="text-2xl font-bold mb-2 text-center">{selectedSubject.name}</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-4">
            <label htmlFor="topic" className="block text-base font-medium mb-1 text-[var(--color-muted)]">Введите тему для объяснения</label>
            <input
                type="text"
                id="topic"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors text-[var(--color-text)] bg-[var(--color-surface)]"
                placeholder="Например: Квадратные уравнения"
            />
            {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {suggestions.map((suggestion, idx) => (
                        <button
                            type="button"
                            key={idx}
                            onClick={() => onSuggestionClick(suggestion)}
                            className="px-3 py-1 rounded-lg bg-[var(--color-background)] text-[var(--color-text)] border border-[var(--color-border)] text-sm transition-colors cursor-pointer hover:border-[var(--color-primary)]"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
            <button
                type="submit"
                disabled={!topic.trim() || isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors mt-4 font-medium bg-[var(--color-primary)] text-white cursor-pointer hover:bg-[var(--color-primary-hover)]"
            >
                <MessageSquarePlus size={20} />
                <span>{isLoading ? 'Загрузка...' : 'Объяснить тему'}</span>
            </button>
        </form>
        {error && <div className="text-[var(--color-error)] text-center mt-2">{error}</div>}
    </motion.div>
);

export default TopicInput; 