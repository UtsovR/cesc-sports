import { Calendar, MapPin, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('upcoming_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load events', error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
      return imagePath;
    }
    return supabase.storage.from('events').getPublicUrl(imagePath).data.publicUrl;
  };

  return (
    <div className="px-4 py-16 max-w-7xl mx-auto">
      {/* Quote Section */}
      <div className="text-center mb-16">
        <blockquote className="text-2xl md:text-3xl font-light italic text-gray-600">
          "Where preparation meets passion, great events are born."
        </blockquote>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto mt-6 rounded-full"></div>
      </div>

      <div className="flex items-center justify-between mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Upcoming Events
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading events...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <div
              key={index}
              className="backdrop-blur-xl bg-white/40 rounded-2xl overflow-hidden border border-white/50 hover:bg-white/60 transition-all duration-300 hover:scale-105 group hover:shadow-2xl"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getImageUrl(event.event_image)}
                  alt={event.event_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-4 py-2 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg">
                    Upcoming
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{event.event_name}</h3>

                <div className="space-y-3 mb-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={18} className="mr-3 text-blue-500" />
                    <span className="text-sm font-medium">{event.event_date}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock size={18} className="mr-3 text-cyan-500" />
                    <span className="text-sm font-medium">{event.event_time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin size={18} className="mr-3 text-red-500" />
                    <span className="text-sm font-medium">{event.event_venue}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
