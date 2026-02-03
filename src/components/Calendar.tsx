import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import BackButton from './BackButton';
import { supabase } from '../lib/supabase';

export default function Calendar() {
    const [events, setEvents] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase
                .from('calendar_events')
                .select('*')
                .order('event_date', { ascending: true });

            if (error) {
                console.error('Failed to load events', error);
            } else {
                setEvents(data || []);
            }
        };

        fetchEvents();
    }, []);

    // Helper to format date
    const parseEvent = (evt: any) => {
        // Month formatting from actual date
        const dateObj = new Date(evt.event_date);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) + "'"; // e.g. Dec'25

        return {
            ...evt,
            sport: evt.sport || 'General',
            name: evt.event_name,
            dateDisplay: dateStr
        };
    };

    const parsedEvents = events.map(parseEvent);

    const filteredEvents = parsedEvents.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.sport.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pt-24 px-4 max-w-7xl mx-auto mb-20">
            <BackButton className="mb-6" />
            <div className="backdrop-blur-xl bg-gray-900/60 rounded-3xl p-8 md:p-12 border border-blue-500/30 shadow-2xl relative overflow-hidden">
                {/* Futuristic Background Accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>

                <div className="flex flex-col md:flex-row items-center justify-between mb-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-4">
                            <CalendarIcon className="w-10 h-10 text-cyan-400" />
                            Event Calendar <span className="text-2xl text-cyan-200/80 font-light">FY 25-26</span>
                        </h1>
                        <p className="text-blue-200/80 mt-2 text-lg">Upcoming Sports & Activities</p>
                    </div>
                    <div className="mt-6 md:mt-0">
                        <div className="flex items-center bg-gray-800/50 rounded-full px-4 py-2 border border-blue-500/30">
                            <Search size={18} className="text-blue-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                className="bg-transparent border-none outline-none text-blue-100 placeholder-blue-400/50 text-sm w-48"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 text-blue-100 border-b border-blue-500/30">
                                <th className="p-4 font-bold tracking-wider uppercase text-sm">Sport</th>
                                <th className="p-4 font-bold tracking-wider uppercase text-sm">Event Name</th>
                                <th className="p-4 font-bold tracking-wider uppercase text-sm">Date</th>
                                <th className="p-4 font-bold tracking-wider uppercase text-sm">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-500/10">
                            {filteredEvents.map((event, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-blue-500/5 transition-colors duration-200 group"
                                >
                                    <td className="p-4 text-cyan-100 font-medium flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]"></span>
                                        {event.sport}
                                    </td>
                                    <td className="p-4 text-blue-50 font-semibold group-hover:text-white transition-colors">
                                        {event.name}
                                    </td>
                                    <td className="p-4 text-cyan-200 font-mono">
                                        {event.dateDisplay}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${event.event_type === 'Internal'
                                            ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
                                            : 'bg-purple-400/10 border-purple-400/30 text-purple-300'
                                            }`}>
                                            {event.event_type.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredEvents.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-blue-300/50">
                                        No events found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
