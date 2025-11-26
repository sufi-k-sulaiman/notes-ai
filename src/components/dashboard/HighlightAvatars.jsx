import React, { useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';

export default function HighlightAvatars({ 
    title = 'highlight update',
    users = [
        { name: 'Your Update', avatarUrl: '', isAdd: true },
        { name: 'Rossy', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face' },
        { name: 'Jonathan', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face' },
        { name: 'Patterson', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face' },
        { name: 'William', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face' }
    ],
    onUserClick = null,
    onSeeMore = null
}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <button 
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={onSeeMore}
                >
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2">
                {users.map((user, index) => {
                    const isHovered = hoveredIndex === index;
                    
                    return (
                        <div 
                            key={index}
                            className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                                isHovered ? 'scale-105' : ''
                            }`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => onUserClick?.(user, index)}
                        >
                            <div 
                                className="w-14 h-14 rounded-full flex items-center justify-center mb-2"
                                style={{ 
                                    background: user.isAdd ? '#E0E7FF' : `linear-gradient(135deg, #6B4EE6 0%, #50C8E8 100%)`,
                                    padding: user.isAdd ? 0 : '2px'
                                }}
                            >
                                {user.isAdd ? (
                                    <Plus className="w-6 h-6" style={{ color: '#6B4EE6' }} />
                                ) : (
                                    <img 
                                        src={user.avatarUrl} 
                                        alt={user.name} 
                                        className="w-full h-full rounded-full object-cover border-2 border-white"
                                    />
                                )}
                            </div>
                            <span className="text-xs text-gray-600 whitespace-nowrap">{user.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}