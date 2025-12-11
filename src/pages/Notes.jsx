import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, FileText, Calendar, Tag, Trash2, 
    Save, X, Loader2, Maximize2, Minimize2, Sparkles, Image,
    Clock, FileType, List, Grid3x3, AlignLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const TEMPLATES = [
    { id: 'daily', name: 'Daily', icon: Calendar, color: '#6B4EE6', content: '<h2>Daily Journal</h2><p>Date: [Today]</p><h3>Goals for Today</h3><ul><li></li></ul><h3>Notes</h3><p></p><h3>Reflection</h3><p></p>' },
    { id: 'meeting', name: 'Meeting', icon: FileText, color: '#3B82F6', content: '<h2>Meeting Notes</h2><p><strong>Date:</strong> [Date]</p><p><strong>Attendees:</strong></p><ul><li></li></ul><h3>Agenda</h3><ol><li></li></ol><h3>Discussion Points</h3><p></p><h3>Action Items</h3><ul><li></li></ul>' },
    { id: 'todo', name: 'Todo', icon: List, color: '#10B981', content: '<h2>Todo List</h2><h3>High Priority</h3><ul><li>[ ] </li></ul><h3>Medium Priority</h3><ul><li>[ ] </li></ul><h3>Low Priority</h3><ul><li>[ ] </li></ul>' },
    { id: 'project', name: 'Project', icon: FileText, color: '#F59E0B', content: '<h2>Project: [Name]</h2><h3>Overview</h3><p></p><h3>Objectives</h3><ul><li></li></ul><h3>Timeline</h3><p></p><h3>Resources</h3><ul><li></li></ul><h3>Notes</h3><p></p>' },
    { id: 'book', name: 'Book', icon: FileText, color: '#EC4899', content: '<h2>Book Notes: [Title]</h2><p><strong>Author:</strong></p><p><strong>Genre:</strong></p><h3>Summary</h3><p></p><h3>Key Takeaways</h3><ul><li></li></ul><h3>Favorite Quotes</h3><blockquote></blockquote><h3>Personal Thoughts</h3><p></p>' },
    { id: 'research', name: 'Research', icon: Search, color: '#8B5CF6', content: '<h2>Research: [Topic]</h2><h3>Research Question</h3><p></p><h3>Sources</h3><ul><li></li></ul><h3>Key Findings</h3><p></p><h3>Analysis</h3><p></p><h3>Conclusions</h3><p></p>' },
];

