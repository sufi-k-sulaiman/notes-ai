import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Radio, Settings, Brain, FileText, BarChart3, GraduationCap } from "lucide-react";
import PageLayout from '../components/PageLayout';

const pages = [
    { 
        name: 'AI Hub', 
        href: createPageUrl('AIHub'), 
        icon: Sparkles, 
        description: 'Your all-in-one AI assistant powered by Qwirey',
        color: 'from-purple-600 to-indigo-600'
    },
    { 
        name: 'SearchPods', 
        href: createPageUrl('SearchPods'), 
        icon: Radio, 
        description: 'AI-generated podcasts on any topic with voice playback',
        color: 'from-blue-600 to-cyan-600'
    },
    { 
        name: 'MindMap', 
        href: createPageUrl('MindMap'), 
        icon: Brain, 
        description: 'AI-powered knowledge visualization and exploration',
        color: 'from-pink-600 to-rose-600'
    },
    { 
        name: 'Resume Builder', 
        href: createPageUrl('ResumeBuilder'), 
        icon: FileText, 
        description: 'AI-powered professional resume generator',
        color: 'from-green-600 to-emerald-600'
    },
    { 
        name: 'Markets', 
        href: createPageUrl('Markets'), 
        icon: BarChart3, 
        description: 'AI-powered stock market analysis and screening',
        color: 'from-orange-600 to-amber-600'
    },
    { 
        name: 'Learning', 
        href: createPageUrl('Learning'), 
        icon: GraduationCap, 
        description: 'Knowledge islands with country-specific learning priorities',
        color: 'from-emerald-600 to-teal-600'
    },
    { 
        name: 'Settings', 
        href: createPageUrl('Settings'), 
        icon: Settings, 
        description: 'Customize your experience with accessibility options',
        color: 'from-gray-600 to-slate-600'
    },
];

export default function Home() {
    return (
        <PageLayout activePage="" searchPlaceholder="Search anything..." showSearch={true}>
            <div className="p-4 md:p-8">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">Welcome to 1cPublishing</h1>
                    <p className="mb-6 md:mb-8 text-gray-600">Your AI-powered publishing platform. Choose where to go:</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {pages.map((page) => (
                            <Link key={page.name} to={page.href} className="group">
                                <div className={`bg-gradient-to-br ${page.color} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 text-white h-full`}>
                                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                                        <page.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="font-bold text-xl mb-2">{page.name}</h3>
                                    <p className="text-white/80 text-sm">{page.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}