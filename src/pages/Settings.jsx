import React, { useState, useEffect } from 'react';

import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
    Smartphone, Monitor, Laptop, 
    Sun, Moon, CloudSun,
    BookOpen, ZoomIn, Volume2,
    Type, Eye, EyeOff
} from 'lucide-react';

// Text-to-speech utility
const speakText = (text) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
};

export default function Settings() {
    // Card style settings
    const [device, setDevice] = useState(() => localStorage.getItem('deviceMode') || 'laptop');
    const [resolution, setResolution] = useState(() => localStorage.getItem('resolution') || '1920x1080');
    const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'medium');
    const [cognitiveMode, setCognitiveMode] = useState(() => localStorage.getItem('cognitiveMode') || 'none');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [uiStyle, setUiStyle] = useState(() => localStorage.getItem('uiStyle') || 'rounded');
    
    // Toggle settings
    const [blackWhiteMode, setBlackWhiteMode] = useState(() => localStorage.getItem('blackWhiteMode') === 'true');
    const [hideIcons, setHideIcons] = useState(() => localStorage.getItem('hideIcons') === 'true');
    const [voicePrompts, setVoicePrompts] = useState(() => localStorage.getItem('voicePrompts') === 'true');
    const [fontSizeSlider, setFontSizeSlider] = useState(() => parseInt(localStorage.getItem('fontSizeSlider')) || 16);

    // Apply all settings
    useEffect(() => {
        // Save to localStorage
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

        // Apply font size based on Vision selection
        const sizes = { small: '12px', medium: '16px', large: '20px' };
        document.documentElement.style.fontSize = sizes[fontSize] || '16px';

        // Apply theme
        document.documentElement.classList.remove('dark', 'hybrid');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.style.backgroundColor = '#1a1a2e';
            document.body.style.color = '#ffffff';
        } else if (theme === 'hybrid') {
            document.documentElement.classList.add('hybrid');
            document.body.style.backgroundColor = '#f0f0f0';
            document.body.style.color = '#333333';
        } else {
            document.body.style.backgroundColor = '#ffffff';
            document.body.style.color = '#000000';
        }

        // Apply black & white mode
        if (blackWhiteMode) {
            document.documentElement.style.filter = 'grayscale(100%)';
        } else {
            document.documentElement.style.filter = 'none';
        }

        // Apply UI style (border radius)
        if (uiStyle === 'rounded') {
            document.documentElement.style.setProperty('--radius', '0.75rem');
        } else if (uiStyle === 'square') {
            document.documentElement.style.setProperty('--radius', '0');
        } else if (uiStyle === 'oldschool') {
            document.documentElement.style.setProperty('--radius', '0.25rem');
        }

        // Apply resolution scaling
        let scale = 1;
        if (resolution === '2560x1440') {
            scale = 1.1;
        } else if (resolution === '3840x2160') {
            scale = 1.25;
        }
        document.documentElement.style.setProperty('--content-scale', scale);

        // Apply device mode (affects layout density)
        document.documentElement.setAttribute('data-device', device);
        
        // Apply cognitive mode
        document.documentElement.setAttribute('data-cognitive', cognitiveMode);

        // Apply magnification if cognitive mode is magnification
        if (cognitiveMode === 'magnification') {
            document.documentElement.style.transform = 'scale(1.15)';
            document.documentElement.style.transformOrigin = 'top left';
            document.documentElement.style.width = '87%';
        } else {
            document.documentElement.style.transform = 'none';
            document.documentElement.style.width = '100%';
        }

    }, [device, resolution, fontSize, cognitiveMode, theme, uiStyle, blackWhiteMode, hideIcons, voicePrompts, fontSizeSlider]);

    // Handle voice prompts for cognitive mode
    useEffect(() => {
        if (cognitiveMode === 'audible' && voicePrompts) {
            speakText('Audible mode enabled. Voice prompts will read content aloud.');
        }
    }, [cognitiveMode]);

    const handleSettingChange = (settingName, value, setter) => {
        setter(value);
        if (voicePrompts) {
            speakText(`${settingName} set to ${value}`);
        }
    };

    const OptionCard = ({ selected, onClick, children, className = '', label = '' }) => (
        <button
            onClick={() => {
                onClick();
                if (voicePrompts && label) {
                    speakText(`Selected ${label}`);
                }
            }}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 min-w-[100px] ${
                selected 
                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                    : 'border-gray-200 bg-white hover:border-purple-300 text-gray-600 hover:text-purple-600'
            } ${className}`}
            onFocus={() => voicePrompts && label && speakText(label)}
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
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Settings</h1>
                <p className="text-gray-600 mb-8">Customize your experience - all settings are applied immediately</p>

                {/* Compatibility */}
                <Section title="Compatibility" subtitle="Make it work - Optimizes layout for your device">
                    <OptionCard selected={device === 'mobile'} onClick={() => handleSettingChange('Device', 'mobile', setDevice)} label="Mobile - touch optimized">
                        <Smartphone className="w-8 h-8" />
                        <span className="text-sm font-medium">Mobile</span>
                    </OptionCard>
                    <OptionCard selected={device === 'laptop'} onClick={() => handleSettingChange('Device', 'laptop', setDevice)} label="Laptop - balanced layout">
                        <Laptop className="w-8 h-8" />
                        <span className="text-sm font-medium">Laptop</span>
                    </OptionCard>
                    <OptionCard selected={device === 'desktop'} onClick={() => handleSettingChange('Device', 'desktop', setDevice)} label="Desktop - full features">
                        <Monitor className="w-8 h-8" />
                        <span className="text-sm font-medium">Desktop</span>
                    </OptionCard>
                </Section>

                {/* Usability */}
                <Section title="Usability" subtitle="Fit my screen - Scales content for your display">
                    <OptionCard selected={resolution === '1920x1080'} onClick={() => handleSettingChange('Resolution', '1920x1080', setResolution)} label="1080p standard HD">
                        <div className="w-10 h-6 border-2 border-current rounded flex items-center justify-center text-[10px] font-bold">1080p</div>
                        <span className="text-sm font-medium">1920×1080</span>
                    </OptionCard>
                    <OptionCard selected={resolution === '2560x1440'} onClick={() => handleSettingChange('Resolution', '2560x1440', setResolution)} label="2K higher clarity">
                        <div className="w-10 h-6 border-2 border-current rounded flex items-center justify-center text-[10px] font-bold">2K</div>
                        <span className="text-sm font-medium">2560×1440</span>
                    </OptionCard>
                    <OptionCard selected={resolution === '3840x2160'} onClick={() => handleSettingChange('Resolution', '3840x2160', setResolution)} label="4K ultra HD">
                        <div className="w-10 h-6 border-2 border-current rounded flex items-center justify-center text-[10px] font-bold">4K</div>
                        <span className="text-sm font-medium">3840×2160</span>
                    </OptionCard>
                </Section>

                {/* Vision */}
                <Section title="Vision" subtitle="Help me read - Adjusts text size for readability">
                    <OptionCard selected={fontSize === 'small'} onClick={() => handleSettingChange('Font size', 'small 12 point', setFontSize)} label="Small 12 point text">
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-semibold">Sample</span>
                            <span className="text-[10px]">Text</span>
                        </div>
                        <span className="text-sm font-medium">Small 12pt</span>
                    </OptionCard>
                    <OptionCard selected={fontSize === 'medium'} onClick={() => handleSettingChange('Font size', 'medium 16 point', setFontSize)} label="Medium 16 point text">
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-semibold">Sample</span>
                            <span className="text-xs">Text</span>
                        </div>
                        <span className="text-sm font-medium">Medium 16pt</span>
                    </OptionCard>
                    <OptionCard selected={fontSize === 'large'} onClick={() => handleSettingChange('Font size', 'large 20 point', setFontSize)} label="Large 20 point text">
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-semibold">Sample</span>
                            <span className="text-sm">Text</span>
                        </div>
                        <span className="text-sm font-medium">Large 20pt</span>
                    </OptionCard>
                </Section>

                {/* Cognitive */}
                <Section title="Cognitive" subtitle="Make me understand - Assists with content comprehension">
                    <OptionCard selected={cognitiveMode === 'reader'} onClick={() => handleSettingChange('Cognitive mode', 'reader', setCognitiveMode)} label="Reader mode - simplified layout">
                        <BookOpen className="w-8 h-8" />
                        <span className="text-sm font-medium">Reader mode</span>
                    </OptionCard>
                    <OptionCard selected={cognitiveMode === 'magnification'} onClick={() => handleSettingChange('Cognitive mode', 'magnification', setCognitiveMode)} label="Magnification - enlarged content">
                        <ZoomIn className="w-8 h-8" />
                        <span className="text-sm font-medium">Magnification</span>
                    </OptionCard>
                    <OptionCard selected={cognitiveMode === 'audible'} onClick={() => handleSettingChange('Cognitive mode', 'audible', setCognitiveMode)} label="Audible - text to speech">
                        <Volume2 className="w-8 h-8" />
                        <span className="text-sm font-medium">Audible</span>
                    </OptionCard>
                </Section>

                {/* Theme */}
                <Section title="Personalize" subtitle="Select your theme - Changes color scheme">
                    <OptionCard selected={theme === 'light'} onClick={() => handleSettingChange('Theme', 'light', setTheme)} label="Light and white theme">
                        <Sun className="w-8 h-8" />
                        <span className="text-sm font-medium">Light & White</span>
                    </OptionCard>
                    <OptionCard selected={theme === 'dark'} onClick={() => handleSettingChange('Theme', 'dark', setTheme)} label="Dark and black theme">
                        <Moon className="w-8 h-8" />
                        <span className="text-sm font-medium">Dark & Black</span>
                    </OptionCard>
                    <OptionCard selected={theme === 'hybrid'} onClick={() => handleSettingChange('Theme', 'hybrid', setTheme)} label="Hybrid balanced theme">
                        <CloudSun className="w-8 h-8" />
                        <span className="text-sm font-medium">Hybrid</span>
                    </OptionCard>
                </Section>

                {/* UI Style */}
                <Section title="Design" subtitle="User interface - Customizes button and element styles">
                    <OptionCard selected={uiStyle === 'rounded'} onClick={() => handleSettingChange('UI style', 'rounded', setUiStyle)} label="Rounded button style" className="min-w-[120px]">
                        <div className="w-16 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-500">Button</div>
                        <span className="text-sm font-medium">Rounded</span>
                    </OptionCard>
                    <OptionCard selected={uiStyle === 'square'} onClick={() => handleSettingChange('UI style', 'square', setUiStyle)} label="Square button style" className="min-w-[120px]">
                        <div className="w-16 h-6 bg-gray-200 rounded-none flex items-center justify-center text-[10px] text-gray-500">Button</div>
                        <span className="text-sm font-medium">Square</span>
                    </OptionCard>
                    <OptionCard selected={uiStyle === 'oldschool'} onClick={() => handleSettingChange('UI style', 'old school', setUiStyle)} label="Old school button style" className="min-w-[120px]">
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
                            onFocus={() => voicePrompts && speakText('Black and white mode. Enable for grayscale display for color-blind users.')}
                            tabIndex={0}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${blackWhiteMode ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                        <Eye className={`w-6 h-6 ${blackWhiteMode ? 'text-purple-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Black & White Mode</h3>
                                        <p className="text-sm text-gray-500">Grayscale display for high contrast needs</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={blackWhiteMode} 
                                    onCheckedChange={(val) => {
                                        setBlackWhiteMode(val);
                                        if (voicePrompts) speakText(val ? 'Black and white mode enabled' : 'Black and white mode disabled');
                                    }} 
                                />
                            </div>
                        </div>

                        {/* Hide Icons */}
                        <div 
                            className={`bg-white rounded-xl border-2 p-5 transition-all ${hideIcons ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                            onFocus={() => voicePrompts && speakText('Hide icons. Enable to show text only navigation to reduce visual clutter.')}
                            tabIndex={0}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hideIcons ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                        <EyeOff className={`w-6 h-6 ${hideIcons ? 'text-purple-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Hide Icons</h3>
                                        <p className="text-sm text-gray-500">Text-only navigation to reduce visual clutter</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={hideIcons} 
                                    onCheckedChange={(val) => {
                                        setHideIcons(val);
                                        if (voicePrompts) speakText(val ? 'Icons hidden' : 'Icons visible');
                                    }} 
                                />
                            </div>
                        </div>

                        {/* Voice Prompts */}
                        <div 
                            className={`bg-white rounded-xl border-2 p-5 transition-all ${voicePrompts ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                            tabIndex={0}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${voicePrompts ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                        <Volume2 className={`w-6 h-6 ${voicePrompts ? 'text-purple-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Voice Prompts</h3>
                                        <p className="text-sm text-gray-500">Read settings aloud for visually impaired users</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={voicePrompts} 
                                    onCheckedChange={(val) => {
                                        setVoicePrompts(val);
                                        if (val) speakText('Voice prompts enabled. Settings will be read aloud.');
                                    }} 
                                />
                            </div>
                        </div>

                        {/* Font Size Slider */}
                        <div 
                            className="bg-white rounded-xl border-2 border-gray-200 p-5"
                            onFocus={() => voicePrompts && speakText(`Font size fine adjustment. Current size is ${fontSizeSlider} pixels.`)}
                            tabIndex={0}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <Type className="w-6 h-6 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">Font Size Fine Adjustment</h3>
                                    <p className="text-sm text-gray-500">Current size: {fontSizeSlider}px (overrides Vision preset)</p>
                                </div>
                            </div>
                            <Slider
                                value={[fontSizeSlider]}
                                onValueChange={([value]) => {
                                    setFontSizeSlider(value);
                                    document.documentElement.style.fontSize = `${value}px`;
                                }}
                                min={12}
                                max={24}
                                step={1}
                                className="w-full"
                            />
                            <div className="flex justify-between mt-2 text-xs text-gray-400">
                                <span>12px (Small)</span>
                                <span>18px (Medium)</span>
                                <span>24px (Large)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reset Button */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <button
                        onClick={() => {
                            setDevice('laptop');
                            setResolution('1920x1080');
                            setFontSize('medium');
                            setCognitiveMode('none');
                            setTheme('light');
                            setUiStyle('rounded');
                            setBlackWhiteMode(false);
                            setHideIcons(false);
                            setVoicePrompts(false);
                            setFontSizeSlider(16);
                            if (voicePrompts) speakText('All settings reset to defaults');
                        }}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                    >
                        Reset All Settings to Defaults
                    </button>
                </div>
            </div>
    );
}