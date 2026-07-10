import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import API from '../services/api';
import StoryViewer from '../components/StoryViewer';

interface StoryType {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  category?: {
    displayName: string;
  };
  creator: {
    username: string;
    avatar: string;
  };
}

interface CategoryType {
  _id: string;
  name: string;
  displayName: string;
}

interface ArchiveType {
  year: number;
  month: number;
  count: number;
}

interface StoriesPageProps {
  searchQuery: string;
}

export default function StoriesPage({ searchQuery }: StoriesPageProps) {
  const [stories, setStories] = useState<StoryType[]>([]);
  const [archives, setArchives] = useState<ArchiveType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Filters
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeArchive, setActiveArchive] = useState<{ year?: number; month?: number } | null>(null);
  
  const [loading, setLoading] = useState(true);

  // Story slideshow viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const getMonthName = (monthNum: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1] || 'Unknown';
  };

  const fetchStoriesData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Archives dropdown mapping
      const archRes = await API.get('/stories/archives');
      if (archRes.data.success) {
        setArchives(archRes.data.archives);
      }

      // 2. Fetch categories list
      const catRes = await API.get('/categories');
      if (catRes.data.success) {
        const categoriesData = catRes.data.categories as CategoryType[];
        setCategories(['All', ...categoriesData.map((c) => c.displayName)]);
      }

      // 3. Fetch stories
      const params: Record<string, string | number | undefined> = {
        category: activeCategory !== 'All' ? activeCategory : undefined,
        year: activeArchive?.year || undefined,
        month: activeArchive?.month || undefined,
        q: searchQuery || undefined,
      };

      const storiesRes = await API.get('/stories', { params });
      if (storiesRes.data.success) {
        setStories(storiesRes.data.stories);
      }
    } catch (err) {
      console.error('Error fetching stories feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoriesData();
  }, [activeCategory, activeArchive, searchQuery]);

  const handleOpenViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  return (
    <div className="w-full py-2 text-left">
      {/* Page Heading */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-extrabold text-on-surface tracking-tight">
            Daily Creator Stories
          </h1>
          <p className="text-on-secondary-container text-body-md mt-1">
            Short glimpses behind the scenes, live announcements, and gear reviews.
          </p>
        </div>

        {/* Date Archives selector */}
        {archives.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-on-secondary-container uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Archive:
            </span>
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  setActiveArchive(null);
                } else {
                  const [y, m] = val.split('-').map(Number);
                  setActiveArchive({ year: y, month: m });
                }
              }}
              className="bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/30 text-label-sm font-bold text-on-surface outline-none"
            >
              <option value="">All Time</option>
              {archives.map((arch, i) => (
                <option key={i} value={`${arch.year}-${arch.month}`}>
                  {getMonthName(arch.month)} {arch.year} ({arch.count})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Category Pills Filters */}
      <section className="mb-8 overflow-x-auto whitespace-nowrap pb-2 hide-scrollbar">
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-label-sm font-bold transition-all ${
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

      {/* Stories grid */}
      {loading ? (
        <div className="py-20 text-center text-[14px] text-on-secondary-container">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          Loading daily stories...
        </div>
      ) : stories.length === 0 ? (
        <div className="py-20 text-center text-on-secondary-container bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
          No stories found matching filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {stories.map((story, index) => (
            <div
              key={story._id}
              onClick={() => handleOpenViewer(index)}
              className="group aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer bg-surface-container-highest relative shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow"
            >
              {/* Media image */}
              <img
                src={story.imageUrl}
                alt={story.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10" />

              {/* Tag Category top left */}
              {story.category && (
                <span className="absolute top-2 left-2 bg-primary text-on-primary px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide z-20">
                  {story.category.displayName}
                </span>
              )}

              {/* Play Story Circle overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <div className="bg-primary/90 p-2.5 rounded-full shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Story Title & Date overlay */}
              <div className="absolute bottom-3 inset-x-3 text-left text-white z-20 flex flex-col pointer-events-none">
                <span className="text-[10px] text-white/70 font-semibold mb-0.5 truncate flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(story.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-[12.5px] font-bold truncate leading-tight drop-shadow-sm">
                  {story.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Story Slideshow Viewer */}
      {viewerOpen && stories.length > 0 && (
        <StoryViewer
          isOpen={viewerOpen}
          stories={stories}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
