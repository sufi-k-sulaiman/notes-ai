import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Maximize2, Minimize2, Loader2, Search, Compass, BookOpen, Network } from 'lucide-react';
import LearnMoreModal from '../components/mindmap/LearnMoreModal';

const NODE_COLORS = [
    { bg: 'bg-purple-500', hover: 'hover:bg-purple-600' },
    { bg: 'bg-green-500', hover: 'hover:bg-green-600' },
    { bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    { bg: 'bg-orange-500', hover: 'hover:bg-orange-600' },
    { bg: 'bg-pink-500', hover: 'hover:bg-pink-600' },
    { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600' },
    { bg: 'bg-amber-500', hover: 'hover:bg-amber-600' },
    { bg: 'bg-rose-500', hover: 'hover:bg-rose-600' },
    { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600' },
    { bg: 'bg-teal-500', hover: 'hover:bg-teal-600' },
];

function TreeNode({ node, colorIndex = 0, onExplore, onLearn, depth = 0 }) {
    const color = NODE_COLORS[colorIndex % NODE_COLORS.length];
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="flex flex-col items-center">
            {/* Node Card */}
            <div className={`${color.bg} text-white rounded-xl px-4 py-3 shadow-lg min-w-[160px] max-w-[220px] text-center transition-transform hover:scale-105`}>
                <p className="font-semibold text-sm leading-tight mb-2 break-words">{node.name}</p>
                <div className="flex gap-1.5 justify-center flex-wrap">
                    <button
                        onClick={() => onExplore(node)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-md text-xs font-medium transition-colors"
                    >
                        <Compass className="w-3 h-3" />
                        Explore
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

            {/* Children */}
            {hasChildren && (
                <>
                    <div className="w-0.5 h-6 bg-gray-300" />
                    <div className="relative">
                        {node.children.length > 1 && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 bg-gray-300" 
                                 style={{ width: `calc(100% - 80px)` }} />
                        )}
                        <div className="flex gap-6 flex-wrap justify-center pt-0">
                            {node.children.map((child, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-0.5 h-6 bg-gray-300" />
                                    <TreeNode
                                        node={child}
                                        colorIndex={colorIndex + i + 1 + depth}
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
                prompt: `Create a hierarchical knowledge tree for "${topic}". Generate a root topic with 2-3 main branches, each having 2-4 sub-branches. Return as nested structure with name and description for each node.`,
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
                                    description: { type: "string" },
                                    children: {
                                        type: "array",
                                        items: {
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
                                    }
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

    const handleExplore = (node) => {
        handleSearch(node.name);
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

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search */}
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="AI-Powered search..."
                                    className="pl-9 w-64 bg-white"
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(searchTerm); }}
                                />
                            </div>
                            <Button
                                onClick={() => handleSearch(searchTerm)}
                                disabled={loading || !searchTerm.trim()}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            </Button>
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
                </div>

                {/* Mind Map Content */}
                <div className={`bg-white rounded-2xl border border-gray-200 ${isFullscreen ? 'min-h-[calc(100vh-100px)]' : 'min-h-[600px]'} overflow-auto p-8`}>
                    {!treeData && !loading ? (
                        <div className="h-full flex flex-col items-center justify-center py-20">
                            <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
                                <Network className="w-10 h-10 text-purple-600" />
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
                        <div className="flex justify-center py-8 overflow-x-auto min-w-max">
                            <TreeNode
                                node={treeData}
                                colorIndex={0}
                                onExplore={handleExplore}
                                onLearn={handleLearn}
                            />
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