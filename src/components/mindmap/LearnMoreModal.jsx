import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { 
    X, Loader2, BookOpen, Briefcase, Clock, BarChart3, FileText,
    User, MapPin, Calendar, Target, Award, Users, GraduationCap,
    TrendingUp, Lightbulb, ExternalLink, Building, ImageIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import RadialProgressCard from '@/components/dashboard/RadialProgressCard';

const CHART_COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

export default function LearnMoreModal({ keyword, isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [documentsLoading, setDocumentsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && keyword) {
            fetchData();
            generateImage();
            fetchDocuments();
        }
    }, [isOpen, keyword]);

    const fetchDocuments = async () => {
        setDocumentsLoading(true);
        setDocuments([]);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Search the internet for real academic papers, research articles, and authoritative documents about "${keyword.name}". 
                
Find 6-8 REAL, EXISTING documents that can be found online. Include:
- Academic papers from Google Scholar, ResearchGate, arXiv
- Wikipedia articles
- Official documentation or whitepapers
- News articles from reputable sources
- Educational resources

For each document, provide the actual URL where it can be found.`,
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
                                    author: { type: "string" },
                                    year: { type: "string" },
                                    type: { type: "string" },
                                    description: { type: "string" },
                                    url: { type: "string" },
                                    source: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            setDocuments(response.documents || []);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setDocumentsLoading(false);
        }
    };

    const generateImage = async () => {
        setImageLoading(true);
        setGeneratedImage(null);
        try {
            const result = await base44.integrations.Core.GenerateImage({
                prompt: `Beautiful lifestyle and nature photography representing "${keyword.name}". Earth elements, natural landscapes, serene outdoor scenes, organic textures, sustainable living aesthetic. High quality, editorial style photography.`
            });
            setGeneratedImage(result?.url);
        } catch (error) {
            console.error('Failed to generate image:', error);
        } finally {
            setImageLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide comprehensive information about "${keyword.name}" for a knowledge exploration tool. Include:
                
1. Overview: A detailed description, when it originated, who pioneered it, what it is, where it's used, and 2-3 paragraphs about its significance.

2. Professional: Required skills (5-7), related subjects (4-6), subject matter experts (3-5 real people with their roles), relevant job titles (5-7).

3. Timeline: 5-7 key milestones showing how this topic evolved over time with years and descriptions.

4. Deep Insights: Statistics and data that can be visualized - include numerical data for charts (adoption rates, market size, growth trends, distribution data).

5. Documents: 5-8 real, relevant academic papers, articles, or resources with titles, authors, publication year, and brief descriptions.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overview: {
                            type: "object",
                            properties: {
                                description: { type: "string" },
                                when: { type: "string" },
                                who: { type: "string" },
                                what: { type: "string" },
                                where: { type: "string" },
                                significance: { type: "array", items: { type: "string" } }
                            }
                        },
                        professional: {
                            type: "object",
                            properties: {
                                skills: { type: "array", items: { type: "string" } },
                                relatedSubjects: { type: "array", items: { type: "string" } },
                                experts: { type: "array", items: { type: "object", properties: { name: { type: "string" }, role: { type: "string" }, organization: { type: "string" } } } },
                                jobTitles: { type: "array", items: { type: "string" } }
                            }
                        },
                        timeline: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    year: { type: "string" },
                                    title: { type: "string" },
                                    description: { type: "string" }
                                }
                            }
                        },
                        insights: {
                            type: "object",
                            properties: {
                                barChartData: { type: "array", items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } } } },
                                barChartTitle: { type: "string" },
                                lineChartData: { type: "array", items: { type: "object", properties: { year: { type: "string" }, value: { type: "number" } } } },
                                lineChartTitle: { type: "string" },
                                pieChartData: { type: "array", items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } } } },
                                pieChartTitle: { type: "string" },
                                keyStats: { type: "array", items: { type: "object", properties: { label: { type: "string" }, value: { type: "string" } } } }
                            }
                        },
                        documents: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    author: { type: "string" },
                                    year: { type: "string" },
                                    type: { type: "string" },
                                    description: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!keyword) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{keyword.name}</h2>
                                <p className="text-white/80">{keyword.description}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <TabsList className="w-full justify-start rounded-none border-b bg-gray-50 p-0 h-auto">
                            <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 py-3 px-4 gap-2">
                                <BookOpen className="w-4 h-4" /> Overview
                            </TabsTrigger>
                            <TabsTrigger value="professional" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 py-3 px-4 gap-2">
                                <Briefcase className="w-4 h-4" /> Professional
                            </TabsTrigger>
                            <TabsTrigger value="timeline" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 py-3 px-4 gap-2">
                                <Clock className="w-4 h-4" /> Timeline
                            </TabsTrigger>
                            <TabsTrigger value="insights" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 py-3 px-4 gap-2">
                                <BarChart3 className="w-4 h-4" /> Deep Insights
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 py-3 px-4 gap-2">
                                <FileText className="w-4 h-4" /> Documents
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto p-6">
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                    <span className="ml-3 text-gray-600">Loading comprehensive data...</span>
                                </div>
                            ) : data ? (
                                <>
                                    {/* Overview Tab */}
                                    <TabsContent value="overview" className="m-0">
                                        <div className="space-y-6">
                                            {/* Generated Image */}
                                            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 h-48">
                                                {imageLoading ? (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                                                            <p className="text-sm text-purple-600">Generating image...</p>
                                                        </div>
                                                    </div>
                                                ) : generatedImage ? (
                                                    <img src={generatedImage} alt={keyword.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <ImageIcon className="w-12 h-12 text-purple-300" />
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-gray-700 text-lg leading-relaxed">{data.overview?.description}</p>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-purple-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 text-purple-700 mb-2">
                                                        <Calendar className="w-5 h-5" />
                                                        <span className="font-semibold">When</span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm">{data.overview?.when}</p>
                                                </div>
                                                <div className="bg-blue-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                                                        <User className="w-5 h-5" />
                                                        <span className="font-semibold">Who</span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm">{data.overview?.who}</p>
                                                </div>
                                                <div className="bg-emerald-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                                                        <Target className="w-5 h-5" />
                                                        <span className="font-semibold">What</span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm">{data.overview?.what}</p>
                                                </div>
                                                <div className="bg-orange-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 text-orange-700 mb-2">
                                                        <MapPin className="w-5 h-5" />
                                                        <span className="font-semibold">Where</span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm">{data.overview?.where}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                    <Lightbulb className="w-5 h-5 text-amber-500" />
                                                    Significance
                                                </h3>
                                                {data.overview?.significance?.map((para, i) => (
                                                    <p key={i} className="text-gray-600 leading-relaxed">{para}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Professional Tab */}
                                    <TabsContent value="professional" className="m-0">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="bg-white rounded-xl border p-5">
                                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                    <Award className="w-5 h-5 text-purple-600" />
                                                    Required Skills
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {data.professional?.skills?.map((skill, i) => (
                                                        <span key={i} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-xl border p-5">
                                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                    <GraduationCap className="w-5 h-5 text-blue-600" />
                                                    Related Subjects
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {data.professional?.relatedSubjects?.map((subject, i) => (
                                                        <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                            {subject}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-xl border p-5">
                                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                    <Users className="w-5 h-5 text-emerald-600" />
                                                    Subject Matter Experts
                                                </h3>
                                                <div className="space-y-3">
                                                    {data.professional?.experts?.map((expert, i) => (
                                                        <div key={i} className="flex items-start gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                                                                {expert.name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{expert.name}</p>
                                                                <p className="text-sm text-gray-500">{expert.role}</p>
                                                                <p className="text-xs text-gray-400">{expert.organization}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-xl border p-5">
                                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                    <Briefcase className="w-5 h-5 text-orange-600" />
                                                    Relevant Job Titles
                                                </h3>
                                                <div className="space-y-2">
                                                    {data.professional?.jobTitles?.map((title, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-gray-700">
                                                            <Building className="w-4 h-4 text-gray-400" />
                                                            {title}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Timeline Tab */}
                                    <TabsContent value="timeline" className="m-0">
                                        <div className="relative">
                                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-purple-200" />
                                            <div className="space-y-6">
                                                {data.timeline?.map((event, i) => (
                                                    <div key={i} className="relative pl-12">
                                                        <div className="absolute left-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                                            {i + 1}
                                                        </div>
                                                        <div className="bg-white rounded-xl border p-4 shadow-sm">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-semibold">
                                                                    {event.year}
                                                                </span>
                                                                <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                                            </div>
                                                            <p className="text-gray-600 text-sm">{event.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Deep Insights Tab */}
                                    <TabsContent value="insights" className="m-0">
                                        <div className="space-y-6">
                                            {/* Key Stats with Radial Progress Cards */}
                                            {data.insights?.keyStats && (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {data.insights.keyStats.slice(0, 2).map((stat, i) => (
                                                        <RadialProgressCard 
                                                            key={i}
                                                            percentage={parseInt(stat.value) || (i + 1) * 25}
                                                            title={stat.label}
                                                            size="medium"
                                                            color={CHART_COLORS[i]}
                                                        />
                                                    ))}
                                                    {data.insights.keyStats.slice(2).map((stat, i) => (
                                                        <div key={i + 2} className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 text-white flex flex-col justify-center">
                                                            <p className="text-white/70 text-sm">{stat.label}</p>
                                                            <p className="text-2xl font-bold">{stat.value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Stacked Bar Chart */}
                                                {data.insights?.barChartData && (
                                                    <div className="bg-white rounded-xl border p-5">
                                                        <h3 className="font-semibold text-gray-900 mb-4">{data.insights.barChartTitle}</h3>
                                                        <div className="h-64">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <BarChart data={data.insights.barChartData} layout="vertical">
                                                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                                                    <XAxis type="number" tick={{ fontSize: 11 }} />
                                                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                                                                    <Tooltip />
                                                                    <Bar dataKey="value" stackId="a" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                                                    <Bar dataKey="value2" stackId="a" fill="#c4b5fd" radius={[0, 4, 4, 0]} />
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Area Chart */}
                                                {data.insights?.lineChartData && (
                                                    <div className="bg-white rounded-xl border p-5">
                                                        <h3 className="font-semibold text-gray-900 mb-4">{data.insights.lineChartTitle}</h3>
                                                        <div className="h-64">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <AreaChart data={data.insights.lineChartData}>
                                                                    <defs>
                                                                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                                                        </linearGradient>
                                                                        <linearGradient id="areaGradient2" x1="0" y1="0" x2="0" y2="1">
                                                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                                                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                                                                        </linearGradient>
                                                                    </defs>
                                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                                                    <YAxis tick={{ fontSize: 11 }} />
                                                                    <Tooltip />
                                                                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="url(#areaGradient)" />
                                                                    <Area type="monotone" dataKey="value2" stroke="#06b6d4" strokeWidth={2} fill="url(#areaGradient2)" />
                                                                </AreaChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Pie Chart */}
                                                {data.insights?.pieChartData && (
                                                    <div className="bg-white rounded-xl border p-5 md:col-span-2">
                                                        <h3 className="font-semibold text-gray-900 mb-4">{data.insights.pieChartTitle}</h3>
                                                        <div className="h-64">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <PieChart>
                                                                    <Pie
                                                                        data={data.insights.pieChartData}
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        outerRadius={80}
                                                                        dataKey="value"
                                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                    >
                                                                        {data.insights.pieChartData.map((entry, index) => (
                                                                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                                        ))}
                                                                    </Pie>
                                                                    <Tooltip />
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Documents Tab */}
                                    <TabsContent value="documents" className="m-0">
                                        <div className="space-y-4">
                                            {documentsLoading ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                                    <span className="ml-3 text-gray-600">Searching for documents...</span>
                                                </div>
                                            ) : documents.length === 0 ? (
                                                <div className="text-center py-12 text-gray-500">
                                                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                    <p>No documents found for this topic.</p>
                                                    <Button variant="outline" className="mt-4" onClick={fetchDocuments}>
                                                        Search Again
                                                    </Button>
                                                </div>
                                            ) : (
                                                documents.map((doc, i) => (
                                                    <a 
                                                        key={i} 
                                                        href={doc.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="block bg-white rounded-xl border p-5 hover:shadow-md hover:border-purple-200 transition-all group"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:from-purple-500 group-hover:to-indigo-600 transition-all">
                                                                <FileText className="w-6 h-6 text-white" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="min-w-0 flex-1">
                                                                        <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors flex items-center gap-2">
                                                                            <span className="truncate">{doc.title}</span>
                                                                            <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                        </h4>
                                                                        <p className="text-sm text-gray-500">{doc.author} • {doc.year}</p>
                                                                    </div>
                                                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                                            {doc.type}
                                                                        </span>
                                                                        {doc.source && (
                                                                            <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                                                                                {doc.source}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{doc.description}</p>
                                                                {doc.url && (
                                                                    <p className="text-xs text-blue-500 mt-2 truncate">{doc.url}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </a>
                                                ))
                                            )}
                                        </div>
                                    </TabsContent>
                                </>
                            ) : (
                                <div className="text-center text-gray-500 py-12">
                                    No data available. Please try again.
                                </div>
                            )}
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}