import { Archive, Mail, Phone } from 'lucide-react';

const facilityContacts = [
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
  }
];

export default function FacilityContacts() {
  return (
    <section className="px-4 pt-32 pb-16 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Facility & Contacts
        </h1>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Explore facilities and get in touch with us
        </p>
      </div>

      <div className="space-y-8">
        <div className="backdrop-blur-xl bg-white/40 rounded-3xl p-6 md:p-8 border border-white/50 shadow-lg">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent inline-flex items-center gap-3">
            <Archive className="w-7 h-7 text-purple-500" />
            Available Facilities
          </h2>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 shadow-lg">
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
                {facilities.map((item, index) => (
                  <tr key={index} className="hover:bg-purple-50/50 transition-colors bg-white/50">
                    <td className="p-4 font-bold text-purple-700 bg-purple-50/30">{item.sport}</td>
                    <td className="p-4 font-medium text-gray-800">{item.venue}</td>
                    <td className="p-4 text-gray-700 font-medium">{item.contactName}</td>
                    <td className="p-4 font-mono text-gray-600">{item.contactNumber}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {item.emails.map((email, emailIndex) => (
                          <a
                            key={emailIndex}
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
        </div>

        <div className="backdrop-blur-xl bg-white/40 rounded-3xl p-6 md:p-8 border border-white/50 shadow-lg">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Contact Points
          </h2>
          <p className="text-gray-600 mt-3">
            Reach out to the club team below to share suggestions, concerns, or appreciation.
          </p>

          <div className="mt-8 grid gap-4">
            {facilityContacts.map((contact, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 border border-white/60"
              >
                <div className={`w-12 h-12 rounded-xl ${contact.color} flex items-center justify-center flex-shrink-0 font-bold text-lg`}>
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-800 text-lg">{contact.name}</h3>
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
        </div>
      </div>
    </section>
  );
}
