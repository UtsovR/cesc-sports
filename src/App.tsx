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
import FacilityContacts from './components/FacilityContacts';
import { supabase } from './lib/supabase';

import galleryPreview1 from './assets/gallery-images/21.JPG';
import galleryPreview2 from './assets/gallery-images/30.jpg';
import galleryPreview3 from './assets/gallery-images/39.jpeg';

interface PreGalleryImage {
  id: number;
  image_url: string;
  display_order: number;
}

const legacyValues = [
  {
    title: 'Discipline',
    description: 'We encourage commitment, consistency, and respect in every sporting pursuit.'
  },
  {
    title: 'Teamwork',
    description: 'Shared effort and collective pride remain at the heart of the club community.'
  },
  {
    title: 'Excellence',
    description: 'From participation to performance, the club continues to raise sporting standards.'
  },
  {
    title: 'Participation',
    description: 'Employees and families are invited to stay active, connected, and inspired together.'
  }
] as const;

const getPageFromLocation = () => {
  if (window.location.pathname === '/facility-contacts') {
    return 'facility-contacts';
  }

  const params = new URLSearchParams(window.location.search);
  return params.get('page') || 'home';
};

function App() {
  const fallbackPreGalleryImages = [galleryPreview1, galleryPreview2, galleryPreview3];
  const [currentPage, setCurrentPage] = useState(() => getPageFromLocation());
  const [preGalleryImages, setPreGalleryImages] = useState<PreGalleryImage[]>([]);
  const [preGalleryLoading, setPreGalleryLoading] = useState(true);
  const [preGalleryError, setPreGalleryError] = useState('');

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.page) {
        setCurrentPage(event.state.page);
      } else {
        setCurrentPage(getPageFromLocation());
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    const url = new URL(window.location.href);

    if (page === 'home') {
      url.pathname = '/';
      url.search = '';
    } else if (page === 'facility-contacts') {
      url.pathname = '/facility-contacts';
      url.search = '';
    } else {
      url.pathname = '/';
      url.search = '';
      url.searchParams.set('page', page);
    }

    window.history.pushState({ page }, '', url.toString());
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    let isMounted = true;

    const fetchPreGalleryImages = async () => {
      try {
        const { data, error } = await supabase
          .from('pregallery_images')
          .select('id, image_url, display_order')
          .order('display_order', { ascending: true });

        if (error) {
          throw error;
        }

        if (isMounted) {
          setPreGalleryImages(data || []);
          setPreGalleryError('');
        }
      } catch (error) {
        console.error('Failed to load pre-gallery images:', error);
        if (isMounted) {
          setPreGalleryError('Showing default preview images while admin-managed images are unavailable.');
        }
      } finally {
        if (isMounted) {
          setPreGalleryLoading(false);
        }
      }
    };

    void fetchPreGalleryImages();

    return () => {
      isMounted = false;
    };
  }, []);

  const previewImages = fallbackPreGalleryImages.map((fallbackImage, index) => (
    preGalleryImages.find((image) => image.display_order === index + 1)?.image_url || fallbackImage
  ));
  const isUsingPreGalleryFallback = preGalleryImages.length < 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />

      {currentPage === 'home' && (
        <>
          <Hero />
          <QuickActions onNavigate={navigateTo} />

          <section className="px-4 py-8 max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-gradient-to-br from-white via-blue-50/80 to-cyan-50/80 px-8 py-10 shadow-xl md:px-12 md:py-14">
              <div className="pointer-events-none absolute -top-16 right-0 h-48 w-48 rounded-full bg-cyan-200/30 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-blue-200/20 blur-3xl" />

              <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.9fr] lg:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-700">Our Legacy</p>
                  <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-slate-900 md:text-5xl">
                    Three decades of sporting spirit, shared growth, and community pride.
                  </h2>
                  <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg">
                    Since 1988, CESC Officers' Sports Club has created a space where employees and families can compete,
                    connect, and grow through sport. The club's journey reflects a lasting commitment to opportunity,
                    camaraderie, and the pursuit of excellence across every event, workshop, and team.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => navigateTo('calendar')}
                      className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                    >
                      Explore Events
                    </button>
                    <button
                      onClick={() => navigateTo('register')}
                      className="rounded-2xl border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-white"
                    >
                      Join the Sporting Journey
                    </button>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-3xl bg-slate-900 px-6 py-6 text-white shadow-lg">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">Since 1988</p>
                    <p className="mt-3 text-2xl font-bold leading-snug">
                      A heritage shaped by competition, belonging, and a culture of excellence.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {legacyValues.map((value) => (
                      <div
                        key={value.title}
                        className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur"
                      >
                        <h3 className="text-lg font-bold text-slate-900">{value.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap justify-center gap-8 py-8">
            <button
              onClick={() => navigateTo('committee')}
              className="group relative backdrop-blur-xl bg-white/40 rounded-2xl p-6 border border-white/50 hover:bg-white/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full max-w-sm flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-1">Executive Committee</h3>
              <p className="text-sm text-gray-600">Meet the leadership shaping the club's sporting journey.</p>
            </button>

            <button
              onClick={() => navigateTo('hall-of-fame')}
              className="group relative backdrop-blur-xl bg-white/40 rounded-2xl p-6 border border-white/50 hover:bg-white/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full max-w-sm flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-1">Hall of Fame</h3>
              <p className="text-sm text-gray-600">Celebrating achievers who strengthen the club's legacy.</p>
            </button>
          </div>

          <Events />
          <Updates />

          <div className="py-16 px-4 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Moments from CESC Officers' Sports Club</h2>
                <div className="h-1 w-20 bg-blue-600 mt-2"></div>
                <p className="mt-3 max-w-2xl text-sm text-gray-500">
                  A legacy of sporting excellence since 1988, reflected through every tournament, team, and shared celebration.
                </p>
              </div>
              <button
                onClick={() => navigateTo('gallery')}
                className="text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-1 group"
              >
                Explore the Gallery
                <span className="group-hover:translate-x-1 transition-transform">-&gt;</span>
              </button>
            </div>

            {(preGalleryLoading || preGalleryError || isUsingPreGalleryFallback) && (
              <p className="mb-4 text-sm text-gray-500">
                {preGalleryLoading
                  ? 'Loading latest preview...'
                  : preGalleryError || 'Some preview slots are using default images until all three admin-managed images are uploaded.'}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {previewImages.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => navigateTo('gallery')}
                >
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

      {currentPage === 'register' && <Registration />}

      {currentPage === 'calendar' && <Calendar />}

      {currentPage === 'gallery' && (
        <div className="pt-24">
          <Gallery />
        </div>
      )}

      {currentPage === 'feedback' && <Feedback />}

      {currentPage === 'facility-contacts' && <FacilityContacts />}

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
