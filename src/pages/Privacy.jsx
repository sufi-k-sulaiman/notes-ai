import React, { useEffect } from 'react';
import { Shield, Lock, Eye, Database, UserCheck, FileText, Brain, Globe, AlertTriangle } from 'lucide-react';

export default function Privacy() {
    useEffect(() => {
        document.title = 'Privacy Policy - 1cPublishing';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Learn how 1cPublishing collects, uses, and protects your personal information.');
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                    <p className="text-gray-600">Effective Date: December 5, 2025</p>
                    <p className="text-gray-500 text-sm mt-2">For 1cpublishing.com, Neural Mindmap, and Other Apps</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-8">
                    <section className="bg-purple-50 -m-8 p-8 mb-8">
                        <p className="text-gray-700 leading-relaxed text-lg">
                            <strong>1c Publishing Inc.</strong> and its subsidiaries (collectively "1c Publishing," "we," or "us") are committed 
                            to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information 
                            when you use our services.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            This policy applies to <strong>1cpublishing.com</strong>, the <strong>Neural Mindmap app</strong>, and all related 
                            digital platforms.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">What This Policy Covers</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-2">Neural Mindmap App Users</h3>
                                <p className="text-sm text-gray-700">Data from content creation, account activity, and app interactions</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-2">Website Visitors</h3>
                                <p className="text-sm text-gray-700">Data collected when browsing 1cpublishing.com</p>
                            </div>
                        </div>
                        <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
                            <p className="text-sm text-gray-700">
                                <strong>Important:</strong> Sharing personal information is optional, but some features may be limited without it.
                            </p>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Agreement to Terms</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            By using our services, you agree to:
                        </p>
                        <div className="space-y-3">
                            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">✓</div>
                                <div>
                                    <strong className="text-gray-900">Acceptable Use</strong>
                                    <p className="text-sm text-gray-700 mt-1">Use our platforms lawfully and responsibly</p>
                                </div>
                            </div>
                            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">✓</div>
                                <div>
                                    <strong className="text-gray-900">Intellectual Property</strong>
                                    <p className="text-sm text-gray-700 mt-1">Respect our copyrights and trademarks</p>
                                </div>
                            </div>
                            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">✓</div>
                                <div>
                                    <strong className="text-gray-900">Policy Updates</strong>
                                    <p className="text-sm text-gray-700 mt-1">Review terms periodically as we may update them</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We collect only what's necessary to deliver and improve our services:
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-purple-50">
                                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Category</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Examples of Data Collected</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Purpose of Collection</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">App Usage Data</td>
                                        <td className="border border-gray-300 px-4 py-2 text-gray-700">Device type, operating system, crash logs, interaction data</td>
                                        <td className="border border-gray-300 px-4 py-2 text-gray-700">To maintain, analyze, and improve the Neural Mindmap App's performance</td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">User Account/Identifiers</td>
                                        <td className="border border-gray-300 px-4 py-2 text-gray-700">Email address, username, password (hashed), subscription status</td>
                                        <td className="border border-gray-300 px-4 py-2 text-gray-700">To create and manage your account and authenticate users</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">Mindmap Content</td>
                                        <td className="border border-gray-300 px-4 py-2 text-gray-700">Text, images, and structure of mindmaps created within the App</td>
                                        <td className="border border-gray-300 px-4 py-2 text-gray-700">To provide core functionality (saving and displaying your mindmaps)</td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">Transactional Data</td>
                                        <td className="border border-gray-300 px-4 py-2 text-gray-700">Billing information, payment history</td>
                                        <td className="border border-gray-300 px-4 py-2 text-gray-700">To process payments for subscriptions or premium features</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">Communications Data</td>
                                        <td className="border border-gray-300 px-4 py-2 text-gray-700">Information from customer support inquiries or feedback</td>
                                        <td className="border border-gray-300 px-4 py-2 text-gray-700">To respond to requests, provide support, and improve services</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <strong className="text-green-800">🔒 Security:</strong> All data is collected through encrypted connections and secure protocols.
                            </p>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">2. How We Protect Your Data</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Data Anonymization</h3>
                                <p className="text-gray-700 text-sm">We use aggregated, non-identifiable data for analysis and improvements</p>
                            </div>
                            <div className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Content Privacy</h3>
                                <p className="text-gray-700 text-sm">Your mindmap content is strictly confidential and never shared without your explicit consent</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <UserCheck className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">3. Sharing with Third Parties</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We share data only with trusted service providers who help us operate our platform:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Our Requirements</h3>
                                <p className="text-sm text-gray-700">All vendors must sign confidentiality agreements and meet our privacy standards</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Your Content</h3>
                                <p className="text-sm text-gray-700">Never shared for marketing or research without your explicit permission</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">4. Where We Store Your Data</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-blue-600" />
                                    Secure Storage
                                </h3>
                                <p className="text-sm text-gray-700">All data is encrypted in transit and at rest using industry-standard protocols</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-600" />
                                    International Transfers
                                </h3>
                                <p className="text-sm text-gray-700">Data may be stored in the US or other regions. We comply with GDPR, CCPA, and international privacy laws</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <UserCheck className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">5. Your Privacy Rights</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            You have complete control over your personal data:
                        </p>
                        <div className="grid md:grid-cols-3 gap-3">
                            <div className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                                <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-gray-900 text-sm">Access</h3>
                                <p className="text-xs text-gray-700 mt-1">View your data anytime</p>
                            </div>
                            <div className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                                <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-gray-900 text-sm">Correct</h3>
                                <p className="text-xs text-gray-700 mt-1">Update inaccurate info</p>
                            </div>
                            <div className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-gray-900 text-sm">Delete</h3>
                                <p className="text-xs text-gray-700 mt-1">Remove your data</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-4 text-center">Contact us to exercise any of these rights</p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Brain className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">6. AI and Machine Learning</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Our AI features enhance your experience while protecting your privacy:
                        </p>
                        <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                            <div className="flex gap-4 mb-3">
                                <Brain className="w-10 h-10 text-indigo-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Ethical AI Practices</h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-indigo-600 flex-shrink-0">•</span>
                                            <span>AI processing is used solely to improve app functionality</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-indigo-600 flex-shrink-0">•</span>
                                            <span>Your private content never trains public AI models</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-indigo-600 flex-shrink-0">•</span>
                                            <span>We prevent biased outcomes and maintain fairness</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">7. Security Measures</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-green-600" />
                                    Our Protection
                                </h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li>✓ End-to-end encryption</li>
                                    <li>✓ Advanced firewalls</li>
                                    <li>✓ Secure access controls</li>
                                    <li>✓ Regular security audits</li>
                                </ul>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                    Your Role
                                </h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li>✓ Use strong, unique passwords</li>
                                    <li>✓ Enable two-factor authentication</li>
                                    <li>✓ Keep credentials private</li>
                                    <li>✓ Report suspicious activity</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">8. Data Breach Response</h2>
                        </div>
                        <div className="p-5 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-gray-700 leading-relaxed mb-3">
                                While we work hard to prevent breaches, we're prepared to respond immediately if one occurs:
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-red-200">Immediate Containment</span>
                                <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-red-200">User Notification</span>
                                <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-red-200">Authority Collaboration</span>
                                <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-red-200">Prevention Measures</span>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">9. Children's Privacy</h2>
                        </div>
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                            <p className="text-gray-700 leading-relaxed">
                                Our services are not intended for children under 13. We do not knowingly collect data from children. 
                                If you believe a child has provided us information, <strong>contact us immediately</strong> and we'll delete it promptly.
                            </p>
                        </div>
                    </section>

                    <section className="pt-6 border-t-2 border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">10. Questions or Concerns?</h2>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                            <p className="text-gray-700 leading-relaxed mb-3">
                                We're here to help with any privacy questions or concerns:
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email us at</p>
                                    <a href="mailto:privacy@1cpublishing.com" className="text-xl font-bold text-purple-600 hover:text-purple-700">
                                        privacy@1cpublishing.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">11. Policy Updates</h2>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-700 leading-relaxed">
                                We may update this policy periodically. Check this page regularly for changes. Major updates will be communicated 
                                through email or app notifications.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}