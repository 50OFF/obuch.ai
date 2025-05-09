import React from 'react';

const Loader = () => {
    return (
        <div className="p-4 rounded-2xl border border-[var(--color-border)] mt-8 bg-[var(--color-background)] text-[var(--color-text)] flex items-center justify-center">
            <div
                className="w-8 h-8 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"
            ></div>
        </div>
    );
};

export default Loader;
