import { useMemo } from 'react';
import BackButton from './BackButton';

// Use Vite's Glob Import to load images dynamically from assets
const modules = import.meta.glob('../assets/gallery-images/*.{png,jpg,jpeg,svg,JPG,JPEG}', { eager: true });

export default function Gallery() {
  const images = useMemo(() => {
    const allImages = Object.keys(modules).map((path) => {
      const mod = modules[path] as { default: string };
      const filename = path.split('/').pop() || '';
      return {
        url: mod.default,
        filename: filename
      };
    });

    // Extract 30.jpg
    const fixedImageIndex = allImages.findIndex(img => img.filename.toLowerCase() === '30.jpg');
    let fixedImage = null;
    let others = [...allImages];

    if (fixedImageIndex !== -1) {
      fixedImage = others[fixedImageIndex];
      others.splice(fixedImageIndex, 1);
    }

    // Shuffle others
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }

    // Combine
    return fixedImage ? [fixedImage, ...others] : others;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-cyan-50/20">
      <div className="px-4 py-16 max-w-7xl mx-auto">
        <BackButton className="mb-8" />
        {/* Header Section with Quote */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-cyan-500 mb-6 rounded-full"></div>
            <blockquote className="text-2xl md:text-3xl font-light text-gray-700 italic leading-relaxed">
              "Every frame tells a story of <span className="font-semibold text-blue-600">passion</span>, <span className="font-semibold text-blue-600">teamwork</span>, and sporting <span className="font-semibold text-blue-600">excellence</span>."
            </blockquote>
          </div>

          {/* Simple count indicator */}
          <span className="text-gray-400 text-sm font-medium tracking-wider uppercase border-l-2 border-gray-200 pl-4">
            {images.length} Moments Captured
          </span>
        </div>

        {/* Gallery Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((image, index) => (
            <div
              key={`${image.filename}-${index}`}
              className="break-inside-avoid relative group"
            >
              <div className="rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                <img
                  src={image.url}
                  alt={`Sports Club Moment ${index + 1}`}
                  className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Subtle sheen effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="py-24 text-center border border-dashed border-gray-200 rounded-3xl bg-white/50">
            <p className="text-gray-400 font-medium tracking-wide">
              Gallery update in progress
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
