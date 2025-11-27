import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Globe, Paperclip, Mic, MicOff, X, Loader2, Copy, Check, FileText, Image as ImageIcon, ExternalLink, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LOGO_URL } from '@/components/NavigationConfig';
import ReactMarkdown from 'react-markdown';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { ERROR_CODES, getErrorCode } from '@/components/ErrorDisplay';

// AI Model Icons - Real brand colors and designs
const GPT4Icon = () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="#10a37f"/>
    </svg>
);

const ClaudeIcon = () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7">
        <circle cx="12" cy="12" r="10" fill="#cc785c"/>
        <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const GeminiIcon = () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7">
        <defs>
            <linearGradient id="gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4285f4"/>
                <stop offset="50%" stopColor="#9b72cb"/>
                <stop offset="100%" stopColor="#d96570"/>
            </linearGradient>
        </defs>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#gemini-grad)"/>
        <path d="M12 6l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L7 9.5l3.5-.5z" fill="white"/>
    </svg>
);

const QwireyIcon = () => (
    <img src={LOGO_URL} alt="Qwirey" className="w-7 h-7 rounded" />
);

// Send arrow icon matching the reference
const SendArrowIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const AI_MODELS = [
    { id: 'qwirey', name: 'Qwirey', icon: QwireyIcon, color: 'bg-purple-100 text-purple-700 border-purple-400', description: 'Advanced Ai' },
    { id: 'gpt4', name: 'GPT-4', icon: GPT4Icon, color: 'bg-emerald-50 text-emerald-700 border-emerald-400', description: 'OpenAI GPT-4 responses' },
    { id: 'claude', name: 'Claude', icon: ClaudeIcon, color: 'bg-orange-50 text-orange-700 border-orange-400', description: 'Anthropic Claude responses' },
    { id: 'gemini', name: 'Gemini', icon: GeminiIcon, color: 'bg-blue-50 text-blue-700 border-blue-400', description: 'Google Gemini responses' },
];

const CHART_COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981'];

