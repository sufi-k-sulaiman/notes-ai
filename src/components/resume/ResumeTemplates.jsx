import React, { useState } from 'react';
import { Check, Eye, X } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const RESUME_TEMPLATES = [
    // Modern
    { id: 'modern-professional', name: 'Modern Professional', category: 'Modern', color: '#6B4EE6', headerStyle: 'centered', accentPosition: 'top' },
    { id: 'clean-minimal', name: 'Clean Minimal', category: 'Modern', color: '#3B82F6', headerStyle: 'left', accentPosition: 'left' },
    { id: 'bold-impact', name: 'Bold Impact', category: 'Modern', color: '#EC4899', headerStyle: 'centered', accentPosition: 'full' },
    { id: 'tech-forward', name: 'Tech Forward', category: 'Modern', color: '#10B981', headerStyle: 'left', accentPosition: 'sidebar' },
    { id: 'creative-edge', name: 'Creative Edge', category: 'Modern', color: '#F59E0B', headerStyle: 'centered', accentPosition: 'diagonal' },
    // Classic
    { id: 'executive-classic', name: 'Executive Classic', category: 'Classic', color: '#1E3A5F', headerStyle: 'centered', accentPosition: 'underline' },
    { id: 'traditional-pro', name: 'Traditional Pro', category: 'Classic', color: '#374151', headerStyle: 'left', accentPosition: 'none' },
    { id: 'timeless-elegant', name: 'Timeless Elegant', category: 'Classic', color: '#1F2937', headerStyle: 'centered', accentPosition: 'border' },
    { id: 'corporate-standard', name: 'Corporate Standard', category: 'Classic', color: '#4B5563', headerStyle: 'left', accentPosition: 'top' },
    { id: 'professional-plus', name: 'Professional Plus', category: 'Classic', color: '#111827', headerStyle: 'centered', accentPosition: 'left' },
    // Creative
    { id: 'designer-portfolio', name: 'Designer Portfolio', category: 'Creative', color: '#8B5CF6', headerStyle: 'sidebar', accentPosition: 'full' },
    { id: 'artistic-flair', name: 'Artistic Flair', category: 'Creative', color: '#EC4899', headerStyle: 'centered', accentPosition: 'gradient' },
    { id: 'visual-impact', name: 'Visual Impact', category: 'Creative', color: '#06B6D4', headerStyle: 'left', accentPosition: 'blocks' },
    { id: 'creative-canvas', name: 'Creative Canvas', category: 'Creative', color: '#F97316', headerStyle: 'centered', accentPosition: 'shapes' },
    { id: 'bold-statement', name: 'Bold Statement', category: 'Creative', color: '#EF4444', headerStyle: 'full', accentPosition: 'header' },
    // Technical
    { id: 'developer-dark', name: 'Developer Dark', category: 'Technical', color: '#7C3AED', headerStyle: 'left', accentPosition: 'sidebar' },
    { id: 'engineer-pro', name: 'Engineer Pro', category: 'Technical', color: '#2563EB', headerStyle: 'left', accentPosition: 'minimal' },
    { id: 'data-driven', name: 'Data Driven', category: 'Technical', color: '#059669', headerStyle: 'centered', accentPosition: 'charts' },
    { id: 'tech-minimal', name: 'Tech Minimal', category: 'Technical', color: '#475569', headerStyle: 'left', accentPosition: 'code' },
    { id: 'system-architect', name: 'System Architect', category: 'Technical', color: '#0EA5E9', headerStyle: 'left', accentPosition: 'grid' },
];

