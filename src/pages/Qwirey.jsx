import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Globe, Paperclip, Mic, MicOff, X, Loader2, Check, FileText, Image as ImageIcon, ExternalLink, ChevronRight, AlertTriangle, Download, Maximize2, StickyNote } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOGO_URL } from '@/components/NavigationConfig';
import ReactMarkdown from 'react-markdown';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import InfoCard from '@/components/dashboard/InfoCard';
import BrowserVisitorsCard from '@/components/dashboard/BrowserVisitorsCard';
import CountryVisitorsCard from '@/components/dashboard/CountryVisitorsCard';
import SocialMediaCard from '@/components/dashboard/SocialMediaCard';
import RankingPodium from '@/components/dashboard/RankingPodium';
import TimelineCard from '@/components/dashboard/TimelineCard';
import ProgressListCard from '@/components/dashboard/ProgressListCard';
import NotificationList from '@/components/dashboard/NotificationList';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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

// Helper to extract domain from URL
const extractDomain = (url) => {
    if (!url) return null;
    try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        return urlObj.hostname.replace('www.', '');
    } catch {
        const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\?\s]+)/);
        return match ? match[1] : url;
    }
};

// Parse text and convert markdown links to clickable badges
const TextWithLinks = ({ text }) => {
    if (!text) return null;
    
    // Match patterns like ([domain](url)) or [domain](url)
    const parts = [];
    let lastIndex = 0;
    const linkRegex = /\(?(\[([^\]]+)\]\(([^)]+)\))\)?/g;
    let match;
    
    while ((match = linkRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        }
        parts.push({ type: 'link', domain: match[2], url: match[3] });
        lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(lastIndex) });
    }
    
    if (parts.length === 0) {
        return <span>{text}</span>;
    }
    
    return (
        <span>
            {parts.map((part, i) => {
                if (part.type === 'text') {
                    return <span key={i}>{part.content}</span>;
                }
                const cleanDomain = extractDomain(part.url) || part.domain;
                return (
                    <a 
                        key={i}
                        href={part.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors px-1.5 py-0.5 bg-purple-50 hover:bg-purple-100 rounded mx-1"
                        title={part.url}
                    >
                        {cleanDomain}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                );
            })}
        </span>
    );
};

