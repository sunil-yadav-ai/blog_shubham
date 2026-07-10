import React, { useState, useEffect } from 'react';
import { Download, Tag, Folder, Eye } from 'lucide-react';
import API from '../services/api';
import Lightbox from '../components/Lightbox';

interface CategoryType {
  _id: string;
  name: string;
  displayName: string;
}

interface PhotoType {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  downloadsCount: number;
  createdAt: string;
  category?: {
    _id: string;
    displayName: string;
  };
  album?: {
    _id: string;
    name: string;
  };
}

interface AlbumType {
  _id: string;
  name: string;
  description: string;
}

interface GalleryPageProps {
  searchQuery: string;
}

export default function GalleryPage({ searchQuery }: GalleryPageProps) {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  
  // Filters
  const [activeAlbum, setActiveAlbum] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Albums
      const albRes = await API.get('/albums');
      if (albRes.data.success) {
        setAlbums(albRes.data.albums);
      }

      // 2. Fetch Categories
      const catRes = await API.get('/categories');
      if (catRes.data.success) {
        const categoriesData = catRes.data.categories as CategoryType[];
        setCategories(['All', ...categoriesData.map((c) => c.displayName)]);
      }

      // 3. Fetch Photos
      const params: Record<string, string | undefined> = {
        album: activeAlbum !== 'All' ? activeAlbum : undefined,
        category: activeCategory !== 'All' ? activeCategory : undefined,
        q: searchQuery || undefined,
      };

      const photoRes = await API.get('/photos', { params });
      if (photoRes.data.success) {
        setPhotos(photoRes.data.photos);
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, [activeAlbum, activeCategory, searchQuery]);

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleNextPhoto = () => {
    setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handlePrevPhoto = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleDownloadIncrement = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p._id === photoId ? { ...p, downloadsCount: p.downloadsCount + 1 } : p))
    );
  };

  return (
    <div className="w-full py-2 text-left">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-headline-lg font-extrabold text-on-surface tracking-tight">
          Visual Creator Portfolio
        </h1>
        <p className="text-on-secondary-container text-body-md mt-1">
          Explore architectural and nature photography layouts, downloadable as assets.
        </p>
      </div>

      {/* Album Filters & Category Filters Bar */}
      <div className="flex flex-col gap-6 mb-8">
        
        {/* Album Selector Tabs */}
        {albums.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-on-secondary-container flex items-center gap-1.5 uppercase tracking-wider">
              <Folder className="w-3.5 h-3.5 text-primary" />
              Albums
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
              <button
                onClick={() => {
                  setActiveAlbum('All');
                  setActiveCategory('All');
                }}
                className={`px-4 py-2 rounded-lg text-label-sm font-bold transition-colors ${
                  activeAlbum === 'All'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                All Albums
              </button>
              {albums.map((alb) => (
                <button
                  key={alb._id}
                  onClick={() => {
                    setActiveAlbum(alb._id);
                    setActiveCategory('All');
                  }}
                  className={`px-4 py-2 rounded-lg text-label-sm font-bold transition-colors whitespace-nowrap ${
                    activeAlbum === alb._id
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {alb.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Pill Filters */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-on-secondary-container flex items-center gap-1.5 uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5 text-primary" />
            Categories
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-bold border transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary border-primary text-on-primary shadow-sm'
                    : 'bg-transparent border-outline text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Photography Responsive Masonry/Grid */}
      {loading ? (
        <div className="py-20 text-center text-[14px] text-on-secondary-container">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          Loading photography grid...
        </div>
      ) : photos.length === 0 ? (
        <div className="py-20 text-center text-on-secondary-container bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
          No photos found in this portfolio section.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo, index) => (
            <div
              key={photo._id}
              onClick={() => handleOpenLightbox(index)}
              className="group cursor-pointer bg-surface-container-low border border-outline-variant/10 p-3 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col"
            >
              {/* Photo Image container */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface-container relative">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
                
                {/* Lightbox Eye Hover Overlay */}
                <div className="absolute inset-0 bg-on-surface/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <Eye className="w-10 h-10 text-white" />
                </div>

                {/* Badge Category */}
                {photo.category && (
                  <span className="absolute top-2 left-2 bg-on-surface/85 text-white px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">
                    {photo.category.displayName}
                  </span>
                )}
              </div>

              {/* Title, description, and counts */}
              <div className="flex flex-col mt-3 px-1">
                <h3 className="text-label-sm font-bold text-on-surface truncate leading-tight group-hover:text-primary transition-colors">
                  {photo.title}
                </h3>
                <span className="text-[11px] text-on-secondary-container mt-1 font-semibold flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {photo.downloadsCount.toLocaleString()} downloads
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Immersive Lightbox Component */}
      {lightboxOpen && photos.length > 0 && (
        <Lightbox
          isOpen={lightboxOpen}
          photo={photos[lightboxIndex]}
          onClose={() => setLightboxOpen(false)}
          onNext={handleNextPhoto}
          onPrev={handlePrevPhoto}
          onDownloadIncrement={handleDownloadIncrement}
        />
      )}
    </div>
  );
}
