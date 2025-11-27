import React from 'react';
import { Link } from 'react-router-dom';
import { menuItems } from '@/components/NavigationConfig';

export default function Sidebar({ isOpen, activePage, onClose }) {
    // Only close on mobile when clicking overlay or a menu item
    const handleMobileClose = () => {
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}
            <aside className={`${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex-shrink-0 fixed md:relative z-50 md:z-auto h-[calc(100vh-72px)] md:h-auto`}>
                <nav className="p-4 space-y-2">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.href}
                            onClick={handleMobileClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                item.label === activePage
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                            }`}
                        >
                            <item.icon className="w-5 h-5 text-purple-600" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
}