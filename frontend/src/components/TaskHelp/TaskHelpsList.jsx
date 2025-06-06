import React from 'react';
import { Trash2 } from 'lucide-react';

const TaskHelpsList = ({
    taskHelps,
    loadTaskHelp,
    setShowHistory,
    deleteTaskHelp,
}) => (
    <div className="flex flex-col gap-2 max-h-72 overflow-y-auto custom-scrollbar">
        {Object.entries(taskHelps).length === 0 && (
            <div className="text-center text-[var(--color-muted)] py-8">
                Пока нет сохранённых объяснений
            </div>
        )}
        {Object.entries(taskHelps).map(([id, taskHelp]) => (
            <div
                key={id}
                className="flex items-center justify-between rounded-lg px-4 py-3 shadow-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] min-h-[56px] transition cursor-pointer hover:bg-[var(--color-surface)] hover:border-[var(--color-primary)]"
                onClick={() => {
                    loadTaskHelp(Number(id));
                    setShowHistory(false);
                }}
            >
                <div className="truncate">
                    <span className="font-medium">{taskHelp.question}</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteTaskHelp(Number(id));
                    }}
                    className="ml-2 text-[var(--color-error)] transition cursor-pointer hover:text-red-400"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        ))}
    </div>
);

export default TaskHelpsList;
