import User from '../models/User.js';
import Video from '../models/Video.js';
import Blog from '../models/Blog.js';
import Photo from '../models/Photo.js';
import Story from '../models/Story.js';
import Comment from '../models/Comment.js';

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/analytics
// @access  Private/Admin
export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Get total counts
    const totalUsers = await User.countDocuments({});
    const totalVideos = await Video.countDocuments({});
    const totalBlogs = await Blog.countDocuments({});
    const totalPhotos = await Photo.countDocuments({});
    const totalStories = await Story.countDocuments({});

    // 2. Sum video & blog views
    const videoViewsRes = await Video.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
    const blogViewsRes = await Blog.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
    const totalViews = (videoViewsRes[0]?.total || 0) + (blogViewsRes[0]?.total || 0);

    // 3. Sum comments
    const totalComments = await Comment.countDocuments({});

    // 4. Sum likes
    const videoLikesRes = await Video.aggregate([
      { $project: { numLikes: { $cond: { if: { $isArray: '$likes' }, then: { $size: '$likes' }, else: 0 } } } },
      { $group: { _id: null, total: { $sum: '$numLikes' } } },
    ]);
    const blogLikesRes = await Blog.aggregate([
      { $project: { numLikes: { $cond: { if: { $isArray: '$likes' }, then: { $size: '$likes' }, else: 0 } } } },
      { $group: { _id: null, total: { $sum: '$numLikes' } } },
    ]);
    const totalLikes = (videoLikesRes[0]?.total || 0) + (blogLikesRes[0]?.total || 0);

    // 5. Popular contents
    const popularVideos = await Video.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(3)
      .populate('category', 'displayName')
      .lean();
    const popularBlogs = await Blog.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(3)
      .populate('category', 'displayName')
      .lean();

    const popularContent = [
      ...popularVideos.map((v) => ({ ...v, contentType: 'Video' })),
      ...popularBlogs.map((b) => ({ ...b, contentType: 'Blog' })),
    ].sort((a, b) => b.views - a.views).slice(0, 5);

    // 6. Recent Uploads across all content types
    const recentVideos = await Video.find({}).sort({ createdAt: -1 }).limit(5).populate('category', 'displayName').lean();
    const recentBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(5).populate('category', 'displayName').lean();
    const recentPhotos = await Photo.find({}).sort({ createdAt: -1 }).limit(5).populate('category', 'displayName').lean();
    const recentStories = await Story.find({}).sort({ createdAt: -1 }).limit(5).populate('category', 'displayName').lean();

    const recentUploads = [
      ...recentVideos.map((v) => ({ ...v, contentType: 'Video' })),
      ...recentBlogs.map((b) => ({ ...b, contentType: 'Blog' })),
      ...recentPhotos.map((p) => ({ ...p, contentType: 'Photo' })),
      ...recentStories.map((s) => ({ ...s, contentType: 'Story' })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // 7. Category views chart stats (views per category)
    const categoryStatsVideos = await Video.aggregate([
      { $group: { _id: '$category', views: { $sum: '$views' }, count: { $sum: 1 } } },
    ]);
    const categoryStatsBlogs = await Blog.aggregate([
      { $group: { _id: '$category', views: { $sum: '$views' }, count: { $sum: 1 } } },
    ]);

    // Format category stats with display names
    // Merge the statistics in JS
    const statsMap = {};
    
    // Add video stats
    for (const item of categoryStatsVideos) {
      if (item._id) {
        statsMap[item._id] = { views: item.views, count: item.count };
      }
    }
    // Add blog stats
    for (const item of categoryStatsBlogs) {
      if (item._id) {
        if (statsMap[item._id]) {
          statsMap[item._id].views += item.views;
          statsMap[item._id].count += item.count;
        } else {
          statsMap[item._id] = { views: item.views, count: item.count };
        }
      }
    }

    // Populate Category display names manually to avoid complex lookup Population
    const formattedStats = [];
    for (const catId of Object.keys(statsMap)) {
      try {
        const cat = await User.db.model('Category').findById(catId);
        if (cat) {
          formattedStats.push({
            categoryName: cat.displayName,
            views: statsMap[catId].views,
            count: statsMap[catId].count,
          });
        }
      } catch (err) {
        // Skip invalid category refs
      }
    }

    res.json({
      success: true,
      data: {
        counters: {
          users: totalUsers,
          videos: totalVideos,
          blogs: totalBlogs,
          photos: totalPhotos,
          stories: totalStories,
          views: totalViews,
          comments: totalComments,
          likes: totalLikes,
        },
        popularContent,
        recentUploads,
        categoryStats: formattedStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
