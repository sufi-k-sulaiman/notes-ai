import React from 'react';
import { Mail, MessageSquare, Headphones, Building2, Send } from 'lucide-react';

const ContactCard = ({ icon: Icon, title, description, email, buttonText, color }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4`} style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-7 h-7" style={{ color }} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <a 
            href={`mailto:${email}`} 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: color }}
        >
            <Send className="w-4 h-4" />
            {buttonText}
        </a>
        <p className="mt-3 text-sm text-gray-500">{email}</p>
    </div>
);

export default function ContactUs() {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white text-center">
                    <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
                    <p className="text-xl text-white/90">Contact us anytime</p>
                </div>

                {/* Introduction */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 text-center">
                    <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                        At <strong>1cPublishing</strong>, we are dedicated to providing exceptional customer support. 
                        Whether you need help troubleshooting, reporting an issue, or sharing feedback, our team is here to help you.
                    </p>
                </div>

                {/* Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <ContactCard
                        icon={Building2}
                        title="Contact Sales"
                        description="If you want to use the 1cPublishing research engine as an educational institution, team, or enterprise, send us an email."
                        email="sales@1cPublishing.com"
                        buttonText="Email Sales"
                        color="#8B5CF6"
                    />
                    <ContactCard
                        icon={MessageSquare}
                        title="Feedback and Errors"
                        description="To report an error or make a suggestion, send us an email. We value your input to improve our services."
                        email="help@1cPublishing.com"
                        buttonText="Send Feedback"
                        color="#10B981"
                    />
                    <ContactCard
                        icon={Headphones}
                        title="Contact Support"
                        description="If you need assistance using the 1cPublishing application or the Portal, our support team is ready to help."
                        email="support@1cPublishing.com"
                        buttonText="Contact Support"
                        color="#3B82F6"
                    />
                </div>


            </div>
        </div>
    );
}