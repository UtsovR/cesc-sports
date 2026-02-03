import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Calendar, MapPin } from 'lucide-react';
import BackButton from './BackButton';
import { supabase } from '../lib/supabase';

interface HallOfFameEntry {
    id: number;
    event_name: string;
    event_date: string;
    event_venue: string;
    winner_name: string;
    achievement_type: string;
    event_image: string;
}

export default function HallOfFame() {
    const [entries, setEntries] = useState<HallOfFameEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const { data, error } = await supabase
                .from('hall_of_fame')
                .select('*')
                .order('event_date', { ascending: false });

            if (error) throw error;
            setEntries(data || []);
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAchievementIcon = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('winner') || lowerType.includes('gold') || lowerType.includes('1st')) return <Trophy className="text-yellow-500" size={24} />;
        if (lowerType.includes('runner') || lowerType.includes('silver') || lowerType.includes('2nd')) return <Medal className="text-gray-400" size={24} />;
        if (lowerType.includes('bronze') || lowerType.includes('3rd')) return <Medal className="text-amber-700" size={24} />;
        return <Award className="text-blue-500" size={24} />;
    };

    const getAchievementColor = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('winner') || lowerType.includes('gold') || lowerType.includes('1st')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (lowerType.includes('runner') || lowerType.includes('silver') || lowerType.includes('2nd')) return 'bg-gray-100 text-gray-800 border-gray-200';
        if (lowerType.includes('bronze') || lowerType.includes('3rd')) return 'bg-orange-50 text-orange-800 border-orange-200';
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }

    return (
        <div className="pt-24 pb-16 px-4 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <BackButton className="mb-8" />
                {/* Hero Section */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full -z-10"></div>
                    <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-6 drop-shadow-sm">
                        Hall of Fame
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 font-light italic max-w-3xl mx-auto leading-relaxed">
                        "Great achievements are milestones of dedication and teamwork."
                    </p>
                    <div className="h-1 w-24 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto mt-8 rounded-full"></div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-12 bg-white/50 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl">
                        <Trophy className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-600">No entries yet</h3>
                        <p className="text-gray-500 mt-2">Check back soon for our legendary achievements!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {entries.map((entry) => (
                            <div
                                key={entry.id}
                                className="group relative bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/50"
                            >
                                {/* Image Container */}
                                <div className="relative h-64 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                    <img
                                        src={entry.event_image.startsWith('http')
                                            ? entry.event_image
                                            : supabase.storage.from('hall_of_fame').getPublicUrl(entry.event_image).data.publicUrl}
                                        alt={entry.event_name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                                        {getAchievementIcon(entry.achievement_type)}
                                        <span className={`text-sm font-bold ${entry.achievement_type.toLowerCase().includes('winner') ? 'text-amber-600' : 'text-gray-700'}`}>
                                            {entry.achievement_type}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Container */}
                                <div className="p-6 relative">
                                    <div className="absolute -top-10 left-6 z-20">
                                        <div className="bg-white p-2 rounded-2xl shadow-lg">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-center leading-none text-xs">
                                                {new Date(entry.event_date).getDate()}<br />
                                                {new Date(entry.event_date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                            {entry.winner_name}
                                        </h3>
                                        <h4 className="text-lg font-medium text-gray-600 mb-4 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-amber-500" />
                                            {entry.event_name}
                                        </h4>

                                        <div className="space-y-2 pt-4 border-t border-gray-100">
                                            <div className="flex items-center text-gray-500 text-sm">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {new Date(entry.event_date).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="flex items-center text-gray-500 text-sm">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                {entry.event_venue}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
