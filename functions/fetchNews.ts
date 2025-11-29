import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Google News RSS - free, no rate limits
function getGoogleNewsURL(query) {
    return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
}

function getGoogleNewsCategoryURL(category) {
    const categoryMap = {
        technology: 'technology',
        business: 'business',
        science: 'science',
        health: 'health',
        sports: 'sports',
        entertainment: 'entertainment',
        world: 'world',
        politics: 'politics',
    };
    const topic = categoryMap[category] || category;
    return `https://news.google.com/rss/search?q=${encodeURIComponent(topic + ' news')}&hl=en-US&gl=US&ceid=US:en`;
}

// Parse RSS XML
async function parseRSS(xml, source) {
    const articles = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    const items = [];
    
    while ((match = itemRegex.exec(xml)) !== null) {
        items.push(match[1]);
    }
    
    // Process items and resolve Google News URLs in parallel
    const promises = items.slice(0, 30).map(async (item) => {
        const title = extractTag(item, 'title');
        let link = extractTag(item, 'link') || extractGoogleLink(item);
        const pubDate = extractTag(item, 'pubDate');
        const description = extractTag(item, 'description');
        
        if (title && link) {
            // Resolve Google News redirect URLs to actual article URLs
            const resolvedUrl = await resolveGoogleNewsUrl(cleanUrl(link));
            const cleanedTitle = cleanText(title);
            let cleanedSummary = cleanText(description || '');
            
            // If summary is empty or too short, generate one from title
            if (!cleanedSummary || cleanedSummary.length < 20) {
                cleanedSummary = generateSummaryFromTitle(cleanedTitle);
            }
            
            return {
                title: cleanedTitle,
                url: resolvedUrl,
                source: extractSourceFromUrl(resolvedUrl) || source,
                summary: cleanedSummary.slice(0, 300),
                time: formatTime(pubDate),
                imagePrompt: generateImagePrompt(title),
            };
        }
        return null;
    });
    
    const results = await Promise.all(promises);
    return results.filter(Boolean);
}

function extractTag(xml, tag) {
    const cdataMatch = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i'));
    if (cdataMatch) return cdataMatch[1];
    
    const simpleMatch = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
    return simpleMatch ? simpleMatch[1] : null;
}

function extractGoogleLink(item) {
    // Google News wraps links in CDATA or uses guid
    const guidMatch = item.match(/<guid[^>]*>([^<]+)<\/guid>/i);
    if (guidMatch && guidMatch[1].startsWith('http')) return guidMatch[1];
    
    const linkMatch = item.match(/<link>([^<]+)<\/link>/i);
    return linkMatch ? linkMatch[1] : null;
}

function cleanText(text) {
    if (!text) return '';
    return text
        // Remove all HTML tags including anchor tags with href
        .replace(/<a[^>]*>.*?<\/a>/gi, '')
        .replace(/<[^>]*>/g, '')
        // Decode HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        // Remove any remaining URLs
        .replace(/https?:\/\/[^\s]+/g, '')
        // Clean up whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

function generateSummaryFromTitle(title) {
    // Generate a brief description based on the title when RSS description is empty/poor
    const cleanTitle = cleanText(title);
    return `Read the full story about: ${cleanTitle}`;
}

async function resolveGoogleNewsUrl(url) {
    // Google News URLs are redirects - follow them to get real URL
    if (url.includes('news.google.com')) {
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                redirect: 'follow',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });
            return response.url || url;
        } catch {
            return url;
        }
    }
    return url;
}

function cleanUrl(url) {
    return url.trim();
}

