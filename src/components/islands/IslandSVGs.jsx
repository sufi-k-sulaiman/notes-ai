import React from 'react';

// Island 1 - Two palm trees on round mound (top-left)
export const Island1 = ({ className = "", color = "currentColor" }) => (
    <svg viewBox="0 0 120 100" className={className} fill={color}>
        {/* Left palm fronds */}
        <path d="M32 55 C28 48 22 46 16 48 C22 49 27 52 30 55 Z" />
        <path d="M32 55 C26 46 18 42 10 45 C20 47 27 51 31 55 Z" />
        <path d="M33 55 C30 44 24 36 16 35 C24 40 30 48 33 55 Z" />
        <path d="M34 55 C38 44 44 36 52 35 C44 40 38 48 35 55 Z" />
        <path d="M35 55 C42 46 50 42 58 45 C48 47 40 51 36 55 Z" />
        <path d="M35 55 C40 48 46 46 52 48 C46 49 40 52 36 55 Z" />
        {/* Left trunk */}
        <path d="M31 55 Q33 68 34 82 Q36 68 34 55 Z" />
        {/* Right palm fronds */}
        <path d="M72 48 C68 41 62 39 56 41 C62 42 67 45 70 48 Z" />
        <path d="M72 48 C66 39 58 35 50 38 C60 40 67 44 71 48 Z" />
        <path d="M73 48 C70 37 64 29 56 28 C64 33 70 41 73 48 Z" />
        <path d="M74 48 C78 37 84 29 92 28 C84 33 78 41 75 48 Z" />
        <path d="M75 48 C82 39 90 35 98 38 C88 40 80 44 76 48 Z" />
        <path d="M75 48 C80 41 86 39 92 41 C86 42 80 45 76 48 Z" />
        {/* Right trunk */}
        <path d="M71 48 Q73 65 74 82 Q76 65 74 48 Z" />
        {/* Ground mound */}
        <ellipse cx="55" cy="88" rx="48" ry="12" />
    </svg>
);

// Island 2 - Two tall palms on flat island (top-center)
export const Island2 = ({ className = "", color = "currentColor" }) => (
    <svg viewBox="0 0 120 100" className={className} fill={color}>
        {/* Left palm fronds */}
        <path d="M35 42 C31 35 25 33 19 35 C25 36 30 39 33 42 Z" />
        <path d="M35 42 C29 33 21 29 13 32 C23 34 30 38 34 42 Z" />
        <path d="M36 42 C33 31 27 23 19 22 C27 27 33 35 36 42 Z" />
        <path d="M37 42 C41 31 47 23 55 22 C47 27 41 35 38 42 Z" />
        <path d="M38 42 C45 33 53 29 61 32 C51 34 43 38 39 42 Z" />
        <path d="M38 42 C43 35 49 33 55 35 C49 36 43 39 39 42 Z" />
        {/* Left trunk */}
        <path d="M34 42 Q36 62 37 85 Q39 62 37 42 Z" />
        {/* Right palm fronds */}
        <path d="M75 35 C71 28 65 26 59 28 C65 29 70 32 73 35 Z" />
        <path d="M75 35 C69 26 61 22 53 25 C63 27 70 31 74 35 Z" />
        <path d="M76 35 C73 24 67 16 59 15 C67 20 73 28 76 35 Z" />
        <path d="M77 35 C81 24 87 16 95 15 C87 20 81 28 78 35 Z" />
        <path d="M78 35 C85 26 93 22 101 25 C91 27 83 31 79 35 Z" />
        <path d="M78 35 C83 28 89 26 95 28 C89 29 83 32 79 35 Z" />
        {/* Right trunk */}
        <path d="M74 35 Q76 58 77 85 Q79 58 77 35 Z" />
        {/* Ground - irregular flat island */}
        <path d="M8 88 Q25 78 45 82 Q60 76 80 82 Q100 78 112 88 Q90 96 60 94 Q30 96 8 88 Z" />
    </svg>
);

// Island 3 - Palm with sun, mountain, and birds (top-right)
export const Island3 = ({ className = "", color = "currentColor" }) => (
    <svg viewBox="0 0 120 100" className={className} fill={color}>
        {/* Sun */}
        <circle cx="100" cy="18" r="14" />
        {/* Birds */}
        <path d="M58 38 Q62 32 66 38" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M70 45 Q74 39 78 45" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M50 48 Q54 42 58 48" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* Mountain */}
        <path d="M50 90 L78 40 L106 90 Z" />
        {/* Palm fronds */}
        <path d="M25 50 C21 43 15 41 9 43 C15 44 20 47 23 50 Z" />
        <path d="M25 50 C19 41 11 37 3 40 C13 42 20 46 24 50 Z" />
        <path d="M26 50 C23 39 17 31 9 30 C17 35 23 43 26 50 Z" />
        <path d="M27 50 C31 39 37 31 45 30 C37 35 31 43 28 50 Z" />
        <path d="M28 50 C35 41 43 37 51 40 C41 42 33 46 29 50 Z" />
        <path d="M28 50 C33 43 39 41 45 43 C39 44 33 47 29 50 Z" />
        {/* Trunk */}
        <path d="M24 50 Q26 68 27 85 Q29 68 27 50 Z" />
        {/* Ground */}
        <ellipse cx="50" cy="92" rx="45" ry="8" />
    </svg>
);

