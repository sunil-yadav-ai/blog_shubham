import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Video from '../models/Video.js';
import Blog from '../models/Blog.js';
import Photo from '../models/Photo.js';
import Story from '../models/Story.js';
import Comment from '../models/Comment.js';

dotenv.config();

const categoriesData = [
  { name: 'all videos', displayName: 'All Videos' },
  { name: 'tutorials', displayName: 'Tutorials' },
  { name: 'showcases', displayName: 'Showcases' },
  { name: 'interviews', displayName: 'Interviews' },
  { name: 'behind the scenes', displayName: 'Behind the Scenes' },
  { name: 'live streams', displayName: 'Live Streams' },
  { name: 'gear reviews', displayName: 'Gear Reviews' },
];

const videosData = [
  {
    thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '12:45',
    title: 'The Future of 8K Content Creation: Gear Guide 2026',
    channel: 'Focus & Frames',
    views: 450000,
    categoryName: 'gear reviews',
    description: 'A deep dive into the latest 8K editing bays, camera rigs, and high-speed storage configurations for content creators in 2026.',
  },
  {
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '08:12',
    title: 'Minimalist Workflow: How I Edit 5 Videos a Week',
    channel: 'Creator Pulse',
    views: 1200000,
    categoryName: 'tutorials',
    description: 'Learn the exact pipeline, hotkeys, and organization tricks I use to edit high-quality content quickly and efficiently without burnout.',
  },
  {
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '24:30',
    title: 'Synthesizing Emotions: Live Performance & Breakdown',
    channel: 'Synth Waves',
    views: 89000,
    categoryName: 'showcases',
    description: 'Watch a live modular synthesizer performance followed by an in-depth breakdown of patching techniques, modulation routings, and effect chains.',
  },
  {
    thumbnailUrl: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: '15:55',
    title: 'The Art of Storytelling in Nature Documentaries',
    channel: 'Wild Lens',
    views: 2500000,
    categoryName: 'showcases',
    description: 'An exploration of pacing, focal length selection, audio design, and narrative structure that keeps audiences gripped during wildlife features.',
  },
  {
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    duration: '10:05',
    title: 'Capturing Silence: Minimalist Architecture Photography',
    channel: 'Structure Lab',
    views: 156000,
    categoryName: 'behind the scenes',
    description: 'Join us on-location as we photograph brutalist and modern structures, focusing on leading lines, shadow plays, and exposure blending.',
  },
  {
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    duration: '06:40',
    title: 'Mastering Particles in Blender 4.3: A Deep Dive',
    channel: 'Render Realm',
    views: 312000,
    categoryName: 'tutorials',
    description: 'Unlock the power of physics, force fields, and node-based particle behaviors in Blender to create stunning simulation environments.',
  },
];

const blogsData = [
  {
    title: 'The Psychology of Dynamic Light in Cinema',
    content: '<h2>Shaping Mood with Light</h2><p>Lighting is the unsung language of modern visual storytelling. In this post, we look at how directors and cinematographers manipulate HSL tones, shadow falloff, and color temperatures to communicate subtle emotional shifts to their audience without using dialog.</p><p>By understanding color harmony (like matching secondary container hues with soft accents) and utilizing contrast, creators can direct attention and frame perspective beautifully.</p>',
    coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
    categoryName: 'tutorials',
    tags: ['Cinematography', 'Lighting', 'Color Grading'],
    views: 24500,
  },
  {
    title: 'Camera Gear for Solo Creators: What is actually in my bag',
    content: '<h2>Minimalist Travel Camera Rig</h2><p>Having review gear is one thing, but what does a creator actually travel with? We review high-end mirrorless options, versatile prime lenses, compact fluid heads, and reliable modular storage drives that fit in a standard overhead compartment.</p><p>We evaluate which lenses give the best value, why carbon fiber tripods are worth the premium price, and how to pack lighting grids safely.</p>',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    categoryName: 'gear reviews',
    tags: ['Gear Reviews', 'Hardware', 'Vlogging'],
    views: 89000,
  },
];

