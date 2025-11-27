import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Search, Globe, Paperclip, Mic, Sparkles, Bot, Lightbulb, FileText, Image, Loader2, X, ExternalLink, Download, Menu, ChevronLeft, Home, Users, Settings, HelpCircle, BookOpen, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from 'react-markdown';
import MetricCard from '../components/dashboard/MetricCard';
import PieChartCard from '../components/dashboard/PieChartCard';

import { LOGO_URL, menuItems as navMenuItems, footerLinks } from '../components/NavigationConfig';
import GlobalSearchBar from '../components/GlobalSearchBar';

const AI_MODELS = [
    { id: 'qwirey', name: 'Qwirey', icon: null, isLogo: true, description: 'All-in-one AI assistant', color: '#6B4EE6' },
    { id: 'gpt4', name: 'GPT-4o', icon: Bot, description: 'Advanced reasoning', color: '#10A37F' },
    { id: 'claude', name: 'Claude', icon: Sparkles, description: 'Thoughtful analysis', color: '#CC785C' },
    { id: 'gemini', name: 'Gemini', icon: Lightbulb, description: 'Multimodal AI', color: '#4285F4' },
];

export default function AIHub() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [query, setQuery] = useState('');
    const [selectedModel, setSelectedModel] = useState('qwirey');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [webUrl, setWebUrl] = useState('');
    const [attachedFiles, setAttachedFiles] = useState([]);
    const recognitionRef = useRef(null);
    const fileInputRef = useRef(null);



    const handleVoiceInput = () => {
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Voice input not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };
        
        recognition.onresult = (e) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = 0; i < e.results.length; i++) {
                const transcript = e.results[i][0].transcript;
                if (e.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            
            setQuery(prev => {
                const base = prev.replace(/\[listening...\]$/, '').trim();
                if (finalTranscript) {
                    return (base ? base + ' ' : '') + finalTranscript.trim();
                }
                return (base ? base + ' ' : '') + interimTranscript + ' [listening...]';
            });
        };
        
        recognition.onerror = (e) => {
            console.error('Speech recognition error:', e.error);
            setIsListening(false);
            recognitionRef.current = null;
        };
        
        recognition.onend = () => {
            setQuery(prev => prev.replace(/\s*\[listening...\]$/, '').trim());
            if (isListening && recognitionRef.current) {
                recognition.start();
            } else {
                setIsListening(false);
                recognitionRef.current = null;
            }
        };
        
        recognition.start();
    };

    const handleAddWebUrl = () => {
        if (webUrl.trim()) {
            setQuery(prev => prev + (prev ? '\n' : '') + `[Web: ${webUrl}]`);
            setWebUrl('');
            setShowUrlModal(false);
        }
    };

    const handleFileAttach = async (e) => {
        const files = Array.from(e.target.files);
        const textFiles = files.filter(f => 
            f.type.includes('text') || 
            f.type.includes('pdf') || 
            f.type.includes('word') ||
            f.type.includes('document') ||
            f.name.endsWith('.txt') ||
            f.name.endsWith('.md') ||
            f.name.endsWith('.csv')
        );

        for (const file of textFiles) {
            try {
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                
                // Extract content from the uploaded file
                const extractedData = await base44.integrations.Core.ExtractDataFromUploadedFile({
                    file_url: file_url,
                    json_schema: {
                        type: "object",
                        properties: {
                            content: { type: "string", description: "The full text content of the document" }
                        }
                    }
                });
                
                const content = extractedData?.output?.content || '';
                setAttachedFiles(prev => [...prev, { name: file.name, url: file_url, content }]);
            } catch (err) {
                console.error('File upload error:', err);
            }
        }
        e.target.value = '';
    };

    const removeAttachedFile = (index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!query.trim() || isLoading) return;
        
        setIsLoading(true);
        setResults({ query, loading: true, text: '', images: [], documents: [], suggestions: [], chartData: null });

        try {
            // Build context from attached files
            const fileContext = attachedFiles.length > 0 
                ? '\n\nAttached Documents:\n' + attachedFiles.map(f => `--- ${f.name} ---\n${f.content || 'Content not available'}`).join('\n\n')
                : '';

            if (selectedModel === 'qwirey') {
                // Qwirey: Full experience with images, docs, charts
                const [textResponse, imagesResponse, webResponse] = await Promise.all([
                    base44.integrations.Core.InvokeLLM({
                        prompt: `You are Qwirey, an advanced AI assistant. Provide a comprehensive, well-structured response to: "${query}". 
                        Include relevant insights, explanations, and actionable information. Use markdown formatting.${fileContext}`,
                        add_context_from_internet: true,
                        file_urls: attachedFiles.length > 0 ? attachedFiles.map(f => f.url) : undefined
                    }),
                    
                    Promise.all([
                        base44.integrations.Core.GenerateImage({ prompt: `${query} - professional visualization style 1` }),
                        base44.integrations.Core.GenerateImage({ prompt: `${query} - creative artistic style 2` }),
                        base44.integrations.Core.GenerateImage({ prompt: `${query} - infographic style 3` }),
                        base44.integrations.Core.GenerateImage({ prompt: `${query} - modern design style 4` })
                    ]).catch(() => []),

                    base44.integrations.Core.InvokeLLM({
                        prompt: `Search for information about: "${query}". Find relevant documents, articles, resources, and generate chart data if applicable.`,
                        add_context_from_internet: true,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                documents: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            title: { type: "string" },
                                            description: { type: "string" },
                                            type: { type: "string" },
                                            source: { type: "string" }
                                        }
                                    }
                                },
                                suggestions: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                chartData: {
                                    type: "object",
                                    properties: {
                                        showChart: { type: "boolean" },
                                        pieData: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    name: { type: "string" },
                                                    value: { type: "number" }
                                                }
                                            }
                                        },
                                        metricTitle: { type: "string" },
                                        metricValue: { type: "string" },
                                        metricChange: { type: "string" }
                                    }
                                }
                            }
                        }
                    })
                ]);

                setResults({
                    query,
                    loading: false,
                    text: textResponse || '',
                    images: imagesResponse?.filter(img => img?.url).map(img => img.url) || [],
                    documents: webResponse?.documents || [],
                    suggestions: webResponse?.suggestions || [],
                    chartData: webResponse?.chartData || null
                });
            } else {
                // GPT-4, Claude, Gemini: Simple text response only
                const textResponse = await base44.integrations.Core.InvokeLLM({
                    prompt: `You are ${selectedModel === 'gpt4' ? 'GPT-4o' : selectedModel === 'claude' ? 'Claude' : 'Gemini'}. Respond to: "${query}"${fileContext}`,
                    add_context_from_internet: true,
                    file_urls: attachedFiles.length > 0 ? attachedFiles.map(f => f.url) : undefined
                });

                setResults({
                    query,
                    loading: false,
                    text: textResponse || '',
                    images: [],
                    documents: [],
                    suggestions: [],
                    chartData: null
                });
            }

        } catch (error) {
            console.error('AI Hub error:', error);
            setResults({
                query,
                loading: false,
                text: 'Sorry, there was an error processing your request. Please try again.',
                images: [],
                documents: [],
                suggestions: [],
                chartData: null
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const clearResults = () => {
        setResults(null);
        setQuery('');
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Link to={createPageUrl('Home')} className="flex items-center gap-3 hover:opacity-80">
                              <img src={LOGO_URL} alt="1cPublishing" className="h-10 w-10 object-contain" />
                              <div>
                                  <span className="text-xl font-bold text-black">1cPublishing</span>
                                  <p className="text-xs font-medium" style={{ color: '#6B4EE6' }}>Ai Hub</p>
                              </div>
                            </Link>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hover:bg-gray-100"
                            style={{ color: '#6B4EE6' }}
                        >
                            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                    
                    {/* Model Selector */}
                    <div className="flex items-center gap-2">
                        {AI_MODELS.map(model => (
                            <button
                                key={model.id}
                                onClick={() => setSelectedModel(model.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                                    selectedModel === model.id 
                                        ? 'bg-purple-100 ring-2 ring-purple-500' 
                                        : 'hover:bg-gray-100'
                                }`}
                                title={model.description}
                            >
                                {model.isLogo ? (
                                    <img src={LOGO_URL} alt={model.name} className="w-5 h-5" />
                                ) : (
                                    <model.icon className="w-5 h-5" style={{ color: model.color }} />
                                )}
                                <span className="text-sm font-medium hidden md:inline">{model.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Left Sidebar */}
                <aside 
                    className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex-shrink-0`}
                >
                    <nav className="p-4 space-y-2">
                        {navMenuItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    item.label === 'AI Hub' 
                                        ? 'bg-purple-100 text-purple-700' 
                                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                                }`}
                            >
                                <item.icon className="w-5 h-5" style={{ color: '#6B4EE6' }} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 bg-gray-50 overflow-auto">
                    <div className="max-w-4xl mx-auto">
                        {/* Search Input */}
                        <div className={`transition-all duration-500 ${results ? 'mb-8' : 'mt-16'}`}>
                            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-5">
                                <Textarea
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask anything. Type @ for mentions."
                                    className="w-full border-0 resize-none text-lg focus:ring-0 min-h-[70px] max-h-[200px]"
                                    rows={2}
                                />
                                
                                {/* Attached Files */}
                                {attachedFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {attachedFiles.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full text-sm">
                                                <FileText className="w-4 h-4" style={{ color: '#6B4EE6' }} />
                                                <span className="text-gray-700 max-w-[150px] truncate">{file.name}</span>
                                                <button onClick={() => removeAttachedFile(i)} className="hover:text-red-500">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="rounded-lg hover:bg-gray-100"
                                            title="Add web URL"
                                            onClick={() => setShowUrlModal(true)}
                                        >
                                            <Globe className="w-5 h-5 text-gray-500" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="rounded-lg hover:bg-gray-100"
                                            title="Attach document"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Paperclip className="w-5 h-5 text-gray-500" />
                                        </Button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".txt,.pdf,.doc,.docx,.md,.csv,.rtf"
                                            multiple
                                            onChange={handleFileAttach}
                                            className="hidden"
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className={`rounded-lg ${isListening ? 'bg-red-100' : 'hover:bg-gray-100'}`}
                                            onClick={handleVoiceInput}
                                            title="Voice input"
                                        >
                                            <Mic className={`w-5 h-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!query.trim() || isLoading}
                                            className="rounded-lg text-white px-4"
                                            style={{ backgroundColor: '#6B4EE6' }}
                                            title="Submit"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <ArrowRight className="w-5 h-5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            
                            {!results && (
                                <p className="text-center text-gray-500 mt-4">
                                    Press Enter or click the button to Qwirey
                                </p>
                            )}
                        </div>

                        {/* Results Canvas */}
                        {results && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                {/* Query Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src={LOGO_URL} alt="Qwirey" className="w-8 h-8" />
                                        <div>
                                            <p className="text-sm text-gray-500">You asked:</p>
                                            <p className="font-medium text-gray-800">{results.query}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={clearResults}>
                                        <X className="w-4 h-4 mr-1" /> Clear
                                    </Button>
                                </div>

                                {/* Main Response */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="w-5 h-5" style={{ color: '#6B4EE6' }} />
                                        <h2 className="font-semibold text-gray-800">
                                            {selectedModel === 'qwirey' ? 'Qwirey' : selectedModel === 'gpt4' ? 'GPT-4o' : selectedModel === 'claude' ? 'Claude' : 'Gemini'} Response
                                        </h2>
                                    </div>
                                    
                                    {results.loading ? (
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Thinking...</span>
                                        </div>
                                    ) : (
                                        <div className="prose prose-gray max-w-none">
                                            <ReactMarkdown>{results.text}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>

                                {/* Charts (Qwirey only) */}
                                {selectedModel === 'qwirey' && results.chartData?.showChart && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {results.chartData.pieData?.length > 0 && (
                                            <PieChartCard 
                                                title="Data Distribution"
                                                variant="donut"
                                                data={results.chartData.pieData}
                                            />
                                        )}
                                        {results.chartData.metricTitle && (
                                            <MetricCard 
                                                title={results.chartData.metricTitle}
                                                subtitle="Analysis"
                                                value={results.chartData.metricValue || '0'}
                                                change={results.chartData.metricChange}
                                                changeType="positive"
                                                variant="white"
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Generated Images (Qwirey only) */}
                                {selectedModel === 'qwirey' && results.images?.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Image className="w-5 h-5" style={{ color: '#6B4EE6' }} />
                                            <h2 className="font-semibold text-gray-800">Generated Visuals</h2>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {results.images.map((url, i) => (
                                                <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                                                    <img src={url} alt={`Generated ${i+1}`} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full">
                                                            <ExternalLink className="w-4 h-4 text-gray-700" />
                                                        </a>
                                                        <a href={url} download className="p-2 bg-white rounded-full">
                                                            <Download className="w-4 h-4 text-gray-700" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Documents Found (Qwirey only) */}
                                {selectedModel === 'qwirey' && results.documents?.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FileText className="w-5 h-5" style={{ color: '#6B4EE6' }} />
                                            <h2 className="font-semibold text-gray-800">Related Resources</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {results.documents.map((doc, i) => (
                                                <div key={i} className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E0E7FF' }}>
                                                            <FileText className="w-5 h-5" style={{ color: '#6B4EE6' }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-medium text-gray-800 truncate">{doc.title}</h3>
                                                            <p className="text-sm text-gray-500 line-clamp-2">{doc.description}</p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{doc.type}</span>
                                                                <span className="text-xs text-gray-400">{doc.source}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Suggested Prompts (Qwirey only) */}
                                {selectedModel === 'qwirey' && results.suggestions?.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Lightbulb className="w-5 h-5" style={{ color: '#6B4EE6' }} />
                                            <h2 className="font-semibold text-gray-800">Continue Exploring</h2>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {results.suggestions.map((suggestion, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setQuery(suggestion)}
                                                    className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-all"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* URL Modal */}
            <Dialog open={showUrlModal} onOpenChange={setShowUrlModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Web URL</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-2">
                        <Input
                            value={webUrl}
                            onChange={(e) => setWebUrl(e.target.value)}
                            placeholder="https://example.com"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddWebUrl()}
                        />
                        <Button onClick={handleAddWebUrl} style={{ backgroundColor: '#6B4EE6' }} className="text-white">
                            Add
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Footer */}
            <footer className="py-6 bg-white border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <img src={LOGO_URL} alt="1cPublishing" className="h-8 w-8 object-contain grayscale" />
                        <nav className="flex flex-wrap justify-center gap-6 text-sm">
                            {footerLinks.map((link, i) => (
                                <a key={i} href={link.href} className="text-gray-600 hover:text-purple-600 transition-colors">{link.label}</a>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        © 2025 1cPublishing.com
                    </div>
                </div>
            </footer>
        </div>
    );
}