import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, ThumbsUp, Bookmark, Share2, Eye } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';

interface BlogType {
  _id: string;
  title: string;
  content: string;
  coverImage: string;
  readingTime: number;
  views: number;
  likes: string[];
  tags: string[];
  createdAt: string;
  creator: {
    username: string;
    avatar: string;
  };
  category?: {
    _id: string;
    name: string;
    displayName: string;
  };
}

type BookmarkedBlogItem = string | { _id?: string };

interface BlogDetailPageProps {
  onOpenAuthModal: () => void;
}

export default function BlogDetailPage({ onOpenAuthModal }: BlogDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateUserSession } = useAuth();

  const [blog, setBlog] = useState<BlogType | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState(true);

  // Actions
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchBlogDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await API.get(`/blogs/${id}`);
      if (res.data.success) {
        const b = res.data.blog;
        setBlog(b);
        setLikesCount(b.likes.length);
        setIsLiked(user ? b.likes.includes(user._id) : false);
        setIsBookmarked(user?.bookmarkedBlogs ? user.bookmarkedBlogs.some((item: BookmarkedBlogItem) => typeof item === 'string' ? item === id : item._id === id) : false);
        setRelatedBlogs(res.data.relatedBlogs);
      }
    } catch (err) {
      console.error('Error fetching blog details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogDetails();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }
    try {
      const res = await API.post(`/blogs/${blog?._id}/like`);
      if (res.data.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }
    try {
      const res = await API.post(`/blogs/${blog?._id}/bookmark`);
      if (res.data.success) {
        setIsBookmarked(res.data.isBookmarked);
        updateUserSession(); // sync bookmarked blogs in user session context
      }
    } catch (err) {
      console.error('Error bookmarking blog:', err);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        text: 'Check out this awesome article on CreatorHub!',
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-on-secondary-container">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Loading article reader...
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="py-20 text-center text-on-secondary-container">
        <p className="mb-4">Blog article not found or deleted.</p>
        <button
          onClick={() => navigate('/blogs')}
          className="bg-primary text-on-primary px-6 py-2 rounded-full text-label-sm font-bold flex items-center gap-1.5 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[840px] mx-auto text-left py-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/blogs')}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-label-sm font-bold mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to articles
      </button>

      {/* Categories Badge */}
      <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-label-sm font-bold">
        {blog.category?.displayName}
      </span>

      {/* Title */}
      <h1 className="text-display md:text-headline-lg font-extrabold text-on-surface leading-tight mt-4 mb-4">
        {blog.title}
      </h1>

      {/* Meta Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-outline-variant/30 mb-8">
        <div className="flex items-center gap-3">
          <img
            src={blog.creator?.avatar}
            alt={blog.creator?.username}
            className="w-10 h-10 rounded-full object-cover border border-outline-variant/20"
          />
          <div className="flex flex-col text-[13px]">
            <span className="font-bold text-on-surface leading-none">{blog.creator?.username}</span>
            <span className="text-on-secondary-container text-[11px] mt-1 flex items-center gap-3">
              <span className="flex items-center gap-0.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(blog.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-0.5">
                <Clock className="w-3.5 h-3.5" /> {blog.readingTime} min read
              </span>
              <span className="flex items-center gap-0.5">
                <Eye className="w-3.5 h-3.5" /> {blog.views} views
              </span>
            </span>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold border transition-colors scale-down-click ${
              isLiked
                ? 'bg-primary border-primary text-on-primary'
                : 'bg-surface border-outline hover:bg-surface-container'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold border transition-colors scale-down-click ${
              isBookmarked
                ? 'bg-primary-container border-primary-container text-on-primary-container'
                : 'bg-surface border-outline hover:bg-surface-container'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold bg-surface border border-outline hover:bg-surface-container transition-colors relative"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
            {copied && (
              <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap">
                Link Copied!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Featured Cover Image */}
      <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden bg-surface-container shadow-md mb-8">
        <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
      </div>

      {/* Blog Article Body Content */}
      <article
        className="prose prose-md max-w-none text-on-surface leading-relaxed border-b border-outline-variant/30 pb-10"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Tags section */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 py-6 border-b border-outline-variant/30 mb-8">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="bg-surface-container px-3 py-1 rounded-lg text-[12px] font-bold text-on-surface-variant border border-outline-variant/20"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Comments section widget */}
      <div className="mb-12">
        <CommentSection blogId={blog._id} onAuthPrompt={onOpenAuthModal} />
      </div>

      {/* Related articles layout */}
      {relatedBlogs.length > 0 && (
        <div className="border-t border-outline-variant/30 pt-10 mb-16">
          <h3 className="text-headline-md font-extrabold text-on-surface mb-6">
            Keep Reading: Related Articles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedBlogs.map((rel) => (
              <div
                key={rel._id}
                onClick={() => navigate(`/blogs/${rel._id}`)}
                className="group cursor-pointer flex flex-col gap-3"
              >
                <div className="aspect-video rounded-xl overflow-hidden bg-surface-container relative shadow-sm">
                  <img
                    src={rel.coverImage}
                    alt={rel.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                  />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-[14px] font-extrabold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-on-secondary-container mt-1 font-bold">
                    <span>{rel.readingTime} min read</span>
                    <span>•</span>
                    <span>{new Date(rel.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
