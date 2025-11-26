import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, XCircle, Send, FileText, Download, CreditCard, MessageSquare, Bot, Sparkles, Image, Upload, Mail, Icons, Search } from "lucide-react";
import * as LucideIcons from "lucide-react";

export default function TestFunctions() {
    const [loading, setLoading] = useState({});
    const [results, setResults] = useState({});
    const [errors, setErrors] = useState({});

    const runTest = async (name, functionName, params = {}) => {
        setLoading(prev => ({ ...prev, [name]: true }));
        setResults(prev => ({ ...prev, [name]: null }));
        setErrors(prev => ({ ...prev, [name]: null }));
        
        try {
            const response = await base44.functions.invoke(functionName, params);
            setResults(prev => ({ ...prev, [name]: response.data }));
        } catch (err) {
            setErrors(prev => ({ ...prev, [name]: err.response?.data?.error || err.message || 'Failed' }));
        } finally {
            setLoading(prev => ({ ...prev, [name]: false }));
        }
    };

    const downloadFile = async (name, functionName, params, filename) => {
        setLoading(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: null }));
        
        try {
            const response = await base44.functions.invoke(functionName, params);
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            setResults(prev => ({ ...prev, [name]: { success: true, message: `Downloaded ${filename}` } }));
        } catch (err) {
            setErrors(prev => ({ ...prev, [name]: err.message || 'Download failed' }));
        } finally {
            setLoading(prev => ({ ...prev, [name]: false }));
        }
    };

    const ResultDisplay = ({ name }) => (
        <>
            {results[name] && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                    <div className="flex items-center gap-2 text-green-700 mb-1">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Success</span>
                    </div>
                    <pre className="text-xs text-gray-600 overflow-auto max-h-40 whitespace-pre-wrap">
                        {typeof results[name] === 'object' ? JSON.stringify(results[name], null, 2) : results[name]}
                    </pre>
                </div>
            )}
            {errors[name] && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 text-sm">
                        <XCircle className="w-4 h-4" />
                        <span>{errors[name]}</span>
                    </div>
                </div>
            )}
        </>
    );

    const TestButton = ({ name, onClick, children }) => (
        <Button onClick={onClick} disabled={loading[name]} size="sm">
            {loading[name] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </Button>
    );

    // Form states
    const [chatMessage, setChatMessage] = useState("Tell me a joke about programming");
    const [embedText, setEmbedText] = useState("Hello world");
    const [smsTo, setSmsTo] = useState("");
    const [smsBody, setSmsBody] = useState("Test message from Base44");
    
    // LLM states
    const [llmPrompt, setLlmPrompt] = useState("What is the capital of France?");
    const [imagePrompt, setImagePrompt] = useState("A beautiful sunset over mountains");
    const [emailTo, setEmailTo] = useState("");
    const [emailSubject, setEmailSubject] = useState("Test Email");
    const [emailBody, setEmailBody] = useState("This is a test email from Base44.");
    const [iconSearch, setIconSearch] = useState("");
    
    // InvokeLLM test function
    const testLLM = async (name, prompt, options = {}) => {
        setLoading(prev => ({ ...prev, [name]: true }));
        setResults(prev => ({ ...prev, [name]: null }));
        setErrors(prev => ({ ...prev, [name]: null }));
        
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                ...options
            });
            setResults(prev => ({ ...prev, [name]: response }));
        } catch (err) {
            setErrors(prev => ({ ...prev, [name]: err.message || 'Failed' }));
        } finally {
            setLoading(prev => ({ ...prev, [name]: false }));
        }
    };
    
    // GenerateImage test
    const testGenerateImage = async () => {
        setLoading(prev => ({ ...prev, generateImage: true }));
        setResults(prev => ({ ...prev, generateImage: null }));
        setErrors(prev => ({ ...prev, generateImage: null }));
        
        try {
            const response = await base44.integrations.Core.GenerateImage({
                prompt: imagePrompt
            });
            setResults(prev => ({ ...prev, generateImage: response }));
        } catch (err) {
            setErrors(prev => ({ ...prev, generateImage: err.message || 'Failed' }));
        } finally {
            setLoading(prev => ({ ...prev, generateImage: false }));
        }
    };
    
    // SendEmail test
    const testSendEmail = async () => {
        setLoading(prev => ({ ...prev, sendEmail: true }));
        setResults(prev => ({ ...prev, sendEmail: null }));
        setErrors(prev => ({ ...prev, sendEmail: null }));
        
        try {
            const response = await base44.integrations.Core.SendEmail({
                to: emailTo,
                subject: emailSubject,
                body: emailBody
            });
            setResults(prev => ({ ...prev, sendEmail: response }));
        } catch (err) {
            setErrors(prev => ({ ...prev, sendEmail: err.message || 'Failed' }));
        } finally {
            setLoading(prev => ({ ...prev, sendEmail: false }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Backend Functions Test Suite</h1>
                <p className="text-gray-500 mb-6">Test all your backend integrations</p>
                
                <Tabs defaultValue="llm" className="space-y-4">
                    <TabsList className="flex flex-wrap gap-1 h-auto p-1">
                        <TabsTrigger value="llm"><Sparkles className="w-4 h-4 mr-1" /> LLMs</TabsTrigger>
                        <TabsTrigger value="integrations"><Image className="w-4 h-4 mr-1" /> Integrations</TabsTrigger>
                        <TabsTrigger value="openai"><Bot className="w-4 h-4 mr-1" /> OpenAI</TabsTrigger>
                        <TabsTrigger value="stripe"><CreditCard className="w-4 h-4 mr-1" /> Stripe</TabsTrigger>
                        <TabsTrigger value="twilio"><MessageSquare className="w-4 h-4 mr-1" /> Twilio</TabsTrigger>
                        <TabsTrigger value="files"><FileText className="w-4 h-4 mr-1" /> Files</TabsTrigger>
                        <TabsTrigger value="webhooks"><Send className="w-4 h-4 mr-1" /> Webhooks</TabsTrigger>
                            <TabsTrigger value="icons"><Icons className="w-4 h-4 mr-1" /> Icons</TabsTrigger>
                    </TabsList>

                    {/* LLM Tab */}
                    <TabsContent value="llm" className="space-y-4">
                        <Card className="mb-4">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Test Prompt</CardTitle>
                                <CardDescription>Enter a prompt to test with different LLM models</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea 
                                    value={llmPrompt} 
                                    onChange={(e) => setLlmPrompt(e.target.value)}
                                    placeholder="Enter your test prompt..."
                                    rows={2}
                                />
                            </CardContent>
                        </Card>

                        <h3 className="font-semibold text-gray-700 mb-2">OpenAI Models</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">GPT-4o</CardTitle>
                                    <CardDescription>Most advanced multimodal model</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-1 flex-wrap">
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Text Generation</span>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Code</span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Vision</span>
                                    </div>
                                    <TestButton name="gpt4o" onClick={() => testLLM('gpt4o', llmPrompt)}>
                                        Test GPT-4o
                                    </TestButton>
                                    <ResultDisplay name="gpt4o" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">GPT-4o-mini</CardTitle>
                                    <CardDescription>Faster, cost-effective version</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-1 flex-wrap">
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Text Generation</span>
                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Fast Response</span>
                                    </div>
                                    <TestButton name="gpt4omini" onClick={() => testLLM('gpt4omini', llmPrompt)}>
                                        Test GPT-4o-mini
                                    </TestButton>
                                    <ResultDisplay name="gpt4omini" />
                                </CardContent>
                            </Card>
                        </div>

                        <h3 className="font-semibold text-gray-700 mb-2 mt-6">Anthropic Claude Models</h3>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Claude 3.5 Sonnet</CardTitle>
                                    <CardDescription>Enhanced reasoning and coding</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-1 flex-wrap">
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Advanced Reasoning</span>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Code</span>
                                    </div>
                                    <TestButton name="claudeSonnet" onClick={() => testLLM('claudeSonnet', llmPrompt)}>
                                        Test Claude Sonnet
                                    </TestButton>
                                    <ResultDisplay name="claudeSonnet" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Claude 3 Opus</CardTitle>
                                    <CardDescription>Most powerful for complex tasks</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-1 flex-wrap">
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Complex Tasks</span>
                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Research</span>
                                    </div>
                                    <TestButton name="claudeOpus" onClick={() => testLLM('claudeOpus', llmPrompt)}>
                                        Test Claude Opus
                                    </TestButton>
                                    <ResultDisplay name="claudeOpus" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Claude 3 Haiku</CardTitle>
                                    <CardDescription>Fast and lightweight</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-1 flex-wrap">
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Speed</span>
                                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">Cost-Effective</span>
                                    </div>
                                    <TestButton name="claudeHaiku" onClick={() => testLLM('claudeHaiku', llmPrompt)}>
                                        Test Claude Haiku
                                    </TestButton>
                                    <ResultDisplay name="claudeHaiku" />
                                </CardContent>
                            </Card>
                        </div>

                        <h3 className="font-semibold text-gray-700 mb-2 mt-6">Google Gemini Models</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Gemini 1.5 Pro</CardTitle>
                                    <CardDescription>1M+ token context window</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-1 flex-wrap">
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Massive Context</span>
                                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded">Multimodal</span>
                                    </div>
                                    <TestButton name="geminiPro" onClick={() => testLLM('geminiPro', llmPrompt)}>
                                        Test Gemini Pro
                                    </TestButton>
                                    <ResultDisplay name="geminiPro" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Gemini 1.5 Flash</CardTitle>
                                    <CardDescription>Fast and efficient</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-1 flex-wrap">
                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Speed</span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Real-time</span>
                                    </div>
                                    <TestButton name="geminiFlash" onClick={() => testLLM('geminiFlash', llmPrompt)}>
                                        Test Gemini Flash
                                    </TestButton>
                                    <ResultDisplay name="geminiFlash" />
                                </CardContent>
                            </Card>
                        </div>

                        <h3 className="font-semibold text-gray-700 mb-2 mt-6">Advanced Features</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">LLM with Internet Context</CardTitle>
                                    <CardDescription>Get real-time data from the web</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <TestButton name="llmInternet" onClick={() => testLLM('llmInternet', llmPrompt, { add_context_from_internet: true })}>
                                        Test with Internet
                                    </TestButton>
                                    <ResultDisplay name="llmInternet" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">LLM with JSON Schema</CardTitle>
                                    <CardDescription>Get structured JSON output</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <TestButton name="llmJson" onClick={() => testLLM('llmJson', "Give me 3 random colors", { 
                                        response_json_schema: {
                                            type: "object",
                                            properties: {
                                                colors: { type: "array", items: { type: "string" } }
                                            }
                                        }
                                    })}>
                                        Test JSON Output
                                    </TestButton>
                                    <ResultDisplay name="llmJson" />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Integrations Tab */}
                    <TabsContent value="integrations" className="space-y-4">
                        <h3 className="font-semibold text-gray-700 mb-2">AI Generation</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Generate Image</CardTitle>
                                    <CardDescription>AI-powered image generation (DALL-E)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-1 flex-wrap mb-2">
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Text-to-Image</span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">High Resolution</span>
                                    </div>
                                    <Textarea 
                                        value={imagePrompt} 
                                        onChange={(e) => setImagePrompt(e.target.value)}
                                        placeholder="Describe the image..."
                                        rows={2}
                                    />
                                    <TestButton name="generateImage" onClick={testGenerateImage}>
                                        Generate Image
                                    </TestButton>
                                    {results.generateImage?.url && (
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <img src={results.generateImage.url} alt="Generated" className="rounded max-h-48 w-full object-contain" />
                                        </div>
                                    )}
                                    {errors.generateImage && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-center gap-2 text-red-700 text-sm">
                                                <XCircle className="w-4 h-4" />
                                                <span>{errors.generateImage}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Extract Data from File</CardTitle>
                                    <CardDescription>OCR, PDF parsing, structured output</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-1 flex-wrap">
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">OCR</span>
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">PDF Parsing</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Upload a file first, then use ExtractDataFromUploadedFile</p>
                                </CardContent>
                            </Card>
                        </div>

                        <h3 className="font-semibold text-gray-700 mb-2 mt-6">Communication</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Send Email</CardTitle>
                                    <CardDescription>Transactional email service</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-1 flex-wrap mb-2">
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">SMTP</span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Templates</span>
                                    </div>
                                    <Input 
                                        value={emailTo} 
                                        onChange={(e) => setEmailTo(e.target.value)}
                                        placeholder="Recipient email"
                                    />
                                    <Input 
                                        value={emailSubject} 
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Subject"
                                    />
                                    <Textarea 
                                        value={emailBody} 
                                        onChange={(e) => setEmailBody(e.target.value)}
                                        placeholder="Email body..."
                                        rows={2}
                                    />
                                    <TestButton name="sendEmail" onClick={testSendEmail}>
                                        <Mail className="w-4 h-4 mr-2" /> Send Email
                                    </TestButton>
                                    <ResultDisplay name="sendEmail" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Slack Integration</CardTitle>
                                    <CardDescription>OAuth integration for messaging</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-1 flex-wrap">
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">OAuth</span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Channels</span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Bots</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Requires OAuth authorization</p>
                                </CardContent>
                            </Card>
                        </div>

                        <h3 className="font-semibold text-gray-700 mb-2 mt-6">Storage</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Upload File (Public)</CardTitle>
                                    <CardDescription>Public storage with CDN</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-1 flex-wrap">
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Public Storage</span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">CDN</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Use Core.UploadFile integration</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Upload Private File</CardTitle>
                                    <CardDescription>Private storage with signed URLs</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-1 flex-wrap">
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Private Storage</span>
                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Signed URLs</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Use Core.UploadPrivateFile integration</p>
                                </CardContent>
                            </Card>
                        </div>

                        <h3 className="font-semibold text-gray-700 mb-2 mt-6">Productivity (OAuth Required)</h3>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Google Calendar</CardTitle>
                                    <CardDescription>Calendar management</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-1 flex-wrap">
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">OAuth</span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Events</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Notion</CardTitle>
                                    <CardDescription>Workspace access</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-1 flex-wrap">
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">OAuth</span>
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Databases</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Salesforce</CardTitle>
                                    <CardDescription>CRM integration</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-1 flex-wrap">
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">OAuth</span>
                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">CRM</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* OpenAI Tab */}
                    <TabsContent value="openai" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Chat Completions</CardTitle>
                                    <CardDescription>Test GPT-4 chat</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Textarea 
                                        value={chatMessage} 
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        placeholder="Enter message..."
                                        rows={2}
                                    />
                                    <TestButton name="chat" onClick={() => runTest('chat', 'openaiChat', {
                                        messages: [{ role: 'user', content: chatMessage }],
                                        max_tokens: 150
                                    })}>
                                        Send Chat
                                    </TestButton>
                                    <ResultDisplay name="chat" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Embeddings</CardTitle>
                                    <CardDescription>Generate text embeddings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Input 
                                        value={embedText} 
                                        onChange={(e) => setEmbedText(e.target.value)}
                                        placeholder="Text to embed..."
                                    />
                                    <TestButton name="embed" onClick={() => runTest('embed', 'openaiEmbeddings', {
                                        text: embedText
                                    })}>
                                        Generate Embedding
                                    </TestButton>
                                    <ResultDisplay name="embed" />
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Assistants API</CardTitle>
                                    <CardDescription>Create assistant, thread, and run</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-2 flex-wrap">
                                        <TestButton name="createAssistant" onClick={() => runTest('createAssistant', 'openaiAssistant', {
                                            action: 'create_assistant',
                                            name: 'Test Assistant',
                                            instructions: 'You are a helpful test assistant.'
                                        })}>
                                            Create Assistant
                                        </TestButton>
                                        <TestButton name="createThread" onClick={() => runTest('createThread', 'openaiAssistant', {
                                            action: 'create_thread'
                                        })}>
                                            Create Thread
                                        </TestButton>
                                    </div>
                                    <ResultDisplay name="createAssistant" />
                                    <ResultDisplay name="createThread" />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Stripe Tab */}
                    <TabsContent value="stripe" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Connection Test</CardTitle>
                                    <CardDescription>Verify Stripe API key</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <TestButton name="stripeTest" onClick={() => runTest('stripeTest', 'testStripe', {})}>
                                        Test Connection
                                    </TestButton>
                                    <ResultDisplay name="stripeTest" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Payments</CardTitle>
                                    <CardDescription>Create payment intent</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <TestButton name="paymentIntent" onClick={() => runTest('paymentIntent', 'stripePayments', {
                                        action: 'create_payment_intent',
                                        amount: 1000,
                                        currency: 'usd',
                                        description: 'Test payment'
                                    })}>
                                        Create $10 Payment Intent
                                    </TestButton>
                                    <ResultDisplay name="paymentIntent" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Customers</CardTitle>
                                    <CardDescription>Create Stripe customer</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <TestButton name="createCustomer" onClick={() => runTest('createCustomer', 'stripePayments', {
                                        action: 'create_customer'
                                    })}>
                                        Create Customer
                                    </TestButton>
                                    <ResultDisplay name="createCustomer" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">List Payments</CardTitle>
                                    <CardDescription>View payment history</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <TestButton name="listPayments" onClick={() => runTest('listPayments', 'stripePayments', {
                                        action: 'list_payments'
                                    })}>
                                        List Payments
                                    </TestButton>
                                    <ResultDisplay name="listPayments" />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Twilio Tab */}
                    <TabsContent value="twilio" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Connection Test</CardTitle>
                                    <CardDescription>Verify Twilio credentials</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <TestButton name="twilioTest" onClick={() => runTest('twilioTest', 'testTwilio', {})}>
                                        Test Connection
                                    </TestButton>
                                    <ResultDisplay name="twilioTest" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Send SMS</CardTitle>
                                    <CardDescription>Send a test SMS message</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Input 
                                        value={smsTo} 
                                        onChange={(e) => setSmsTo(e.target.value)}
                                        placeholder="Phone number (+1234567890)"
                                    />
                                    <Textarea 
                                        value={smsBody} 
                                        onChange={(e) => setSmsBody(e.target.value)}
                                        placeholder="Message..."
                                        rows={2}
                                    />
                                    <TestButton name="sendSms" onClick={() => runTest('sendSms', 'twilioSms', {
                                        action: 'send_sms',
                                        to: smsTo,
                                        body: smsBody
                                    })}>
                                        Send SMS
                                    </TestButton>
                                    <ResultDisplay name="sendSms" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">List Messages</CardTitle>
                                    <CardDescription>View SMS history</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <TestButton name="listSms" onClick={() => runTest('listSms', 'twilioSms', {
                                        action: 'list_messages'
                                    })}>
                                        List Messages
                                    </TestButton>
                                    <ResultDisplay name="listSms" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">WhatsApp</CardTitle>
                                    <CardDescription>Send WhatsApp message</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <TestButton name="whatsapp" onClick={() => runTest('whatsapp', 'twilioWhatsapp', {
                                        action: 'list_messages'
                                    })}>
                                        List WhatsApp Messages
                                    </TestButton>
                                    <ResultDisplay name="whatsapp" />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Files Tab */}
                    <TabsContent value="files" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Generate PDF Report</CardTitle>
                                    <CardDescription>Create a sample report PDF</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <TestButton name="pdfReport" onClick={() => downloadFile('pdfReport', 'generatePdf', {
                                        type: 'report',
                                        title: 'Test Report',
                                        columns: [{ key: 'name', label: 'Name' }, { key: 'value', label: 'Value' }],
                                        data: [
                                            { name: 'Item 1', value: '100' },
                                            { name: 'Item 2', value: '200' },
                                            { name: 'Item 3', value: '300' }
                                        ]
                                    }, 'report.pdf')}>
                                        <Download className="w-4 h-4 mr-2" /> Download Report
                                    </TestButton>
                                    <ResultDisplay name="pdfReport" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Generate Invoice PDF</CardTitle>
                                    <CardDescription>Create a sample invoice</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <TestButton name="pdfInvoice" onClick={() => downloadFile('pdfInvoice', 'generatePdf', {
                                        type: 'invoice',
                                        company_name: 'Test Company',
                                        company_address: '123 Test St',
                                        invoice_number: 'INV-001',
                                        items: [
                                            { description: 'Service A', quantity: 2, price: 50, total: 100 },
                                            { description: 'Service B', quantity: 1, price: 75, total: 75 }
                                        ],
                                        subtotal: 175,
                                        tax: 17.50,
                                        total: 192.50
                                    }, 'invoice.pdf')}>
                                        <Download className="w-4 h-4 mr-2" /> Download Invoice
                                    </TestButton>
                                    <ResultDisplay name="pdfInvoice" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Export CSV</CardTitle>
                                    <CardDescription>Export data to CSV</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <TestButton name="exportCsv" onClick={() => downloadFile('exportCsv', 'exportData', {
                                        format: 'csv',
                                        filename: 'test-export',
                                        columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }],
                                        data: [
                                            { id: 1, name: 'John Doe', email: 'john@example.com' },
                                            { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
                                        ]
                                    }, 'test-export.csv')}>
                                        <Download className="w-4 h-4 mr-2" /> Download CSV
                                    </TestButton>
                                    <ResultDisplay name="exportCsv" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Export Excel</CardTitle>
                                    <CardDescription>Export data to Excel</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <TestButton name="exportExcel" onClick={() => downloadFile('exportExcel', 'exportData', {
                                        format: 'excel',
                                        filename: 'test-export',
                                        sheet_name: 'Data',
                                        columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }],
                                        data: [
                                            { id: 1, name: 'Project A', status: 'Active' },
                                            { id: 2, name: 'Project B', status: 'Pending' }
                                        ]
                                    }, 'test-export.xlsx')}>
                                        <Download className="w-4 h-4 mr-2" /> Download Excel
                                    </TestButton>
                                    <ResultDisplay name="exportExcel" />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Webhooks Tab */}
                    <TabsContent value="webhooks" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Generic Webhook Handler</CardTitle>
                                <CardDescription>Test the webhook endpoint</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <TestButton name="webhook" onClick={() => runTest('webhook', 'webhookHandler', {
                                    test: true,
                                    data: { sample: 'payload' }
                                })}>
                                    Test Webhook
                                </TestButton>
                                <ResultDisplay name="webhook" />
                                <p className="text-xs text-gray-500">
                                    To use webhooks externally, go to Dashboard → Code → Functions → webhookHandler to get the URL.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Stripe Webhook</CardTitle>
                                <CardDescription>Stripe webhook endpoint info</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    The Stripe webhook is configured to handle events like payment_intent.succeeded, 
                                    customer.subscription.created, etc. Configure the webhook URL in your Stripe dashboard.
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Go to Dashboard → Code → Functions → stripeWebhook to get the URL.
                                </p>
                            </CardContent>
                            </Card>
                            </TabsContent>

                            {/* Icons Tab */}
                            <TabsContent value="icons" className="space-y-4">
                            <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Lucide Icons Library</CardTitle>
                                <CardDescription>1400+ icons available - search and click to copy import</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input 
                                        value={iconSearch}
                                        onChange={(e) => setIconSearch(e.target.value)}
                                        placeholder="Search icons..."
                                        className="pl-10"
                                    />
                                </div>
                                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-[500px] overflow-y-auto">
                                    {Object.entries(LucideIcons)
                                        .filter(([name]) => 
                                            typeof LucideIcons[name] === 'function' && 
                                            name !== 'createLucideIcon' &&
                                            name !== 'default' &&
                                            !name.startsWith('Lucide') &&
                                            name.toLowerCase().includes(iconSearch.toLowerCase())
                                        )
                                        .slice(0, 200)
                                        .map(([name, Icon]) => (
                                            <button
                                                key={name}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`import { ${name} } from "lucide-react";`);
                                                    setResults(prev => ({ ...prev, iconCopy: `Copied: ${name}` }));
                                                    setTimeout(() => setResults(prev => ({ ...prev, iconCopy: null })), 2000);
                                                }}
                                                className="p-2 rounded hover:bg-gray-100 flex flex-col items-center gap-1 group"
                                                title={name}
                                            >
                                                <Icon className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
                                                <span className="text-[10px] text-gray-500 truncate w-full text-center">{name}</span>
                                            </button>
                                        ))}
                                </div>
                                {results.iconCopy && (
                                    <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        {results.iconCopy}
                                    </div>
                                )}
                            </CardContent>
                            </Card>
                            </TabsContent>
                            </Tabs>
                            </div>
                            </div>
                            );
}