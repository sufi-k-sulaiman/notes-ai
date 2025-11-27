import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { 
    X, Play, CheckCircle, Lock, Star, Trophy, Zap, Clock, 
    BookOpen, Video, FileText, HelpCircle, Award, Target,
    ChevronRight, ChevronLeft, Flame, Medal, Loader2, ArrowRight, Check,
    Maximize2, Minimize2
} from 'lucide-react';

const THEME = {
    primary: '#6B4EE6',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    success: '#10B981',
};

export default function CourseModal({ isOpen, onClose, topic, onComplete }) {
    const [view, setView] = useState('curriculum'); // 'curriculum' | 'lesson'
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [userXP, setUserXP] = useState(0);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [currentUnit, setCurrentUnit] = useState(null);
    const [lessonContent, setLessonContent] = useState(null);
    const [lessonLoading, setLessonLoading] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [showQuizResults, setShowQuizResults] = useState(false);
    const [expandedUnits, setExpandedUnits] = useState({});
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (isOpen && topic) {
            setView('curriculum');
            setCompletedLessons([]);
            setUserXP(0);
            setCourseData(null);
            setCurrentLesson(null);
            setLessonContent(null);
            generateCourseContent();
        }
    }, [isOpen, topic]);

    const generateCourseContent = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Create a course curriculum for "${topic.name}". Include 4 units with 4-5 lessons each. Mix video, reading, and quiz types.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        totalDuration: { type: "string" },
                        units: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    lessons: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string" },
                                                title: { type: "string" },
                                                type: { type: "string" },
                                                duration: { type: "string" },
                                                xp: { type: "number" }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const unitsWithIds = (response?.units || []).map((unit, uIndex) => ({
                ...unit,
                lessons: (unit.lessons || []).map((lesson, lIndex) => ({
                    ...lesson,
                    id: lesson.id || `u${uIndex}-l${lIndex}`,
                    xp: lesson.xp || 25 + (lIndex * 10)
                }))
            }));

            setCourseData({ ...response, units: unitsWithIds });
            setExpandedUnits({ 0: true });
        } catch (error) {
            console.error('Error:', error);
            // Fallback
            setCourseData({
                title: `${topic.name} Course`,
                description: `Learn ${topic.name} fundamentals`,
                totalDuration: '8 hours',
                units: [
                    {
                        title: 'Getting Started',
                        description: 'Introduction to basics',
                        lessons: [
                            { id: 'u0-l0', title: 'Welcome', type: 'video', duration: '5 min', xp: 25 },
                            { id: 'u0-l1', title: 'Core Concepts', type: 'reading', duration: '10 min', xp: 30 },
                            { id: 'u0-l2', title: 'Quiz', type: 'quiz', duration: '5 min', xp: 50 },
                        ]
                    },
                    {
                        title: 'Deep Dive',
                        description: 'Advanced concepts',
                        lessons: [
                            { id: 'u1-l0', title: 'Advanced Topics', type: 'video', duration: '15 min', xp: 40 },
                            { id: 'u1-l1', title: 'Practice', type: 'reading', duration: '10 min', xp: 35 },
                            { id: 'u1-l2', title: 'Assessment', type: 'quiz', duration: '10 min', xp: 60 },
                        ]
                    }
                ]
            });
            setExpandedUnits({ 0: true });
        } finally {
            setLoading(false);
        }
    };

    const loadLessonContent = async (lesson, unit) => {
        setCurrentLesson(lesson);
        setCurrentUnit(unit);
        setView('lesson');
        setLessonLoading(true);
        setQuizAnswers({});
        setShowQuizResults(false);

        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Create lesson content for "${lesson.title}" in ${topic.name}. ${lesson.type === 'quiz' ? 'Generate 4 multiple choice questions with 4 options each.' : 'Include introduction, key points, and summary.'}`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        introduction: { type: "string" },
                        content: { type: "string" },
                        keyPoints: { type: "array", items: { type: "string" } },
                        quiz: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    question: { type: "string" },
                                    options: { type: "array", items: { type: "string" } },
                                    correctIndex: { type: "number" }
                                }
                            }
                        },
                        summary: { type: "string" }
                    }
                }
            });
            setLessonContent(response);
        } catch (error) {
            setLessonContent({
                introduction: `Welcome to ${lesson.title}`,
                content: 'Lesson content is being prepared.',
                keyPoints: ['Key concept 1', 'Key concept 2', 'Key concept 3'],
                summary: 'Great progress!',
                quiz: lesson.type === 'quiz' ? [
                    { question: 'Sample question?', options: ['A', 'B', 'C', 'D'], correctIndex: 0 }
                ] : []
            });
        } finally {
            setLessonLoading(false);
        }
    };

    const completeLesson = () => {
        if (currentLesson && !completedLessons.includes(currentLesson.id)) {
            setCompletedLessons([...completedLessons, currentLesson.id]);
            setUserXP(prev => prev + (currentLesson.xp || 25));
        }
        
        // Find next lesson
        const allLessons = courseData?.units?.flatMap((u, ui) => 
            u.lessons.map(l => ({ ...l, unitIndex: ui, unit: u }))
        ) || [];
        const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
        const nextLesson = allLessons[currentIndex + 1];
        
        if (nextLesson) {
            loadLessonContent(nextLesson, nextLesson.unit);
            setExpandedUnits(prev => ({ ...prev, [nextLesson.unitIndex]: true }));
        } else {
            setView('curriculum');
        }
    };

    const isLessonUnlocked = (lesson, unit) => {
        const unitIndex = courseData?.units?.indexOf(unit) || 0;
        const lessonIndex = unit.lessons.indexOf(lesson);
        
        if (unitIndex === 0 && lessonIndex === 0) return true;
        if (lessonIndex > 0) {
            return completedLessons.includes(unit.lessons[lessonIndex - 1]?.id);
        }
        const prevUnit = courseData?.units?.[unitIndex - 1];
        return prevUnit?.lessons?.every(l => completedLessons.includes(l.id));
    };

    const getQuizScore = () => {
        if (!lessonContent?.quiz) return 0;
        let correct = 0;
        lessonContent.quiz.forEach((q, i) => {
            if (quizAnswers[i] === q.correctIndex) correct++;
        });
        return Math.round((correct / lessonContent.quiz.length) * 100);
    };

    const totalLessons = courseData?.units?.reduce((acc, u) => acc + (u.lessons?.length || 0), 0) || 0;
    const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

    if (!topic) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`${isFullscreen ? 'max-w-full w-full h-full max-h-full rounded-none' : 'max-w-4xl max-h-[90vh]'} overflow-hidden p-0 transition-all`}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: topic.color }} />
                        <p className="text-gray-600">Generating curriculum...</p>
                    </div>
                ) : (
                    <div className={`flex flex-col ${isFullscreen ? 'h-full' : 'h-[85vh]'}`}>
                        {/* Header */}
                        <div className="p-4 text-white flex-shrink-0" style={{ background: `linear-gradient(135deg, ${topic.color}, ${THEME.secondary})` }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {view === 'lesson' && (
                                        <Button variant="ghost" size="icon" onClick={() => setView('curriculum')} className="text-white hover:bg-white/20">
                                            <ChevronLeft className="w-5 h-5" />
                                        </Button>
                                    )}
                                    <div>
                                        <p className="text-white/70 text-sm">{view === 'lesson' ? currentUnit?.title : 'Course'}</p>
                                        <h2 className="font-bold text-lg">{view === 'lesson' ? currentLesson?.title : courseData?.title}</h2>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full">
                                        <Zap className="w-4 h-4" />
                                        <span className="font-bold">{userXP} XP</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} className="text-white hover:bg-white/20">
                                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                                        <X className="w-6 h-6" />
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="mt-3">
                                <div className="flex justify-between text-sm text-white/80 mb-1">
                                    <span>{progress}% Complete</span>
                                    <span>{completedLessons.length}/{totalLessons}</span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full">
                                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {view === 'curriculum' ? (
                                <div className="p-4 space-y-4">
                                    {courseData?.units?.map((unit, uIndex) => {
                                        const unitCompleted = unit.lessons?.every(l => completedLessons.includes(l.id));
                                        const unitProgress = unit.lessons?.filter(l => completedLessons.includes(l.id)).length || 0;
                                        
                                        return (
                                            <div key={uIndex} className="border rounded-xl overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedUnits(prev => ({ ...prev, [uIndex]: !prev[uIndex] }))}
                                                    className="w-full p-4 flex items-center gap-4 hover:bg-gray-50"
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${unitCompleted ? 'bg-emerald-500' : ''}`} style={!unitCompleted ? { backgroundColor: topic.color } : {}}>
                                                        {unitCompleted ? <CheckCircle className="w-5 h-5" /> : uIndex + 1}
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <h3 className="font-semibold">{unit.title}</h3>
                                                        <p className="text-sm text-gray-500">{unitProgress}/{unit.lessons?.length} lessons</p>
                                                    </div>
                                                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedUnits[uIndex] ? 'rotate-90' : ''}`} />
                                                </button>
                                                
                                                {expandedUnits[uIndex] && (
                                                    <div className="border-t bg-gray-50 p-2">
                                                        {unit.lessons?.map((lesson, lIndex) => {
                                                            const isCompleted = completedLessons.includes(lesson.id);
                                                            const unlocked = isLessonUnlocked(lesson, unit);
                                                            
                                                            return (
                                                                <button
                                                                    key={lesson.id}
                                                                    onClick={() => unlocked && loadLessonContent(lesson, unit)}
                                                                    disabled={!unlocked}
                                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${unlocked ? 'hover:bg-white cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                                                                >
                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-emerald-100 text-emerald-600' : unlocked ? 'text-white' : 'bg-gray-200 text-gray-400'}`} style={unlocked && !isCompleted ? { backgroundColor: `${topic.color}20`, color: topic.color } : {}}>
                                                                        {isCompleted ? <Check className="w-4 h-4" /> : !unlocked ? <Lock className="w-3 h-3" /> : lesson.type === 'video' ? <Video className="w-4 h-4" /> : lesson.type === 'quiz' ? <HelpCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                                    </div>
                                                                    <div className="flex-1 text-left">
                                                                        <p className={`text-sm font-medium ${isCompleted ? 'text-gray-400 line-through' : ''}`}>{lesson.title}</p>
                                                                        <p className="text-xs text-gray-400">{lesson.duration}</p>
                                                                    </div>
                                                                    <span className="text-xs font-medium" style={{ color: THEME.accent }}>+{lesson.xp} XP</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-6">
                                    {lessonLoading ? (
                                        <div className="flex flex-col items-center justify-center py-16">
                                            <Loader2 className="w-10 h-10 animate-spin mb-3" style={{ color: topic.color }} />
                                            <p className="text-gray-500">Loading lesson...</p>
                                        </div>
                                    ) : currentLesson?.type === 'quiz' && lessonContent?.quiz ? (
                                        <div className="space-y-6">
                                            {lessonContent.quiz.map((q, qIndex) => (
                                                <div key={qIndex} className="p-4 bg-gray-50 rounded-xl">
                                                    <p className="font-medium mb-3">{qIndex + 1}. {q.question}</p>
                                                    <div className="space-y-2">
                                                        {q.options.map((opt, oIndex) => {
                                                            const selected = quizAnswers[qIndex] === oIndex;
                                                            const correct = showQuizResults && q.correctIndex === oIndex;
                                                            const wrong = showQuizResults && selected && q.correctIndex !== oIndex;
                                                            
                                                            return (
                                                                <button
                                                                    key={oIndex}
                                                                    onClick={() => !showQuizResults && setQuizAnswers({ ...quizAnswers, [qIndex]: oIndex })}
                                                                    disabled={showQuizResults}
                                                                    className={`w-full p-3 rounded-lg text-left text-sm border-2 transition-all ${
                                                                        correct ? 'bg-emerald-100 border-emerald-500' :
                                                                        wrong ? 'bg-red-100 border-red-500' :
                                                                        selected ? 'text-white' : 'bg-white border-gray-200 hover:border-gray-300'
                                                                    }`}
                                                                    style={selected && !showQuizResults ? { backgroundColor: topic.color, borderColor: topic.color } : {}}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {showQuizResults && (
                                                <div className="p-6 rounded-xl text-center" style={{ backgroundColor: `${topic.color}10` }}>
                                                    <div className="text-4xl font-bold mb-2" style={{ color: topic.color }}>{getQuizScore()}%</div>
                                                    <p>{getQuizScore() >= 70 ? "Great job!" : "Keep practicing!"}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="max-w-none">
                                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">{lessonContent?.introduction}</p>
                                            <div className="mb-6 text-gray-700 leading-relaxed prose prose-sm max-w-none">
                                                <div dangerouslySetInnerHTML={{ 
                                                    __html: lessonContent?.content
                                                        ?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                        ?.replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                        ?.replace(/\n\n/g, '</p><p>')
                                                        ?.replace(/\n/g, '<br/>')
                                                        ?.replace(/^(.*)$/, '<p>$1</p>')
                                                        || ''
                                                }} />
                                            </div>
                                            
                                            {lessonContent?.keyPoints?.length > 0 && (
                                                <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: `${topic.color}10` }}>
                                                    <h4 className="font-bold mb-3" style={{ color: topic.color }}>Key Points</h4>
                                                    <ul className="space-y-2">
                                                        {lessonContent.keyPoints.map((point, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: topic.color }} />
                                                                <span>{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            
                                            {lessonContent?.summary && (
                                                <div className="p-4 bg-gray-50 rounded-xl">
                                                    <h4 className="font-bold mb-2">Summary</h4>
                                                    <p className="text-gray-600">{lessonContent.summary}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {view === 'lesson' && (
                            <div className="p-4 border-t bg-gray-50 flex items-center justify-between flex-shrink-0">
                                <Button variant="outline" onClick={() => setView('curriculum')}>
                                    Back to Curriculum
                                </Button>
                                
                                {currentLesson?.type === 'quiz' && !showQuizResults ? (
                                    <Button
                                        onClick={() => setShowQuizResults(true)}
                                        disabled={Object.keys(quizAnswers).length < (lessonContent?.quiz?.length || 0)}
                                        style={{ backgroundColor: topic.color }}
                                        className="text-white"
                                    >
                                        Submit Quiz
                                    </Button>
                                ) : (
                                    <Button onClick={completeLesson} style={{ backgroundColor: topic.color }} className="text-white">
                                        <CheckCircle className="w-4 h-4 mr-2" /> Complete & Continue
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}