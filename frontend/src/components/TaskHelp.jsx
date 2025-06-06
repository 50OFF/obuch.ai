import React, { useState } from 'react';
import { Loader2, ImagePlus, X, History } from 'lucide-react';
import useTaskHelp from '../hooks/useTaskHelp';
import ChatMessage from './ChatMessage';
import ToggleSelector from './ToggleSelector';
import HistoryModal from './TaskHelp/HistoryModal'; // Импортируем HistoryModal

const TaskHelp = () => {
    const [question, setQuestion] = useState('');
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [mode, setMode] = useState('explain');
    const [showHistory, setShowHistory] = useState(false); // Состояние для отображения истории
    const [history, setHistory] = useState([]); // Состояние для хранения истории запросов

    const {
        taskHelps,
        loadTaskHelp,
        deleteTaskHelp,
        taskHelpResult,
        isLoading,
        error,
        requestTaskHelp,
        clearTaskHelp,
    } = useTaskHelp();

    const modeOptions = [
        { label: 'Объяснить', value: 'explain' },
        { label: 'Решить', value: 'solve' },
    ];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreviewUrl(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!question.trim() && !image) {
            alert('Пожалуйста, введите задание или загрузите изображение.');
            return;
        }

        const result = await requestTaskHelp({
            mode,
            text: question,
            file: image,
        });

        // Добавляем запрос в историю
        setHistory([...history, { question, image }]);
        setQuestion('');
        setImage(null);
        setPreviewUrl(null);
    };

    const handleReset = () => {
        clearTaskHelp();
        setQuestion('');
        setImage(null);
        setPreviewUrl(null);
    };

    if (!taskHelpResult) {
        return (
            <div className="min-h-screen flex flex-col px-4 bg-[var(--color-background)]">
                <div className="w-full flex justify-end items-center px-6 pt-6">
                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg shadow border border-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-primary)] transition cursor-pointer"
                        onClick={() => setShowHistory(true)}
                    >
                        <History size={20} />
                        <span className="font-medium">История</span>
                    </button>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-xl flex flex-col gap-4 p-6 rounded-4xl shadow-2xl text-[var(--color-text)] bg-[var(--color-surface)]"
                    >
                        <ToggleSelector
                            options={modeOptions}
                            value={mode}
                            onChange={setMode}
                        />

                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors text-[var(--color-text)] bg-transparent"
                            placeholder="Напиши сюда задание..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />

                        <div className="flex items-center justify-between gap-4">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-primary)]">
                                <ImagePlus size={18} />
                                Загрузить изображение
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-[var(--color-primary)] text-black transition-colors cursor-pointer hover:bg-[var(--color-primary-hover)] ${
                                    isLoading ? 'opacity-70' : ''
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin w-4 h-4" />
                                        Думаю...
                                    </>
                                ) : (
                                    <>Отправить</>
                                )}
                            </button>
                        </div>

                        {previewUrl && (
                            <div className="relative mt-2 rounded-xl overflow-hidden w-full">
                                <img
                                    src={previewUrl}
                                    alt="Превью"
                                    className="w-full h-auto object-contain rounded-xl border border-[var(--color-border)]"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 bg-white/80 backdrop-blur-md rounded-full p-1"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="text-sm text-[var(--color-error)]">
                                {error}
                            </div>
                        )}
                    </form>
                </div>

                {/* Модальное окно для истории */}
                <HistoryModal
                    show={showHistory}
                    onClose={() => setShowHistory(false)}
                    taskHelps={taskHelps} // Передаем историю запросов
                    loadTaskHelp={loadTaskHelp} // Реализуйте логику загрузки объяснения
                    deleteTaskHelp={deleteTaskHelp} // Реализуйте логику удаления объяснения
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-background)] text-[var(--color-text)]">
            <div className="w-full max-w-2xl flex flex-col gap-4 p-6 rounded-4xl shadow-xl bg-[var(--color-surface)]">
                <ChatMessage
                    message={taskHelpResult.content}
                    backgroundColor={'var(--color-surface)'}
                    textColor={'var(--color-text)'}
                />
                {previewUrl && (
                    <img
                        src={previewUrl}
                        alt="Задание"
                        className="w-full h-auto rounded-xl border border-[var(--color-border)]"
                    />
                )}
                <div className="flex justify-end">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 rounded-full font-medium bg-[var(--color-primary)] text-black transition-colors cursor-pointer hover:bg-[var(--color-primary-hover)]"
                    >
                        Назад
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskHelp;
