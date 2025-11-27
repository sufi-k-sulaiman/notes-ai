import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, FileText, Sparkles, Download, Eye, Plus, Trash2, Globe, Loader2, Check, Save, X, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TemplateSelector, RESUME_TEMPLATES } from '../components/resume/ResumeTemplates';
import ResumePreview from '../components/resume/ResumePreview';
import ATSAnalysis from '../components/resume/ATSAnalysis';
import ExportOptions from '../components/resume/ExportOptions';

export default function ResumeBuilder() {
    const [activeTab, setActiveTab] = useState('builder');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResume, setGeneratedResume] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('modern-professional');
    const [atsAnalysis, setAtsAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({ fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', portfolio: '', careerWriteup: '', jobPostingUrl: '', pageLength: '2', toneLevel: 'mid-level', generateCoverLetter: false, talkingPoints: [] });
    const [newTalkingPoint, setNewTalkingPoint] = useState('');

    const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    const addTalkingPoint = () => { if (newTalkingPoint.trim()) { setFormData(prev => ({ ...prev, talkingPoints: [...prev.talkingPoints, newTalkingPoint.trim()] })); setNewTalkingPoint(''); } };
    const removeTalkingPoint = (index) => setFormData(prev => ({ ...prev, talkingPoints: prev.talkingPoints.filter((_, i) => i !== index) }));

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url, json_schema: { type: "object", properties: { fullName: { type: "string" }, title: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, location: { type: "string" }, experience: { type: "string" }, education: { type: "string" }, skills: { type: "string" } } } });
            if (extracted?.output) setFormData(prev => ({ ...prev, fullName: extracted.output.fullName || prev.fullName, title: extracted.output.title || prev.title, email: extracted.output.email || prev.email, phone: extracted.output.phone || prev.phone, location: extracted.output.location || prev.location, careerWriteup: [extracted.output.experience, extracted.output.education, extracted.output.skills].filter(Boolean).join('\n\n') || prev.careerWriteup }));
        } catch (error) { console.error('File upload error:', error); }
    };

    const generateResume = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Generate a professional ${formData.toneLevel} resume for:\nName: ${formData.fullName}\nTitle: ${formData.title}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nLocation: ${formData.location}\nLinkedIn: ${formData.linkedin}\nPortfolio: ${formData.portfolio}\n\nCareer Background:\n${formData.careerWriteup}\n\n${formData.jobPostingUrl ? `Target Job Posting: ${formData.jobPostingUrl}` : ''}\n${formData.talkingPoints.length > 0 ? `Key Points to Emphasize:\n${formData.talkingPoints.join('\n')}` : ''}\n\nGenerate a ${formData.pageLength} page resume with:\n- Professional summary (2-3 sentences)\n- Work experience with quantified achievements (use metrics, percentages, dollar amounts)\n- Education with degrees and years\n- Skills section with 8-12 relevant skills\n${formData.generateCoverLetter ? '- Also generate a cover letter' : ''}`;
            const response = await base44.integrations.Core.InvokeLLM({ prompt, add_context_from_internet: !!formData.jobPostingUrl, response_json_schema: { type: "object", properties: { summary: { type: "string" }, experience: { type: "array", items: { type: "object", properties: { title: { type: "string" }, company: { type: "string" }, duration: { type: "string" }, achievements: { type: "array", items: { type: "string" } } } } }, education: { type: "array", items: { type: "object", properties: { degree: { type: "string" }, school: { type: "string" }, year: { type: "string" } } } }, skills: { type: "array", items: { type: "string" } }, coverLetter: { type: "string" } } } });
            const resumeData = { ...formData, summary: response?.summary || '', experience: response?.experience || [], education: response?.education || [], skills: response?.skills || [], coverLetter: response?.coverLetter || '' };
            setGeneratedResume(resumeData); setActiveTab('resume'); analyzeResume(resumeData);
        } catch (error) { console.error('Resume generation error:', error); }
        finally { setIsGenerating(false); }
    };

    const analyzeResume = async (resumeData) => {
        setIsAnalyzing(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({ prompt: `Analyze this resume for ATS compatibility and HR standards:\nName: ${resumeData.fullName}\nSummary: ${resumeData.summary}\nExperience: ${JSON.stringify(resumeData.experience)}\nSkills: ${resumeData.skills?.join(', ')}\n${formData.jobPostingUrl ? `Job Posting URL: ${formData.jobPostingUrl}` : ''}\n\nProvide:\n1. ATS score (0-100)\n2. Matched keywords from the job posting\n3. Suggested keywords to add\n4. Detailed scoring for readability, relevance, consistency, impact, and engagement`, add_context_from_internet: !!formData.jobPostingUrl, response_json_schema: { type: "object", properties: { atsScore: { type: "number" }, matchedKeywords: { type: "array", items: { type: "string" } }, suggestedKeywords: { type: "array", items: { type: "string" } }, sentenceSimplicity: { type: "number" }, bulletPointUsage: { type: "number" }, jargonAvoidance: { type: "number" }, skillsAlignment: { type: "number" }, industryTerms: { type: "number" }, quantifiedAchievements: { type: "number" }, formatUniformity: { type: "number" }, grammarSpelling: { type: "number" }, tenseConsistency: { type: "number" }, quantifiedResults: { type: "number" }, scopeOfWork: { type: "number" }, careerGrowth: { type: "number" }, actionVerbs: { type: "number" }, valueProposition: { type: "number" }, professionalSummary: { type: "number" } } } });
            setAtsAnalysis(response);
        } catch (error) { console.error('Analysis error:', error); }
        finally { setIsAnalyzing(false); }
    };

    const addKeywordToResume = (keyword) => { if (generatedResume && !generatedResume.skills?.includes(keyword)) setGeneratedResume(prev => ({ ...prev, skills: [...(prev.skills || []), keyword] })); };
    const handleExport = (format) => console.log('Exporting as:', format);
    const template = RESUME_TEMPLATES.find(t => t.id === selectedTemplate) || RESUME_TEMPLATES[0];

    return (
        <div className="p-4 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center"><FileText className="w-6 h-6 text-purple-600" /></div>
                        <div><h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1><p className="text-gray-500 text-sm">AI-powered professional resumes</p></div>
                    </div>
                    <TabsList className="bg-gray-100"><TabsTrigger value="builder" className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Builder</TabsTrigger><TabsTrigger value="resume" className="flex items-center gap-2"><FileText className="w-4 h-4" /> Resume</TabsTrigger><TabsTrigger value="export" className="flex items-center gap-2"><Download className="w-4 h-4" /> Export</TabsTrigger></TabsList>
                </div>

                <TabsContent value="builder">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h2 className="font-semibold text-gray-900 mb-4">Career Information</h2>
                                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors mb-4"><Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" /><p className="text-sm font-medium text-gray-600">Upload existing resume</p><p className="text-xs text-gray-400">(PDF, DOC, TXT)</p></div>
                                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                                <div className="mb-4"><div className="flex items-center gap-2 mb-1"><Globe className="w-4 h-4 text-gray-400" /><label className="text-sm text-gray-600">Job Posting URL</label></div><Input placeholder="Paste job posting URL..." value={formData.jobPostingUrl} onChange={(e) => handleInputChange('jobPostingUrl', e.target.value)} /></div>
                                <div><div className="flex items-center justify-between mb-1"><label className="text-sm font-medium text-gray-700">Career Write-up</label><button className="text-xs text-purple-600 flex items-center gap-1 hover:underline"><Lightbulb className="w-3 h-3" /> Example</button></div><Textarea placeholder="Paste your career history, achievements, skills..." value={formData.careerWriteup} onChange={(e) => handleInputChange('careerWriteup', e.target.value)} className="min-h-[120px]" /></div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input placeholder="Full Name" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} />
                                    <Input placeholder="Job Title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} />
                                    <Input placeholder="Email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                                    <Input placeholder="Phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                                    <Input placeholder="Location" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} />
                                    <Input placeholder="LinkedIn" value={formData.linkedin} onChange={(e) => handleInputChange('linkedin', e.target.value)} />
                                    <Input placeholder="Portfolio" className="col-span-2" value={formData.portfolio} onChange={(e) => handleInputChange('portfolio', e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h2 className="font-semibold text-gray-900 mb-4">Resume Settings</h2>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div><label className="text-sm text-gray-600 mb-1 block">Page Length</label><Select value={formData.pageLength} onValueChange={(v) => handleInputChange('pageLength', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1 Page</SelectItem><SelectItem value="2">2 Pages</SelectItem><SelectItem value="3">3 Pages</SelectItem></SelectContent></Select></div>
                                    <div><label className="text-sm text-gray-600 mb-1 block">Tone Level</label><Select value={formData.toneLevel} onValueChange={(v) => handleInputChange('toneLevel', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="entry-level">Entry Level</SelectItem><SelectItem value="mid-level">Mid Level</SelectItem><SelectItem value="senior">Senior</SelectItem><SelectItem value="executive">Executive</SelectItem></SelectContent></Select></div>
                                </div>
                                <div className="flex items-center gap-2 mb-6"><Checkbox id="coverLetter" checked={formData.generateCoverLetter} onCheckedChange={(c) => handleInputChange('generateCoverLetter', c)} /><label htmlFor="coverLetter" className="text-sm text-gray-700">Generate Cover Letter</label></div>
                                <div><div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-gray-700">Talking Points</label><button onClick={addTalkingPoint} className="text-purple-600 text-sm flex items-center gap-1 hover:text-purple-700"><Plus className="w-4 h-4" /> Add</button></div><p className="text-xs text-gray-500 mb-3">Add achievements or details to emphasize</p><Input placeholder="e.g., Led a team of 12 to deliver $2M project" value={newTalkingPoint} onChange={(e) => setNewTalkingPoint(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTalkingPoint()} className="mb-3" /><div className="space-y-2 max-h-[200px] overflow-y-auto">{formData.talkingPoints.map((point, i) => (<div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /><span className="text-sm text-gray-700 flex-1 line-clamp-2">{point}</span><button onClick={() => removeTalkingPoint(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>))}</div></div>
                                <Button onClick={generateResume} disabled={isGenerating || !formData.fullName} className="w-full mt-6 h-12 bg-purple-600 hover:bg-purple-700 text-white">{isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}Generate AI Resume</Button>
                            </div>
                        </div>
                        <div className="lg:col-span-4"><div className="bg-white rounded-2xl border border-gray-200 p-6 max-h-[calc(100vh-200px)] overflow-y-auto"><TemplateSelector selectedTemplate={selectedTemplate} onSelect={setSelectedTemplate} /></div></div>
                    </div>
                </TabsContent>

                <TabsContent value="resume">
                    {generatedResume ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2"><div className="bg-white rounded-2xl border border-gray-200 p-4"><div className="flex items-center justify-between mb-4"><h2 className="font-semibold text-gray-900">Resume Preview</h2><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setShowPreview(true)}><Eye className="w-4 h-4 mr-1" /> Full View</Button><Button variant="outline" size="sm"><Save className="w-4 h-4 mr-1" /> Save</Button></div></div><ResumePreview data={generatedResume} templateId={selectedTemplate} className="rounded-xl overflow-hidden border border-gray-200" /></div></div>
                            <div className="lg:col-span-1">{isAnalyzing ? (<div className="bg-white rounded-2xl border border-gray-200 p-6 text-center"><Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-3 animate-spin" /><p className="text-gray-600">Analyzing your resume...</p></div>) : (<ATSAnalysis analysis={atsAnalysis} onAddKeyword={addKeywordToResume} onRefresh={() => analyzeResume(generatedResume)} />)}</div>
                        </div>
                    ) : (<div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-xl mx-auto"><FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h2 className="text-xl font-semibold text-gray-800 mb-2">No Resume Generated</h2><p className="text-gray-500 mb-4">Fill in your information and click Generate to create your resume</p><Button onClick={() => setActiveTab('builder')} className="bg-purple-600 hover:bg-purple-700">Go to Builder</Button></div>)}
                </TabsContent>

                <TabsContent value="export"><div className="max-w-xl mx-auto">{generatedResume ? (<ExportOptions onExport={handleExport} isGenerating={isGenerating} />) : (<div className="bg-white rounded-2xl border border-gray-200 p-12 text-center"><Download className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h2 className="text-xl font-semibold text-gray-800 mb-2">Generate a Resume First</h2><p className="text-gray-500 mb-4">You need to generate a resume before exporting</p><Button onClick={() => setActiveTab('builder')} className="bg-purple-600 hover:bg-purple-700">Go to Builder</Button></div>)}</div></TabsContent>
            </Tabs>

            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10"><h2 className="font-semibold text-gray-900">Full Resume Preview</h2><Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}><X className="w-5 h-5" /></Button></div>
                    <div className="p-4"><ResumePreview data={generatedResume} templateId={selectedTemplate} className="mx-auto max-w-2xl" /></div>
                </DialogContent>
            </Dialog>
        </div>
    );
}