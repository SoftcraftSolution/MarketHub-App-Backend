const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to handle image uploads to Cloudinary
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'images', // Store images in 'images' folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'], // Specify allowed image formats
    public_id: `${Date.now()}-${file.originalname}`, // Unique filename
  }),
});

// Function to handle visiting card uploads to Cloudinary
const visitingCardStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'visitingCards', // Store visiting cards in 'visitingCards' folder
    allowed_formats: ['jpg', 'jpeg', 'png'], // Specify allowed formats for visiting cards
    public_id: `${Date.now()}-${file.originalname}`, // Unique filename
  }),
});

// Function to handle PDF uploads to Cloudinary
const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'pdfs', // Store PDFs in 'pdfs' folder in Cloudinary
    allowed_formats: ['pdf'], // Specify allowed PDF formats
    public_id: `${Date.now()}-${file.originalname}`, // Unique filename
  }),
});

// Create separate upload middleware for images, visiting cards, and PDFs
const uploadImage = multer({
  storage: imageStorage, // Use image storage for image uploads
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit image file size to 10 MB
});

const uploadVisitingCard = multer({
  storage: visitingCardStorage, // Use visiting card storage
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit visiting card file size to 10 MB
});

// Create a separate upload middleware for PDFs
const uploadPdf = multer({
  storage: pdfStorage, // Use PDF storage
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit PDF file size to 10 MB
});

// Export all upload middlewares for use in routes
module.exports = {
  uploadImage: uploadImage.single('image'), // For handling single image uploads
  uploadVisitingCard: uploadVisitingCard.single('visitingCard'), // For handling single visiting card uploads
  uploadPdf: uploadPdf.single('pdf'), // For handling single PDF uploads
  cloudinary: cloudinary, // Export Cloudinary for use in other modules
};
