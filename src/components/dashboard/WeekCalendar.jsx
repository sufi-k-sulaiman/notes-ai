import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function WeekCalendar({ 
    title = 'schedule',
    month = 'July 2021',
    days = [
        { day: 'Mon', date: 5 },
        { day: 'Tue', date: 6 },
        { day: 'Wed', date: 7, isSelected: true },
        { day: 'Thu', date: 8 },
        { day: 'Fri', date: 9 },
        { day: 'Sat', date: 10 },
        { day: 'Sun', date: 11, hasEvent: true }
    ],
    onDayClick = null,
    onPrevWeek = null,
    onNextWeek = null
}) {
    const [selectedDate, setSelectedDate] = useState(days.findIndex(d => d.isSelected));

    const handleDayClick = (day, index) => {
        setSelectedDate(index);
        onDayClick?.(day, index);
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <span className="text-sm font-medium text-gray-800">{month}</span>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={onPrevWeek}
                >
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
                
                <div className="flex-1 flex justify-between">
                    {days.map((day, index) => {
                        const isSelected = selectedDate === index;
                        
                        return (
                            <button
                                key={index}
                                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                    isSelected 
                                        ? 'text-white' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                style={{ backgroundColor: isSelected ? '#6B4EE6' : 'transparent' }}
                                onClick={() => handleDayClick(day, index)}
                            >
                                <span className="text-xs">{day.day}</span>
                                <span className="text-lg font-bold">{day.date}</span>
                                {day.hasEvent && !isSelected && (
                                    <Calendar className="w-3 h-3 text-gray-400 mt-1" />
                                )}
                            </button>
                        );
                    })}
                </div>
                
                <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={onNextWeek}
                >
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
            </div>
        </div>
    );
}