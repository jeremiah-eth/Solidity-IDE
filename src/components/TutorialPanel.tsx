import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { BookOpen, ChevronRight, CheckCircle, Clock, Award, Lightbulb } from 'lucide-react';
import { getAllTutorials, getTutorial, markLessonCompleted, type Tutorial, type Lesson } from '../utils/tutorialSystem';

interface TutorialPanelProps {
    onLoadCode: (code: string) => void;
}

export const TutorialPanel: React.FC<TutorialPanelProps> = ({ onLoadCode }) => {
    const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [showHints, setShowHints] = useState(false);
    const [showSolution, setShowSolution] = useState(false);

    const tutorials = getAllTutorials();
    const currentLesson = selectedTutorial?.lessons[currentLessonIndex];

    const handleSelectTutorial = (tutorial: Tutorial) => {
        setSelectedTutorial(tutorial);
        setCurrentLessonIndex(0);
        setShowHints(false);
        setShowSolution(false);
        if (tutorial.lessons[0]) {
            onLoadCode(tutorial.lessons[0].code);
        }
    };

    const handleNextLesson = () => {
        if (selectedTutorial && currentLessonIndex < selectedTutorial.lessons.length - 1) {
            const nextIndex = currentLessonIndex + 1;
            const nextLesson = selectedTutorial.lessons[nextIndex];
            if (nextLesson) {
                setCurrentLessonIndex(nextIndex);
                setShowHints(false);
                setShowSolution(false);
                onLoadCode(nextLesson.code);

                // Mark current lesson as completed
                if (currentLesson) {
                    markLessonCompleted(selectedTutorial.id, currentLesson.id);
                }
            }
        }
    };

    const handleLoadSolution = () => {
        if (currentLesson?.solution) {
            onLoadCode(currentLesson.solution);
            setShowSolution(true);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'text-green-400 bg-green-900/20';
            case 'intermediate': return 'text-yellow-400 bg-yellow-900/20';
            case 'advanced': return 'text-red-400 bg-red-900/20';
            default: return 'text-gray-400 bg-gray-800/20';
        }
    };

    if (!selectedTutorial) {
        return (
            <GlassCard className="flex flex-col h-full bg-gray-900">
                <div className="flex items-center space-x-2 px-4 py-2 border-b border-gray-700 bg-gray-800/50">
                    <BookOpen size={16} className="text-purple-400" />
                    <span className="text-sm font-medium text-gray-300">Tutorials</span>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-3">
                    {tutorials.map(tutorial => (
                        <button
                            key={tutorial.id}
                            onClick={() => handleSelectTutorial(tutorial)}
                            className="w-full text-left p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 rounded transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-sm font-semibold text-white">{tutorial.title}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(tutorial.difficulty)}`}>
                                    {tutorial.difficulty}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">{tutorial.description}</p>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span className="flex items-center space-x-1">
                                    <Clock size={12} />
                                    <span>{tutorial.estimatedTime} min</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                    <BookOpen size={12} />
                                    <span>{tutorial.lessons.length} lessons</span>
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="flex flex-col h-full bg-gray-900">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800/50">
                <button
                    onClick={() => setSelectedTutorial(null)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                >
                    ← Back to Tutorials
                </button>
                <span className="text-xs text-gray-400">
                    Lesson {currentLessonIndex + 1} of {selectedTutorial.lessons.length}
                </span>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* Lesson Header */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-1">{currentLesson?.title}</h2>
                    <p className="text-sm text-gray-400">{currentLesson?.description}</p>
                </div>

                {/* Lesson Content */}
                <div className="bg-gray-800/30 p-4 rounded border border-gray-700/50">
                    <div className="prose prose-invert prose-sm max-w-none">
                        {currentLesson?.content.split('\n').map((line, idx) => {
                            if (line.startsWith('# ')) {
                                return <h3 key={idx} className="text-white font-bold mt-4 mb-2">{line.substring(2)}</h3>;
                            } else if (line.startsWith('## ')) {
                                return <h4 key={idx} className="text-gray-200 font-semibold mt-3 mb-1">{line.substring(3)}</h4>;
                            } else if (line.startsWith('- ')) {
                                return <li key={idx} className="text-gray-300 text-sm ml-4">{line.substring(2)}</li>;
                            } else if (line.trim()) {
                                return <p key={idx} className="text-gray-300 text-sm mb-2">{line}</p>;
                            }
                            return null;
                        })}
                    </div>
                </div>

                {/* Hints */}
                {currentLesson?.hints && currentLesson.hints.length > 0 && (
                    <div className="bg-blue-900/20 border border-blue-800 rounded p-4">
                        <button
                            onClick={() => setShowHints(!showHints)}
                            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-2"
                        >
                            <Lightbulb size={16} />
                            <span className="text-sm font-semibold">
                                {showHints ? 'Hide Hints' : 'Show Hints'}
                            </span>
                        </button>
                        {showHints && (
                            <ul className="space-y-1 mt-2">
                                {currentLesson.hints.map((hint, idx) => (
                                    <li key={idx} className="text-sm text-blue-300 ml-4">• {hint}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2">
                    {currentLesson?.solution && (
                        <button
                            onClick={handleLoadSolution}
                            className="px-3 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors"
                        >
                            {showSolution ? 'Solution Loaded' : 'Load Solution'}
                        </button>
                    )}

                    {currentLessonIndex < selectedTutorial.lessons.length - 1 && (
                        <button
                            onClick={handleNextLesson}
                            className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                        >
                            <span>Next Lesson</span>
                            <ChevronRight size={14} />
                        </button>
                    )}

                    {currentLessonIndex === selectedTutorial.lessons.length - 1 && (
                        <div className="flex items-center space-x-2 text-green-400">
                            <Award size={16} />
                            <span className="text-sm font-semibold">Tutorial Complete!</span>
                        </div>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};

export default TutorialPanel;
