import Comment from '../models/Comment.js';

// @desc    Get comments for a blog or video
// @route   GET /api/comments
// @access  Public
export const getComments = async (req, res) => {
  const { video, blog } = req.query;

  try {
    let query = {};
    if (video) query.video = video;
    else if (blog) query.blog = blog;
    else {
      return res.status(400).json({ success: false, message: 'Please specify video or blog ID' });
    }

    const comments = await Comment.find(query)
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: comments.length, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post a comment
// @route   POST /api/comments
// @access  Private
export const addComment = async (req, res) => {
  const { video, blog, content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ success: false, message: 'Comment content is required' });
  }

  try {
    const commentData = {
      user: req.user._id,
      content,
    };

    if (video) commentData.video = video;
    else if (blog) commentData.blog = blog;
    else {
      return res.status(400).json({ success: false, message: 'Please attach to a video or blog' });
    }

    const comment = await Comment.create(commentData);
    
    // Populate user profile details for response
    const populatedComment = await Comment.findById(comment._id).populate('user', 'username avatar');

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Check ownership or admin role
    if (
      comment.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
