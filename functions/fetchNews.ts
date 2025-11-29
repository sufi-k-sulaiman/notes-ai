import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// RSS Feed Sources
const RSS_SOURCES = {
    google: (query) => `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`,
    google_top: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
    bbc_world: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    bbc_tech: 'http://feeds.bbci.co.uk/news/technology/rss.xml',
    bbc_business: 'http://feeds.bbci.co.uk/news/business/rss.xml',
    bbc_science: 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    npr: 'https://feeds.npr.org/1001/rss.xml',
    reuters_world: 'https://www.rss.reuters.com/news/worldNews',
    cnn_top: 'http://rss.cnn.com/rss/edition.rss',
    nyt_world: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    guardian_world: 'https://www.theguardian.com/world/rss',
    techcrunch: 'https://techcrunch.com/feed/',
    wired: 'https://www.wired.com/feed/rss',
    ars: 'https://feeds.arstechnica.com/arstechnica/index',
};

// Category to RSS mapping
const CATEGORY_FEEDS = {
    technology: ['bbc_tech', 'techcrunch', 'wired', 'ars'],
    business: ['bbc_business'],
    science: ['bbc_science'],
    world: ['bbc_world', 'guardian_world', 'nyt_world'],
    general: ['google_top', 'npr', 'cnn_top'],
};

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
    // Skip URL resolution to avoid timeouts - just return the Google News URL
    // Users will be redirected when they click the link
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

// Fetch from RSS with timeout
async function fetchRSS(feedKey, query = null) {
    try {
        let url = RSS_SOURCES[feedKey];
        if (typeof url === 'function') {
            url = url(query || 'news');
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            },
            signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) return [];
        
        const xml = await response.text();
        return await parseRSS(xml, feedKey);
    } catch (error) {
        console.error(`RSS fetch failed for ${feedKey}:`, error.message);
        return [];
    }
}

// Fetch from NewsAPI
async function fetchNewsAPI(query, category = null) {
    const apiKey = Deno.env.get('NEWSAPI_KEY');
    if (!apiKey) return [];
    
    try {
        let url = 'https://newsapi.org/v2/';
        
        if (query) {
            url += `everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=20`;
        } else if (category) {
            url += `top-headlines?category=${category}&country=us&pageSize=20`;
        } else {
            url += 'top-headlines?country=us&pageSize=20';
        }
        
        const response = await fetch(url, {
            headers: { 'X-Api-Key': apiKey },
        });
        
        if (!response.ok) return [];
        
        const data = await response.json();
        
        return (data.articles || []).map(art => ({
            title: art.title || 'No title',
            url: art.url,
            source: art.source?.name || 'NewsAPI',
            summary: art.description || '',
            time: formatTime(art.publishedAt),
            imagePrompt: generateImagePrompt(art.title || ''),
            imageUrl: art.urlToImage, // NewsAPI sometimes has images
        }));
    } catch (error) {
        console.error('NewsAPI fetch failed:', error.message);
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

        let body = {};
        try {
            body = await req.json();
        } catch (e) {
            // Empty body is fine
        }
        const { query, category, limit = 30, scraperUrl } = body;
        
        const allArticles = [];
        const fetchPromises = [];
        
        // 1. RSS Feeds - always fetch these (free & reliable)
        if (query) {
            // Search query: use Google News RSS search
            fetchPromises.push(fetchRSS('google', query));
        } else if (category && CATEGORY_FEEDS[category]) {
            // Category-specific feeds
            for (const feedKey of CATEGORY_FEEDS[category]) {
                fetchPromises.push(fetchRSS(feedKey));
            }
        } else {
            // General: fetch from multiple sources
            fetchPromises.push(fetchRSS('google_top'));
            fetchPromises.push(fetchRSS('bbc_world'));
            fetchPromises.push(fetchRSS('npr'));
        }
        
        // 2. NewsAPI (if key exists)
        fetchPromises.push(fetchNewsAPI(query, category));
        
        // 3. External Scraper (if URL provided)
        if (scraperUrl) {
            fetchPromises.push(fetchExternalScraper(query, scraperUrl));
        }
        
        // Fetch all in parallel
        const results = await Promise.all(fetchPromises);
        
        for (const articles of results) {
            allArticles.push(...articles);
        }
        
        // Deduplicate and limit
        const uniqueArticles = deduplicateArticles(allArticles).slice(0, limit);
        
        return Response.json({
            success: true,
            count: uniqueArticles.length,
            query: query || null,
            category: category || null,
            articles: uniqueArticles,
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