export default function Qwirey() {
    // Update URL for display only (aesthetic, not parsed)
    const updateUrl = (query, format) => {
        const basePath = window.location.pathname;
        if (query) {
            const querySlug = query.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 50);
            const formatSlug = format !== 'short' ? `/${format}` : '';
            window.history.pushState({}, '', `${basePath}/${querySlug}${formatSlug}`);
        }
    };

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
    
    // Response format
    const [responseFormat, setResponseFormat] = useState('short');
    const [formatLoading, setFormatLoading] = useState(false);
    
    // Image preview modal
    const [previewImage, setPreviewImage] = useState(null);
    
    // Writing style for Long format
    const [writingStyle, setWritingStyle] = useState('default');
    const [styleLoading, setStyleLoading] = useState(false);

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

        // Update URL with query
        updateUrl(currentPrompt, responseFormat);

        setLoading(true);
        setResult(null);

        // Build format instruction based on selected format
        const formatInstructions = {
            dynamic: 'Provide a helpful, informative response about the topic. Be clear and concise.',
            short: 'CRITICAL: Your response MUST be between 160 and 280 characters. Then add exactly 5 bullet points with key facts (each bullet under 60 chars). Format: First a short blurb (160-280 chars), then 5 bullets starting with •',
            long: 'IMPORTANT: Provide a detailed response with 6-8 well-spaced paragraphs. Add TWO line breaks between each paragraph for clear separation. Include thorough explanations and examples.',
            tabled: 'Provide a 2 sentence summary. Then provide structured data for a comparison with 4-5 items. Each item needs: name, pros (2-3 points), cons (2-3 points), and a rating out of 10.',
            reviews: 'Provide a brief intro sentence. Then provide 5 realistic user reviews with: reviewer name, rating (1-10), review text (2-3 sentences), and date.'
        };

        const formatInstruction = formatInstructions[responseFormat] || '';
        
        const fullPrompt = fileContent
            ? `${formatInstruction}\n\nReferencing the following document content:\n\n---\n${fileContent}\n---\n\nAnswer the user's question: ${currentPrompt}`
            : `${formatInstruction}\n\n${currentPrompt}`;

        try {
            if (selectedModel === 'qwirey') {
                // Build API calls based on selected format - only generate for current format
                const apiCalls = [
                    // Always get base response with sources and follow-ups
                    base44.integrations.Core.InvokeLLM({
                        prompt: `You are Qwirey, an advanced AI assistant by 1cPublishing.\n\n${webUrl ? `Reference URL: ${webUrl}\n` : ''}User query: ${currentPrompt}\n\nProvide 3 follow-up questions the user might want to ask.`,
                        add_context_from_internet: true,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                followUpQuestions: { type: "array", items: { type: "string" } },
                                sources: { type: "array", items: { type: "object", properties: { title: { type: "string" }, url: { type: "string" } } } }
                            }
                        }
                    })
                ];

                // Add format-specific call
                if (responseFormat === 'short') {
                    apiCalls.push(
                        base44.integrations.Core.InvokeLLM({
                            prompt: `For "${currentPrompt}", provide a SHORT response: a brief blurb (between 160 and 280 characters) and exactly 5 key bullet points (each under 60 chars).`,
                            add_context_from_internet: true,
                            response_json_schema: {
                                type: "object",
                                properties: {
                                    blurb: { type: "string" },
                                    bullets: { type: "array", items: { type: "string" } }
                                }
                            }
                        })
                    );
                } else if (responseFormat === 'long') {
                    apiCalls.push(
                        base44.integrations.Core.InvokeLLM({
                            prompt: `For "${currentPrompt}", provide a DETAILED response with 6-8 well-developed paragraphs. Include thorough explanations and examples.`,
                            add_context_from_internet: true,
                            response_json_schema: {
                                type: "object",
                                properties: {
                                    paragraphs: { type: "array", items: { type: "string" } }
                                }
                            }
                        })
                    );
                } else if (responseFormat === 'dynamic') {
                    apiCalls.push(
                        base44.integrations.Core.InvokeLLM({
                            prompt: `For "${currentPrompt}", provide a comprehensive overview with exactly 4 detailed paragraphs. Each paragraph should be 3-4 sentences covering different aspects of the topic.`,
                            add_context_from_internet: true,
                            response_json_schema: {
                                type: "object",
                                properties: {
                                    paragraphs: { type: "array", items: { type: "string" } }
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
                        }),
                        base44.integrations.Core.InvokeLLM({
                            prompt: `For "${currentPrompt}", generate dashboard data with: 3 info cards (short insights), 3 rankings (name + numeric value), 4 timeline events (time, title, description, status: completed/current/pending), 4 goals (label, current number, target number), 4 notifications (title, description, time, type: success/warning/info/error).`,
                            add_context_from_internet: true,
                            response_json_schema: {
                                type: "object",
                                properties: {
                                    infoCards: { type: "array", items: { type: "object", properties: { content: { type: "string" }, color: { type: "string" } } } },
                                    rankings: { type: "array", items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } } } },
                                    timeline: { type: "array", items: { type: "object", properties: { time: { type: "string" }, title: { type: "string" }, description: { type: "string" }, status: { type: "string" } } } },
                                    goals: { type: "array", items: { type: "object", properties: { label: { type: "string" }, current: { type: "number" }, target: { type: "number" } } } },
                                    notifications: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, time: { type: "string" }, type: { type: "string" } } } }
                                }
                            }
                        })
                    );
                } else if (responseFormat === 'tabled') {
                    apiCalls.push(
                        base44.integrations.Core.InvokeLLM({
                            prompt: `For "${currentPrompt}", create a comparison table. Provide: a 2-sentence summary, and 4-5 items to compare. Each item needs: name, 2-3 pros, 2-3 cons, and a rating 1-10.`,
                            add_context_from_internet: true,
                            response_json_schema: {
                                type: "object",
                                properties: {
                                    summary: { type: "string" },
                                    items: { type: "array", items: { type: "object", properties: { 
                                        name: { type: "string" }, 
                                        pros: { type: "array", items: { type: "string" } }, 
                                        cons: { type: "array", items: { type: "string" } }, 
                                        rating: { type: "number" } 
                                    } } }
                                }
                            }
                        })
                    );
                } else if (responseFormat === 'reviews') {
                    apiCalls.push(
                        (async () => {
                            const reviewsSchema = {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    intro: { type: "string" },
                                    reviews: { type: "array", items: { type: "object", properties: { 
                                        name: { type: "string" }, 
                                        rating: { type: "number" }, 
                                        text: { type: "string" }, 
                                        date: { type: "string" },
                                        source_url: { type: "string" }
                                    } } }
                                }
                            };
                            
                            // First attempt
                            let response = await base44.integrations.Core.InvokeLLM({
                                prompt: `IMPORTANT: Search the web thoroughly for "${currentPrompt}" reviews. 
                                
Find and return EXACTLY 10 real user reviews from review sites like Amazon, Reddit, Trustpilot, G2, Yelp, Google Reviews, CNET, TechRadar, or any relevant review platform.

Return:
- title: A title like "Reviews for [product/service name]"
- intro: A 2-3 sentence summary of the overall sentiment (max 400 chars)
- reviews: Array of 10 reviews, each with:
  - name: Reviewer username or name
  - rating: Score from 1-10
  - text: The actual review content (2-3 sentences)
  - date: When it was posted
  - source_url: The URL where this review was found

Be thorough in your search. These should be real reviews from real people.`,
                                add_context_from_internet: true,
                                response_json_schema: reviewsSchema
                            });
                            
                            // If no reviews or too few, retry with different prompt
                            if (!response?.reviews || response.reviews.length < 3) {
                                response = await base44.integrations.Core.InvokeLLM({
                                    prompt: `Search for user reviews and opinions about "${currentPrompt}". Look on Reddit discussions, Amazon reviews, tech review sites, social media, forums, or any platform where people share their experiences.

I need 10 reviews/opinions with:
- title: "User Reviews: ${currentPrompt}"
- intro: Brief overview of what people are saying
- reviews: 10 items with name, rating (1-10), text (the review), date, source_url

If exact reviews aren't available, find user opinions, comments, or discussions about this topic and present them in review format.`,
                                    add_context_from_internet: true,
                                    response_json_schema: reviewsSchema
                                });
                            }
                            
                            return response;
                        })()
                    );
                } else if (responseFormat === 'images') {
                    apiCalls.push(
                        base44.integrations.Core.InvokeLLM({
                            prompt: `Generate 8 detailed, creative image prompts related to: "${currentPrompt}". Each should be suitable for AI image generation and visually distinct.`,
                            response_json_schema: {
                                type: "object",
                                properties: {
                                    imagePrompts: { type: "array", items: { type: "string" } }
                                }
                            }
                        })
                    );
                }

                const responses = await Promise.all(apiCalls);
                const baseResponse = responses[0];

                // Process responses based on format
                let resultData = {
                    type: 'qwirey',
                    followUpQuestions: baseResponse?.followUpQuestions || [],
                    sources: baseResponse?.sources || []
                };

                if (responseFormat === 'short') {
                    resultData.shortData = responses[1];
                } else if (responseFormat === 'long') {
                    resultData.longData = responses[1];
                } else if (responseFormat === 'dynamic') {
                    const dynamicTextResponse = responses[1];
                    const imagesResponse = responses[2];
                    const webDataResponse = responses[3];
                    const dashboardDataResponse = responses[4];
                    
                    resultData.dynamicParagraphs = dynamicTextResponse?.paragraphs || [];
                    
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
                    
                    resultData.images = generatedImages.filter(Boolean);
                    resultData.chartData = webDataResponse?.hasChartData ? webDataResponse : null;
                    resultData.dashboardData = dashboardDataResponse;
                } else if (responseFormat === 'tabled') {
                    resultData.tabledData = responses[1];
                } else if (responseFormat === 'reviews') {
                    resultData.reviewsData = responses[1];
                } else if (responseFormat === 'images') {
                    const imagesResponse = responses[1];
                    const imagePrompts = imagesResponse?.imagePrompts?.slice(0, 8) || [];
                    const generatedImages = await Promise.all(
                        imagePrompts.map(async (imgPrompt) => {
                            try {
                                const img = await base44.integrations.Core.GenerateImage({ prompt: imgPrompt });
                                return { prompt: imgPrompt, url: img.url };
                            } catch (e) { return null; }
                        })
                    );
                    resultData.imagesData = generatedImages.filter(Boolean);
                }

                setResult(resultData);

            } else {
                const modelPrompts = {
                    gpt4: 'You are a helpful AI assistant similar to GPT-4. Provide detailed, accurate, and well-structured responses.',
                    claude: 'You are a helpful AI assistant similar to Claude. Provide thoughtful, nuanced, and well-reasoned responses.',
                    gemini: 'You are a helpful AI assistant similar to Gemini. Provide comprehensive and informative responses.'
                };

                const response = await base44.integrations.Core.InvokeLLM({
                    prompt: `${modelPrompts[selectedModel]}\n\nProvide a detailed response with multiple paragraphs covering the topic thoroughly.\n\n${webUrl ? `Reference URL: ${webUrl}\n\n` : ''}User question: ${fullPrompt}`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            response: { type: "string", description: "A detailed, comprehensive response with multiple paragraphs" }
                        }
                    }
                });

                const textResponse = response?.response || (typeof response === 'string' ? response : 'No response received');

                setResult({
                    type: 'text',
                    model: selectedModel,
                    text: textResponse
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

    const [noteSaved, setNoteSaved] = useState(false);
    
    const handleAddToNotes = async () => {
        let noteContent = '';
        let noteTitle = prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '');
        
        if (responseFormat === 'short' && result?.shortData) {
            noteContent = `<p>${result.shortData.blurb}</p><ul>${(result.shortData.bullets || []).map(b => `<li>${b}</li>`).join('')}</ul>`;
        } else if (responseFormat === 'long' && result?.longData) {
            noteContent = (result.longData.paragraphs || []).map(p => `<p>${p}</p>`).join('');
        } else if (responseFormat === 'reviews' && result?.reviewsData) {
            noteContent = `<h2>${result.reviewsData.title || 'Reviews'}</h2><p>${result.reviewsData.intro}</p>` + 
                (result.reviewsData.reviews || []).map(r => `<p><strong>${r.name}</strong> (${r.rating}/10): ${r.text}</p>`).join('');
        } else if (responseFormat === 'tabled' && result?.tabledData) {
            noteContent = `<p>${result.tabledData.summary}</p><ul>` + 
                (result.tabledData.items || []).map(i => `<li><strong>${i.name}</strong>: Pros - ${i.pros?.join(', ')} | Cons - ${i.cons?.join(', ')} | Rating: ${i.rating}/10</li>`).join('') + '</ul>';
        } else if (responseFormat === 'images' && result?.imagesData) {
            noteContent = `<p>Generated images for: ${prompt}</p><ul>` + 
                result.imagesData.map(img => `<li><img src="${img.url}" alt="${img.prompt}" style="max-width:200px" /><br/>${img.prompt}</li>`).join('') + '</ul>';
        } else if (responseFormat === 'dynamic' && result?.dashboardData) {
            noteContent = `<p>${result.text || ''}</p>`;
            if (result.dashboardData.infoCards?.length > 0) {
                noteContent += '<h3>Key Insights</h3><ul>' + result.dashboardData.infoCards.map(c => `<li>${c.content}</li>`).join('') + '</ul>';
            }
            if (result.dashboardData.rankings?.length > 0) {
                noteContent += '<h3>Rankings</h3><ol>' + result.dashboardData.rankings.map(r => `<li>${r.name}: ${r.value}</li>`).join('') + '</ol>';
            }
        } else if (result?.text) {
            noteContent = `<p>${result.text}</p>`;
        }
        
        await base44.entities.Note.create({
            title: noteTitle,
            content: noteContent,
            tags: ['Qwirey'],
            color: 'purple'
        });
        
        setNoteSaved(true);
        toast.success('Added to Notes');
        setTimeout(() => setNoteSaved(false), 2000);
    };

    const handleFollowUp = (question) => {
        setPrompt(question);
        setResult(null);
        handleSubmit(question);
    };

    const handleStyleChange = async (style) => {
        if (style === writingStyle || !result?.longData?.paragraphs) return;
        
        setWritingStyle(style);
        if (style === 'default') return; // Keep original
        
        setStyleLoading(true);
        try {
            const styleInstructions = {
                persuasive: 'Rewrite this content in a persuasive, compelling style that convinces the reader. Use emotional appeals, strong arguments, and call-to-action language.',
                technical: 'Rewrite this content in a technical, precise style with accurate terminology, data-focused language, and professional tone.',
                journalistic: 'Rewrite this content in a journalistic style with an inverted pyramid structure, objective tone, and clear factual reporting.',
                creative: 'Rewrite this content in a creative, engaging style with vivid imagery, storytelling elements, and dynamic language.',
                editorial: 'Rewrite this content in an editorial style with opinion-based analysis that interprets or critiques events, issues, or trends. Include clear perspective, persuasive arguments, and thoughtful commentary while maintaining credibility.'
            };
            
            const originalText = result.longData.paragraphs.join('\n\n');
            
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `${styleInstructions[style]}\n\nOriginal content:\n${originalText}\n\nRewrite into 6-8 paragraphs maintaining all the key information but transforming the writing style.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        paragraphs: { type: "array", items: { type: "string" } }
                    }
                }
            });
            
            setResult(prev => ({
                ...prev,
                longData: { ...prev.longData, paragraphs: response.paragraphs },
                originalLongData: prev.originalLongData || prev.longData
            }));
        } catch (error) {
            console.error('Style rewrite failed:', error);
        } finally {
            setStyleLoading(false);
        }
    };

    const handleFormatChange = async (newFormat) => {
        setResponseFormat(newFormat);
        
        // If no result yet, just change format
        if (!result) return;
        
        const currentPrompt = prompt;
        
        // Check if we already have data for this format
        if (newFormat === 'dynamic' && result.dashboardData) return;
        if (newFormat === 'tabled' && result.tabledData) return;
        if (newFormat === 'reviews' && result.reviewsData) return;
        if (newFormat === 'short' && result.shortData) return;
        if (newFormat === 'long' && result.longData) return;
        if (newFormat === 'images' && result.imagesData) return;
        
        // Generate data for the new format
        setFormatLoading(true);
        try {
            if (newFormat === 'dynamic' && !result.dashboardData) {
                const [dynamicTextResponse, imagesResponse, webDataResponse, dashboardDataResponse] = await Promise.all([
                    base44.integrations.Core.InvokeLLM({
                        prompt: `For "${currentPrompt}", provide a comprehensive overview with exactly 4 detailed paragraphs. Each paragraph should be 3-4 sentences covering different aspects of the topic.`,
                        add_context_from_internet: true,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                paragraphs: { type: "array", items: { type: "string" } }
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
                        prompt: `For the topic "${currentPrompt}", generate realistic chart data if relevant. Return hasChartData: false if not applicable.`,
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
                    }),
                    base44.integrations.Core.InvokeLLM({
                        prompt: `For "${currentPrompt}", generate dashboard data with: 3 info cards, 3 rankings, 4 timeline events, 4 goals, 4 notifications.`,
                        add_context_from_internet: true,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                infoCards: { type: "array", items: { type: "object", properties: { content: { type: "string" }, color: { type: "string" } } } },
                                rankings: { type: "array", items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } } } },
                                timeline: { type: "array", items: { type: "object", properties: { time: { type: "string" }, title: { type: "string" }, description: { type: "string" }, status: { type: "string" } } } },
                                goals: { type: "array", items: { type: "object", properties: { label: { type: "string" }, current: { type: "number" }, target: { type: "number" } } } },
                                notifications: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, time: { type: "string" }, type: { type: "string" } } } }
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
                        } catch (e) { return null; }
                    })
                );
                
                setResult(prev => ({
                    ...prev,
                    dynamicParagraphs: dynamicTextResponse?.paragraphs || [],
                    images: generatedImages.filter(Boolean),
                    chartData: webDataResponse?.hasChartData ? webDataResponse : null,
                    dashboardData: dashboardDataResponse
                }));
            } else if (newFormat === 'tabled' && !result.tabledData) {
                const tabledResponse = await base44.integrations.Core.InvokeLLM({
                    prompt: `For "${currentPrompt}", create a comparison table. Provide: a 2-sentence summary, and 4-5 items to compare. Each item needs: name, 2-3 pros, 2-3 cons, and a rating 1-10.`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            summary: { type: "string" },
                            items: { type: "array", items: { type: "object", properties: { 
                                name: { type: "string" }, 
                                pros: { type: "array", items: { type: "string" } }, 
                                cons: { type: "array", items: { type: "string" } }, 
                                rating: { type: "number" } 
                            } } }
                        }
                    }
                });
                setResult(prev => ({ ...prev, tabledData: tabledResponse }));
            } else if (newFormat === 'reviews' && !result.reviewsData) {
                const reviewsSchema = {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        intro: { type: "string" },
                        reviews: { type: "array", items: { type: "object", properties: { 
                            name: { type: "string" }, 
                            rating: { type: "number" }, 
                            text: { type: "string" }, 
                            date: { type: "string" },
                            source_url: { type: "string" }
                        } } }
                    }
                };
                
                let reviewsResponse = await base44.integrations.Core.InvokeLLM({
                    prompt: `IMPORTANT: Search the web thoroughly for "${currentPrompt}" reviews. 
                    
Find and return EXACTLY 10 real user reviews from review sites like Amazon, Reddit, Trustpilot, G2, Yelp, Google Reviews, CNET, TechRadar, or any relevant review platform.

Return:
- title: A title like "Reviews for [product/service name]"
- intro: A 2-3 sentence summary of the overall sentiment (max 400 chars)
- reviews: Array of 10 reviews, each with:
  - name: Reviewer username or name
  - rating: Score from 1-10
  - text: The actual review content (2-3 sentences)
  - date: When it was posted
  - source_url: The URL where this review was found`,
                    add_context_from_internet: true,
                    response_json_schema: reviewsSchema
                });
                
                // Retry if no reviews found
                if (!reviewsResponse?.reviews || reviewsResponse.reviews.length < 3) {
                    reviewsResponse = await base44.integrations.Core.InvokeLLM({
                        prompt: `Search for user reviews and opinions about "${currentPrompt}". Look on Reddit, Amazon, tech sites, forums, or any platform where people share experiences.

I need 10 reviews with: title, intro, and reviews array (name, rating 1-10, text, date, source_url).`,
                        add_context_from_internet: true,
                        response_json_schema: reviewsSchema
                    });
                }
                
                setResult(prev => ({ ...prev, reviewsData: reviewsResponse }));
            } else if (newFormat === 'short' && !result.shortData) {
                const shortResponse = await base44.integrations.Core.InvokeLLM({
                    prompt: `For "${currentPrompt}", provide a SHORT response: a brief blurb (between 160 and 280 characters) and exactly 5 key bullet points (each under 60 chars).`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            blurb: { type: "string" },
                            bullets: { type: "array", items: { type: "string" } }
                        }
                    }
                });
                setResult(prev => ({ ...prev, shortData: shortResponse }));
            } else if (newFormat === 'long' && !result.longData) {
                const longResponse = await base44.integrations.Core.InvokeLLM({
                    prompt: `For "${currentPrompt}", provide a DETAILED response with 6-8 well-developed paragraphs. Include thorough explanations and examples.`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            paragraphs: { type: "array", items: { type: "string" } }
                        }
                    }
                });
                setResult(prev => ({ ...prev, longData: longResponse }));
            } else if (newFormat === 'images' && !result.imagesData) {
                const imagesResponse = await base44.integrations.Core.InvokeLLM({
                    prompt: `Generate 8 detailed, creative image prompts related to: "${currentPrompt}". Each should be suitable for AI image generation and visually distinct.`,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            imagePrompts: { type: "array", items: { type: "string" } }
                        }
                    }
                });
                const imagePrompts = imagesResponse?.imagePrompts?.slice(0, 8) || [];
                const generatedImages = await Promise.all(
                    imagePrompts.map(async (imgPrompt) => {
                        try {
                            const img = await base44.integrations.Core.GenerateImage({ prompt: imgPrompt });
                            return { prompt: imgPrompt, url: img.url };
                        } catch (e) { return null; }
                    })
                );
                setResult(prev => ({ ...prev, imagesData: generatedImages.filter(Boolean) }));
            }
        } catch (error) {
            console.error('Format generation error:', error);
        } finally {
            setFormatLoading(false);
        }
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
                    
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                        {/* Top row - Icons and Send */}
                        <div className="flex items-center justify-between">
                            {/* Left side - URL, Paperclip, Mic */}
                            <div className="flex items-center gap-1">
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
                            </div>
                            
                            {/* Right side - Send */}
                            <button
                                onClick={() => handleSubmit()}
                                disabled={loading || (!prompt.trim() && !fileContent)}
                                className="p-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                title="Send"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <SendArrowIcon />
                                )}
                            </button>
                        </div>
                        
                        {/* Bottom row - Format buttons */}
                        {selectedModel === 'qwirey' && (
                            <div className="grid grid-cols-3 md:flex md:items-center gap-1 bg-gray-100 rounded-xl p-1">
                                {[
                                    { id: 'short', label: 'Short' },
                                    { id: 'long', label: 'Long' },
                                    { id: 'reviews', label: 'Reviews' },
                                    { id: 'images', label: 'Images' },
                                    { id: 'tabled', label: 'Tabled' },
                                    { id: 'dynamic', label: 'Dynamic' },
                                ].map((format) => (
                                    <button
                                        key={format.id}
                                        onClick={() => handleFormatChange(format.id)}
                                        disabled={formatLoading}
                                        className={`md:flex-1 h-10 rounded-lg text-xs font-medium transition-all ${
                                            responseFormat === format.id
                                                ? 'bg-white text-purple-700 shadow-sm border border-purple-400'
                                                : 'text-gray-500 hover:text-gray-700'
                                        } ${formatLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {format.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results */}
                {result && !formatLoading && (
                    result.type === 'text' ||
                    result.type === 'error' ||
                    (responseFormat === 'short' && result.shortData) ||
                    (responseFormat === 'long' && result.longData) ||
                    (responseFormat === 'tabled' && result.tabledData) ||
                    (responseFormat === 'reviews' && result.reviewsData) ||
                    (responseFormat === 'images' && result.imagesData) ||
                    (responseFormat === 'dynamic' && result.dashboardData)
                ) ? (
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
                                              <div>
                                                  <span className="font-bold text-gray-900 text-lg block">
                                                      {result.type === 'qwirey' ? 'Qwirey' : AI_MODELS.find(m => m.id === result.model)?.name}
                                                  </span>
                                                  <span className="text-xs text-gray-400">
                                                      {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                  </span>
                                              </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                              {responseFormat === 'long' && result.longData && (
                                                  <div className="flex items-center gap-2">
                                                      <Select value={writingStyle} onValueChange={handleStyleChange} disabled={styleLoading}>
                                                          <SelectTrigger className="w-36 h-9">
                                                              <SelectValue placeholder="Style" />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                              <SelectItem value="default">Default</SelectItem>
                                                              <SelectItem value="persuasive">Persuasive</SelectItem>
                                                              <SelectItem value="technical">Technical</SelectItem>
                                                              <SelectItem value="journalistic">Journalistic</SelectItem>
                                                              <SelectItem value="creative">Creative</SelectItem>
                                                              <SelectItem value="editorial">Editorial</SelectItem>
                                                          </SelectContent>
                                                      </Select>
                                                      {styleLoading && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
                                                  </div>
                                              )}
                                              <Button variant="outline" onClick={handleAddToNotes} className="text-purple-600 gap-1.5 h-9">
                                                  {noteSaved ? <Check className="w-4 h-4 text-green-500" /> : <StickyNote className="w-4 h-4" />}
                                                  {noteSaved ? 'Saved' : 'Add to Notes'}
                                              </Button>
                                          </div>
                                      </div>
                                    
                                    {/* SHORT FORMAT */}
                                    {responseFormat === 'short' && result.shortData && (
                                        <div className="space-y-4">
                                            <p className="text-gray-700 text-base leading-relaxed">
                                                {result.shortData.blurb}
                                            </p>
                                            {result.shortData.bullets?.length > 0 && (
                                                <ul className="space-y-3 mt-4 bg-gray-50 rounded-xl p-4">
                                                    {result.shortData.bullets.slice(0, 5).map((bullet, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-gray-700">
                                                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium flex-shrink-0">{i + 1}</span>
                                                            <span>{bullet}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* LONG FORMAT */}
                                    {responseFormat === 'long' && result.longData && (
                                        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
                                            {result.longData.paragraphs?.map((para, i) => (
                                                <p key={i} className="text-gray-700 leading-relaxed"><TextWithLinks text={para} /></p>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* TABLED FORMAT */}
                                    {responseFormat === 'tabled' && result.tabledData && (
                                        <div className="space-y-4">
                                            <p className="text-gray-700 mb-4">{result.tabledData.summary}</p>
                                            <div className="rounded-xl border border-gray-200 overflow-hidden">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-purple-50">
                                                            <TableHead className="font-semibold text-purple-900">Option</TableHead>
                                                            <TableHead className="font-semibold text-purple-900">Pros</TableHead>
                                                            <TableHead className="font-semibold text-purple-900">Cons</TableHead>
                                                            <TableHead className="font-semibold text-purple-900 text-center">Rating</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {result.tabledData.items?.map((item, i) => (
                                                            <TableRow key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                                                                <TableCell className="text-green-700">
                                                                    <ul className="list-disc list-inside space-y-1">
                                                                        {item.pros?.map((p, j) => <li key={j}>{p}</li>)}
                                                                    </ul>
                                                                </TableCell>
                                                                <TableCell className="text-red-600">
                                                                    <ul className="list-disc list-inside space-y-1">
                                                                        {item.cons?.map((c, j) => <li key={j}>{c}</li>)}
                                                                    </ul>
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                                                                        item.rating >= 8 ? 'bg-green-100 text-green-700' :
                                                                        item.rating >= 6 ? 'bg-yellow-100 text-yellow-700' :
                                                                        'bg-red-100 text-red-700'
                                                                    }`}>
                                                                        {item.rating}
                                                                    </span>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* REVIEWS FORMAT */}
                                    {responseFormat === 'reviews' && result.reviewsData && (
                                        <div className="space-y-6">
                                            <div className="mb-6">
                                                <h2 className="text-xl font-bold text-gray-900 mb-2">{result.reviewsData.title || 'User Reviews'}</h2>
                                                <p className="text-gray-600 leading-relaxed"><TextWithLinks text={(result.reviewsData.intro || '').slice(0, 400)} /></p>
                                            </div>
                                            {(!result.reviewsData.reviews || result.reviewsData.reviews.length === 0) ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <p>No reviews found for this topic. Try a different search term like a product name, service, or business.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {result.reviewsData.reviews.slice(0, 10).map((review, i) => (
                                                        <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                                                        {review.name?.charAt(0) || 'U'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-gray-900">{review.name}</p>
                                                                        <p className="text-xs text-gray-500">{review.date}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-0.5">
                                                                    {[...Array(5)].map((_, j) => (
                                                                        <svg key={j} className={`w-5 h-5 ${j < Math.round(review.rating / 2) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                        </svg>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <p className="text-gray-700 leading-relaxed"><TextWithLinks text={review.text} /></p>
                                                            {review.source_url && (
                                                                <a 
                                                                    href={review.source_url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 transition-colors px-2 py-1 bg-purple-50 hover:bg-purple-100 rounded mt-2"
                                                                >
                                                                    {extractDomain(review.source_url)}
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* IMAGES FORMAT */}
                                    {responseFormat === 'images' && result.imagesData && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {result.imagesData.map((img, i) => (
                                                    <div 
                                                        key={i} 
                                                        className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                                                        onClick={() => setPreviewImage(img)}
                                                    >
                                                        <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Maximize2 className="w-8 h-8 text-white" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* DYNAMIC FORMAT */}
                                    {responseFormat === 'dynamic' && (
                                        <div className="space-y-6">
                                            {/* 4 Paragraphs of Text */}
                                            {result.dynamicParagraphs?.length > 0 && (
                                                <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
                                                    {result.dynamicParagraphs.slice(0, 4).map((para, i) => (
                                                        <p key={i} className="text-gray-700 leading-relaxed"><TextWithLinks text={para} /></p>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {result.type === 'qwirey' && result.dashboardData && (
                                                <>
                                                    {/* Info Cards - Clean text, remove URLs */}
                                                    {result.dashboardData.infoCards?.length > 0 && (
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            {result.dashboardData.infoCards.slice(0, 3).map((card, i) => {
                                                                // Clean content: remove URLs, markdown links, and limit length
                                                                const cleanContent = (card.content || '')
                                                                    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                                                                    .replace(/https?:\/\/[^\s)]+/g, '')
                                                                    .replace(/\([^)]*\)/g, '')
                                                                    .trim()
                                                                    .slice(0, 150);
                                                                return (
                                                                    <InfoCard 
                                                                        key={i} 
                                                                        content={cleanContent} 
                                                                        bgColor={['#8b5cf6', '#3b82f6', '#10b981'][i]} 
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Rankings - Simplified display */}
                                                    {result.dashboardData.rankings?.length >= 3 && (
                                                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                                            <h3 className="font-semibold text-gray-900 mb-4">Top Rankings</h3>
                                                            <div className="grid grid-cols-3 gap-4">
                                                                {result.dashboardData.rankings.slice(0, 3).map((r, i) => (
                                                                    <div key={i} className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
                                                                        <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center text-white font-bold ${
                                                                            i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-600'
                                                                        }`}>
                                                                            {i + 1}
                                                                        </div>
                                                                        <p className="font-medium text-gray-900 text-sm line-clamp-2">{r.name}</p>
                                                                        <p className="text-purple-600 font-bold mt-1">
                                                                            {typeof r.value === 'number' && r.value > 1000000 
                                                                                ? `${(r.value / 1000000000).toFixed(1)}B` 
                                                                                : typeof r.value === 'number' && r.value > 1000 
                                                                                    ? `${(r.value / 1000).toFixed(0)}K`
                                                                                    : r.value}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Timeline - Separate */}
                                                    {result.dashboardData.timeline?.length > 0 && (
                                                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                                            <h3 className="font-semibold text-gray-900 mb-4">Activity Timeline</h3>
                                                            <div className="space-y-4">
                                                                {result.dashboardData.timeline.slice(0, 4).map((e, i) => (
                                                                    <div key={i} className="flex gap-4">
                                                                        <div className="flex flex-col items-center">
                                                                            <div className={`w-3 h-3 rounded-full ${e.status === 'completed' ? 'bg-green-500' : e.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                                                            {i < 3 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                                                                        </div>
                                                                        <div className="flex-1 pb-4">
                                                                            <p className="text-xs text-gray-500">{e.time || 'Now'}</p>
                                                                            <p className="font-medium text-gray-900">{e.title}</p>
                                                                            <p className="text-sm text-gray-600"><TextWithLinks text={e.description} /></p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Goals - Separate */}
                                                    {result.dashboardData.goals?.length > 0 && (
                                                        <ProgressListCard 
                                                            title="Goals Progress"
                                                            items={result.dashboardData.goals.slice(0, 4).map((g, i) => ({
                                                                label: g.label,
                                                                value: Math.min(100, Math.round((g.current / g.target) * 100)),
                                                                current: String(g.current),
                                                                target: String(g.target),
                                                                color: ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B'][i % 4]
                                                            }))}
                                                        />
                                                    )}
                                                    
                                                    {/* Notifications - Separate */}
                                                    {result.dashboardData.notifications?.length > 0 && (
                                                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                                            <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
                                                            <div className="space-y-3">
                                                                {result.dashboardData.notifications.slice(0, 4).map((n, i) => (
                                                                    <div key={i} className={`p-3 rounded-lg border ${
                                                                        n.type === 'success' ? 'bg-green-50 border-green-200' :
                                                                        n.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                                                        n.type === 'error' ? 'bg-red-50 border-red-200' :
                                                                        'bg-blue-50 border-blue-200'
                                                                    }`}>
                                                                        <div className="flex justify-between items-start">
                                                                            <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                                                                            <span className="text-xs text-gray-500">{n.time}</span>
                                                                        </div>
                                                                        <p className="text-sm text-gray-600 mt-1"><TextWithLinks text={n.description} /></p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* DEFAULT (other models) */}
                                    {result.type !== 'qwirey' && (
                                        <div className="prose prose-sm max-w-none text-gray-700">
                                            <ReactMarkdown>{result.text}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>

                                {result.type === 'qwirey' && (
                            <>
                                {result.chartData?.hasChartData && (responseFormat === 'dynamic') && (
                                    <>
                                        {result.chartData.lineChartData?.length > 0 && (
                                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                                <h3 className="font-bold text-gray-900 mb-2">{result.chartData.chartTitle || 'Bar Chart'}</h3>
                                                <p className="text-sm text-gray-500 mb-4">{result.chartData.chartDescription}</p>
                                                <div className="h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={result.chartData.lineChartData}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                                                            <YAxis tick={{ fontSize: 12 }} />
                                                            <Tooltip />
                                                            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {result.chartData.pieChartData?.length > 0 && (
                                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                                <h3 className="font-bold text-gray-900 mb-4">Distribution</h3>
                                                <div className="h-72">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={result.chartData.pieChartData}
                                                                cx="50%"
                                                                cy="50%"
                                                                outerRadius={90}
                                                                dataKey="value"
                                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                                labelLine={true}
                                                            >
                                                                {result.chartData.pieChartData.map((entry, index) => (
                                                                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip formatter={(value) => value.toLocaleString()} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {result.images?.length > 0 && (responseFormat === 'dynamic' || responseFormat === 'reviews') && (
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
                                            Sources
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.sources.map((source, i) => (
                                                <a
                                                    key={i}
                                                    href={source.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    {source.title?.split(' ').slice(0, 3).join(' ') || 'Source'}
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
                ) : null}

                {(loading || formatLoading) && (
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
                                                  {formatLoading 
                                                      ? 'Generating your Qwirey...'
                                                      : selectedModel === 'qwirey' 
                                                          ? 'Generating your Qwirey...'
                                                          : `${AI_MODELS.find(m => m.id === selectedModel)?.name} is thinking...`
                                                  }
                                              </p>
                                          </div>
                                      )}
            </div>

            {/* Image Preview Modal */}
            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle className="text-lg">Image Preview</DialogTitle>
                    </DialogHeader>
                    {previewImage && (
                        <div className="p-4">
                            <img 
                                src={previewImage.url} 
                                alt={previewImage.prompt} 
                                className="w-full max-h-[70vh] object-contain rounded-lg"
                            />
                            <p className="text-sm text-gray-500 mt-3 mb-4">{previewImage.prompt}</p>
                            <a
                                href={previewImage.url}
                                download="qwirey-image.png"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download Image
                            </a>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

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