import React, { useState, useEffect } from 'react';
import { Send, Trash2, ShieldAlert } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CommentType {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  videoId?: string;
  blogId?: string;
  onAuthPrompt?: () => void;
}

export default function CommentSection({ videoId, blogId, onAuthPrompt }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const param = videoId ? `video=${videoId}` : `blog=${blogId}`;
      const res = await API.get(`/comments?${param}`);
      if (res.data.success) {
        setComments(res.data.comments);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoId || blogId) {
      fetchComments();
    }
  }, [videoId, blogId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const payload: Record<string, string> = { content: content.trim() };
      if (videoId) payload.video = videoId;
      else if (blogId) payload.blog = blogId;

      const res = await API.post('/comments', payload);
      if (res.data.success) {
        setComments((prev) => [res.data.comment, ...prev]);
        setContent('');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await API.delete(`/comments/${commentId}`);
      if (res.data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <h3 className="text-label-md font-bold text-on-surface uppercase tracking-wider">
        Comments ({comments.length})
      </h3>

      {/* Input section */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <img
            src={user?.avatar}
            alt={user?.username}
            className="w-10 h-10 rounded-full object-cover border border-outline-variant/30 flex-shrink-0"
          />
          <div className="flex-1 flex bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/20 gap-2 items-center">
            <input
              type="text"
              placeholder="Add a public comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-transparent border-none outline-none text-label-md w-full text-on-surface placeholder:text-on-surface-variant/40"
            />
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="text-primary hover:text-primary-container disabled:opacity-40 transition-colors p-1"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-on-surface-variant text-[13px]">
            <ShieldAlert className="w-4.5 h-4.5 text-primary flex-shrink-0" />
            <span>You must be logged in to participate in the conversation.</span>
          </div>
          <button
            onClick={onAuthPrompt}
            className="bg-primary text-on-primary px-5 py-1.5 rounded-full text-label-sm font-bold shadow-sm transition-transform active:scale-95 hover:bg-primary-container"
          >
            Sign In to Comment
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="py-4 text-center text-[13px] text-on-secondary-container">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-6 text-center text-[13px] text-on-secondary-container bg-surface-container-low/40 rounded-xl border border-dashed border-outline-variant/10">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner = user?._id === comment.user?._id;
            const isAdmin = user?.role === 'admin';

            return (
              <div key={comment._id} className="flex gap-3 group">
                <img
                  src={comment.user?.avatar}
                  alt={comment.user?.username}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-outline-variant/20"
                />
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-label-sm font-bold text-on-surface">
                        {comment.user?.username}
                      </span>
                      <span className="text-[10px] text-on-secondary-container">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="text-on-secondary-container hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[13px] text-on-surface-variant mt-1 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