function extractSourceFromUrl(url) {
    try {
        const hostname = new URL(url).hostname.replace('www.', '');
        const sources = {
            'bbc.com': 'BBC', 'bbc.co.uk': 'BBC',
            'cnn.com': 'CNN',
            'reuters.com': 'Reuters',
            'nytimes.com': 'NY Times',
            'theguardian.com': 'The Guardian',
            'npr.org': 'NPR',
            'techcrunch.com': 'TechCrunch',
            'wired.com': 'Wired',
            'arstechnica.com': 'Ars Technica',
            'news.google.com': 'Google News',
        };
        for (const [domain, name] of Object.entries(sources)) {
            if (hostname.includes(domain)) return name;
        }
        return hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
    } catch {
        return 'News';
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

function generateImagePrompt(title) {
    // Generate a lifestyle/professional image prompt based on title keywords
    const keywords = title.toLowerCase();
    if (keywords.includes('tech') || keywords.includes('ai') || keywords.includes('robot')) {
        return 'Modern technology office, clean workspace, soft lighting, minimalist';
    }
    if (keywords.includes('climate') || keywords.includes('environment')) {
        return 'Nature landscape, green forests, blue sky, environmental photography';
    }
    if (keywords.includes('business') || keywords.includes('economy') || keywords.includes('market')) {
        return 'Modern business district, city skyline, professional atmosphere';
    }
    if (keywords.includes('health') || keywords.includes('medical')) {
        return 'Healthcare setting, clean medical environment, wellness concept';
    }
    if (keywords.includes('space') || keywords.includes('nasa')) {
        return 'Space exploration, stars, cosmic imagery, astronomy';
    }
    return 'Professional news photography, neutral tones, journalistic style';
}

// Fetch from RSS
async function fetchRSS(feedKey, query = null) {
    try {
        let url = RSS_SOURCES[feedKey];
        if (typeof url === 'function') {
            url = url(query || 'news');
        }
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            },
        });
        
        if (!response.ok) return [];
        
        const xml = await response.text();
        return await parseRSS(xml, feedKey);
    } catch (error) {
        console.error(`RSS fetch failed for ${feedKey}:`, error.message);
        return [];
    }
}

// Fetch from Google News RSS (free, no rate limits)
async function fetchGoogleNewsRSS(query) {
    try {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' },
        });
        
        if (!response.ok) return [];
        
        const xml = await response.text();
        return await parseRSS(xml, 'google');
    } catch (error) {
        console.error('Google News RSS fetch failed:', error.message);
        return [];
    }
}

// Fetch from external scraper (if configured)
async function fetchExternalScraper(query, scraperUrl) {
    if (!scraperUrl) return [];
    
    try {
        const response = await fetch(scraperUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, count: 20 }),
        });
        
        if (!response.ok) return [];
        
        const data = await response.json();
        return data.articles || [];
    } catch (error) {
        console.error('External scraper failed:', error.message);
        return [];
    }
}

// Deduplicate articles by URL and title similarity
function deduplicateArticles(articles) {
    const seen = new Set();
    const unique = [];
    
    for (const art of articles) {
        const key = art.url || art.title.toLowerCase().slice(0, 50);
        if (!seen.has(key) && art.title && art.url) {
            seen.add(key);
            unique.push(art);
        }
    }
    
    return unique;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query, category, limit = 30 } = await req.json();
        
        // Always serve from database cache
        const cacheKey = query?.toLowerCase() || category || 'technology';
        const cached = await base44.entities.NewsCache.filter({ category: cacheKey });
        
        if (cached.length > 0 && cached[0].articles?.length > 0) {
            const articles = cached[0].articles.map(art => ({
                ...art,
                time: formatTimeFromDate(art.publishedAt),
            }));
            
            return Response.json({
                success: true,
                count: articles.length,
                query: query || null,
                category: category || null,
                articles: articles.slice(0, limit),
            });
        }
        
        // If no cache found, fetch live from Google News RSS
        if (query) {
            const liveArticles = await fetchGoogleNewsRSS(query);
            return Response.json({
                success: true,
                count: liveArticles.length,
                query: query,
                category: category || null,
                articles: liveArticles.slice(0, limit),
            });
        }

        return Response.json({
            success: true,
            count: 0,
            query: query || null,
            category: category || null,
            articles: [],
            message: 'No cached data available. Try searching for a topic.',
        });
        
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function formatTimeFromDate(dateStr) {
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