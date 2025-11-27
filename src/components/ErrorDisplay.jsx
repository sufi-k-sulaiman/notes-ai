import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, ServerCrash, Clock, Ban, HelpCircle, FileQuestion, Database, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Error codes and their configurations
export const ERROR_CODES = {
    // Network errors (1xx)
    E100: { code: 'E100', title: 'Network Error', message: 'Unable to connect to the server. Please check your internet connection.', icon: WifiOff, color: 'red' },
    E101: { code: 'E101', title: 'Request Timeout', message: 'The request took too long to complete. Please try again.', icon: Clock, color: 'orange' },
    E102: { code: 'E102', title: 'Service Unavailable', message: 'The service is temporarily unavailable. Please try again later.', icon: ServerCrash, color: 'red' },
    
    // Data errors (2xx)
    E200: { code: 'E200', title: 'Data Load Failed', message: 'Unable to load the requested data. Please refresh the page.', icon: Database, color: 'amber' },
    E201: { code: 'E201', title: 'No Data Found', message: 'No data available for the selected criteria.', icon: FileQuestion, color: 'gray' },
    E202: { code: 'E202', title: 'Invalid Data', message: 'The received data is in an unexpected format.', icon: AlertTriangle, color: 'yellow' },
    
    // AI/Integration errors (3xx)
    E300: { code: 'E300', title: 'AI Service Error', message: 'The AI service encountered an error. Please try again.', icon: Zap, color: 'purple' },
    E301: { code: 'E301', title: 'Integration Failed', message: 'Failed to connect to external service. Please try again.', icon: ServerCrash, color: 'blue' },
    E302: { code: 'E302', title: 'Rate Limited', message: 'Too many requests. Please wait a moment before trying again.', icon: Ban, color: 'orange' },
    
    // Auth errors (4xx)
    E400: { code: 'E400', title: 'Authentication Required', message: 'Please sign in to access this feature.', icon: Ban, color: 'red' },
    E401: { code: 'E401', title: 'Session Expired', message: 'Your session has expired. Please sign in again.', icon: Clock, color: 'orange' },
    E402: { code: 'E402', title: 'Permission Denied', message: 'You do not have permission to access this resource.', icon: Ban, color: 'red' },
    
    // General errors (5xx)
    E500: { code: 'E500', title: 'Something Went Wrong', message: 'An unexpected error occurred. Please try again.', icon: AlertTriangle, color: 'red' },
    E501: { code: 'E501', title: 'Feature Unavailable', message: 'This feature is currently unavailable.', icon: HelpCircle, color: 'gray' },
};

// Helper to determine error code from error object
export const getErrorCode = (error) => {
    if (!error) return 'E500';
    
    const message = error.message?.toLowerCase() || '';
    const status = error.response?.status || error.status;
    
    // Network errors
    if (message.includes('network') || message.includes('fetch')) return 'E100';
    if (message.includes('timeout')) return 'E101';
    if (status === 503) return 'E102';
    
    // Auth errors
    if (status === 401) return 'E400';
    if (status === 403) return 'E402';
    
    // Rate limiting
    if (status === 429) return 'E302';
    
    // AI/Integration errors
    if (message.includes('llm') || message.includes('ai')) return 'E300';
    if (message.includes('integration')) return 'E301';
    
    // Data errors
    if (message.includes('no data') || message.includes('not found')) return 'E201';
    if (message.includes('invalid') || message.includes('parse')) return 'E202';
    
    return 'E500';
};

const colorClasses = {
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    amber: 'bg-amber-100 text-amber-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    gray: 'bg-gray-100 text-gray-600',
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
};

export default function ErrorDisplay({ 
    errorCode = 'E500', 
    customMessage,
    onRetry,
    showCode = true,
    size = 'default' // 'compact', 'default', 'large'
}) {
    const errorConfig = ERROR_CODES[errorCode] || ERROR_CODES.E500;
    const IconComponent = errorConfig.icon;
    
    if (size === 'compact') {
        return (
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[errorConfig.color]}`}>
                    <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{errorConfig.title}</p>
                    <p className="text-xs text-gray-500">{customMessage || errorConfig.message}</p>
                </div>
                {onRetry && (
                    <Button variant="ghost" size="sm" onClick={onRetry} className="gap-1">
                        <RefreshCw className="w-3 h-3" /> Retry
                    </Button>
                )}
            </div>
        );
    }
    
    return (
        <div className={`flex items-center justify-center ${size === 'large' ? 'min-h-[400px]' : 'py-12'}`}>
            <div className="text-center max-w-md px-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${colorClasses[errorConfig.color]}`}>
                    <IconComponent className={`${size === 'large' ? 'w-8 h-8' : 'w-6 h-6'}`} />
                </div>
                <h2 className={`font-bold text-gray-900 mb-2 ${size === 'large' ? 'text-2xl' : 'text-xl'}`}>
                    {errorConfig.title}
                </h2>
                <p className="text-gray-600 mb-4">
                    {customMessage || errorConfig.message}
                </p>
                {showCode && (
                    <p className="text-xs text-gray-400 mb-4">
                        Error Code: {errorConfig.code}
                    </p>
                )}
                {onRetry && (
                    <Button onClick={onRetry} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                )}
            </div>
        </div>
    );
}

// Loading state component for consistency
export function LoadingState({ message = 'Loading...', size = 'default' }) {
    return (
        <div className={`flex flex-col items-center justify-center ${size === 'large' ? 'min-h-[400px]' : 'py-12'}`}>
            <style>{`
                @keyframes logoPulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
            `}</style>
            <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/622024f26_image-loading-logo.png" 
                alt="Loading" 
                className="w-12 h-12 object-contain mb-4 grayscale"
                style={{ animation: 'logoPulse 1.5s ease-in-out infinite' }}
            />
            <p className="text-gray-600">{message}</p>
        </div>
    );
}

// Empty state component
export function EmptyState({ 
    icon: IconComponent = FileQuestion, 
    title = 'No Data', 
    message = 'No data available',
    action,
    actionLabel = 'Get Started'
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <IconComponent className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-500 text-center max-w-sm mb-4">{message}</p>
            {action && (
                <Button onClick={action}>{actionLabel}</Button>
            )}
        </div>
    );
}