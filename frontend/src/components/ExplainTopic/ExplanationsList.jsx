import React from 'react';
import { Trash2 } from 'lucide-react';

const ExplanationsList = ({ explanations, loadExplanation, setShowHistory, deleteExplanation }) => (
    <div className="flex flex-col gap-2 max-h-72 overflow-y-auto custom-scrollbar">
        {Object.entries(explanations).length === 0 && (
            <div className="text-center text-[var(--color-muted)] py-8">Пока нет сохранённых объяснений</div>
        )}
        {Object.entries(explanations).map(([id, explanation]) => (
            <div
                key={id}
                className="flex items-center justify-between rounded-lg px-4 py-3 shadow-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] min-h-[56px] transition cursor-pointer hover:bg-[var(--color-surface)] hover:border-[var(--color-primary)]"
                onClick={() => { loadExplanation(Number(id)); setShowHistory(false); }}
            >
                <div className="truncate">
                    <span className="font-medium">{explanation.subject}</span>: <span className="text-sm opacity-80">{explanation.topic}</span>
                </div>
                <button
                    onClick={e => { e.stopPropagation(); deleteExplanation(Number(id)); }}
                    className="ml-2 text-[var(--color-error)] transition cursor-pointer hover:text-red-400"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        ))}
    </div>
);

export default ExplanationsList; 