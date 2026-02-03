import { CreditCard, Calendar, Archive, MessageCircle, X, Phone, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';

interface QuickActionsProps {
  onNavigate: (page: string) => void;
}

export default function QuickActions({ onNavigate }: QuickActionsProps) {
  const [showContacts, setShowContacts] = useState(false);
  const [showFacilities, setShowFacilities] = useState(false);

  const actions = [
    {
      icon: CreditCard,
      title: 'Registration',
      description: 'Apply for membership',
      gradient: 'from-blue-500 to-blue-600',
      glow: 'group-hover:shadow-blue-500/50',
      onClick: () => onNavigate('register')
    },
    {
      icon: Calendar,
      title: 'Events',
      description: 'Upcoming tournaments',
      gradient: 'from-cyan-500 to-cyan-600',
      glow: 'group-hover:shadow-cyan-500/50',
      onClick: () => onNavigate('calendar')
    },
    {
      icon: MessageCircle,
      title: 'Feedback Contacts',
      description: 'Reach out to us',
      gradient: 'from-emerald-500 to-emerald-600',
      glow: 'group-hover:shadow-emerald-500/50',
      onClick: () => setShowContacts(true)
    },
    {
      icon: Archive,
      title: 'Available Facilities',
      description: 'Sports & Venues',
      gradient: 'from-purple-500 to-purple-600',
      glow: 'group-hover:shadow-purple-500/50',
      onClick: () => setShowFacilities(true)
    },

  ];

  const facilities = [
    {
      sport: 'TENNIS',
      venue: 'SOUTH CLUB LIMITED',
      contactName: 'Mr. Sampad Ghosh',
      contactNumber: '7044065455',
      emails: ['sampad.ghosh@rpsg.in', 'suhash.chakraborty@rpsg.in']
    },
    {
      sport: 'TENNIS',
      venue: 'SOUTHERN GENERATING STATION (SGS)',
      contactName: 'Mr. Sampad Ghosh',
      contactNumber: '7044065455',
      emails: ['sampad.ghosh@rpsg.in', 'suhash.chakraborty@rpsg.in']
    },
    {
      sport: 'CRICKET',
      venue: 'TURF XL',
      contactName: 'Mr. Majidur Islam',
      contactNumber: '9163361925',
      emails: ['majidur.islam@rpsg.in', 'suhash.chakraborty@rpsg.in']
    },
    {
      sport: 'TABLE TENNIS',
      venue: 'DHANUKA DHUNSERI TABLE TENNIS ACADEMY',
      contactName: 'Mr. Ramkrishna Saha',
      contactNumber: '9748420281',
      emails: ['ram.saha@rpsg.in', 'suhash.chakraborty@rpsg.in']
    },
    {
      sport: 'BADMINTON',
      venue: 'SPUDDY BADMINTON ACADEMY',
      contactName: 'Mr. Soumyajit Konar',
      contactNumber: '8617222676',
      emails: ['soumyajit.konar@rpsg.in', 'suhash.chakraborty@rpsg.in']
    },
    {
      sport: 'BADMINTON',
      venue: 'SMASH, TOLLYGUNGE (upcoming)',
      contactName: 'Mr. Soumyajit Konar',
      contactNumber: '8617222676',
      emails: ['soumyajit.konar@rpsg.in', 'suhash.chakraborty@rpsg.in']
    },
  ];

  return (
    <>
      <div className="px-4 py-16 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Quick Actions
        </h2>

        <div className="flex flex-wrap justify-center gap-16">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`group backdrop-blur-xl bg-white/40 rounded-2xl p-6 border border-white/50 hover:bg-white/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${action.glow}`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contacts Modal */}
      {showContacts && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowContacts(false)}
          ></div>
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full relative z-10 shadow-2xl animate-fade-in border border-white/50">
            <button
              onClick={() => setShowContacts(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>

            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent flex items-center gap-2">
              <MessageCircle className="w-8 h-8 text-emerald-500" />
              Feedback Contacts
            </h3>

            <p className="text-gray-600 mb-8 border-b pb-4">
              For feedback, please write to:
            </p>

            <div className="space-y-6">
              {[
                {
                  name: 'Mr. Suhash Chakraborty',
                  email: 'suhash.chakraborty@rpsg.in',
                  phone: '9051235900',
                  color: 'bg-blue-50 text-blue-600'
                },
                {
                  name: 'Mr. Amit Das',
                  email: 'amit.das@rpsg.in',
                  phone: '9238003949',
                  color: 'bg-purple-50 text-purple-600'
                },
                {
                  name: 'Ms. Rajrupa Majumdar',
                  email: 'rajrupa.majumdar@rpsg.in',
                  phone: '9831119855',
                  color: 'bg-rose-50 text-rose-600'
                }
              ].map((contact, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className={`w-12 h-12 rounded-xl ${contact.color} flex items-center justify-center flex-shrink-0 font-bold text-lg`}>
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800 text-lg">{contact.name}</h4>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${contact.email}`} className="hover:text-blue-600 transition-colors">
                          {contact.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${contact.phone}`} className="hover:text-blue-600 transition-colors">
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setShowContacts(false)}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Facilities Modal */}
      {showFacilities && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowFacilities(false)}
          ></div>
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 max-w-6xl w-full relative z-10 shadow-2xl animate-fade-in border border-white/50 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowFacilities(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-20"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>

            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent inline-flex items-center gap-3">
                <MapPin className="w-8 h-8 text-purple-500" />
                AVAILABLE FACILITIES
              </h3>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-900">
                    <th className="p-4 font-bold border-b border-yellow-500/20 rounded-tl-xl">SPORTS</th>
                    <th className="p-4 font-bold border-b border-yellow-500/20">VENUE</th>
                    <th className="p-4 font-bold border-b border-yellow-500/20">CESCOSC CONTACT NAME</th>
                    <th className="p-4 font-bold border-b border-yellow-500/20">CONTACT NUMBER</th>
                    <th className="p-4 font-bold border-b border-yellow-500/20 rounded-tr-xl">CESCOSC CONTACT e-mail ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {facilities.map((items, index) => (
                    <tr key={index} className="hover:bg-purple-50/50 transition-colors bg-white/50">
                      <td className="p-4 font-bold text-purple-700 bg-purple-50/30">{items.sport}</td>
                      <td className="p-4 font-medium text-gray-800">{items.venue}</td>
                      <td className="p-4 text-gray-700 font-medium">{items.contactName}</td>
                      <td className="p-4 font-mono text-gray-600">{items.contactNumber}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {items.emails.map((email, i) => (
                            <a
                              key={i}
                              href={`mailto:${email}`}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
                              {email}
                            </a>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setShowFacilities(false)}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                Close Facilities
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