export function TemplateCard({ template, isSelected, onSelect, onPreview }) {
    return (
        <div
            className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all group ${
                isSelected ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
            }`}
        >
            {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center z-10">
                    <Check className="w-4 h-4 text-white" />
                </div>
            )}
            <div 
                onClick={() => onSelect(template.id)}
                className="aspect-[3/4] rounded-lg mb-3 overflow-hidden" 
                style={{ backgroundColor: '#F8FAFC' }}
            >
                <TemplateThumbnail template={template} />
            </div>
            <p className="text-sm font-medium text-gray-700 truncate text-center mb-2">{template.name}</p>
            <button
                onClick={(e) => { e.stopPropagation(); onPreview(template); }}
                className="w-full py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg flex items-center justify-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
            >
                <Eye className="w-3 h-3" /> Preview
            </button>
        </div>
    );
}

export function TemplateThumbnail({ template, isLarge = false }) {
    const { color, headerStyle, accentPosition } = template;
    const scale = isLarge ? 2 : 1;
    
    return (
        <div className="w-full h-full p-4 flex flex-col">
            {/* Header Area */}
            {accentPosition === 'full' && (
                <div className={`w-full rounded mb-3`} style={{ backgroundColor: color, height: 16 * scale }} />
            )}
            {accentPosition === 'top' && (
                <div className={`w-full rounded mb-3`} style={{ backgroundColor: color, height: 4 * scale }} />
            )}
            
            <div className={`flex ${headerStyle === 'centered' ? 'justify-center' : 'justify-start'} mb-4`}>
                <div>
                    <div className="rounded mb-2" style={{ backgroundColor: color, height: 6 * scale, width: 80 * scale }} />
                    <div className="bg-gray-300 rounded" style={{ height: 4 * scale, width: 60 * scale }} />
                </div>
            </div>
            
            {accentPosition === 'underline' && (
                <div className="w-full mb-3" style={{ backgroundColor: color, height: 2 * scale }} />
            )}
            
            {/* Content */}
            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                    {accentPosition === 'left' && <div style={{ backgroundColor: color, width: 3 * scale, height: 12 * scale }} />}
                    <div className="rounded" style={{ backgroundColor: color, height: 6 * scale, width: 50 * scale }} />
                </div>
                <div className="space-y-2">
                    <div className="bg-gray-200 rounded w-full" style={{ height: 4 * scale }} />
                    <div className="bg-gray-200 rounded w-4/5" style={{ height: 4 * scale }} />
                    <div className="bg-gray-200 rounded w-3/4" style={{ height: 4 * scale }} />
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                    {accentPosition === 'left' && <div style={{ backgroundColor: color, width: 3 * scale, height: 12 * scale }} />}
                    <div className="rounded" style={{ backgroundColor: color, height: 6 * scale, width: 40 * scale }} />
                </div>
                <div className="space-y-2">
                    <div className="bg-gray-200 rounded w-full" style={{ height: 4 * scale }} />
                    <div className="bg-gray-200 rounded w-2/3" style={{ height: 4 * scale }} />
                </div>
                
                {/* Skills */}
                <div className="flex gap-2 pt-2 flex-wrap">
                    <div className="rounded-full" style={{ backgroundColor: `${color}30`, border: `1px solid ${color}`, height: 8 * scale, width: 30 * scale }} />
                    <div className="rounded-full" style={{ backgroundColor: `${color}30`, border: `1px solid ${color}`, height: 8 * scale, width: 40 * scale }} />
                    <div className="rounded-full" style={{ backgroundColor: `${color}30`, border: `1px solid ${color}`, height: 8 * scale, width: 25 * scale }} />
                </div>
            </div>
        </div>
    );
}

export function TemplateSelector({ selectedTemplate, onSelect }) {
    const categories = ['Modern', 'Classic', 'Creative', 'Technical'];
    const [previewTemplate, setPreviewTemplate] = useState(null);
    
    return (
        <div className="space-y-6">
            <h2 className="font-semibold text-gray-900">Choose Template ({RESUME_TEMPLATES.length} designs)</h2>
            
            {categories.map(category => (
                <div key={category}>
                    <h3 className="text-sm font-medium text-gray-600 mb-3">{category}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {RESUME_TEMPLATES.filter(t => t.category === category).map(template => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                isSelected={selectedTemplate === template.id}
                                onSelect={onSelect}
                                onPreview={setPreviewTemplate}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {/* Preview Modal */}
            <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
                <DialogContent className="max-w-2xl p-0">
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
                        <div>
                            <h2 className="font-semibold text-gray-900">{previewTemplate?.name}</h2>
                            <p className="text-sm text-gray-500">{previewTemplate?.category} Template</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => { onSelect(previewTemplate?.id); setPreviewTemplate(null); }} className="bg-purple-600 hover:bg-purple-700">
                                <Check className="w-4 h-4 mr-1" /> Use Template
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setPreviewTemplate(null)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                    <div className="p-6">
                        {previewTemplate && (
                            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-w-md mx-auto">
                                <TemplateThumbnail template={previewTemplate} isLarge />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}