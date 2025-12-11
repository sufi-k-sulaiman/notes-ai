import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, FileText, Calendar, Tag, Trash2, 
    Save, X, Loader2, Maximize2, Minimize2, Sparkles, Image,
    Clock, FileType, List, Grid3x3, AlignLeft, Table, Code2, ChevronDown, Palette,
    Settings, Moon, Sun, User, Mail
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ColorPickerModal from '@/components/ColorPickerModal';

const TEMPLATES = [
    { id: 'daily', name: 'Daily', icon: Calendar, color: '#6B4EE6', content: '<h2>Daily Journal - ' + new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '</h2><h3>🎯 Top 3 Goals for Today</h3><ul><li>Complete the most important task</li><li>Make progress on key project</li><li>Connect with someone meaningful</li></ul><h3>📝 Schedule & Time Blocks</h3><table style="width: 100%; border-collapse: collapse;"><tbody><tr><td style="border: 1px solid #333; padding: 8px; background-color: #f3f4f6;"><strong>Time</strong></td><td style="border: 1px solid #333; padding: 8px; background-color: #f3f4f6;"><strong>Activity</strong></td></tr><tr><td style="border: 1px solid #333; padding: 8px;">9:00 AM</td><td style="border: 1px solid #333; padding: 8px;">Morning routine & planning</td></tr><tr><td style="border: 1px solid #333; padding: 8px;">10:00 AM</td><td style="border: 1px solid #333; padding: 8px;">Deep work session</td></tr></tbody></table><h3>💭 Notes & Thoughts</h3><p>Capture ideas, learnings, and observations throughout the day...</p><h3>🌟 Evening Reflection</h3><p><strong>What went well:</strong></p><p><strong>What could improve:</strong></p><p><strong>Grateful for:</strong></p>' },
    { id: 'meeting', name: 'Meeting', icon: FileText, color: '#3B82F6', content: '<h2>Meeting Notes</h2><p><strong>📅 Date:</strong> ' + new Date().toLocaleDateString() + '</p><p><strong>⏰ Time:</strong> [Start - End Time]</p><p><strong>👥 Attendees:</strong></p><ul><li>Name 1 - Role</li><li>Name 2 - Role</li><li>Name 3 - Role</li></ul><h3>📋 Agenda</h3><ol><li>Review previous action items (5 min)</li><li>Main discussion topic (20 min)</li><li>Q&A and open discussion (10 min)</li><li>Action items and next steps (5 min)</li></ol><h3>💬 Discussion Points</h3><p><strong>Topic 1:</strong></p><p>Key points discussed, decisions made...</p><p><strong>Topic 2:</strong></p><p>Additional notes and considerations...</p><h3>✅ Action Items</h3><table style="width: 100%; border-collapse: collapse;"><tbody><tr><td style="border: 1px solid #333; padding: 8px; background-color: #f3f4f6;"><strong>Task</strong></td><td style="border: 1px solid #333; padding: 8px; background-color: #f3f4f6;"><strong>Owner</strong></td><td style="border: 1px solid #333; padding: 8px; background-color: #f3f4f6;"><strong>Due Date</strong></td></tr><tr><td style="border: 1px solid #333; padding: 8px;">Action item 1</td><td style="border: 1px solid #333; padding: 8px;">Person</td><td style="border: 1px solid #333; padding: 8px;">Date</td></tr></tbody></table><h3>📌 Next Meeting</h3><p><strong>Date:</strong> [Next meeting date]</p><p><strong>Focus:</strong> [Next meeting topic]</p>' },
    { id: 'todo', name: 'Todo', icon: List, color: '#10B981', content: '<h2>📝 Todo List - ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</h2><h3>🔴 High Priority - Do First</h3><ul><li>[ ] Review and respond to urgent emails</li><li>[ ] Complete critical project milestone</li><li>[ ] Prepare for important meeting</li></ul><h3>🟡 Medium Priority - Do Today</h3><ul><li>[ ] Update project documentation</li><li>[ ] Follow up with team members</li><li>[ ] Review weekly progress</li><li>[ ] Schedule upcoming meetings</li></ul><h3>🟢 Low Priority - When Possible</h3><ul><li>[ ] Organize files and folders</li><li>[ ] Read industry articles</li><li>[ ] Plan for next week</li></ul><h3>📅 This Week</h3><ul><li>[ ] Major deliverable due Friday</li><li>[ ] Quarterly review preparation</li><li>[ ] Team collaboration session</li></ul><h3>💡 Ideas & Future Tasks</h3><ul><li>Consider new productivity tools</li><li>Explore automation opportunities</li><li>Plan skill development activities</li></ul>' },
    { id: 'project', name: 'Project', icon: FileText, color: '#F59E0B', content: '<h2>📁 Project: [Project Name]</h2><h3>📊 Project Overview</h3><p><strong>Start Date:</strong> [Date]</p><p><strong>Target Completion:</strong> [Date]</p><p><strong>Status:</strong> 🟢 On Track / 🟡 At Risk / 🔴 Delayed</p><p><strong>Project Lead:</strong> [Name]</p><p><strong>Team Members:</strong> [Names]</p><h3>🎯 Objectives</h3><ul><li><strong>Primary Goal:</strong> Clear, measurable outcome we want to achieve</li><li><strong>Success Criteria:</strong> How we\'ll know we succeeded</li><li><strong>Key Deliverables:</strong> Tangible outputs we\'ll produce</li><li><strong>Stakeholder Benefits:</strong> Value this project brings</li></ul><h3>📅 Timeline & Milestones</h3><table style="width: 100%; border-collapse: collapse;"><tbody><tr><td style="border: 1px solid #333; padding: 8px; background-color: #f3f4f6;"><strong>Phase</strong></td><td style="border: 1px solid #333; padding: 8px; background-color: #f3f4f6;"><strong>Milestone</strong></td><td style="border: 1px solid #333; padding: 8px; background-color: #f3f4f6;"><strong>Date</strong></td><td style="border: 1px solid #333; padding: 8px; background-color: #f3f4f6;"><strong>Status</strong></td></tr><tr><td style="border: 1px solid #333; padding: 8px;">Planning</td><td style="border: 1px solid #333; padding: 8px;">Requirements gathered</td><td style="border: 1px solid #333; padding: 8px;">[Date]</td><td style="border: 1px solid #333; padding: 8px;">✅</td></tr><tr><td style="border: 1px solid #333; padding: 8px;">Development</td><td style="border: 1px solid #333; padding: 8px;">First prototype</td><td style="border: 1px solid #333; padding: 8px;">[Date]</td><td style="border: 1px solid #333; padding: 8px;">🔄</td></tr></tbody></table><h3>💼 Resources</h3><ul><li><strong>Budget:</strong> $[Amount]</li><li><strong>Tools:</strong> List of software, platforms</li><li><strong>Documentation:</strong> Link to project files</li><li><strong>External Resources:</strong> Vendors, contractors</li></ul><h3>⚠️ Risks & Challenges</h3><p><strong>Risk 1:</strong> [Description] - Mitigation: [Strategy]</p><p><strong>Risk 2:</strong> [Description] - Mitigation: [Strategy]</p><h3>📝 Project Notes</h3><p>Weekly updates, decisions made, lessons learned...</p>' },
    { id: 'book', name: 'Book', icon: FileText, color: '#EC4899', content: '<h2>📚 Book Notes: [Book Title]</h2><p><strong>✍️ Author:</strong> [Author Name]</p><p><strong>📖 Genre:</strong> [Fiction/Non-Fiction/Business/Self-Help/etc.]</p><p><strong>📅 Date Read:</strong> ' + new Date().toLocaleDateString() + '</p><p><strong>⭐ Rating:</strong> ⭐⭐⭐⭐⭐ (5/5)</p><h3>📝 Summary</h3><p>Brief overview of the book\'s main narrative, themes, and structure. What is this book fundamentally about?</p><p><strong>Core Message:</strong> The central idea or thesis of the book in 1-2 sentences.</p><h3>💡 Key Takeaways & Insights</h3><ul><li><strong>Insight 1:</strong> Main concept or lesson learned - why it matters</li><li><strong>Insight 2:</strong> Important principle or framework - how to apply it</li><li><strong>Insight 3:</strong> Surprising discovery or perspective shift</li><li><strong>Insight 4:</strong> Practical advice or actionable wisdom</li><li><strong>Insight 5:</strong> Pattern or connection to other ideas</li></ul><h3>💭 Favorite Quotes</h3><blockquote>"Inspiring or memorable quote from the book that resonates." - Page [#]</blockquote><blockquote>"Another powerful quote that captures key ideas." - Page [#]</blockquote><blockquote>"Third notable quote worth remembering." - Page [#]</blockquote><h3>🎯 Action Items</h3><ul><li>[ ] Apply concept from chapter 3 to current project</li><li>[ ] Share key insight with team</li><li>[ ] Explore recommended resource mentioned</li></ul><h3>🔗 Connections</h3><p><strong>Related Books:</strong> Similar titles or authors to explore</p><p><strong>Connected Ideas:</strong> How this relates to other concepts I\'ve learned</p><h3>💭 Personal Thoughts & Reflections</h3><p><strong>What resonated:</strong> Parts that really spoke to me and why...</p><p><strong>What challenged me:</strong> Ideas that pushed my thinking or made me uncomfortable...</p><p><strong>How I\'ll use this:</strong> Practical ways I plan to apply these learnings...</p>' },
    { id: 'research', name: 'Research', icon: Search, color: '#8B5CF6', content: '<h2>🔬 Research: [Topic Name]</h2><p><strong>📅 Date Started:</strong> ' + new Date().toLocaleDateString() + '</p><p><strong>🎯 Purpose:</strong> Academic / Professional / Personal Interest</p><h3>❓ Research Question</h3><p><strong>Main Question:</strong> What specific question am I trying to answer?</p><p><strong>Sub-Questions:</strong></p><ul><li>Supporting question 1</li><li>Supporting question 2</li><li>Supporting question 3</li></ul><p><strong>Hypothesis/Assumption:</strong> What do I expect to find?</p><h3>📚 Sources & References</h3><table style="width: 100%; border-collapse: collapse;"><tbody><tr><td style="border: 1px solid #333; padding: 8px; background-color: #f3f4f6;"><strong>Source</strong></td><td style="border: 1px solid #333; padding: 8px; background-color: #f3f4f6;"><strong>Type</strong></td><td style="border: 1px solid #333; padding: 8px; background-color: #f3f4f6;"><strong>Key Points</strong></td><td style="border: 1px solid #333; padding: 8px; background-color: #f3f4f6;"><strong>Credibility</strong></td></tr><tr><td style="border: 1px solid #333; padding: 8px;">Author (Year). Title</td><td style="border: 1px solid #333; padding: 8px;">Journal/Book/Web</td><td style="border: 1px solid #333; padding: 8px;">Main findings</td><td style="border: 1px solid #333; padding: 8px;">⭐⭐⭐⭐⭐</td></tr><tr><td style="border: 1px solid #333; padding: 8px;">Second source</td><td style="border: 1px solid #333; padding: 8px;">Type</td><td style="border: 1px solid #333; padding: 8px;">Key info</td><td style="border: 1px solid #333; padding: 8px;">⭐⭐⭐⭐</td></tr></tbody></table><h3>🔍 Key Findings</h3><p><strong>Finding 1:</strong> [Data/Evidence] - This suggests that...</p><p><strong>Finding 2:</strong> [Data/Evidence] - The implications are...</p><p><strong>Finding 3:</strong> [Data/Evidence] - This connects to...</p><h3>📊 Data & Evidence</h3><ul><li><strong>Statistical Data:</strong> Relevant numbers, percentages, trends</li><li><strong>Case Studies:</strong> Real-world examples that support findings</li><li><strong>Expert Opinions:</strong> What authorities in the field say</li></ul><h3>🧠 Analysis & Interpretation</h3><p><strong>Patterns Identified:</strong> What themes or trends emerge across sources?</p><p><strong>Contradictions:</strong> Where do sources disagree and why?</p><p><strong>Gaps in Research:</strong> What questions remain unanswered?</p><p><strong>Critical Evaluation:</strong> Strengths and limitations of the evidence...</p><h3>💡 Conclusions</h3><p><strong>Answer to Research Question:</strong> Based on the evidence collected...</p><p><strong>Confidence Level:</strong> 🟢 High / 🟡 Medium / 🔴 Low - and why</p><p><strong>Next Steps:</strong></p><ul><li>Additional research needed in [area]</li><li>Practical applications of findings</li><li>Areas for further investigation</li></ul><h3>📝 Additional Notes</h3><p>Interesting tangents, related topics to explore, methodology reflections...</p>' },
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

function NoteCard({ note, onClick, formatDate, darkMode }) {
    const content = note.content?.replace(/<[^>]*>/g, '') || '';
    const wordCount = note.word_count || content.split(/\s+/).filter(w => w).length || 0;
    const charCount = content.length || 0;

    // Extract image URLs from content
    const imageRegex = /<img[^>]+src="([^">]+)"/g;
    const images = [];
    let match;
    while ((match = imageRegex.exec(note.content || '')) !== null) {
        images.push(match[1]);
    }

    return (
        <div
            onClick={() => onClick(note)}
            className={`backdrop-blur-xl rounded-2xl md:rounded-3xl border p-4 md:p-6 cursor-pointer hover:shadow-xl transition-all shadow-lg ${
                darkMode 
                    ? 'bg-gray-800/60 border-gray-700 hover:bg-gray-800/80 hover:border-purple-500' 
                    : 'bg-white/60 border-white/80 hover:bg-white/80 hover:border-purple-300'
            }`}
        >
            <h3 className={`note-card-content font-bold text-base md:text-lg line-clamp-2 mb-2 md:mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{note.title || 'Untitled'}</h3>
            <p className={`note-card-content text-xs md:text-sm line-clamp-3 md:line-clamp-4 mb-3 md:mb-4 min-h-[60px] md:min-h-[80px] leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {content.slice(0, 200) || 'No content'}
            </p>

            <div className={`flex items-center justify-between text-[10px] md:text-xs pt-2 md:pt-3 border-t ${
                darkMode ? 'text-gray-500 border-gray-700/50' : 'text-gray-600 border-gray-200/50'
            }`}>
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
                        <span key={i} className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 backdrop-blur-sm rounded-lg border ${
                            darkMode 
                                ? 'bg-gray-700/60 text-gray-300 border-gray-600' 
                                : 'bg-white/60 text-gray-700 border-white/80'
                        }`}>{tag}</span>
                    ))}
                    {note.tags.length > 3 && (
                        <span className={`text-[10px] md:text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>+{note.tags.length - 3}</span>
                    )}
                </div>
            )}

            {images.length > 0 && (
                <div className="flex gap-1 mt-3">
                    {images.slice(0, 3).map((img, i) => (
                        <img 
                            key={i} 
                            src={img} 
                            alt="" 
                            className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover border border-gray-200"
                        />
                    ))}
                    {images.length > 3 && (
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-600">
                            +{images.length - 3}
                        </div>
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

    const [toast, setToast] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [showAiTextModal, setShowAiTextModal] = useState(false);
    const [showAiImageModal, setShowAiImageModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [formatLoading, setFormatLoading] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'title'
    const [imageCount, setImageCount] = useState(2);
    const [showAiCodeModal, setShowAiCodeModal] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(3);
    const [showTablePopover, setShowTablePopover] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [colorPickerMode, setColorPickerMode] = useState('text'); // 'text' or 'background'
    const [showFormatModal, setShowFormatModal] = useState(true);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('notes-dark-mode');
        return saved ? JSON.parse(saved) : false;
    });
    const [textSize, setTextSize] = useState(() => {
        const saved = localStorage.getItem('notes-text-size');
        return saved || 'medium';
    });
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [showDeleteRibbon, setShowDeleteRibbon] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        localStorage.setItem('notes-dark-mode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('notes-text-size', textSize);
        // Update Quill editor font size dynamically
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            const container = editor.container;
            const fontSize = textSize === 'small' ? '16px' : textSize === 'large' ? '20px' : '18px';
            container.querySelector('.ql-editor').style.fontSize = fontSize;
        }
    }, [textSize]);

    const getEditorFontSize = () => {
        if (textSize === 'small') return '16px';
        if (textSize === 'large') return '20px';
        return '18px'; // medium
    };

    const closeAllTabs = () => {
        setShowAiTextModal(false);
        setShowAiImageModal(false);
        setShowAiCodeModal(false);
        setShowColorPicker(false);
        setShowFormatModal(false);
    };

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: () => base44.auth.me(),
    });

    const { data: notes = [], isLoading } = useQuery({
        queryKey: ['notes', user?.email],
        queryFn: () => base44.entities.Note.filter({ created_by: user.email }, '-created_date'),
        enabled: !!user?.email,
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

    const [selectedWritingStyle, setSelectedWritingStyle] = useState('creative');

    const generateAIText = async () => {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        try {
            const stylePrompts = {
                persuasive: 'Write persuasive, compelling content that motivates and convinces readers about',
                technical: 'Write technical, precise, and informative content with clear explanations about',
                journalistic: 'Write journalistic, factual, and newsworthy content in an objective style about',
                creative: 'Write creative, engaging, and imaginative content about',
                editorial: 'Write editorial, opinionated content with strong viewpoints about'
            };
            
            const response = await base44.integrations.Core.InvokeLLM({ 
                prompt: `${stylePrompts[selectedWritingStyle]}: ${aiPrompt}. Format it nicely with paragraphs.` 
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
            const promises = Array(imageCount).fill(null).map(() => 
                base44.integrations.Core.GenerateImage({ prompt: aiPrompt })
            );
            const results = await Promise.all(promises);
            const imagesHtml = results.map(({ url }) => 
                `<img src="${url}" alt="${aiPrompt}" style="max-width: ${imageCount > 2 ? '48%' : '100%'}; border-radius: 8px; margin: 4px;" />`
            ).join('');
            setEditorContent(prev => prev + `<p>${imagesHtml}</p>`);
            setShowAiImageModal(false);
            setAiPrompt('');
        } catch (e) {
            console.error(e);
        } finally {
            setAiLoading(false);
        }
    };

    const quillRef = React.useRef(null);

    const insertTable = () => {
        let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #333;"><tbody>';

        // Header row
        tableHtml += '<tr>';
        for (let j = 0; j < tableCols; j++) {
            tableHtml += `<td style="border: 1px solid #333; padding: 12px; font-weight: bold; background-color: #f3f4f6;"><strong>Header ${j + 1}</strong></td>`;
        }
        tableHtml += '</tr>';

        // Data rows
        for (let i = 1; i < tableRows; i++) {
            tableHtml += '<tr>';
            for (let j = 0; j < tableCols; j++) {
                tableHtml += `<td style="border: 1px solid #333; padding: 12px; background-color: #ffffff;">Cell ${i}-${j + 1}</td>`;
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table><p><br></p>';

        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection();
            const position = range ? range.index : quill.getLength();
            quill.clipboard.dangerouslyPasteHTML(position, tableHtml);
        } else {
            setEditorContent(prev => prev + tableHtml);
        }
        setShowTablePopover(false);
    };

    const generateAICode = async () => {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({ 
                prompt: `Write ${selectedLanguage} code for: ${aiPrompt}. Return only the code with proper syntax highlighting comments. Be concise and production-ready.` 
            });
            const codeBlock = `<pre style="background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 14px;"><code>${response.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
            setEditorContent(prev => prev + codeBlock);
            setShowAiCodeModal(false);
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

    const handleAddLink = () => {
        const quill = quillRef.current?.getEditor();
        const selection = quill?.getSelection();
        if (selection && selection.length > 0) {
            setShowLinkInput(true);
        }
    };

    const applyLink = () => {
        if (!linkUrl.trim()) return;
        const quill = quillRef.current?.getEditor();
        quill?.format('link', linkUrl);
        setShowLinkInput(false);
        setLinkUrl('');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            const quill = quillRef.current?.getEditor();
            const range = quill?.getSelection();
            quill?.insertEmbed(range?.index || 0, 'image', file_url);
        } catch (error) {
            console.error('Image upload failed:', error);
        } finally {
            setUploadingImage(false);
            e.target.value = '';
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

    const getGlobalFontSize = () => {
        if (textSize === 'small') return '16px';
        if (textSize === 'large') return '20px';
        return '18px';
    };

    // Listen for header search changes
    useEffect(() => {
        const handleHeaderSearch = (e) => setSearchQuery(e.detail || '');
        window.addEventListener('headerSearchChange', handleHeaderSearch);
        return () => window.removeEventListener('headerSearchChange', handleHeaderSearch);
    }, []);

    if (showEditor) {
        return (
            <>
            <style>{`
                .notes-editor-container * {
                    font-size: ${getGlobalFontSize()} !important;
                }
                .notes-editor-container h1 {
                    font-size: ${textSize === 'small' ? '1.75rem' : textSize === 'large' ? '2.25rem' : '2rem'} !important;
                }
                .notes-editor-container h2 {
                    font-size: ${textSize === 'small' ? '1.5rem' : textSize === 'large' ? '2rem' : '1.75rem'} !important;
                }
                .notes-editor-container h3 {
                    font-size: ${textSize === 'small' ? '1.25rem' : textSize === 'large' ? '1.75rem' : '1.5rem'} !important;
                }
            `}</style>
            <div className={`notes-editor-container min-h-screen ${darkMode ? 'bg-[#0c0f1f]' : 'bg-white'}`} style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="max-w-7xl mx-auto p-0 md:p-6">
                    <div className={`backdrop-blur-xl md:rounded-2xl md:rounded-3xl border-0 md:border shadow-xl overflow-hidden min-h-screen md:min-h-0 ${
                        darkMode 
                            ? 'bg-gray-800/60 md:border-gray-700' 
                            : 'bg-white/60 md:border-white/80'
                    }`}>
                        <div className={`px-2 md:px-4 py-2 md:py-3 border-b backdrop-blur-3xl shadow-lg flex items-center gap-1 md:gap-3 ${
                            darkMode 
                                ? 'border-gray-700 bg-[#0c0f1f]' 
                                : 'border-white/20 bg-white/10'
                        }`}>
                            <button 
                                onClick={() => { closeAllTabs(); setShowFormatModal(true); }} 
                                className={`flex items-center gap-2 text-base md:text-sm px-3 md:px-4 py-3 md:py-2 rounded-t-lg transition-all min-h-[48px] ${
                                    showFormatModal 
                                        ? darkMode 
                                            ? 'bg-gray-700/40 backdrop-blur-xl border-b-2 border-indigo-500 text-indigo-400 shadow-md' 
                                            : 'bg-white/40 backdrop-blur-xl border-b-2 border-indigo-500 text-indigo-700 shadow-md'
                                        : darkMode 
                                            ? 'bg-gray-800/10 backdrop-blur-md text-gray-400 hover:bg-gray-700/20' 
                                            : 'bg-white/10 backdrop-blur-md text-gray-600 hover:bg-white/20'
                                }`}
                            >
                                <AlignLeft className="w-5 h-5" />
                                <span className="hidden sm:inline">Format</span>
                            </button>
                            <button 
                                onClick={() => { closeAllTabs(); setShowAiTextModal(true); }} 
                                className={`flex items-center gap-2 text-base md:text-sm px-3 md:px-4 py-3 md:py-2 rounded-t-lg transition-all min-h-[48px] ${
                                    showAiTextModal 
                                        ? darkMode 
                                            ? 'bg-gray-700/40 backdrop-blur-xl border-b-2 border-purple-500 text-purple-400 shadow-md' 
                                            : 'bg-white/40 backdrop-blur-xl border-b-2 border-purple-500 text-purple-700 shadow-md'
                                        : darkMode 
                                            ? 'bg-gray-800/10 backdrop-blur-md text-gray-400 hover:bg-gray-700/20' 
                                            : 'bg-white/10 backdrop-blur-md text-gray-600 hover:bg-white/20'
                                }`}
                            >
                                <Sparkles className="w-5 h-5" />
                                <span className="hidden sm:inline">Ai Text</span>
                            </button>
                            <button 
                                onClick={() => { closeAllTabs(); setShowAiImageModal(true); }} 
                                className={`flex items-center gap-2 text-base md:text-sm px-3 md:px-4 py-3 md:py-2 rounded-t-lg transition-all min-h-[48px] ${
                                    showAiImageModal 
                                        ? darkMode 
                                            ? 'bg-gray-700/40 backdrop-blur-xl border-b-2 border-pink-500 text-pink-400 shadow-md' 
                                            : 'bg-white/40 backdrop-blur-xl border-b-2 border-pink-500 text-pink-700 shadow-md'
                                        : darkMode 
                                            ? 'bg-gray-800/10 backdrop-blur-md text-gray-400 hover:bg-gray-700/20' 
                                            : 'bg-white/10 backdrop-blur-md text-gray-600 hover:bg-white/20'
                                }`}
                            >
                                <Image className="w-5 h-5" />
                                <span className="hidden sm:inline">Ai Image</span>
                            </button>
                            <button 
                                onClick={() => { closeAllTabs(); setShowAiCodeModal(true); }} 
                                className={`flex items-center gap-2 text-base md:text-sm px-3 md:px-4 py-3 md:py-2 rounded-t-lg transition-all min-h-[48px] ${
                                    showAiCodeModal 
                                        ? darkMode 
                                            ? 'bg-gray-700/40 backdrop-blur-xl border-b-2 border-emerald-500 text-emerald-400 shadow-md' 
                                            : 'bg-white/40 backdrop-blur-xl border-b-2 border-emerald-500 text-emerald-700 shadow-md'
                                        : darkMode 
                                            ? 'bg-gray-800/10 backdrop-blur-md text-gray-400 hover:bg-gray-700/20' 
                                            : 'bg-white/10 backdrop-blur-md text-gray-600 hover:bg-white/20'
                                }`}
                            >
                                <Code2 className="w-5 h-5" />
                                <span className="hidden sm:inline">Ai Code</span>
                            </button>
                            <button 
                                onClick={() => { closeAllTabs(); setColorPickerMode('text'); setShowColorPicker(true); }} 
                                className={`flex items-center gap-2 text-base md:text-sm px-3 md:px-4 py-3 md:py-2 rounded-t-lg transition-all min-h-[48px] ${
                                    showColorPicker 
                                        ? darkMode 
                                            ? 'bg-gray-700/40 backdrop-blur-xl border-b-2 border-orange-500 text-orange-400 shadow-md' 
                                            : 'bg-white/40 backdrop-blur-xl border-b-2 border-orange-500 text-orange-700 shadow-md'
                                        : darkMode 
                                            ? 'bg-gray-800/10 backdrop-blur-md text-gray-400 hover:bg-gray-700/20' 
                                            : 'bg-white/10 backdrop-blur-md text-gray-600 hover:bg-white/20'
                                }`}
                            >
                                <Palette className="w-5 h-5" />
                                <span className="hidden sm:inline">Color</span>
                            </button>
                            <div className="flex-1" />
                            {selectedNote && (
                                <Button 
                                    onClick={() => setShowDeleteRibbon(true)} 
                                    className="bg-red-600 hover:bg-red-700 text-white gap-1.5 text-xs md:text-sm border-0 min-h-[40px] px-4"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Delete</span>
                                </Button>
                            )}
                            <Button onClick={saveNote} disabled={createMutation.isPending || updateMutation.isPending} className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 backdrop-blur-xl shadow-lg gap-1.5 text-xs md:text-sm border-0 min-h-[40px] px-4">
                                {(createMutation.isPending || updateMutation.isPending) ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span className="hidden sm:inline">Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Save</span>
                                    </>
                                )}
                            </Button>
                            <Button onClick={() => setShowEditor(false)} className={`text-white min-h-[40px] min-w-[40px] p-0 ${
                                darkMode ? 'bg-purple-500 hover:bg-purple-600' : 'bg-purple-600 hover:bg-purple-700'
                            }`}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* AI Text Tab */}
                        {showAiTextModal && (
                            <div className={`px-3 md:px-4 py-3 border-b backdrop-blur-3xl shadow-inner ${
                                darkMode 
                                    ? 'border-gray-700 bg-[#0c0f1f]' 
                                    : 'border-white/20 bg-white/30'
                            }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-sm md:text-base font-semibold flex items-center gap-2 ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                                        <Sparkles className={`w-4 h-4 ${darkMode ? 'text-purple-500' : 'text-purple-600'}`} /> Generate AI Text
                                    </h3>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {[
                                        { id: 'persuasive', label: 'Persuasive' },
                                        { id: 'technical', label: 'Technical' },
                                        { id: 'journalistic', label: 'Journalistic' },
                                        { id: 'creative', label: 'Creative' },
                                        { id: 'editorial', label: 'Editorial' }
                                    ].map(style => (
                                        <button
                                            key={style.id}
                                            onClick={() => setSelectedWritingStyle(style.id)}
                                            className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${
                                                selectedWritingStyle === style.id
                                                    ? 'bg-purple-500 text-white'
                                                    : darkMode 
                                                        ? 'bg-gray-700/60 text-gray-300 hover:bg-gray-600' 
                                                        : 'bg-white/60 text-gray-700 hover:bg-purple-100'
                                            }`}
                                        >
                                            {style.label}
                                        </button>
                                    ))}
                                </div>
                
                                <div className="relative">
                                    <Input
                                        placeholder="Describe what text"
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && generateAIText()}
                                        className={`text-sm backdrop-blur-sm border rounded-full pr-28 pl-6 h-12 shadow-sm ${
                                            darkMode 
                                                ? 'bg-gray-700/60 border-gray-600 text-white placeholder:text-gray-400' 
                                                : 'bg-white/60 border-gray-300'
                                        }`}
                                    />
                                    <Button 
                                        onClick={generateAIText} 
                                        disabled={aiLoading || !aiPrompt.trim()} 
                                        className="absolute right-1 top-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-full h-10 px-5 text-sm font-medium"
                                    >
                                        {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-1" /> Generate</>}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* AI Image Tab */}
                        {showAiImageModal && (
                            <div className={`px-3 md:px-4 py-3 border-b backdrop-blur-3xl shadow-inner ${
                                darkMode 
                                    ? 'border-gray-700 bg-[#0c0f1f]' 
                                    : 'border-white/20 bg-white/30'
                            }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-sm md:text-base font-semibold flex items-center gap-2 ${darkMode ? 'text-pink-400' : 'text-pink-700'}`}>
                                        <Image className={`w-4 h-4 ${darkMode ? 'text-pink-500' : 'text-pink-600'}`} /> Generate AI Image
                                    </h3>
                                </div>

                                <div className="flex gap-2 mb-3">
                                    {[2, 4, 6, 8].map(count => (
                                        <button
                                            key={count}
                                            onClick={() => setImageCount(count)}
                                            className={`px-5 py-2 rounded-lg text-lg font-semibold transition-all ${
                                                imageCount === count
                                                    ? 'bg-pink-500 text-white'
                                                    : darkMode 
                                                        ? 'bg-gray-700/60 text-gray-300 hover:bg-gray-600' 
                                                        : 'bg-white/60 text-gray-700 hover:bg-pink-100'
                                            }`}
                                        >
                                            {count}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative">
                                    <Input
                                        placeholder="Describe the image"
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && generateAIImage()}
                                        className={`text-sm backdrop-blur-sm border rounded-full pr-32 pl-6 h-12 shadow-sm ${
                                            darkMode 
                                                ? 'bg-gray-700/60 border-gray-600 text-white placeholder:text-gray-400' 
                                                : 'bg-white/60 border-gray-300'
                                        }`}
                                    />
                                    <Button 
                                        onClick={generateAIImage} 
                                        disabled={aiLoading || !aiPrompt.trim()} 
                                        className="absolute right-1 top-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-full h-10 px-5 text-sm font-medium"
                                    >
                                        {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Generating...</> : <><Image className="w-4 h-4 mr-1" /> Generate {imageCount}</>}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* AI Code Tab */}
                        {showAiCodeModal && (
                            <div className={`px-3 md:px-4 py-3 border-b backdrop-blur-3xl shadow-inner ${
                                darkMode 
                                    ? 'border-gray-700 bg-[#0c0f1f]' 
                                    : 'border-white/20 bg-white/30'
                            }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-sm md:text-base font-semibold flex items-center gap-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                        <Code2 className={`w-4 h-4 ${darkMode ? 'text-emerald-500' : 'text-emerald-600'}`} /> Generate AI Code
                                    </h3>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {[
                                        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#',
                                        'Ruby', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin'
                                    ].map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => setSelectedLanguage(lang)}
                                            className={`px-4 py-2 rounded-md text-base font-semibold transition-all ${
                                                selectedLanguage === lang
                                                    ? 'bg-emerald-500 text-white'
                                                    : darkMode 
                                                        ? 'bg-gray-700/60 text-gray-300 hover:bg-gray-600' 
                                                        : 'bg-white/60 text-gray-700 hover:bg-emerald-100'
                                            }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative">
                                    <Input
                                        placeholder="Describe the code function"
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && generateAICode()}
                                        className={`text-sm backdrop-blur-sm border rounded-full pr-28 pl-6 h-12 shadow-sm ${
                                            darkMode 
                                                ? 'bg-gray-700/60 border-gray-600 text-white placeholder:text-gray-400' 
                                                : 'bg-white/60 border-gray-300'
                                        }`}
                                    />
                                    <Button 
                                        onClick={generateAICode} 
                                        disabled={aiLoading || !aiPrompt.trim()} 
                                        className="absolute right-1 top-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-full h-10 px-5 text-sm font-medium"
                                    >
                                        {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Generating...</> : <><Code2 className="w-4 h-4 mr-1" /> Generate</>}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Color Picker Tab */}
                        {showColorPicker && (
                            <div className={`px-3 md:px-4 py-3 border-b backdrop-blur-3xl shadow-inner ${
                                darkMode 
                                    ? 'border-gray-700 bg-[#0c0f1f]' 
                                    : 'border-white/20 bg-white/30'
                            }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-sm md:text-base font-semibold flex items-center gap-2 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                                        <Palette className={`w-4 h-4 ${darkMode ? 'text-orange-500' : 'text-orange-600'}`} /> Color Picker
                                    </h3>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex gap-2 flex-wrap">
                                            {['#000000', '#dc2626', '#ea580c', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ffffff'].map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => {
                                                        if (quillRef.current) {
                                                            const quill = quillRef.current.getEditor();
                                                            if (colorPickerMode === 'text') {
                                                                quill.format('color', c);
                                                            } else {
                                                                quill.format('background', c);
                                                            }
                                                        }
                                                    }}
                                                    className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => setColorPickerMode('text')}
                                            variant={colorPickerMode === 'text' ? 'default' : 'outline'}
                                            size="sm"
                                            className="text-xs"
                                        >
                                            Text
                                        </Button>
                                        <Button
                                            onClick={() => setColorPickerMode('background')}
                                            variant={colorPickerMode === 'background' ? 'default' : 'outline'}
                                            size="sm"
                                            className="text-xs"
                                        >
                                            Background
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Format Tab */}
                        {showFormatModal && (
                            <div className={`px-3 md:px-4 py-3 border-b backdrop-blur-3xl shadow-inner ${
                                darkMode 
                                    ? 'border-gray-700 bg-[#0c0f1f]' 
                                    : 'border-white/20 bg-white/30'
                            }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-sm md:text-base font-semibold flex items-center gap-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                                        <AlignLeft className={`w-4 h-4 ${darkMode ? 'text-indigo-500' : 'text-indigo-600'}`} /> Text Formatting
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <button
                                            onClick={() => quillRef.current?.getEditor().format('bold', !quillRef.current?.getEditor().getFormat().bold)}
                                            className={`px-3.5 py-2.5 rounded-lg text-base font-semibold transition-all border min-w-[44px] min-h-[44px] flex items-center justify-center ${
                                                darkMode 
                                                    ? 'bg-gray-700/60 hover:bg-gray-600 border-gray-600 text-gray-200' 
                                                    : 'bg-white/60 hover:bg-white/80 border-gray-300'
                                            }`}
                                        >
                                            <strong>B</strong>
                                        </button>
                                        <button
                                            onClick={() => quillRef.current?.getEditor().format('italic', !quillRef.current?.getEditor().getFormat().italic)}
                                            className={`px-3.5 py-2.5 rounded-lg text-base italic transition-all border min-w-[44px] min-h-[44px] flex items-center justify-center ${
                                                darkMode 
                                                    ? 'bg-gray-700/60 hover:bg-gray-600 border-gray-600 text-gray-200' 
                                                    : 'bg-white/60 hover:bg-white/80 border-gray-300'
                                            }`}
                                        >
                                            I
                                        </button>
                                        <button
                                            onClick={() => quillRef.current?.getEditor().format('underline', !quillRef.current?.getEditor().getFormat().underline)}
                                            className={`px-3.5 py-2.5 rounded-lg text-base underline transition-all border min-w-[44px] min-h-[44px] flex items-center justify-center ${
                                                darkMode 
                                                    ? 'bg-gray-700/60 hover:bg-gray-600 border-gray-600 text-gray-200' 
                                                    : 'bg-white/60 hover:bg-white/80 border-gray-300'
                                            }`}
                                        >
                                            U
                                        </button>
                                        <div className={`w-px h-8 mx-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                                        <button
                                            onClick={() => quillRef.current?.getEditor().format('list', 'bullet')}
                                            className={`px-3.5 py-2.5 rounded-lg text-sm transition-all border min-w-[44px] min-h-[44px] flex items-center justify-center ${
                                                darkMode 
                                                    ? 'bg-gray-700/60 hover:bg-gray-600 border-gray-600 text-gray-200' 
                                                    : 'bg-white/60 hover:bg-white/80 border-gray-300'
                                            }`}
                                        >
                                            • List
                                        </button>
                                        <button
                                            onClick={() => quillRef.current?.getEditor().format('list', 'ordered')}
                                            className={`px-3.5 py-2.5 rounded-lg text-sm transition-all border min-w-[44px] min-h-[44px] flex items-center justify-center ${
                                                darkMode 
                                                    ? 'bg-gray-700/60 hover:bg-gray-600 border-gray-600 text-gray-200' 
                                                    : 'bg-white/60 hover:bg-white/80 border-gray-300'
                                            }`}
                                        >
                                            1. List
                                        </button>
                                        <div className={`w-px h-8 mx-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                                        <button
                                            onClick={handleAddLink}
                                            className={`px-3.5 py-2.5 rounded-lg text-sm transition-all border min-w-[44px] min-h-[44px] flex items-center justify-center ${
                                                darkMode 
                                                    ? 'bg-gray-700/60 hover:bg-gray-600 border-gray-600 text-gray-200' 
                                                    : 'bg-white/60 hover:bg-white/80 border-gray-300'
                                            }`}
                                        >
                                            🔗 Link
                                        </button>
                                        <label className={`px-3.5 py-2.5 rounded-lg text-sm transition-all border cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center ${
                                            darkMode 
                                                ? 'bg-gray-700/60 hover:bg-gray-600 border-gray-600 text-gray-200' 
                                                : 'bg-white/60 hover:bg-white/80 border-gray-300'
                                        }`}>
                                            {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : '🖼️ Image'}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        </label>
                                        <div className={`w-px h-8 mx-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                                        <Button
                                            onClick={formatContent}
                                            disabled={formatLoading}
                                            className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-lg px-4 py-2.5 text-sm min-h-[44px]"
                                        >
                                            {formatLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Formatting...</> : <><Sparkles className="w-4 h-4 mr-1" /> AI Format</>}
                                        </Button>
                                    </div>

                                    {showLinkInput && (
                                        <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                                            darkMode 
                                                ? 'bg-gray-700/80 border-indigo-500/50' 
                                                : 'bg-white/80 border-indigo-200'
                                        }`}>
                                            <Input
                                                placeholder="Enter URL (https://...)"
                                                value={linkUrl}
                                                onChange={(e) => setLinkUrl(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && applyLink()}
                                                className={`flex-1 h-10 ${
                                                    darkMode 
                                                        ? 'bg-gray-800 border-gray-600 text-white' 
                                                        : ''
                                                }`}
                                                autoFocus
                                            />
                                            <Button onClick={applyLink} size="sm" className="bg-indigo-600 hover:bg-indigo-700 min-h-[40px]">
                                                Add
                                            </Button>
                                            <Button onClick={() => { setShowLinkInput(false); setLinkUrl(''); }} size="sm" variant="ghost" className={`min-h-[40px] ${
                                                darkMode ? 'hover:bg-gray-600' : ''
                                            }`}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className={`px-3 md:px-4 py-2 border-b backdrop-blur-xl ${
                            darkMode 
                                ? 'border-gray-700/50 bg-[#0c0f1f]' 
                                : 'border-gray-200/50 bg-white/30'
                        }`}>
                            <Input
                                placeholder="Note title..."
                                value={noteTitle}
                                onChange={e => setNoteTitle(e.target.value)}
                                className={`text-sm font-semibold border-0 shadow-none focus-visible:ring-0 w-full bg-transparent px-0 ${
                                    darkMode 
                                        ? 'text-white placeholder:text-gray-500' 
                                        : 'placeholder:text-gray-400'
                                }`}
                            />
                        </div>

                        <div className="relative" style={{ height: 'calc(100vh - 200px)' }}>
                            <ReactQuill
                                ref={quillRef}
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
                                    display: none !important;
                                }
                                .notes-quill-responsive .ql-container {
                                    border: none !important;
                                    background: transparent !important;
                                }
                                .notes-quill-responsive .ql-editor {
                                    background: ${darkMode ? '#0c0f1f' : 'rgba(255, 255, 255, 0.3)'} !important;
                                    backdrop-filter: blur(20px) !important;
                                    font-size: ${getEditorFontSize()} !important;
                                    padding: 12px !important;
                                    color: ${darkMode ? 'rgba(229, 231, 235, 0.9)' : 'inherit'} !important;
                                }
                                .notes-quill-responsive .ql-editor::before {
                                    color: ${darkMode ? 'rgba(156, 163, 175, 0.6)' : 'rgba(107, 114, 128, 0.6)'} !important;
                                }
                                .notes-quill-responsive .ql-editor table {
                                    border-collapse: collapse !important;
                                    width: 100% !important;
                                    margin: 16px 0 !important;
                                    border: 2px solid #333 !important;
                                    display: table !important;
                                }
                                .notes-quill-responsive .ql-editor table tbody {
                                    display: table-row-group !important;
                                }
                                .notes-quill-responsive .ql-editor table tr {
                                    display: table-row !important;
                                }
                                .notes-quill-responsive .ql-editor table td {
                                    border: 1px solid #333 !important;
                                    padding: 12px !important;
                                    display: table-cell !important;
                                    background-color: #ffffff !important;
                                }
                                .notes-quill-responsive .ql-editor table tr:first-child td {
                                    background-color: #f3f4f6 !important;
                                    font-weight: bold !important;
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
                    </div>
                </div>
            </div>
            </>
        );
    }

    return (
        <>
            <style>{`
                /* Only apply to note card content, not header/metadata */
                .notes-app-container .note-card-content {
                    font-size: ${getGlobalFontSize()} !important;
                }
            `}</style>
            <div className={`notes-app-container min-h-screen p-3 md:p-6 xl:p-0 ${darkMode ? 'bg-[#0c0f1f]' : 'bg-white'}`} style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))', paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))', paddingLeft: 'max(0.75rem, env(safe-area-inset-left))', paddingRight: 'max(0.75rem, env(safe-area-inset-right))' }}>
                <div className="max-w-7xl xl:max-w-none mx-auto xl:mx-0">
                    {/* Header */}
                    <div className="mb-4 md:mb-6">
                        {/* Logo and Title */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <img 
                                    src={darkMode 
                                        ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693a3e794fd471020431f334/b7a3334f5_AppIcon1.png"
                                        : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693a3e794fd471020431f334/7607f2d39_AppIcon.png"
                                    }
                                    alt="Notes AI" 
                                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl shadow-lg"
                                />
                                <div>
                                    <h1 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: '1.55rem' }}>Notes Ai</h1>
                                    <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Text, images and code</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {user?.full_name || 'User'}
                                </p>
                                <Button 
                                    onClick={() => setShowSettings(true)} 
                                    variant="ghost" 
                                    size="lg"
                                    className={`${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    <Settings className="w-20 h-20" />
                                </Button>
                            </div>
                        </div>

                        {/* Search Bar, View Mode and New Note Button */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                <Input
                                    placeholder="Search notes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`pl-10 backdrop-blur-xl rounded-full focus:border-purple-500 focus:ring-purple-500 w-full ${
                                        darkMode 
                                            ? 'bg-gray-800/60 border-gray-700 text-white placeholder:text-gray-500' 
                                            : 'bg-white/60 border-gray-300'
                                    }`}
                                />
                            </div>
                            <div className={`flex items-center backdrop-blur-xl rounded-xl shadow-sm p-1 ${
                                darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/60 border-white/80'
                            } border`}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${
                                        viewMode === 'grid' 
                                            ? 'bg-purple-500 text-white' 
                                            : darkMode ? 'text-gray-400 hover:bg-gray-700/80' : 'text-gray-600 hover:bg-white/80'
                                    }`}
                                >
                                    <Grid3x3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${
                                        viewMode === 'list' 
                                            ? 'bg-purple-500 text-white' 
                                            : darkMode ? 'text-gray-400 hover:bg-gray-700/80' : 'text-gray-600 hover:bg-white/80'
                                    }`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('title')}
                                    className={`p-2 rounded-lg transition-all ${
                                        viewMode === 'title' 
                                            ? 'bg-purple-500 text-white' 
                                            : darkMode ? 'text-gray-400 hover:bg-gray-700/80' : 'text-gray-600 hover:bg-white/80'
                                    }`}
                                >
                                    <AlignLeft className="w-4 h-4" />
                                </button>
                            </div>
                            <Button onClick={() => openNewNote()} className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 backdrop-blur-xl shadow-lg border-0">
                                <Plus className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">New Note</span>
                            </Button>
                        </div>
                    </div>

                    {/* Notes Grid */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12 md:py-20">
                            <Loader2 className="w-6 md:w-8 h-6 md:h-8 animate-spin text-purple-600" />
                        </div>
                    ) : filteredNotes.length === 0 ? (
                        <div className={`text-center py-12 md:py-20 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl ${
                            darkMode 
                                ? 'bg-gray-800/40 border-gray-700' 
                                : 'bg-white/40 border-white/60'
                        } border`}>
                            <FileText className={`w-12 md:w-16 h-12 md:h-16 mx-auto mb-3 md:mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                            <h2 className={`text-lg md:text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No notes yet</h2>
                            <p className={`text-sm md:text-base mb-3 md:mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Create your first note or use a template</p>
                            <Button onClick={() => openNewNote()} variant="outline" className={`text-sm backdrop-blur-md ${
                                darkMode 
                                    ? 'bg-gray-700/60 border-gray-600 hover:bg-gray-700/80 text-gray-200' 
                                    : 'bg-white/60 border-white/80 hover:bg-white/80'
                            }`}>
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
                                    darkMode={darkMode}
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
                                        className={`backdrop-blur-xl rounded-xl md:rounded-2xl border p-3 md:p-4 cursor-pointer hover:shadow-xl transition-all shadow-lg flex items-start gap-3 md:gap-4 ${
                                            darkMode 
                                                ? 'bg-gray-800/60 border-gray-700 hover:bg-gray-800/80 hover:border-purple-500' 
                                                : 'bg-white/60 border-white/80 hover:bg-white/80 hover:border-purple-300'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`note-card-content font-bold mb-1 text-sm md:text-base truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{note.title || 'Untitled'}</h3>
                                            <p className={`note-card-content text-xs md:text-sm line-clamp-2 mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{content.slice(0, 150) || 'No content'}</p>
                                            <div className={`flex items-center gap-2 md:gap-3 text-[10px] md:text-xs flex-wrap ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
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
                                                            <span key={i} className={`text-[10px] px-1.5 py-0.5 backdrop-blur-sm rounded border ${
                                                                darkMode 
                                                                    ? 'bg-gray-700/60 text-gray-300 border-gray-600' 
                                                                    : 'bg-white/60 text-gray-700 border-white/80'
                                                            }`}>{tag}</span>
                                                        ))}
                                                        {note.tags.length > 2 && <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>+{note.tags.length - 2}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={`backdrop-blur-xl rounded-xl md:rounded-2xl border shadow-lg divide-y ${
                            darkMode 
                                ? 'bg-gray-800/60 border-gray-700 divide-gray-700/50' 
                                : 'bg-white/60 border-white/80 divide-gray-200/50'
                        }`}>
                            {filteredNotes.map(note => (
                                <div
                                    key={note.id}
                                    className={`p-3 md:p-4 cursor-pointer transition-all flex items-center justify-between group ${
                                        darkMode ? 'hover:bg-gray-700/80' : 'hover:bg-white/80'
                                    }`}
                                >
                                    <div onClick={() => openNote(note)} className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                        <FileText className={`w-4 md:w-5 h-4 md:h-5 flex-shrink-0 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`note-card-content font-semibold text-sm md:text-base truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{note.title || 'Untitled'}</h3>
                                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{formatDate(note.created_date)}</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        {note.tags && note.tags.length > 0 && (
                                            <span className={`hidden sm:inline text-[10px] px-2 py-1 backdrop-blur-sm rounded border ${
                                                darkMode 
                                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                                                    : 'bg-purple-100/60 text-purple-700 border-purple-200/50'
                                            }`}>{note.tags[0]}</span>
                                        )}
                                        <span className="hidden md:inline text-[10px]">{note.word_count || 0} words</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(note.id); }}
                                            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg ${
                                                darkMode 
                                                    ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                                                    : 'hover:bg-red-100 text-red-500 hover:text-red-700'
                                            }`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                        {/* Quick Start Templates */}
                        {!isLoading && (
                        <div className={`backdrop-blur-xl rounded-2xl md:rounded-3xl border shadow-xl p-3 md:p-5 mt-6 ${
                            darkMode 
                                ? 'bg-gray-800/40 border-gray-700' 
                                : 'bg-white/40 border-white/60'
                        }`}>
                        <h2 className={`font-semibold mb-3 md:mb-4 text-sm md:text-base ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>Quick Start Templates</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
                            {TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => openNewNote(t)}
                                    className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-md border text-left transition-all shadow-sm hover:shadow-md ${
                                        darkMode 
                                            ? 'bg-gray-700/60 hover:bg-gray-700/80 border-gray-600 hover:border-purple-500' 
                                            : 'bg-white/60 hover:bg-white/80 border-white/80 hover:border-purple-200'
                                    }`}
                                >
                                    <t.icon className="w-4 md:w-5 h-4 md:h-5" style={{ color: t.color }} />
                                    <span className={`font-medium text-xs md:text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t.name}</span>
                                </button>
                            ))}
                        </div>
                        </div>
                        )}
                        </div>
                        </div>

            {toast && <Toast message={toast} onClose={() => setToast(null)} />}

            {/* Settings Modal */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogContent className={`max-w-md w-full h-full sm:h-auto sm:max-h-[90vh] m-0 sm:m-4 rounded-none sm:rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <Settings className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
                        </div>

                        {/* Profile Info */}
                        <div className={`space-y-3 p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Profile</h3>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                                    <User className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                </div>
                                <div className="flex-1">
                                    {editingName ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                className={`h-8 ${darkMode ? 'bg-gray-800 border-gray-600' : ''}`}
                                                autoFocus
                                            />
                                            <Button 
                                                size="sm" 
                                                onClick={async () => {
                                                    if (newName.trim()) {
                                                        try {
                                                            await base44.auth.updateMe({ full_name: newName.trim() });
                                                            await queryClient.invalidateQueries({ queryKey: ['user'] });
                                                            await queryClient.refetchQueries({ queryKey: ['user'] });
                                                            setEditingName(false);
                                                        } catch (error) {
                                                            console.error('Failed to update name:', error);
                                                        }
                                                    }
                                                }}
                                                className="h-8 bg-purple-600 hover:bg-purple-700"
                                            >
                                                Save
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="ghost"
                                                onClick={() => setEditingName(false)}
                                                className="h-8"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.full_name || 'User'}</p>
                                                <p className={`text-sm flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    <Mail className="w-3 h-3" />
                                                    {user?.email || 'user@example.com'}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setNewName(user?.full_name || '');
                                                    setEditingName(true);
                                                }}
                                                className={`${darkMode ? 'hover:bg-gray-600' : ''}`}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Theme Toggle */}
                        <div className="space-y-3">
                            <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Appearance</h3>
                            <div className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-3">
                                    {darkMode ? (
                                        <Moon className="w-5 h-5 text-purple-400" />
                                    ) : (
                                        <Sun className="w-5 h-5 text-yellow-500" />
                                    )}
                                    <div>
                                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dark Mode</p>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {darkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                                        </p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={darkMode} 
                                    onCheckedChange={setDarkMode}
                                />
                            </div>

                            {/* Text Size */}
                            <div className="space-y-3">
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Text Size</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'small', label: 'Small', icon: 'Aa' },
                                        { id: 'medium', label: 'Medium', icon: 'Aa' },
                                        { id: 'large', label: 'Large', icon: 'Aa' }
                                    ].map(size => (
                                        <button
                                            key={size.id}
                                            onClick={() => setTextSize(size.id)}
                                            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                                                textSize === size.id
                                                    ? 'bg-purple-500 border-2 border-purple-500 text-white'
                                                    : darkMode
                                                        ? 'bg-gray-700/50 border-2 border-gray-600 text-gray-300 hover:bg-gray-600'
                                                        : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className={`font-bold mb-1 ${
                                                size.id === 'small' ? 'text-lg' : size.id === 'large' ? 'text-3xl' : 'text-2xl'
                                            }`}>{size.icon}</span>
                                            <span className="text-sm font-medium">{size.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <Button 
                            onClick={() => base44.auth.logout()} 
                            variant="outline"
                            className={`w-full ${darkMode ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : 'border-red-300 text-red-600 hover:bg-red-50'}`}
                        >
                            Logout
                        </Button>

                        {/* Close Button */}
                        <Button 
                            onClick={() => setShowSettings(false)} 
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
                </>
                );
                }