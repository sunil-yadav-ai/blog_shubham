import { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Moon,
  Plus,
  Eye,
  PlayCircle,
  Home,
  MonitorPlay,
  BookOpen,
  User,
  Globe,
  Share2,
  Rss,
} from 'lucide-react';

const categories = [
  'All Videos',
  'Tutorials',
  'Showcases',
  'Interviews',
  'Behind the Scenes',
  'Live Streams',
  'Gear Reviews',
];

const videos = [
  {
    id: 1,
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBvYGB9VcAOc6ViqUthEXeZp3TobgycmSEtSA7qC1DvK9ZlQW_o6tdH6OE8--Tf34wF52N-KKCaHtBKiFGlN8lTje87P89icWIEq_vfwocqduV9MhyBPUz7C4NkPQoot9ESuBEnTFcVF-rvkM7ruacHuIpzh9Ec8f6Ci2o_2JE490NytFT1ZoOvvKDArQO7WANzBwAW0SVuGR59IsxhMebfsXvaeXRp20SgKzLta8IMyNA_DNHNgGC-',
    duration: '12:45',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBnlHOMiRsm9vdHnplW2SDtknG1LDdU2w5CAFXR209YvunnsforzDY6LR-cxWcMjn3pEIakW_36bKLuOTJHdJpnmaC9Yn5qDLVAu-bmTr4plcIkMi1UMKbYdRezSEnBGO9YbDPCLhFdIcsVwZ55YlPfWBjyHW_E5nOKky63AUK-wwvozw770MoqKmz_Hh5bL3vbvBlnjMThDeAkPR7drHiyLBNgKOKdjyDtzpfIFAMEvuU-wVHPEtbJ',
    title: 'The Future of 8K Content Creation: Gear Guide 2024',
    channel: 'Focus & Frames',
    views: '450K views',
    time: '2 days ago',
  },
  {
    id: 2,
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDB2_p-Uf7_025wyfVuVaGsyoEEFdWfh4fY1pbTBsB-FSTMV6EM7Pk2heQ5Qeu5SnpPEUwr9ZlrRGWdFvKZ6SKVJztVh68K_NpxQ-c1D5JGWhs_f_NZ5z-NgfOTAIA6wo1kZAxA4L2lfAnHgcPpufIIaJQKRXW9tqOHYKDHT18QuKy4GmEPYZfowFo9eGDe6Z_jZEuk77XKxKVaPSHPFn8FZbCi_hEgAn4mPaDG2qgIE6A3R7Tc3-oE',
    duration: '08:12',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCUJ4BIrE615xxmv59KuTXjzdA-VNrmtIENv96MvxlpEDAJ7Jp5oMIf5Ku9CPp5c3f9cvn-Fyh-KuuhLUDOVgUjxKNKd1Oh7onnNlZvoRowfyuM2hvJzluZgDwdXf6kayjkVbMUYbbrmbTZQ3XFklSeh-oTcK2Em1hv0H4Fo1f6u3iIdze8VfEPRyqm3p92LIheoVVZjtj4SGz6wUGqYXzvEyX7Yyg2oPPeK6QpcU8NzEPVdKZoRsAW',
    title: 'Minimalist Workflow: How I Edit 5 Videos a Week',
    channel: 'Creator Pulse',
    views: '1.2M views',
    time: '1 week ago',
  },
  {
    id: 3,
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDYnViAmoKdGv8Z3bmjxFkCVWDqGJC0wULACuEX0EFqLv0yJ6_biL2Vbu-QN44pldeHpj5cEiCWHQdScUiqa2NfZ9woNfEiDgKCMNLKGCsvXnRYs1Lcj-bhAuMrAC0nl1pgUrPvFkLOCDuS-Lf6_5y_zOKBaYyatjIo81rgsz5FqqIrV3qPyOoBjRg5yhqSKjUJutH38flhB39nyFKJnzSsPCYexIKNXmioAwNajPSUQClZVFoBwLLP',
    duration: '24:30',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCKdhOkRnU0bnQU7b6fTxepxwC67KNGf7VlEW2qGEG3rTBHBE06Z6fOL_CQLLuQZk0TzB_QB6yf327tZ4Yu19177w7W5xePSXpZenGB8b8vx38-rHkvHu7cquSVHD0LOSE5hlSDsvOgX_7nIzH-JY8yUb0L-Up62HSDw2CQJPMyKTgctAc8gQmtd4Xf6JCc-OnudmPRNtenzedQUdyROzk4CRuO4AQtx2irtsd5HsbExGa-YtGuIWGk',
    title: 'Synthesizing Emotions: Live Performance & Breakdown',
    channel: 'Synth Waves',
    views: '89K views',
    time: '3 days ago',
  },
  {
    id: 4,
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQs77lmfanrQR976_30biXZ9d_3Vs5l_jQ-aLH9M7TSlwpPpVuc-NEwlthjAnVkmjpDGd0p9qIzrRiwPQt2g68A7gadlHxqgYUp0nJNXVv__jsWPE3Wj2ORB-gIX4q5Z4OHEgH7ISweJom7o2qAUjQPXOXmoLRrn4EN6mJlc-cf2M693b_CPF2GFBOzbx5TDrq_YYCAfPla2jFRBr8NiclzVI4sy8w47BzBs080M5YeWgxrLagsOvn',
    duration: '15:55',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuANanvrt3pq21RovHQ8u0t_B7TueJ4_-L0TMDHx8LpIZOn-u1gbw4EQiZTEbeQ64MarNGruqjyozdGi4hHR37DCqeESLYmsz1wcqYEIpJeyvW0DN23XcZvUaAzN0e30kPfTSLYn9thiFivDJ1gCVdtH6Wq_zsUMJjKdvDPAAA1W3Ce39b1Oim37W7pLm_m0r8R9hGyf8jsG5IEnI4djxNI_K-9tn0fn_apAh3zul5hRDxw5zcPDOn9n',
    title: 'The Art of Storytelling in Nature Documentaries',
    channel: 'Wild Lens',
    views: '2.5M views',
    time: '1 month ago',
  },
  {
    id: 5,
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBt9HJ98j89mjfTPie_S2IMY4QRHCoysn4orPxMLcJ9KXbVTqszSlQNtQ2sBlQ3aQQvqCEOWP6l14tTjdb_1yREvBCo6wi37RZOFTNnGAIMeZD2w4toWCb76mlx7-oiw4vi2xXKn1EsOfFNRkcZ3xzUBC3QUWvH2b-JKthDUyi3bzHd08kxG-gZrSlqAGDYehsHETW0mDg9f37cXkXRVL8dHRcDRZMYe9RZM3hw0uf9VLQKDX-eMxTk',
    duration: '10:05',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCkgZp6gHSMoVlsRDIha0rFnhPH450_nEPmHsTkw4ov1X7Yx53ahrT1rIJkv7SjkPHmVCk64JxfjZZLfuNc3ecCvmvS969uxmnTOipYK-4RdOQpSzayLW45_39uUZDRdj_mOi3XSuV9bopR1K1kQLDnS-SgTKZsll73dd-_uazykocHxYCXGagKB90hOHtVdJaAYUx8j4bKGFp_gj7NkSy34GARcf0WU04nR25tobeo_hW0MO0T-s5Q',
    title: 'Capturing Silence: Minimalist Architecture Photography',
    channel: 'Structure Lab',
    views: '156K views',
    time: '5 days ago',
  },
  {
    id: 6,
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlvCKWigfBjFCqRWvJUP3QEUNX4Ht3goVi2ITFuNSec_oKSwa62RnhJWPkMqO8DTbBqlgmfZ-raCh9Nnfq60B29cxVsUo-V3gzh77rB4eB2tQnsXSK95Rv1k5mwoNndFVMT9ncVTSr2VU_lYd5dwjyQVS4GeUit_bx5VzsBfJGFJ1OrMRmG3bf-TZ9IOfWMWGtpQbddbKp-OXg1icBN3seQ23i22mTdjogPZRHc9-zu5MyQBt3Qzoh',
    duration: '06:40',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBT0sak3V0RnpxKvpwAikykSXGSw8vMVRgkTG9RiTfXoexpK-XnIyA2ijsSGA0CVGXke28hvG2YFygEDYtlSGbWa8kpOMix5wrpG3NqnbBrJlJsRx--NP9JidfShkawMum_iiDHzPoUGYM6fAzSSUopK9wre-H-fZW_gNv0xy7mpw8kMBsNv9MV4MTu4iiNk0BjNMtZjiHPieUqsub53RqfHTFfhFvTjOwRzW-T_DfkpcDjNNmnKyQx',
    title: 'Mastering Particles in Blender 4.1: A Deep Dive',
    channel: 'Render Realm',
    views: '312K views',
    time: '2 weeks ago',
  },
  {
    id: 7,
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC2M4Owx7S4uDliAWTd8Zw7uyAuF7-clwyd0QVv00mkstvw0TmUv_oB_er_6xXE9jcF9PatStFO0Co3xigDh399j_876E0rJDdsFGN92rxM75BpPzF7tf5KK4lqHt27IaQyy8rcM2eysFmmAbpZ6ebcHfPWVlITGM6FC1gulCsn36CKmcA2VimqSjDKgep-04gzlA_5y8tFelB_VYjGXWmu0Qx3N_vBl8DK4L3XuzAk2bX8eKQBPaXW',
    duration: '18:20',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJaHoezA0us9nNRug7SYIKkAjkHdUoAxI8GP3RRYIYmOJdzNYPGy4LeDEJn-FESLLP7C5V0IVBI87Z-cAnI1sr2KH6pCtDXyC3AmXDM2IZtC4fFj4r5bvNGow6VFbCECxR-c6OgTqP6wOhu-YoUMSqkgdGUZbd5G_EDPFF38oDcZR5H8qv2lOiRKPwBmYK26hb4Ghtrx_bHdTFTUGC-QtkWLCHEImkOY4s_NFRYGGCXFe_A8BZM9VP',
    title: 'Culinary Cinematics: Lighting Food Like a Movie',
    channel: 'Taste & Vision',
    views: '67K views',
    time: '1 week ago',
  },
  {
    id: 8,
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZMI_ZTcE56CicHVwlbGafgghTrOq9_7Rh4TWfTcr7iRLRTiaMYPcpdzOz4_dxI9QgRSEnEPOWWVpKJgmqlLbRo7iiUUKRGykAqqsgEcOfZ3cEvCmXqc8Ja341a58B4-msn4leFhGUt0KP3PdDsIHjUq-6ufXnBDNeY2vuj67oLQY71CFiQnE63wpEhP9PShe4ExCaoSDvw1JLHJN9SdUgHPR4zYd0uePyzTXgbN17RDSJM3iHSPv6',
    duration: '11:15',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC91bVNmE7NBnQimQiCJloJ2-W5IaskyqitvpOjlSQn3WlvKlADl8vpFIwNhcfWOESkuabbMkWo9ia3E75T-RZeFsPuNdltburDyYiZidFzDVAHjjrM2IZ6Q69XWM_HTXUvWM5OPqmKzpEgh7lBI67mZklZcOILWu68rkrRZr9EGhDKzngOqeANVTEtNPMZOoX_KOj4k1_ofdmV6jQ--ijmfBrNrBZ2lIQ4IlOG_rL0wzGgI0prUW5J',
    title: 'Night Walker: Long Exposure Street Videography',
    channel: 'Neon City',
    views: '245K views',
    time: '3 weeks ago',
  },
];

