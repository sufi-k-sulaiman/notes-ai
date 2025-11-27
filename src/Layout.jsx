import React, { useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LOGO_URL } from '@/components/NavigationConfig';

export default function Layout({ children, currentPageName }) {
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = LOGO_URL;
    
    // Also set apple-touch-icon
    let appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.getElementsByTagName('head')[0].appendChild(appleLink);
    }
    appleLink.href = LOGO_URL;
  }, []);

  return (
    <PageLayout activePage={currentPageName}>
      <ErrorBoundary fallbackMessage="There was an error loading this page.">
      <style>{`
        /* Classic UI Style - links instead of buttons */
        [data-ui-style="classic"] button:not([data-keep-button]) {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: #7c3aed !important;
          text-decoration: underline !important;
          padding: 0.25rem 0.5rem !important;
        }
        [data-ui-style="classic"] button:hover:not([data-keep-button]) {
          color: #5b21b6 !important;
        }
        
        /* Square UI Style */
        [data-ui-style="square"] * {
          border-radius: 0 !important;
        }
        
        /* Reader cognitive mode - minimal styling */
        [data-cognitive="reader"] {
          max-width: 800px;
          margin: 0 auto;
        }
        [data-cognitive="reader"] * {
          background-image: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
        [data-cognitive="reader"] .bg-gradient-to-br,
        [data-cognitive="reader"] .bg-gradient-to-r {
          background: #f9fafb !important;
        }
      `}</style>
      {children}
      </ErrorBoundary>
    </PageLayout>
  );
}