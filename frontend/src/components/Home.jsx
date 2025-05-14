import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, MessageCircle } from 'lucide-react';

const sections = [
    {
        id: 'task_help',
        name: 'Помощь с заданием',
        description: 'Прикрепи задание — получи помощь.',
        icon: BookOpen,
    },
    {
        id: 'explain',
        name: 'Объяснить тему',
        description: 'Выбери тему, которую хочешь понять лучше.',
        icon: Brain,
    },
    {
        id: 'chat',
        name: 'Чат с репетитором',
        description: 'Общайся с ИИ как с личным репетитором.',
        icon: MessageCircle,
    },
];

const Home = ({ onSectionChange }) => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-6xl px-4">
                <h2 className="text-3xl font-bold mb-12 text-center text-[var(--color-text)]">
                    Чем я могу помочь?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {sections.map((section) => (
                        <motion.button
                            key={section.id}
                            initial={{
                                boxShadow: '0 0 0 0 var(--color-primary)',
                            }}
                            whileHover={{
                                scale: 1.05,
                                boxShadow: '0 0 24px 0 var(--color-primary)',
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 24,
                                boxShadow: { duration: 0.1 },
                            }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onSectionChange(section.id)}
                            className="flex flex-col justify-between p-6 min-h-[200px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] cursor-pointer text-left hover:shadow-md transition-shadow"
                        >
                            <div className="text-[var(--color-primary)] mb-4">
                                {section.icon && <section.icon size={36} />}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">
                                    {section.name}
                                </h3>
                                <p className="text-sm opacity-80">
                                    {section.description}
                                </p>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
