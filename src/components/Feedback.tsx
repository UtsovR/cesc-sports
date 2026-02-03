import { useState, FormEvent } from 'react';
import { MessageSquare, Star, Send, User, Mail, Sparkles, Phone, Briefcase, MapPin, Building2 } from 'lucide-react';
import BackButton from './BackButton';

export default function Feedback() {
    const [formData, setFormData] = useState({
        name: '',
        employeeCode: '',
        contactNumber: '',
        email: '',
        location: '',
        organisation: '',
        department: '',
        rating: 5,
        message: '',
        type: 'suggestion'
    });

    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');

        try {
            const response = await fetch('http://localhost:3000/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Feedback submission failed');
            }

            console.log('Feedback submitted:', data);
            setStatus('success');
            setFormData({
                name: '',
                employeeCode: '',
                contactNumber: '',
                email: '',
                location: '',
                organisation: '',
                department: '',
                rating: 5,
                message: '',
                type: 'suggestion'
            });
        } catch (error: any) {
            console.error('Feedback Error:', error);
            setStatus('error');
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="pt-24 px-4 max-w-3xl mx-auto mb-20">
            <BackButton className="mb-6" />
            <div className="backdrop-blur-xl bg-white/40 rounded-3xl p-8 md:p-12 border border-white/50 shadow-2xl relative overflow-hidden">

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl -z-10"></div>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-4">
                        We Value Your Feedback
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Help us improve your sports club experience.
                    </p>
                    <div className="mt-4 inline-block bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
                        <p className="text-blue-700 text-sm font-medium">
                            Personal details are not mandatory. Discrete feedbacks are also appreciated.
                        </p>
                    </div>
                </div>

                {status === 'success' ? (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                        <p className="text-gray-600">Your feedback has been successfully submitted.</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-8 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                        >
                            Send Another
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 pl-1">Name <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 pl-1">Email <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 pl-1">Employee Code <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="E.g., 123456"
                                        value={formData.employeeCode}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d{0,6}$/.test(val)) {
                                                setFormData({ ...formData, employeeCode: val });
                                            }
                                        }}
                                        pattern="\d{6}"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 pl-1">Contact Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="tel"
                                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="+91 XXXXX XXXXX"
                                        value={formData.contactNumber}
                                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* New Fields */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 pl-1">Location <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g., Kolkata"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 pl-1">Organisation <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g., CESC"
                                        value={formData.organisation}
                                        onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700 pl-1">Department <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="IT / HR / Operations"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 pl-1">Experience Rating</label>
                            <div className="flex gap-2 bg-white/50 p-3 rounded-xl border border-gray-200 w-fit">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-8 h-8 ${star <= formData.rating
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 pl-1">Feedback Type</label>
                            <div className="flex gap-4">
                                {['suggestion', 'complaint', 'appreciation'].map((type) => (
                                    <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value={type}
                                            checked={formData.type === type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="capitalize text-gray-700">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 pl-1">Message</label>
                            <textarea
                                required
                                className="w-full p-4 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[120px]"
                                placeholder="Share your thoughts with us..."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        {status === 'error' && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
                                {errorMessage || 'Something went wrong. Please try again.'}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {status === 'submitting' ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span>Submit Feedback</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
