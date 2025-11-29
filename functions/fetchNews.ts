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
        
        // Use NewsAPI directly - it's fast and reliable
        if (!NEWSAPI_KEY) {
            return Response.json({ 
                success: false, 
                error: 'NewsAPI key not configured',
                articles: [] 
            });
        }
        
        const newsApiCategory = CATEGORY_MAP[category] || 'general';
        const newsApiUrl = query 
            ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${limit}&language=en&apiKey=${NEWSAPI_KEY}`
            : `https://newsapi.org/v2/top-headlines?category=${newsApiCategory}&country=us&pageSize=${limit}&apiKey=${NEWSAPI_KEY}`;
        
        const response = await fetch(newsApiUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('NewsAPI error:', errorText);
            return Response.json({ 
                success: false, 
                error: `NewsAPI returned ${response.status}`,
                articles: [] 
            });
        }
        
        const data = await response.json();
        
        const articles = (data.articles || [])
            .filter(a => a.title && a.url && !a.title.includes('[Removed]'))
            .map(a => ({
                title: a.title,
                source: a.source?.name || 'News',
                summary: a.description || '',
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