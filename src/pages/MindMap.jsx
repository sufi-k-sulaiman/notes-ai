import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Maximize2, Minimize2, Loader2, Search, Compass, BookOpen, Network } from 'lucide-react';
import LearnMoreModal from '../components/mindmap/LearnMoreModal';

const NODE_COLORS = [
    { bg: 'bg-purple-500' },
    { bg: 'bg-green-500' },
    { bg: 'bg-blue-500' },
    { bg: 'bg-orange-500' },
    { bg: 'bg-pink-500' },
    { bg: 'bg-cyan-500' },
    { bg: 'bg-amber-500' },
    { bg: 'bg-rose-500' },
    { bg: 'bg-indigo-500' },
    { bg: 'bg-teal-500' },
];

function TreeNode({ node, colorIndex = 0, onExplore, onLearn, depth = 0 }) {
    const [isExpanding, setIsExpanding] = useState(false);
    const [children, setChildren] = useState(node.children || []);
    const [isExpanded, setIsExpanded] = useState(node.children && node.children.length > 0);
    
    const color = NODE_COLORS[colorIndex % NODE_COLORS.length];
    const hasChildren = children && children.length > 0;

    const handleExplore = async () => {
        if (isExpanded && hasChildren) {
            // Collapse
            return;
        }
        
        setIsExpanding(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate 3-5 subtopics/related concepts for "${node.name}". Each should have a name and brief description.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        subtopics: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    description: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            
            setChildren(response.subtopics || []);
            setIsExpanded(true);
        } catch (error) {
            console.error('Failed to expand:', error);
        } finally {
            setIsExpanding(false);
        }
    };

    // Calculate spacing based on depth for triangular effect
    const getSpacing = () => {
        if (depth === 0) return 'gap-16';
        if (depth === 1) return 'gap-8';
        if (depth === 2) return 'gap-4';
        return 'gap-3';
    };

    return (
        <div className="flex flex-col items-center">
            {/* Node Card */}
            <div className={`${color.bg} text-white rounded-xl px-4 py-3 shadow-lg min-w-[140px] max-w-[200px] text-center transition-all hover:scale-105 hover:shadow-xl`}>
                <p className="font-semibold text-sm leading-tight mb-2 break-words">{node.name}</p>
                <div className="flex gap-1.5 justify-center flex-wrap">
                    <button
                        onClick={handleExplore}
                        disabled={isExpanding}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                    >
                        {isExpanding ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Compass className="w-3 h-3" />
                        )}
                        {isExpanding ? '...' : 'Explore'}
                    </button>
                    <button
                        onClick={() => onLearn(node)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-md text-xs font-medium transition-colors"
                    >
                        <BookOpen className="w-3 h-3" />
                        Learn
                    </button>
                </div>
            </div>

            {/* Children - Triangular layout */}
            {hasChildren && isExpanded && (
                <>
                    <div className="w-0.5 h-8 bg-gray-300" />
                    <div className="relative">
                        <div className={`flex ${getSpacing()} justify-center`}>
                            {children.map((child, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-0.5 h-6 bg-gray-300" />
                                    <TreeNode
                                        node={child}
                                        colorIndex={colorIndex + i + 1 + depth * 2}
                                        onExplore={onExplore}
                                        onLearn={onLearn}
                                        depth={depth + 1}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
            
            {/* Loading indicator for expanding */}
            {isExpanding && (
                <div className="mt-4 flex flex-col items-center">
                    <div className="w-0.5 h-6 bg-gray-300" />
                    <div className="flex gap-2 items-center text-gray-500 bg-gray-100 rounded-lg px-4 py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                        <span className="text-sm">Expanding...</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MindMapPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [treeData, setTreeData] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedKeyword, setSelectedKeyword] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const containerRef = useRef(null);

    const handleSearch = async (topic) => {
        if (!topic?.trim()) return;
        setLoading(true);

        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `For the topic "${topic}", provide just the main topic with 2-3 immediate subtopics. Keep it simple - no deep nesting. Return name and description for each.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        children: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    description: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            setTreeData(response);
            setSearchTerm('');
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLearn = (node) => {
        setSelectedKeyword(node);
        setShowModal(true);
    };

    const toggleFullscreen = async () => {
        try {
            if (!isFullscreen) {
                await containerRef.current?.requestFullscreen?.();
            } else {
                if (document.fullscreenElement) {
                    await document.exitFullscreen();
                }
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`min-h-screen bg-gray-50 ${isFullscreen ? 'p-4 overflow-auto' : 'p-4 md:p-6'}`}
        >
            <div className={`${isFullscreen ? 'max-w-none' : 'max-w-7xl mx-auto'}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                            <Network className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Neural Topic Network</h1>
                    </div>

                    {/* Fullscreen toggle */}
                    <Button
                        variant="outline"
                        onClick={toggleFullscreen}
                        className="gap-2"
                    >
                        {isFullscreen ? (
                            <>
                                <Minimize2 className="w-4 h-4" />
                                Exit Fullscreen
                            </>
                        ) : (
                            <>
                                <Maximize2 className="w-4 h-4" />
                                Fullscreen
                            </>
                        )}
                    </Button>
                </div>

                {/* Mind Map Content */}
                <div className={`bg-white rounded-2xl border border-gray-200 ${isFullscreen ? 'min-h-[calc(100vh-100px)]' : 'min-h-[600px]'} overflow-auto p-8`}>
                    {!treeData && !loading ? (
                        <div className="h-full flex flex-col items-center justify-center py-20">
                            <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                                <Network className="w-10 h-10 text-purple-600" />
                            </div>

                            {/* Search Bar - Right below icon */}
                            <div className="w-full max-w-xl mx-auto mb-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(searchTerm); }}
                                        placeholder="Search anything..."
                                        className="w-full h-12 pl-5 pr-14 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-700 placeholder:text-gray-400"
                                    />
                                    <button
                                        onClick={() => handleSearch(searchTerm)}
                                        disabled={loading || !searchTerm.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Search className="w-4 h-4 text-white" />}
                                    </button>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Start Exploring</h2>
                            <p className="text-gray-500 max-w-md text-center mb-6">
                                Search for any topic to generate an interactive knowledge tree. Click Explore to dive deeper or Learn for detailed insights.
                            </p>

                            <div className="flex flex-wrap justify-center gap-2">
                                {['Technology', 'Science', 'History', 'Business', 'Art'].map(topic => (
                                    <Button
                                        key={topic}
                                        variant="outline"
                                        onClick={() => handleSearch(topic)}
                                        className="rounded-full"
                                    >
                                        {topic}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="h-full flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
                            <p className="text-gray-600">Building knowledge network...</p>
                        </div>
                    ) : (
                        <div className="flex justify-center py-8 overflow-x-auto">
                            <div className="min-w-max px-8">
                                <TreeNode
                                    node={treeData}
                                    colorIndex={0}
                                    onLearn={handleLearn}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Learn More Modal */}
            <LearnMoreModal
                keyword={selectedKeyword}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}