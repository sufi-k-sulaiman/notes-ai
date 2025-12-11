import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Layout({ children }) {
    return (
        <ErrorBoundary fallbackMessage="There was an error loading this page.">
            {children}
        </ErrorBoundary>
    );
}