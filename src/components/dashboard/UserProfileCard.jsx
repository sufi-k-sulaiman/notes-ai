import React, { useState } from 'react';
import { Mail, Phone, MapPin, Star, MoreVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function UserProfileCard({ 
    name = 'Adam Suley',
    email = 'adamsu@email.com',
    phone = '+01 234 567 000',
    address = 'Main Street, North Park 123, 127 Orchid Building.',
    rating = 4,
    avatarUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    onFollow = null,
    onMessage = null
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 ${
                isHovered ? 'shadow-lg' : ''
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-gray-500">user profile</h3>
                <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
                <img src={avatarUrl} alt={name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                    <h4 className="font-bold text-gray-800">{name}</h4>
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" style={{ color: '#6B4EE6' }} />
                    {email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" style={{ color: '#6B4EE6' }} />
                    {phone}
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#6B4EE6' }} />
                    {address}
                </div>
            </div>
            
            <div className="space-y-2">
                <Button 
                    className="w-full text-white"
                    style={{ backgroundColor: '#6B4EE6' }}
                    onClick={onFollow}
                >
                    follow
                </Button>
                <Button 
                    variant="outline"
                    className="w-full"
                    style={{ borderColor: '#6B4EE6', color: '#6B4EE6' }}
                    onClick={onMessage}
                >
                    message
                </Button>
            </div>
        </div>
    );
}