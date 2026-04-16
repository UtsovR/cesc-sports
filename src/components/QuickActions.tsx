import { CreditCard, Calendar, Archive, MessageCircle } from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (page: string) => void;
}

export default function QuickActions({ onNavigate }: QuickActionsProps) {
  const actions = [
    {
      icon: CreditCard,
      title: 'Register',
      description: "Join the club's sporting journey",
      gradient: 'from-blue-500 to-blue-600',
      glow: 'group-hover:shadow-blue-500/50',
      onClick: () => onNavigate('register')
    },
    {
      icon: Calendar,
      title: 'Events',
      description: 'Explore fixtures and tournaments',
      gradient: 'from-cyan-500 to-cyan-600',
      glow: 'group-hover:shadow-cyan-500/50',
      onClick: () => onNavigate('calendar')
    },
    {
      icon: MessageCircle,
      title: 'Feedback',
      description: 'Share your voice with us',
      gradient: 'from-emerald-500 to-emerald-600',
      glow: 'group-hover:shadow-emerald-500/50',
      onClick: () => onNavigate('feedback')
    },
    {
      icon: Archive,
      title: 'Facility & Contacts',
      description: 'Explore facilities and get in touch with us',
      gradient: 'from-purple-500 to-purple-600',
      glow: 'group-hover:shadow-purple-500/50',
      onClick: () => onNavigate('facility-contacts')
    }
  ];

  return (
    <div className="px-4 py-16 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`group backdrop-blur-xl bg-white/40 rounded-xl p-5 border border-white/50 hover:bg-white/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full flex flex-col items-center text-center ${action.glow}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                <Icon className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 text-lg">{action.title}</h3>
              <p className="text-xs text-gray-600 leading-tight">{action.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
