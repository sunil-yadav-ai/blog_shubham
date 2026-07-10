import express from 'express';
import {
  getStories,
  getStoryArchives,
  createStory,
  updateStory,
  deleteStory,
} from '../controllers/storyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getStories);
router.get('/archives', getStoryArchives);
router.post('/', protect, admin, upload.single('image'), createStory);
router.put('/:id', protect, admin, upload.single('image'), updateStory);
router.delete('/:id', protect, admin, deleteStory);

export default router;
