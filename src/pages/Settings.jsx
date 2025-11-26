import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
    Smartphone, Monitor, Laptop, 
    Sun, Moon, CloudSun,
    BookOpen, ZoomIn, Volume2,
    Type, Eye, Palette, EyeOff
} from 'lucide-react';

// Text-to-speech utility
const speakText = (text) => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
};

export default function Settings() {
    // New settings (card style)
    const [device, setDevice] = useState(() => localStorage.getItem('deviceMode') || 'laptop');
    const [resolution, setResolution] = useState(() => localStorage.getItem('resolution') || '1920x1080');
    const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'medium');
    const [cognitiveMode, setCognitiveMode] = useState(() => localStorage.getItem('cognitiveMode') || 'audible');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [uiStyle, setUiStyle] = useState(() => localStorage.getItem('uiStyle') || 'rounded');
    
    // Legacy settings (toggles)
    const [blackWhiteMode, setBlackWhiteMode] = useState(() => localStorage.getItem('blackWhiteMode') === 'true');
    const [hideIcons, setHideIcons] = useState(() => localStorage.getItem('hideIcons') === 'true');
    const [voicePrompts, setVoicePrompts] = useState(() => localStorage.getItem('voicePrompts') === 'true');
    const [fontSizeSlider, setFontSizeSlider] = useState(() => parseInt(localStorage.getItem('fontSizeSlider')) || 16);

    useEffect(() => {
        localStorage.setItem('deviceMode', device);
        localStorage.setItem('resolution', resolution);
        localStorage.setItem('fontSize', fontSize);
        localStorage.setItem('cognitiveMode', cognitiveMode);
        localStorage.setItem('theme', theme);
        localStorage.setItem('uiStyle', uiStyle);
        localStorage.setItem('blackWhiteMode', blackWhiteMode);
        localStorage.setItem('hideIcons', hideIcons);
        localStorage.setItem('voicePrompts', voicePrompts);
        localStorage.setItem('fontSizeSlider', fontSizeSlider);

        // Apply font size from card selection
        const sizes = { small: '14px', medium: '16px', large: '20px' };
        document.documentElement.style.fontSize = sizes[fontSize] || '16px';

        // Apply theme
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [device, resolution, fontSize, cognitiveMode, theme, uiStyle, blackWhiteMode, hideIcons, voicePrompts, fontSizeSlider]);

    const OptionCard = ({ selected, onClick, children, className = '' }) => (
        <button
            onClick={onClick}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 min-w-[100px] ${
                selected 
                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                    : 'border-gray-200 bg-white hover:border-purple-300 text-gray-600 hover:text-purple-600'
            } ${className}`}
        >
            {children}
        </button>
    );

    const Section = ({ title, subtitle, children }) => (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
            <div className="flex flex-wrap gap-3">
                {children}
            </div>
        </div>
    );

    return (
        <PageLayout activePage="Settings" showSearch={false}>
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Settings</h1>
                <p className="text-gray-600 mb-8">Customize your experience</p>

                {/* Compatibility */}
                <Section title="Compatibility" subtitle="Make it work">
                    <OptionCard selected={device === 'mobile'} onClick={() => setDevice('mobile')}>
                        <Smartphone className="w-8 h-8" />
                        <span className="text-sm font-medium">Mobile</span>
                    </OptionCard>
                    <OptionCard selected={device === 'laptop'} onClick={() => setDevice('laptop')}>
                        <Laptop className="w-8 h-8" />
                        <span className="text-sm font-medium">Laptop</span>
                    </OptionCard>
                    <OptionCard selected={device === 'desktop'} onClick={() => setDevice('desktop')}>
                        <Monitor className="w-8 h-8" />
                        <span className="text-sm font-medium">Desktop</span>
                    </OptionCard>
                </Section>

                {/* Usability */}
                <Section title="Usability" subtitle="Fit my screen">
                    <OptionCard selected={resolution === '1920x1080'} onClick={() => setResolution('1920x1080')}>
                        <div className="w-10 h-6 border-2 border-current rounded flex items-center justify-center text-[10px] font-bold">1080p</div>
                        <span className="text-sm font-medium">1920×1080</span>
                    </OptionCard>
                    <OptionCard selected={resolution === '2560x1440'} onClick={() => setResolution('2560x1440')}>
                        <div className="w-10 h-6 border-2 border-current rounded flex items-center justify-center text-[10px] font-bold">2K</div>
                        <span className="text-sm font-medium">2560×1440</span>
                    </OptionCard>
                    <OptionCard selected={resolution === '3840x2160'} onClick={() => setResolution('3840x2160')}>
                        <div className="w-10 h-6 border-2 border-current rounded flex items-center justify-center text-[10px] font-bold">4K</div>
                        <span className="text-sm font-medium">3840×2160</span>
                    </OptionCard>
                </Section>

                {/* Vision */}
                <Section title="Vision" subtitle="Help me read">
                    <OptionCard selected={fontSize === 'small'} onClick={() => setFontSize('small')}>
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-semibold text-purple-600">Sample</span>
                            <span className="text-[10px]">Text</span>
                        </div>
                        <span className="text-sm font-medium text-purple-600">Small 12pt</span>
                    </OptionCard>
                    <OptionCard selected={fontSize === 'medium'} onClick={() => setFontSize('medium')}>
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-semibold">Sample</span>
                            <span className="text-xs">Text</span>
                        </div>
                        <span className="text-sm font-medium">Medium 16pt</span>
                    </OptionCard>
                    <OptionCard selected={fontSize === 'large'} onClick={() => setFontSize('large')}>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-semibold">Sample</span>
                            <span className="text-sm">Text</span>
                        </div>
                        <span className="text-sm font-medium">Large 20pt</span>
                    </OptionCard>
                </Section>

                {/* Cognitive */}
                <Section title="Cognitive" subtitle="Make me understand">
                    <OptionCard selected={cognitiveMode === 'reader'} onClick={() => setCognitiveMode('reader')}>
                        <BookOpen className="w-8 h-8" />
                        <span className="text-sm font-medium">Reader mode</span>
                    </OptionCard>
                    <OptionCard selected={cognitiveMode === 'magnification'} onClick={() => setCognitiveMode('magnification')}>
                        <ZoomIn className="w-8 h-8" />
                        <span className="text-sm font-medium">Magnification</span>
                    </OptionCard>
                    <OptionCard selected={cognitiveMode === 'audible'} onClick={() => setCognitiveMode('audible')}>
                        <Volume2 className="w-8 h-8" />
                        <span className="text-sm font-medium">Audible</span>
                    </OptionCard>
                </Section>

                {/* Theme */}
                <Section title="Personalize" subtitle="Select your theme">
                    <OptionCard selected={theme === 'light'} onClick={() => setTheme('light')}>
                        <Sun className="w-8 h-8" />
                        <span className="text-sm font-medium">Light & White</span>
                    </OptionCard>
                    <OptionCard selected={theme === 'dark'} onClick={() => setTheme('dark')}>
                        <Moon className="w-8 h-8" />
                        <span className="text-sm font-medium">Dark & Black</span>
                    </OptionCard>
                    <OptionCard selected={theme === 'hybrid'} onClick={() => setTheme('hybrid')}>
                        <CloudSun className="w-8 h-8" />
                        <span className="text-sm font-medium">Hybrid</span>
                    </OptionCard>
                </Section>

                {/* UI Style */}
                <Section title="Design" subtitle="User interface">
                    <OptionCard selected={uiStyle === 'rounded'} onClick={() => setUiStyle('rounded')} className="min-w-[120px]">
                        <div className="w-16 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-500">Button</div>
                        <span className="text-sm font-medium">Rounded</span>
                    </OptionCard>
                    <OptionCard selected={uiStyle === 'square'} onClick={() => setUiStyle('square')} className="min-w-[120px]">
                        <div className="w-16 h-6 bg-gray-200 rounded-none flex items-center justify-center text-[10px] text-gray-500">Button</div>
                        <span className="text-sm font-medium">Square</span>
                    </OptionCard>
                    <OptionCard selected={uiStyle === 'oldschool'} onClick={() => setUiStyle('oldschool')} className="min-w-[120px]">
                        <div className="w-16 h-6 border-2 border-purple-500 rounded flex items-center justify-center text-[10px] text-purple-500">Button</div>
                        <span className="text-sm font-medium">Old school</span>
                    </OptionCard>
                </Section>

                {/* Accessibility Toggles */}
                <div className="border-t border-gray-200 pt-8 mt-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Accessibility Options</h2>
                    
                    <div className="space-y-6">
                        {/* Black & White Mode */}
                        <div 
                            className={`bg-white rounded-xl border-2 p-5 transition-all ${blackWhiteMode ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                            onFocus={() => voicePrompts && speakText('Black and white mode. Enable for grayscale display.')}
                            tabIndex={0}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${blackWhiteMode ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                        <Eye className={`w-6 h-6 ${blackWhiteMode ? 'text-purple-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Black & White Mode</h3>
                                        <p className="text-sm text-gray-500">Display in grayscale</p>
                                    </div>
                                </div>
                                <Switch checked={blackWhiteMode} onCheckedChange={setBlackWhiteMode} />
                            </div>
                        </div>

                        {/* Hide Icons */}
                        <div 
                            className={`bg-white rounded-xl border-2 p-5 transition-all ${hideIcons ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                            onFocus={() => voicePrompts && speakText('Hide icons. Enable to show text only navigation.')}
                            tabIndex={0}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hideIcons ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                        <EyeOff className={`w-6 h-6 ${hideIcons ? 'text-purple-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Hide Icons</h3>
                                        <p className="text-sm text-gray-500">Show text-only navigation</p>
                                    </div>
                                </div>
                                <Switch checked={hideIcons} onCheckedChange={setHideIcons} />
                            </div>
                        </div>

                        {/* Voice Prompts */}
                        <div 
                            className={`bg-white rounded-xl border-2 p-5 transition-all ${voicePrompts ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                            onFocus={() => voicePrompts && speakText('Voice prompts enabled. Settings will be read aloud.')}
                            tabIndex={0}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${voicePrompts ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                        <Volume2 className={`w-6 h-6 ${voicePrompts ? 'text-purple-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Voice Prompts</h3>
                                        <p className="text-sm text-gray-500">Read settings aloud on focus</p>
                                    </div>
                                </div>
                                <Switch checked={voicePrompts} onCheckedChange={setVoicePrompts} />
                            </div>
                        </div>

                        {/* Font Size Slider */}
                        <div 
                            className="bg-white rounded-xl border-2 border-gray-200 p-5"
                            onFocus={() => voicePrompts && speakText(`Font size slider. Current size is ${fontSizeSlider} pixels.`)}
                            tabIndex={0}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <Type className="w-6 h-6 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">Font Size</h3>
                                    <p className="text-sm text-gray-500">Adjust text size: {fontSizeSlider}px</p>
                                </div>
                            </div>
                            <Slider
                                value={[fontSizeSlider]}
                                onValueChange={([value]) => setFontSizeSlider(value)}
                                min={12}
                                max={24}
                                step={1}
                                className="w-full"
                            />
                            <div className="flex justify-between mt-2 text-xs text-gray-400">
                                <span>12px</span>
                                <span>24px</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}