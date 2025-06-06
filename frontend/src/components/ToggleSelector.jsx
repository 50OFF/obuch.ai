import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const ToggleSelector = ({ options, value, onChange }) => {
    const containerRef = useRef(null);
    const buttonRefs = useRef([]);
    const [selectorStyle, setSelectorStyle] = useState({ left: 0, width: 0 });

    useEffect(() => {
        const index = options.findIndex((opt) => opt.value === value);
        const btn = buttonRefs.current[index];
        if (btn && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();

            setSelectorStyle({
                left: btnRect.left - containerRect.left,
                width: btnRect.width,
            });
        }
    }, [value, options]);

    return (
        <div
            ref={containerRef}
            className="relative w-full rounded-full bg-[var(--color-border)] flex justify-between items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),inset_0_-2px_4px_rgba(255,255,255,0.05)] px-1 py-1"
        >
            {options.map((option, i) => (
                <button
                    type="button"
                    key={option.value}
                    ref={(el) => (buttonRefs.current[i] = el)}
                    onClick={() => onChange(option.value)}
                    className={`flex-1 relative z-10 py-2 text-m font-semibold transition-colors duration-200 cursor-pointer ${
                        value === option.value
                            ? 'text-black'
                            : 'text-[var(--color-text)]'
                    }`}
                >
                    {option.label}
                </button>
            ))}

            <motion.div
                className="absolute top-1 bottom-1 rounded-full bg-[var(--color-primary)] shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
                animate={selectorStyle}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 40,
                }}
            />
        </div>
    );
};

export default ToggleSelector;
