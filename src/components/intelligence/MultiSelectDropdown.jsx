import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export default function MultiSelectDropdown({ 
    options = [], 
    selected = [], 
    onChange, 
    placeholder = 'Select...',
    icon: Icon,
    maxDisplay = 2
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option) => {
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const clearAll = (e) => {
        e.stopPropagation();
        onChange([]);
    };

    const displayText = selected.length === 0 
        ? placeholder 
        : selected.length <= maxDisplay 
            ? selected.join(', ')
            : `${selected.slice(0, maxDisplay).join(', ')} +${selected.length - maxDisplay}`;

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-400 transition-all min-w-[200px] justify-between"
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {Icon && <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />}
                    <span className="text-gray-900 font-medium truncate">{displayText}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {selected.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="p-0.5 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                    <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto z-50">
                    {options.map((option) => (
                        <div
                            key={option}
                            onClick={() => toggleOption(option)}
                            className="flex items-center gap-2 px-4 py-2.5 hover:bg-purple-50 cursor-pointer transition-colors"
                        >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                selected.includes(option)
                                    ? 'bg-purple-600 border-purple-600'
                                    : 'border-gray-300'
                            }`}>
                                {selected.includes(option) && (
                                    <Check className="w-4 h-4 text-white" />
                                )}
                            </div>
                            <span className="text-gray-900">{option}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}