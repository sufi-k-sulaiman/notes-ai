import React, { useState } from 'react';
import { Mail, MessageSquare, Headphones, Building2, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

const ContactCard = ({ icon: Icon, title, description, email, buttonText, color }) => {
    const [flipped, setFlipped] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            toast.error('Please fill in both subject and message');
            return;
        }
        setSending(true);
        try {
            const response = await base44.functions.invoke('sendContactEmail', {
                to: email,
                subject: subject,
                message: message
            });
            if (response.data?.success) {
                toast.success(response.data.message || 'Message sent successfully!');
                setSubject('');
                setMessage('');
                setFlipped(false);
            } else {
                throw new Error(response.data?.error || 'Failed to send');
            }
        } catch (error) {
            console.error('Email error:', error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="relative h-[320px]" style={{ perspective: '1000px' }}>
            <div 
                className={`relative w-full h-full transition-transform duration-500`} 
                style={{ 
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
            >
                {/* Front of card */}
                <div 
                    className="absolute inset-0 bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4`} style={{ backgroundColor: `${color}20` }}>
                        <Icon className="w-7 h-7" style={{ color }} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-4">{description}</p>
                    <button 
                        onClick={() => setFlipped(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90"
                        style={{ backgroundColor: color }}
                    >
                        <Send className="w-4 h-4" />
                        {buttonText}
                    </button>
                    <p className="mt-3 text-sm text-gray-500">{email}</p>
                </div>

                {/* Back of card */}
                <div 
                    className="absolute inset-0 bg-white rounded-2xl border border-gray-200 p-6"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
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
                        email="help@1cPublishing.com"
                        buttonText="Contact Support"
                        color="#3B82F6"
                    />
                </div>


            </div>
        </div>
    );
}