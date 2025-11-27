import React from 'react';
import { Link } from 'react-router-dom';
import { LOGO_URL, footerLinks } from '@/components/NavigationConfig';

export default function Footer() {
    return (
        <footer className="py-6 bg-white border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <img src={LOGO_URL} alt="1cPublishing" className="h-8 w-8 object-contain grayscale" />
                    <nav className="flex flex-wrap justify-center gap-6 text-sm">
                        {footerLinks.map((link, i) => (
                            <Link key={i} to={link.href} className="text-gray-600 hover:text-purple-600 transition-colors">{link.label}</Link>
                        ))}
                    </nav>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                    © 2025 1cPublishing.com
                </div>
            </div>
        </footer>
    );
}