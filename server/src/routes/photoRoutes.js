import express from 'express';
import {
  getPhotos,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
  incrementDownload,
} from '../controllers/photoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getPhotos);
router.post('/', protect, admin, upload.single('image'), uploadPhoto);
router.put('/:id', protect, admin, upload.single('image'), updatePhoto);
router.delete('/:id', protect, admin, deletePhoto);

// Download increment
router.post('/:id/download', incrementDownload);

export default router;
