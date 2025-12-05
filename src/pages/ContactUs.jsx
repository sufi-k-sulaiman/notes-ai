import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Headphones, Building2, Send, ArrowLeft, Loader2, ExternalLink, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

const ContactCard = ({ icon: Icon, title, description, email, buttonText, color, contactType, defaultSubject }) => {
    const [flipped, setFlipped] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            toast.error('Please fill in both subject and message');
            return;
        }
        setSending(true);
        try {
            // Save to database
            await base44.entities.ContactMessage.create({
                type: contactType,
                to_email: email,
                subject: subject,
                message: message,
                status: 'new'
            });

            setShowSuccess(true);
            setSubject('');
            setMessage('');
            setTimeout(() => {
                setShowSuccess(false);
                setFlipped(false);
            }, 2500);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleEmailClick = (e) => {
        e.stopPropagation();
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(defaultSubject)}`;
    };

    return (
        <div className="relative h-[360px]" style={{ perspective: '1000px' }}>
            <div 
                className={`relative w-full h-full transition-transform duration-500`} 
                style={{ 
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
            >
                {/* Front of card */}
                <div 
                    className="absolute inset-0 bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow flex flex-col"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="mb-4">
                        <Icon className="w-9 h-9" style={{ color }} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 min-h-[56px] flex items-center">{title}</h3>
                    <a 
                        href={`mailto:${email}?subject=${encodeURIComponent(defaultSubject)}`}
                        className="text-lg font-semibold mb-3 block hover:underline transition-all"
                        style={{ color }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {email} <ExternalLink className="w-4 h-4 inline ml-1" />
                    </a>
                    <p className="text-gray-600 flex-1">{description}</p>
                    <button 
                        onClick={() => setFlipped(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90 mt-4"
                        style={{ backgroundColor: color }}
                    >
                        <Send className="w-4 h-4" />
                        {buttonText}
                    </button>
                </div>

                {/* Back of card */}
                <div 
                    className="absolute inset-0 bg-white rounded-2xl border border-gray-200 p-6 overflow-hidden"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    {/* Success overlay */}
                    <div 
                        className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 transition-all duration-500"
                        style={{ 
                            backgroundColor: color,
                            transform: showSuccess ? 'scale(1)' : 'scale(0)',
                            opacity: showSuccess ? 1 : 0,
                            borderRadius: '1rem'
                        }}
                    >
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 animate-bounce">
                            <Send className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                        <p className="text-white/90 text-center px-4">We'll get back to you soon.</p>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setFlipped(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    </div>
                    <div className="space-y-3">
                        <Input
                            placeholder="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full"
                        />
                        <Textarea
                            placeholder="Your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full h-32 resize-none"
                        />
                        <Button 
                            onClick={handleSend}
                            disabled={sending}
                            className="w-full text-white"
                            style={{ backgroundColor: color }}
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            {sending ? 'Sending...' : 'Send Message'}
                        </Button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 text-center">To: {email}</p>
                </div>
            </div>
        </div>
    );
};

export default function ContactUs() {
    useEffect(() => {
        document.title = 'Contact and support page for 1cPublishing.com';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Connect with us for 1cPublishing and all applications related topics.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', '1cPublishing support, 1cPublishing Contact Us');
    }, []);

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
                        Whether you need help troubleshooting, reporting an issue, or sharing feedback, our team is here to help.
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
                      contactType="sales"
                      defaultSubject="Sales Inquiry - 1cPublishing"
                    />
                    <ContactCard
                      icon={MessageSquare}
                      title="Feedback and Errors"
                      description="To report an error or make a suggestion, send us an email. We value your input to improve our services."
                      email="help@1cPublishing.com"
                      buttonText="Send Feedback"
                      color="#10B981"
                      contactType="feedback"
                      defaultSubject="Feedback - 1cPublishing"
                    />
                    <ContactCard
                      icon={Headphones}
                      title="Contact Support"
                      description="If you need extra assistance using the 1cPublishing application or the Portal, our support team is ready to help you anytime."
                      email="help@1cPublishing.com"
                      buttonText="Contact Support"
                      color="#3B82F6"
                      contactType="support"
                      defaultSubject="Support Request - 1cPublishing"
                    />
                </div>

                {/* Office Locations */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Offices</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">US Office</h3>
                                    <p className="text-gray-600">United States</p>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                1 Barbados Ave<br />
                                Tampa, FL 33606<br />
                                USA
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Canada Office</h3>
                                    <p className="text-gray-600">Canada</p>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                49 Courtman Rd<br />
                                London N17 7HT<br />
                                UK
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">UK Office</h3>
                                    <p className="text-gray-600">United Kingdom</p>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                49 Courtman Rd<br />
                                London N17 7HT<br />
                                UK
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}