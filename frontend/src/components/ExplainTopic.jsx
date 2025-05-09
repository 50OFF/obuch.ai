import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import {
    BookOpen,
    FlaskConical,
    Atom,
    Calculator,
    Globe,
    Languages,
    BrainCog,
    BookUser,
    ArrowLeft,
    Trash2,
    MessageSquarePlus,
    History
} from 'lucide-react';
import useExplainTopic from '../hooks/useExplainTopic';
import ChatMessage from './ChatMessage';
import Loader from './Loader';
import TopBar from './ExplainTopic/TopBar';
import HistoryModal from './ExplainTopic/HistoryModal';
import SubjectSelector from './ExplainTopic/SubjectSelector';
import TopicInput from './ExplainTopic/TopicInput';
import ExplanationView from './ExplainTopic/ExplanationView';

const color1 = import.meta.env.VITE_COLOR1;
const color2 = import.meta.env.VITE_COLOR2;
const color3 = import.meta.env.VITE_COLOR3;
const color4 = import.meta.env.VITE_COLOR4;
const color5 = import.meta.env.VITE_COLOR5;

// Большой объект с предметами
const subjects = {
  "1": [
    { "id": "math", "name": "Математика", "icon": "Calculator", "topics": ["Счёт до 20", "Сложение и вычитание", "Числа и цифры"] },
    { "id": "russian", "name": "Русский язык", "icon": "Languages", "topics": ["Алфавит", "Слоги", "Предложения"] },
    { "id": "literature", "name": "Литература", "icon": "BookOpen", "topics": ["Сказки", "Стихи", "Чтение по ролям"] },
    { "id": "world", "name": "Окружающий мир", "icon": "Globe", "topics": ["Природа", "Человек и общество", "Времена года"] }
  ],
  "2": [
    { "id": "math", "name": "Математика", "icon": "Calculator", "topics": ["Счёт до 100", "Умножение и деление", "Числовые выражения"] },
    { "id": "russian", "name": "Русский язык", "icon": "Languages", "topics": ["Части речи", "Словарные слова", "Словосочетания"] },
    { "id": "literature", "name": "Литература", "icon": "BookOpen", "topics": ["Проза", "Поэзия", "Русские народные сказки"] },
    { "id": "world", "name": "Окружающий мир", "icon": "Globe", "topics": ["Природные явления", "Растения и животные", "Человек и здоровье"] }
  ],
  "3": [
    { "id": "math", "name": "Математика", "icon": "Calculator", "topics": ["Письменные вычисления", "Доли", "Задачи на движение"] },
    { "id": "russian", "name": "Русский язык", "icon": "Languages", "topics": ["Орфография", "Морфемика", "Словообразование"] },
    { "id": "literature", "name": "Литература", "icon": "BookOpen", "topics": ["Рассказы", "Стихи", "Анализ текста"] },
    { "id": "world", "name": "Окружающий мир", "icon": "Globe", "topics": ["География родного края", "История семьи", "Основы экологии"] }
  ],
  "4": [
    { "id": "math", "name": "Математика", "icon": "Calculator", "topics": ["Площади и периметры", "Временные промежутки", "Математические выражения"] },
    { "id": "russian", "name": "Русский язык", "icon": "Languages", "topics": ["Части речи", "Синтаксис", "Стили речи"] },
    { "id": "literature", "name": "Литература", "icon": "BookOpen", "topics": ["Произведения русских классиков", "План текста", "Темы и идеи"] },
    { "id": "world", "name": "Окружающий мир", "icon": "Globe", "topics": ["Природные зоны", "Исторические события", "Человек и техника"] }
  ],
  "5": [
    { "id": "math", "name": "Математика", "icon": "Calculator", "topics": ["Делимость чисел", "Десятичные дроби", "Геометрические фигуры"] },
    { "id": "russian", "name": "Русский язык", "icon": "Languages", "topics": ["Синтаксис", "Фонетика", "Морфология"] },
    { "id": "literature", "name": "Литература", "icon": "BookOpen", "topics": ["Эпические произведения", "Герои и образы", "Сравнительный анализ"] },
    { "id": "history", "name": "История", "icon": "BookUser", "topics": ["Древний мир", "Культура древних цивилизаций", "Великие географические открытия"] },
    { "id": "geography", "name": "География", "icon": "Globe", "topics": ["Материки и океаны", "Климат", "Население мира"] }
  ],
  "6": [
    { "id": "math", "name": "Математика", "icon": "Calculator", "topics": ["Дроби", "Уравнения", "Площади и объёмы"] },
    { "id": "russian", "name": "Русский язык", "icon": "Languages", "topics": ["Орфография", "Лексика", "Члены предложения"] },
    { "id": "literature", "name": "Литература", "icon": "BookOpen", "topics": ["Анализ произведений", "Тематика литературы", "Авторы и жанры"] },
    { "id": "history", "name": "История", "icon": "BookUser", "topics": ["Средние века", "Крестоносцы", "Русское государство"] },
    { "id": "geography", "name": "География", "icon": "Globe", "topics": ["Природные зоны", "Географические карты", "Полезные ископаемые"] },
    { "id": "biology", "name": "Биология", "icon": "BrainCog", "topics": ["Растения", "Животные", "Царства живой природы"] }
  ],
  "7": [
    { "id": "math", "name": "Математика", "icon": "Calculator", "topics": ["Уравнения", "Пропорции", "Треугольники"] },
    { "id": "russian", "name": "Русский язык", "icon": "Languages", "topics": ["Типы речи", "Синтаксические конструкции", "Орфографические нормы"] },
    { "id": "literature", "name": "Литература", "icon": "BookOpen", "topics": ["Анализ текста", "Сюжет и композиция", "Образы героев"] },
    { "id": "history", "name": "История", "icon": "BookUser", "topics": ["Новое время", "Просвещение", "История России"] },
    { "id": "geography", "name": "География", "icon": "Globe", "topics": ["География России", "Климатические пояса", "Природные ресурсы"] },
    { "id": "biology", "name": "Биология", "icon": "BrainCog", "topics": ["Клетка", "Органы человека", "Система кровообращения"] },
    { "id": "physics", "name": "Физика", "icon": "Atom", "topics": ["Скорость и путь", "Сила и давление", "Законы Ньютона"] },
    { "id": "chemistry", "name": "Химия", "icon": "FlaskConical", "topics": ["Химические реакции", "Периодическая таблица", "Элементы и их свойства"] }
  ],
  "8": [
    { "id": "math", "name": "Математика", "icon": "Calculator", "topics": ["Квадратные уравнения", "Функции", "Параболы"] },
    { "id": "russian", "name": "Русский язык", "icon": "Languages", "topics": ["Сложные предложения", "Пунктуация", "Стили речи"] },
    { "id": "literature", "name": "Литература", "icon": "BookOpen", "topics": ["Русская поэзия", "Лирика", "Критический анализ"] },
    { "id": "history", "name": "История", "icon": "BookUser", "topics": ["XIX век", "Великие реформы", "История России"] },
    { "id": "geography", "name": "География", "icon": "Globe", "topics": ["Экономика мира", "Регионы России", "Глобальные проблемы"] },
    { "id": "biology", "name": "Биология", "icon": "BrainCog", "topics": ["Генетика", "Классификация организмов", "Биосфера"] },
    { "id": "physics", "name": "Физика", "icon": "Atom", "topics": ["Механика", "Электричество", "Энергия"] },
    { "id": "chemistry", "name": "Химия", "icon": "FlaskConical", "topics": ["Химические реакции", "Периодическая таблица", "Элементы и их свойства"] }
  ],
  "9": [
    { "id": "math", "name": "Математика", "icon": "Calculator", "topics": ["Неравенства", "Системы уравнений", "Тригонометрия"] },
    { "id": "russian", "name": "Русский язык", "icon": "Languages", "topics": ["Орфоэпия", "Функциональные стили", "Анализ текстов"] },
    { "id": "literature", "name": "Литература", "icon": "BookOpen", "topics": ["Русская литература XIX века", "Литературные направления", "Анализ художественных средств"] },
    { "id": "history", "name": "История", "icon": "BookUser", "topics": ["История XX века", "Мировые войны", "История СССР"] },
    { "id": "geography", "name": "География", "icon": "Globe", "topics": ["Природопользование", "Глобализация", "Ресурсы и экология"] },
    { "id": "biology", "name": "Биология", "icon": "BrainCog", "topics": ["Эволюция", "Экология", "Строение клетки"] },
    { "id": "physics", "name": "Физика", "icon": "Atom", "topics": ["Оптика", "Термодинамика", "Электромагнетизм"] },
    { "id": "chemistry", "name": "Химия", "icon": "FlaskConical", "topics": ["Органическая химия", "Растворы", "Кислоты и основания"] }
  ],
  "10": [
    { "id": "math", "name": "Математика", "icon": "Calculator", "topics": ["Производные", "Логарифмы", "Пределы"] },
    { "id": "russian", "name": "Русский язык", "icon": "Languages", "topics": ["Нормы языка", "Лингвистический анализ", "Функции языка"] },
    { "id": "literature", "name": "Литература", "icon": "BookOpen", "topics": ["Зарубежная литература", "Анализ произведений", "Авторская позиция"] },
    { "id": "history", "name": "История", "icon": "BookUser", "topics": ["История России XX века", "Революции", "Холодная война"] },
    { "id": "geography", "name": "География", "icon": "Globe", "topics": ["География России", "Мировая экономика", "Геополитика"] },
    { "id": "biology", "name": "Биология", "icon": "BrainCog", "topics": ["Иммунная система", "Нервная система", "Генетика человека"] },
    { "id": "physics", "name": "Физика", "icon": "Atom", "topics": ["Квантовая физика", "Радиоактивность", "Электродинамика"] },
    { "id": "chemistry", "name": "Химия", "icon": "FlaskConical", "topics": ["Органика", "Химические реакции", "Количественный анализ"] }
  ],
  "11": [
    { "id": "math", "name": "Математика", "icon": "Calculator", "topics": ["Интегралы", "Сложные уравнения", "Параметры"] },
    { "id": "russian", "name": "Русский язык", "icon": "Languages", "topics": ["Подготовка к ЕГЭ", "Разбор сочинений", "Языковые нормы"] },
    { "id": "literature", "name": "Литература", "icon": "BookOpen", "topics": ["Русская классика", "Современная литература", "Сопоставление произведений"] },
    { "id": "history", "name": "История", "icon": "BookUser", "topics": ["История РФ", "ЕГЭ по истории", "История мира"] },
    { "id": "geography", "name": "География", "icon": "Globe", "topics": ["Экономическая география", "География населения", "Регионоведение"] },
    { "id": "biology", "name": "Биология", "icon": "BrainCog", "topics": ["Репродуктивная система", "Физиология", "Биотехнологии"] },
    { "id": "physics", "name": "Физика", "icon": "Atom", "topics": ["Подготовка к ЕГЭ", "Теория относительности", "Современные теории"] },
    { "id": "chemistry", "name": "Химия", "icon": "FlaskConical", "topics": ["Применение химии", "Химия окружающей среды", "Подготовка к ЕГЭ"] }
  ]
}

