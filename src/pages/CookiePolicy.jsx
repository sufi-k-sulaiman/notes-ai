import React from 'react';
import { Cookie, Shield, Settings, Target, Users, Mail, Calendar } from 'lucide-react';

export default function CookiePolicy() {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                            <Cookie className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Cookie Policy</h1>
                            <p className="text-white/80">Our cookie policy</p>
                        </div>
                    </div>
                </div>

                {/* Introduction */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
                    <p className="text-gray-700 leading-relaxed mb-4">
                        At <strong>1cPublishing</strong>, cookies play a vital role in enhancing your browsing experience and improving the functionality of our platform. These small text files stored on your device help us analyze user behavior, remember your preferences, and deliver personalized content tailored to your interests.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        By utilizing cookies, we ensure optimal usability while continuously refining our services based on valuable insights from user interactions. As part of your interaction with 1cPublishing, consenting to the use of cookies allows us to provide seamless and efficient access to our features.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        You have the freedom to manage cookie settings through your browser or opt-out of certain third-party cookies to customize your browsing preferences. However, please note that disabling cookies may impact certain functionalities and overall experience with 1cPublishing.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        To learn more about how we use cookies and your options for managing them, refer to our Cookie Consent Policy below. If you have further questions, feel free to contact us at <a href="mailto:help@1cPublishing.com" className="text-purple-600 hover:underline">help@1cPublishing.com</a>.
                    </p>
                </div>

                {/* Cookie Consent Policy */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Cookie Consent Policy</h2>
                    </div>

                    <div className="flex items-center gap-2 mb-6 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm"><strong>Effective Date:</strong> March 25, 2025</span>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-8">
                        At 1cPublishing, we use cookies to improve your experience, analyze usage patterns, and provide relevant content. This Cookie Consent Policy explains what cookies are, how we use them, and your choices regarding their usage. By accessing or using 1cPublishing, you agree to the use of cookies as described in this policy.
                    </p>

                    {/* What Are Cookies */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Cookie className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">What Are Cookies?</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Cookies are small text files placed on your device by websites you visit. They help the site recognize your device and remember information about your visit.
                        </p>
                    </div>

                    {/* How We Use Cookies */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <Settings className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">How We Use Cookies</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">1cPublishing may use cookies for the following purposes:</p>
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="font-semibold text-gray-800">Essential Cookies</p>
                                <p className="text-gray-600 text-sm">To enable core functionality such as logging in, page navigation, and access to secure areas.</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="font-semibold text-gray-800">Performance Cookies</p>
                                <p className="text-gray-600 text-sm">To analyze user activity and improve the website.</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="font-semibold text-gray-800">Functional Cookies</p>
                                <p className="text-gray-600 text-sm">To remember your preferences and settings for a personalized experience.</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="font-semibold text-gray-800">Targeting/Advertising Cookies</p>
                                <p className="text-gray-600 text-sm">To deliver tailored content and ads based on your interests.</p>
                            </div>
                        </div>
                    </div>

                    {/* Third-Party Cookies */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Third-Party Cookies</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            We may also use third-party cookies to help us understand how you interact with our services, enhance functionality, or provide tailored advertisements. These cookies are governed by the respective third-party privacy policies.
                        </p>
                    </div>

                    {/* Your Choices */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <Target className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Your Choices</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-3">You can control and manage cookies in several ways:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600">
                            <li>Adjust settings in your web browser to block or delete cookies.</li>
                            <li>Opt out of certain third-party cookies by visiting their opt-out pages.</li>
                        </ul>
                        <p className="text-gray-600 mt-3 italic">Please note that disabling cookies may impact your experience with 1cPublishing.</p>
                    </div>

                    {/* Contact Us */}
                    <div className="p-6 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <Mail className="w-5 h-5 text-purple-600" />
                            <h3 className="text-lg font-bold text-gray-900">Contact Us</h3>
                        </div>
                        <p className="text-gray-600">
                            If you have any questions about our Cookie Consent Policy, feel free to reach out to us at{' '}
                            <a href="mailto:help@1cPublishing.com" className="text-purple-600 hover:underline font-medium">help@1cPublishing.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}