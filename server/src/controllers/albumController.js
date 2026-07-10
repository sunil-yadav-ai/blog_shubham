import Album from '../models/Album.js';
import Photo from '../models/Photo.js';

// @desc    Get all albums
// @route   GET /api/albums
// @access  Public
export const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find({}).populate('creator', 'username').sort({ createdAt: -1 });
    res.json({ success: true, albums });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an album
// @route   POST /api/albums
// @access  Private/Admin
export const createAlbum = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Album name is required' });
  }

  try {
    const albumExists = await Album.findOne({ name });
    if (albumExists) {
      return res.status(400).json({ success: false, message: 'Album already exists' });
    }

    const album = await Album.create({
      name,
      description,
      creator: req.user._id,
    });

    res.status(201).json({ success: true, album });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an album
// @route   DELETE /api/albums/:id
// @access  Private/Admin
export const deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({ success: false, message: 'Album not found' });
    }

    // Set any photos under this album to have no album
    await Photo.updateMany({ album: album._id }, { $unset: { album: 1 } });

    await album.deleteOne();
    res.json({ success: true, message: 'Album deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
