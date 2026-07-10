import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Film, FileText, Image as ImageIcon, BookOpen } from 'lucide-react';
import API from '../services/api';
import BlogEditor from './BlogEditor';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ContentType = 'video' | 'blog' | 'photo' | 'story';

interface CategoryType {
  _id: string;
  name: string;
  displayName: string;
}

interface AlbumType {
  _id: string;
  name: string;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [contentType, setContentType] = useState<ContentType>('video');
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [albums, setAlbums] = useState<AlbumType[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [album, setAlbum] = useState('');
  const [tags, setTags] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [status, setStatus] = useState('published');
  const [storyDate, setStoryDate] = useState('');

  // Files
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [storyFile, setStoryFile] = useState<File | null>(null);

  // Status indicators
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch categories and albums
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [catRes, albRes] = await Promise.all([
            API.get('/categories'),
            API.get('/albums'),
          ]);
          if (catRes.data.success) {
            setCategories(catRes.data.categories);
            if (catRes.data.categories.length > 0) {
              setCategory(catRes.data.categories[0]._id);
            }
          }
          if (albRes.data.success) {
            setAlbums(albRes.data.albums);
          }
        } catch (err) {
          console.error('Error fetching categories/albums for upload modal:', err);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDuration('');
    setCategory(categories[0]?._id || '');
    setAlbum('');
    setTags('');
    setBlogContent('');
    setStatus('published');
    setStoryDate('');
    
    setVideoFile(null);
    setThumbnailFile(null);
    setCoverImageFile(null);
    setPhotoFile(null);
    setStoryFile(null);

    setError(null);
    setMessage(null);
    onClose();
  };

  const handleTypeChange = (type: ContentType) => {
    setContentType(type);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('status', status);
    if (category) formData.append('category', category);

    try {
      let endpoint = '';

      if (contentType === 'video') {
        endpoint = '/videos';
        if (!videoFile || !thumbnailFile) {
          setError('Please select both a video file and a thumbnail image.');
          setLoading(false);
          return;
        }
        formData.append('description', description);
        formData.append('duration', duration || '00:00');
        formData.append('video', videoFile);
        formData.append('thumbnail', thumbnailFile);
      } else if (contentType === 'blog') {
        endpoint = '/blogs';
        if (!coverImageFile) {
          setError('Please select a cover image file.');
          setLoading(false);
          return;
        }
        if (!blogContent.trim()) {
          setError('Blog content is required.');
          setLoading(false);
          return;
        }
        formData.append('content', blogContent);
        formData.append('tags', tags);
        formData.append('coverImage', coverImageFile);
      } else if (contentType === 'photo') {
        endpoint = '/photos';
        if (!photoFile) {
          setError('Please select an image file to upload to the gallery.');
          setLoading(false);
          return;
        }
        formData.append('description', description);
        if (album) formData.append('album', album);
        formData.append('image', photoFile);
      } else if (contentType === 'story') {
        endpoint = '/stories';
        if (!storyFile) {
          setError('Please select an image file for the story.');
          setLoading(false);
          return;
        }
        formData.append('description', description);
        if (storyDate) formData.append('date', storyDate);
        formData.append('image', storyFile);
      }

      // API call using multipart FormData. Let axios set the boundary automatically.
      const res = await API.post(endpoint, formData, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (res.data.success) {
        setMessage('Content uploaded successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          handleClose();
          window.location.reload();
        }, 1200);
      } else {
        setError(res.data.message || 'Upload failed');
      }
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Error uploading file. Please try again.')
          : err instanceof Error
            ? err.message
            : 'Error uploading file. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-[640px] bg-background border border-outline-variant/30 rounded-2xl shadow-xl z-10 overflow-hidden flex flex-col max-h-[90vh] p-8">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-container"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-headline-md font-extrabold text-primary tracking-tight">
            Publish New Content
          </h2>
          <p className="text-[13px] text-on-secondary-container mt-1">
            Choose a media format and fill out publishing attributes.
          </p>
        </div>

        {/* Content Type Tabs */}
        <div className="flex gap-2 p-1.5 bg-surface-container rounded-full mb-6 max-w-md">
          {(['video', 'blog', 'photo', 'story'] as ContentType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-label-sm font-bold capitalize transition-all ${
                contentType === type
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {type === 'video' && <Film className="w-3.5 h-3.5" />}
              {type === 'blog' && <FileText className="w-3.5 h-3.5" />}
              {type === 'photo' && <ImageIcon className="w-3.5 h-3.5" />}
              {type === 'story' && <BookOpen className="w-3.5 h-3.5" />}
              {type}
            </button>
          ))}
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-error-container text-error px-4 py-2.5 rounded-xl text-[13px] mb-4">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-surface-container text-primary px-4 py-2.5 rounded-xl text-[13px] font-medium mb-4">
            {message}
          </div>
        )}

