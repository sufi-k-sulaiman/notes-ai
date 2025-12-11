import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Pipette, X } from 'lucide-react';

export default function ColorPickerModal({ isOpen, onClose, onSelectColor, currentColor = '#000000' }) {
    const canvasRef = useRef(null);
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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const size = 280;
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 10;

        // Draw color wheel
        for (let angle = 0; angle < 360; angle += 1) {
            const startAngle = (angle - 90) * Math.PI / 180;
            const endAngle = (angle + 1 - 90) * Math.PI / 180;

            for (let r = 0; r < radius; r += 1) {
                const ratio = r / radius;
                const hue = angle;
                const saturation = ratio * 100;
                const lightness = 50 + (1 - ratio) * 50;

                ctx.beginPath();
                ctx.arc(centerX, centerY, r, startAngle, endAngle);
                ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }

        // Draw white center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }, []);

    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ctx = canvas.getContext('2d');
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
        setSelectedColor(hex);
    };

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
            <DialogContent className="max-w-md bg-white rounded-2xl p-6 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Color Picker</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex gap-6">
                    {/* Color Wheel */}
                    <div className="relative">
                        <canvas
                            ref={canvasRef}
                            width={280}
                            height={280}
                            onClick={handleCanvasClick}
                            className="cursor-crosshair rounded-full"
                        />
                        <button
                            onClick={handleEyeDropper}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 border border-gray-200"
                            title="Pick color from screen"
                        >
                            <Pipette className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>

                    {/* Right Panel */}
                    <div className="flex-1 flex flex-col gap-4">
                        {/* HEX Input */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-white border-2 border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700">
                                    HEX
                                </div>
                                <div className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-lg px-4 py-2 text-white font-mono font-bold">
                                    <Input
                                        value={hexValue}
                                        onChange={(e) => handleHexChange(e.target.value)}
                                        className="bg-transparent border-0 text-white placeholder:text-white/70 p-0 h-auto font-mono font-bold focus-visible:ring-0"
                                        maxLength={6}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Recent Colors */}
                        <div className="grid grid-cols-6 gap-2">
                            {recentColors.map((color, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedColor(color)}
                                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>

                        {/* RGB Sliders */}
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="bg-white border-2 border-gray-300 rounded-lg w-10 h-8 flex items-center justify-center text-sm font-bold text-gray-700">
                                        R
                                    </div>
                                    <div className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white font-bold text-center">
                                        {rgb.r}
                                    </div>
                                </div>
                                <Slider
                                    value={[rgb.r]}
                                    onValueChange={(val) => handleRgbChange('r', val)}
                                    max={255}
                                    step={1}
                                    className="[&_.relative]:bg-gradient-to-r [&_.relative]:from-black [&_.relative]:to-red-500"
                                />
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="bg-white border-2 border-gray-300 rounded-lg w-10 h-8 flex items-center justify-center text-sm font-bold text-gray-700">
                                        G
                                    </div>
                                    <div className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white font-bold text-center">
                                        {rgb.g}
                                    </div>
                                </div>
                                <Slider
                                    value={[rgb.g]}
                                    onValueChange={(val) => handleRgbChange('g', val)}
                                    max={255}
                                    step={1}
                                    className="[&_.relative]:bg-gradient-to-r [&_.relative]:from-black [&_.relative]:to-green-500"
                                />
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="bg-white border-2 border-gray-300 rounded-lg w-10 h-8 flex items-center justify-center text-sm font-bold text-gray-700">
                                        B
                                    </div>
                                    <div className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white font-bold text-center">
                                        {rgb.b}
                                    </div>
                                </div>
                                <Slider
                                    value={[rgb.b]}
                                    onValueChange={(val) => handleRgbChange('b', val)}
                                    max={255}
                                    step={1}
                                    className="[&_.relative]:bg-gradient-to-r [&_.relative]:from-black [&_.relative]:to-blue-500"
                                />
                            </div>
                        </div>

                        {/* Apply Button */}
                        <Button
                            onClick={handleApply}
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold"
                        >
                            Apply Color
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}