function VideoCard({ video }: { video: (typeof videos)[0] }) {
  return (
    <div className="bento-card group cursor-pointer">
      <div className="thumbnail-container relative aspect-video rounded-xl overflow-hidden bg-surface-container mb-3">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="play-overlay absolute inset-0 bg-on-surface/40 flex items-center justify-center backdrop-blur-[2px]">
          <PlayCircle className="text-white w-12 h-12 fill-white" />
        </div>
        <span className="absolute bottom-2 right-2 bg-on-surface/80 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
          {video.duration}
        </span>
      </div>
      <div className="flex gap-3">
        <img
          src={video.avatar}
          alt={video.channel}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <h3 className="text-label-md text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors font-medium">
            {video.title}
          </h3>
          <p className="text-on-surface-variant text-[13px] mt-1">{video.channel}</p>
          <div className="flex items-center gap-1 text-on-secondary-container text-[12px] mt-1">
            <span>{video.views}</span>
            <span className="w-1 h-1 bg-outline-variant rounded-full flex-shrink-0"></span>
            <span>{video.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All Videos');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-background text-on-surface font-sans min-h-screen">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 w-full border-b border-outline-variant/30 transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
        style={{ background: 'rgba(248, 249, 255, 0.85)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex justify-between items-center w-full px-6 md:px-12 max-w-[1280px] mx-auto h-16">
          <div className="flex items-center">
            <span className="text-headline-md font-extrabold text-primary tracking-tight">CreatorHub</span>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            {['Videos', 'Blogs', 'Gallery', 'Stories'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-label-md text-on-surface-variant hover:text-primary transition-colors duration-300"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/20 gap-1">
              <Search className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
              <input
                className="bg-transparent border-none outline-none text-label-md w-48 placeholder:text-on-surface-variant/60"
                placeholder="Search creators..."
                type="text"
              />
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <Moon className="w-5 h-5" />
            </button>
            <button className="hidden md:flex items-center gap-1.5 bg-primary text-on-primary px-6 py-2 rounded-full text-label-md scale-down-click transition-transform">
              <Plus className="w-[18px] h-[18px]" />
              Create
            </button>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8gmbedi86kpGJNPLjWnWVoMk6MCp81dD1yGmRwWX__nfYlK13CLo2jBtWiLsgVQSdfsv29Vav9k6dgDlVZ-ioiRwt0JEbLAcWxoiJsF-k899qSG5VK1JV8D8iov95D1J8yTF8LZvxGqDCZOg7v36HkrS_2TCH07mgfdbnReeD_YCHOlUf_Jm8aIgErBQBJ1RL5_KNs0TlyzyxY4wy7DBsgC5iOWXI-QhSiS3f711t9jkmKi9pFFKh"
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-outline-variant/30"
            />
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-2">
        {/* Hero Section */}
        <section className="mt-2 mb-16">
          <div className="relative group rounded-xl overflow-hidden shadow-lg bg-surface-container-highest aspect-[21/9]">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwekQIa_IqxayMA6xPoqE1Ge8RE2kT5yZSNz5KK5vVoN5HxVdJ-LiQ-f1sIDiFq2HfBV46iCJ62sZVaK0ktDZFarnzaRURTeGhx4W7eEmwt1rn1h_U5ZGLjJRn9zw0RG9qGydcsm_X6jWMtxPqXZ7wQu2isadbOp2cAjitxq48rWCj4lZlbAnXQyb6dcuRZfLWBXoBhz56iGpb5ebjtGAN87gnB3tu23IvXb9jPAeQ6A9zgyy3mErb')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/20 to-transparent flex flex-col justify-end p-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-label-sm font-semibold">
                  Featured
                </span>
                <span className="text-on-primary/80 text-label-sm flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> 1.2M views
                </span>
              </div>
              <h1 className="text-headline-lg text-on-primary max-w-2xl mb-3 leading-tight font-bold">
                Mastering Digital Light: A Journey into Modern Cinematic Expression
              </h1>
              <p className="text-on-primary/70 text-body-md max-w-xl hidden md:block mb-10">
                Discover the techniques used by top-tier creators to shape light and shadow in a digital workspace.
              </p>
              <div className="flex items-center gap-6">
                <button className="bg-primary text-on-primary flex items-center gap-2 px-8 py-2 rounded-full text-label-md scale-down-click transition-transform">
                  <PlayCircle className="w-5 h-5 fill-white" />
                  Watch Now
                </button>
                <button className="flex items-center gap-2 px-8 py-2 rounded-full text-label-md text-on-primary border border-white/20 hover:bg-white/20 transition-colors" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                  <Plus className="w-5 h-5" />
                  Save to Library
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="mb-10 overflow-x-auto whitespace-nowrap pb-2 hide-scrollbar">
          <div className="flex items-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-full text-label-md transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {/* Load More */}
          <div className="flex justify-center mt-16">
            <button className="px-8 py-2 border border-outline text-on-surface rounded-full text-label-md hover:bg-surface-container transition-all scale-down-click">
              Load More Videos
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full mt-16 bg-surface-container-highest border-t border-outline-variant/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 px-12 py-16 max-w-[1280px] mx-auto">
          <div className="col-span-1">
            <span className="text-headline-md text-on-surface font-extrabold mb-6 block">CreatorHub</span>
            <p className="text-on-secondary-container text-body-md">
              Empowering creators with high-end tools and a minimalist interface for ultimate creative expression.
            </p>
          </div>

          <div>
            <h4 className="text-label-md text-on-surface font-bold mb-6">Platform</h4>
            <ul className="flex flex-col gap-3">
              {['Videos', 'Creator Tools', 'Brand Deals', 'Education'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-on-secondary-container hover:text-primary transition-colors text-label-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-label-md text-on-surface font-bold mb-6">Community</h4>
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
            <h4 className="text-label-md text-on-surface font-bold mb-6">Company</h4>
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
          <span className="text-on-secondary-container text-label-sm">
            © 2024 CreatorHub. Designed for Expression.
          </span>
          <div className="flex items-center gap-10">
            <Globe className="w-5 h-5 text-on-secondary-container cursor-pointer hover:text-primary transition-colors" />
            <Share2 className="w-5 h-5 text-on-secondary-container cursor-pointer hover:text-primary transition-colors" />
            <Rss className="w-5 h-5 text-on-secondary-container cursor-pointer hover:text-primary transition-colors" />
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 md:hidden z-50 border-t border-outline-variant/20" style={{ background: 'rgba(248, 249, 255, 0.92)', backdropFilter: 'blur(20px)' }}>
        <button className="flex flex-col items-center justify-center text-on-surface-variant gap-0.5">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center text-primary gap-0.5">
          <MonitorPlay className="w-5 h-5 fill-primary" />
          <span className="text-[10px] font-semibold">Videos</span>
        </button>
        <button className="flex flex-col items-center justify-center -mt-6">
          <div className="bg-primary p-2 rounded-full shadow-lg">
            <Plus className="w-8 h-8 text-white" />
          </div>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant gap-0.5">
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Stories</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant gap-0.5">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Profile</span>
        </button>
      </nav>
    </div>
  );
}
