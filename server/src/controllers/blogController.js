import Blog from '../models/Blog.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryHelper.js';

// @desc    Get all blogs (with pagination, search, category, tag, and sort filters)
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 6, category, tag, q, sort, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    // Draft / published security
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

    // Tag filter
    if (tag) {
      query.tags = tag;
    }

    // Text search query
    if (q) {
      query.$text = { $search: q };
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default: recent
    if (sort === 'popular') {
      sortOption = { views: -1, likesCount: -1 };
    }

    const total = await Blog.countDocuments(query);
    
    // Fetch blogs
    const blogs = await Blog.find(query)
      .populate('creator', 'username avatar')
      .populate('category', 'name displayName')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        page: pageNum,
        limit: limitNum,
      },
      blogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get blog by ID (increments views, returns related posts)
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('category', 'name displayName');

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    // Fetch related articles (same category or sharing some tags, excluding current)
    const relatedBlogs = await Blog.find({
      $or: [{ category: blog.category?._id }, { tags: { $in: blog.tags } }],
      _id: { $ne: blog._id },
      status: 'published',
    })
      .populate('creator', 'username avatar')
      .limit(3);

    res.json({ success: true, blog, relatedBlogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new blog post
// @route   POST /api/blogs
// @access  Private/Admin
export const createBlog = async (req, res) => {
  try {
    const { title, content, category, tags, status } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a cover image file' });
    }

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    // Parse tags if sent as string (e.g. from form-data)
    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        parsedTags = tags.split(',').map((t) => t.trim());
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    // Calculate reading time
    const wordCount = content ? content.trim().split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Upload cover to Cloudinary
    const coverUpload = await uploadToCloudinary(req.file.path, 'creatorhub/blogs', 'image');

    const blog = await Blog.create({
      title,
      content,
      coverImage: coverUpload.url,
      category: categoryDoc._id,
      tags: parsedTags,
      readingTime,
      creator: req.user._id,
      status: status || 'published',
      cloudinaryPublicId: coverUpload.publicId,
    });

    res.status(201).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Private/Admin
export const updateBlog = async (req, res) => {
  try {
    const { title, content, category, tags, status } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (title) blog.title = title;
    if (content) {
      blog.content = content;
      // Recalculate reading time
      const wordCount = content.trim().split(/\s+/).length;
      blog.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    if (status) blog.status = status;

    if (category) {
      const categoryDoc = await Category.findById(category);
      if (categoryDoc) {
        blog.category = categoryDoc._id;
      }
    }

    if (tags) {
      if (typeof tags === 'string') {
        blog.tags = tags.split(',').map((t) => t.trim());
      } else if (Array.isArray(tags)) {
        blog.tags = tags;
      }
    }

    // Check if new cover image is uploaded
    if (req.file) {
      // Delete old cover
      if (blog.cloudinaryPublicId) {
        await deleteFromCloudinary(blog.cloudinaryPublicId, 'image');
      }
      const coverUpload = await uploadToCloudinary(req.file.path, 'creatorhub/blogs', 'image');
      blog.coverImage = coverUpload.url;
      blog.cloudinaryPublicId = coverUpload.publicId;
    }

    const updatedBlog = await blog.save();
    res.json({ success: true, blog: updatedBlog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete blog post
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Delete cover from Cloudinary
    if (blog.cloudinaryPublicId) {
      await deleteFromCloudinary(blog.cloudinaryPublicId, 'image');
    }

    await blog.deleteOne();
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like / unlike a blog
// @route   POST /api/blogs/:id/like
// @access  Private
export const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const alreadyLiked = blog.likes.includes(req.user._id);

    if (alreadyLiked) {
      // Unlike
      blog.likes = blog.likes.filter((userId) => userId.toString() !== req.user._id.toString());
    } else {
      // Like
      blog.likes.push(req.user._id);
    }

    await blog.save();
    res.json({ success: true, likesCount: blog.likes.length, isLiked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bookmark / unbookmark a blog
// @route   POST /api/blogs/:id/bookmark
// @access  Private
export const bookmarkBlog = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(44).json({ success: false, message: 'User not found' });
    }

    const blogId = req.params.id;
    const isBookmarked = user.bookmarkedBlogs.includes(blogId);

    if (isBookmarked) {
      // Unbookmark
      user.bookmarkedBlogs = user.bookmarkedBlogs.filter((id) => id.toString() !== blogId.toString());
    } else {
      // Bookmark
      user.bookmarkedBlogs.push(blogId);
    }

    await user.save();
    res.json({ success: true, isBookmarked: !isBookmarked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
