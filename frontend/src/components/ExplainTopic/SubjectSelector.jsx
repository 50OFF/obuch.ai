import React from 'react';
import { motion } from 'framer-motion';

const SubjectSelector = ({ subjects, userGrade, onSelectSubject, iconComponents }) => (
    <div className="w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-8 text-center text-[var(--color-text)]">Выберите предмет</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {subjects[userGrade]?.map((subject) => {
                const IconComponent = iconComponents[subject.icon];
                return (
                    <motion.button
                        key={subject.id}
                        initial={{ boxShadow: "0 0 0 0 var(--color-primary)" }}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 24px 0 var(--color-primary)" }}
                        transition={{ type: 'spring', stiffness: 300, damping: 24, boxShadow: { duration: 0.1 } }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onSelectSubject(subject)}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] cursor-pointer"
                    >
                        <div className="text-4xl mb-2 text-[var(--color-primary)]">
                            {IconComponent && <IconComponent size={40} />}
                        </div>
                        <span className="font-semibold text-lg text-center">{subject.name}</span>
                    </motion.button>
                );
            })}
        </div>
    </div>
);

export default SubjectSelector; 