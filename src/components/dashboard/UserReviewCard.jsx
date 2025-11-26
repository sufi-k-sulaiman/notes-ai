import React, { useState } from 'react';
import { Star, MoreVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function UserReviewCard({ 
    name = 'Adam Suley',
    rating = 4,
    date = '7 August 2021 / 15:24',
    title = 'Satisfied',
    review = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
    avatarUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    onHelpful = null,
    onNotHelpful = null
}) {
    const [isHovered, setIsHovered] = useState(false);
    const [helpfulClicked, setHelpfulClicked] = useState(null);

    const handleHelpful = () => {
        setHelpfulClicked('yes');
        onHelpful?.();
    };

    const handleNotHelpful = () => {
        setHelpfulClicked('no');
        onNotHelpful?.();
    };

    return (
        <div 
            className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 ${
                isHovered ? 'shadow-lg' : ''
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-gray-500">user review</h3>
                <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
                <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                    <h4 className="font-bold text-gray-800">{name}</h4>
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
            
            <p className="text-xs text-gray-400 mb-2">{date}</p>
            <h5 className="font-semibold text-gray-800 mb-2">{title}</h5>
            <p className="text-sm text-gray-600 mb-4">{review}</p>
            
            <p className="text-xs text-gray-500 mb-2">was this review helpful?</p>
            <div className="flex gap-2">
                <Button 
                    size="sm"
                    className={`text-white ${helpfulClicked === 'yes' ? 'opacity-100' : 'opacity-80'}`}
                    style={{ backgroundColor: '#6B4EE6' }}
                    onClick={handleHelpful}
                >
                    yes, helpful
                </Button>
                <Button 
                    size="sm"
                    variant="outline"
                    className={helpfulClicked === 'no' ? 'opacity-100' : 'opacity-60'}
                    onClick={handleNotHelpful}
                >
                    no, didn't help
                </Button>
            </div>
        </div>
    );
}