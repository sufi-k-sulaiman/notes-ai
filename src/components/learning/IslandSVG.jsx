import React from 'react';

// Top-down island designs inspired by reference images
const IslandDesigns = {
    // Island 1: Beach with palm trees (simple)
    BeachPalms: ({ color }) => (
        <svg viewBox="0 0 160 120" className="w-full h-full">
            {/* Outer water ring */}
            <path d="M80,110 C125,110 145,85 140,60 C135,35 115,15 80,15 C45,15 25,35 20,60 C15,85 35,110 80,110" 
                fill="#7DD3FC" />
            <path d="M80,105 C120,105 138,82 133,60 C128,38 110,20 80,20 C50,20 32,38 27,60 C22,82 40,105 80,105" 
                fill="#38BDF8" />
            
            {/* Sandy beach */}
            <path d="M80,100 C115,100 130,78 126,58 C122,40 105,25 80,25 C55,25 38,40 34,58 C30,78 45,100 80,100" 
                fill="#FDE68A" />
            <path d="M80,95 C110,95 122,75 119,58 C116,42 102,30 80,30 C58,30 44,42 41,58 C38,75 50,95 80,95" 
                fill="#FCD34D" />
            
            {/* Grass patches */}
            <ellipse cx="65" cy="55" rx="12" ry="8" fill="#4ADE80" />
            <ellipse cx="95" cy="60" rx="10" ry="6" fill="#22C55E" />
            <ellipse cx="80" cy="70" rx="8" ry="5" fill="#4ADE80" />
            
            {/* Palm tree shadows */}
            <ellipse cx="55" cy="50" rx="8" ry="4" fill="#166534" opacity="0.3" />
            <ellipse cx="105" cy="55" rx="7" ry="3" fill="#166534" opacity="0.3" />
            
            {/* Palm trees (top view - radiating fronds) */}
            <g transform="translate(55, 45)">
                <circle cx="0" cy="0" r="3" fill="#92400E" />
                <path d="M0,0 L-12,-5" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,0 L-10,8" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,0 L5,-12" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,0 L12,-3" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,0 L8,10" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
            </g>
            
            <g transform="translate(105, 50)">
                <circle cx="0" cy="0" r="2.5" fill="#78350F" />
                <path d="M0,0 L-10,-4" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0,0 L-8,7" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0,0 L4,-10" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0,0 L10,-2" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
            </g>
        </svg>
    ),

    // Island 2: Rocky mountain island
    RockyMountain: ({ color }) => (
        <svg viewBox="0 0 160 120" className="w-full h-full">
            {/* Water */}
            <path d="M80,110 C130,110 150,80 145,55 C140,30 115,10 80,10 C45,10 20,30 15,55 C10,80 30,110 80,110" 
                fill="#7DD3FC" />
            <path d="M80,105 C125,105 143,77 138,55 C133,33 110,15 80,15 C50,15 27,33 22,55 C17,77 35,105 80,105" 
                fill="#38BDF8" />
            
            {/* Beach */}
            <path d="M80,98 C118,98 133,73 129,55 C125,37 105,22 80,22 C55,22 35,37 31,55 C27,73 42,98 80,98" 
                fill="#FDE68A" />
            
            {/* Grass base */}
            <path d="M80,92 C112,92 125,70 122,55 C119,40 100,28 80,28 C60,28 41,40 38,55 C35,70 48,92 80,92" 
                fill="#4ADE80" />
            
            {/* Mountain rocks (top view) */}
            <path d="M65,45 L80,35 L95,45 L90,60 L70,60 Z" fill="#78716C" />
            <path d="M70,48 L80,40 L90,48 L87,58 L73,58 Z" fill="#A8A29E" />
            <path d="M75,50 L80,45 L85,50 L83,56 L77,56 Z" fill="#D6D3D1" />
            
            {/* Vegetation around rocks */}
            <ellipse cx="55" cy="65" rx="8" ry="5" fill="#22C55E" />
            <ellipse cx="105" cy="62" rx="7" ry="4" fill="#16A34A" />
            <ellipse cx="80" cy="75" rx="10" ry="5" fill="#22C55E" />
            
            {/* Trees (top view circles) */}
            <circle cx="50" cy="58" r="5" fill="#166534" />
            <circle cx="110" cy="55" r="4" fill="#166534" />
            <circle cx="65" cy="78" r="4" fill="#15803D" />
            <circle cx="95" cy="80" r="5" fill="#166534" />
        </svg>
    ),

    // Island 3: Tropical with hut
    TropicalHut: ({ color }) => (
        <svg viewBox="0 0 160 120" className="w-full h-full">
            {/* Water rings */}
            <path d="M80,112 C128,112 148,85 143,58 C138,31 113,12 80,12 C47,12 22,31 17,58 C12,85 32,112 80,112" 
                fill="#7DD3FC" />
            <path d="M80,106 C122,106 140,82 136,58 C132,34 108,18 80,18 C52,18 28,34 24,58 C20,82 38,106 80,106" 
                fill="#38BDF8" />
            
            {/* Beach */}
            <path d="M80,100 C116,100 132,78 128,58 C124,38 102,24 80,24 C58,24 36,38 32,58 C28,78 44,100 80,100" 
                fill="#FDE68A" />
            <path d="M80,94 C110,94 124,75 121,58 C118,41 98,30 80,30 C62,30 42,41 39,58 C36,75 50,94 80,94" 
                fill="#FCD34D" />
            
            {/* Grass */}
            <ellipse cx="60" cy="55" rx="18" ry="12" fill="#4ADE80" />
            <ellipse cx="95" cy="60" rx="14" ry="10" fill="#22C55E" />
            
            {/* Hut (top view - red roof) */}
            <rect x="72" y="50" width="16" height="16" fill="#7C2D12" rx="1" />
            <rect x="74" y="52" width="12" height="12" fill="#DC2626" rx="1" />
            
            {/* Palm trees */}
            <g transform="translate(50, 50)">
                <circle cx="0" cy="0" r="2.5" fill="#92400E" />
                <path d="M0,0 L-10,-4" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0,0 L-8,6" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0,0 L4,-10" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0,0 L10,-2" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0,0 L6,8" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            
            <g transform="translate(110, 55)">
                <circle cx="0" cy="0" r="2" fill="#78350F" />
                <path d="M0,0 L-8,-3" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
                <path d="M0,0 L-6,5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
                <path d="M0,0 L3,-8" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
                <path d="M0,0 L8,-1" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
            </g>
            
            {/* Bushes */}
            <circle cx="65" cy="75" r="4" fill="#166534" />
            <circle cx="100" cy="72" r="3" fill="#15803D" />
        </svg>
    ),

    // Island 4: Volcano island
    VolcanoIsland: ({ color }) => (
        <svg viewBox="0 0 160 120" className="w-full h-full">
            {/* Water */}
            <path d="M80,112 C130,112 150,82 145,55 C140,28 115,8 80,8 C45,8 20,28 15,55 C10,82 30,112 80,112" 
                fill="#7DD3FC" />
            <path d="M80,105 C123,105 142,78 137,55 C132,32 108,15 80,15 C52,15 28,32 23,55 C18,78 37,105 80,105" 
                fill="#38BDF8" />
            
            {/* Beach */}
            <path d="M80,98 C116,98 132,75 128,55 C124,35 103,20 80,20 C57,20 36,35 32,55 C28,75 44,98 80,98" 
                fill="#FDE68A" />
            
            {/* Grass */}
            <path d="M80,92 C110,92 124,72 121,55 C118,38 98,26 80,26 C62,26 42,38 39,55 C36,72 50,92 80,92" 
                fill="#4ADE80" />
            
            {/* Volcano (top view) */}
            <circle cx="80" cy="55" r="22" fill="#57534E" />
            <circle cx="80" cy="55" r="16" fill="#78716C" />
            <circle cx="80" cy="55" r="10" fill="#1F2937" />
            <circle cx="80" cy="55" r="6" fill="#111827" />
            
            {/* Lava glow */}
            <circle cx="80" cy="55" r="4" fill="#EF4444" opacity="0.6" />
            
            {/* Trees around volcano */}
            <circle cx="52" cy="70" r="5" fill="#166534" />
            <circle cx="108" cy="68" r="4" fill="#166534" />
            <circle cx="60" cy="82" r="4" fill="#15803D" />
            <circle cx="100" cy="80" r="5" fill="#166534" />
            <circle cx="80" cy="85" r="3" fill="#15803D" />
        </svg>
    ),

    // Island 5: Jungle island with rocks
    JungleRocks: ({ color }) => (
        <svg viewBox="0 0 160 120" className="w-full h-full">
            {/* Water */}
            <path d="M80,110 C125,112 145,82 142,55 C139,28 115,10 80,10 C45,10 22,28 18,55 C14,82 35,108 80,110" 
                fill="#7DD3FC" />
            <path d="M80,104 C120,106 138,78 135,55 C132,32 110,16 80,16 C50,16 28,32 25,55 C22,78 40,102 80,104" 
                fill="#38BDF8" />
            
            {/* Beach */}
            <path d="M80,97 C113,99 128,75 125,55 C122,35 102,22 80,22 C58,22 38,35 35,55 C32,75 47,95 80,97" 
                fill="#FDE68A" />
            
            {/* Dense jungle (grass) */}
            <path d="M80,90 C106,92 118,72 116,55 C114,38 96,28 80,28 C64,28 46,38 44,55 C42,72 54,88 80,90" 
                fill="#22C55E" />
            
            {/* Rock formations */}
            <ellipse cx="55" cy="50" rx="10" ry="7" fill="#78716C" />
            <ellipse cx="52" cy="48" rx="6" ry="4" fill="#A8A29E" />
            <ellipse cx="100" cy="55" rx="8" ry="5" fill="#78716C" />
            <ellipse cx="98" cy="53" rx="5" ry="3" fill="#A8A29E" />
            
            {/* Dense tree canopy */}
            <circle cx="70" cy="55" r="8" fill="#166534" />
            <circle cx="85" cy="50" r="7" fill="#15803D" />
            <circle cx="78" cy="65" r="6" fill="#166534" />
            <circle cx="60" cy="68" r="5" fill="#15803D" />
            <circle cx="95" cy="70" r="6" fill="#166534" />
            
            {/* Palm top */}
            <g transform="translate(45, 62)">
                <circle cx="0" cy="0" r="2" fill="#78350F" />
                <path d="M0,0 L-7,-3" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
                <path d="M0,0 L-5,5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
                <path d="M0,0 L3,-7" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
                <path d="M0,0 L7,-1" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
            </g>
        </svg>
    ),

    // Island 6: Simple sandy island
    SandyIsland: ({ color }) => (
        <svg viewBox="0 0 160 120" className="w-full h-full">
            {/* Water */}
            <path d="M80,108 C122,110 140,82 137,58 C134,34 112,15 80,15 C48,15 26,34 23,58 C20,82 38,106 80,108" 
                fill="#7DD3FC" />
            <path d="M80,102 C116,104 132,78 130,58 C128,38 108,22 80,22 C52,22 32,38 30,58 C28,78 44,100 80,102" 
                fill="#38BDF8" />
            
            {/* Large sandy beach */}
            <path d="M80,95 C110,97 123,75 121,58 C119,41 100,28 80,28 C60,28 41,41 39,58 C37,75 50,93 80,95" 
                fill="#FDE68A" />
            <path d="M80,88 C102,90 113,72 111,58 C109,44 94,34 80,34 C66,34 51,44 49,58 C47,72 58,86 80,88" 
                fill="#FCD34D" />
            
            {/* Small grass patches */}
            <ellipse cx="70" cy="55" rx="6" ry="4" fill="#4ADE80" />
            <ellipse cx="90" cy="60" rx="5" ry="3" fill="#22C55E" />
            
            {/* Small stones */}
            <circle cx="60" cy="65" r="2" fill="#9CA3AF" />
            <circle cx="95" cy="58" r="2.5" fill="#9CA3AF" />
            <circle cx="75" cy="72" r="1.5" fill="#D1D5DB" />
        </svg>
    ),

    // Island 7: Beach resort island
    ResortIsland: ({ color }) => (
        <svg viewBox="0 0 160 120" className="w-full h-full">
            {/* Water */}
            <path d="M80,110 C128,110 148,82 143,55 C138,28 113,10 80,10 C47,10 22,28 17,55 C12,82 32,110 80,110" 
                fill="#7DD3FC" />
            <path d="M80,104 C122,104 140,78 136,55 C132,32 108,16 80,16 C52,16 28,32 24,55 C20,78 38,104 80,104" 
                fill="#38BDF8" />
            
            {/* Beach */}
            <path d="M80,97 C115,97 130,75 127,55 C124,35 104,22 80,22 C56,22 36,35 33,55 C30,75 45,97 80,97" 
                fill="#FDE68A" />
            <path d="M80,90 C107,90 120,72 118,55 C116,38 98,28 80,28 C62,28 44,38 42,55 C40,72 53,90 80,90" 
                fill="#FCD34D" />
            
            {/* Beach umbrellas */}
            <circle cx="55" cy="60" r="8" fill="#EF4444" />
            <circle cx="55" cy="60" r="6" fill="#FCA5A5" />
            <circle cx="100" cy="55" r="7" fill="#3B82F6" />
            <circle cx="100" cy="55" r="5" fill="#93C5FD" />
            <circle cx="75" cy="75" r="6" fill="#22C55E" />
            <circle cx="75" cy="75" r="4" fill="#86EFAC" />
            
            {/* Dock */}
            <rect x="115" y="65" width="20" height="4" fill="#92400E" rx="1" />
            
            {/* Palm tree */}
            <g transform="translate(45, 48)">
                <circle cx="0" cy="0" r="2" fill="#78350F" />
                <path d="M0,0 L-8,-3" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
                <path d="M0,0 L-6,5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
                <path d="M0,0 L3,-8" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
                <path d="M0,0 L8,-1" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
            </g>
        </svg>
    ),

    // Island 8: Forest island
    ForestIsland: ({ color }) => (
        <svg viewBox="0 0 160 120" className="w-full h-full">
            {/* Water */}
            <path d="M80,110 C125,110 145,82 140,55 C135,28 112,10 80,10 C48,10 25,28 20,55 C15,82 35,110 80,110" 
                fill="#7DD3FC" />
            <path d="M80,104 C120,104 138,78 134,55 C130,32 108,16 80,16 C52,16 30,32 26,55 C22,78 40,104 80,104" 
                fill="#38BDF8" />
            
            {/* Beach */}
            <path d="M80,97 C113,97 128,75 125,55 C122,35 102,22 80,22 C58,22 38,35 35,55 C32,75 47,97 80,97" 
                fill="#FDE68A" />
            
            {/* Grass */}
            <path d="M80,90 C106,90 118,72 116,55 C114,38 96,28 80,28 C64,28 46,38 44,55 C42,72 54,90 80,90" 
                fill="#4ADE80" />
            <path d="M80,82 C98,82 108,68 106,55 C104,42 90,34 80,34 C70,34 56,42 54,55 C52,68 62,82 80,82" 
                fill="#22C55E" />
            
            {/* Dense forest (tree canopy - top view) */}
            <circle cx="65" cy="50" r="9" fill="#166534" />
            <circle cx="90" cy="48" r="10" fill="#15803D" />
            <circle cx="75" cy="60" r="8" fill="#166534" />
            <circle cx="55" cy="62" r="6" fill="#15803D" />
            <circle cx="100" cy="60" r="7" fill="#166534" />
            <circle cx="80" cy="70" r="6" fill="#15803D" />
            <circle cx="68" cy="75" r="5" fill="#166534" />
            <circle cx="92" cy="72" r="5" fill="#15803D" />
        </svg>
    ),
};

