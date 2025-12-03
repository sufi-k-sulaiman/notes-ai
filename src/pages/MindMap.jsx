import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Maximize2, Minimize2, Loader2, Search, Compass, BookOpen, Network, Download, Hand, Pencil, Type, Square, Circle, Eraser, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import LearnMoreModal from '../components/mindmap/LearnMoreModal';
import ErrorDisplay, { getErrorCode } from '@/components/ErrorDisplay';
import TopicThumbnail from '@/components/mindmap/TopicThumbnail';

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

function TreeNode({ node, colorIndex = 0, onExplore, onLearn, depth = 0, nodeRef = null }) {
    const [isExpanding, setIsExpanding] = useState(false);
    const [children, setChildren] = useState(node.children || []);
    const [isExpanded, setIsExpanded] = useState(node.children && node.children.length > 0);
    const selfRef = useRef(null);
    
    const color = NODE_COLORS[colorIndex % NODE_COLORS.length];
    const hasChildren = children && children.length > 0;

    const scrollToCenter = () => {
        setTimeout(() => {
            if (selfRef.current) {
                selfRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }, 100);
    };

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
            scrollToCenter();
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
        <div className="flex flex-col items-center" ref={selfRef}>
            {/* Node Card */}
            <div className={`${color.bg} text-white rounded-lg md:rounded-xl px-3 py-3 md:px-5 md:py-4 shadow-lg min-w-[120px] md:min-w-[175px] max-w-[180px] md:max-w-[250px] text-center transition-all hover:scale-105 hover:shadow-xl`}>
                <p className="font-semibold text-xs md:text-sm leading-tight mb-2 break-words">{node.name}</p>
                <div className="flex gap-1 md:gap-1.5 justify-center flex-wrap">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleExplore(); }}
                        disabled={isExpanding}
                        className="flex items-center gap-1 px-2 md:px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded text-[10px] md:text-xs font-medium transition-colors disabled:opacity-50"
                    >
                        {isExpanding ? (
                            <Loader2 className="w-2.5 md:w-3 h-2.5 md:h-3 animate-spin" />
                        ) : (
                            <Compass className="w-2.5 md:w-3 h-2.5 md:h-3" />
                        )}
                        {isExpanding ? '...' : 'Explore'}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onLearn(node); }}
                        className="flex items-center gap-1 px-2 md:px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded text-[10px] md:text-xs font-medium transition-colors"
                    >
                        <BookOpen className="w-2.5 md:w-3 h-2.5 md:h-3" />
                        Learn
                    </button>
                </div>
            </div>

            {/* Children - Triangular layout */}
            {hasChildren && isExpanded && (
                <>
                    <div className="h-8" />
                    <div className="relative">
                        <div className={`flex ${getSpacing()} justify-center`}>
                            {children.map((child, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="h-6" />
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
                    <div className="h-6" />
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
    const urlParams = new URLSearchParams(window.location.search);
    const initialTopic = urlParams.get('topic') || '';
    
    useEffect(() => {
        document.title = 'Ai Neural MindMap application';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'AI neural networks create interactive knowledge trees to explore knowledge.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'mind mapping, Ai MindMap');
    }, []);

    const [searchTerm, setSearchTerm] = useState(initialTopic);
    const [loading, setLoading] = useState(false);
    const [treeData, setTreeData] = useState(null);
    const [error, setError] = useState(null);
    
    // Auto-generate mindmap if topic is passed via URL
    useEffect(() => {
        if (initialTopic && !treeData && !loading) {
            handleSearch(initialTopic);
        }
    }, []);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedKeyword, setSelectedKeyword] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [exporting, setExporting] = useState(false);
    const containerRef = useRef(null);
    const mindmapRef = useRef(null);
    
    // Pan and annotation state
    const [isPanning, setIsPanning] = useState(false);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [spacePressed, setSpacePressed] = useState(false);
    
    // Annotation state
    const [annotationMode, setAnnotationMode] = useState(null); // null, 'draw', 'text', 'rectangle', 'circle', 'eraser'
    const [annotations, setAnnotations] = useState([]);
    const [currentAnnotation, setCurrentAnnotation] = useState(null);
    const [annotationColor, setAnnotationColor] = useState('#00BCD4');
    const canvasOverlayRef = useRef(null);
    const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: '' });

    // Handle keyboard shortcuts for tools and panning
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.matches('input, textarea')) return;
            
            if (e.code === 'Space') {
                e.preventDefault();
                setSpacePressed(true);
                setAnnotationMode(null);
            }
            
            // Keyboard shortcuts for annotation tools
            if (!treeData) return;
            switch(e.key.toLowerCase()) {
                case 'p':
                    e.preventDefault();
                    setAnnotationMode('draw');
                    break;
                case 't':
                    e.preventDefault();
                    setAnnotationMode('text');
                    break;
                case 'r':
                    e.preventDefault();
                    setAnnotationMode('rectangle');
                    break;
                case 'c':
                case 'o':
                    e.preventDefault();
                    setAnnotationMode('circle');
                    break;
                case 'e':
                    e.preventDefault();
                    setAnnotationMode('eraser');
                    break;
                case 'escape':
                    e.preventDefault();
                    setAnnotationMode(null);
                    break;
            }
        };
        const handleKeyUp = (e) => {
            if (e.code === 'Space') {
                setSpacePressed(false);
                setIsDragging(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [treeData]);

    const [isDrawing, setIsDrawing] = useState(false);

    const handleCanvasMouseDown = (e) => {
        // Prevent default to stop text selection
        e.preventDefault();
        
        if (spacePressed) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
            return;
        }
        
        if (!annotationMode) return;
        
        const rect = canvasOverlayRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + canvasOverlayRef.current.scrollLeft;
        const y = e.clientY - rect.top + canvasOverlayRef.current.scrollTop;
        
        if (annotationMode === 'text') {
            setTextInput({ visible: true, x, y, value: '' });
            return;
        }
        
        if (annotationMode === 'eraser') {
            const threshold = 20;
            setAnnotations(prev => prev.filter(ann => {
                if (ann.type === 'draw') {
                    return !ann.points.some(p => Math.abs(p.x - x) < threshold && Math.abs(p.y - y) < threshold);
                }
                if (ann.type === 'text') {
                    return !(Math.abs(ann.x - x) < 50 && Math.abs(ann.y - y) < 20);
                }
                if (ann.type === 'rectangle' || ann.type === 'circle') {
                    const centerX = ann.x + ann.width / 2;
                    const centerY = ann.y + ann.height / 2;
                    return !(Math.abs(centerX - x) < Math.max(ann.width / 2, threshold) && Math.abs(centerY - y) < Math.max(ann.height / 2, threshold));
                }
                return true;
            }));
            return;
        }
        
        setIsDrawing(true);
        if (annotationMode === 'draw') {
            setCurrentAnnotation({ type: 'draw', points: [{ x, y }], color: annotationColor });
        } else if (annotationMode === 'rectangle' || annotationMode === 'circle') {
            setCurrentAnnotation({ type: annotationMode, x, y, width: 0, height: 0, color: annotationColor });
        }
    };

    const handleCanvasMouseMove = (e) => {
        if (isDragging && spacePressed) {
            setPanOffset({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
            return;
        }
        
        if (!currentAnnotation || !isDrawing) return;
        
        const rect = canvasOverlayRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + canvasOverlayRef.current.scrollLeft;
        const y = e.clientY - rect.top + canvasOverlayRef.current.scrollTop;
        
        if (currentAnnotation.type === 'draw') {
            setCurrentAnnotation(prev => ({
                ...prev,
                points: [...prev.points, { x, y }]
            }));
        } else if (currentAnnotation.type === 'rectangle' || currentAnnotation.type === 'circle') {
            setCurrentAnnotation(prev => ({
                ...prev,
                width: x - prev.x,
                height: y - prev.y
            }));
        }
    };

    const handleCanvasMouseUp = () => {
        setIsDragging(false);
        setIsDrawing(false);
        if (currentAnnotation) {
            // Only add if there's actual content
            if (currentAnnotation.type === 'draw' && currentAnnotation.points.length > 1) {
                setAnnotations(prev => [...prev, currentAnnotation]);
            } else if ((currentAnnotation.type === 'rectangle' || currentAnnotation.type === 'circle') && 
                       (Math.abs(currentAnnotation.width) > 5 || Math.abs(currentAnnotation.height) > 5)) {
                setAnnotations(prev => [...prev, currentAnnotation]);
            }
            setCurrentAnnotation(null);
        }
    };

    const handleTextSubmit = () => {
        if (textInput.value.trim()) {
            setAnnotations(prev => [...prev, {
                type: 'text',
                x: textInput.x,
                y: textInput.y,
                text: textInput.value,
                color: annotationColor
            }]);
        }
        setTextInput({ visible: false, x: 0, y: 0, value: '' });
    };

    const clearAnnotations = () => {
        setAnnotations([]);
    };

    const [selectedAnnotation, setSelectedAnnotation] = useState(null);

    const handleAnnotationClick = (index, e) => {
        e.stopPropagation();
        setSelectedAnnotation(selectedAnnotation === index ? null : index);
    };

    const renderAnnotations = () => {
        const allAnnotations = [...annotations, currentAnnotation].filter(Boolean);
        if (allAnnotations.length === 0) return null;
        return (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                {allAnnotations.map((ann, i) => {
                    const isSelected = selectedAnnotation === i;
                    const strokeWidth = isSelected ? 5 : 3;
                    const strokeColor = isSelected ? '#8b5cf6' : ann.color;
                    
                    if (ann.type === 'draw') {
                        const pathData = ann.points.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                        return <path key={i} d={pathData} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" style={{ cursor: 'pointer', pointerEvents: 'stroke' }} onClick={(e) => handleAnnotationClick(i, e)} />;
                    }
                    if (ann.type === 'text') {
                        return <text key={i} x={ann.x} y={ann.y} fill={strokeColor} fontSize="16" fontWeight={isSelected ? '700' : '500'} style={{ cursor: 'pointer' }} onClick={(e) => handleAnnotationClick(i, e)}>{ann.text}</text>;
                    }
                    if (ann.type === 'rectangle') {
                        const x = ann.width < 0 ? ann.x + ann.width : ann.x;
                        const y = ann.height < 0 ? ann.y + ann.height : ann.y;
                        return <rect key={i} x={x} y={y} width={Math.abs(ann.width)} height={Math.abs(ann.height)} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" style={{ cursor: 'pointer' }} onClick={(e) => handleAnnotationClick(i, e)} />;
                    }
                    if (ann.type === 'circle') {
                        const cx = ann.x + ann.width / 2;
                        const cy = ann.y + ann.height / 2;
                        const rx = Math.abs(ann.width / 2);
                        const ry = Math.abs(ann.height / 2);
                        return <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" style={{ cursor: 'pointer' }} onClick={(e) => handleAnnotationClick(i, e)} />;
                    }
                    return null;
                })}
            </svg>
        );
    };

    const exportMindMap = async (format) => {
        if (!mindmapRef.current) return;
        setExporting(true);
        try {
            // Wait for any pending renders
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const canvas = await html2canvas(mindmapRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                windowWidth: mindmapRef.current.scrollWidth,
                windowHeight: mindmapRef.current.scrollHeight,
                width: mindmapRef.current.scrollWidth,
                height: mindmapRef.current.scrollHeight,
                x: 0,
                y: 0,
            });
            
            if (format === 'png') {
                const link = document.createElement('a');
                link.download = `mindmap-${treeData?.name || 'export'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } else if (format === 'jpeg') {
                const link = document.createElement('a');
                link.download = `mindmap-${treeData?.name || 'export'}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.9);
                link.click();
            } else if (format === 'pdf') {
                // A4 landscape dimensions in mm
                const a4Width = 297;
                const a4Height = 210;
                
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });
                
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                
                // Calculate scale to fit content in A4 landscape with padding
                const padding = 10;
                const availableWidth = a4Width - (padding * 2);
                const availableHeight = a4Height - (padding * 2);
                
                const scaleX = availableWidth / imgWidth;
                const scaleY = availableHeight / imgHeight;
                const scale = Math.min(scaleX, scaleY);
                
                const scaledWidth = imgWidth * scale;
                const scaledHeight = imgHeight * scale;
                
                // Center the image on the page
                const xOffset = (a4Width - scaledWidth) / 2;
                const yOffset = (a4Height - scaledHeight) / 2;
                
                pdf.addImage(imgData, 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);
                pdf.save(`mindmap-${treeData?.name || 'export'}.pdf`);
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    const handleSearch = async (topic) => {
        if (!topic?.trim()) return;
        setLoading(true);
        setError(null);

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
        } catch (err) {
            console.error('Search failed:', err);
            setError(getErrorCode(err));
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
            className={`min-h-screen bg-gray-50 ${isFullscreen ? 'p-1 overflow-auto' : 'p-1'}`}
        >
            <div className={`${isFullscreen ? 'max-w-none' : 'max-w-[96rem] mx-auto'}`}>
                {/* Mind Map Content */}
                <div className={`bg-white rounded-xl border border-gray-200 ${isFullscreen ? 'h-[calc(100vh-8px)]' : 'h-[calc(100vh-16px)]'} overflow-hidden p-2`}>
                    {/* Header inside the card */}
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-purple-100 flex items-center justify-center">
                                <Network className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                            </div>
                            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900">Neural MindMaps</h1>
                        </div>

                        <div className="flex gap-1 md:gap-2 flex-wrap">
                            {/* Annotation tools */}
                            {treeData && (
                                <div className="flex gap-0.5 md:gap-1 bg-gray-100 rounded-lg p-0.5 md:p-1">
                                    <Button
                                        variant={annotationMode === null && !spacePressed ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setAnnotationMode(null)}
                                        title="Hand / Pan (Space)"
                                        className="gap-0.5 md:gap-1 h-7 md:h-8 px-1.5 md:px-2"
                                    >
                                        <Hand className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="text-[9px] md:text-[10px] text-gray-400 hidden sm:inline">Space</span>
                                    </Button>
                                    <Button
                                        variant={annotationMode === 'draw' ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setAnnotationMode('draw')}
                                        title="Pencil (P)"
                                        className="gap-0.5 md:gap-1 h-7 md:h-8 px-1.5 md:px-2"
                                    >
                                        <Pencil className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="text-[9px] md:text-[10px] text-gray-400 hidden sm:inline">P</span>
                                    </Button>
                                    <Button
                                        variant={annotationMode === 'text' ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setAnnotationMode('text')}
                                        title="Text (T)"
                                        className="gap-0.5 md:gap-1 h-7 md:h-8 px-1.5 md:px-2"
                                    >
                                        <Type className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="text-[9px] md:text-[10px] text-gray-400 hidden sm:inline">T</span>
                                    </Button>
                                    <Button
                                        variant={annotationMode === 'rectangle' ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setAnnotationMode('rectangle')}
                                        title="Rectangle (R)"
                                        className="gap-0.5 md:gap-1 h-7 md:h-8 px-1.5 md:px-2"
                                    >
                                        <Square className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="text-[9px] md:text-[10px] text-gray-400 hidden sm:inline">R</span>
                                    </Button>
                                    <Button
                                        variant={annotationMode === 'circle' ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setAnnotationMode('circle')}
                                        title="Circle (O/C)"
                                        className="gap-0.5 md:gap-1 h-7 md:h-8 px-1.5 md:px-2"
                                    >
                                        <Circle className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="text-[9px] md:text-[10px] text-gray-400 hidden sm:inline">O</span>
                                    </Button>
                                    <Button
                                        variant={annotationMode === 'eraser' ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setAnnotationMode('eraser')}
                                        title="Eraser (E)"
                                        className="gap-0.5 md:gap-1 h-7 md:h-8 px-1.5 md:px-2"
                                    >
                                        <Eraser className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="text-[9px] md:text-[10px] text-gray-400 hidden sm:inline">E</span>
                                    </Button>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="sm" title="Color" className="h-7 md:h-8 px-1.5 md:px-2">
                                                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-gray-300" style={{ backgroundColor: annotationColor }} />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-2">
                                            <div className="flex gap-1">
                                                {['#FF9800', '#E91E63', '#00BCD4', '#4CAF50', '#9DD5E8', '#2196F3', '#000000'].map(color => (
                                                    <button
                                                        key={color}
                                                        className={`w-6 h-6 rounded-full border-2 ${annotationColor === color ? 'border-gray-800' : 'border-transparent'}`}
                                                        style={{ backgroundColor: color }}
                                                        onClick={() => setAnnotationColor(color)}
                                                    />
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAnnotations}
                                        title="Clear all annotations"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 md:h-8 px-1.5 md:px-2"
                                    >
                                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Export dropdown */}
                            {treeData && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="gap-1 md:gap-2 text-xs md:text-sm h-7 md:h-9 px-2 md:px-4" disabled={exporting}>
                                            {exporting ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Download className="w-3 h-3 md:w-4 md:h-4" />}
                                            <span className="hidden sm:inline">Export</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => exportMindMap('pdf')}>
                                            Export as PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => exportMindMap('png')}>
                                            Export as PNG
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => exportMindMap('jpeg')}>
                                            Export as JPEG
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            {/* Fullscreen toggle */}
                            <Button
                                variant="outline"
                                onClick={toggleFullscreen}
                                className="gap-1 md:gap-2 h-7 md:h-9 px-2 md:px-4"
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="w-3 h-3 md:w-4 md:h-4" />
                                ) : (
                                    <Maximize2 className="w-3 h-3 md:w-4 md:h-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                    {!treeData && !loading ? (
                        <div className="h-full flex flex-col items-center pt-2 overflow-auto px-2">

                            {/* Search Bar - Right below icon */}
                            <div className="w-full max-w-xl mx-auto mb-4">
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

                            <h2 className="text-xl font-bold text-gray-900 mb-2">Start Exploring</h2>
                            <p className="text-gray-500 max-w-md text-center mb-4 text-sm">
                                Search for any topic to generate an interactive knowledge tree. Click Explore to dive deeper or Learn for detailed insights.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full justify-items-center mx-auto px-4">
                                {[
                                    'Geography', 'Psychology', 'Music', 'Business', 'Sociology', 'Environment',
                                    'Mathematics', 'History', 'Literature', 'Sports', 'Science', 'Culture & Anthropology',
                                    'Health & Medicine', 'Education', 'Art', 'Economics', 'Philosophy', 'Politics'
                                ].map(topic => (
                                    <TopicThumbnail
                                        key={topic}
                                        topic={topic}
                                        onClick={handleSearch}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="h-full flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
                            <p className="text-gray-600">Building knowledge network...</p>
                        </div>
                    ) : error ? (
                        <ErrorDisplay 
                            errorCode={error} 
                            onRetry={() => handleSearch(searchTerm || 'Technology')}
                        />
                    ) : (
                        <div 
                            className={`relative flex justify-center overflow-auto pt-4 ${spacePressed ? 'select-none cursor-grab' : ''} ${isDragging ? 'cursor-grabbing' : ''} ${annotationMode === 'draw' || annotationMode === 'rectangle' || annotationMode === 'circle' ? 'cursor-crosshair' : ''} ${annotationMode === 'text' ? 'cursor-text' : ''} ${annotationMode === 'eraser' ? 'cursor-cell' : ''}`}
                            ref={canvasOverlayRef}
                            onMouseDown={(annotationMode || spacePressed) ? handleCanvasMouseDown : undefined}
                            onMouseMove={(annotationMode || spacePressed || isDragging || isDrawing) ? handleCanvasMouseMove : undefined}
                            onMouseUp={(annotationMode || spacePressed || isDragging || isDrawing) ? handleCanvasMouseUp : undefined}
                            onMouseLeave={(annotationMode || spacePressed || isDragging || isDrawing) ? handleCanvasMouseUp : undefined}
                            style={{ height: '100%', width: '100%' }}
                        >
                            {renderAnnotations()}
                            {textInput.visible && (
                                <input
                                    autoFocus
                                    type="text"
                                    value={textInput.value}
                                    onChange={(e) => setTextInput(prev => ({ ...prev, value: e.target.value }))}
                                    onBlur={handleTextSubmit}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleTextSubmit(); }}
                                    className="absolute z-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-purple-500"
                                    style={{ left: textInput.x, top: textInput.y, color: annotationColor }}
                                />
                            )}
                            <div 
                                className="min-w-max px-8 transition-transform duration-75"
                                style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
                                ref={mindmapRef}
                            >
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

            {/* Learn More Modal - rendered in portal to work in fullscreen */}
            {showModal && (
                <LearnMoreModal
                    keyword={selectedKeyword}
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    containerRef={containerRef}
                />
            )}
        </div>
    );
}