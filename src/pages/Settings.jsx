import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
    Sun, Moon, CloudSun, BookOpen, ZoomIn, Volume2,
    Type, Eye, EyeOff, Palette, RotateCcw
} from 'lucide-react';

const speakText = (text) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
};

export default function Settings() {
    useEffect(() => {
        document.title = 'Personalized control for 1cPublishing';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Personalized usability, simplify customization, and empower every user experience.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'usability, accessibility');
    }, []);

    const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'medium');
    const [cognitiveMode, setCognitiveMode] = useState(() => localStorage.getItem('cognitiveMode') || 'none');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [uiStyle, setUiStyle] = useState(() => localStorage.getItem('uiStyle') || 'rounded');
    const [blackWhiteMode, setBlackWhiteMode] = useState(() => localStorage.getItem('blackWhiteMode') === 'true');
    const [hideIcons, setHideIcons] = useState(() => localStorage.getItem('hideIcons') === 'true');
    const [voicePrompts, setVoicePrompts] = useState(() => localStorage.getItem('voicePrompts') === 'true');
    const [fontSizeSlider, setFontSizeSlider] = useState(() => parseInt(localStorage.getItem('fontSizeSlider')) || 16);

    useEffect(() => {
        localStorage.setItem('fontSize', fontSize);
        localStorage.setItem('cognitiveMode', cognitiveMode);
        localStorage.setItem('theme', theme);
        localStorage.setItem('uiStyle', uiStyle);
        localStorage.setItem('blackWhiteMode', blackWhiteMode);
        localStorage.setItem('hideIcons', hideIcons);
        localStorage.setItem('voicePrompts', voicePrompts);
        localStorage.setItem('fontSizeSlider', fontSizeSlider);

        const sizes = { small: '12px', medium: '16px', large: '20px' };
        document.documentElement.style.fontSize = sizes[fontSize] || '16px';

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

        document.documentElement.style.filter = blackWhiteMode ? 'grayscale(100%)' : 'none';

        // Hide icons globally
        if (hideIcons) {
            document.documentElement.setAttribute('data-hide-icons', 'true');
        } else {
            document.documentElement.removeAttribute('data-hide-icons');
        }

        // UI Style
        document.documentElement.setAttribute('data-ui-style', uiStyle);
        if (uiStyle === 'rounded') {
            document.documentElement.style.setProperty('--radius', '0.75rem');
        } else if (uiStyle === 'square') {
            document.documentElement.style.setProperty('--radius', '0');
        } else if (uiStyle === 'classic') {
            document.documentElement.style.setProperty('--radius', '0');
        }

        // Cognitive modes
        document.documentElement.setAttribute('data-cognitive', cognitiveMode);

        if (cognitiveMode === 'magnification') {
            document.documentElement.style.transform = 'scale(1.25)';
            document.documentElement.style.transformOrigin = 'top left';
            document.documentElement.style.width = '80%';
        } else {
            document.documentElement.style.transform = 'none';
            document.documentElement.style.width = '100%';
        }

        // Reader mode - minimal styling
        if (cognitiveMode === 'reader') {
            document.body.style.fontFamily = 'Georgia, serif';
            document.body.style.lineHeight = '1.8';
        } else {
            document.body.style.fontFamily = '';
            document.body.style.lineHeight = '';
        }
    }, [fontSize, cognitiveMode, theme, uiStyle, blackWhiteMode, hideIcons, voicePrompts, fontSizeSlider]);

    // Audible mode OR Voice Prompts - read on hover
    useEffect(() => {
        if (cognitiveMode !== 'audible' && !voicePrompts) return;
        
        const handleMouseOver = (e) => {
            const target = e.target;
            const text = target.innerText || target.getAttribute('aria-label') || target.alt || '';
            if (text && text.trim().length > 0 && text.length < 500) {
                speakText(text.trim());
            }
        };

        document.addEventListener('mouseover', handleMouseOver);
        return () => document.removeEventListener('mouseover', handleMouseOver);
    }, [cognitiveMode, voicePrompts]);

    useEffect(() => {
        if (cognitiveMode === 'audible' && voicePrompts) {
            speakText('Audible mode enabled. Voice prompts will read content aloud.');
        }
    }, [cognitiveMode]);

    const OptionCard = ({ selected, onClick, children, label = '' }) => (
        <button onClick={() => { onClick(); if (voicePrompts && label) speakText(`Selected ${label}`); }}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 min-w-[100px] ${
                selected ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-white hover:border-purple-300 text-gray-600'
            }`}>
            {children}
        </button>
    );

    const ToggleCard = ({ enabled, onToggle, icon: Icon, title, description }) => (
        <div className={`bg-white rounded-xl border-2 p-4 transition-all ${enabled ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabled ? 'bg-purple-100' : 'bg-gray-100'}`}>
                        <Icon className={`w-5 h-5 ${enabled ? 'text-purple-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-800 text-sm">{title}</h3>
                        <p className="text-xs text-gray-500">{description}</p>
                    </div>
                </div>
                <Switch checked={enabled} onCheckedChange={onToggle} />
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Settings</h1>
            <p className="text-gray-500 mb-8">Preferences</p>

            {/* Theme */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Theme</h2>
                <p className="text-sm text-gray-500 mb-4">Choose your color scheme</p>
                <div className="flex flex-wrap gap-3">
                    <OptionCard selected={theme === 'light'} onClick={() => setTheme('light')} label="Light theme">
                        <Sun className="w-7 h-7" />
                        <span className="text-sm font-medium">Light</span>
                    </OptionCard>
                    <OptionCard selected={theme === 'dark'} onClick={() => setTheme('dark')} label="Dark theme">
                        <Moon className="w-7 h-7" />
                        <span className="text-sm font-medium">Dark</span>
                    </OptionCard>
                    <OptionCard selected={theme === 'hybrid'} onClick={() => setTheme('hybrid')} label="Hybrid theme">
                        <CloudSun className="w-7 h-7" />
                        <span className="text-sm font-medium">Hybrid</span>
                    </OptionCard>
                </div>
            </div>

            {/* Text Size */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Text Size</h2>
                <p className="text-sm text-gray-500 mb-4">Adjust text for readability</p>
                <div className="flex flex-wrap gap-3 mb-4">
                    <OptionCard selected={fontSize === 'small'} onClick={() => setFontSize('small')} label="Small text">
                        <span className="text-xs font-semibold">Aa</span>
                        <span className="text-sm font-medium">Small</span>
                    </OptionCard>
                    <OptionCard selected={fontSize === 'medium'} onClick={() => setFontSize('medium')} label="Medium text">
                        <span className="text-base font-semibold">Aa</span>
                        <span className="text-sm font-medium">Medium</span>
                    </OptionCard>
                    <OptionCard selected={fontSize === 'large'} onClick={() => setFontSize('large')} label="Large text">
                        <span className="text-xl font-semibold">Aa</span>
                        <span className="text-sm font-medium">Large</span>
                    </OptionCard>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Fine adjustment</span>
                        <span className="text-sm text-purple-600 font-medium">{fontSizeSlider}px</span>
                    </div>
                    <Slider value={[fontSizeSlider]} onValueChange={([v]) => { setFontSizeSlider(v); document.documentElement.style.fontSize = `${v}px`; }} min={12} max={24} step={1} />
                </div>
            </div>

            {/* UI Style */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">UI Style</h2>
                <p className="text-sm text-gray-500 mb-4">Button and element appearance</p>
                <div className="flex flex-wrap gap-3">
                    <OptionCard selected={uiStyle === 'rounded'} onClick={() => setUiStyle('rounded')} label="Rounded style">
                        <div className="w-14 h-5 bg-gray-200 rounded-full" />
                        <span className="text-sm font-medium">Rounded</span>
                    </OptionCard>
                    <OptionCard selected={uiStyle === 'square'} onClick={() => setUiStyle('square')} label="Square style">
                        <div className="w-14 h-5 bg-gray-200 rounded-none" />
                        <span className="text-sm font-medium">Square</span>
                    </OptionCard>
                    <OptionCard selected={uiStyle === 'classic'} onClick={() => setUiStyle('classic')} label="Classic style">
                        <span className="text-purple-600 underline text-sm">Link</span>
                        <span className="text-sm font-medium">Classic</span>
                    </OptionCard>
                </div>
            </div>

            {/* Cognitive Assistance */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Cognitive Assistance</h2>
                <p className="text-sm text-gray-500 mb-4">Aids for content comprehension</p>
                <div className="flex flex-wrap gap-3">
                    <OptionCard selected={cognitiveMode === 'none'} onClick={() => setCognitiveMode('none')} label="No assistance">
                        <Palette className="w-7 h-7" />
                        <span className="text-sm font-medium">None</span>
                    </OptionCard>
                    <OptionCard selected={cognitiveMode === 'reader'} onClick={() => setCognitiveMode('reader')} label="Reader mode">
                        <BookOpen className="w-7 h-7" />
                        <span className="text-sm font-medium">Reader</span>
                    </OptionCard>
                    <OptionCard selected={cognitiveMode === 'magnification'} onClick={() => setCognitiveMode('magnification')} label="Magnification">
                        <ZoomIn className="w-7 h-7" />
                        <span className="text-sm font-medium">Magnify</span>
                    </OptionCard>
                    <OptionCard selected={cognitiveMode === 'audible'} onClick={() => setCognitiveMode('audible')} label="Audible mode">
                        <Volume2 className="w-7 h-7" />
                        <span className="text-sm font-medium">Audible</span>
                    </OptionCard>
                </div>
            </div>

            {/* Accessibility Toggles */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Accessibility</h2>
                <p className="text-sm text-gray-500 mb-4">Additional accessibility options</p>
                <div className="space-y-3">
                    <ToggleCard enabled={blackWhiteMode} onToggle={(v) => { setBlackWhiteMode(v); if (voicePrompts) speakText(v ? 'Grayscale enabled' : 'Grayscale disabled'); }}
                        icon={Eye} title="Grayscale Mode" description="High contrast black & white display" />
                    <ToggleCard enabled={hideIcons} onToggle={(v) => { setHideIcons(v); if (voicePrompts) speakText(v ? 'Icons hidden' : 'Icons visible'); }}
                        icon={EyeOff} title="Hide Icons" description="Text-only navigation" />
                    <ToggleCard enabled={voicePrompts} onToggle={(v) => { setVoicePrompts(v); if (v) speakText('Voice prompts enabled'); }}
                        icon={Volume2} title="Voice Prompts" description="Read settings aloud" />
                </div>
            </div>

            {/* Reset */}
            <button onClick={() => {
                setFontSize('medium'); setCognitiveMode('none'); setTheme('light'); setUiStyle('rounded');
                setBlackWhiteMode(false); setHideIcons(false); setVoicePrompts(false); setFontSizeSlider(16);
            }} className={uiStyle === 'classic' 
                ? "text-purple-600 underline font-medium" 
                : "flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"}>
                {uiStyle !== 'classic' && <RotateCcw className="w-4 h-4" />} Reset to Defaults
            </button>
        </div>
    );
}