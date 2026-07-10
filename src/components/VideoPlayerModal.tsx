import React, { useState, useEffect } from 'react';
import { X, ThumbsUp, Bookmark, Share2, Eye, Calendar, PlayCircle } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from './CommentSection';

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
    _id: string;
    username: string;
    avatar: string;
  };
  category: {
    _id: string;
    name: string;
    displayName: string;
  };
}

type SavedLibraryItem = string | { _id?: string };

interface VideoPlayerModalProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
  onAuthPrompt: () => void;
}

export default function VideoPlayerModal({ videoId, isOpen, onClose, onAuthPrompt }: VideoPlayerModalProps) {
  const { user, updateUserSession } = useAuth();
  const [video, setVideo] = useState<VideoType | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction states
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchVideoDetails = async (id: string) => {
    setLoading(true);
    try {
      const res = await API.get(`/videos/${id}`);
      if (res.data.success) {
        const v = res.data.video;
        setVideo(v);
        setLikesCount(v.likes.length);
        setIsLiked(user ? v.likes.includes(user._id) : false);
        setIsSaved(user?.savedLibrary ? user.savedLibrary.some((item: SavedLibraryItem) => typeof item === 'string' ? item === id : item._id === id) : false);
        setRelatedVideos(res.data.relatedVideos);
      }
    } catch (err) {
      console.error('Error fetching video details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && videoId) {
      fetchVideoDetails(videoId);
    }
  }, [isOpen, videoId, user]);

  if (!isOpen) return null;

  const handleLike = async () => {
    if (!user) {
      onAuthPrompt();
      return;
    }
    try {
      const res = await API.post(`/videos/${video?._id}/like`);
      if (res.data.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      console.error('Error liking video:', err);
    }
  };

  const handleSave = async () => {
    if (!user) {
      onAuthPrompt();
      return;
    }
    try {
      const res = await API.post(`/videos/${video?._id}/save`);
      if (res.data.success) {
        setIsSaved(res.data.isSaved);
        updateUserSession(); // update auth session to sync library
      }
    } catch (err) {
      console.error('Error saving video:', err);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/videos/${video?._id}`;
    if (navigator.share) {
      navigator.share({
        title: video?.title,
        text: video?.description,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-on-surface/90 backdrop-blur-md" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-[1200px] h-full md:h-[90vh] bg-background border border-outline-variant/30 rounded-none md:rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-primary transition-colors p-1.5 rounded-full bg-on-surface/50 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-on-surface text-white">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !video ? (
          <div className="flex-1 flex items-center justify-center bg-on-surface text-white">
            <p>Video not found or deleted.</p>
          </div>
        ) : (
          <>
            {/* Left: Player & Info details */}
            <div className="flex-1 overflow-y-auto flex flex-col h-full">
              
              {/* Responsive Video Container */}
              <div className="bg-black w-full aspect-video flex-shrink-0 relative group">
                <video
                  src={video.videoUrl}
                  controls
                  autoPlay
                  poster={video.thumbnailUrl}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title & Metadata */}
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-primary-container text-on-primary-container px-3 py-0.5 rounded-full text-[11px] font-bold">
                    {video.category?.displayName}
                  </span>
                </div>
                <h1 className="text-headline-md font-extrabold text-on-surface leading-tight mb-4">
                  {video.title}
                </h1>

                {/* Creator & Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <img
                      src={video.creator?.avatar}
                      alt={video.creator?.username}
                      className="w-11 h-11 rounded-full object-cover border border-outline-variant/30"
                    />
                    <div className="flex flex-col">
                      <span className="text-label-md font-bold text-on-surface leading-tight">
                        {video.creator?.username}
                      </span>
                      <span className="text-[12px] text-on-secondary-container">Creator</span>
                    </div>
                  </div>

                  {/* Actions (Like, Save, Share) */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleLike}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-label-sm font-bold border transition-colors scale-down-click ${
                        isLiked
                          ? 'bg-primary border-primary text-on-primary'
                          : 'bg-surface border-outline hover:bg-surface-container'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{likesCount} Likes</span>
                    </button>

                    <button
                      onClick={handleSave}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-label-sm font-bold border transition-colors scale-down-click ${
                        isSaved
                          ? 'bg-primary-container border-primary-container text-on-primary-container'
                          : 'bg-surface border-outline hover:bg-surface-container'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-label-sm font-bold bg-surface border border-outline hover:bg-surface-container transition-colors relative"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                      {copied && (
                        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-on-surface text-white text-[11px] px-2 py-1 rounded shadow-md whitespace-nowrap">
                          Link Copied!
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Details / description */}
                <div className="py-6 border-b border-outline-variant/30">
                  <div className="flex items-center gap-4 text-on-secondary-container text-[12px] mb-3 font-semibold">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {video.views.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />{' '}
                      {new Date(video.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-[13px] text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                    {video.description || 'No description provided.'}
                  </p>
                </div>

                {/* Comments */}
                <div className="py-6">
                  <CommentSection videoId={video._id} onAuthPrompt={onAuthPrompt} />
                </div>
              </div>
            </div>

            {/* Right Side: Related Videos */}
            <div className="w-full lg:w-[360px] border-t lg:border-t-0 lg:border-l border-outline-variant/30 h-full overflow-y-auto p-6 bg-surface-container-low flex-shrink-0">
              <h3 className="text-label-md font-bold text-on-surface mb-4 uppercase tracking-wider">
                Related Videos
              </h3>
              <div className="flex flex-col gap-4">
                {relatedVideos.length === 0 ? (
                  <p className="text-[12px] text-on-secondary-container">No related videos found.</p>
                ) : (
                  relatedVideos.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => fetchVideoDetails(item._id)}
                      className="flex gap-3 cursor-pointer group"
                    >
                      {/* Thumbnail */}
                      <div className="w-28 aspect-video rounded-lg overflow-hidden bg-surface-container flex-shrink-0 relative">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white px-1 py-0.2 rounded text-[9px] font-bold">
                          {item.duration}
                        </div>
                        <div className="absolute inset-0 bg-on-surface/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <PlayCircle className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-[13px] font-bold text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-on-surface-variant mt-1">
                          {item.creator?.username}
                        </span>
                        <span className="text-[10px] text-on-secondary-container mt-0.5">
                          {item.views.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
