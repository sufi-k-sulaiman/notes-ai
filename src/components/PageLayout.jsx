import React, { useState } from 'react';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Sidebar from './layout/Sidebar';

export default function PageLayout({ children, activePage }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header 
                title={activePage} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
            />
            
            <div className="flex flex-1">
                <Sidebar 
                    isOpen={sidebarOpen} 
                    activePage={activePage} 
                    onClose={() => setSidebarOpen(false)} 
                />
                
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
            
            <Footer />
        </div>
    );
}