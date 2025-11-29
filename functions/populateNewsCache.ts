import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const CATEGORIES = [
    { id: 'technology', subtopics: ['AI', 'Startups', 'Gadgets', 'Cybersecurity', 'Software', 'Cloud Computing', 'Blockchain', 'Robotics', '5G Networks', 'IoT'] },
    { id: 'business', subtopics: ['Stocks', 'Economy', 'Crypto', 'Real Estate', 'Finance', 'Mergers', 'IPOs', 'Venture Capital', 'Banking', 'Commodities'] },
    { id: 'science', subtopics: ['Space', 'Physics', 'Biology', 'Climate', 'Research', 'Astronomy', 'Genetics', 'Archaeology', 'Chemistry', 'Quantum'] },
    { id: 'health', subtopics: ['Medicine', 'Wellness', 'Mental Health', 'Nutrition', 'Fitness', 'Vaccines', 'Aging', 'Sleep', 'Diseases', 'Healthcare Policy'] },
    { id: 'politics', subtopics: ['Elections', 'Policy', 'Congress', 'International', 'Law', 'Supreme Court', 'Diplomacy', 'Defense', 'Immigration', 'Trade'] },
    { id: 'sports', subtopics: ['Football', 'Basketball', 'Soccer', 'Tennis', 'Olympics', 'Baseball', 'Golf', 'MMA', 'Formula 1', 'Cricket'] },
    { id: 'entertainment', subtopics: ['Movies', 'Music', 'TV Shows', 'Celebrities', 'Gaming', 'Streaming', 'Broadway', 'Awards', 'Podcasts', 'Anime'] },
    { id: 'world', subtopics: ['Europe', 'Asia', 'Americas', 'Africa', 'Middle East', 'Australia', 'Russia', 'India', 'China', 'Latin America'] },
];

// NewsAPI fetch function
async function fetchNewsAPI(query, category = null) {
    const apiKey = Deno.env.get('NEWSAPI_KEY');
    if (!apiKey) return [];
    
    try {
        let url = 'https://newsapi.org/v2/';
        
        if (query) {
            url += `everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=15&language=en`;
        } else if (category) {
            url += `top-headlines?category=${category}&country=us&pageSize=15`;
        } else {
            url += 'top-headlines?country=us&pageSize=15';
        }
        
        const response = await fetch(url, {
            headers: { 'X-Api-Key': apiKey },
        });
        
        if (!response.ok) {
            console.error(`NewsAPI error: ${response.status}`);
            return [];
        }
        
        const data = await response.json();
        
        return (data.articles || []).map(art => ({
            title: art.title || 'No title',
            url: art.url,
            source: art.source?.name || 'NewsAPI',
            summary: art.description || '',
            time: formatTime(art.publishedAt),
            imageUrl: art.urlToImage,
        })).filter(a => a.title && a.url && !a.title.includes('[Removed]'));
    } catch (error) {
        console.error('NewsAPI fetch failed:', error.message);
        return [];
    }
}

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

// Rate limit helper - wait between API calls
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { mode = 'all' } = await req.json().catch(() => ({}));
        
        const results = { categories: 0, subtopics: 0, errors: [] };
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour cache
        
        // Clear existing cache
        const existingCache = await base44.asServiceRole.entities.NewsCache.filter({});
        for (const cache of existingCache) {
            await base44.asServiceRole.entities.NewsCache.delete(cache.id);
        }
        
        // Fetch and cache main categories
        for (const cat of CATEGORIES) {
            try {
                const articles = await fetchNewsAPI(null, cat.id === 'world' ? 'general' : cat.id);
                
                if (articles.length > 0) {
                    await base44.asServiceRole.entities.NewsCache.create({
                        category: cat.id,
                        articles: articles,
                        expires_at: expiresAt,
                    });
                    results.categories++;
                }
                
                await delay(1100); // NewsAPI rate limit: 1 req/sec on free tier
            } catch (err) {
                results.errors.push(`Category ${cat.id}: ${err.message}`);
            }
        }
        
        // Fetch and cache subtopics (if mode is 'all')
        if (mode === 'all') {
            for (const cat of CATEGORIES) {
                for (const subtopic of cat.subtopics) {
                    try {
                        const articles = await fetchNewsAPI(subtopic);
                        
                        if (articles.length > 0) {
                            await base44.asServiceRole.entities.NewsCache.create({
                                category: subtopic.toLowerCase(),
                                articles: articles,
                                expires_at: expiresAt,
                            });
                            results.subtopics++;
                        }
                        
                        await delay(1100); // Rate limit
                    } catch (err) {
                        results.errors.push(`Subtopic ${subtopic}: ${err.message}`);
                    }
                }
            }
        }
        
        return Response.json({
            success: true,
            message: `Cached ${results.categories} categories and ${results.subtopics} subtopics`,
            results,
            expires_at: expiresAt,
        });
        
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});