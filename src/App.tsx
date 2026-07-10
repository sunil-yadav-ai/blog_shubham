import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, Moon, Sun, Plus, Home, MonitorPlay, BookOpen, User as UserIcon,
  Globe, Share2, Rss
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import API from './services/api';

// Pages & Components imports
import VideosPage from './pages/VideosPage';
import BlogsPage from './pages/BlogsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import GalleryPage from './pages/GalleryPage';
import StoriesPage from './pages/StoriesPage';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import UploadModal from './components/UploadModal';
import SearchResultsModal from './components/SearchResultsModal';
import ProtectedRoute from './components/ProtectedRoute';

function MainAppContent() {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Modal controllers
  const [authOpen, setAuthOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ videos: [], blogs: [], photos: [], stories: [] });
  const [searchLoading, setSearchLoading] = useState(false);

  // Styling / Themes
  const [scrolled, setScrolled] = useState(false);

  // Currently playing video ID globally (so any page can trigger it)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  // Sync scroll class
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounced search query fetching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ videos: [], blogs: [], photos: [], stories: [] });
      setSearchOpen(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await API.get(`/search?q=${searchQuery.trim()}`);
        if (res.data.success) {
          setSearchResults(res.data.results);
          setSearchOpen(true);
        }
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectSearchResult = (type: 'video' | 'blog' | 'photo' | 'story', id: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    
    if (type === 'video') {
      setSelectedVideoId(id);
    } else if (type === 'blog') {
      navigate(`/blogs/${id}`);
    } else if (type === 'photo') {
      navigate('/gallery');
    } else if (type === 'story') {
      navigate('/stories');
    }
  };

  const handleCreateBtnClick = () => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    if (user?.role === 'admin') {
      setUploadOpen(true);
    } else {
      alert('Only creators/admin users can upload new media files.');
    }
  };

  const activeTab = location.pathname.split('/')[1] || 'videos';

  return (
    <div className="bg-background text-on-surface font-sans min-h-screen flex flex-col justify-between">
      
      {/* Header Bar */}
      <header
        className={`sticky top-0 z-40 w-full border-b border-outline-variant/30 transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
        style={{ background: 'rgba(var(--surface-elevated), 0.85)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex justify-between items-center w-full px-6 md:px-12 max-w-[1280px] mx-auto h-16 relative">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-headline-md font-extrabold text-primary tracking-tight">
              CreatorHub
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {[
              { path: '/', label: 'Videos' },
              { path: '/blogs', label: 'Blogs' },
              { path: '/gallery', label: 'Gallery' },
              { path: '/stories', label: 'Stories' },
              ...(user?.role === 'admin' ? [{ path: '/dashboard', label: 'Dashboard' }] : []),
            ].map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/' || location.pathname.startsWith('/videos')
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`text-label-md transition-colors duration-300 font-bold ${
                    isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Utility Tools */}
          <div className="flex items-center gap-6">
            
            {/* Search Input Bar */}
            <div className="hidden lg:flex items-center bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/20 gap-1.5 relative">
              <Search className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
              <input
                className="bg-transparent border-none outline-none text-label-md w-48 placeholder:text-on-surface-variant/40 text-on-surface"
                placeholder="Search keywords..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchLoading && (
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}

              {/* Instant Search Results Dropdown overlay */}
              <SearchResultsModal
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
                query={searchQuery}
                results={searchResults}
                onSelectResult={handleSelectSearchResult}
              />
            </div>

            {/* Notifications Alert Bell */}
            <button
              onClick={() => alert('Welcome to CreatorHub full-stack MERN application! Connect to MongoDB, publish your stories, play videos, and explore photography.')}
              className="text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="text-on-surface-variant hover:text-primary transition-colors p-1"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Create Trigger */}
            <button
              onClick={handleCreateBtnClick}
              className="hidden md:flex items-center gap-1.5 bg-primary text-on-primary px-6 py-2 rounded-full text-label-sm font-bold scale-down-click transition-transform hover:bg-primary-container"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>

            {/* Profile Avatar */}
            {isAuthenticated ? (
              <img
                src={user?.avatar}
                alt="Profile"
                onClick={() => navigate('/profile')}
                className="w-8 h-8 rounded-full object-cover border border-outline-variant/30 cursor-pointer shadow-sm hover:border-primary transition-all"
              />
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="text-label-sm font-bold text-primary hover:underline"
              >
                Sign In
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Main Pages Content body */}
      <main className="max-w-[1280px] w-full mx-auto px-4 md:px-12 py-6 flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <VideosPage
                searchQuery={searchQuery}
                onOpenAuthModal={() => setAuthOpen(true)}
                selectedVideoId={selectedVideoId}
                setSelectedVideoId={setSelectedVideoId}
              />
            }
          />
          <Route
            path="/videos"
            element={
              <VideosPage
                searchQuery={searchQuery}
                onOpenAuthModal={() => setAuthOpen(true)}
                selectedVideoId={selectedVideoId}
                setSelectedVideoId={setSelectedVideoId}
              />
            }
          />
          <Route path="/blogs" element={<BlogsPage searchQuery={searchQuery} />} />
          <Route path="/blogs/:id" element={<BlogDetailPage onOpenAuthModal={() => setAuthOpen(true)} />} />
          <Route path="/gallery" element={<GalleryPage searchQuery={searchQuery} />} />
          <Route path="/stories" element={<StoriesPage searchQuery={searchQuery} />} />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage onPlayVideo={(id) => setSelectedVideoId(id)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Footer Details */}
      <footer className="w-full mt-16 bg-surface-container-highest border-t border-outline-variant/30 text-left">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 px-12 py-16 max-w-[1280px] mx-auto">
          <div className="col-span-1">
            <span className="text-headline-md text-on-surface font-extrabold mb-6 block">CreatorHub</span>
            <p className="text-on-secondary-container text-body-md leading-relaxed">
              Empowering creators with high-end tools and a minimalist interface for ultimate creative expression.
            </p>
          </div>

          <div>
            <h4 className="text-label-md text-on-surface font-extrabold mb-6 uppercase tracking-wider">Platform</h4>
            <ul className="flex flex-col gap-3">
              {['Videos', 'Creator Tools', 'Brand Deals', 'Education'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-on-secondary-container hover:text-primary transition-colors text-label-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-label-md text-on-surface font-extrabold mb-6 uppercase tracking-wider">Community</h4>
            <ul className="flex flex-col gap-3">
              {['Guidelines', 'Forums', 'Events', 'Discord'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-on-secondary-container hover:text-primary transition-colors text-label-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-label-md text-on-surface font-extrabold mb-6 uppercase tracking-wider">Company</h4>
            <ul className="flex flex-col gap-3">
              {['About Us', 'Careers', 'Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-on-secondary-container hover:text-primary transition-colors text-label-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="px-12 py-6 max-w-[1280px] mx-auto border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-on-secondary-container text-label-sm font-semibold">
            © 2026 CreatorHub. Designed for Expression.
          </span>
          <div className="flex items-center gap-10">
            <Globe className="w-5 h-5 text-on-secondary-container cursor-pointer hover:text-primary transition-colors" />
            <Share2 className="w-5 h-5 text-on-secondary-container cursor-pointer hover:text-primary transition-colors" />
            <Rss className="w-5 h-5 text-on-secondary-container cursor-pointer hover:text-primary transition-colors" />
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 md:hidden z-30 border-t border-outline-variant/20" style={{ background: 'rgba(var(--surface-elevated), 0.92)', backdropFilter: 'blur(20px)' }}>
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'videos' || activeTab === '' ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button
          onClick={() => navigate('/blogs')}
          className={`flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'blogs' ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          <MonitorPlay className="w-5 h-5" />
          <span className="text-[10px] font-bold">Blogs</span>
        </button>

        <button onClick={handleCreateBtnClick} className="flex flex-col items-center justify-center -mt-6">
          <div className="bg-primary p-2 rounded-full shadow-lg text-white hover:bg-primary-container scale-down-click">
            <Plus className="w-7 h-7" />
          </div>
        </button>

        <button
          onClick={() => navigate('/stories')}
          className={`flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'stories' ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold">Stories</span>
        </button>

        <button
          onClick={() => (isAuthenticated ? navigate('/profile') : setAuthOpen(true))}
          className={`flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'profile' ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>

      {/* Global Modals */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainAppContent />
      </Router>
    </AuthProvider>
  );
}
