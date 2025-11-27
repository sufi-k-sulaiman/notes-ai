import React, { useState, useEffect } from 'react';
import { Brain, Plus, Loader2, Sparkles, ZoomIn, ZoomOut, Move, Trash2, Edit2, X, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from '@/api/base44Client';

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#0EA5E9', '#6366F1'];

export default function MindMapPage() {
    const [topic, setTopic] = useState('');
        const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [savedMaps, setSavedMaps] = useState([]);
    const [currentMapId, setCurrentMapId] = useState(null);

    const { data: mindMapsData, isLoading: isLoadingMaps } = useQuery({
        queryKey: ['mindMaps'],
        queryFn: () => base44.entities.MindMap.list(),
        onSuccess: (data) => {
            setSavedMaps(data || []);
        }
    });

    const createMapMutation = useMutation({
        mutationFn: (mapData) => base44.entities.MindMap.create(mapData),
        onSuccess: (newMap) => {
            setSavedMaps(prev => [...prev, newMap]);
            setCurrentMapId(newMap.id);
            toast.success('Mind map saved!');
        }
    });

    const updateMapMutation = useMutation({
        mutationFn: ({id, mapData}) => base44.entities.MindMap.update(id, mapData),
        onSuccess: (updatedMap) => {
            setSavedMaps(prev => prev.map(m => m.id === updatedMap.id ? updatedMap : m));
            toast.success('Mind map updated!');
        }
    });

    const deleteMapMutation = useMutation({
        mutationFn: (id) => base44.entities.MindMap.delete(id),
        onSuccess: (deletedId) => {
            setSavedMaps(prev => prev.filter(m => m.id !== deletedId));
            if (currentMapId === deletedId) {
                setNodes([]);
                setTopic('');
                setCurrentMapId(null);
            }
            toast.success('Mind map deleted.');
        }
    });

    const generateMindMap = async () => {
        if (!topic.trim() || loading) return;
        setLoading(true);

        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Create a comprehensive mind map for the topic: "${topic}". 
                Generate a central concept and 5-7 main branches, each with 2-4 sub-branches.
                Return as JSON with structure:
                {
                    "central": "main topic",
                    "branches": [
                        {
                            "name": "branch name",
                            "description": "brief description",
                            "children": ["sub-topic 1", "sub-topic 2"]
                        }
                    ]
                }`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        central: { type: "string" },
                        branches: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    description: { type: "string" },
                                    children: { type: "array", items: { type: "string" } }
                                }
                            }
                        }
                    }
                }
            });

            // Convert to visual nodes
            const centerX = 400;
            const centerY = 300;
            const radius = 200;
            const newNodes = [];

            // Central node
            newNodes.push({
                id: 'center',
                text: response.central,
                x: centerX,
                y: centerY,
                color: '#8B5CF6',
                type: 'central',
                children: []
            });

            // Branch nodes
            response.branches?.forEach((branch, i) => {
                const angle = (2 * Math.PI * i) / (response.branches.length);
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                const branchId = `branch-${i}`;
                
                newNodes.push({
                    id: branchId,
                    text: branch.name,
                    description: branch.description,
                    x,
                    y,
                    color: COLORS[i % COLORS.length],
                    type: 'branch',
                    parent: 'center',
                    children: []
                });

                // Sub-branches
                branch.children?.forEach((child, j) => {
                    const childAngle = angle + ((j - (branch.children.length - 1) / 2) * 0.3);
                    const childRadius = radius + 120;
                    const childX = centerX + childRadius * Math.cos(childAngle);
                    const childY = centerY + childRadius * Math.sin(childAngle);

                    newNodes.push({
                        id: `${branchId}-child-${j}`,
                        text: child,
                        x: childX,
                        y: childY,
                        color: COLORS[i % COLORS.length],
                        type: 'leaf',
                        parent: branchId
                    });
                });
            });

            setNodes(newNodes);
            const user = await base44.auth.me();
            if (currentMapId) {
                updateMapMutation.mutate({ id: currentMapId, mapData: { topic, nodes: newNodes } });
            } else if (user) {
                createMapMutation.mutate({ topic, nodes: newNodes, userId: user.id });
            }
        } catch (error) {
            console.error('Failed to generate mind map:', error);
        } finally {
            setLoading(false);
        }
    };

        const loadMap = (map) => {
        setTopic(map.topic);
        setNodes(map.nodes);
        setCurrentMapId(map.id);
    }

    const handleNodeClick = (node) => {
        setSelectedNode(selectedNode?.id === node.id ? null : node);
    };

    const renderConnections = () => {
        return nodes.filter(n => n.parent).map(node => {
            const parent = nodes.find(p => p.id === node.parent);
            if (!parent) return null;
            return (
                <line
                    key={`line-${node.id}`}
                    x1={parent.x}
                    y1={parent.y}
                    x2={node.x}
                    y2={node.y}
                    stroke={node.color}
                    strokeWidth={node.type === 'branch' ? 3 : 2}
                    strokeOpacity={0.4}
                />
            );
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="flex gap-6 max-w-full mx-auto">
                <div className="w-64 bg-white rounded-xl border border-gray-200 p-4">
                    <h2 className="text-lg font-bold mb-4">My Mind Maps</h2>
                    <div className="space-y-2">
                        {isLoadingMaps ? <p>Loading maps...</p> : savedMaps.map(map => (
                            <div key={map.id} onClick={() => loadMap(map)} className={`p-2 rounded-lg cursor-pointer ${currentMapId === map.id ? 'bg-purple-100' : 'hover:bg-gray-100'}`}>
                                <p className="font-semibold text-sm truncate">{map.topic}</p>
                                <p className="text-xs text-gray-500">{map.nodes.length} nodes</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1">
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-6 mb-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                <Brain className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">MindMap</h1>
                                <p className="text-white/80">AI-powered knowledge visualization and exploration</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <div className="flex gap-3">
                        <Input
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Enter a topic to visualize (e.g., Machine Learning, Climate Change, Startup Funding)"
                            className="flex-1"
                            onKeyDown={(e) => { if (e.key === 'Enter') generateMindMap(); }}
                        />
                        <Button
                            onClick={generateMindMap}
                            disabled={loading || !topic.trim()}
                            className="bg-pink-600 hover:bg-pink-700 gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {loading ? 'Generating...' : 'Generate'}
                        </Button>
                    </div>
                </div>

                {/* Controls */}
                {nodes.length > 0 && (
                    <div className="flex gap-2 mb-4">
                        <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}>
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setZoom(1)}>
                            Reset
                        </Button>
                        <span className="text-sm text-gray-500 self-center ml-2">{Math.round(zoom * 100)}%</span>
                    </div>
                )}

                {/* Mind Map Canvas */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
                    {nodes.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Brain className="w-16 h-16 mb-4 opacity-30" />
                            <p className="text-lg">Enter a topic above to generate a mind map</p>
                            <p className="text-sm mt-2">AI will create a visual knowledge graph for exploration</p>
                        </div>
                    ) : (
                        <svg width="100%" height="100%" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
                            {/* Connections */}
                            {renderConnections()}

                            {/* Nodes */}
                            {nodes.map(node => (
                                <g key={node.id} onClick={() => handleNodeClick(node)} style={{ cursor: 'pointer' }}>
                                    {node.type === 'central' ? (
                                        <>
                                            <circle
                                                cx={node.x}
                                                cy={node.y}
                                                r={60}
                                                fill={node.color}
                                                className="drop-shadow-lg"
                                            />
                                            <text
                                                x={node.x}
                                                y={node.y}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fill="white"
                                                fontSize="14"
                                                fontWeight="bold"
                                                className="pointer-events-none"
                                            >
                                                {node.text.length > 20 ? node.text.slice(0, 20) + '...' : node.text}
                                            </text>
                                        </>
                                    ) : (
                                        <>
                                            <rect
                                                x={node.x - 60}
                                                y={node.y - 20}
                                                width={120}
                                                height={40}
                                                rx={8}
                                                fill={selectedNode?.id === node.id ? node.color : 'white'}
                                                stroke={node.color}
                                                strokeWidth={2}
                                                className="drop-shadow-sm"
                                            />
                                            <text
                                                x={node.x}
                                                y={node.y}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fill={selectedNode?.id === node.id ? 'white' : node.color}
                                                fontSize="11"
                                                fontWeight="500"
                                                className="pointer-events-none"
                                            >
                                                {node.text.length > 15 ? node.text.slice(0, 15) + '...' : node.text}
                                            </text>
                                        </>
                                    )}
                                </g>
                            ))}
                        </svg>
                    )}
                </div>

                {/* Selected Node Details */}
                {selectedNode && selectedNode.description && (
                    <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedNode.color }} />
                            <h3 className="font-semibold text-gray-900">{selectedNode.text}</h3>
                        </div>
                        <p className="text-gray-600">{selectedNode.description}</p>
                    </div>
                )}

                {/* Legend */}
                {nodes.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-purple-500" />
                            <span>Central Topic</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border-2 border-purple-500" />
                            <span>Main Branches</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded border-2 border-gray-400" />
                            <span>Sub-topics</span>
                        </div>
                    </div>
                )}
            </div></div></div>
    );
}