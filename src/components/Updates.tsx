import { useState, useEffect } from 'react';
import { Bell, TrendingUp, Award, Users } from 'lucide-react';

interface UpdateItem {
  id: number;
  title: string;
  description: string;
  icon_type: string;
  updated_at: string;
}

const iconMap: Record<string, any> = {
  'Bell': Bell,
  'Award': Award,
  'TrendingUp': TrendingUp,
  'Users': Users
};

const typeStyles = [
  'from-blue-500 to-cyan-400',
  'from-emerald-500 to-teal-400',
  'from-orange-500 to-amber-400',
  'from-purple-500 to-pink-400'
];

export default function Updates() {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/whats-new')
      .then(res => res.json())
      .then(data => {
        setUpdates(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching updates:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="py-16 text-center text-gray-400">Loading updates...</div>;
  }

  return (
    <div className="px-4 py-16 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
        What's New
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {updates.map((update, index) => {
          const Icon = iconMap[update.icon_type] || Bell; // Default to Bell if unknown
          const style = typeStyles[index % typeStyles.length]; // cycle through styles

          return (
            <div
              key={update.id}
              className="backdrop-blur-xl bg-white/40 rounded-2xl p-6 border border-white/50 hover:bg-white/60 transition-all duration-300 hover:scale-105 group"
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">{update.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{update.description}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(update.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
