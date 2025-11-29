import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const NEWSAPI_KEY = Deno.env.get('NEWSAPI_KEY');

// All categories and subtopics to fetch
const ALL_TOPICS = [
    'technology', 'AI', 'Startups', 'Gadgets', 'Cybersecurity', 'Software', 'Cloud Computing', 'Blockchain', 'Robotics', '5G Networks', 'IoT',
    'business', 'Stocks', 'Economy', 'Crypto', 'Real Estate', 'Finance', 'Mergers', 'IPOs', 'Venture Capital', 'Banking', 'Commodities',
    'science', 'Space', 'Physics', 'Biology', 'Climate', 'Research', 'Astronomy', 'Genetics', 'Archaeology', 'Chemistry', 'Quantum',
    'health', 'Medicine', 'Wellness', 'Mental Health', 'Nutrition', 'Fitness', 'Vaccines', 'Aging', 'Sleep', 'Diseases', 'Healthcare Policy',
    'politics', 'Elections', 'Policy', 'Congress', 'International', 'Law', 'Supreme Court', 'Diplomacy', 'Defense', 'Immigration', 'Trade',
    'sports', 'Football', 'Basketball', 'Soccer', 'Tennis', 'Olympics', 'Baseball', 'Golf', 'MMA', 'Formula 1', 'Cricket',
    'entertainment', 'Movies', 'Music', 'TV Shows', 'Celebrities', 'Gaming', 'Streaming', 'Broadway', 'Awards', 'Podcasts', 'Anime',
    'world', 'Europe', 'Asia', 'Americas', 'Africa', 'Middle East', 'Australia', 'Russia', 'India', 'China', 'Latin America'
];

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
    } catch (e) {
        return 'Recently';
    }
}

async function fetchFromNewsAPI(searchTerm, limit) {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchTerm)}&sortBy=publishedAt&pageSize=${limit}&language=en&apiKey=${NEWSAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'ok' || !data.articles) {
        return [];
    }
    
    return data.articles
        .filter(a => a.title && a.title !== '[Removed]')
        .map(a => ({
            title: a.title,
            source: a.source?.name || 'News',
            summary: a.description || '',
            url: a.url || '',
            published_at: a.publishedAt
        }));
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized', articles: [] }, { status: 401 });
        }

        let body = {};
        try {
            body = await req.json();
        } catch (e) {}
        
        const { query, category, limit = 15, refresh = false, populateAll = false } = body;
        const searchTerm = query || category || 'technology';
        
        // POPULATE ALL TOPICS (dev mode - run once to fill DB)
        if (populateAll && NEWSAPI_KEY) {
            const results = { success: [], failed: [] };
            
            for (const topic of ALL_TOPICS) {
                try {
                    // Small delay to avoid rate limiting
                    await new Promise(r => setTimeout(r, 1000));
                    
                    const articles = await fetchFromNewsAPI(topic, 12);
                    
                    if (articles.length > 0) {
                        // Delete old articles for this topic
                        const oldArticles = await base44.asServiceRole.entities.NewsArticle.filter({ category: topic });
                        for (const old of oldArticles) {
                            await base44.asServiceRole.entities.NewsArticle.delete(old.id);
                        }
                        
                        // Save new articles
                        for (const article of articles) {
                            await base44.asServiceRole.entities.NewsArticle.create({
                                title: article.title,
                                source: article.source,
                                summary: article.summary,
                                url: article.url,
                                category: topic,
                                published_at: article.published_at
                            });
                        }
                        results.success.push({ topic, count: articles.length });
                    } else {
                        results.failed.push({ topic, reason: 'No articles' });
                    }
                } catch (err) {
                    results.failed.push({ topic, reason: err.message });
                }
            }
            
            return Response.json({
                success: true,
                message: 'Populated all topics',
                results
            });
        }
        
        // First try NewsAPI directly
        if (NEWSAPI_KEY) {
            try {
                const articles = await fetchFromNewsAPI(searchTerm, limit);
                
                if (articles.length > 0) {
                    return Response.json({
                        success: true,
                        count: articles.length,
                        articles: articles.map(a => ({ ...a, time: formatTime(a.published_at) })),
                        cached: false
                    });
                }
            } catch (apiError) {
                console.log('NewsAPI failed:', apiError.message);
            }
        }
        
        // Fallback: serve from database cache
        try {
            const cached = await base44.asServiceRole.entities.NewsArticle.filter(
                { category: searchTerm },
                '-created_date',
                limit
            );
            
            if (cached && cached.length > 0) {
                const articles = cached.map(a => ({
                    title: a.title,
                    source: a.source || 'News',
                    summary: a.summary || '',
                    url: a.url || '',
                    time: formatTime(a.published_at),
                    image_url: a.image_url
                }));
                
                return Response.json({
                    success: true,
                    count: articles.length,
                    articles: articles,
                    cached: true
                });
            }
        } catch (cacheError) {
            console.log('Cache check failed:', cacheError.message);
        }
        
        // If refresh requested, try NewsAPI again to save to cache
        if (refresh && NEWSAPI_KEY) {
            const articles = await fetchFromNewsAPI(searchTerm, limit);
            
            if (articles.length > 0) {
                // Delete old and save new
                try {
                    const oldArticles = await base44.asServiceRole.entities.NewsArticle.filter({ category: searchTerm });
                    for (const old of oldArticles) {
                        await base44.asServiceRole.entities.NewsArticle.delete(old.id);
                    }
                    
                    for (const article of articles) {
                        await base44.asServiceRole.entities.NewsArticle.create({
                            title: article.title,
                            source: article.source,
                            summary: article.summary,
                            url: article.url,
                            category: searchTerm,
                            published_at: article.published_at
                        });
                    }
                } catch (saveError) {
                    console.log('Failed to cache:', saveError.message);
                }
                
                return Response.json({
                    success: true,
                    count: articles.length,
                    articles: articles.map(a => ({ ...a, time: formatTime(a.published_at) })),
                    cached: false
                });
            }
        }
        
        // No cached content found
        return Response.json({
            success: true,
            count: 0,
            articles: [],
            message: 'No cached articles. Use refresh=true in dev to populate.'
        });
        
    } catch (error) {
        console.error('fetchNews error:', error.message);
        return Response.json({ 
            success: false, 
            error: error.message,
            articles: [] 
        });
    }
});