function Toast({ message, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    return (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <Save className="w-4 h-4" />
            <span>{message}</span>
        </div>
    );
}

function NoteCard({ note, onClick, formatDate }) {
    const content = note.content?.replace(/<[^>]*>/g, '') || '';
    const wordCount = note.word_count || content.split(/\s+/).filter(w => w).length || 0;
    const charCount = content.length || 0;
    
    return (
        <div
            onClick={() => onClick(note)}
            className="bg-white/60 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/80 p-4 md:p-6 cursor-pointer hover:shadow-xl hover:bg-white/80 hover:border-purple-300 transition-all shadow-lg"
        >
            <h3 className="font-bold text-gray-900 mb-2 md:mb-3 text-base md:text-lg line-clamp-2">{note.title || 'Untitled'}</h3>
            <p className="text-xs md:text-sm text-gray-600 line-clamp-3 md:line-clamp-4 mb-3 md:mb-4 min-h-[60px] md:min-h-[80px] leading-relaxed">
                {content.slice(0, 200) || 'No content'}
            </p>
            
            <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-600 pt-2 md:pt-3 border-t border-gray-200/50">
                <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                    <span className="flex items-center gap-1">
                        <FileType className="w-3 md:w-3.5 h-3 md:h-3.5" />
                        {wordCount} words
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                        {charCount} chars
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 md:w-3.5 h-3 md:h-3.5" />
                        {formatDate(note.created_date)}
                    </span>
                </div>
            </div>
            
            {note.tags && note.tags.length > 0 && (
                <div className="flex items-center gap-1 md:gap-1.5 mt-2 md:mt-3 flex-wrap">
                    {note.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 bg-white/60 backdrop-blur-sm text-gray-700 rounded-lg border border-white/80">{tag}</span>
                    ))}
                    {note.tags.length > 3 && (
                        <span className="text-[10px] md:text-xs text-gray-400">+{note.tags.length - 3}</span>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Notes() {
    // Update URL for display only (aesthetic, not parsed)
    const updateUrl = (noteTitle) => {
        const basePath = window.location.pathname;
        if (noteTitle) {
            const titleSlug = noteTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 50);
            window.history.pushState({}, '', `${basePath}/${titleSlug}`);
        } else {
            window.history.pushState({}, '', basePath);
        }
    };

    useEffect(() => {
        document.title = 'Smarter Writing with AI Powered Notes';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Notes helps organize ideas, streamline writing, and boost productivity effectively.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'Ai notes, Notes');
    }, []);

    const [selectedNote, setSelectedNote] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showEditor, setShowEditor] = useState(false);
    const [editorContent, setEditorContent] = useState('');
    const [noteTitle, setNoteTitle] = useState('');
    const [noteTags, setNoteTags] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [toast, setToast] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [showAiTextModal, setShowAiTextModal] = useState(false);
    const [showAiImageModal, setShowAiImageModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [formatLoading, setFormatLoading] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'title'
    const queryClient = useQueryClient();

    const { data: notes = [], isLoading } = useQuery({
        queryKey: ['notes'],
        queryFn: () => base44.entities.Note.list('-created_date'),
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Note.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            setShowEditor(false);
            resetEditor();
            setToast('Note saved successfully');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Note.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            setShowEditor(false);
            resetEditor();
            setToast('Note updated successfully');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Note.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            setToast('Note deleted');
        },
    });

    const resetEditor = () => {
        setSelectedNote(null);
        setEditorContent('');
        setNoteTitle('');
        setNoteTags([]);
        updateUrl(null);
    };

    const openNewNote = (template = null) => {
        resetEditor();
        if (template) {
            setNoteTitle(template.name + ' Note');
            setNoteTags([template.name.toLowerCase()]);
            setEditorContent(template.content);
        }
        setShowEditor(true);
    };

    const openNote = (note) => {
        setSelectedNote(note);
        setNoteTitle(note.title || '');
        setEditorContent(note.content || '');
        setNoteTags(note.tags || []);
        setShowEditor(true);
        updateUrl(note.title);
    };

    const saveNote = () => {
        const wordCount = editorContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length;
        const data = {
            title: noteTitle || 'Untitled Note',
            content: editorContent,
            tags: noteTags,
            word_count: wordCount,
        };
        if (selectedNote) {
            updateMutation.mutate({ id: selectedNote.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const generateAIText = async () => {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({ 
                prompt: `Write detailed content about: ${aiPrompt}. Format it nicely with paragraphs.` 
            });
            setEditorContent(prev => prev + '<p>' + response.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>');
            setShowAiTextModal(false);
            setAiPrompt('');
        } catch (e) {
            console.error(e);
        } finally {
            setAiLoading(false);
        }
    };

    const generateAIImage = async () => {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        try {
            const { url } = await base44.integrations.Core.GenerateImage({ prompt: aiPrompt });
            setEditorContent(prev => prev + `<p><img src="${url}" alt="${aiPrompt}" style="max-width: 100%; border-radius: 8px;" /></p>`);
            setShowAiImageModal(false);
            setAiPrompt('');
        } catch (e) {
            console.error(e);
        } finally {
            setAiLoading(false);
        }
    };

    const formatContent = async () => {
        if (!editorContent.trim()) return;
        setFormatLoading(true);
        try {
            const plainText = editorContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const response = await base44.integrations.Core.InvokeLLM({ 
                prompt: `Format the following text into clean, well-structured HTML content. Use <h2> for main titles, <h3> for subtitles, <p> for paragraphs, <ul>/<li> for lists, <strong> for important terms. Keep the original meaning but make it readable:\n\n${plainText}`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        formatted_html: { type: "string" }
                    }
                }
            });
            if (response?.formatted_html) {
                setEditorContent(response.formatted_html);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setFormatLoading(false);
        }
    };

    const filteredNotes = notes.filter(n => 
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Listen for header search changes
    useEffect(() => {
        const handleHeaderSearch = (e) => setSearchQuery(e.detail || '');
        window.addEventListener('headerSearchChange', handleHeaderSearch);
        return () => window.removeEventListener('headerSearchChange', handleHeaderSearch);
    }, []);

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-3 md:p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-gray-900">Notes Ai</h1>
                            <p className="text-gray-600 text-xs md:text-sm">Generative text notes and images</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="flex items-center bg-white/60 backdrop-blur-xl rounded-xl border border-white/80 shadow-sm p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-white/80'}`}
                                >
                                    <Grid3x3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-white/80'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('title')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'title' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-white/80'}`}
                                >
                                    <AlignLeft className="w-4 h-4" />
                                </button>
                            </div>
                            <Button onClick={() => openNewNote()} className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 backdrop-blur-xl shadow-lg flex-1 sm:flex-initial border-0">
                                <Plus className="w-4 h-4 mr-2" /> New Note
                            </Button>
                        </div>
                    </div>

                    {/* Notes Grid */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12 md:py-20">
                            <Loader2 className="w-6 md:w-8 h-6 md:h-8 animate-spin text-purple-600" />
                        </div>
                    ) : filteredNotes.length === 0 ? (
                        <div className="text-center py-12 md:py-20 bg-white/40 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/60 shadow-xl">
                            <FileText className="w-12 md:w-16 h-12 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
                            <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">No notes yet</h2>
                            <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">Create your first note or use a template</p>
                            <Button onClick={() => openNewNote()} variant="outline" className="text-sm bg-white/60 backdrop-blur-md border-white/80 hover:bg-white/80">
                                <Plus className="w-4 h-4 mr-2" /> Create Note
                            </Button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            {filteredNotes.map(note => (
                                <NoteCard 
                                    key={note.id} 
                                    note={note} 
                                    onClick={openNote}
                                    formatDate={formatDate}
                                />
                            ))}
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="space-y-2 md:space-y-3">
                            {filteredNotes.map(note => {
                                const content = note.content?.replace(/<[^>]*>/g, '') || '';
                                const wordCount = note.word_count || content.split(/\s+/).filter(w => w).length || 0;
                                return (
                                    <div
                                        key={note.id}
                                        onClick={() => openNote(note)}
                                        className="bg-white/60 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/80 p-3 md:p-4 cursor-pointer hover:shadow-xl hover:bg-white/80 hover:border-purple-300 transition-all shadow-lg flex items-start gap-3 md:gap-4"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base truncate">{note.title || 'Untitled'}</h3>
                                            <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-2">{content.slice(0, 150) || 'No content'}</p>
                                            <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-gray-500 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(note.created_date)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FileType className="w-3 h-3" />
                                                    {wordCount} words
                                                </span>
                                                {note.tags && note.tags.length > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        {note.tags.slice(0, 2).map((tag, i) => (
                                                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white/60 backdrop-blur-sm text-gray-700 rounded border border-white/80">{tag}</span>
                                                        ))}
                                                        {note.tags.length > 2 && <span className="text-gray-400">+{note.tags.length - 2}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white/60 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/80 shadow-lg divide-y divide-gray-200/50">
                            {filteredNotes.map(note => (
                                <div
                                    key={note.id}
                                    className="p-3 md:p-4 cursor-pointer hover:bg-white/80 transition-all flex items-center justify-between group"
                                >
                                    <div onClick={() => openNote(note)} className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                        <FileText className="w-4 md:w-5 h-4 md:h-5 text-purple-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{note.title || 'Untitled'}</h3>
                                            <p className="text-xs text-gray-500">{formatDate(note.created_date)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        {note.tags && note.tags.length > 0 && (
                                            <span className="hidden sm:inline text-[10px] px-2 py-1 bg-purple-100/60 backdrop-blur-sm text-purple-700 rounded border border-purple-200/50">{note.tags[0]}</span>
                                        )}
                                        <span className="hidden md:inline text-[10px]">{note.word_count || 0} words</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(note.id); }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                        {/* Quick Start Templates */}
                        {!isLoading && filteredNotes.length > 0 && (
                        <div className="bg-white/40 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/60 shadow-xl p-3 md:p-5 mt-6">
                        <h2 className="text-purple-700 font-semibold mb-3 md:mb-4 text-sm md:text-base">Quick Start Templates</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
                            {TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => openNewNote(t)}
                                    className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/60 backdrop-blur-md hover:bg-white/80 border border-white/80 hover:border-purple-200 text-left transition-all shadow-sm hover:shadow-md"
                                >
                                    <t.icon className="w-4 md:w-5 h-4 md:h-5" style={{ color: t.color }} />
                                    <span className="font-medium text-gray-800 text-xs md:text-sm">{t.name}</span>
                                </button>
                            ))}
                        </div>
                        </div>
                        )}
                        </div>
                        </div>

                        {/* Editor Modal */}
            <Dialog open={showEditor} onOpenChange={setShowEditor}>
                <DialogContent className={`max-w-full w-full h-full max-h-full rounded-none md:max-w-4xl md:max-h-[90vh] md:rounded-3xl p-0 overflow-hidden transition-all bg-white/80 backdrop-blur-3xl border-white/60 shadow-2xl ${isFullscreen ? '!max-w-full !w-full !h-full !max-h-full !rounded-none' : ''}`} hideClose>
                    <div className={`flex flex-col h-full ${isFullscreen ? '' : 'md:h-[80vh]'}`}>
                        <div className="px-3 md:px-4 py-2 md:py-3 border-b border-gray-200/50 bg-gradient-to-r from-white/60 to-purple-50/60 backdrop-blur-xl flex items-center gap-2 md:gap-3">
                            <Button onClick={() => setShowAiTextModal(true)} variant="ghost" size="sm" className="gap-1 text-xs md:text-sm hover:bg-white/60">
                                <Sparkles className="w-3.5 md:w-4 h-3.5 md:h-4 text-purple-600" />
                                <span className="hidden sm:inline">Ai Text</span>
                            </Button>
                            <Button onClick={() => setShowAiImageModal(true)} variant="ghost" size="sm" className="gap-1 text-xs md:text-sm hover:bg-white/60">
                                <Image className="w-3.5 md:w-4 h-3.5 md:h-4 text-pink-600" />
                                <span className="hidden sm:inline">Ai Image</span>
                            </Button>
                            <Button onClick={formatContent} disabled={formatLoading} variant="ghost" size="sm" className="gap-1 text-xs md:text-sm hover:bg-white/60">
                                {formatLoading ? <Loader2 className="w-3.5 md:w-4 h-3.5 md:h-4 animate-spin" /> : <FileText className="w-3.5 md:w-4 h-3.5 md:h-4 text-blue-600" />}
                                <span className="hidden sm:inline">Format</span>
                            </Button>
                            <Button onClick={() => setIsFullscreen(!isFullscreen)} variant="ghost" size="sm" className="hover:bg-white/60 hidden md:flex">
                                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </Button>
                            <div className="flex-1" />
                            <Button onClick={saveNote} disabled={createMutation.isPending || updateMutation.isPending} className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 backdrop-blur-xl shadow-lg gap-1.5 text-xs md:text-sm border-0 h-8 px-4">
                                {(createMutation.isPending || updateMutation.isPending) ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Save</span>
                                    </>
                                )}
                            </Button>
                            <Button onClick={() => setShowEditor(false)} className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-3">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="px-3 md:px-4 py-2 border-b border-gray-200/50 bg-white/30 backdrop-blur-xl">
                            <Input
                                placeholder="Note title..."
                                value={noteTitle}
                                onChange={e => setNoteTitle(e.target.value)}
                                className="text-base md:text-lg font-semibold border-0 shadow-none focus-visible:ring-0 w-full bg-transparent placeholder:text-gray-400"
                            />
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <ReactQuill
                                value={editorContent}
                                onChange={setEditorContent}
                                placeholder="Start writing..."
                                className="h-full notes-quill-responsive"
                                theme="snow"
                                modules={{
                                    toolbar: [
                                        ['bold', 'italic', 'underline'],
                                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                        [{ 'header': [1, 2, 3, false] }],
                                        ['link', 'image'],
                                        ['clean']
                                    ],
                                }}
                            />
                            <style>{`
                                .notes-quill-responsive .ql-toolbar {
                                    background: rgba(255, 255, 255, 0.4) !important;
                                    backdrop-filter: blur(20px) !important;
                                    border: none !important;
                                    border-bottom: 1px solid rgba(209, 213, 219, 0.3) !important;
                                }
                                .notes-quill-responsive .ql-container {
                                    border: none !important;
                                    background: transparent !important;
                                }
                                .notes-quill-responsive .ql-editor {
                                    background: rgba(255, 255, 255, 0.3) !important;
                                    backdrop-filter: blur(20px) !important;
                                }
                                .notes-quill-responsive .ql-editor::before {
                                    color: rgba(107, 114, 128, 0.6) !important;
                                }
                                .notes-quill-responsive .ql-stroke {
                                    stroke: rgba(55, 65, 81, 0.7) !important;
                                }
                                .notes-quill-responsive .ql-fill {
                                    fill: rgba(55, 65, 81, 0.7) !important;
                                }
                                .notes-quill-responsive .ql-picker-label {
                                    color: rgba(55, 65, 81, 0.8) !important;
                                }
                                .notes-quill-responsive button:hover,
                                .notes-quill-responsive button.ql-active {
                                    background: rgba(147, 51, 234, 0.15) !important;
                                    border-radius: 6px !important;
                                }
                                @media (max-width: 768px) {
                                    .notes-quill-responsive .ql-toolbar {
                                        padding: 6px !important;
                                    }
                                    .notes-quill-responsive .ql-toolbar button {
                                        width: 24px !important;
                                        height: 24px !important;
                                        padding: 2px 4px !important;
                                    }
                                    .notes-quill-responsive .ql-toolbar .ql-picker-label {
                                        padding: 2px 4px !important;
                                        font-size: 12px !important;
                                    }
                                    .notes-quill-responsive .ql-container {
                                        font-size: 14px !important;
                                    }
                                    .notes-quill-responsive .ql-editor {
                                        padding: 12px !important;
                                    }
                                }
                            `}</style>
                        </div>

                        <div className="p-2 md:p-3 border-t border-gray-200/50 bg-gradient-to-r from-white/40 to-purple-50/40 backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                <Tag className="w-3 md:w-4 h-3 md:h-4 text-gray-400" />
                                {noteTags.map((tag, i) => (
                                    <span key={i} className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 bg-purple-100/60 backdrop-blur-sm text-purple-700 rounded-lg border border-purple-200/50 flex items-center gap-1">
                                        {tag}
                                        <button onClick={() => setNoteTags(noteTags.filter((_, idx) => idx !== i))} className="hover:text-purple-900 text-sm">×</button>
                                    </span>
                                ))}
                                <Input
                                    placeholder="Add tag..."
                                    className="w-20 md:w-24 h-6 md:h-7 text-[10px] md:text-xs bg-white/60 backdrop-blur-sm border-white/80"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            setNoteTags([...noteTags, e.target.value.trim()]);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                            {selectedNote && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-500 hover:text-red-700 hover:bg-red-100/60 backdrop-blur-sm text-xs md:text-sm"
                                    onClick={() => { deleteMutation.mutate(selectedNote.id); setShowEditor(false); }}
                                >
                                    <Trash2 className="w-3 md:w-4 h-3 md:h-4 mr-1" /> Delete
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {toast && <Toast message={toast} onClose={() => setToast(null)} />}

            {/* AI Text Modal */}
            <Dialog open={showAiTextModal} onOpenChange={setShowAiTextModal}>
                <DialogContent className="max-w-md mx-2 md:mx-0 bg-white/80 backdrop-blur-3xl border-white/60 shadow-2xl rounded-3xl">
                    <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 md:w-5 h-4 md:h-5 text-purple-600" /> Generate AI Text
                    </h3>
                    <Input
                        placeholder="Describe what you want to write about..."
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && generateAIText()}
                        className="text-sm md:text-base bg-white/60 backdrop-blur-sm border-white/80"
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => { setShowAiTextModal(false); setAiPrompt(''); }} className="text-xs md:text-sm bg-white/60 backdrop-blur-md border-white/80 hover:bg-white/80">Cancel</Button>
                        <Button onClick={generateAIText} disabled={aiLoading || !aiPrompt.trim()} className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 backdrop-blur-xl shadow-lg text-xs md:text-sm border-0">
                            {aiLoading ? <Loader2 className="w-3 md:w-4 h-3 md:h-4 animate-spin mr-2" /> : <Sparkles className="w-3 md:w-4 h-3 md:h-4 mr-2" />}
                            Generate
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* AI Image Modal */}
            <Dialog open={showAiImageModal} onOpenChange={setShowAiImageModal}>
                <DialogContent className="max-w-md mx-2 md:mx-0 bg-white/80 backdrop-blur-3xl border-white/60 shadow-2xl rounded-3xl">
                    <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
                        <Image className="w-4 md:w-5 h-4 md:h-5 text-pink-600" /> Generate AI Image
                    </h3>
                    <Input
                        placeholder="Describe the image you want to create..."
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && generateAIImage()}
                        className="text-sm md:text-base bg-white/60 backdrop-blur-sm border-white/80"
                    />
                    <p className="text-[10px] md:text-xs text-gray-600 mt-2">Be descriptive for better results. Takes 5-10 seconds.</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => { setShowAiImageModal(false); setAiPrompt(''); }} className="text-xs md:text-sm bg-white/60 backdrop-blur-md border-white/80 hover:bg-white/80">Cancel</Button>
                        <Button onClick={generateAIImage} disabled={aiLoading || !aiPrompt.trim()} className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 backdrop-blur-xl shadow-lg text-xs md:text-sm border-0">
                            {aiLoading ? <Loader2 className="w-3 md:w-4 h-3 md:h-4 animate-spin mr-2" /> : <Image className="w-3 md:w-4 h-3 md:h-4 mr-2" />}
                            Generate
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}