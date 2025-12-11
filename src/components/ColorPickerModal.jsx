import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

export default function ColorPickerModal({ isOpen, onClose, onSelectColor, currentColor = '#000000' }) {
    const [color, setColor] = useState(currentColor);

    const handleApply = () => {
        onSelectColor(color);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[320px] bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Color Picker</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="space-y-4">
                    <HexColorPicker color={color} onChange={setColor} style={{ width: '100%', height: '200px' }} />
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">HEX</span>
                        <Input
                            value={color.toUpperCase()}
                            onChange={(e) => setColor(e.target.value)}
                            className="flex-1 font-mono"
                            maxLength={7}
                        />
                        <div 
                            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: color }}
                        />
                    </div>

                    <Button
                        onClick={handleApply}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        Apply Color
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}