const ISLAND_TYPES = [
    'BeachPalms',
    'RockyMountain', 
    'TropicalHut',
    'VolcanoIsland',
    'JungleRocks',
    'SandyIsland',
    'ResortIsland',
    'ForestIsland',
];

// Mix islands more randomly based on index using simple hash
function getIslandTypeIndex(index) {
    const hash = (index * 7 + 3) % ISLAND_TYPES.length;
    return hash;
}

export default function IslandSVG({ index, color, completed, progress = 0 }) {
    const islandType = ISLAND_TYPES[getIslandTypeIndex(index)];
    const IslandComponent = IslandDesigns[islandType];
    
    return (
        <div className="relative w-full h-full">
            <IslandComponent color={color} />
            
            {/* Progress ring overlay */}
            {progress > 0 && progress < 100 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 160 120">
                    <circle
                        cx="80"
                        cy="60"
                        r="45"
                        fill="none"
                        stroke="#E9D5FF"
                        strokeWidth="3"
                        opacity="0.5"
                    />
                    <circle
                        cx="80"
                        cy="60"
                        r="45"
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="3"
                        strokeDasharray={`${progress * 2.83} 283`}
                        strokeLinecap="round"
                        transform="rotate(-90, 80, 60)"
                    />
                </svg>
            )}
            
            {/* Completed badge */}
            {completed && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 160 120">
                    <circle cx="130" cy="25" r="12" fill="#10B981" />
                    <path d="M124,25 L128,29 L136,21" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </div>
    );
}