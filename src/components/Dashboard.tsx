import React, { useState, useEffect } from 'react';
import {
  Users, Film, FileText, Image as ImageIcon, BookOpen, Eye, MessageSquare,
  ThumbsUp, Trash2, BarChart2, UploadCloud
} from 'lucide-react';
import API from '../services/api';
import CategoryManager from './CategoryManager';
import UploadModal from './UploadModal';

interface CounterType {
  users: number;
  videos: number;
  blogs: number;
  photos: number;
  stories: number;
  views: number;
  comments: number;
  likes: number;
}

interface ActivityType {
  _id: string;
  title: string;
  contentType: 'Video' | 'Blog' | 'Photo' | 'Story';
  views?: number;
  status: 'draft' | 'published';
  createdAt: string;
}

interface CategoryStatType {
  categoryName: string;
  views: number;
  count: number;
}

export default function Dashboard() {
  const [counters, setCounters] = useState<CounterType>({
    users: 0, videos: 0, blogs: 0, photos: 0, stories: 0, views: 0, comments: 0, likes: 0
  });
  const [recentUploads, setRecentUploads] = useState<ActivityType[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStatType[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await API.get('/analytics');
      if (res.data.success) {
        const d = res.data.data;
        setCounters(d.counters);
        setRecentUploads(d.recentUploads);
        setCategoryStats(d.categoryStats);
      }
    } catch (err) {
      console.error('Error fetching analytics details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleToggleStatus = async (item: ActivityType) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    const typeEndpointMap = {
      Video: '/videos',
      Blog: '/blogs',
      Photo: '/photos',
      Story: '/stories',
    };
    
    const endpoint = typeEndpointMap[item.contentType];
    if (!endpoint) return;

    try {
      const res = await API.put(`${endpoint}/${item._id}`, { status: newStatus });
      if (res.data.success) {
        setRecentUploads((prev) =>
          prev.map((upload) => (upload._id === item._id ? { ...upload, status: newStatus } : upload))
        );
        fetchAnalytics(); // reload stats counters
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteItem = async (item: ActivityType) => {
    if (!window.confirm(`Are you sure you want to delete this ${item.contentType} item? This action is irreversible.`)) {
      return;
    }

    const typeEndpointMap = {
      Video: '/videos',
      Blog: '/blogs',
      Photo: '/photos',
      Story: '/stories',
    };
    
    const endpoint = typeEndpointMap[item.contentType];
    if (!endpoint) return;

    try {
      const res = await API.delete(`${endpoint}/${item._id}`);
      if (res.data.success) {
        setRecentUploads((prev) => prev.filter((upload) => upload._id !== item._id));
        fetchAnalytics(); // reload counters
      }
    } catch (err) {
      console.error('Error deleting content item:', err);
    }
  };

  // Determine Max views for category graph relative sizing
  const maxCategoryViews = categoryStats.reduce((max, cat) => (cat.views > max ? cat.views : max), 1);

  return (
    <div className="w-full py-2 text-left">
      {/* Dashboard Title & Upload triggers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-headline-lg font-extrabold text-on-surface tracking-tight">
            CMS Admin Control Panel
          </h1>
          <p className="text-on-secondary-container text-body-md mt-1">
            Monitor activity metrics, publish media streams, and manage category listings.
          </p>
        </div>

        <button
          onClick={() => setUploadOpen(true)}
          className="bg-primary text-on-primary hover:bg-primary-container font-extrabold px-6 py-2.5 rounded-full text-label-sm shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 flex-shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Media Content</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-on-secondary-container">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          Loading CMS metrics data...
        </div>
      ) : (
        <div className="flex flex-col gap-10 mb-16">
          
          {/* Counters Grid Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            
            {/* Cards 1: Users */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 md:p-5 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-on-secondary-container uppercase tracking-wider">Users</span>
                <span className="text-headline-md font-extrabold text-on-surface mt-0.5">{counters.users}</span>
              </div>
            </div>

            {/* Cards 2: Videos */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 md:p-5 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary flex-shrink-0">
                <Film className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-on-secondary-container uppercase tracking-wider">Videos</span>
                <span className="text-headline-md font-extrabold text-on-surface mt-0.5">{counters.videos}</span>
              </div>
            </div>

            {/* Cards 3: Blogs */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 md:p-5 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-on-secondary-container uppercase tracking-wider">Blogs</span>
                <span className="text-headline-md font-extrabold text-on-surface mt-0.5">{counters.blogs}</span>
              </div>
            </div>

            {/* Cards 4: Gallery */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 md:p-5 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary flex-shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-on-secondary-container uppercase tracking-wider">Photos</span>
                <span className="text-headline-md font-extrabold text-on-surface mt-0.5">{counters.photos}</span>
              </div>
            </div>

            {/* Cards 5: Stories */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 md:p-5 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary flex-shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-on-secondary-container uppercase tracking-wider">Stories</span>
                <span className="text-headline-md font-extrabold text-on-surface mt-0.5">{counters.stories}</span>
              </div>
            </div>

            {/* Cards 6: Views */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 md:p-5 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary flex-shrink-0">
                <Eye className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-on-secondary-container uppercase tracking-wider">Total Views</span>
                <span className="text-headline-md font-extrabold text-on-surface mt-0.5">{counters.views.toLocaleString()}</span>
              </div>
            </div>

            {/* Cards 7: Comments */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 md:p-5 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary flex-shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-on-secondary-container uppercase tracking-wider">Comments</span>
                <span className="text-headline-md font-extrabold text-on-surface mt-0.5">{counters.comments}</span>
              </div>
            </div>

            {/* Cards 8: Likes */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 md:p-5 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary flex-shrink-0">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-on-secondary-container uppercase tracking-wider">Likes</span>
                <span className="text-headline-md font-extrabold text-on-surface mt-0.5">{counters.likes}</span>
              </div>
            </div>

          </div>

          {/* Custom SVG/CSS Charts Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Content Distribution */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-label-md font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                Content Distribution
              </h3>
              <div className="flex flex-col gap-4 mt-2">
                {[
                  { label: 'Videos', count: counters.videos, color: 'bg-primary' },
                  { label: 'Blogs', count: counters.blogs, color: 'bg-secondary' },
                  { label: 'Photos', count: counters.photos, color: 'bg-tertiary-container' },
                  { label: 'Stories', count: counters.stories, color: 'bg-on-primary-fixed-variant' },
                ].map((item) => {
                  const maxCount = Math.max(counters.videos, counters.blogs, counters.photos, counters.stories, 1);
                  const percentage = (item.count / maxCount) * 100;
                  return (
                    <div key={item.label} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[12px] font-bold">
                        <span className="text-on-surface-variant">{item.label}</span>
                        <span className="text-on-surface">{item.count} items</span>
                      </div>
                      <div className="w-full bg-surface-container h-3.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Category Views Bar list */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-label-md font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Category Views Breakdown
              </h3>
              <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-[220px] pr-1">
                {categoryStats.length === 0 ? (
                  <p className="text-[12px] text-on-secondary-container py-8 text-center">
                    No categories statistics views registered yet.
                  </p>
                ) : (
                  categoryStats.map((cat, i) => {
                    const widthPercent = (cat.views / maxCategoryViews) * 100;
                    return (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px] font-semibold">
                          <span className="text-on-surface-variant capitalize">{cat.categoryName}</span>
                          <span className="text-on-surface">{cat.views.toLocaleString()} views</span>
                        </div>
                        <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-container rounded-full transition-all duration-500"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Tables layout: Recent Uploads & Category Manager */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Uploads Table (left 2/3 cols) */}
            <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 overflow-x-auto">
              <h3 className="text-label-md font-bold text-on-surface uppercase tracking-wider mb-4 border-b border-outline-variant/20 pb-2">
                Recent Media Uploads
              </h3>
              <table className="w-full text-left text-[13px] min-w-[500px]">
                <thead>
                  <tr className="text-on-secondary-container font-bold border-b border-outline-variant/30">
                    <th className="py-2.5">Title</th>
                    <th className="py-2.5">Type</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {recentUploads.map((item) => (
                    <tr key={item._id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3 font-semibold text-on-surface max-w-[200px] truncate" title={item.title}>
                        {item.title}
                      </td>
                      <td className="py-3 text-on-surface-variant">
                        <span className="bg-surface px-2.5 py-0.5 rounded border border-outline-variant/35 text-[11px] font-bold">
                          {item.contentType}
                        </span>
                      </td>
                      <td className="py-3 text-on-secondary-container">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                            item.status === 'published'
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                          }`}
                        >
                          {item.status}
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-1 rounded text-on-secondary-container hover:text-error hover:bg-red-50 transition-all"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Category Manager Widget (right 1/3 col) */}
            <div className="lg:col-span-1">
              <CategoryManager />
            </div>

          </div>

        </div>
      )}

      {/* Upload Modal Overlay */}
      {uploadOpen && (
        <UploadModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onSuccess={fetchAnalytics}
        />
      )}
    </div>
  );
}
