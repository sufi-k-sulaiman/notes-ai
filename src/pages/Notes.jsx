import React, { useState, useEffect, useRef } from 'react';
import { 
    Plus, Search, FileText, Calendar, Tag, Pin, Trash2, 
    Bold, Italic, Underline, List, ListOrdered, Sparkles, Image,
    Save, X, Loader2, ChevronRight, Maximize2, Minimize2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PageLayout from '../components/PageLayout';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const TEMPLATES = [
    { id: 'daily', name: 'Daily', icon: Calendar, color: '#6B4EE6' },
    { id: 'meeting', name: 'Meeting', icon: FileText, color: '#3B82F6' },
    { id: 'todo', name: 'Todo', icon: List, color: '#10B981' },
    { id: 'project', name: 'Project', icon: FileText, color: '#F59E0B' },
    { id: 'book', name: 'Book', icon: FileText, color: '#EC4899' },
    { id: 'research', name: 'Research', icon: Search, color: '#8B5CF6' },
];

const TAG_COLORS = ['#6B4EE6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#EF4444'];

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

export default function Notes() {
    const [selectedNote, setSelectedNote] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showEditor, setShowEditor] = useState(false);
    const [editorContent, setEditorContent] = useState('');
    const [noteTitle, setNoteTitle] = useState('');
    const [noteTags, setNoteTags] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [toast, setToast] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
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
    };

    const openNewNote = (template = null) => {
        resetEditor();
        if (template) {
            setNoteTitle(template.name + ' Note');
            setNoteTags([template.name.toLowerCase()]);
        }
        setShowEditor(true);
    };

    const openNote = (note) => {
        setSelectedNote(note);
        setNoteTitle(note.title || '');
        setEditorContent(note.content || '');
        setNoteTags(note.tags || []);
        setShowEditor(true);
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
        setAiLoading(true);
        try {
            const prompt = noteTitle ? `Write a detailed note about: ${noteTitle}` : 'Write an interesting note about a random topic';
            const response = await base44.integrations.Core.InvokeLLM({ prompt });
            setEditorContent(prev => prev + '\n\n' + response);
        } catch (e) {
            console.error(e);
        } finally {
            setAiLoading(false);
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

    return (
        <PageLayout activePage="Notes" showSearch={false}>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-100">
                        <h1 className="text-xl font-bold text-purple-600 flex items-center gap-2 mb-4">
                            <FileText className="w-6 h-6" />
                            Notes
                        </h1>
                        <Button onClick={() => openNewNote()} className="w-full bg-purple-600 hover:bg-purple-700 mb-3">
                            <Plus className="w-4 h-4 mr-2" /> New Note
                        </Button>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                                placeholder="Search notes..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                            </div>
                        ) : filteredNotes.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No notes yet</p>
                            </div>
                        ) : (
                            filteredNotes.map(note => (
                                <div
                                    key={note.id}
                                    onClick={() => openNote(note)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                                        selectedNote?.id === note.id 
                                            ? 'bg-purple-100 border-purple-300' 
                                            : 'bg-gray-50 hover:bg-gray-100 border-transparent'
                                    } border`}
                                >
                                    <h3 className="font-medium text-gray-900 mb-1 truncate">{note.title || 'Untitled'}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2">
                                        {note.content?.replace(/<[^>]*>/g, '').slice(0, 80) || 'No content'}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-1">
                                            {note.tags?.slice(0, 2).map((tag, i) => (
                                                <span key={i} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{tag}</span>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-400">{formatDate(note.created_date)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2 font-medium">Quick Start Templates</p>
                        <div className="grid grid-cols-2 gap-2">
                            {TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => openNewNote(t)}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-purple-50 text-sm text-gray-700 hover:text-purple-700 transition-colors"
                                >
                                    <t.icon className="w-4 h-4" style={{ color: t.color }} />
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center">
                    {!showEditor ? (
                        <div className="text-center">
                            <FileText className="w-20 h-20 text-gray-200 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-600 mb-2">Select a note or create new</h2>
                            <Button onClick={() => openNewNote()} variant="outline">
                                <Plus className="w-4 h-4 mr-2" /> Create Note
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Editor Modal */}
            <Dialog open={showEditor} onOpenChange={setShowEditor}>
                <DialogContent className={`${isFullscreen ? 'max-w-full w-full h-full max-h-full rounded-none' : 'max-w-4xl max-h-[90vh]'} p-0 overflow-hidden transition-all`}>
                    <div className={`flex flex-col ${isFullscreen ? 'h-full' : 'h-[80vh]'}`}>
                        <div className="flex items-center justify-between p-4 border-b bg-white">
                            <Input
                                placeholder="Note title..."
                                value={noteTitle}
                                onChange={e => setNoteTitle(e.target.value)}
                                className="text-lg font-semibold border-0 shadow-none focus-visible:ring-0 max-w-md"
                            />
                            <div className="flex items-center gap-2">
                                <Button onClick={generateAIText} disabled={aiLoading} variant="outline" size="sm" className="gap-2">
                                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-600" />}
                                    AI Text
                                </Button>
                                <Button onClick={() => setIsFullscreen(!isFullscreen)} variant="ghost" size="icon">
                                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </Button>
                                <Button onClick={saveNote} disabled={createMutation.isPending || updateMutation.isPending} className="bg-purple-600 hover:bg-purple-700 gap-2">
                                    <Save className="w-4 h-4" />
                                    Save
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setShowEditor(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <ReactQuill
                                value={editorContent}
                                onChange={setEditorContent}
                                placeholder="Start writing..."
                                className="h-full"
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
                        </div>

                        <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-gray-400" />
                                {noteTags.map((tag, i) => (
                                    <span key={i} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded flex items-center gap-1">
                                        {tag}
                                        <button onClick={() => setNoteTags(noteTags.filter((_, idx) => idx !== i))} className="hover:text-purple-900">×</button>
                                    </span>
                                ))}
                                <Input
                                    placeholder="Add tag..."
                                    className="w-24 h-7 text-xs"
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
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => { deleteMutation.mutate(selectedNote.id); setShowEditor(false); }}
                                >
                                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        </PageLayout>
    );
}