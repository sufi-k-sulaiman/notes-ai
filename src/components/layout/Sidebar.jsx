import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menuItems } from '../NavigationConfig';

export default function Sidebar({ isOpen, activePage, onClose }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const checkTheme = () => setTheme(localStorage.getItem('theme') || 'light');
        checkTheme();
        const interval = setInterval(checkTheme, 100);
        return () => clearInterval(interval);
    }, []);

    const isDark = theme === 'dark';

    const handleMobileClose = () => {
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}
            <aside className={`${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'} transition-all duration-300 overflow-hidden border-r flex-shrink-0 fixed md:relative z-50 md:z-auto h-[calc(100vh-72px)] md:h-auto ${isDark ? 'bg-[#1a1a2e] border-gray-700' : 'bg-white border-gray-200'}`}>
                <nav className="p-4 space-y-2">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.href}
                            onClick={handleMobileClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                item.label === activePage
                                    ? isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'
                                    : isDark ? 'text-gray-300 hover:bg-blue-900/30 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
}