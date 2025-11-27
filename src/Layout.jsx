import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Toaster } from 'sonner';

const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/a1a505225_1cPublishing-logo.png';

export default function Layout({ children, currentPageName }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="bottom-right" />
            
            {/* Simple Header */}
            <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4">
                <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                    <img src={LOGO_URL} alt="Logo" className="h-8 w-8" />
                    <span className="font-bold text-gray-900">1cPublishing</span>
                </Link>
            </header>
            
            {/* Main Content */}
            <main>
                {children}
            </main>
        </div>
    );
}