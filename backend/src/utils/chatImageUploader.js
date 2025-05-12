require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary (uses CLOUDINARY_URL from .env)
cloudinary.config();

// Create storage engine for chat message images
const chatImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ quality: 'auto' }],
    resource_type: 'auto'
  }
});

// Configure multer with Cloudinary storage for chat images
const chatImageUploader = multer({
  storage: chatImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
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
  chatImageUploader
};
