import React from 'react';
import { Cookie } from 'lucide-react';

export default function CookiePolicy() {
    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Cookie className="w-8 h-8 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">Cookie Policy</h1>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <p className="text-gray-600">
                    This website uses cookies to enhance your browsing experience and provide personalized services.
                </p>
                <h3 className="font-semibold text-gray-900">What are cookies?</h3>
                <p className="text-gray-600 text-sm">
                    Cookies are small text files stored on your device that help us remember your preferences and improve our services.
                </p>
                <h3 className="font-semibold text-gray-900">How we use cookies</h3>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    <li>Essential cookies for site functionality</li>
                    <li>Analytics cookies to understand usage</li>
                    <li>Preference cookies to remember your settings</li>
                </ul>
            </div>
        </div>
    );
}