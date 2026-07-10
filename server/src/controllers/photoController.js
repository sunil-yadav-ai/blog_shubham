import Photo from '../models/Photo.js';
import Category from '../models/Category.js';
import Album from '../models/Album.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryHelper.js';

// @desc    Get all photos (with search, category, album filters)
// @route   GET /api/photos
// @access  Public
export const getPhotos = async (req, res) => {
  try {
    const { category, album, q, status } = req.query;
    let query = {};

    // Draft filter
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

    // Album filter
    if (album && album !== 'All') {
      const albumDoc = await Album.findById(album);
      if (albumDoc) {
        query.album = albumDoc._id;
      }
    }

    // Full text search
    if (q) {
      query.$text = { $search: q };
    }

    const photos = await Photo.find(query)
      .populate('creator', 'username avatar')
      .populate('category', 'name displayName')
      .populate('album', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: photos.length, photos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload new photo
// @route   POST /api/photos
// @access  Private/Admin
export const uploadPhoto = async (req, res) => {
  try {
    const { title, description, category, album, status } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    // Category Validation
    let categoryId = null;
    if (category) {
      const categoryDoc = await Category.findById(category);
      if (categoryDoc) categoryId = categoryDoc._id;
    }

    // Album Validation
    let albumId = null;
    if (album) {
      const albumDoc = await Album.findById(album);
      if (albumDoc) albumId = albumDoc._id;
    }

    // Upload to Cloudinary
    const photoUpload = await uploadToCloudinary(req.file.path, 'creatorhub/gallery', 'image');

    const photo = await Photo.create({
      title,
      description,
      imageUrl: photoUpload.url,
      category: categoryId,
      album: albumId,
      creator: req.user._id,
      status: status || 'published',
      cloudinaryPublicId: photoUpload.publicId,
    });

    res.status(201).json({ success: true, photo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update photo metadata
// @route   PUT /api/photos/:id
// @access  Private/Admin
export const updatePhoto = async (req, res) => {
  try {
    const { title, description, category, album, status } = req.body;

    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(44).json({ success: false, message: 'Photo not found' });
    }

    if (title) photo.title = title;
    if (description !== undefined) photo.description = description;
    if (status) photo.status = status;

    if (category) {
      const categoryDoc = await Category.findById(category);
      if (categoryDoc) photo.category = categoryDoc._id;
    }

    if (album) {
      const albumDoc = await Album.findById(album);
      if (albumDoc) photo.album = albumDoc._id;
    }

    // Handle image replace if needed
    if (req.file) {
      if (photo.cloudinaryPublicId) {
        await deleteFromCloudinary(photo.cloudinaryPublicId, 'image');
      }
      const photoUpload = await uploadToCloudinary(req.file.path, 'creatorhub/gallery', 'image');
      photo.imageUrl = photoUpload.url;
      photo.cloudinaryPublicId = photoUpload.publicId;
    }

    const updatedPhoto = await photo.save();
    res.json({ success: true, photo: updatedPhoto });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete photo
// @route   DELETE /api/photos/:id
// @access  Private/Admin
export const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    if (photo.cloudinaryPublicId) {
      await deleteFromCloudinary(photo.cloudinaryPublicId, 'image');
    }

    await photo.deleteOne();
    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment photo download count
// @route   POST /api/photos/:id/download
// @access  Public
export const incrementDownload = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    photo.downloadsCount += 1;
    await photo.save();

    res.json({ success: true, downloadsCount: photo.downloadsCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
