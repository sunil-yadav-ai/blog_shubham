import React, { useState, useEffect } from 'react';
import { PlayCircle, Eye } from 'lucide-react';
import API from '../services/api';
import VideoPlayerModal from '../components/VideoPlayerModal';

interface VideoType {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  likes: string[];
  createdAt: string;
  creator: {
    username: string;
    avatar: string;
  };
  category: {
    name: string;
    displayName: string;
  };
}

interface CategoryType {
  _id: string;
  name: string;
  displayName: string;
}

interface VideosPageProps {
  searchQuery: string;
  onOpenAuthModal: () => void;
  selectedVideoId: string | null;
  setSelectedVideoId: (id: string | null) => void;
}

export default function VideosPage({
  searchQuery,
  onOpenAuthModal,
  selectedVideoId,
  setSelectedVideoId,
}: VideosPageProps) {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [categories, setCategories] = useState<string[]>(['All Videos']);
  const [activeCategory, setActiveCategory] = useState('All Videos');
  const [loading, setLoading] = useState(true);

  // Hero Featured Video
  const [featuredVideo, setFeaturedVideo] = useState<VideoType | null>(null);

  const fetchVideosAndCategories = async () => {
    setLoading(true);
    try {
      // 1. Fetch Categories
      const catRes = await API.get('/categories');
      if (catRes.data.success) {
        const catNames = catRes.data.categories.map((c: CategoryType) => c.displayName);
        setCategories(['All Videos', ...catNames]);
      }

      // 2. Fetch Videos
      const params: Record<string, string | undefined> = {};
      if (activeCategory !== 'All Videos') {
        params.category = activeCategory;
      }
      if (searchQuery) {
        params.q = searchQuery;
      }

      const vidRes = await API.get('/videos', { params });
      if (vidRes.data.success) {
        const list = vidRes.data.videos;
        setVideos(list);
        
        // Find featured video (highest views or first one)
        if (list.length > 0) {
          const sortedByViews = [...list].sort((a, b) => b.views - a.views);
          setFeaturedVideo(sortedByViews[0]);
        } else {
          setFeaturedVideo(null);
        }
      }
    } catch (error) {
      console.error('Error loading video page data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideosAndCategories();
  }, [activeCategory, searchQuery]);

  return (
    <div className="w-full">
      {/* Hero Section (Featured Video) */}
      {featuredVideo && !searchQuery && (
        <section className="mt-2 mb-16">
          <div className="relative group rounded-xl overflow-hidden shadow-lg bg-surface-container-highest aspect-[21/9]">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-102"
              style={{
                backgroundImage: `url('${featuredVideo.thumbnailUrl}')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/30 to-transparent flex flex-col justify-end p-6 md:p-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-label-sm font-semibold">
                  Featured
                </span>
                <span className="text-on-primary/80 text-label-sm flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {featuredVideo.views.toLocaleString()} views
                </span>
              </div>
              <h1 className="text-headline-lg text-on-primary max-w-2xl mb-3 leading-tight font-bold">
                {featuredVideo.title}
              </h1>
              <p className="text-on-primary/70 text-body-md max-w-xl hidden md:block mb-6 line-clamp-2">
                {featuredVideo.description || 'Discover cinematic editing configurations and workflows.'}
              </p>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setSelectedVideoId(featuredVideo._id)}
                  className="bg-primary hover:bg-primary-container text-on-primary flex items-center gap-2 px-8 py-2.5 rounded-full text-label-md scale-down-click transition-all shadow-md"
                >
                  <PlayCircle className="w-5 h-5 fill-white" />
                  Watch Now
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filters */}
      <section className="mb-10 overflow-x-auto whitespace-nowrap pb-2 hide-scrollbar">
        <div className="flex items-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-label-md transition-colors font-semibold ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Video Grid */}
      <section className="mb-16">
        {loading ? (
          <div className="py-20 text-center text-[14px] text-on-secondary-container">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading creators feed...
          </div>
        ) : videos.length === 0 ? (
          <div className="py-20 text-center text-[14px] text-on-secondary-container bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
            No videos uploaded in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                onClick={() => setSelectedVideoId(video._id)}
                className="bento-card group cursor-pointer bg-surface-container-low border border-outline-variant/10 rounded-2xl p-3 hover:shadow-md transition-all duration-300"
              >
                <div className="thumbnail-container relative aspect-video rounded-xl overflow-hidden bg-surface-container mb-3 shadow-inner">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="play-overlay absolute inset-0 bg-on-surface/40 flex items-center justify-center backdrop-blur-[2px]">
                    <PlayCircle className="w-12 h-12 text-white fill-white shadow-lg" />
                  </div>
                  <span className="absolute bottom-2 right-2 bg-on-surface/80 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {video.duration}
                  </span>
                </div>
                <div className="flex gap-3 px-1.5 py-1">
                  <img
                    src={video.creator?.avatar}
                    alt="Channel avatar"
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-outline-variant/30"
                  />
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-label-md text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors font-semibold">
                      {video.title}
                    </h3>
                    <p className="text-on-surface-variant text-[12px] mt-1 font-medium">
                      {video.creator?.username}
                    </p>
                    <div className="flex items-center gap-1 text-on-secondary-container text-[11px] mt-0.5 font-medium">
                      <span>{video.views.toLocaleString()} views</span>
                      <span className="w-1 h-1 bg-outline-variant rounded-full flex-shrink-0"></span>
                      <span>
                        {new Date(video.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Video Player Modal */}
      {selectedVideoId && (
        <VideoPlayerModal
          isOpen={!!selectedVideoId}
          videoId={selectedVideoId}
          onClose={() => setSelectedVideoId(null)}
          onAuthPrompt={onOpenAuthModal}
        />
      )}
    </div>
  );
}
