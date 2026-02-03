import { useState, useEffect } from 'react';
import { LogOut, Users, MessageSquare, Search } from 'lucide-react';
import BackButton from './BackButton';

interface AdminDashboardProps {
    onLogout: () => void;
}

interface Registration {
    employee_code: string;
    full_name: string;
    email: string;
    department: string;
    designation: string;
    sports_interested: string;
    created_at: string;
}

interface Feedback {
    id: number;
    experience_rating: number;
    feedback_type: string;
    message: string;
    submitted_at: string;
    name?: string;
    email?: string;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<'registrations' | 'feedback' | 'calendar' | 'whats-new' | 'upcoming-events' | 'hall-of-fame'>('registrations');
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
    const [whatsNewItems, setWhatsNewItems] = useState<any[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [hallOfFameEntries, setHallOfFameEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Calendar Form State
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [currentEvent, setCurrentEvent] = useState({ id: 0, event_name: '', sport: '', event_date: '', event_type: 'Internal' });
    const [eventFormMessage, setEventFormMessage] = useState('');

    // What's New State
    const [editingWhatsNew, setEditingWhatsNew] = useState<number | null>(null);
    const [tempWhatsNew, setTempWhatsNew] = useState<any>({});
    const [whatsNewMessage, setWhatsNewMessage] = useState('');

    // Upcoming Events Form State
    const [isEditingUpcomingEvent, setIsEditingUpcomingEvent] = useState(false);
    const [currentUpcomingEvent, setCurrentUpcomingEvent] = useState({ id: 0, event_name: '', event_date: '', event_time: '', event_venue: '', event_image: '' });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [upcomingEventMessage, setUpcomingEventMessage] = useState('');

    // Hall of Fame Form State
    const [isEditingHallOfFame, setIsEditingHallOfFame] = useState(false);
    const [currentHallOfFameEntry, setCurrentHallOfFameEntry] = useState({
        id: 0,
        event_name: '',
        event_date: '',
        event_venue: '',
        winner_name: '',
        achievement_type: 'Winner',
        event_image: ''
    });
    const [selectedHallOfFameImage, setSelectedHallOfFameImage] = useState<File | null>(null);
    const [hallOfFameMessage, setHallOfFameMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            onLogout();
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/admin/data', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                onLogout();
                return;
            }

            const data = await response.json();
            setRegistrations(data.registrations || []);
            setFeedbacks(data.feedbacks || []);

            const calendarResponse = await fetch('http://localhost:3000/api/calendar/events');
            const calendarData = await calendarResponse.json();
            setCalendarEvents(calendarData || []);

            const whatsNewResponse = await fetch('http://localhost:3000/api/whats-new');
            const whatsNewData = await whatsNewResponse.json();
            setWhatsNewItems(whatsNewData || []);

            const upcomingResponse = await fetch('http://localhost:3000/api/events/upcoming');
            const upcomingData = await upcomingResponse.json();
            setUpcomingEvents(upcomingData || []);

            const hallOfFameResponse = await fetch('http://localhost:3000/api/hall-of-fame');
            const hallOfFameData = await hallOfFameResponse.json();
            setHallOfFameEntries(hallOfFameData || []);

        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWhatsNew = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/whats-new');
            const data = await res.json();
            setWhatsNewItems(data || []);
        } catch (e) {
            console.error("Failed to refresh whats new", e);
        }
    };

    // ... (existing functions: handleLogout, handleSaveEvent, handleDeleteEvent, startEdit, cancelEdit, formatDate) ...
    // Note: I'm keeping existing functions but cutting down replacement for brevity where possible
    // Wait, replace_file_content requires exact target match. I need to be careful.
    // Since I'm replacing a large chunk I'll re-include the necessary parts.

