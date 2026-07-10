import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronRight, ThumbsUp, Tag as TagIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

interface CategoryType {
  _id: string;
  name: string;
  displayName: string;
}

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
  category: {
    name: string;
    displayName: string;
  };
}

interface PaginationType {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface BlogsPageProps {
  searchQuery: string;
}

export default function BlogsPage({ searchQuery }: BlogsPageProps) {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [popularBlogs, setPopularBlogs] = useState<BlogType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTag, setActiveTag] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);

  // Available unique tags gathered from database blogs
  const [allTags, setAllTags] = useState<string[]>([]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = {
        page,
        limit: 5,
        category: activeCategory !== 'All' ? activeCategory : undefined,
        tag: activeTag || undefined,
        q: searchQuery || undefined,
      };

      const res = await API.get('/blogs', { params });
      if (res.data.success) {
        setBlogs(res.data.blogs);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error loading blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularAndTags = async () => {
    try {
      // Fetch popular posts (we can request sorted by views)
      const popularRes = await API.get('/blogs', { params: { limit: 4, sort: 'popular' } });
      if (popularRes.data.success) {
        setPopularBlogs(popularRes.data.blogs);
      }

      // Fetch categories
      const catRes = await API.get('/categories');
      if (catRes.data.success) {
        const categoriesData = catRes.data.categories as CategoryType[];
        setCategories(['All', ...categoriesData.map((c) => c.displayName)]);
      }

      // Gather tags from all published blogs
      const tagsRes = await API.get('/blogs', { params: { limit: 20 } });
      if (tagsRes.data.success) {
        const tagsSet = new Set<string>();
        tagsRes.data.blogs.forEach((b: BlogType) => {
          b.tags.forEach((t) => tagsSet.add(t));
        });
        setAllTags(Array.from(tagsSet));
      }
    } catch (err) {
      console.error('Error fetching categories or popular blogs:', err);
    }
  };

  useEffect(() => {
    fetchPopularAndTags();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [page, activeCategory, activeTag, searchQuery]);

  return (
    <div className="w-full py-2">
      {/* Page Title */}
      <div className="mb-10 text-left">
        <h1 className="text-headline-lg font-extrabold text-on-surface tracking-tight">
          Creator Insights & Articles
        </h1>
        <p className="text-on-secondary-container text-body-md mt-1">
          Cinematography tips, gear breakdowns, behind the scenes, and editing workflow articles.
        </p>
      </div>

      {/* Categories Horizontal Selector */}
      <section className="mb-8 overflow-x-auto whitespace-nowrap pb-2 hide-scrollbar">
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setActiveTag('');
                setPage(1);
              }}
              className={`px-5 py-2 rounded-full text-label-sm font-bold transition-all ${
                activeCategory === cat && !activeTag
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid: Left List / Right Sidebar */}
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Column: Blogs List */}
        <div className="flex-1 flex flex-col gap-6">
          {loading ? (
            <div className="py-20 text-center text-on-secondary-container">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              Loading articles...
            </div>
          ) : blogs.length === 0 ? (
            <div className="py-20 text-center text-on-secondary-container bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
              No articles found. Try changing filters or categories.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {blogs.map((blog) => (
                <div
                  key={blog._id}
                  onClick={() => navigate(`/blogs/${blog._id}`)}
                  className="bento-card bg-surface-container-low border border-outline-variant/10 rounded-2xl overflow-hidden p-4 md:p-6 flex flex-col md:flex-row gap-6 cursor-pointer hover:shadow-md transition-all duration-300"
                >
                  {/* Cover Image */}
                  <div className="w-full md:w-56 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden bg-surface-container flex-shrink-0 relative">
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                    />
                    <span className="absolute top-2 left-2 bg-primary text-on-primary px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                      {blog.category?.displayName}
                    </span>
                  </div>

                  {/* Info details */}
                  <div className="flex-1 flex flex-col justify-between text-left min-w-0">
                    <div>
                      <div className="flex items-center gap-4 text-on-secondary-container text-[11px] mb-2 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(blog.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {blog.readingTime} min read
                        </span>
                      </div>
                      <h2 className="text-headline-md text-on-surface group-hover:text-primary transition-colors font-extrabold leading-snug line-clamp-2">
                        {blog.title}
                      </h2>
                      {/* Description snippet */}
                      <p
                        className="text-[13.5px] text-on-surface-variant line-clamp-2 mt-2 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: blog.content.replace(/<[^>]*>/g, '') }}
                      />
                    </div>

                    {/* Author & Read More */}
                    <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4 mt-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={blog.creator?.avatar}
                          alt={blog.creator?.username}
                          className="w-7 h-7 rounded-full object-cover border border-outline-variant/20"
                        />
                        <span className="text-[12px] font-bold text-on-surface">
                          {blog.creator?.username}
                        </span>
                      </div>
                      <span className="text-[12px] text-primary font-bold flex items-center gap-0.5 hover:underline">
                        Read Article <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="px-4 py-2 border border-outline text-on-surface rounded-full text-label-sm font-bold hover:bg-surface-container disabled:opacity-40 disabled:hover:bg-transparent transition-all scale-down-click"
                  >
                    Previous
                  </button>
                  <span className="text-label-sm text-on-secondary-container font-semibold">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-4 py-2 border border-outline text-on-surface rounded-full text-label-sm font-bold hover:bg-surface-container disabled:opacity-40 disabled:hover:bg-transparent transition-all scale-down-click"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sidebar (Popular posts & Tag cloud) */}
        <div className="w-full lg:w-[320px] flex flex-col gap-8 flex-shrink-0 text-left">
          
          {/* Active Tag filter indicator */}
          {activeTag && (
            <div className="bg-surface-container-high border border-outline-variant/30 p-4 rounded-xl flex items-center justify-between">
              <span className="text-label-sm text-on-surface font-semibold flex items-center gap-1.5">
                <TagIcon className="w-4 h-4 text-primary" />
                Filtered Tag: <b>{activeTag}</b>
              </span>
              <button
                onClick={() => setActiveTag('')}
                className="text-[11px] text-error font-extrabold hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          {/* Popular Articles Sidebar */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-label-md font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-2">
              Popular Articles
            </h3>
            <div className="flex flex-col gap-4">
              {popularBlogs.map((pop) => (
                <div
                  key={pop._id}
                  onClick={() => navigate(`/blogs/${pop._id}`)}
                  className="flex gap-3 cursor-pointer group"
                >
                  <img
                    src={pop.coverImage}
                    alt={pop.title}
                    className="w-16 h-12 rounded-lg object-cover bg-surface-container flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-[12.5px] font-bold text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {pop.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] text-on-secondary-container mt-1 font-semibold">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(pop.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <ThumbsUp className="w-3 h-3" /> {pop.likes?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tag Cloud */}
          {allTags.length > 0 && (
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-label-md font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-2">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setActiveTag(tag);
                      setActiveCategory('All');
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                      activeTag === tag
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-background text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/20'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
