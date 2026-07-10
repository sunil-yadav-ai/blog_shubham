import express from 'express';
import {
  getVideos,
  getVideoById,
  uploadVideo,
  updateVideo,
  deleteVideo,
  likeVideo,
  saveVideoToLibrary,
} from '../controllers/videoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

const videoUploadFields = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);

router.get('/', getVideos);
router.get('/:id', getVideoById);
router.post('/', protect, admin, videoUploadFields, uploadVideo);
router.put('/:id', protect, admin, videoUploadFields, updateVideo);
router.delete('/:id', protect, admin, deleteVideo);

// Interaction endpoints
router.post('/:id/like', protect, likeVideo);
router.post('/:id/save', protect, saveVideoToLibrary);

export default router;