export default function Qwirey() {
    useEffect(() => {
        document.title = 'Ai agent thats paradigm shifts and enchances your workflow.';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Agentic AI that adapts and enhances workflows, creating a new paradigm of productivity.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'AI agent, agentic AI');
    }, []);

    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState('qwirey');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);
    
    // URL Dialog
    const [showUrlDialog, setShowUrlDialog] = useState(false);
    const [webUrl, setWebUrl] = useState('');
    
    // File Upload
    const [attachedFile, setAttachedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const fileInputRef = useRef(null);
    
    // Mic
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            let finalTranscript = '';

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }
                setPrompt(finalTranscript + interimTranscript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onstart = () => {
                finalTranscript = prompt;
            };
        }
    }, [prompt]);

    const toggleMic = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error('Mic error:', e);
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAttachedFile(file);
        
        const textTypes = ['.txt', '.md', '.csv', '.json', '.xml', '.html', '.css', '.js'];
        const isTextFile = textTypes.some(ext => file.name.toLowerCase().endsWith(ext)) || file.type.startsWith('text/');
        
        if (isTextFile) {
            const text = await file.text();
            setFileContent(text);
        } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            try {
                setFileContent('Extracting PDF content...');
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
                    file_url,
                    json_schema: { type: "object", properties: { content: { type: "string", description: "The full text content of the document." } } }
                });
                setFileContent(extracted.output?.content || '[Could not extract content from PDF]');
            } catch (err) {
                console.error('PDF extraction error:', err);
                setFileContent('[PDF file attached, but content extraction failed. It will be analyzed by file content.]');
            }
        } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
            try {
                setFileContent('Extracting Word document content...');
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
                    file_url,
                    json_schema: { type: "object", properties: { content: { type: "string", description: "The full text content of the document." } } }
                });
                setFileContent(extracted.output?.content || '[Could not extract content from Word document]');
            } catch (err) {
                setFileContent('[Word document attached, but content extraction failed. It will be analyzed by file content.]');
            }
        } else {
            setFileContent(`[Attached file: ${file.name}]`);
        }
    };

    const removeFile = () => {
        setAttachedFile(null);
        setFileContent('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (followUpPrompt) => {
        const currentPrompt = typeof followUpPrompt === 'string' ? followUpPrompt : prompt;
        if (!currentPrompt.trim() && !fileContent) return;

        setLoading(true);
        setResult(null);

        const fullPrompt = fileContent
            ? `Referencing the following document content:\n\n---\n${fileContent}\n---\n\nAnswer the user's question: ${currentPrompt}`
            : currentPrompt;

        try {
            if (selectedModel === 'qwirey') {
                const [textResponse, imagesResponse, webDataResponse] = await Promise.all([
                    base44.integrations.Core.InvokeLLM({
                        prompt: `You are Qwirey, an advanced AI assistant by 1cPublishing. Provide a comprehensive, helpful response.\n\n${webUrl ? `Reference URL: ${webUrl}\n` : ''}User query: ${fullPrompt}\n\nAlso suggest 3 follow-up questions the user might want to ask.`,
                        add_context_from_internet: true,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                response: { type: "string" },
                                followUpQuestions: { type: "array", items: { type: "string" } },
                                sources: { type: "array", items: { type: "object", properties: { title: { type: "string" }, url: { type: "string" } } } }
                            }
                        }
                    }),
                    base44.integrations.Core.InvokeLLM({
                        prompt: `Generate 4 detailed image prompts related to: "${currentPrompt}". Each should be suitable for AI image generation.`,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                imagePrompts: { type: "array", items: { type: "string" } }
                            }
                        }
                    }),
                    base44.integrations.Core.InvokeLLM({
                        prompt: `For the topic "${currentPrompt}", generate realistic chart data if relevant (statistics, comparisons, trends). Return hasChartData: false if not applicable.`,
                        add_context_from_internet: true,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                hasChartData: { type: "boolean" },
                                lineChartData: { type: "array", items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } } } },
                                pieChartData: { type: "array", items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } } } },
                                chartTitle: { type: "string" },
                                chartDescription: { type: "string" }
                            }
                        }
                    })
                ]);

                const imagePrompts = imagesResponse?.imagePrompts?.slice(0, 4) || [];
                const generatedImages = await Promise.all(
                    imagePrompts.map(async (imgPrompt) => {
                        try {
                            const img = await base44.integrations.Core.GenerateImage({ prompt: imgPrompt });
                            return { prompt: imgPrompt, url: img.url };
                        } catch (e) {
                            console.error('Image generation error:', e);
                            return null;
                        }
                    })
                );

                setResult({
                    type: 'qwirey',
                    text: textResponse?.response || 'No response generated',
                    followUpQuestions: textResponse?.followUpQuestions || [],
                    sources: textResponse?.sources || [],
                    images: generatedImages.filter(Boolean),
                    chartData: webDataResponse?.hasChartData ? webDataResponse : null
                });

            } else {
                const modelPrompts = {
                    gpt4: 'You are GPT-4 by OpenAI. Provide a helpful, accurate, and detailed response.',
                    claude: 'You are Claude by Anthropic. Provide a thoughtful, nuanced, and well-reasoned response.',
                    gemini: 'You are Gemini by Google. Provide a comprehensive and informative response.'
                };

                const response = await base44.integrations.Core.InvokeLLM({
                    prompt: `${modelPrompts[selectedModel]}\n\n${webUrl ? `Reference URL: ${webUrl}\n` : ''}User: ${fullPrompt}`,
                    add_context_from_internet: true
                });

                setResult({
                    type: 'text',
                    model: selectedModel,
                    text: response
                });
            }
        } catch (error) {
            console.error('AI Error:', error);
            const errorCode = getErrorCode(error);
            const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.E500;
            setResult({
                type: 'error',
                errorCode,
                title: errorInfo.title,
                text: errorInfo.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result?.text || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFollowUp = (question) => {
        setPrompt(question);
        setResult(null);
        handleSubmit(question);
    };

    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                

                {/* Model Selection */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {AI_MODELS.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 transition-all ${
                                selectedModel === model.id
                                    ? `${model.color} shadow-md scale-105`
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                            }`}
                        >
                            <model.icon />
                            <span className="font-semibold">{model.name}</span>
                        </button>
                    ))}
                </div>

                {/* Attached indicators */}
                <div className="flex flex-wrap justify-center gap-3 mb-4 h-10">
                    {attachedFile && (
                        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-purple-700">{attachedFile.name}</span>
                            <button onClick={removeFile} className="text-purple-600 hover:text-purple-800">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {webUrl && (
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                            <Globe className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-700 truncate max-w-[200px]">{webUrl}</span>
                            <button onClick={() => setWebUrl('')} className="text-blue-600 hover:text-blue-800">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Input Box */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-5 mb-8">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask anything. Type @ for mentions."
                        className="w-full min-h-[105px] text-lg resize-none border-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    
                    <div className="flex items-center justify-end pt-4 border-t border-gray-100 gap-1">
                        <button
                            onClick={() => setShowUrlDialog(true)}
                            className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors"
                            title="Link a web URL"
                        >
                            <Globe className="w-5 h-5" />
                        </button>
                        
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors"
                            title="Attach a document (txt, pdf, doc, md, csv, json)"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.pdf,.doc,.docx,.md,.csv,.json,.xml,.html"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        
                        <button
                            onClick={toggleMic}
                            className={`p-2.5 rounded-lg transition-colors ${
                                isListening 
                                    ? 'bg-red-100 text-red-600 animate-pulse' 
                                    : 'hover:bg-gray-100 text-gray-500 hover:text-purple-600'
                            }`}
                            title={isListening ? 'Stop listening' : 'Start voice input'}
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                        
                        <button
                            onClick={() => handleSubmit()}
                            disabled={loading || (!prompt.trim() && !fileContent)}
                            className="p-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all ml-1"
                            title="Send"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <SendArrowIcon />
                            )}
                        </button>
                    </div>
                </div>

                {/* Results */}
                {result && (
                    <div className="space-y-6">
                        {result.type === 'error' ? (
                            <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-900">{result.title}</span>
                                        <p className="text-xs text-gray-500">Error Code: {result.errorCode}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">{result.text}</p>
                                <Button onClick={() => handleSubmit()} variant="outline" className="gap-2">
                                    Try Again
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {result.type === 'qwirey' ? (
                                                <img src={LOGO_URL} alt="Qwirey" className="w-10 h-10 rounded-lg" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    {AI_MODELS.find(m => m.id === result.model)?.icon && 
                                                        React.createElement(AI_MODELS.find(m => m.id === result.model).icon)
                                                    }
                                                </div>
                                            )}
                                            <span className="font-bold text-gray-900 text-lg">
                                                {result.type === 'qwirey' ? 'Qwirey' : AI_MODELS.find(m => m.id === result.model)?.name}
                                            </span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-purple-600">
                                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    
                                    <div className="prose prose-sm max-w-none text-gray-700">
                                        <ReactMarkdown>{result.text}</ReactMarkdown>
                                    </div>
                                </div>

                                {result.type === 'qwirey' && (
                            <>
                                {result.chartData?.hasChartData && (
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                        <h3 className="font-bold text-gray-900 mb-2">{result.chartData.chartTitle || 'Data Visualization'}</h3>
                                        <p className="text-sm text-gray-500 mb-4">{result.chartData.chartDescription}</p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {result.chartData.lineChartData?.length > 0 && (
                                                <div className="h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={result.chartData.lineChartData}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                            <YAxis tick={{ fontSize: 12 }} />
                                                            <Tooltip />
                                                            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                            
                                            {result.chartData.pieChartData?.length > 0 && (
                                                <div className="h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={result.chartData.pieChartData}
                                                                cx="50%"
                                                                cy="50%"
                                                                outerRadius={80}
                                                                dataKey="value"
                                                                label={({ name }) => name}
                                                            >
                                                                {result.chartData.pieChartData.map((entry, index) => (
                                                                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {result.images?.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <ImageIcon className="w-5 h-5 text-purple-600" />
                                            Generated Images
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {result.images.map((img, i) => (
                                                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                                                    <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {result.sources?.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Globe className="w-5 h-5 text-purple-600" />
                                            Sources & References
                                        </h3>
                                        <div className="space-y-2">
                                            {result.sources.map((source, i) => (
                                                <a
                                                    key={i}
                                                    href={source.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 hover:underline"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    {source.title}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {result.followUpQuestions?.length > 0 && (
                                    <div className="bg-purple-50 rounded-2xl border border-purple-200 p-6">
                                        <h3 className="font-bold text-purple-900 mb-4">Continue exploring</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.followUpQuestions.map((q, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleFollowUp(q)}
                                                    className="flex items-center gap-1 px-4 py-2 bg-white border border-purple-300 rounded-full text-sm text-purple-700 hover:bg-purple-100 transition-colors"
                                                >
                                                    {q}
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                            ))}
                                        </div>
                                        </div>
                                    )}
                                </>
                            )}
                            </>
                        )}
                    </div>
                )}

                {loading && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
                        <style>{`
                            @keyframes logoPulse {
                                0%, 100% { opacity: 0.4; transform: scale(1); }
                                50% { opacity: 0.7; transform: scale(1.03); }
                            }
                        `}</style>
                        <div className="relative mb-4 flex items-center justify-center mx-auto w-fit">
                            <div className="absolute w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
                            <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/622024f26_image-loading-logo.png" 
                                alt="Loading" 
                                className="w-12 h-12 object-contain grayscale opacity-50"
                                style={{ animation: 'logoPulse 1.5s ease-in-out infinite' }}
                            />
                        </div>
                        <p className="text-gray-600 font-medium">
                            {selectedModel === 'qwirey' 
                                ? 'Qwirey is thinking, generating images, and searching the web...'
                                : `${AI_MODELS.find(m => m.id === selectedModel)?.name} is thinking...`
                            }
                        </p>
                    </div>
                )}
            </div>

            <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Link a Web URL</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Input
                            value={webUrl}
                            onChange={(e) => setWebUrl(e.target.value)}
                            placeholder="https://example.com"
                            type="url"
                            className="text-base"
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowUrlDialog(false)}>Cancel</Button>
                            <Button 
                                onClick={() => setShowUrlDialog(false)} 
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                Add URL
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}