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
                    <section>
                        <p className="text-gray-700 leading-relaxed">
                            We, <strong>1c Publishing Inc.</strong>, and its subsidiaries and affiliates (collectively, "1c Publishing," "us," or "we"), 
                            understand that your privacy is essential to you. We are deeply committed to respecting your privacy and safeguarding 
                            your personal data, particularly in connection with your use of the Neural Mindmap app.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            This Privacy Policy outlines how we collect, handle, and protect your personal information when obtained through 
                            1c Publishing's websites, including <strong>1cpublishing.com</strong>, the <strong>Neural Mindmap app</strong>, and 
                            other digital platforms (collectively, our "Sites" and "App").
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Scope of this Privacy Policy</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            This policy applies to data collected when you interact with our Sites and App:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li><strong>Neural Mindmap App Users:</strong> This policy specifically covers data related to your use of the Neural Mindmap 
                            application, including content creation, account usage, and interactions within the app.</li>
                            <li><strong>Website Visitors:</strong> This policy covers data collected when you visit 1cpublishing.com.</li>
                        </ul>
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <strong>Note:</strong> You are not required to share your personal information with us, but withholding it may result 
                                in limitations in how we deliver our full suite of services or optimize your experience with the Neural Mindmap app, 
                                websites, or newsletters.
                            </p>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Terms of Use</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            By accessing and using 1c Publishing's websites, the Neural Mindmap app, and services, you agree to the following terms:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li><strong>Acceptable Use:</strong> You agree not to use 1c Publishing's platforms or services in any unlawful or harmful manner.</li>
                            <li><strong>Intellectual Property:</strong> All content, tools, and resources, including the Neural Mindmap App, are the 
                            intellectual property of 1c Publishing and may not be copied, distributed, or modified without permission.</li>
                            <li><strong>Modifications:</strong> 1c Publishing reserves the right to update these terms at any time. Notifications of major 
                            changes will be provided, but we encourage regular review of our terms for updates.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">1. Data Collection and Usage Practices</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We ensure transparency in our data collection practices by clearly outlining the types of data we gather to provide and 
                            improve the Neural Mindmap App and our services. We collect only the data necessary for these purposes.
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
                        <p className="text-gray-700 leading-relaxed mt-4">
                            <strong>Secure Methods:</strong> We employ secure methods to collect data, including encrypted connections and secure data 
                            transfer protocols, ensuring your information is protected.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">2. Data Anonymization and Protection</h2>
                        </div>
                        <ul className="list-disc list-inside text-gray-700 space-y-3 ml-4">
                            <li><strong>Anonymization:</strong> To protect user identities, we employ robust data anonymization techniques, such as 
                            using aggregated, non-personally identifiable data for analysis and research purposes.</li>
                            <li><strong>Content Confidentiality:</strong> Mindmap content created within the Neural Mindmap App is considered highly 
                            confidential. We do not scan, share, or use this content for any purpose other than providing the service and supporting 
                            your access to it, unless you explicitly choose to share it.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <UserCheck className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">3. Third-Party Data Sharing</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            We maintain strict policies on third-party data sharing. Data is only shared with trusted partners (e.g., cloud storage 
                            providers, analytics services) for the purpose of operating and improving the Neural Mindmap App and our Sites.
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li><strong>Vendor Requirements:</strong> We require all third parties to adhere to the same privacy standards and sign 
                            confidentiality agreements.</li>
                            <li><strong>Mindmap Content:</strong> Your specific mindmap content is never shared with external entities for marketing 
                            or research purposes without your explicit consent.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">4. Data Storage and Transfers</h2>
                        </div>
                        <ul className="list-disc list-inside text-gray-700 space-y-3 ml-4">
                            <li><strong>Storage Policies:</strong> We use secure cloud storage solutions to store user data, ensuring that data is 
                            encrypted both in transit and at rest.</li>
                            <li><strong>Cross-Border Data Transfers:</strong> As a global platform, your data may be processed and stored in the 
                            United States or other jurisdictions where 1c Publishing or its service providers operate. We adhere to international 
                            privacy regulations, such as GDPR and CCPA, to ensure data is transferred securely and with adequate legal safeguards.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <UserCheck className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">5. Your Rights</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            1c Publishing upholds your rights regarding your personal data:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li><strong>Access, Correction, and Deletion:</strong> You have the right to access, correct, or request the deletion of 
                            your personal data held by us.</li>
                            <li><strong>Exercising Rights:</strong> You can easily contact us to exercise these rights using the contact information 
                            provided below.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Brain className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">6. Use of AI and Machine Learning</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            The Neural Mindmap App may leverage AI and machine learning for features such as smart suggestions or content structuring.
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li><strong>Ethical AI:</strong> We ensure that AI is used in ways that maintain your privacy and do not lead to biased outcomes.</li>
                            <li><strong>Mindmap Content and AI:</strong> Any AI processing of your mindmap content is performed solely to provide and 
                            improve the functionality of the App for you, and we take steps to prevent the use of your private content to train broad, 
                            publicly accessible AI models.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">7. Data Security Measures</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            We employ advanced security measures to protect your data from unauthorized access, including:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Encryption</li>
                            <li>Firewalls</li>
                            <li>Secure access controls</li>
                            <li>Regular security assessments</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            <strong>Your Role:</strong> We encourage you to use unique, strong passwords for your Neural Mindmap account and avoid 
                            sharing sensitive information online.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">8. Data Breach Protocols</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            In the unlikely event of a data breach, we have a comprehensive protocol in place for immediate containment, notification 
                            of affected individuals, and collaboration with authorities to mitigate risks and prevent future incidents.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <UserCheck className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">9. Children's Privacy</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            We do not knowingly target or collect data from children under the age of 13. If you believe your child has shared 
                            information with us, please contact us immediately so we can take steps to delete the data as required.
                        </p>
                    </section>

                    <section className="pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">10. Contact Us</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-2">
                            For questions about this Privacy Policy or 1c Publishing's privacy practices regarding the Neural Mindmap app or 
                            1cpublishing.com, please reach out to us:
                        </p>
                        <p className="text-purple-600 font-medium text-lg">Email: privacy@1cpublishing.com</p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">11. Updates to This Policy</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            We may update this Policy from time to time to reflect changes in our practices or compliance requirements. The updated 
                            version will be posted on our Sites, so please check back periodically.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}