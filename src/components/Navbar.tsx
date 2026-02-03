import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import cescLogo from '../assets/logo/logo-cesc-new - Copy.png';
import clubLogo from '../assets/logo/CESC Sports club logo.jpg';
import rpsgLogo from '../assets/logo/RPSG Logo.png';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'vision', label: 'Vision & Mission' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'register', label: 'Register' },
    { id: 'contact', label: 'Contact' },
    { id: 'feedback', label: 'Feedback' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-2">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/50 shadow-lg px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={rpsgLogo} alt="RPSG" className="h-10 w-auto object-contain shrink-0" />
              <img src={cescLogo} alt="CESC" className="h-10 w-auto object-contain shrink-0" />
              <img src={clubLogo} alt="Sports Club" className="h-16 w-auto object-contain rounded-full mix-blend-multiply shrink-0" />
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${currentPage === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-white/50'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/50 transition-all"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200/50">
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 rounded-xl font-medium transition-all ${currentPage === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                      : 'text-gray-700 hover:bg-white/50'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
