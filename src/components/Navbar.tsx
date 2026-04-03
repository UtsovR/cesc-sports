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
    { id: 'committee', label: 'Executive Committee' },
    { id: 'feedback', label: 'Feedback' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-2.5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1680px]">
        <div className="rounded-[28px] border border-white/50 bg-white/30 px-5 py-3 shadow-lg backdrop-blur-xl sm:px-7 lg:px-8">
          <div className="flex items-center justify-between gap-5 lg:gap-10">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4 lg:gap-5 lg:pr-4">
              <img
                src={rpsgLogo}
                alt="RPSG"
                className="h-10 w-auto shrink-0 object-contain sm:h-11"
              />
              <img
                src={cescLogo}
                alt="CESC"
                className="h-10 w-auto shrink-0 object-contain sm:h-11"
              />
              <img
                src={clubLogo}
                alt="Sports Club"
                className="h-14 w-auto shrink-0 rounded-full object-contain mix-blend-multiply sm:h-16"
              />
            </div>

            <div className="hidden flex-1 items-center justify-end gap-1.5 md:flex lg:gap-2 xl:gap-2.5">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`rounded-2xl px-3.5 py-2.5 text-[14px] font-medium leading-none whitespace-nowrap transition-all duration-300 lg:px-4 xl:px-5 xl:text-[15px] ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                      : 'text-gray-700 hover:bg-white/55'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-2xl p-2.5 transition-all hover:bg-white/50 md:hidden"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="mt-5 border-t border-gray-200/50 pt-5 md:hidden">
              <div className="space-y-2.5">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full rounded-2xl px-4 py-3 text-left font-medium transition-all ${
                      currentPage === item.id
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
