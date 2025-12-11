import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Pipette, X } from 'lucide-react';

// Hexagonal color palette similar to w3schools
const COLOR_PALETTE = [
    // Row 1 - Dark blues/purples
    ['#1a2639', '#2c3e50', '#34495e', '#2980b9', '#3498db', '#5dade2', '#85c1e9'],
    // Row 2 - Blues/cyans
    ['#154360', '#1f618d', '#2874a6', '#3498db', '#5dade2', '#85c1e9', '#aed6f1'],
    // Row 3 - Teals/greens
    ['#0b5345', '#117a65', '#16a085', '#1abc9c', '#48c9b0', '#76d7c4', '#a2d9ce'],
    // Row 4 - Greens
    ['#145a32', '#1e8449', '#229954', '#27ae60', '#52be80', '#7dcea0', '#a9dfbf'],
    // Row 5 - Yellows/greens
    ['#7d6608', '#9a7d0a', '#b7950b', '#d4ac0d', '#f1c40f', '#f4d03f', '#f7dc6f'],
    // Row 6 - Oranges
    ['#784212', '#935116', '#af601a', '#ca6f1e', '#e67e22', '#eb984e', '#f0b27a'],
    // Row 7 - Reds/pinks
    ['#641e16', '#7b241c', '#922b21', '#a93226', '#c0392b', '#cd6155', '#d98880'],
    // Row 8 - Purples/magentas
    ['#4a235a', '#5b2c6f', '#6c3483', '#7d3c98', '#8e44ad', '#a569bd', '#bb8fce'],
    // Row 9 - Grays
    ['#212121', '#424242', '#616161', '#757575', '#9e9e9e', '#bdbdbd', '#e0e0e0'],
];

