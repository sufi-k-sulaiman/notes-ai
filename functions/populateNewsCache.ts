import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const CATEGORIES = [
    { id: 'technology', apiCategory: 'technology', subtopics: ['AI', 'Startups', 'Gadgets', 'Cybersecurity', 'Software', 'Cloud Computing', 'Blockchain', 'Robotics', '5G Networks', 'IoT'] },
    { id: 'business', apiCategory: 'business', subtopics: ['Stocks', 'Economy', 'Crypto', 'Real Estate', 'Finance', 'Mergers', 'IPOs', 'Venture Capital', 'Banking', 'Commodities'] },
    { id: 'science', apiCategory: 'science', subtopics: ['Space', 'Physics', 'Biology', 'Climate', 'Research', 'Astronomy', 'Genetics', 'Archaeology', 'Chemistry', 'Quantum'] },
    { id: 'health', apiCategory: 'health', subtopics: ['Medicine', 'Wellness', 'Mental Health', 'Nutrition', 'Fitness', 'Vaccines', 'Aging', 'Sleep', 'Diseases', 'Healthcare Policy'] },
    { id: 'politics', apiCategory: 'general', subtopics: ['Elections', 'Policy', 'Congress', 'International', 'Law', 'Supreme Court', 'Diplomacy', 'Defense', 'Immigration', 'Trade'] },
    { id: 'sports', apiCategory: 'sports', subtopics: ['Football', 'Basketball', 'Soccer', 'Tennis', 'Olympics', 'Baseball', 'Golf', 'MMA', 'Formula 1', 'Cricket'] },
    { id: 'entertainment', apiCategory: 'entertainment', subtopics: ['Movies', 'Music', 'TV Shows', 'Celebrities', 'Gaming', 'Streaming', 'Broadway', 'Awards', 'Podcasts', 'Anime'] },
    { id: 'world', apiCategory: 'general', subtopics: ['Europe', 'Asia', 'Americas', 'Africa', 'Middle East', 'Australia', 'Russia', 'India', 'China', 'Latin America'] },
];

async function fetchNewsAPI(query, category = null) {
    const apiKey = Deno.env.get('NEWSAPI_KEY');
    if (!apiKey) throw new Error('NEWSAPI_KEY not configured');
    
    let url = 'https://newsapi.org/v2/';
    
    if (query) {
        url += `everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=20&language=en`;
    } else if (category) {
        url += `top-headlines?category=${category}&country=us&pageSize=20`;
    } else {
        url += 'top-headlines?country=us&pageSize=20';
    }
    
    const response = await fetch(url, {
        headers: { 'X-Api-Key': apiKey },
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NewsAPI error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    return (data.articles || [])
        .filter(a => a.title && a.url && !a.title.includes('[Removed]'))
        .map(art => ({
            title: art.title,
            url: art.url,
            source: art.source?.name || 'News',
            summary: art.description || '',
            publishedAt: art.publishedAt,
        }));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const results = { categories: 0, subtopics: 0, articles: 0, errors: [] };
        
        // Clear existing cache
        const existingCache = await base44.asServiceRole.entities.NewsCache.filter({});
        for (const cache of existingCache) {
            await base44.asServiceRole.entities.NewsCache.delete(cache.id);
        }
        
        // Fetch and cache main categories
        for (const cat of CATEGORIES) {
            try {
                const articles = await fetchNewsAPI(null, cat.apiCategory);
                
                if (articles.length > 0) {
                    await base44.asServiceRole.entities.NewsCache.create({
                        category: cat.id,
                        articles: articles,
                    });
                    results.categories++;
                    results.articles += articles.length;
                }
                
                await delay(1200); // Rate limit
            } catch (err) {
                results.errors.push(`Category ${cat.id}: ${err.message}`);
            }
        }
        
        // Fetch and cache all subtopics
        for (const cat of CATEGORIES) {
            for (const subtopic of cat.subtopics) {
                try {
                    const articles = await fetchNewsAPI(subtopic);
                    
                    if (articles.length > 0) {
                        await base44.asServiceRole.entities.NewsCache.create({
                            category: subtopic.toLowerCase(),
                            articles: articles,
                        });
                        results.subtopics++;
                        results.articles += articles.length;
                    }
                    
                    await delay(1200); // Rate limit
                } catch (err) {
                    results.errors.push(`Subtopic ${subtopic}: ${err.message}`);
                }
            }
        }
        
        return Response.json({
            success: true,
            message: `Cached ${results.categories} categories, ${results.subtopics} subtopics, ${results.articles} total articles`,
            results,
            errors: results.errors,
        });
        
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});