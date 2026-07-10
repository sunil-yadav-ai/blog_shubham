import Story from '../models/Story.js';
import Category from '../models/Category.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryHelper.js';

// @desc    Get stories (filtered by category, month, year, search query)
// @route   GET /api/stories
// @access  Public
export const getStories = async (req, res) => {
  try {
    const { category, month, year, q, status } = req.query;
    let query = {};

    // Draft / published check
    if (status && req.user && req.user.role === 'admin') {
      query.status = status;
    } else {
      query.status = 'published';
    }

    // Category filter
    if (category && category !== 'All') {
      const categoryDoc = await Category.findOne({
        $or: [{ name: category.toLowerCase() }, { displayName: category }],
      });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Search query
    if (q) {
      query.$text = { $search: q };
    }

    // Date filters (Archives by month/year)
    if (year || month) {
      let startDate, endDate;
      const y = year ? parseInt(year) : new Date().getFullYear();
      
      if (month) {
        const m = parseInt(month) - 1; // 0-indexed in JS Dates
        startDate = new Date(y, m, 1);
        endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);
      } else {
        startDate = new Date(y, 0, 1);
        endDate = new Date(y, 11, 31, 23, 59, 59, 999);
      }
      
      query.date = { $gte: startDate, $lte: endDate };
    }

    const stories = await Story.find(query)
      .populate('creator', 'username avatar')
      .populate('category', 'name displayName')
      .sort({ date: -1 });

    res.json({ success: true, count: stories.length, stories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get archive month/year list for stories
// @route   GET /api/stories/archives
// @access  Public
export const getStoryArchives = async (req, res) => {
  try {
    // Aggregation pipeline to group stories by month and year
    const archives = await Story.aggregate([
      { $match: { status: 'published' } },
      {
        $project: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: '$count',
        },
      },
      { $sort: { year: -1, month: -1 } },
    ]);

    res.json({ success: true, archives });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new story
// @route   POST /api/stories
// @access  Private/Admin
export const createStory = async (req, res) => {
  try {
    const { title, description, category, date, status } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a story image file' });
    }

    let categoryId = null;
    if (category) {
      const categoryDoc = await Category.findById(category);
      if (categoryDoc) categoryId = categoryDoc._id;
    }

    // Upload to Cloudinary
    const imageUpload = await uploadToCloudinary(req.file.path, 'creatorhub/stories', 'image');

    const story = await Story.create({
      title,
      description,
      imageUrl: imageUpload.url,
      category: categoryId,
      date: date ? new Date(date) : Date.now(),
      creator: req.user._id,
      status: status || 'published',
      cloudinaryPublicId: imageUpload.publicId,
    });

    res.status(201).json({ success: true, story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update story
// @route   PUT /api/stories/:id
// @access  Private/Admin
export const updateStory = async (req, res) => {
  try {
    const { title, description, category, date, status } = req.body;

    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    if (title) story.title = title;
    if (description !== undefined) story.description = description;
    if (status) story.status = status;
    if (date) story.date = new Date(date);

    if (category) {
      const categoryDoc = await Category.findById(category);
      if (categoryDoc) story.category = categoryDoc._id;
    }

    if (req.file) {
      if (story.cloudinaryPublicId) {
        await deleteFromCloudinary(story.cloudinaryPublicId, 'image');
      }
      const imageUpload = await uploadToCloudinary(req.file.path, 'creatorhub/stories', 'image');
      story.imageUrl = imageUpload.url;
      story.cloudinaryPublicId = imageUpload.publicId;
    }

    const updatedStory = await story.save();
    res.json({ success: true, story: updatedStory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete story
// @route   DELETE /api/stories/:id
// @access  Private/Admin
export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    if (story.cloudinaryPublicId) {
      await deleteFromCloudinary(story.cloudinaryPublicId, 'image');
    }

    await story.deleteOne();
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