export default function ColorPickerModal({ isOpen, onClose, onSelectColor, currentColor = '#000000' }) {
    const [selectedColor, setSelectedColor] = useState(currentColor);
    const [hexValue, setHexValue] = useState(currentColor.replace('#', '').toUpperCase());
    const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
    const [recentColors, setRecentColors] = useState([
        '#FF9900', '#C21E56',
        '#00AEEF', '#1B5E20',
        '#7CB9E8', '#0047AB'
    ]);

    useEffect(() => {
        const color = selectedColor.replace('#', '');
        const r = parseInt(color.substring(0, 2), 16) || 0;
        const g = parseInt(color.substring(2, 4), 16) || 0;
        const b = parseInt(color.substring(4, 6), 16) || 0;
        setRgb({ r, g, b });
        setHexValue(color.toUpperCase());
    }, [selectedColor]);



    const handleRgbChange = (channel, value) => {
        const newRgb = { ...rgb, [channel]: value[0] };
        setRgb(newRgb);
        const hex = `#${((1 << 24) + (newRgb.r << 16) + (newRgb.g << 8) + newRgb.b).toString(16).slice(1).toUpperCase()}`;
        setSelectedColor(hex);
    };

    const handleHexChange = (value) => {
        const cleaned = value.replace(/[^0-9A-Fa-f]/g, '').substring(0, 6).toUpperCase();
        setHexValue(cleaned);
        if (cleaned.length === 6) {
            setSelectedColor(`#${cleaned}`);
        }
    };

    const handleApply = () => {
        onSelectColor(selectedColor);
        if (!recentColors.includes(selectedColor)) {
            setRecentColors(prev => [selectedColor, ...prev.slice(0, 5)]);
        }
        onClose();
    };

    const handleEyeDropper = async () => {
        if ('EyeDropper' in window) {
            try {
                const eyeDropper = new window.EyeDropper();
                const result = await eyeDropper.open();
                setSelectedColor(result.sRGBHex.toUpperCase());
            } catch (e) {
                console.log('EyeDropper cancelled or not supported');
            }
        } else {
            alert('EyeDropper API is not supported in this browser');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-full w-full h-full max-h-full md:max-w-4xl md:h-auto md:max-h-[90vh] bg-white md:rounded-2xl rounded-none p-4 md:p-8 border-gray-200 overflow-y-auto" hideClose>
                <div className="flex items-start justify-between mb-4 md:mb-6 sticky top-0 bg-white z-10 pb-4">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">Color Picker</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 md:h-8 md:w-8">
                        <X className="w-6 h-6 md:w-5 md:h-5" />
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start pb-4">
                    {/* Hexagonal Color Picker */}
                    <div className="relative flex-shrink-0">
                        <div className="bg-gray-50 rounded-2xl p-4 md:p-6 shadow-inner">
                            <div className="space-y-1">
                                {COLOR_PALETTE.map((row, rowIndex) => (
                                    <div key={rowIndex} className="flex justify-center gap-1" style={{ marginLeft: rowIndex % 2 === 1 ? '20px' : '0' }}>
                                        {row.map((color, colIndex) => (
                                            <button
                                                key={`${rowIndex}-${colIndex}`}
                                                onClick={() => setSelectedColor(color)}
                                                className="hexagon-button relative group"
                                                style={{ 
                                                    width: '32px',
                                                    height: '32px',
                                                    backgroundColor: color,
                                                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                                                    transition: 'all 0.2s'
                                                }}
                                                title={color}
                                            >
                                                {selectedColor === color && (
                                                    <div className="absolute inset-0 border-2 border-white shadow-lg" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleEyeDropper}
                            className="absolute top-2 right-2 bg-white rounded-full p-2 md:p-3 shadow-xl hover:bg-gray-50 border border-gray-200 touch-manipulation"
                            title="Pick color from screen"
                        >
                            <Pipette className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                        </button>
                    </div>

                    {/* Controls Panel */}
                    <div className="w-full md:flex-1 flex flex-col gap-4 md:gap-6">
                        {/* HEX Input */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="bg-white border-2 border-gray-300 rounded-xl px-3 py-2 md:px-5 md:py-3 text-base md:text-lg font-bold text-gray-700">
                                HEX
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-xl md:rounded-2xl px-4 py-2 md:px-6 md:py-3 text-white">
                                <Input
                                    value={hexValue}
                                    onChange={(e) => handleHexChange(e.target.value)}
                                    className="bg-transparent border-0 text-white text-lg md:text-xl placeholder:text-white/70 p-0 h-auto font-mono font-bold focus-visible:ring-0"
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        {/* Recent Colors */}
                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                            {recentColors.map((color, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedColor(color)}
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-gray-300 active:scale-95 md:hover:scale-110 transition-transform shadow-lg touch-manipulation"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>

                        {/* RGB Sliders */}
                        <div className="space-y-3 md:space-y-4">
                            {/* R Slider */}
                            <div>
                                <div className="flex items-center gap-2 md:gap-3 mb-2">
                                    <div className="bg-white border-2 border-gray-300 rounded-xl w-12 h-10 md:w-14 md:h-12 flex items-center justify-center text-lg md:text-xl font-bold text-gray-700">
                                        R
                                    </div>
                                    <div className="flex-1 bg-gray-800 rounded-xl md:rounded-2xl px-4 py-2 md:px-6 md:py-3 text-white font-bold text-lg md:text-xl text-center">
                                        {rgb.r}
                                    </div>
                                </div>
                                <Slider
                                    value={[rgb.r]}
                                    onValueChange={(val) => handleRgbChange('r', val)}
                                    max={255}
                                    step={1}
                                    className="[&_.relative]:h-3 [&_.relative]:bg-gradient-to-r [&_.relative]:from-black [&_.relative]:to-red-500 [&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg touch-manipulation"
                                />
                            </div>

                            {/* G Slider */}
                            <div>
                                <div className="flex items-center gap-2 md:gap-3 mb-2">
                                    <div className="bg-white border-2 border-gray-300 rounded-xl w-12 h-10 md:w-14 md:h-12 flex items-center justify-center text-lg md:text-xl font-bold text-gray-700">
                                        G
                                    </div>
                                    <div className="flex-1 bg-gray-800 rounded-xl md:rounded-2xl px-4 py-2 md:px-6 md:py-3 text-white font-bold text-lg md:text-xl text-center">
                                        {rgb.g}
                                    </div>
                                </div>
                                <Slider
                                    value={[rgb.g]}
                                    onValueChange={(val) => handleRgbChange('g', val)}
                                    max={255}
                                    step={1}
                                    className="[&_.relative]:h-3 [&_.relative]:bg-gradient-to-r [&_.relative]:from-black [&_.relative]:to-green-500 [&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg touch-manipulation"
                                />
                            </div>

                            {/* B Slider */}
                            <div>
                                <div className="flex items-center gap-2 md:gap-3 mb-2">
                                    <div className="bg-white border-2 border-gray-300 rounded-xl w-12 h-10 md:w-14 md:h-12 flex items-center justify-center text-lg md:text-xl font-bold text-gray-700">
                                        B
                                    </div>
                                    <div className="flex-1 bg-gray-800 rounded-xl md:rounded-2xl px-4 py-2 md:px-6 md:py-3 text-white font-bold text-lg md:text-xl text-center">
                                        {rgb.b}
                                    </div>
                                </div>
                                <Slider
                                    value={[rgb.b]}
                                    onValueChange={(val) => handleRgbChange('b', val)}
                                    max={255}
                                    step={1}
                                    className="[&_.relative]:h-3 [&_.relative]:bg-gradient-to-r [&_.relative]:from-black [&_.relative]:to-blue-500 [&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg touch-manipulation"
                                />
                            </div>
                        </div>

                        {/* Apply Button */}
                        <Button
                            onClick={handleApply}
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 active:scale-95 text-white font-bold text-base md:text-lg py-5 md:py-6 rounded-xl md:rounded-2xl touch-manipulation"
                        >
                            Apply Color
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}