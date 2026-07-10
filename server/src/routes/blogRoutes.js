import express from 'express';
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  bookmarkBlog,
} from '../controllers/blogController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.post('/', protect, admin, upload.single('coverImage'), createBlog);
router.put('/:id', protect, admin, upload.single('coverImage'), updateBlog);
router.delete('/:id', protect, admin, deleteBlog);

// Interactions
router.post('/:id/like', protect, likeBlog);
router.post('/:id/bookmark', protect, bookmarkBlog);

export default router;