// Island 4 - Two palms on mound (middle-left)
export const Island4 = ({ className = "", color = "currentColor" }) => (
    <svg viewBox="0 0 120 100" className={className} fill={color}>
        {/* Left palm fronds */}
        <path d="M32 48 C28 41 22 39 16 41 C22 42 27 45 30 48 Z" />
        <path d="M32 48 C26 39 18 35 10 38 C20 40 27 44 31 48 Z" />
        <path d="M33 48 C30 37 24 29 16 28 C24 33 30 41 33 48 Z" />
        <path d="M34 48 C38 37 44 29 52 28 C44 33 38 41 35 48 Z" />
        <path d="M35 48 C42 39 50 35 58 38 C48 40 40 44 36 48 Z" />
        <path d="M35 48 C40 41 46 39 52 41 C46 42 40 45 36 48 Z" />
        {/* Left trunk */}
        <path d="M31 48 Q33 65 34 82 Q36 65 34 48 Z" />
        {/* Right palm fronds */}
        <path d="M72 42 C68 35 62 33 56 35 C62 36 67 39 70 42 Z" />
        <path d="M72 42 C66 33 58 29 50 32 C60 34 67 38 71 42 Z" />
        <path d="M73 42 C70 31 64 23 56 22 C64 27 70 35 73 42 Z" />
        <path d="M74 42 C78 31 84 23 92 22 C84 27 78 35 75 42 Z" />
        <path d="M75 42 C82 33 90 29 98 32 C88 34 80 38 76 42 Z" />
        <path d="M75 42 C80 35 86 33 92 35 C86 36 80 39 76 42 Z" />
        {/* Right trunk */}
        <path d="M71 42 Q73 62 74 82 Q76 62 74 42 Z" />
        {/* Ground mound */}
        <ellipse cx="55" cy="88" rx="45" ry="12" />
    </svg>
);

// Island 5 - Two palms different heights (middle-center)
export const Island5 = ({ className = "", color = "currentColor" }) => (
    <svg viewBox="0 0 120 100" className={className} fill={color}>
        {/* Left taller palm fronds */}
        <path d="M35 38 C31 31 25 29 19 31 C25 32 30 35 33 38 Z" />
        <path d="M35 38 C29 29 21 25 13 28 C23 30 30 34 34 38 Z" />
        <path d="M36 38 C33 27 27 19 19 18 C27 23 33 31 36 38 Z" />
        <path d="M37 38 C41 27 47 19 55 18 C47 23 41 31 38 38 Z" />
        <path d="M38 38 C45 29 53 25 61 28 C51 30 43 34 39 38 Z" />
        <path d="M38 38 C43 31 49 29 55 31 C49 32 43 35 39 38 Z" />
        {/* Left trunk */}
        <path d="M34 38 Q36 60 37 85 Q39 60 37 38 Z" />
        {/* Right shorter palm fronds */}
        <path d="M79 52 C76 47 72 45 67 46 C72 47 75 49 77 52 Z" />
        <path d="M79 52 C75 45 69 42 63 44 C70 46 75 49 78 52 Z" />
        <path d="M80 52 C78 44 73 38 67 37 C73 40 78 46 80 52 Z" />
        <path d="M81 52 C84 44 88 38 94 37 C88 40 83 46 81 52 Z" />
        <path d="M82 52 C87 45 93 42 99 44 C92 46 86 49 83 52 Z" />
        <path d="M82 52 C85 47 90 45 95 46 C90 47 86 49 83 52 Z" />
        {/* Right trunk */}
        <path d="M78 52 Q80 68 81 85 Q83 68 81 52 Z" />
        {/* Ground - flat irregular */}
        <path d="M8 88 Q25 78 45 82 Q60 76 80 82 Q100 78 112 88 Q90 96 60 94 Q30 96 8 88 Z" />
    </svg>
);

