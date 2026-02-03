import { useState, FormEvent } from 'react';
import { User, Mail, Building2, Badge, Trophy, Send, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import BackButton from './BackButton';

export default function Registration() {
    const [formData, setFormData] = useState({
        employeeCode: '',
        name: '',
        location: '',
        organisation: '',
        department: '',
        designation: '',
        email: '',
        sports: [] as string[],
        otherSport: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const sportsOptions = [
        'Cricket',
        'Football',
        'Badminton',
        'Table Tennis',
        'Tennis',
        'Volleyball',
        'Carrom',
        'Chess',
        'Athletics'
    ];

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setStatus('success');
            setFormData({
                employeeCode: '',
                name: '',
                location: '',
                organisation: '',
                department: '',
                designation: '',
                email: '',
                sports: [],
                otherSport: ''
            });
        } catch (error: any) {
            console.error('Registration Error:', error);
            setStatus('error');
            setErrorMessage(error.message);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'employeeCode') {
            // Only allow digits and max 6 characters
            if (/^\d{0,6}$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSportToggle = (sport: string) => {
        setFormData(prev => {
            const currentSports = prev.sports;
            if (currentSports.includes(sport)) {
                return { ...prev, sports: currentSports.filter(s => s !== sport) };
            } else {
                return { ...prev, sports: [...currentSports, sport] };
            }
        });
    };

    return (
        <div className="pt-24 px-4 max-w-3xl mx-auto mb-20">
            <BackButton className="mb-6" />
            <div className="backdrop-blur-xl bg-white/40 rounded-3xl p-8 md:p-12 border border-white/50 shadow-2xl">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                    Event Registration
                </h1>
                <p className="text-gray-600 mb-8">Join the CESC Sports Club tournaments and events.</p>

                {status === 'success' ? (
                    <div className="bg-green-100 border border-green-200 text-green-800 rounded-xl p-6 flex flex-col items-center text-center">
                        <CheckCircle size={48} className="mb-4 text-green-600" />
                        <h3 className="text-xl font-bold mb-2">Registration Successful!</h3>
                        <p>Thank you for registering. We will contact you with further details.</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            Register Another
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Employee Code */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Badge size={18} className="text-blue-500" /> Employee Code
                                </label>
                                <input
                                    type="text"
                                    name="employeeCode"
                                    required
                                    value={formData.employeeCode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="e.g., 123456"
                                    pattern="\d{6}"
                                    title="Please enter exactly 6 digits"
                                />
                                <p className="text-xs text-gray-500">Must be exactly 6 digits</p>
                            </div>

                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <User size={18} className="text-blue-500" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <MapPin size={18} className="text-blue-500" /> Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="e.g., Kolkata"
                                />
                            </div>

                            {/* Organisation */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Building2 size={18} className="text-blue-500" /> Organisation
                                </label>
                                <input
                                    type="text"
                                    name="organisation"
                                    required
                                    value={formData.organisation}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="e.g., CESC"
                                />
                            </div>

                            {/* Department */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Building2 size={18} className="text-blue-500" /> Department
                                </label>
                                <input
                                    type="text"
                                    name="department"
                                    required
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="IT / HR / Operations"
                                />
                            </div>

                            {/* Designation */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Badge size={18} className="text-blue-500" /> Designation
                                </label>
                                <input
                                    type="text"
                                    name="designation"
                                    required
                                    value={formData.designation}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="Manager / Executive"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Mail size={18} className="text-blue-500" /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                placeholder="john.doe@cesc.co.in"
                            />
                        </div>

                        {/* Sport Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Trophy size={18} className="text-blue-500" /> Interested Sports
                            </label>
                            <p className="text-xs text-gray-500 mb-2">Select one or more sports you are interested in.</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {sportsOptions.map(sport => (
                                    <label key={sport} className={`
                                        flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                                        ${formData.sports.includes(sport)
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                            : 'bg-white/50 border-gray-200 text-gray-700 hover:border-blue-300'
                                        }
                                    `}>
                                        <input
                                            type="checkbox"
                                            value={sport}
                                            checked={formData.sports.includes(sport)}
                                            onChange={() => handleSportToggle(sport)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium">{sport}</span>
                                    </label>
                                ))}
                                <label className={`
                                    flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                                    ${formData.sports.includes('Others')
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                        : 'bg-white/50 border-gray-200 text-gray-700 hover:border-blue-300'
                                    }
                                `}>
                                    <input
                                        type="checkbox"
                                        value="Others"
                                        checked={formData.sports.includes('Others')}
                                        onChange={() => handleSportToggle('Others')}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium">Others</span>
                                </label>
                            </div>

                            {formData.sports.includes('Others') && (
                                <div className="mt-3 animate-fadeIn">
                                    <input
                                        type="text"
                                        name="otherSport"
                                        value={formData.otherSport}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        placeholder="Please specify other sport(s)"
                                    />
                                </div>
                            )}
                        </div>

                        {status === 'error' && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
                                <AlertCircle size={20} />
                                <span>{errorMessage || 'Something went wrong. Please try again.'}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full py-4 mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-lg font-bold rounded-xl shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {status === 'submitting' ? (
                                'Submitting...'
                            ) : (
                                <>
                                    Submit Registration <Send size={20} />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