        {/* Scrollable Form Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
          
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              required
              placeholder={`Enter ${contentType} title...`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md w-full placeholder:text-on-surface-variant/40"
            />
          </div>

          {/* Category Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md text-on-surface-variant w-full"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* DYNAMIC FORMS ACCORDING TO CONTENT TYPE */}

          {/* 1. VIDEO FIELDS */}
          {contentType === 'video' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter video description details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md w-full placeholder:text-on-surface-variant/40 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12:45"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md w-full placeholder:text-on-surface-variant/40"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md text-on-surface-variant w-full"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Video File Picker */}
              <div className="border-2 border-dashed border-outline-variant/40 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-primary mb-2" />
                <span className="text-label-sm font-bold text-on-surface">
                  {videoFile ? videoFile.name : 'Select Video File'}
                </span>
                <span className="text-[11px] text-on-secondary-container mt-1">
                  MP4, MOV, or AVI up to 100MB
                </span>
              </div>

              {/* Thumbnail Image Picker */}
              <div className="border-2 border-dashed border-outline-variant/40 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <ImageIcon className="w-8 h-8 text-secondary mb-2" />
                <span className="text-label-sm font-bold text-on-surface">
                  {thumbnailFile ? thumbnailFile.name : 'Select Custom Thumbnail'}
                </span>
                <span className="text-[11px] text-on-secondary-container mt-1">
                  PNG, JPG up to 5MB
                </span>
              </div>
            </>
          )}

          {/* 2. BLOG FIELDS */}
          {contentType === 'blog' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gear Reviews, Vlogging"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md w-full placeholder:text-on-surface-variant/40"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md text-on-surface-variant w-full"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Picker */}
              <div className="border-2 border-dashed border-outline-variant/40 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-primary mb-2" />
                <span className="text-label-sm font-bold text-on-surface">
                  {coverImageFile ? coverImageFile.name : 'Select Cover Image'}
                </span>
                <span className="text-[11px] text-on-secondary-container mt-1">
                  PNG, JPG, or WEBP up to 5MB
                </span>
              </div>

              {/* Rich Blog Content Editor */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Article Body
                </label>
                <BlogEditor value={blogContent} onChange={setBlogContent} />
              </div>
            </>
          )}

          {/* 3. PHOTO FIELDS */}
          {contentType === 'photo' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter image description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md w-full placeholder:text-on-surface-variant/40 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Select Album (Optional)
                  </label>
                  <select
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md text-on-surface-variant w-full"
                  >
                    <option value="">No Album</option>
                    {albums.map((alb) => (
                      <option key={alb._id} value={alb._id}>
                        {alb.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md text-on-surface-variant w-full"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Photo Image File Picker */}
              <div className="border-2 border-dashed border-outline-variant/40 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-primary mb-2" />
                <span className="text-label-sm font-bold text-on-surface">
                  {photoFile ? photoFile.name : 'Select Gallery Image'}
                </span>
                <span className="text-[11px] text-on-secondary-container mt-1">
                  PNG, JPG, or WEBP up to 8MB
                </span>
              </div>
            </>
          )}

          {/* 4. STORY FIELDS */}
          {contentType === 'story' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Story Caption
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter short story caption..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md w-full placeholder:text-on-surface-variant/40 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Custom Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={storyDate}
                    onChange={(e) => setStoryDate(e.target.value)}
                    className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md w-full text-on-surface-variant"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md text-on-surface-variant w-full"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Story Image File Picker */}
              <div className="border-2 border-dashed border-outline-variant/40 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setStoryFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-primary mb-2" />
                <span className="text-label-sm font-bold text-on-surface">
                  {storyFile ? storyFile.name : 'Select Story Image'}
                </span>
                <span className="text-[11px] text-on-secondary-container mt-1">
                  PNG, JPG vertical image recommended
                </span>
              </div>
            </>
          )}

          {/* Action Row */}
          <div className="flex gap-4 mt-4 mb-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 border border-outline text-on-surface font-bold py-3 rounded-full text-label-md hover:bg-surface-container transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-on-primary font-bold py-3 rounded-full text-label-md hover:bg-primary-container transition-transform active:scale-95 flex items-center justify-center"
            >
              {loading ? 'Uploading Content...' : 'Publish Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
