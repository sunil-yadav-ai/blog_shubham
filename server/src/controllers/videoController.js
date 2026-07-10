import Video from '../models/Video.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryHelper.js';

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
export const getVideos = async (req, res) => {
  try {
    const { category, q, status } = req.query;
    let query = {};

    // Filter by status (draft/published). Non-admins should only see published.
    if (status && req.user && req.user.role === 'admin') {
      query.status = status;
    } else {
      query.status = 'published';
    }

    // Filter by Category
    if (category && category !== 'All Videos') {
      // Find category by name
      const categoryDoc = await Category.findOne({
        $or: [{ name: category.toLowerCase() }, { displayName: category }],
      });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // If category is passed but doesn't exist, return empty array
        return res.json({ success: true, videos: [] });
      }
    }

    // Filter by Search Query
    if (q) {
      query.$text = { $search: q };
    }

    const videos = await Video.find(query)
      .populate('creator', 'username avatar')
      .populate('category', 'name displayName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: videos.length, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get video by ID & increment views
// @route   GET /api/videos/:id
// @access  Public
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('category', 'name displayName');

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Increment view count
    video.views += 1;
    await video.save();

    // Fetch related videos (same category, excluding current video)
    const relatedVideos = await Video.find({
      category: video.category._id,
      _id: { $ne: video._id },
      status: 'published',
    })
      .populate('creator', 'username avatar')
      .limit(5);

    res.json({ success: true, video, relatedVideos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create / upload new video
// @route   POST /api/videos
// @access  Private/Admin
export const uploadVideo = async (req, res) => {
  try {
    const { title, description, category, duration, status } = req.body;

    if (!req.files || !req.files.video || !req.files.thumbnail) {
      return res.status(400).json({ success: false, message: 'Please upload both video and thumbnail files' });
    }

    // Find category ID
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    // Upload video to Cloudinary
    const videoUpload = await uploadToCloudinary(
      req.files.video[0].path,
      'creatorhub/videos',
      'video'
    );

    // Upload thumbnail to Cloudinary
    const thumbnailUpload = await uploadToCloudinary(
      req.files.thumbnail[0].path,
      'creatorhub/thumbnails',
      'image'
    );

    const video = await Video.create({
      title,
      description,
      videoUrl: videoUpload.url,
      thumbnailUrl: thumbnailUpload.url,
      duration: duration || '00:00',
      category: categoryDoc._id,
      creator: req.user._id,
      status: status || 'published',
      cloudinaryPublicId: videoUpload.publicId,
      thumbnailPublicId: thumbnailUpload.publicId,
    });

    res.status(201).json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private/Admin
export const updateVideo = async (req, res) => {
  try {
    const { title, description, category, duration, status } = req.body;

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Update fields
    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (duration) video.duration = duration;
    if (status) video.status = status;

    if (category) {
      const categoryDoc = await Category.findById(category);
      if (categoryDoc) {
        video.category = categoryDoc._id;
      }
    }

    // If new files are uploaded
    if (req.files) {
      if (req.files.video) {
        // Delete old video
        if (video.cloudinaryPublicId) {
          await deleteFromCloudinary(video.cloudinaryPublicId, 'video');
        }
        const videoUpload = await uploadToCloudinary(req.files.video[0].path, 'creatorhub/videos', 'video');
        video.videoUrl = videoUpload.url;
        video.cloudinaryPublicId = videoUpload.publicId;
      }

      if (req.files.thumbnail) {
        // Delete old thumbnail
        if (video.thumbnailPublicId) {
          await deleteFromCloudinary(video.thumbnailPublicId, 'image');
        }
        const thumbnailUpload = await uploadToCloudinary(req.files.thumbnail[0].path, 'creatorhub/thumbnails', 'image');
        video.thumbnailUrl = thumbnailUpload.url;
        video.thumbnailPublicId = thumbnailUpload.publicId;
      }
    }

    const updatedVideo = await video.save();
    res.json({ success: true, video: updatedVideo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private/Admin
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Delete files from Cloudinary
    if (video.cloudinaryPublicId) {
      await deleteFromCloudinary(video.cloudinaryPublicId, 'video');
    }
    if (video.thumbnailPublicId) {
      await deleteFromCloudinary(video.thumbnailPublicId, 'image');
    }

    await video.deleteOne();
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like / unlike a video
// @route   POST /api/videos/:id/like
// @access  Private
export const likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    const alreadyLiked = video.likes.includes(req.user._id);

    if (alreadyLiked) {
      // Unlike
      video.likes = video.likes.filter((userId) => userId.toString() !== req.user._id.toString());
    } else {
      // Like
      video.likes.push(req.user._id);
    }

    await video.save();
    res.json({ success: true, likesCount: video.likes.length, isLiked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save / unsave video to user library
// @route   POST /api/videos/:id/save
// @access  Private
export const saveVideoToLibrary = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const videoId = req.params.id;
    const isSaved = user.savedLibrary.includes(videoId);

    if (isSaved) {
      // Unsave
      user.savedLibrary = user.savedLibrary.filter((id) => id.toString() !== videoId.toString());
    } else {
      // Save
      user.savedLibrary.push(videoId);
    }

    await user.save();
    res.json({ success: true, isSaved: !isSaved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
