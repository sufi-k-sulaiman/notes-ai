import React from 'react';
import { FileText, Shield, Database, Search, Ban, Copyright, Lock, ExternalLink, AlertTriangle, Scale, Users } from 'lucide-react';

const Section = ({ number, title, icon: Icon, children }) => (
    <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Icon className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{number}. {title}</h2>
        </div>
        <div className="text-gray-600 leading-relaxed pl-13 ml-13">{children}</div>
    </div>
);

export default function TermsOfUse() {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                            <FileText className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">1cPublishing Terms of Use</h1>
                            <p className="text-white/80">Last updated: November 2025</p>
                        </div>
                    </div>
                </div>

                {/* Introduction */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Welcome to <strong>1cPublishing Inc.</strong> ("1cPublishing"). These Terms of Use ("Terms") govern your access to and use of our website at <a href="https://www.1cPublishing.com" className="text-purple-600 hover:underline">www.1cPublishing.com</a> and any related services or features offered by 1cPublishing (collectively, the "Services"). Please read these Terms carefully before using the Services.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        By accessing or using the Services, you agree to these Terms. If you do not agree, please refrain from using the Services. 1cPublishing may modify these Terms at any time, and your continued use of the Services following changes constitutes your acceptance of the revised Terms. The most recent version of the Terms is accessible via the "Terms of Use" link on our website.
                    </p>
                </div>

                {/* Sections */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                    <Section number="1" title="Grant of License" icon={Shield}>
                        <p className="mb-3">
                            Subject to compliance with these Terms, 1cPublishing grants you a personal, non-exclusive, non-transferable, revocable license to use the Services and access content ("Content") available through the Services. Unless otherwise attributed to third parties, all text, graphics, data, and other materials provided are 1cPublishing's property. Any rights not expressly granted are reserved.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600">
                            <li>You may access, display, download, and use 1cPublishing Content for non-commercial purposes, provided that proper attribution is given to 1cPublishing.</li>
                            <li>You do not modify, reproduce, republish, or distribute Content in ways that misrepresent 1cPublishing or imply endorsement.</li>
                            <li>Any third-party Content provided through the Services must adhere to the respective owner's usage terms.</li>
                        </ul>
                    </Section>

                    <Section number="2" title="User Research Data" icon={Database}>
                        <p className="mb-3">
                            1cPublishing collects and analyzes user research data to improve its Services and provide meaningful insights. By using the Services, you consent to 1cPublishing collecting, processing, and storing data as described in our Privacy Policy.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600">
                            <li>1cPublishing ensures all research data is handled in compliance with applicable laws and ethical standards.</li>
                            <li>You agree not to provide false or misleading data while engaging with 1cPublishing's Services.</li>
                            <li>Any unauthorized access, distribution, or misuse of research data is strictly prohibited.</li>
                        </ul>
                    </Section>

                    <Section number="3" title="Data Requests" icon={Search}>
                        <p className="mb-3">
                            1cPublishing supports transparency and data-driven decision-making. Users may request access to specific datasets or research materials through our designated data request process.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600">
                            <li>All data requests are subject to review and approval to ensure compliance with privacy, legal, and operational guidelines.</li>
                            <li>To submit a data request, please follow the instructions provided on our website.</li>
                            <li>1cPublishing reserves the right to deny data requests that do not meet eligibility or security requirements.</li>
                        </ul>
                    </Section>

                    <Section number="4" title="Special Research" icon={FileText}>
                        <p className="mb-3">
                            1cPublishing offers tailored research services ("Special Research") for clients seeking customized insights or reports.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600">
                            <li>Special Research engagements are governed by additional terms, as outlined in a separate agreement, which must be executed between 1cPublishing and the client.</li>
                            <li>Clients engaging 1cPublishing for Special Research agree to provide accurate and complete information necessary for the research.</li>
                            <li>Results of Special Research are delivered exclusively to the commissioning client unless otherwise agreed in writing.</li>
                        </ul>
                    </Section>

                    <Section number="5" title="Prohibited Conduct" icon={Ban}>
                        <p className="mb-3">You agree not to:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600">
                            <li>Engage in activities that violate applicable laws or infringe on the rights of others.</li>
                            <li>Impersonate others, misrepresent affiliations, or access the Services without authorization.</li>
                            <li>Use automated tools (e.g., scrapers, bots) to collect data without 1cPublishing's consent.</li>
                            <li>Interfere with the functionality of the Services or compromise its security.</li>
                        </ul>
                        <p className="mt-3 text-gray-600">1cPublishing reserves the right to investigate, suspend, or terminate accounts for any violations.</p>
                    </Section>

                    <Section number="6" title="Intellectual Property Rights" icon={Copyright}>
                        <p>
                            All Content, trademarks, logos, and designs made available through the Services are owned by or licensed to 1cPublishing unless otherwise specified. You may not use 1cPublishing trademarks or intellectual property without prior written consent.
                        </p>
                    </Section>

                    <Section number="7" title="Privacy Policy" icon={Lock}>
                        <p>
                            Your use of the Services is subject to 1cPublishing's Privacy Policy, which outlines how we collect, use, and protect your data. By using the Services, you consent to the terms of our Privacy Policy.
                        </p>
                    </Section>

                    <Section number="8" title="Third-Party Links" icon={ExternalLink}>
                        <p>
                            The Services may include links to external websites. 1cPublishing is not responsible for the availability or content of third-party sites and does not endorse or assume liability for them. Use third-party links at your own risk.
                        </p>
                    </Section>

                    <Section number="9" title="Disclaimer of Warranties" icon={AlertTriangle}>
                        <p>
                            The Services are provided on an "as is" basis without warranties of any kind, including fitness for a particular purpose or non-infringement. 1cPublishing does not guarantee uninterrupted or error-free access to the Services.
                        </p>
                    </Section>

                    <Section number="10" title="Limitation of Liability" icon={Scale}>
                        <p>
                            To the fullest extent permitted by law, 1cPublishing is not liable for any damages, including indirect, incidental, or consequential damages, arising from your use of the Services.
                        </p>
                    </Section>

                    <Section number="11" title="Indemnification" icon={Shield}>
                        <p>
                            You agree to indemnify and hold 1cPublishing harmless from any claims, losses, or damages resulting from your breach of these Terms or misuse of the Services.
                        </p>
                    </Section>

                    <Section number="12" title="User Contributions" icon={Users}>
                        <p>
                            1cPublishing reserves the right to manage user contributions, including submissions of ideas, feedback, or other materials. Users agree that contributions may be utilized by 1cPublishing without limitation.
                        </p>
                    </Section>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-500 text-sm">
                    <p>© 2025 1cPublishing Inc. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}