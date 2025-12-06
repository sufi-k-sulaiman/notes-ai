import React, { useEffect } from 'react';
import { Shield, Eye, Lock, Database, UserCheck, AlertCircle } from 'lucide-react';

export default function PrivacyPolicy() {
    useEffect(() => {
        document.title = 'Privacy Policy - 1cPublishing';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Learn how 1cPublishing protects your privacy and handles your data.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'privacy policy, data protection, user privacy');
    }, []);

    const sections = [
        {
            icon: Database,
            title: "Information We Collect",
            content: "We collect information you provide directly to us, including your name, email address, and any other information you choose to provide. We also automatically collect certain information about your device and how you interact with our services."
        },
        {
            icon: Eye,
            title: "How We Use Your Information",
            content: "We use the information we collect to provide, maintain, and improve our services, to communicate with you, to monitor and analyze trends and usage, and to personalize your experience with our AI-powered tools."
        },
        {
            icon: Lock,
            title: "Data Security",
            content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is encrypted both in transit and at rest."
        },
        {
            icon: UserCheck,
            title: "Your Rights",
            content: "You have the right to access, correct, or delete your personal information. You can also object to or restrict certain processing of your data. Contact us to exercise these rights."
        },
        {
            icon: AlertCircle,
            title: "Third-Party Services",
            content: "We may use third-party service providers to help us operate our business. These providers have access to your information only to perform specific tasks on our behalf and are obligated to protect your information."
        },
        {
            icon: Shield,
            title: "Updates to This Policy",
            content: "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the 'Last Updated' date."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                    <p className="text-lg text-gray-600">
                        Your privacy is important to us. This policy explains how we collect, use, and protect your information.
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                        Last Updated: December 6, 2025
                    </p>
                </div>

                {/* Introduction */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Welcome to 1cPublishing. We are committed to protecting your personal information and your right to privacy. 
                        This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        By using our AI-powered platform, you agree to the collection and use of information in accordance with this policy. 
                        If you have any questions or concerns about our policy or our practices with regards to your personal information, please contact us.
                    </p>
                </div>

                {/* Policy Sections */}
                <div className="space-y-6 mb-8">
                    {sections.map((section, index) => (
                        <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <section.icon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h3>
                                    <p className="text-gray-700 leading-relaxed">{section.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        If you have any questions about this Privacy Policy or our data practices, please don't hesitate to contact us:
                    </p>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Email:</strong> privacy@1cpublishing.com</p>
                        <p><strong>Address:</strong> 1 Barbados Ave, Tampa, FL 33606, USA</p>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>© 2025 1cPublishing. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}