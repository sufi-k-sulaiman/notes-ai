import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Radio, Settings, Brain, FileText, BarChart3, GraduationCap, ListTodo, Lightbulb, StickyNote, Newspaper, Gamepad2, Globe } from "lucide-react";

const pages = [
    { name: 'Geospatial', page: 'Geospatial', icon: Globe, description: 'Global data intelligence across 18 domains', color: 'from-indigo-600 to-purple-600' },
    { name: 'Qwirey', page: 'Qwirey', icon: Sparkles, description: 'Your all-in-one Ai assistant, powered by Qwirey', color: 'from-purple-600 to-indigo-600' },
    { name: 'SearchPods', page: 'SearchPods', icon: Radio, description: 'Ai-generated podcasts on any topic with voice playback', color: 'from-blue-600 to-cyan-600' },
    { name: 'MindMap', page: 'MindMap', icon: Brain, description: 'Ai-powered knowledge visualization and exploration', color: 'from-pink-600 to-rose-600' },
    { name: 'Intelligence', page: 'Intelligence', icon: Lightbulb, description: 'AI predictive analytics and scenario modeling', color: 'from-indigo-600 to-purple-600' },
    { name: 'Resume Builder', page: 'ResumeBuilder', icon: FileText, description: 'AI-powered professional resume generator', color: 'from-green-600 to-emerald-600' },
    { name: 'Markets', page: 'Markets', icon: BarChart3, description: 'Ai-powered stock market analysis and screening', color: 'from-orange-600 to-amber-600' },
    { name: 'Learning', page: 'Learning', icon: GraduationCap, description: 'Navigate knowledge islands with progress tracking', color: 'from-emerald-600 to-teal-600' },
    { name: 'Tasks', page: 'Tasks', icon: ListTodo, description: 'Track initiatives across all departments', color: 'from-violet-600 to-purple-600' },
    { name: 'Notes', page: 'Notes', icon: StickyNote, description: 'Rich text notes with Ai assistance', color: 'from-pink-600 to-rose-600' },
    { name: 'News', page: 'News', icon: Newspaper, description: 'AI-powered news aggregator across topics', color: 'from-red-600 to-orange-600' },
    { name: 'Games', page: 'Games', icon: Gamepad2, description: 'Learn while you play with Word Shooter', color: 'from-purple-600 to-pink-600' },
    { name: 'Settings', page: 'Settings', icon: Settings, description: 'Customize your experience with accessibility options', color: 'from-gray-600 to-slate-600' },
];

export default function HomePage() {
    return (
        <div className="p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">Welcome</h1>
                <p className="mb-6 md:mb-8 text-gray-600">Ai Powered Platform to boost productivity and make you smarter.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {pages.map((page) => (
                        <Link key={page.name} to={createPageUrl(page.page)} className="group">
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
    );
}