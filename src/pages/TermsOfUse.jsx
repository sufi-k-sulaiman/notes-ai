import React from 'react';
import { FileText } from 'lucide-react';

export default function TermsOfUse() {
    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">Terms of Use</h1>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <p className="text-gray-600">
                    By accessing and using this platform, you agree to be bound by these Terms of Use.
                </p>
                <h3 className="font-semibold text-gray-900">Acceptable Use</h3>
                <p className="text-gray-600 text-sm">
                    You agree to use this platform only for lawful purposes and in accordance with these terms.
                </p>
                <h3 className="font-semibold text-gray-900">Intellectual Property</h3>
                <p className="text-gray-600 text-sm">
                    All content on this platform is protected by copyright and other intellectual property laws.
                </p>
                <h3 className="font-semibold text-gray-900">Limitation of Liability</h3>
                <p className="text-gray-600 text-sm">
                    We shall not be liable for any indirect, incidental, or consequential damages arising from your use of this platform.
                </p>
            </div>
        </div>
    );
}