import { useEffect, useState } from 'react';
import BackButton from './BackButton';
import { supabase } from '../lib/supabase';
import type { GalleryFolder } from '../lib/galleryFolders';
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
  folder_id: number | null;
  uploaded_at?: string;
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

const sortGalleryFolders = (folders: GalleryFolder[]) => [...folders].sort((first, second) => {
  const nameComparison = first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });

  if (nameComparison !== 0) {
    return nameComparison;
  }

  return first.id - second.id;
});

const getFolderPath = (folderId: number, folders: GalleryFolder[]) => {
  const folderMap = new Map(folders.map((folder) => [folder.id, folder]));
  const path: GalleryFolder[] = [];
  const visitedFolderIds = new Set<number>();
  let currentFolder = folderMap.get(folderId);

  while (currentFolder && !visitedFolderIds.has(currentFolder.id)) {
    path.unshift(currentFolder);
    visitedFolderIds.add(currentFolder.id);
    currentFolder = currentFolder.parent_folder_id
      ? folderMap.get(currentFolder.parent_folder_id)
      : undefined;
  }

  return path;
};

export default function Gallery() {
  const [preGalleryImages, setPreGalleryImages] = useState<PreGalleryImage[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [folders, setFolders] = useState<GalleryFolder[]>([]);
  const [categoryImageCounts, setCategoryImageCounts] = useState<Record<number, number>>({});
  const [categoryFolderCounts, setCategoryFolderCounts] = useState<Record<number, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedCategoryImages, setSelectedCategoryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategoryError, setSelectedCategoryError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchGalleryOverview = async () => {
      try {
        const [preGalleryResponse, categoriesResponse, foldersResponse, imageCountsResponse] = await Promise.all([
          supabase.from('pregallery_images').select('id, image_url, display_order').order('display_order', { ascending: true }),
          supabase.from('gallery_categories').select('id, name'),
          supabase.from('gallery_folders').select('id, name, category_id, parent_folder_id'),
          supabase.from('gallery_images').select('category_id')
        ]);

        if (preGalleryResponse.error || categoriesResponse.error || foldersResponse.error || imageCountsResponse.error) {
          throw preGalleryResponse.error || categoriesResponse.error || foldersResponse.error || imageCountsResponse.error;
        }

        if (!isMounted) {
          return;
        }

        const nextFolders = (foldersResponse.data || []) as GalleryFolder[];
        const nextCategoryImageCounts = (imageCountsResponse.data || []).reduce<Record<number, number>>((accumulator, image) => {
          accumulator[image.category_id] = (accumulator[image.category_id] || 0) + 1;
          return accumulator;
        }, {});
        const nextCategoryFolderCounts = nextFolders.reduce<Record<number, number>>((accumulator, folder) => {
          accumulator[folder.category_id] = (accumulator[folder.category_id] || 0) + 1;
          return accumulator;
        }, {});

        setPreGalleryImages(preGalleryResponse.data || []);
        setCategories(sortGalleryCategories((categoriesResponse.data || []) as GalleryCategory[]));
        setFolders(sortGalleryFolders(nextFolders));
        setCategoryImageCounts(nextCategoryImageCounts);
        setCategoryFolderCounts(nextCategoryFolderCounts);
        setError('');
      } catch (overviewError) {
        console.error('Failed to load gallery overview:', overviewError);
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
    setSelectedFolderId(null);
    setSelectedCategoryImages([]);
    setSelectedCategoryError('');
    setCategoryLoading(true);

    try {
      const { data, error: imageError } = await supabase
        .from('gallery_images')
        .select('id, image_url, category_id, folder_id, uploaded_at')
        .eq('category_id', category.id)
        .order('uploaded_at', { ascending: false });

      if (imageError) {
        throw imageError;
      }

      setSelectedCategoryImages((data || []) as GalleryImage[]);
    } catch (categoryError) {
      console.error(`Failed to load ${category.name} gallery:`, categoryError);
      setSelectedCategoryError(`Unable to load the ${formatGalleryCategoryLabel(category.name)} gallery right now.`);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleResetCategory = () => {
    setSelectedCategory(null);
    setSelectedFolderId(null);
    setSelectedCategoryImages([]);
    setSelectedCategoryError('');
  };

  const selectedCategoryFolders = selectedCategory
    ? sortGalleryFolders(folders.filter((folder) => folder.category_id === selectedCategory.id))
    : [];
  const currentFolder = selectedFolderId
    ? selectedCategoryFolders.find((folder) => folder.id === selectedFolderId) || null
    : null;
  const isBrokenFolderSelection = selectedFolderId !== null && currentFolder === null;
  const currentFolderPath = currentFolder
    ? getFolderPath(currentFolder.id, selectedCategoryFolders)
    : [];
  const currentParentFolderId = currentFolder ? currentFolder.id : null;
  const currentViewFolders = selectedCategory
    ? sortGalleryFolders(selectedCategoryFolders.filter((folder) => (folder.parent_folder_id ?? null) === currentParentFolderId))
    : [];
  const currentViewImages = selectedCategory
    ? selectedCategoryImages.filter((image) => (image.folder_id ?? null) === currentParentFolderId)
    : [];

  const getDirectImageCount = (folderId: number | null) => selectedCategoryImages.filter((image) => (image.folder_id ?? null) === folderId).length;
  const getChildFolderCount = (folderId: number | null) => selectedCategoryFolders.filter((folder) => (folder.parent_folder_id ?? null) === folderId).length;
  const currentViewTitle = currentFolder
    ? currentFolder.name
    : selectedCategory
      ? `${formatGalleryCategoryLabel(selectedCategory.name)} Gallery`
      : 'Gallery Categories';
  const currentViewDescription = currentFolder
    ? 'Browse sub-folders and images saved directly inside this folder.'
    : selectedCategory
      ? 'Open a folder to continue exploring this category.'
      : 'Explore the moments, milestones, and memories that define the club\'s sporting legacy.';
  const summaryLabel = selectedCategory
    ? `${currentViewFolders.length} Folder${currentViewFolders.length === 1 ? '' : 's'} | ${currentViewImages.length} Photo${currentViewImages.length === 1 ? '' : 's'}`
    : `${categories.length} Categories Available`;
  const previewImages = fallbackPreGalleryImages.map((fallbackImage, index) => (
    preGalleryImages.find((image) => image.display_order === index + 1)?.image_url || fallbackImage
  ));
  const isUsingPreGalleryFallback = preGalleryImages.length < 3;
  const canNavigateUp = Boolean(selectedCategory);
  const hasContentInCurrentView = !isBrokenFolderSelection && (currentViewFolders.length > 0 || currentViewImages.length > 0);

  const handleNavigateUp = () => {
    if (currentFolderPath.length > 1) {
      setSelectedFolderId(currentFolderPath[currentFolderPath.length - 2].id);
      return;
    }

    if (selectedCategory) {
      if (currentFolderPath.length === 1) {
        setSelectedFolderId(null);
        return;
      }

      handleResetCategory();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-cyan-50/20">
      <div className="px-4 py-16 max-w-7xl mx-auto">
        <BackButton className="mb-8" />

        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-cyan-500 mb-6 rounded-full"></div>
            <blockquote className="text-2xl md:text-3xl font-light text-gray-700 italic leading-relaxed">
              "Every frame reflects a sporting journey shaped by <span className="font-semibold text-blue-600">passion</span>, <span className="font-semibold text-blue-600">teamwork</span>, and a proud legacy of <span className="font-semibold text-blue-600">excellence since 1988</span>."
            </blockquote>
          </div>

          <span className="text-gray-400 text-sm font-medium tracking-wider uppercase border-l-2 border-gray-200 pl-4">
            {summaryLabel}
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
                Highlights from a sporting community that has continued to grow, compete, and celebrate together since 1988.
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
              <h2 className="text-2xl font-bold text-gray-800">{currentViewTitle}</h2>
              <p className="mt-2 text-sm text-gray-500">
                {currentViewDescription}
              </p>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 py-16 text-center text-gray-400">
                Loading gallery categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 py-16 text-center text-gray-400">
                Gallery categories will appear here once they are configured.
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
                      Category
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-gray-800">{formatGalleryCategoryLabel(category.name)}</h3>
                      <p className="text-sm text-gray-500">
                        {categoryFolderCounts[category.id] || 0} folder{categoryFolderCounts[category.id] === 1 ? '' : 's'} | {categoryImageCounts[category.id] || 0} image{categoryImageCounts[category.id] === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="mt-8 text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-1">
                      Open Category
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            <div className="mb-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <button
                  onClick={handleResetCategory}
                  className="font-semibold text-blue-600 transition-colors hover:text-blue-800"
                >
                  Gallery
                </button>
                <span className="text-gray-300">/</span>
                {currentFolder ? (
                  <button
                    onClick={() => setSelectedFolderId(null)}
                    className="font-semibold text-blue-600 transition-colors hover:text-blue-800"
                  >
                    {formatGalleryCategoryLabel(selectedCategory.name)}
                  </button>
                ) : (
                  <span className="font-semibold text-gray-700">{formatGalleryCategoryLabel(selectedCategory.name)}</span>
                )}
                {currentFolderPath.map((folder, index) => {
                  const isLastItem = index === currentFolderPath.length - 1;

                  return (
                    <div key={folder.id} className="contents">
                      <span className="text-gray-300">/</span>
                      {isLastItem ? (
                        <span className="font-semibold text-gray-700">{folder.name}</span>
                      ) : (
                        <button
                          onClick={() => setSelectedFolderId(folder.id)}
                          className="font-semibold text-blue-600 transition-colors hover:text-blue-800"
                        >
                          {folder.name}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{currentViewTitle}</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    {currentViewDescription}
                  </p>
                </div>
                {canNavigateUp && (
                  <button
                    onClick={handleNavigateUp}
                    className="self-start rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {currentFolder ? 'Back to Previous Level' : 'Back to Categories'}
                  </button>
                )}
              </div>
            </div>

            {categoryLoading && (
              <div className="mb-6 rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 py-10 text-center text-gray-400">
                Loading {formatGalleryCategoryLabel(selectedCategory.name)} contents...
              </div>
            )}

            {selectedCategoryError && (
              <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-6 text-sm text-amber-700">
                {selectedCategoryError}
              </div>
            )}

            {isBrokenFolderSelection && (
              <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-6 text-sm text-amber-700">
                The selected folder could not be found. Please return to the category view and try again.
              </div>
            )}

            {!isBrokenFolderSelection && currentViewFolders.length > 0 && (
              <div className="mb-10">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-gray-800">{currentFolder ? 'Sub-Folders' : 'Folders'}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {currentFolder
                      ? 'Continue deeper into the folder structure.'
                      : `Browse the folders available in ${formatGalleryCategoryLabel(selectedCategory.name)}.`}
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {currentViewFolders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolderId(folder.id)}
                      className="group rounded-3xl border border-white/60 bg-white/70 p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="mb-8 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                        Folder
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-gray-800">{folder.name}</h3>
                        <p className="text-sm text-gray-500">
                          {getChildFolderCount(folder.id)} sub-folder{getChildFolderCount(folder.id) === 1 ? '' : 's'} | {getDirectImageCount(folder.id)} image{getDirectImageCount(folder.id) === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="mt-8 text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-1">
                        Open Folder
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isBrokenFolderSelection && currentViewImages.length > 0 && (
              <div>
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-gray-800">{currentFolder ? 'Images' : 'Category Images'}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {currentFolder
                      ? 'These images belong directly to the current folder.'
                      : 'These images are currently saved in the category root.'}
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {currentViewImages.map((image, index) => (
                    <div key={`${image.id}-${index}`} className="overflow-hidden rounded-3xl border border-white/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <img
                        src={image.image_url}
                        alt={`${currentFolder ? currentFolder.name : formatGalleryCategoryLabel(selectedCategory.name)} ${index + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!categoryLoading && !selectedCategoryError && !hasContentInCurrentView && (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 py-16 text-center text-gray-400">
                {currentFolder
                  ? 'No sub-folders or images are available in this folder yet.'
                  : `No folders or category-level images are available in ${formatGalleryCategoryLabel(selectedCategory.name)} yet.`}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
