import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    downloadsCount: {
      type: Number,
      default: 0,
    },
    cloudinaryPublicId: String,
  },
  {
    timestamps: true,
  }
);

// Create text index for search
photoSchema.index({ title: 'text', description: 'text' });

const Photo = mongoose.model('Photo', photoSchema);
export default Photo;
