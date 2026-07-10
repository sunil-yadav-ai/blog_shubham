import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Info } from 'lucide-react';
import API from '../services/api';

interface PhotoType {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category?: {
    displayName: string;
  };
  album?: {
    name: string;
  };
  downloadsCount: number;
}

interface LightboxProps {
  photo: PhotoType;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDownloadIncrement?: (photoId: string) => void;
}

export default function Lightbox({
  photo,
  isOpen,
  onClose,
  onNext,
  onPrev,
  onDownloadIncrement,
}: LightboxProps) {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNext, onPrev, onClose]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      // 1. Notify backend database
      await API.post(`/photos/${photo._id}/download`);
      
      if (onDownloadIncrement) {
        onDownloadIncrement(photo._id);
      }

      // 2. Trigger browser download
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${photo.title.replace(/\s+/g, '_') || 'creatorhub_photo'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn('Direct blob download failed. Opening file in new tab instead.', error);
      // Fallback
      window.open(photo.imageUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-on-surface/95 backdrop-blur-md p-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center w-full z-10">
        <div className="flex flex-col text-white">
          <span className="text-label-sm uppercase tracking-wider font-bold text-primary-container">
            {photo.category?.displayName || 'Gallery'}
          </span>
          <h3 className="text-label-md font-bold mt-0.5">{photo.title}</h3>
        </div>

        <div className="flex items-center gap-4 text-white">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2 rounded-full text-label-sm font-bold shadow-md hover:bg-primary-container transition-all scale-down-click"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-on-surface/50 hover:bg-primary hover:text-white transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Slider View */}
      <div className="flex-1 flex items-center justify-center relative w-full my-4">
        {/* Navigation Left */}
        <button
          onClick={onPrev}
          className="absolute left-2 md:left-6 p-3 rounded-full bg-on-surface/40 hover:bg-primary text-white transition-all z-10 scale-down-click"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Display Image */}
        <div className="max-w-[90%] max-h-[70vh] flex items-center justify-center relative overflow-hidden rounded-lg bg-surface-container/5 shadow-lg">
          <img
            src={photo.imageUrl}
            alt={photo.title}
            className="max-w-full max-h-[70vh] object-contain transition-transform duration-300"
          />
        </div>

        {/* Navigation Right */}
        <button
          onClick={onNext}
          className="absolute right-2 md:right-6 p-3 rounded-full bg-on-surface/40 hover:bg-primary text-white transition-all z-10 scale-down-click"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Info Bar */}
      <div className="w-full max-w-[800px] mx-auto bg-on-surface/50 p-4 rounded-xl border border-outline-variant/10 text-white flex items-start gap-3 z-10 mb-2">
        <Info className="w-5 h-5 text-primary-container flex-shrink-0 mt-0.5" />
        <div className="flex flex-col text-left">
          <span className="text-[13px] leading-relaxed text-on-primary/90">
            {photo.description || 'No description provided for this photography.'}
          </span>
          <div className="flex gap-4 text-[11px] text-on-primary/60 mt-2 font-semibold">
            {photo.album && <span>Album: {photo.album.name}</span>}
            <span>Downloads: {photo.downloadsCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
