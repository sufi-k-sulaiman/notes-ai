import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

function formatTime(dateStr) {
    if (!dateStr) return 'Recently';
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    } catch {
        return 'Recently';
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let body = {};
        try {
            body = await req.json();
        } catch {
            // Empty body is fine
        }
        
        const { query, category, limit = 20 } = body;
        const searchTerm = query || category || 'technology';
        
        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: `Find the latest ${limit} news articles about "${searchTerm}". Return real, current news from today or this week with valid URLs.`,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    articles: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                source: { type: "string" },
                                summary: { type: "string" },
                                url: { type: "string" },
                                publishedAt: { type: "string" }
                            }
                        }
                    }
                }
            }
        });
        
        const articles = (llmResponse?.articles || [])
            .filter(a => a.title && a.url)
            .map(a => ({
                title: a.title,
                source: a.source || 'News',
                summary: a.summary || '',
                url: a.url,
                time: formatTime(a.publishedAt)
            }));
        
        return Response.json({
            success: true,
            count: articles.length,
            articles: articles,
        });
        
    } catch (error) {
        console.error('fetchNews error:', error);
        return Response.json({ 
            success: false, 
            error: error.message,
            articles: [] 
        }, { status: 500 });
    }
});