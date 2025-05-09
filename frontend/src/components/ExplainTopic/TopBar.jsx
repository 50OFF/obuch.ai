import React from 'react';
import { History } from 'lucide-react';

const TopBar = ({ onShowHistory }) => (
    <div className="w-full flex justify-end items-center px-6 pt-6">
        <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg shadow border border-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-primary)] transition cursor-pointer"
            onClick={onShowHistory}
        >
            <History size={20} />
            <span className="font-medium">История</span>
        </button>
    </div>
);

export default TopBar; 