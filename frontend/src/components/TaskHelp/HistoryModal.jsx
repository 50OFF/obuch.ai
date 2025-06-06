import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TaskHelpsList from './TaskHelpsList';

const HistoryModal = ({
    show,
    onClose,
    taskHelps,
    loadTaskHelp,
    deleteTaskHelp,
}) => {
    if (!show) return null;
    return ReactDOM.createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/10"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 40 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 40 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="rounded-2xl shadow-2xl p-6 w-full max-w-md relative border border-[var(--color-border)] bg-[var(--color-surface)]"
                >
                    <button
                        className="absolute top-3 right-3 text-[var(--color-muted)] hover:text-[var(--color-text)] transition cursor-pointer"
                        onClick={onClose}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"
                            />
                        </svg>
                    </button>
                    <h3 className="text-xl font-bold mb-4 text-center text-[var(--color-text)]">
                        История помощи
                    </h3>
                    <TaskHelpsList
                        taskHelps={taskHelps}
                        loadTaskHelp={loadTaskHelp}
                        setShowHistory={onClose}
                        deleteTaskHelp={deleteTaskHelp}
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default HistoryModal;
