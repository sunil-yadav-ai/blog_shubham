import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.resolve(__dirname, '../../temp');
const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    !process.env.CLOUDINARY_API_KEY.startsWith('12345') &&
    !process.env.CLOUDINARY_API_SECRET.includes('12345')
  );
};

const ensureDirectory = (targetDir) => {
  fs.mkdirSync(targetDir, { recursive: true });
};

const getBaseUrl = () => {
  return `http://localhost:${process.env.PORT || 5000}`;
};

const buildLocalUploadOutput = (localFilePath, folder) => {
  const safeFolder = (folder || 'uploads').replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-');
  const safeFileName = path.basename(localFilePath) || `upload-${Date.now()}`;
  const destinationDir = path.join(uploadsDir, safeFolder);
  ensureDirectory(destinationDir);

  const destinationPath = path.join(destinationDir, safeFileName);
  fs.copyFileSync(localFilePath, destinationPath);

  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }

  const relativePath = path.posix.join(safeFolder, safeFileName);
  return {
    url: `${getBaseUrl()}/uploads/${relativePath}`,
    publicId: `local:${relativePath}`,
    storage: 'local',
  };
};

/**
 * Uploads a file to Cloudinary when credentials are valid.
 * Falls back to a real local upload in the server uploads directory when Cloudinary is unavailable.
 * @param {string} localFilePath - Path to the local file
 * @param {string} folder - Target folder name
 * @param {string} resourceType - 'image' or 'video' or 'auto'
 * @returns {Promise<{ url: string, publicId: string, storage: string }>} 
 */
export const uploadToCloudinary = async (localFilePath, folder = 'creatorhub', resourceType = 'auto') => {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary credentials are not configured.');
    }

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: resourceType,
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      storage: 'cloudinary',
    };
  } catch (error) {
    console.warn(`Cloudinary upload unavailable: ${error.message}. Using local storage fallback.`);
    return buildLocalUploadOutput(localFilePath, folder);
  }
};

/**
 * Deletes a file from Cloudinary or from the local uploads directory.
 * @param {string} publicId - Cloudinary public ID or local storage identifier
 * @param {string} resourceType - 'image' or 'video'
 * @returns {Promise<any>}
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) return { result: 'ok' };

    if (typeof publicId === 'string' && publicId.startsWith('local:')) {
      const relativePath = publicId.replace('local:', '');
      const fullPath = path.join(uploadsDir, relativePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      return { result: 'ok' };
    }

    const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return res;
  } catch (error) {
    console.error(`Upload cleanup error: ${error.message}`);
    return null;
  }
};
