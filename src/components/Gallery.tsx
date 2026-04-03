import { useEffect, useState } from 'react';
import BackButton from './BackButton';
import { supabase } from '../lib/supabase';
import galleryPreview1 from '../assets/gallery-images/21.JPG';
import galleryPreview2 from '../assets/gallery-images/30.jpg';
import galleryPreview3 from '../assets/gallery-images/39.jpeg';

interface PreGalleryImage {
  id: number;
  image_url: string;
  display_order: number;
}

interface GalleryCategory {
  id: number;
  name: string;
}

interface GalleryImage {
  id: number;
  image_url: string;
  category_id: number;
}

const fallbackPreGalleryImages = [galleryPreview1, galleryPreview2, galleryPreview3];
const galleryCategoryOrder = ['cricket', 'football', 'badminton', 'lawn_tennis', 'table_tennis', 'workshops'] as const;

const formatGalleryCategoryLabel = (name: string) => name
  .split('_')
  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const sortGalleryCategories = (categories: GalleryCategory[]) => [...categories].sort((first, second) => {
  const firstIndex = galleryCategoryOrder.indexOf(first.name as typeof galleryCategoryOrder[number]);
  const secondIndex = galleryCategoryOrder.indexOf(second.name as typeof galleryCategoryOrder[number]);
  const normalizedFirstIndex = firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex;
  const normalizedSecondIndex = secondIndex === -1 ? Number.MAX_SAFE_INTEGER : secondIndex;

  if (normalizedFirstIndex !== normalizedSecondIndex) {
    return normalizedFirstIndex - normalizedSecondIndex;
  }

  return first.name.localeCompare(second.name);
});

export default function Gallery() {
  const [preGalleryImages, setPreGalleryImages] = useState<PreGalleryImage[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<number, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | null>(null);
  const [selectedCategoryImages, setSelectedCategoryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategoryError, setSelectedCategoryError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchGalleryOverview = async () => {
      try {
        const [preGalleryResponse, categoriesResponse, countsResponse] = await Promise.all([
          supabase.from('pregallery_images').select('id, image_url, display_order').order('display_order', { ascending: true }),
          supabase.from('gallery_categories').select('id, name'),
          supabase.from('gallery_images').select('category_id')
        ]);

        if (preGalleryResponse.error || categoriesResponse.error || countsResponse.error) {
          throw preGalleryResponse.error || categoriesResponse.error || countsResponse.error;
        }

        if (!isMounted) {
          return;
        }

        const counts = (countsResponse.data || []).reduce<Record<number, number>>((accumulator, image) => {
          accumulator[image.category_id] = (accumulator[image.category_id] || 0) + 1;
          return accumulator;
        }, {});

        setPreGalleryImages(preGalleryResponse.data || []);
        setCategories(sortGalleryCategories((categoriesResponse.data || []) as GalleryCategory[]));
        setCategoryCounts(counts);
        setError('');
      } catch (error) {
        console.error('Failed to load gallery overview:', error);
        if (isMounted) {
          setError('Gallery folders are loading with limited data right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchGalleryOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectCategory = async (category: GalleryCategory) => {
    setSelectedCategory(category);
    setSelectedCategoryImages([]);
    setSelectedCategoryError('');
    setCategoryLoading(true);

    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('id, image_url, category_id')
        .eq('category_id', category.id)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSelectedCategoryImages((data || []) as GalleryImage[]);
    } catch (error) {
      console.error(`Failed to load ${category.name} gallery:`, error);
      setSelectedCategoryError(`Unable to load the ${formatGalleryCategoryLabel(category.name)} folder right now.`);
    } finally {
      setCategoryLoading(false);
    }
  };

  const previewImages = fallbackPreGalleryImages.map((fallbackImage, index) => (
    preGalleryImages.find((image) => image.display_order === index + 1)?.image_url || fallbackImage
  ));
  const isUsingPreGalleryFallback = preGalleryImages.length < 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-cyan-50/20">
      <div className="px-4 py-16 max-w-7xl mx-auto">
        <BackButton className="mb-8" />

        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-cyan-500 mb-6 rounded-full"></div>
            <blockquote className="text-2xl md:text-3xl font-light text-gray-700 italic leading-relaxed">
              "Every frame tells a story of <span className="font-semibold text-blue-600">passion</span>, <span className="font-semibold text-blue-600">teamwork</span>, and sporting <span className="font-semibold text-blue-600">excellence</span>."
            </blockquote>
          </div>

          <span className="text-gray-400 text-sm font-medium tracking-wider uppercase border-l-2 border-gray-200 pl-4">
            {selectedCategory ? `${selectedCategoryImages.length} Photos in View` : `${categories.length} Folders Available`}
          </span>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
            {error}
          </div>
        )}

        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Moments from CESC Officers&apos; Sports Club</h2>
              <p className="mt-2 text-sm text-gray-500">
                Admin-managed highlights appear here before the category folders.
              </p>
            </div>
          </div>

          {(loading || isUsingPreGalleryFallback) && (
            <p className="mb-4 text-sm text-gray-500">
              {loading
                ? 'Loading gallery highlights...'
                : 'Some highlight slots are using fallback images until all three admin-managed images are uploaded.'}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previewImages.map((image, index) => (
              <div key={`preview-${index}`} className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/60 bg-white shadow-lg">
                <img
                  src={image}
                  alt={`Gallery Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>

        {!selectedCategory ? (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Gallery Folders</h2>
              <p className="mt-2 text-sm text-gray-500">
                Choose a sport or workshop folder to open its gallery.
              </p>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 py-16 text-center text-gray-400">
                Loading gallery folders...
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 py-16 text-center text-gray-400">
                Gallery folders will appear here once categories are configured.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => void handleSelectCategory(category)}
                    className="group rounded-3xl border border-white/60 bg-white/70 p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="mb-10 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                      Folder
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-gray-800">{formatGalleryCategoryLabel(category.name)}</h3>
                      <p className="text-sm text-gray-500">
                        {categoryCounts[category.id] || 0} image{categoryCounts[category.id] === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="mt-8 text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-1">
                      Open Folder
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{formatGalleryCategoryLabel(selectedCategory.name)} Gallery</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Browse all images uploaded to this folder.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedCategoryImages([]);
                  setSelectedCategoryError('');
                }}
                className="self-start rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Back to Folders
              </button>
            </div>

            {categoryLoading ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 py-16 text-center text-gray-400">
                Loading {formatGalleryCategoryLabel(selectedCategory.name)} images...
              </div>
            ) : selectedCategoryError ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-6 text-sm text-amber-700">
                {selectedCategoryError}
              </div>
            ) : selectedCategoryImages.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 py-16 text-center text-gray-400">
                No images have been uploaded to this folder yet.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {selectedCategoryImages.map((image, index) => (
                  <div key={`${image.id}-${index}`} className="overflow-hidden rounded-3xl border border-white/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <img
                      src={image.image_url}
                      alt={`${formatGalleryCategoryLabel(selectedCategory.name)} ${index + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
