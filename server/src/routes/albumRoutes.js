import express from 'express';
import { getAlbums, createAlbum, deleteAlbum } from '../controllers/albumController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAlbums);
router.post('/', protect, admin, createAlbum);
router.delete('/:id', protect, admin, deleteAlbum);

export default router;
