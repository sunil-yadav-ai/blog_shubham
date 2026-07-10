import React from 'react';
import { Film, FileText, Image as ImageIcon, BookOpen, Search, X } from 'lucide-react';

interface SearchResultItem {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  coverImage?: string;
  imageUrl?: string;
  category?: {
    displayName: string;
  };
}

interface SearchResultsProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  results: {
    videos: SearchResultItem[];
    blogs: SearchResultItem[];
    photos: SearchResultItem[];
    stories: SearchResultItem[];
  };
  onSelectResult: (type: 'video' | 'blog' | 'photo' | 'story', id: string) => void;
}

export default function SearchResultsModal({
  isOpen,
  onClose,
  query,
  results,
  onSelectResult,
}: SearchResultsProps) {
  if (!isOpen) return null;

  const totalResults =
    results.videos.length +
    results.blogs.length +
    results.photos.length +
    results.stories.length;

  return (
    <div className="absolute top-16 left-0 right-0 max-w-[600px] mx-auto bg-background border border-outline-variant/30 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col p-6 mt-1 animate-in fade-in slide-in-from-top-2 duration-250">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          <span className="text-label-sm font-bold text-on-surface">
            Search Results for "{query}"
          </span>
          <span className="bg-surface-container px-2 py-0.5 rounded-full text-[10px] font-bold text-on-secondary-container">
            {totalResults} found
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-on-secondary-container hover:text-primary transition-colors p-1"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Results lists */}
      {totalResults === 0 ? (
        <div className="py-8 text-center text-on-secondary-container text-label-sm">
          No matches found. Try entering a different keyword.
        </div>
      ) : (
        <div className="flex flex-col gap-5 max-h-[400px] overflow-y-auto pr-1">
          
          {/* VIDEOS MATCHES */}
          {results.videos.length > 0 && (
            <div>
              <h4 className="text-[11px] font-extrabold text-on-secondary-container uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5" />
                Videos
              </h4>
              <div className="flex flex-col gap-2">
                {results.videos.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => onSelectResult('video', item._id)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container cursor-pointer transition-colors"
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-14 aspect-video rounded object-cover bg-surface-container"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-label-sm text-on-surface font-bold truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-on-secondary-container mt-0.5">
                        {item.category?.displayName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BLOGS MATCHES */}
          {results.blogs.length > 0 && (
            <div>
              <h4 className="text-[11px] font-extrabold text-on-secondary-container uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Blog Articles
              </h4>
              <div className="flex flex-col gap-2">
                {results.blogs.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => onSelectResult('blog', item._id)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container cursor-pointer transition-colors"
                  >
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-14 aspect-video rounded object-cover bg-surface-container"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-label-sm text-on-surface font-bold truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-on-secondary-container mt-0.5">
                        {item.category?.displayName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PHOTOS MATCHES */}
          {results.photos.length > 0 && (
            <div>
              <h4 className="text-[11px] font-extrabold text-on-secondary-container uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Photography
              </h4>
              <div className="flex flex-col gap-2">
                {results.photos.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => onSelectResult('photo', item._id)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container cursor-pointer transition-colors"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-14 aspect-video rounded object-cover bg-surface-container"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-label-sm text-on-surface font-bold truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-on-secondary-container mt-0.5">
                        {item.category?.displayName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STORIES MATCHES */}
          {results.stories.length > 0 && (
            <div>
              <h4 className="text-[11px] font-extrabold text-on-secondary-container uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Stories
              </h4>
              <div className="flex flex-col gap-2">
                {results.stories.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => onSelectResult('story', item._id)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container cursor-pointer transition-colors"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-10 h-10 rounded object-cover bg-surface-container"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-label-sm text-on-surface font-bold truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-on-secondary-container mt-0.5">
                        {item.category?.displayName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
