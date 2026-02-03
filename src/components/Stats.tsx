import { Users, Trophy, Calendar, Award } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '2,500+',
    label: 'Active Members',
    gradient: 'from-blue-500 to-cyan-400'
  },
  {
    icon: Trophy,
    value: '150+',
    label: 'Championships Won',
    gradient: 'from-emerald-500 to-teal-400'
  },
  {
    icon: Calendar,
    value: '50+',
    label: 'Annual Events',
    gradient: 'from-orange-500 to-amber-400'
  },
  {
    icon: Award,
    value: '25+',
    label: 'Sports Categories',
    gradient: 'from-purple-500 to-pink-400'
  }
];

export default function Stats() {
  return (
    <div className="px-4 py-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="backdrop-blur-xl bg-white/40 rounded-2xl p-6 border border-white/50 hover:bg-white/60 transition-all duration-300 hover:scale-105 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