    const handleLogout = async () => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                await fetch('http://localhost:3000/api/admin/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
            } catch (err) {
                console.error('Logout error', err);
            }
        }
        localStorage.removeItem('adminToken');
        onLogout();
    };

    const handleSaveEvent = async () => {
        if (!currentEvent.event_name || !currentEvent.sport || !currentEvent.event_date) {
            setEventFormMessage('Name, Sport and Date are required.');
            return;
        }

        const token = localStorage.getItem('adminToken');
        if (!token) return;

        try {
            const url = isEditingEvent
                ? `http://localhost:3000/api/admin/calendar/events/${currentEvent.id}`
                : `http://localhost:3000/api/admin/calendar/events`;

            const method = isEditingEvent ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    event_name: currentEvent.event_name,
                    sport: currentEvent.sport,
                    event_date: currentEvent.event_date,
                    event_type: currentEvent.event_type
                })
            });

            if (res.ok) {
                setEventFormMessage(isEditingEvent ? 'Event updated!' : 'Event added!');
                setCurrentEvent({ id: 0, event_name: '', sport: '', event_date: '', event_type: 'Internal' });
                setIsEditingEvent(false);
                fetchCalendarEvents(); // Assuming this is defined in scope, functionality kept
                setTimeout(() => setEventFormMessage(''), 3000);
            } else {
                const err = await res.json();
                setEventFormMessage(`Error: ${err.error}`);
            }
        } catch (e: any) {
            setEventFormMessage(`Error: ${e.message}`);
        }
    };

    const handleDeleteEvent = async (id: number) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        try {
            const res = await fetch(`http://localhost:3000/api/admin/calendar/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchCalendarEvents();
            else alert('Failed to delete event');
        } catch (e) { alert('Error deleting event'); }
    };

    const fetchCalendarEvents = async () => {
        try {
            const calendarResponse = await fetch('http://localhost:3000/api/calendar/events');
            const calendarData = await calendarResponse.json();
            setCalendarEvents(calendarData || []);
        } catch (e) {
            console.error("Failed to refresh calendar", e);
        }
    };

    const startEdit = (event: any) => {
        setIsEditingEvent(true);
        setCurrentEvent({ ...event });
        window.scrollTo(0, 0);
    };

    const cancelEdit = () => {
        setIsEditingEvent(false);
        setCurrentEvent({ id: 0, event_name: '', sport: '', event_date: '', event_type: 'Internal' });
        setEventFormMessage('');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    // What's New Upgrade
    const handleEditWhatsNew = (item: any) => {
        setEditingWhatsNew(item.id);
        setTempWhatsNew({ ...item });
    };

    const handleCancelWhatsNew = () => {
        setEditingWhatsNew(null);
        setTempWhatsNew({});
        setWhatsNewMessage('');
    };

    const handleSaveWhatsNew = async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:3000/api/admin/whats-new/${tempWhatsNew.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: tempWhatsNew.title,
                    description: tempWhatsNew.description,
                    icon_type: tempWhatsNew.icon_type
                })
            });

            if (res.ok) {
                setWhatsNewMessage('Updated successfully!');
                setEditingWhatsNew(null);
                fetchWhatsNew();
                setTimeout(() => setWhatsNewMessage(''), 3000);
            } else {
                setWhatsNewMessage('Update failed.');
            }
        } catch (e) {
            setWhatsNewMessage('Error updating.');
        }
    };

    // Upcoming Events CRUD
    const fetchUpcomingEvents = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/events/upcoming');
            const data = await res.json();
            setUpcomingEvents(data || []);
        } catch (e) {
            console.error("Failed to refresh upcoming events", e);
        }
    };

    const fetchHallOfFameEntries = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/hall-of-fame');
            const data = await res.json();
            setHallOfFameEntries(data || []);
        } catch (e) {
            console.error("Failed to refresh hall of fame entries", e);
        }
    };

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
            return imagePath;
        }
        return `http://localhost:3000/uploads/${imagePath}`;
    };

    const handleSaveUpcomingEvent = async () => {
        if (!currentUpcomingEvent.event_name || !currentUpcomingEvent.event_date || !currentUpcomingEvent.event_time || !currentUpcomingEvent.event_venue) {
            setUpcomingEventMessage('All fields (Name, Date, Time, Venue) are required.');
            return;
        }

        if (!isEditingUpcomingEvent && !selectedImage) {
            setUpcomingEventMessage('Please select an image for new events.');
            return;
        }

        const token = localStorage.getItem('adminToken');
        if (!token) return;

        try {
            const url = isEditingUpcomingEvent
                ? `http://localhost:3000/api/admin/events/${currentUpcomingEvent.id}`
                : `http://localhost:3000/api/admin/events`;

            const method = isEditingUpcomingEvent ? 'PUT' : 'POST';

            const formData = new FormData();
            formData.append('event_name', currentUpcomingEvent.event_name);
            formData.append('event_date', currentUpcomingEvent.event_date);
            formData.append('event_time', currentUpcomingEvent.event_time);
            formData.append('event_venue', currentUpcomingEvent.event_venue);

            if (selectedImage) {
                formData.append('event_image', selectedImage);
            } else if (isEditingUpcomingEvent) {
                // Determine if we need to send the old image path or just rely on backend ignoring it?
                // Backend logic: if file present, update image. Else, don't update image column.
                // So we don't strictly need to send 'event_image' string.
            }

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type header for FormData, browser sets it with boundary
                },
                body: formData
            });

            if (res.ok) {
                setUpcomingEventMessage(isEditingUpcomingEvent ? 'Event updated!' : 'Event added!');
                setCurrentUpcomingEvent({ id: 0, event_name: '', event_date: '', event_time: '', event_venue: '', event_image: '' });
                setSelectedImage(null);
                setIsEditingUpcomingEvent(false);
                fetchUpcomingEvents();
                setTimeout(() => setUpcomingEventMessage(''), 3000);
            } else {
                const err = await res.json();
                setUpcomingEventMessage(`Error: ${err.error}`);
            }
        } catch (e: any) {
            setUpcomingEventMessage(`Error: ${e.message}`);
        }
    };

    const handleDeleteUpcomingEvent = async (id: number) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        try {
            const res = await fetch(`http://localhost:3000/api/admin/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchUpcomingEvents();
            else alert('Failed to delete event');
        } catch (e) { alert('Error deleting event'); }
    };

    const handleSaveHallOfFameEntry = async () => {
        if (!currentHallOfFameEntry.event_name || !currentHallOfFameEntry.event_date || !currentHallOfFameEntry.winner_name || !currentHallOfFameEntry.event_venue) {
            setHallOfFameMessage('All fields are required.');
            return;
        }

        if (!isEditingHallOfFame && !selectedHallOfFameImage) {
            setHallOfFameMessage('Please select an image.');
            return;
        }

        const token = localStorage.getItem('adminToken');
        if (!token) return;

        try {
            const url = isEditingHallOfFame
                ? `http://localhost:3000/api/admin/hall-of-fame/${currentHallOfFameEntry.id}`
                : `http://localhost:3000/api/admin/hall-of-fame`;

            const method = isEditingHallOfFame ? 'PUT' : 'POST';

            const formData = new FormData();
            formData.append('event_name', currentHallOfFameEntry.event_name);
            formData.append('event_date', currentHallOfFameEntry.event_date);
            formData.append('event_venue', currentHallOfFameEntry.event_venue);
            formData.append('winner_name', currentHallOfFameEntry.winner_name);
            formData.append('achievement_type', currentHallOfFameEntry.achievement_type);

            if (selectedHallOfFameImage) {
                formData.append('event_image', selectedHallOfFameImage);
            }

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                setHallOfFameMessage(isEditingHallOfFame ? 'Entry updated!' : 'Entry added!');
                setCurrentHallOfFameEntry({
                    id: 0,
                    event_name: '',
                    event_date: '',
                    event_venue: '',
                    winner_name: '',
                    achievement_type: 'Winner',
                    event_image: ''
                });
                setSelectedHallOfFameImage(null);
                setIsEditingHallOfFame(false);
                fetchHallOfFameEntries();
                setTimeout(() => setHallOfFameMessage(''), 3000);
            } else {
                const text = await res.text();
                try {
                    const err = JSON.parse(text);
                    setHallOfFameMessage(`Error: ${err.error || 'Operation failed'}`);
                } catch (e) {
                    console.error("Non-JSON response:", text);
                    setHallOfFameMessage(`Error: Server returned unexpected status ${res.status}`);
                }
            }
        } catch (e: any) {
            console.error("Network error:", e);
            setHallOfFameMessage(`Error: Connection failed - ${e.message}`);
        }
    };

    const handleDeleteHallOfFameEntry = async (id: number) => {
        if (!confirm('Are you sure you want to delete this entry?')) return;
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        try {
            const res = await fetch(`http://localhost:3000/api/admin/hall-of-fame/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchHallOfFameEntries();
            else alert('Failed to delete entry');
        } catch (e) { alert('Error deleting entry'); }
    };


    const filteredRegistrations = registrations.filter(r =>
        r.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employee_code?.includes(searchTerm) ||
        r.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredFeedbacks = feedbacks.filter(f =>
        f.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.feedback_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedEvents = [...calendarEvents].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    return (
        <div className="min-h-screen bg-gray-50 pt-32 px-4 pb-12">
            <div className="max-w-7xl mx-auto">
                <BackButton className="mb-6" />
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-cyan-600 drop-shadow-sm">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-500 mt-1">Overview of club activities</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium text-gray-600">Live Database</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>

                {/* Search & Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
                        <button
                            onClick={() => setActiveTab('registrations')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'registrations' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Users size={18} /> Registrations
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{registrations.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('feedback')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'feedback' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <MessageSquare size={18} /> User Feedback
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{feedbacks.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="font-bold">📅</span> Calendar
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{calendarEvents.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('whats-new')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'whats-new' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="font-bold">🔔</span> What's New
                        </button>
                        <button
                            onClick={() => setActiveTab('upcoming-events')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'upcoming-events' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="font-bold">🚀</span> Upcoming Events
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{upcomingEvents.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('hall-of-fame')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'hall-of-fame' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="font-bold">🏆</span> Hall of Fame
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{hallOfFameEntries.length}</span>
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading data...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            {activeTab === 'registrations' && (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Employee Code</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Department</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Sports</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredRegistrations.map((reg) => (
                                            <tr key={reg.employee_code} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">{reg.employee_code}</td>
                                                <td className="px-6 py-4 text-gray-600">{reg.full_name}</td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    <div className="flex flex-col">
                                                        <span>{reg.department}</span>
                                                        <span className="text-xs text-gray-400">{reg.designation}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                                    {(() => {
                                                        try {
                                                            const sports = JSON.parse(reg.sports_interested);
                                                            return Array.isArray(sports) ? sports.join(', ') : reg.sports_interested;
                                                        } catch (e) {
                                                            return reg.sports_interested;
                                                        }
                                                    })()}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(reg.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'feedback' && (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Type</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Rating</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Message</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600">From</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredFeedbacks.map((fb) => (
                                            <tr key={fb.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize
                                                        ${fb.feedback_type === 'suggestion' ? 'bg-blue-50 text-blue-600' :
                                                            fb.feedback_type === 'complaint' ? 'bg-red-50 text-red-600' :
                                                                'bg-green-50 text-green-600'}`}>
                                                        {fb.feedback_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex text-yellow-400 text-xs">
                                                        {'★'.repeat(fb.experience_rating)}
                                                        <span className="text-gray-200">{'★'.repeat(5 - fb.experience_rating)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 max-w-md">{fb.message}</td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {fb.name || <span className="text-gray-400 italic">Anonymous</span>}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(fb.submitted_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'calendar' && (
                                <div className="p-6">
                                    {/* Add/Edit Form */}
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">{isEditingEvent ? 'Edit Event' : 'Add New Event'}</h3>
                                        <div className="grid md:grid-cols-4 gap-4">
                                            <div className="md:col-span-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentEvent.sport}
                                                    onChange={e => setCurrentEvent({ ...currentEvent, sport: e.target.value })}
                                                    placeholder="e.g. Cricket"
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentEvent.event_name}
                                                    onChange={e => setCurrentEvent({ ...currentEvent, event_name: e.target.value })}
                                                    placeholder="e.g. Merchants Cup"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentEvent.event_date}
                                                    onChange={e => setCurrentEvent({ ...currentEvent, event_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                                <select
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentEvent.event_type}
                                                    onChange={e => setCurrentEvent({ ...currentEvent, event_type: e.target.value })}
                                                >
                                                    <option value="Internal">Internal</option>
                                                    <option value="External">External</option>
                                                    <option value="Corporate">Corporate</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-4 items-center">
                                            <button
                                                onClick={handleSaveEvent}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                            >
                                                {isEditingEvent ? 'Update Event' : 'Add Event'}
                                            </button>

                                            {isEditingEvent && (
                                                <button
                                                    onClick={cancelEdit}
                                                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                                >
                                                    Cancel
                                                </button>
                                            )}

                                            {eventFormMessage && (
                                                <span className={`text-sm ${eventFormMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                                                    {eventFormMessage}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Events Table */}
                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-100 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Sport</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Event Name</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Type</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {sortedEvents.map((evt) => (
                                                    <tr key={evt.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{evt.sport}</td>
                                                        <td className="px-6 py-4 text-gray-600">{evt.event_name}</td>
                                                        <td className="px-6 py-4 text-gray-600">{formatDate(evt.event_date)}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium
                                                                ${evt.event_type === 'Internal' ? 'bg-green-50 text-green-600' :
                                                                    evt.event_type === 'External' ? 'bg-purple-50 text-purple-600' :
                                                                        'bg-blue-50 text-blue-600'}`}>
                                                                {evt.event_type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                            <button
                                                                onClick={() => startEdit(evt)}
                                                                className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteEvent(evt.id)}
                                                                className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {sortedEvents.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No events found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'whats-new' && (
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6">Manage What's New Cards</h3>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                                        {whatsNewItems.map((item) => (
                                            <div key={item.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex flex-col h-full">
                                                {editingWhatsNew === item.id ? (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                                value={tempWhatsNew.title}
                                                                onChange={(e) => setTempWhatsNew({ ...tempWhatsNew, title: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                            <textarea
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                                rows={3}
                                                                value={tempWhatsNew.description}
                                                                onChange={(e) => setTempWhatsNew({ ...tempWhatsNew, description: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Icon Type</label>
                                                            <select
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                                value={tempWhatsNew.icon_type}
                                                                onChange={(e) => setTempWhatsNew({ ...tempWhatsNew, icon_type: e.target.value })}
                                                            >
                                                                <option value="Bell">Bell</option>
                                                                <option value="Award">Award</option>
                                                                <option value="TrendingUp">TrendingUp</option>
                                                                <option value="Users">Users</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex gap-2 justify-end pt-2">
                                                            <button
                                                                onClick={handleCancelWhatsNew}
                                                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={handleSaveWhatsNew}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                            >
                                                                Save Changes
                                                            </button>
                                                        </div>
                                                        {whatsNewMessage && (
                                                            <p className="text-sm text-center text-blue-600 mt-2">{whatsNewMessage}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-start justify-between mb-4">
                                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold uppercase tracking-wider">
                                                                {item.icon_type} Icon
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                Updated: {new Date(item.updated_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h4>
                                                        <p className="text-gray-600 text-sm flex-grow mb-4">{item.description}</p>
                                                        <button
                                                            onClick={() => handleEditWhatsNew(item)}
                                                            className="w-full py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
                                                        >
                                                            Edit Content
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'upcoming-events' && (
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6">Manage Upcoming Events</h3>

                                    {/* Add/Edit Form */}
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                        <h4 className="text-lg font-bold text-gray-800 mb-4">{isEditingUpcomingEvent ? 'Edit Event' : 'Add New Event'}</h4>
                                        <h4 className="text-lg font-bold text-gray-800 mb-4">{isEditingUpcomingEvent ? 'Edit Event' : 'Add New Event'}</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentUpcomingEvent.event_name}
                                                    onChange={e => setCurrentUpcomingEvent({ ...currentUpcomingEvent, event_name: e.target.value })}
                                                    placeholder="e.g. Annual Cricket Tournament"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentUpcomingEvent.event_date}
                                                    onChange={e => setCurrentUpcomingEvent({ ...currentUpcomingEvent, event_date: e.target.value })}
                                                    placeholder="e.g. December 15, 2025"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentUpcomingEvent.event_time}
                                                    onChange={e => setCurrentUpcomingEvent({ ...currentUpcomingEvent, event_time: e.target.value })}
                                                    placeholder="e.g. 9:00 AM"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentUpcomingEvent.event_venue}
                                                    onChange={e => setCurrentUpcomingEvent({ ...currentUpcomingEvent, event_venue: e.target.value })}
                                                    placeholder="e.g. Main Cricket Ground"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Event Image</label>
                                                <div className="flex flex-col gap-2">
                                                    {currentUpcomingEvent.event_image && (
                                                        <div className="text-xs text-gray-500 mb-1">
                                                            Current: {currentUpcomingEvent.event_image.split('/').pop()}
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png"
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                // Validating file size (e.g., 5MB)
                                                                if (file.size > 5 * 1024 * 1024) {
                                                                    setUpcomingEventMessage('Error: File size too large (max 5MB)');
                                                                    e.target.value = ''; // Reset input
                                                                    return;
                                                                }
                                                                setSelectedImage(file);
                                                            }
                                                        }}
                                                    />
                                                    <p className="text-xs text-gray-500">Allowed formats: JPG, PNG. Max size: 5MB.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-4 items-center">
                                            <button
                                                onClick={handleSaveUpcomingEvent}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                            >
                                                {isEditingUpcomingEvent ? 'Update Event' : 'Add Event'}
                                            </button>

                                            {isEditingUpcomingEvent && (
                                                <button
                                                    onClick={() => {
                                                        setIsEditingUpcomingEvent(false);
                                                        setCurrentUpcomingEvent({ id: 0, event_name: '', event_date: '', event_time: '', event_venue: '', event_image: '' });
                                                        setSelectedImage(null);
                                                        setUpcomingEventMessage('');
                                                    }}
                                                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                                >
                                                    Cancel
                                                </button>
                                            )}

                                            {upcomingEventMessage && (
                                                <span className={`text-sm ${upcomingEventMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                                                    {upcomingEventMessage}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* List */}
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {upcomingEvents.map((event) => (
                                            <div key={event.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div className="h-40 overflow-hidden relative">
                                                    <img src={getImageUrl(event.event_image)} alt={event.event_name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="font-bold text-lg text-gray-800 mb-2">{event.event_name}</h4>
                                                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                                                        <p>📅 {event.event_date}</p>
                                                        <p>⏰ {event.event_time}</p>
                                                        <p>📍 {event.event_venue}</p>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setIsEditingUpcomingEvent(true);
                                                                setCurrentUpcomingEvent({ ...event });
                                                                setSelectedImage(null);
                                                                setUpcomingEventMessage('');
                                                                window.scrollTo(0, 0);
                                                            }}
                                                            className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUpcomingEvent(event.id)}
                                                            className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'hall-of-fame' && (
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6">Manage Hall of Fame</h3>

                                    {/* Add/Edit Form */}
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                        <h4 className="text-lg font-bold text-gray-800 mb-4">{isEditingHallOfFame ? 'Edit Entry' : 'Add New Entry'}</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Winner / Team Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentHallOfFameEntry.winner_name}
                                                    onChange={e => setCurrentHallOfFameEntry({ ...currentHallOfFameEntry, winner_name: e.target.value })}
                                                    placeholder="e.g. John Doe / Cricket Team A"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentHallOfFameEntry.event_name}
                                                    onChange={e => setCurrentHallOfFameEntry({ ...currentHallOfFameEntry, event_name: e.target.value })}
                                                    placeholder="e.g. Annual Cricket Tournament"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Achievement Type</label>
                                                <select
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentHallOfFameEntry.achievement_type}
                                                    onChange={e => setCurrentHallOfFameEntry({ ...currentHallOfFameEntry, achievement_type: e.target.value })}
                                                >
                                                    <option value="Winner">Winner</option>
                                                    <option value="First Runner-Up">First Runner-Up</option>
                                                    <option value="Second Runner-Up">Second Runner-Up</option>
                                                    <option value="Special Achievement">Special Achievement</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentHallOfFameEntry.event_date}
                                                    onChange={e => setCurrentHallOfFameEntry({ ...currentHallOfFameEntry, event_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={currentHallOfFameEntry.event_venue}
                                                    onChange={e => setCurrentHallOfFameEntry({ ...currentHallOfFameEntry, event_venue: e.target.value })}
                                                    placeholder="e.g. Main Stadium"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                                                <div className="flex flex-col gap-2">
                                                    {currentHallOfFameEntry.event_image && (
                                                        <div className="text-xs text-gray-500 mb-1">
                                                            Current: {currentHallOfFameEntry.event_image.split('/').pop()}
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png"
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            if (file) setSelectedHallOfFameImage(file);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-4 items-center">
                                            <button
                                                onClick={handleSaveHallOfFameEntry}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                            >
                                                {isEditingHallOfFame ? 'Update Entry' : 'Add Entry'}
                                            </button>
                                            {isEditingHallOfFame && (
                                                <button
                                                    onClick={() => {
                                                        setIsEditingHallOfFame(false);
                                                        setCurrentHallOfFameEntry({
                                                            id: 0,
                                                            event_name: '',
                                                            event_date: '',
                                                            event_venue: '',
                                                            winner_name: '',
                                                            achievement_type: 'Winner',
                                                            event_image: ''
                                                        });
                                                        setHallOfFameMessage('');
                                                    }}
                                                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {hallOfFameMessage && (
                                                <span className={`text-sm ${hallOfFameMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                                                    {hallOfFameMessage}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hall of Fame Table */}
                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-100 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Winner</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Event</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Achievement</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {hallOfFameEntries.map((entry) => (
                                                    <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{entry.winner_name}</td>
                                                        <td className="px-6 py-4 text-gray-600">{entry.event_name}</td>
                                                        <td className="px-6 py-4 text-gray-600">{entry.achievement_type}</td>
                                                        <td className="px-6 py-4 text-gray-600">{formatDate(entry.event_date)}</td>
                                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setIsEditingHallOfFame(true);
                                                                    setCurrentHallOfFameEntry({ ...entry });
                                                                    window.scrollTo(0, 0);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteHallOfFameEntry(entry.id)}
                                                                className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {hallOfFameEntries.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No Hall of Fame entries found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
}
