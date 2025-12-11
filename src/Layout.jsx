import React, { useEffect } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Layout({ children }) {
    useEffect(() => {
        // iOS and macOS viewport and PWA setup
        const metaTags = [
            { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
            { name: 'mobile-web-app-capable', content: 'yes' },
            { name: 'format-detection', content: 'telephone=no' }
        ];

        metaTags.forEach(({ name, content }) => {
            let meta = document.querySelector(`meta[name="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = name;
                document.head.appendChild(meta);
            }
            meta.content = content;
        });

        // Prevent rubber band scrolling
        document.body.style.overscrollBehavior = 'none';
        
        // macOS fullscreen support
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        if (isMac && window.matchMedia('(display-mode: standalone)').matches) {
            document.documentElement.style.height = '100vh';
            document.body.style.height = '100vh';
        }
    }, []);

    return (
        <ErrorBoundary fallbackMessage="There was an error loading this page.">
            <style>{`
                /* iOS and macOS Safe Area Support */
                :root {
                    --safe-area-inset-top: env(safe-area-inset-top);
                    --safe-area-inset-bottom: env(safe-area-inset-bottom);
                    --safe-area-inset-left: env(safe-area-inset-left);
                    --safe-area-inset-right: env(safe-area-inset-right);
                }
                
                /* Prevent zoom on input focus */
                input, textarea, select {
                    font-size: 16px !important;
                }
                
                /* Smooth scrolling */
                * {
                    -webkit-overflow-scrolling: touch;
                }
                
                /* Prevent text size adjustment */
                html {
                    -webkit-text-size-adjust: 100%;
                }
                
                /* macOS fullscreen PWA support */
                @media (display-mode: standalone) {
                    html, body {
                        height: 100vh;
                        overflow: hidden;
                    }
                }
            `}</style>
            {children}
        </ErrorBoundary>
    );
}