// Добавляем объект для маппинга имен иконок на компоненты
const iconComponents = {
    Calculator,
    Languages,
    BookOpen,
    Globe,
    BookUser,
    BrainCog,
    Atom,
    FlaskConical,
};

const ExplainTopic = () => {
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [topic, setTopic] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const userGrade = localStorage.getItem('grade') || '1';

    const {
        explanation,
        prevExplanation,
        explanationId,
        currentTopic,
        explanations,
        isLoading,
        error,
        explainTopic,
        explainMore,
        clearExplanation,
        deleteExplanation,
        loadExplanation
    } = useExplainTopic();

    // --- UI: Выбор предмета ---
    if (!selectedSubject && !explanation) {
        return (
            <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-background)' }}>
                <TopBar onShowHistory={() => setShowHistory(true)} />
                <HistoryModal
                    show={showHistory}
                    onClose={() => setShowHistory(false)}
                    explanations={explanations}
                    loadExplanation={loadExplanation}
                    deleteExplanation={deleteExplanation}
                />
                <div className="flex-1 flex items-center justify-center">
                    <SubjectSelector
                        subjects={subjects}
                        userGrade={userGrade}
                        onSelectSubject={subject => {
                            setSelectedSubject(subject);
                            setTopic('');
                        }}
                        iconComponents={iconComponents}
                    />
                </div>
            </div>
        );
    }

    // --- UI: Ввод темы ---
    if (selectedSubject && !explanation) {
        const suggestions = topic.trim() === ''
            ? selectedSubject.topics
            : selectedSubject.topics.filter(t => t.toLowerCase().includes(topic.toLowerCase()));
        return (
            <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-background)' }}>
                <TopBar onShowHistory={() => setShowHistory(true)} />
                <HistoryModal
                    show={showHistory}
                    onClose={() => setShowHistory(false)}
                    explanations={explanations}
                    loadExplanation={loadExplanation}
                    deleteExplanation={deleteExplanation}
                />
                <div className="flex-1 flex items-center justify-center">
                    <TopicInput
                        selectedSubject={selectedSubject}
                        topic={topic}
                        setTopic={setTopic}
                        isLoading={isLoading}
                        error={error}
                        suggestions={suggestions}
                        onSubmit={e => {
                            e.preventDefault();
                            if (selectedSubject && topic.trim()) {
                                explainTopic(selectedSubject.name, topic.trim());
                                setTopic('');
                            }
                        }}
                        onBack={() => { setSelectedSubject(null); setTopic(''); }}
                        onSuggestionClick={setTopic}
                    />
                </div>
            </div>
        );
    }

    // --- UI: Загрузка ---
    if (isLoading && !explanation) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]" style={{ background: 'var(--color-background)' }}>
                <Loader />
                <HistoryModal
                    show={showHistory}
                    onClose={() => setShowHistory(false)}
                    explanations={explanations}
                    loadExplanation={loadExplanation}
                    deleteExplanation={deleteExplanation}
                />
            </div>
        );
    }

    // --- UI: Просмотр объяснения ---
    if (explanation) {
        return (
            <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-background)' }}>
                <TopBar onShowHistory={() => setShowHistory(true)} />
                <HistoryModal
                    show={showHistory}
                    onClose={() => setShowHistory(false)}
                    explanations={explanations}
                    loadExplanation={loadExplanation}
                    deleteExplanation={deleteExplanation}
                />
                <div className="flex-1 flex items-center justify-center">
                    <ExplanationView
                        currentTopic={currentTopic}
                        explanation={explanation}
                        explanationId={explanationId}
                        isLoading={isLoading}
                        error={error}
                        onBack={() => { clearExplanation(); setSelectedSubject(null); setTopic(''); }}
                        onDelete={() => {
                            if (window.confirm('Вы уверены, что хотите удалить это объяснение?')) {
                                deleteExplanation(explanationId);
                                clearExplanation();
                                setSelectedSubject(null);
                                setTopic('');
                            }
                        }}
                        onExplainMore={() => explainMore(currentTopic.subject, currentTopic.topic)}
                    />
                </div>
            </div>
        );
    }

    return null;
};

export default ExplainTopic;
