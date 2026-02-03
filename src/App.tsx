import { useState, useEffect } from 'react';
import { Users, Trophy } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import QuickActions from './components/QuickActions';
import Committee from './components/Committee';
import Events from './components/Events';
import Updates from './components/Updates';

import Gallery from './components/Gallery';
import Registration from './components/Registration';
import Calendar from './components/Calendar';
import Feedback from './components/Feedback';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import About from './components/About';
import Vision from './components/Vision';
import HallOfFame from './components/HallOfFame';

// Import images for Gallery Preview
import galleryPreview1 from './assets/gallery-images/21.JPG';
import galleryPreview2 from './assets/gallery-images/30.jpg';
import galleryPreview3 from './assets/gallery-images/39.jpeg';

function App() {
  // Initialize state from URL param or default to 'home'
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'home';
  });

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.page) {
        setCurrentPage(event.state.page);
      } else {
        // Fallback to URL param if state is missing (e.g. direct link)
        const params = new URLSearchParams(window.location.search);
        setCurrentPage(params.get('page') || 'home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when page changes, but only if it wasn't a popstate event
  // We'll wrap the setPage logic in a helper to clean this up
  const navigateTo = (page: string) => {
    setCurrentPage(page);
    const url = new URL(window.location.href);
    if (page === 'home') {
      // Clean URL for home
      url.search = '';
    } else {
      url.searchParams.set('page', page);
    }
    window.history.pushState({ page }, '', url.toString());
    window.scrollTo(0, 0);
  };

  // Compatibility for existing window.scrollTo(0,0) behavior
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />

      {currentPage === 'home' && (
        <>
          <Hero />
          <QuickActions onNavigate={navigateTo} />

          <div className="flex flex-wrap justify-center gap-8 py-8">
            <button
              onClick={() => navigateTo('committee')}
              className="group relative backdrop-blur-xl bg-white/40 rounded-2xl p-6 border border-white/50 hover:bg-white/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full max-w-sm flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-1">Executive Committee</h3>
              <p className="text-sm text-gray-600">Club officials and board members</p>
            </button>

            <button
              onClick={() => navigateTo('hall-of-fame')}
              className="group relative backdrop-blur-xl bg-white/40 rounded-2xl p-6 border border-white/50 hover:bg-white/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full max-w-sm flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-1">Hall of Fame</h3>
              <p className="text-sm text-gray-600">Our legends and special achievers</p>
            </button>
          </div>

          <Events />
          <Updates />

          {/* Gallery Preview Section */}
          <div className="py-16 px-4 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Moments from CESC Officers' Sports Club</h2>
                <div className="h-1 w-20 bg-blue-600 mt-2"></div>
              </div>
              <button
                onClick={() => navigateTo('gallery')}
                className="text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-1 group"
              >
                View Full Gallery
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[galleryPreview1, galleryPreview2, galleryPreview3].map((img, idx) => (
                <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigateTo('gallery')}>
                  <img
                    src={img}
                    alt={`Gallery Preview ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {currentPage === 'about' && <About />}

      {currentPage === 'vision' && <Vision />}

      {currentPage === 'contact' && (
        <div className="pt-24 px-4 max-w-7xl mx-auto">
          <div className="backdrop-blur-xl bg-white/40 rounded-3xl p-12 border border-white/50 shadow-2xl">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-8">Contact Us</h1>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Address</h3>
                <p className="text-gray-700">CESC Officers' Sports Club<br />Kolkata, West Bengal</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
                <p className="text-gray-700">Email: info@cescsportsclub.com<br />Phone: +91 XXXX XXXXXX</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'register' && <Registration />}

      {currentPage === 'calendar' && <Calendar />}

      {currentPage === 'gallery' && (
        <div className="pt-24">
          <Gallery />
        </div>
      )}

      {currentPage === 'feedback' && <Feedback />}

      {currentPage === 'committee' && <Committee />}

      {currentPage === 'hall-of-fame' && <HallOfFame />}

      {currentPage === 'admin-login' && (
        <AdminLogin onLoginSuccess={() => navigateTo('admin-dashboard')} />
      )}

      {currentPage === 'admin-dashboard' && (
        <AdminDashboard onLogout={() => navigateTo('home')} />
      )}

      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default App;
