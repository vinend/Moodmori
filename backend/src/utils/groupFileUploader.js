require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary (uses CLOUDINARY_URL from .env)
cloudinary.config();

// Create storage engine for group chat images
const groupStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'group-chats',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }]
  }
});

// Configure multer with Cloudinary storage for group images
const groupImageUploader = multer({
  storage: groupStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Limit file size to 2MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

module.exports = {
  groupImageUploader
};
