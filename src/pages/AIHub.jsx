import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Search, Globe, Paperclip, Mic, AudioLines, Sparkles, Bot, Lightbulb, FileText, Image, Loader2, X, ExternalLink, Download, Menu, ChevronLeft, Home, Users, Settings, HelpCircle, BookOpen, Ban, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from 'react-markdown';
import MetricCard from '../components/dashboard/MetricCard';
import PieChartCard from '../components/dashboard/PieChartCard';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/868a98750_1cPublishing-logo.png";

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
    const recognitionRef = useRef(null);

    const menuItems = [
        { icon: Sparkles, label: "AI Hub", href: createPageUrl('AIHub'), active: true },
        { icon: Home, label: "Dashboard", href: createPageUrl('Home') },
        { icon: BookOpen, label: "Publications", href: "#" },
        { icon: FileText, label: "Documents", href: "#" },
        { icon: Users, label: "Authors", href: "#" },
        { icon: Settings, label: "Settings", href: "#" },
        { icon: HelpCircle, label: "Help", href: "#" },
    ];

    const handleVoiceInput = () => {
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
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
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e) => {
            const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
            setQuery(transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const handleSubmit = async () => {
        if (!query.trim() || isLoading) return;
        
        setIsLoading(true);
        setResults({ query, loading: true, text: '', images: [], documents: [], suggestions: [], chartData: null });

        try {
            if (selectedModel === 'qwirey') {
                // Qwirey: Full experience with images, docs, charts
                const [textResponse, imagesResponse, webResponse] = await Promise.all([
                    base44.integrations.Core.InvokeLLM({
                        prompt: `You are Qwirey, an advanced AI assistant. Provide a comprehensive, well-structured response to: "${query}". 
                        Include relevant insights, explanations, and actionable information. Use markdown formatting.`,
                        add_context_from_internet: true
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
                    prompt: `You are ${selectedModel === 'gpt4' ? 'GPT-4o' : selectedModel === 'claude' ? 'Claude' : 'Gemini'}. Respond to: "${query}"`,
                    add_context_from_internet: true
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
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hover:bg-gray-100"
                            style={{ color: '#6B4EE6' }}
                        >
                            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                        <div className="flex items-center gap-3">
                            <img src={LOGO_URL} alt="1cPublishing" className="h-10 w-10 object-contain" />
                            <div>
                                <span className="text-xl font-bold" style={{ color: '#6B4EE6' }}>AI Hub</span>
                                <p className="text-xs text-gray-500">Powered by Qwirey</p>
                            </div>
                        </div>
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
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    item.active 
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
                                
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-lg"
                                            style={{ backgroundColor: '#E0E7FF' }}
                                            title="Search mode"
                                        >
                                            <Search className="w-5 h-5" style={{ color: '#6B4EE6' }} />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="rounded-lg hover:bg-gray-100"
                                            title="Disable suggestions"
                                        >
                                            <Ban className="w-5 h-5 text-gray-500" />
                                        </Button>
                                        <div className="w-px h-6 bg-gray-200 mx-1" />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="rounded-lg hover:bg-gray-100"
                                            title="Get ideas"
                                        >
                                            <Lightbulb className="w-5 h-5 text-gray-500" />
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="rounded-lg hover:bg-gray-100"
                                            title="Search web"
                                        >
                                            <Globe className="w-5 h-5 text-gray-500" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="rounded-lg hover:bg-gray-100"
                                            title="Copy to clipboard"
                                        >
                                            <Copy className="w-5 h-5 text-gray-500" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="rounded-lg hover:bg-gray-100"
                                            title="Attach file"
                                        >
                                            <Paperclip className="w-5 h-5 text-gray-500" />
                                        </Button>
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
                                                <AudioLines className="w-5 h-5" />
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

            {/* Footer */}
            <footer className="py-6 bg-white border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <img src={LOGO_URL} alt="1cPublishing" className="h-8 w-8 object-contain" />
                            <span className="font-semibold" style={{ color: '#6B4EE6' }}>1cPublishing</span>
                        </div>
                        
                        <nav className="flex flex-wrap justify-center gap-6 text-sm">
                            <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Contact Us</a>
                            <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Governance</a>
                            <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Cookie Policy</a>
                            <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Terms of Use</a>
                        </nav>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        © {new Date().getFullYear()} 1cPublishing. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}