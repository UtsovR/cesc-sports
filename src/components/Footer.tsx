import { Facebook, X, Instagram, Youtube, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import cescLogo from '../assets/logo/logo-cesc-new - Copy.png';
import clubLogo from '../assets/logo/CESC Sports club logo.jpg';
import rpsgLogo from '../assets/logo/RPSG Logo.png';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="px-4 py-12 mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white/40 rounded-3xl p-12 border border-white/50">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={rpsgLogo} alt="RPSG" className="h-10 w-auto object-contain shrink-0" />
                <img src={cescLogo} alt="CESC" className="h-10 w-auto object-contain shrink-0" />
                <img src={clubLogo} alt="Sports Club" className="h-16 w-auto object-contain rounded-full mix-blend-multiply shrink-0" />
              </div>
              <p className="text-gray-600 text-sm">
                Building champions and fostering sporting excellence since 1995.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button onClick={() => onNavigate?.('about')} className="hover:text-blue-600 transition-colors">About Us</button></li>
                <li><button onClick={() => onNavigate?.('vision')} className="hover:text-blue-600 transition-colors">Vision & Mission</button></li>
                <li><button onClick={() => onNavigate?.('committee')} className="hover:text-blue-600 transition-colors">Executive Committee</button></li>
                <li><button onClick={() => onNavigate?.('register')} className="hover:text-blue-600 transition-colors">Registration</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Sports</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button onClick={() => onNavigate?.('calendar')} className="hover:text-blue-600 transition-colors">Events</button></li>
                <li><button onClick={() => onNavigate?.('feedback')} className="hover:text-blue-600 transition-colors">Feedback</button></li>
                <li><button onClick={() => onNavigate?.('gallery')} className="hover:text-blue-600 transition-colors">Gallery</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Mail size={16} className="mr-2" />
                  <a href="mailto:cesclimited@rpsg.in" className="hover:text-blue-600 transition-colors">cesclimited@rpsg.in</a>
                </li>
                <li className="flex items-center">
                  <Phone size={16} className="mr-2" />
                  <a href="tel:033-22256040" className="hover:text-blue-600 transition-colors">033-22256040–49</a>
                </li>
                <li className="flex items-start">
                  <MapPin size={16} className="mr-2 mt-1 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">Head Office</span>
                    <span>CESC House</span>
                    <span>Chowringhee Square</span>
                    <span>Kolkata – 700001</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200/50 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                © 2025 CESC Officers' Sports Club.
              </p>
              <button
                onClick={() => onNavigate?.('admin-login')}
                className="text-xs text-gray-400 hover:text-blue-600 transition-colors font-medium border-l pl-4 border-gray-300"
              >
                Admin Login
              </button>
            </div>

            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/CESCLtd"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Facebook className="text-white" size={20} />
              </a>
              <a
                href="https://x.com/CESCLimited"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <X className="text-white" size={18} />
              </a>
              <a
                href="https://www.instagram.com/cesc_limited/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Instagram className="text-white" size={20} />
              </a>
              <a
                href="https://www.linkedin.com/company/1000128/admin/dashboard/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Linkedin className="text-white" size={20} />
              </a>
              <a
                href="https://www.youtube.com/@cesclimited5277/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Youtube className="text-white" size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
