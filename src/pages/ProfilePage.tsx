import React, { useEffect } from 'react';
import { LogOut, PlayCircle, Video, FileText, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfilePageProps {
  onPlayVideo: (id: string) => void;
}

export default function ProfilePage({ onPlayVideo }: ProfilePageProps) {
  const { user, logout, updateUserSession, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    void updateUserSession(); // update session to load savedLibrary / bookmarkedBlogs
  }, [updateUserSession]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-on-secondary-container">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Loading profile details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center text-on-secondary-container max-w-md mx-auto">
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 flex flex-col items-center gap-4">
          <UserIcon className="w-12 h-12 text-primary" />
          <h2 className="text-headline-md font-extrabold text-on-surface">Access Denied</h2>
          <p className="text-[13px] text-on-surface-variant text-center">
            You must be logged in to view your profile library.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-on-primary px-6 py-2 rounded-full text-label-sm font-bold shadow-sm mt-2 transition-transform active:scale-95 hover:bg-primary-container"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const savedVideos = (user.savedLibrary || []) as Array<{
    _id: string;
    title: string;
    thumbnailUrl: string;
    category?: { displayName?: string };
  }>;
  const bookmarkedBlogs = (user.bookmarkedBlogs || []) as Array<{
    _id: string;
    title: string;
    coverImage: string;
    category?: { displayName?: string };
    readingTime?: number;
  }>;

  return (
    <div className="w-full py-2 text-left">
      {/* Profile Header cards */}
      <section className="bg-surface-container border border-outline-variant/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 mb-12 shadow-sm">
        <div className="flex items-center gap-4 text-left">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-primary shadow-sm"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-headline-md font-extrabold text-on-surface">{user.username}</h1>
              <span className="bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize">
                {user.role}
              </span>
            </div>
            <span className="text-[13px] text-on-secondary-container mt-1">{user.email}</span>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="bg-error-container text-error px-6 py-2.5 rounded-full text-label-sm font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95 hover:bg-red-100"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </section>

      {/* Library Collections Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        
        {/* Left Column: Saved Videos Playlist */}
        <div className="flex flex-col gap-4">
          <h2 className="text-headline-md font-extrabold text-on-surface flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Saved Videos ({savedVideos.length})
          </h2>
          <div className="flex flex-col gap-3">
            {savedVideos.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-on-secondary-container bg-surface-container-low/40 rounded-xl border border-dashed border-outline-variant/10">
                No saved videos in library.
              </div>
            ) : (
              savedVideos.map((video) => (
                <div
                  key={video._id}
                  onClick={() => onPlayVideo(video._id)}
                  className="flex gap-4 p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl cursor-pointer hover:bg-surface-container transition-colors group"
                >
                  <div className="w-24 aspect-video rounded-lg overflow-hidden bg-surface-container flex-shrink-0 relative">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-on-surface/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <PlayCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col text-left min-w-0 justify-center">
                    <h3 className="text-label-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                      {video.title}
                    </h3>
                    <span className="text-[11px] text-on-surface-variant mt-1">
                      {video.category?.displayName || 'Video'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Bookmarked Blogs */}
        <div className="flex flex-col gap-4">
          <h2 className="text-headline-md font-extrabold text-on-surface flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Bookmarked Blogs ({bookmarkedBlogs.length})
          </h2>
          <div className="flex flex-col gap-3">
            {bookmarkedBlogs.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-on-secondary-container bg-surface-container-low/40 rounded-xl border border-dashed border-outline-variant/10">
                No bookmarked articles in library.
              </div>
            ) : (
              bookmarkedBlogs.map((blog) => (
                <div
                  key={blog._id}
                  onClick={() => navigate(`/blogs/${blog._id}`)}
                  className="flex gap-4 p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl cursor-pointer hover:bg-surface-container transition-colors group"
                >
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-24 h-14 rounded-lg object-cover bg-surface-container flex-shrink-0"
                  />
                  <div className="flex flex-col text-left min-w-0 justify-center">
                    <h3 className="text-label-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                      {blog.title}
                    </h3>
                    <span className="text-[11px] text-on-surface-variant mt-1 flex items-center gap-2">
                      <span>{blog.category?.displayName || 'Blog'}</span>
                      <span>•</span>
                      <span>{blog.readingTime} min read</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