const photosData = [
  {
    title: 'Brutalist concrete geometry',
    description: 'Soft afternoon sunlight hitting a concrete spiral staircase, casting sharp lines and curves.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    categoryName: 'showcases',
    downloadsCount: 142,
  },
  {
    title: 'Analog sound waves layout',
    description: 'Close-up of a modular synthesizer patch board with colorful cables and patch bays.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    categoryName: 'showcases',
    downloadsCount: 89,
  },
];

const storiesData = [
  {
    title: 'Focusing on the edit',
    description: 'Finishing up the sound design for tomorrow\'s feature documentary release.',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    categoryName: 'behind the scenes',
    date: new Date(),
  },
  {
    title: 'Synthesizer setup completed',
    description: 'Ready for tonight\'s modular synth live broadcast session!',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    categoryName: 'live streams',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    title: 'Blender render completed',
    description: 'It took 14 hours to render this physics simulation clip but it was totally worth it.',
    imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    categoryName: 'tutorials',
    date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 1 month ago (for month archives testing)
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/creatorhub';
    console.log(`Connecting to database to seed: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    // Clear DB
    await User.deleteMany({});
    await Category.deleteMany({});
    await Video.deleteMany({});
    await Blog.deleteMany({});
    await Photo.deleteMany({});
    await Story.deleteMany({});
    await Comment.deleteMany({});

    console.log('Cleared existing database entries.');

    // 1. Create users (Admin and standard)
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@creatorhub.com',
      password: 'password123', // will be hashed by save hook
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    });

    const standardUser = await User.create({
      username: 'johndoe',
      email: 'user@creatorhub.com',
      password: 'password123',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    });

    console.log('Created Admin and User accounts.');

    // 2. Create Categories
    const categoriesMap = {};
    for (const cat of categoriesData) {
      const doc = await Category.create(cat);
      categoriesMap[cat.name] = doc._id;
    }
    console.log('Inserted categories.');

    // 3. Create Videos
    for (const v of videosData) {
      const catId = categoriesMap[v.categoryName] || categoriesMap['tutorials'];
      await Video.create({
        title: v.title,
        description: v.description,
        videoUrl: v.videoUrl,
        thumbnailUrl: v.thumbnailUrl,
        duration: v.duration,
        category: catId,
        creator: adminUser._id,
        status: 'published',
        views: v.views,
        likes: [standardUser._id],
      });
    }
    console.log('Inserted default videos.');

    // 4. Create Blogs
    for (const b of blogsData) {
      const catId = categoriesMap[b.categoryName] || categoriesMap['tutorials'];
      await Blog.create({
        title: b.title,
        content: b.content,
        coverImage: b.coverImage,
        category: catId,
        tags: b.tags,
        readingTime: Math.ceil(b.content.split(/\s+/).length / 200),
        creator: adminUser._id,
        status: 'published',
        views: b.views,
        likes: [standardUser._id],
      });
    }
    console.log('Inserted default blogs.');

    // 5. Create Photos
    for (const p of photosData) {
      const catId = categoriesMap[p.categoryName] || categoriesMap['showcases'];
      await Photo.create({
        title: p.title,
        description: p.description,
        imageUrl: p.imageUrl,
        category: catId,
        creator: adminUser._id,
        status: 'published',
        downloadsCount: p.downloadsCount,
      });
    }
    console.log('Inserted default gallery photos.');

    // 6. Create Stories
    for (const s of storiesData) {
      const catId = categoriesMap[s.categoryName] || categoriesMap['behind the scenes'];
      await Story.create({
        title: s.title,
        description: s.description,
        imageUrl: s.imageUrl,
        category: catId,
        date: s.date,
        creator: adminUser._id,
        status: 'published',
      });
    }
    console.log('Inserted default daily stories.');

    // 7. Add a comment
    const sampleVideo = await Video.findOne({});
    if (sampleVideo) {
      await Comment.create({
        video: sampleVideo._id,
        user: standardUser._id,
        content: 'This editing workflow looks amazing. Thanks for breaking down the technical configurations!',
      });
      console.log('Inserted default comments.');
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
