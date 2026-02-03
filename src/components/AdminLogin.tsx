import { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import BackButton from './BackButton';

interface AdminLoginProps {
    onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('adminToken', data.token);
                onLoginSuccess();
            } else {
                // Handle non-JSON responses (like 404 from missing endpoint)
                try {
                    const data = await response.json();
                    setError(data.error || 'Login failed');
                } catch (e) {
                    if (response.status === 404) {
                        setError('Connection error: Admin Endpoint not found. Please restart server.');
                    } else {
                        setError(`Login failed: Server returned ${response.status} ${response.statusText}`);
                    }
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Connection error. Is the server running?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center relative">
            <div className="absolute top-24 left-4 md:left-8">
                <BackButton />
            </div>
            <div className="max-w-md w-full backdrop-blur-xl bg-white/40 rounded-3xl p-8 border border-white/50 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
                    <p className="text-gray-600 text-sm mt-2">Restricted Access. Authorized Personnel Only.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Admin ID</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Enter Admin ID"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Enter Password"
                                required
                            />
                            <Lock className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                        {isLoading ? 'Verifying...' : 'Authenticate'}
                    </button>
                </form>
            </div>
        </div>
    );
}