// Island 6 - Mountain with palm and sun (middle-right)
export const Island6 = ({ className = "", color = "currentColor" }) => (
    <svg viewBox="0 0 120 100" className={className} fill={color}>
        {/* Sun */}
        <circle cx="102" cy="18" r="12" />
        {/* Bird */}
        <path d="M78 32 Q82 26 86 32" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* Large mountain */}
        <path d="M18 90 L58 22 L98 90 Z" />
        {/* Small palm fronds */}
        <path d="M97 58 C95 53 91 52 87 53 C91 54 94 56 96 58 Z" />
        <path d="M97 58 C93 52 88 50 83 51 C89 53 94 56 97 58 Z" />
        <path d="M98 58 C96 51 92 46 87 45 C92 48 96 53 98 58 Z" />
        <path d="M99 58 C101 51 105 46 110 45 C105 48 101 53 99 58 Z" />
        <path d="M100 58 C104 52 109 50 114 51 C108 53 103 56 100 58 Z" />
        <path d="M100 58 C102 53 106 52 110 53 C106 54 103 56 100 58 Z" />
        {/* Trunk */}
        <path d="M96 58 Q98 72 99 88 Q101 72 99 58 Z" />
        {/* Ground */}
        <ellipse cx="58" cy="92" rx="52" ry="8" />
    </svg>
);

// Island 7 - Three palms with signposts (bottom-left)
export const Island7 = ({ className = "", color = "currentColor" }) => (
    <svg viewBox="0 0 120 100" className={className} fill={color}>
        {/* Left small palm fronds */}
        <path d="M20 55 C18 50 14 49 10 50 C14 51 17 53 19 55 Z" />
        <path d="M20 55 C17 49 12 47 7 48 C12 50 17 53 19 55 Z" />
        <path d="M21 55 C19 48 15 43 10 42 C15 45 19 50 21 55 Z" />
        <path d="M22 55 C24 48 28 43 33 42 C28 45 24 50 22 55 Z" />
        <path d="M23 55 C26 49 31 47 36 48 C31 50 26 53 24 55 Z" />
        <path d="M23 55 C25 50 29 49 33 50 C29 51 26 53 24 55 Z" />
        {/* Left trunk */}
        <path d="M19 55 Q20 70 21 82 Q23 70 21 55 Z" />
        {/* Center tall palm fronds */}
        <path d="M52 38 C48 31 42 29 36 31 C42 32 47 35 50 38 Z" />
        <path d="M52 38 C46 29 38 25 30 28 C40 30 47 34 51 38 Z" />
        <path d="M53 38 C50 27 44 19 36 18 C44 23 50 31 53 38 Z" />
        <path d="M54 38 C58 27 64 19 72 18 C64 23 58 31 55 38 Z" />
        <path d="M55 38 C62 29 70 25 78 28 C68 30 60 34 56 38 Z" />
        <path d="M55 38 C60 31 66 29 72 31 C66 32 60 35 56 38 Z" />
        {/* Center trunk */}
        <path d="M51 38 Q53 60 54 82 Q56 60 54 38 Z" />
        {/* Right small palm fronds */}
        <path d="M90 55 C88 50 84 49 80 50 C84 51 87 53 89 55 Z" />
        <path d="M90 55 C87 49 82 47 77 48 C82 50 87 53 89 55 Z" />
        <path d="M91 55 C89 48 85 43 80 42 C85 45 89 50 91 55 Z" />
        <path d="M92 55 C94 48 98 43 103 42 C98 45 94 50 92 55 Z" />
        <path d="M93 55 C96 49 101 47 106 48 C101 50 96 53 94 55 Z" />
        <path d="M93 55 C95 50 99 49 103 50 C99 51 96 53 94 55 Z" />
        {/* Right trunk */}
        <path d="M89 55 Q90 70 91 82 Q93 70 91 55 Z" />
        {/* Signpost left */}
        <rect x="35" y="68" width="3" height="18" />
        <rect x="28" y="70" width="10" height="5" />
        {/* Signpost right */}
        <rect x="72" y="66" width="3" height="20" />
        <rect x="65" y="68" width="10" height="5" />
        {/* Ground mound */}
        <ellipse cx="58" cy="90" rx="50" ry="12" />
    </svg>
);

