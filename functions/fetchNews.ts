import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const NEWSAPI_KEY = Deno.env.get('NEWSAPI_KEY');

const CATEGORY_MAP = {
    technology: 'technology',
    business: 'business',
    science: 'science',
    health: 'health',
    sports: 'sports',
    entertainment: 'entertainment',
    world: 'general',
    politics: 'general',
};

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
        
        let articles = [];
        
        // Try LLM with internet context first
        try {
            const llmResult = await base44.integrations.Core.InvokeLLM({
                prompt: `Find the latest news articles about "${searchTerm}". Return exactly 15 real, current news articles from reputable sources. For each article provide the actual headline, source name, a brief summary, and the real article URL.`,
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
                                    time: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            
            if (llmResult?.articles?.length > 0) {
                articles = llmResult.articles.map(a => ({
                    title: a.title,
                    source: a.source || 'News',
                    summary: a.summary || '',
                    url: a.url,
                    time: a.time || 'Recently'
                }));
            }
        } catch (llmError) {
            console.error('LLM fetch failed:', llmError.message);
        }
        
        // Fallback to NewsAPI if LLM didn't return enough articles
        if (articles.length < 5 && NEWSAPI_KEY) {
            try {
                const newsApiCategory = CATEGORY_MAP[category] || 'general';
                const newsApiUrl = query 
                    ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=20&apiKey=${NEWSAPI_KEY}`
                    : `https://newsapi.org/v2/top-headlines?category=${newsApiCategory}&country=us&pageSize=20&apiKey=${NEWSAPI_KEY}`;
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
                const response = await fetch(newsApiUrl, { signal: controller.signal });
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.articles?.length > 0) {
                        articles = data.articles
                            .filter(a => a.title && a.url && !a.title.includes('[Removed]'))
                            .map(a => ({
                                title: a.title,
                                source: a.source?.name || 'News',
                                summary: a.description || '',
                                url: a.url,
                                time: formatTime(a.publishedAt)
                            }));
                    }
                }
            } catch (newsApiError) {
                console.error('NewsAPI fallback failed:', newsApiError.message);
            }
        }
        
        return Response.json({
            success: true,
            count: articles.length,
            articles: articles.slice(0, limit),
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