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
        const size = 350;
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 10;

        // Draw color wheel
        for (let angle = 0; angle < 360; angle += 0.5) {
            const startAngle = (angle - 90) * Math.PI / 180;
            const endAngle = (angle + 0.5 - 90) * Math.PI / 180;

            for (let r = 0; r < radius; r += 1) {
                const ratio = r / radius;
                const hue = angle;
                const saturation = ratio * 100;
                const lightness = 50 + (1 - ratio) * 50;

                ctx.beginPath();
                ctx.arc(centerX, centerY, r, startAngle, endAngle);
                ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        // Draw white center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
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
            <DialogContent className="max-w-4xl bg-white rounded-2xl p-8 border-gray-200">
                <div className="flex items-start justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Color Picker</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex gap-8 items-start">
                    {/* Color Wheel - Left Side */}
                    <div className="relative flex-shrink-0">
                        <canvas
                            ref={canvasRef}
                            width={350}
                            height={350}
                            onClick={handleCanvasClick}
                            className="cursor-crosshair rounded-full"
                        />
                        <button
                            onClick={handleEyeDropper}
                            className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-xl hover:bg-gray-50 border border-gray-200"
                            title="Pick color from screen"
                        >
                            <Pipette className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>

                    {/* Right Panel */}
                    <div className="flex-1 flex flex-col gap-6">
                        {/* HEX Input */}
                        <div className="flex items-center gap-3">
                            <div className="bg-white border-2 border-gray-300 rounded-xl px-5 py-3 text-lg font-bold text-gray-700">
                                HEX
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-2xl px-6 py-3 text-white">
                                <Input
                                    value={hexValue}
                                    onChange={(e) => handleHexChange(e.target.value)}
                                    className="bg-transparent border-0 text-white text-xl placeholder:text-white/70 p-0 h-auto font-mono font-bold focus-visible:ring-0"
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        {/* Recent Colors - 3x2 Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            {recentColors.map((color, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedColor(color)}
                                    className="w-16 h-16 rounded-full border-4 border-gray-300 hover:scale-110 transition-transform shadow-lg"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>

                        {/* RGB Sliders */}
                        <div className="space-y-4">
                            {/* R Slider */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-white border-2 border-gray-300 rounded-xl w-14 h-12 flex items-center justify-center text-xl font-bold text-gray-700">
                                        R
                                    </div>
                                    <div className="flex-1 bg-gray-800 rounded-2xl px-6 py-3 text-white font-bold text-xl text-center">
                                        {rgb.r}
                                    </div>
                                </div>
                                <Slider
                                    value={[rgb.r]}
                                    onValueChange={(val) => handleRgbChange('r', val)}
                                    max={255}
                                    step={1}
                                    className="[&_.relative]:h-2 [&_.relative]:bg-gradient-to-r [&_.relative]:from-black [&_.relative]:to-red-500 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg"
                                />
                            </div>

                            {/* G Slider */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-white border-2 border-gray-300 rounded-xl w-14 h-12 flex items-center justify-center text-xl font-bold text-gray-700">
                                        G
                                    </div>
                                    <div className="flex-1 bg-gray-800 rounded-2xl px-6 py-3 text-white font-bold text-xl text-center">
                                        {rgb.g}
                                    </div>
                                </div>
                                <Slider
                                    value={[rgb.g]}
                                    onValueChange={(val) => handleRgbChange('g', val)}
                                    max={255}
                                    step={1}
                                    className="[&_.relative]:h-2 [&_.relative]:bg-gradient-to-r [&_.relative]:from-black [&_.relative]:to-green-500 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg"
                                />
                            </div>

                            {/* B Slider */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-white border-2 border-gray-300 rounded-xl w-14 h-12 flex items-center justify-center text-xl font-bold text-gray-700">
                                        B
                                    </div>
                                    <div className="flex-1 bg-gray-800 rounded-2xl px-6 py-3 text-white font-bold text-xl text-center">
                                        {rgb.b}
                                    </div>
                                </div>
                                <Slider
                                    value={[rgb.b]}
                                    onValueChange={(val) => handleRgbChange('b', val)}
                                    max={255}
                                    step={1}
                                    className="[&_.relative]:h-2 [&_.relative]:bg-gradient-to-r [&_.relative]:from-black [&_.relative]:to-blue-500 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg"
                                />
                            </div>
                        </div>

                        {/* Apply Button */}
                        <Button
                            onClick={handleApply}
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-lg py-6 rounded-2xl"
                        >
                            Apply Color
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}