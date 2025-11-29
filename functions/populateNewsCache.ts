import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// RSS feeds - free, no rate limits
const RSS_FEEDS = {
    technology: [
        'https://feeds.bbci.co.uk/news/technology/rss.xml',
        'https://techcrunch.com/feed/',
        'https://www.wired.com/feed/rss',
    ],
    business: [
        'https://feeds.bbci.co.uk/news/business/rss.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
    ],
    science: [
        'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
    ],
    health: [
        'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
        'https://feeds.bbci.co.uk/news/health/rss.xml',
    ],
    politics: [
        'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
        'https://feeds.bbci.co.uk/news/politics/rss.xml',
    ],
    sports: [
        'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',
        'https://feeds.bbci.co.uk/sport/rss.xml',
    ],
    entertainment: [
        'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml',
        'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
    ],
    world: [
        'https://feeds.bbci.co.uk/news/world/rss.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
        'https://www.theguardian.com/world/rss',
    ],
};

// Google News RSS for subtopics
function getGoogleNewsRSS(query) {
    return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
}

async function parseRSS(xml, sourceName) {
    const articles = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    
    while ((match = itemRegex.exec(xml)) !== null && articles.length < 15) {
        const item = match[1];
        const title = extractTag(item, 'title');
        const link = extractTag(item, 'link') || extractTag(item, 'guid');
        const pubDate = extractTag(item, 'pubDate');
        const description = extractTag(item, 'description');
        
        if (title && link && !title.includes('[Removed]')) {
            articles.push({
                title: cleanText(title),
                url: link.trim(),
                source: sourceName,
                summary: cleanText(description || '').slice(0, 300),
                publishedAt: pubDate || new Date().toISOString(),
            });
        }
    }
    return articles;
}

function extractTag(xml, tag) {
    const cdataMatch = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i'));
    if (cdataMatch) return cdataMatch[1];
    const simpleMatch = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
    return simpleMatch ? simpleMatch[1] : null;
}

function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ').trim();
}

async function fetchRSSFeed(url) {
    const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' },
    });
    if (!response.ok) throw new Error(`RSS fetch failed: ${response.status}`);
    return await response.text();
}

function getSourceFromUrl(url) {
    try {
        const hostname = new URL(url).hostname.replace('www.', '');
        if (hostname.includes('bbc')) return 'BBC';
        if (hostname.includes('nytimes')) return 'NY Times';
        if (hostname.includes('techcrunch')) return 'TechCrunch';
        if (hostname.includes('wired')) return 'Wired';
        if (hostname.includes('guardian')) return 'The Guardian';
        if (hostname.includes('google')) return 'Google News';
        return hostname.split('.')[0];
    } catch { return 'News'; }
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