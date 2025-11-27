import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from 'lucide-react';

const BASE_URL = 'https://1cpublishing.base44.app';

const pages = [
    { name: 'Qwirey', priority: '1.0' },
    { name: 'MindMap', priority: '0.9' },
    { name: 'SearchPods', priority: '0.8' },
    { name: 'Markets', priority: '0.8' },
    { name: 'News', priority: '0.8' },
    { name: 'Learning', priority: '0.8' },
    { name: 'Geospatial', priority: '0.8' },
    { name: 'Intelligence', priority: '0.8' },
    { name: 'ResumeBuilder', priority: '0.7' },
    { name: 'Tasks', priority: '0.7' },
    { name: 'Notes', priority: '0.7' },
    { name: 'Games', priority: '0.6' },
    { name: 'Settings', priority: '0.5' },
    { name: 'TermsOfUse', priority: '0.4' },
    { name: 'ContactUs', priority: '0.5' },
];

export default function SiteMapXml() {
    const [copied, setCopied] = React.useState(false);

    useEffect(() => {
        document.title = 'Site Map - 1cPublishing';
        
        // Hide header, sidebar, footer
        const header = document.querySelector('header');
        const sidebar = document.querySelector('aside');
        const footer = document.querySelector('footer');
        const nav = document.querySelector('nav');
        
        if (header) header.style.display = 'none';
        if (sidebar) sidebar.style.display = 'none';
        if (footer) footer.style.display = 'none';
        if (nav) nav.style.display = 'none';
        
        return () => {
            if (header) header.style.display = '';
            if (sidebar) sidebar.style.display = '';
            if (footer) footer.style.display = '';
            if (nav) nav.style.display = '';
        };
    }, []);

    const today = new Date().toISOString().split('T')[0];

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${BASE_URL}/${page.name}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    const handleDownload = () => {
        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(xmlContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-lg font-semibold text-gray-300">sitemap.xml</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied' : 'Copy'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
                            <Download className="w-4 h-4" />
                            Download
                        </Button>
                    </div>
                </div>
                <pre className="bg-gray-950 rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                    <code className="text-green-400">{xmlContent}</code>
                </pre>
            </div>
        </div>
    );
}