// Island 8 - Palm with rock/mountain and birds (bottom-center)
export const Island8 = ({ className = "", color = "currentColor" }) => (
    <svg viewBox="0 0 120 100" className={className} fill={color}>
        {/* Birds */}
        <path d="M48 28 Q52 22 56 28" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M60 35 Q64 29 68 35" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* Left palm fronds */}
        <path d="M25 50 C21 43 15 41 9 43 C15 44 20 47 23 50 Z" />
        <path d="M25 50 C19 41 11 37 3 40 C13 42 20 46 24 50 Z" />
        <path d="M26 50 C23 39 17 31 9 30 C17 35 23 43 26 50 Z" />
        <path d="M27 50 C31 39 37 31 45 30 C37 35 31 43 28 50 Z" />
        <path d="M28 50 C35 41 43 37 51 40 C41 42 33 46 29 50 Z" />
        <path d="M28 50 C33 43 39 41 45 43 C39 44 33 47 29 50 Z" />
        {/* Left trunk */}
        <path d="M24 50 Q26 68 27 85 Q29 68 27 50 Z" />
        {/* Rock/Mountain in center */}
        <path d="M50 90 Q55 60 72 52 Q89 60 94 90 Z" />
        {/* Right small palm fronds */}
        <path d="M97 58 C95 53 91 52 87 53 C91 54 94 56 96 58 Z" />
        <path d="M97 58 C93 52 88 50 83 51 C89 53 94 56 97 58 Z" />
        <path d="M98 58 C96 51 92 46 87 45 C92 48 96 53 98 58 Z" />
        <path d="M99 58 C101 51 105 46 110 45 C105 48 101 53 99 58 Z" />
        <path d="M100 58 C104 52 109 50 114 51 C108 53 103 56 100 58 Z" />
        <path d="M100 58 C102 53 106 52 110 53 C106 54 103 56 100 58 Z" />
        {/* Right trunk */}
        <path d="M96 58 Q98 72 99 88 Q101 72 99 58 Z" />
        {/* Ground */}
        <ellipse cx="60" cy="92" rx="52" ry="8" />
    </svg>
);

// Island 9 - Three palms with sun and grass (bottom-right)
export const Island9 = ({ className = "", color = "currentColor" }) => (
    <svg viewBox="0 0 120 100" className={className} fill={color}>
        {/* Sun */}
        <circle cx="102" cy="18" r="12" />
        {/* Left small palm fronds */}
        <path d="M20 55 C18 50 14 49 10 50 C14 51 17 53 19 55 Z" />
        <path d="M20 55 C17 49 12 47 7 48 C12 50 17 53 19 55 Z" />
        <path d="M21 55 C19 48 15 43 10 42 C15 45 19 50 21 55 Z" />
        <path d="M22 55 C24 48 28 43 33 42 C28 45 24 50 22 55 Z" />
        <path d="M23 55 C26 49 31 47 36 48 C31 50 26 53 24 55 Z" />
        <path d="M23 55 C25 50 29 49 33 50 C29 51 26 53 24 55 Z" />
        {/* Left trunk */}
        <path d="M19 55 Q20 70 21 85 Q23 70 21 55 Z" />
        {/* Center taller palm fronds */}
        <path d="M52 38 C48 31 42 29 36 31 C42 32 47 35 50 38 Z" />
        <path d="M52 38 C46 29 38 25 30 28 C40 30 47 34 51 38 Z" />
        <path d="M53 38 C50 27 44 19 36 18 C44 23 50 31 53 38 Z" />
        <path d="M54 38 C58 27 64 19 72 18 C64 23 58 31 55 38 Z" />
        <path d="M55 38 C62 29 70 25 78 28 C68 30 60 34 56 38 Z" />
        <path d="M55 38 C60 31 66 29 72 31 C66 32 60 35 56 38 Z" />
        {/* Center trunk */}
        <path d="M51 38 Q53 60 54 85 Q56 60 54 38 Z" />
        {/* Right palm fronds */}
        <path d="M85 50 C82 44 77 43 72 44 C77 45 81 48 84 50 Z" />
        <path d="M85 50 C81 43 75 40 69 42 C76 44 81 47 84 50 Z" />
        <path d="M86 50 C84 42 79 36 73 35 C79 38 84 44 86 50 Z" />
        <path d="M87 50 C90 42 94 36 100 35 C94 38 89 44 87 50 Z" />
        <path d="M88 50 C92 43 98 40 104 42 C97 44 92 47 89 50 Z" />
        <path d="M88 50 C91 44 96 43 101 44 C96 45 92 48 89 50 Z" />
        {/* Right trunk */}
        <path d="M84 50 Q86 68 87 85 Q89 68 87 50 Z" />
        {/* Ground with grass texture */}
        <ellipse cx="55" cy="90" rx="50" ry="12" />
        {/* Small grass tufts */}
        <path d="M30 87 L32 82 L34 87 Z" />
        <path d="M48 86 L50 81 L52 86 Z" />
        <path d="M68 86 L70 81 L72 86 Z" />
        <path d="M85 87 L87 82 L89 87 Z" />
    </svg>
);

// Export all islands as an array for easy iteration
export const AllIslands = [Island1, Island2, Island3, Island4, Island5, Island6, Island7, Island8, Island9];

export default { Island1, Island2, Island3, Island4, Island5, Island6, Island7, Island8, Island9, AllIslands };