import React, { useState, useEffect, useRef } from 'react';
import { 
    Phone, MessageSquare, Mail, Users, Video, Calendar, FileText,
    Plus, Search, Star, Clock, PhoneOutgoing, PhoneIncoming, PhoneMissed,
    Send, Mic, MicOff, X, Loader2, Check, CheckCheck, UserPlus,
    MoreVertical, Trash2, Edit, Copy, ExternalLink, Maximize2, Minimize2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AVATAR_COLORS = ['#6B4EE6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#EF4444', '#8B5CF6', '#06B6D4'];

function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    return (
        <div className={`fixed bottom-4 right-4 ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50`}>
            {type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            <span>{message}</span>
        </div>
    );
}

function Avatar({ name, color, size = 'md' }) {
    const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
    const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
    return (
        <div className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-medium`} style={{ backgroundColor: color || AVATAR_COLORS[0] }}>
            {initials}
        </div>
    );
}

export default function Comms() {
    const [activeTab, setActiveTab] = useState('chat');
    const [selectedContact, setSelectedContact] = useState(null);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showCallModal, setShowCallModal] = useState(false);
    const [showSMSModal, setShowSMSModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showConferenceModal, setShowConferenceModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', company: '' });
    const [smsContent, setSmsContent] = useState('');
    const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });
    const [conferenceNumbers, setConferenceNumbers] = useState(['', '']);
    const [callNumber, setCallNumber] = useState('');
    const [smsNumber, setSmsNumber] = useState('');
    const [showUsersPanel, setShowUsersPanel] = useState(true);
    const queryClient = useQueryClient();
    const messagesEndRef = useRef(null);

    const { data: appUsers = [] } = useQuery({
        queryKey: ['appUsers'],
        queryFn: () => base44.entities.User.list(),
    });

    const { data: contacts = [] } = useQuery({
        queryKey: ['contacts'],
        queryFn: () => base44.entities.Contact.list('-created_date'),
    });

    const { data: messages = [] } = useQuery({
        queryKey: ['messages'],
        queryFn: () => base44.entities.Message.list('-created_date', 100),
    });

    const { data: callLogs = [] } = useQuery({
        queryKey: ['callLogs'],
        queryFn: () => base44.entities.CallLog.list('-created_date', 50),
    });

    const createContactMutation = useMutation({
        mutationFn: (data) => base44.entities.Contact.create({ ...data, avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            setShowContactModal(false);
            setNewContact({ name: '', phone: '', email: '', company: '' });
            setToast({ message: 'Contact added', type: 'success' });
        },
    });

    const deleteContactMutation = useMutation({
        mutationFn: (id) => base44.entities.Contact.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            setSelectedContact(null);
            setToast({ message: 'Contact deleted', type: 'success' });
        },
    });

    const sendChatMessage = async () => {
        if (!messageInput.trim() || !selectedContact) return;
        setLoading(true);
        try {
            await base44.entities.Message.create({
                type: 'chat',
                to_user: selectedContact.email || selectedContact.phone,
                content: messageInput,
                status: 'sent',
                conversation_id: selectedContact.id
            });
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            setMessageInput('');
        } catch (e) {
            setToast({ message: 'Failed to send', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const makeCall = async () => {
        if (!callNumber) return;
        setLoading(true);
        try {
            await base44.functions.invoke('twilioCall', { action: 'call', to: callNumber });
            setShowCallModal(false);
            setCallNumber('');
            setToast({ message: 'Call initiated', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['callLogs'] });
        } catch (e) {
            setToast({ message: 'Call failed: ' + e.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const sendSMS = async () => {
        const targetPhone = smsNumber || selectedContact?.phone;
        if (!targetPhone || !smsContent.trim()) return;
        setLoading(true);
        try {
            await base44.functions.invoke('twilioCall', { action: 'sms', to: targetPhone, message: smsContent });
            setShowSMSModal(false);
            setSmsContent('');
            setSmsNumber('');
            setToast({ message: 'SMS sent', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        } catch (e) {
            setToast({ message: 'SMS failed: ' + e.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const sendEmail = async () => {
        if (!emailData.to || !emailData.subject || !emailData.body) return;
        setLoading(true);
        try {
            await base44.integrations.Core.SendEmail({
                to: emailData.to,
                subject: emailData.subject,
                body: emailData.body
            });
            await base44.entities.Message.create({
                type: 'email',
                to_user: emailData.to,
                content: `Subject: ${emailData.subject}\n\n${emailData.body}`,
                status: 'sent'
            });
            setShowEmailModal(false);
            setEmailData({ to: '', subject: '', body: '' });
            setToast({ message: 'Email sent', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        } catch (e) {
            setToast({ message: 'Email failed: ' + e.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const startConference = async () => {
        const validNumbers = conferenceNumbers.filter(n => n.trim());
        if (validNumbers.length < 2) return;
        setLoading(true);
        try {
            await base44.functions.invoke('twilioCall', { action: 'conference', participants: validNumbers });
            setShowConferenceModal(false);
            setConferenceNumbers(['', '']);
            setToast({ message: 'Conference call started', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['callLogs'] });
        } catch (e) {
            setToast({ message: 'Conference failed: ' + e.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const filteredContacts = contacts.filter(c => 
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery)
    );

    const conversationMessages = selectedContact 
        ? messages.filter(m => m.conversation_id === selectedContact.id || m.to_user === selectedContact.email || m.to_user === selectedContact.phone)
        : [];

    const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formatDate = (date) => new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });

    return (
            <div className="h-[calc(100vh-72px)] flex bg-gray-50">
                {/* Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-bold text-gray-900">Communications</h1>
                            <Button size="icon" variant="ghost" onClick={() => setShowContactModal(true)}>
                                <UserPlus className="w-5 h-5 text-purple-600" />
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input placeholder="Search contacts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <TabsList className="grid grid-cols-4 mx-4 mt-2">
                            <TabsTrigger value="chat"><MessageSquare className="w-4 h-4" /></TabsTrigger>
                            <TabsTrigger value="calls"><Phone className="w-4 h-4" /></TabsTrigger>
                            <TabsTrigger value="sms"><MessageSquare className="w-4 h-4" /></TabsTrigger>
                            <TabsTrigger value="email"><Mail className="w-4 h-4" /></TabsTrigger>
                        </TabsList>

                        <TabsContent value="chat" className="flex-1 overflow-y-auto p-2 m-0">
                            {filteredContacts.map(contact => (
                                <div key={contact.id} onClick={() => setSelectedContact(contact)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedContact?.id === contact.id ? 'bg-purple-100' : 'hover:bg-gray-50'}`}>
                                    <Avatar name={contact.name} color={contact.avatar_color} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                                        <p className="text-sm text-gray-500 truncate">{contact.email || contact.phone}</p>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="calls" className="flex-1 overflow-y-auto p-2 m-0">
                            {callLogs.map(log => (
                                <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                                    {log.type === 'outgoing' && <PhoneOutgoing className="w-5 h-5 text-green-500" />}
                                    {log.type === 'incoming' && <PhoneIncoming className="w-5 h-5 text-blue-500" />}
                                    {log.type === 'missed' && <PhoneMissed className="w-5 h-5 text-red-500" />}
                                    {log.type === 'conference' && <Users className="w-5 h-5 text-purple-500" />}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{log.contact_name || log.phone_number}</p>
                                        <p className="text-xs text-gray-500">{formatDate(log.created_date)} • {log.duration || 0}s</p>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="sms" className="flex-1 overflow-y-auto p-2 m-0">
                            {messages.filter(m => m.type === 'sms').map(msg => (
                                <div key={msg.id} className="p-3 rounded-xl hover:bg-gray-50">
                                    <p className="font-medium text-gray-900 text-sm">{msg.to_user}</p>
                                    <p className="text-sm text-gray-500 truncate">{msg.content}</p>
                                    <p className="text-xs text-gray-400 mt-1">{formatDate(msg.created_date)}</p>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="email" className="flex-1 overflow-y-auto p-2 m-0">
                            {messages.filter(m => m.type === 'email').map(msg => (
                                <div key={msg.id} className="p-3 rounded-xl hover:bg-gray-50">
                                    <p className="font-medium text-gray-900 text-sm">{msg.to_user}</p>
                                    <p className="text-sm text-gray-500 truncate">{msg.content}</p>
                                    <p className="text-xs text-gray-400 mt-1">{formatDate(msg.created_date)}</p>
                                </div>
                            ))}
                        </TabsContent>
                    </Tabs>

                    {/* Quick Actions */}
                    <div className="p-3 border-t border-gray-100 grid grid-cols-4 gap-2">
                        <Button size="sm" variant="outline" onClick={() => setShowCallModal(true)} className="flex-col h-14 gap-1">
                            <Phone className="w-4 h-4 text-green-600" />
                            <span className="text-[10px]">Call</span>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowSMSModal(true)} className="flex-col h-14 gap-1">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            <span className="text-[10px]">SMS</span>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowEmailModal(true)} className="flex-col h-14 gap-1">
                            <Mail className="w-4 h-4 text-purple-600" />
                            <span className="text-[10px]">Email</span>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowConferenceModal(true)} className="flex-col h-14 gap-1">
                            <Users className="w-4 h-4 text-orange-600" />
                            <span className="text-[10px]">Conf</span>
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {selectedContact ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
                                <div className="flex items-center gap-3">
                                    <Avatar name={selectedContact.name} color={selectedContact.avatar_color} size="lg" />
                                    <div>
                                        <h2 className="font-semibold text-gray-900">{selectedContact.name}</h2>
                                        <p className="text-sm text-gray-500">{selectedContact.email || selectedContact.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => { setCallNumber(selectedContact.phone); setShowCallModal(true); }}>
                                        <Phone className="w-5 h-5 text-green-600" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => setShowSMSModal(true)}>
                                        <MessageSquare className="w-5 h-5 text-blue-600" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => { setEmailData({ ...emailData, to: selectedContact.email }); setShowEmailModal(true); }}>
                                        <Mail className="w-5 h-5 text-purple-600" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => deleteContactMutation.mutate(selectedContact.id)}>
                                        <Trash2 className="w-5 h-5 text-red-500" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {conversationMessages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <MessageSquare className="w-16 h-16 mb-4" />
                                        <p>No messages yet. Start a conversation!</p>
                                    </div>
                                ) : (
                                    conversationMessages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.from_user ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.from_user ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200'}`}>
                                                <p className="text-sm">{msg.content}</p>
                                                <div className={`flex items-center gap-1 mt-1 text-xs ${msg.from_user ? 'text-purple-200' : 'text-gray-400'}`}>
                                                    <span>{formatTime(msg.created_date)}</span>
                                                    {msg.status === 'read' && <CheckCheck className="w-3 h-3" />}
                                                    {msg.status === 'delivered' && <Check className="w-3 h-3" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 bg-white border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <Input placeholder="Type a message..." value={messageInput} onChange={e => setMessageInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} className="flex-1" />
                                    <Button onClick={sendChatMessage} disabled={loading || !messageInput.trim()} className="bg-purple-600 hover:bg-purple-700">
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageSquare className="w-20 h-20 mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Select a contact</h2>
                            <p>Choose a contact to start messaging</p>
                        </div>
                    )}
                </div>

                {/* Online Users Panel */}
                <div className={`${showUsersPanel ? 'w-64' : 'w-0'} bg-white border-l border-gray-200 transition-all overflow-hidden`}>
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-500" />
                            App Users ({appUsers.length})
                        </h3>
                    </div>
                    <div className="p-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                        {appUsers.map(user => (
                            <div key={user.id} onClick={() => {
                                const existingContact = contacts.find(c => c.email === user.email);
                                if (existingContact) {
                                    setSelectedContact(existingContact);
                                } else {
                                    setSelectedContact({ id: user.id, name: user.full_name, email: user.email, avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] });
                                }
                            }} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50">
                                <div className="relative">
                                    <Avatar name={user.full_name} color={AVATAR_COLORS[user.id?.charCodeAt(0) % AVATAR_COLORS.length]} size="sm" />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                                    <p className="text-xs text-green-500">Online</p>
                                </div>
                            </div>
                        ))}
                        {appUsers.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No other users yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Contact Modal */}
            <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
                <DialogContent className="max-w-md">
                    <h3 className="text-lg font-semibold mb-4">Add Contact</h3>
                    <div className="space-y-3">
                        <Input placeholder="Name *" value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} />
                        <Input placeholder="Phone" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} />
                        <Input placeholder="Email" value={newContact.email} onChange={e => setNewContact({ ...newContact, email: e.target.value })} />
                        <Input placeholder="Company" value={newContact.company} onChange={e => setNewContact({ ...newContact, company: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowContactModal(false)}>Cancel</Button>
                        <Button onClick={() => createContactMutation.mutate(newContact)} disabled={!newContact.name} className="bg-purple-600 hover:bg-purple-700">Add Contact</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Call Modal */}
            <Dialog open={showCallModal} onOpenChange={setShowCallModal}>
                <DialogContent className="max-w-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Phone className="w-5 h-5 text-green-600" /> Make a Call</h3>
                    <Input placeholder="Enter phone number (+1...)" value={callNumber} onChange={e => setCallNumber(e.target.value)} />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowCallModal(false)}>Cancel</Button>
                        <Button onClick={makeCall} disabled={loading || !callNumber} className="bg-green-600 hover:bg-green-700">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Phone className="w-4 h-4 mr-2" />} Call
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* SMS Modal */}
            <Dialog open={showSMSModal} onOpenChange={setShowSMSModal}>
                <DialogContent className="max-w-md">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-600" /> Send SMS</h3>
                    <Input placeholder="Phone number (+1...)" value={smsNumber || selectedContact?.phone || ''} onChange={e => setSmsNumber(e.target.value)} className="mb-3" />
                    <Textarea placeholder="Type your message..." value={smsContent} onChange={e => setSmsContent(e.target.value)} rows={4} />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => { setShowSMSModal(false); setSmsNumber(''); }}>Cancel</Button>
                        <Button onClick={sendSMS} disabled={loading || !smsContent.trim() || (!smsNumber && !selectedContact?.phone)} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />} Send SMS
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Email Modal */}
            <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
                <DialogContent className="max-w-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Mail className="w-5 h-5 text-purple-600" /> Send Email</h3>
                    <div className="space-y-3">
                        <Input placeholder="To email address" value={emailData.to} onChange={e => setEmailData({ ...emailData, to: e.target.value })} />
                        <Input placeholder="Subject" value={emailData.subject} onChange={e => setEmailData({ ...emailData, subject: e.target.value })} />
                        <Textarea placeholder="Email body..." value={emailData.body} onChange={e => setEmailData({ ...emailData, body: e.target.value })} rows={6} />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowEmailModal(false)}>Cancel</Button>
                        <Button onClick={sendEmail} disabled={loading || !emailData.to || !emailData.subject || !emailData.body} className="bg-purple-600 hover:bg-purple-700">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />} Send Email
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Conference Call Modal */}
            <Dialog open={showConferenceModal} onOpenChange={setShowConferenceModal}>
                <DialogContent className="max-w-md">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-orange-600" /> Conference Call</h3>
                    <div className="space-y-3">
                        {conferenceNumbers.map((num, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Input placeholder={`Participant ${i + 1} phone`} value={num} onChange={e => {
                                    const updated = [...conferenceNumbers];
                                    updated[i] = e.target.value;
                                    setConferenceNumbers(updated);
                                }} />
                                {i > 1 && (
                                    <Button size="icon" variant="ghost" onClick={() => setConferenceNumbers(conferenceNumbers.filter((_, idx) => idx !== i))}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button variant="outline" onClick={() => setConferenceNumbers([...conferenceNumbers, ''])} className="w-full">
                            <Plus className="w-4 h-4 mr-2" /> Add Participant
                        </Button>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowConferenceModal(false)}>Cancel</Button>
                        <Button onClick={startConference} disabled={loading || conferenceNumbers.filter(n => n.trim()).length < 2} className="bg-orange-600 hover:bg-orange-700">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Phone className="w-4 h-4 mr-2" />} Start Conference
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    );
}