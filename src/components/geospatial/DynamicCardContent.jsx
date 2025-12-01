import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Cache for LLM responses to avoid duplicate calls
const contentCache = new Map();

export default function DynamicCardContent({ useCase, useCaseName }) {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check cache first
        if (contentCache.has(useCase)) {
            setContent(contentCache.get(useCase));
            setLoading(false);
            return;
        }

        setLoading(true);
        setContent(null);
        fetchContent();
    }, [useCase, useCaseName]);

    const fetchContent = async () => {
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate a brief summary for "${useCaseName}" environmental/resource category.

Provide:
1. A one-sentence description (max 15 words)
2. Three key bullet points (max 8 words each) about current global status

Keep it factual with 2024 data. No URLs.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        description: { type: "string" },
                        bullets: { 
                            type: "array", 
                            items: { type: "string" }
                        }
                    }
                }
            });
            
            contentCache.set(useCase, response);
            setContent(response);
        } catch (err) {
            console.error('Error fetching card content:', err);
            // Fallback content
            setContent({
                description: `Global ${useCaseName.toLowerCase()} monitoring and analysis`,
                bullets: ['Real-time data tracking', 'Impact assessment', 'Trend analysis']
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-2">
                <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <p className="text-sm text-gray-600 line-clamp-2">{content?.description}</p>
            <ul className="space-y-1">
                {content?.bullets?.slice(0, 3).map((bullet, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span className="line-clamp-1">{bullet}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}