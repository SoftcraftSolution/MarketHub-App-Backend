



const HomeUpdate = require('../model/homeupdate.model.js'); // Import the Mongoose model
const cloudinary = require('cloudinary').v2; // Import Cloudinary
const sharp = require('sharp'); // For image resizing

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: 60000, // Increase timeout to 60 seconds
});

// Resize the image buffer before uploading
const resizeImageBuffer = async (buffer) => {
    return await sharp(buffer).resize(1024).toBuffer(); // Resize to 1024px width while maintaining aspect ratio
};

// Controller for handling home updates
exports.homeUpdate = async (req, res) => {
    try {
        const { text , imageBase64} = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Text is required.' });
        }

        let imageUrl = null;

        // If an image file is provided, upload it to Cloudinary
        if (req.files && req.files.image && req.files.image[0]) {
            console.log('Resizing and uploading image to Cloudinary...');
            try {
                const resizedBuffer = await resizeImageBuffer(req.files.image[0].buffer);
                imageUrl = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'images' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result.secure_url);
                        }
                    );
                    uploadStream.end(resizedBuffer); // Stream the resized buffer to Cloudinary
                });
                console.log('Cloudinary upload successful:', imageUrl);
            } catch (error) {
                console.error('Error uploading resized image to Cloudinary:', error);
                return res.status(500).json({ message: 'Failed to upload image to Cloudinary.' });
            }
        } else {
            console.log('No image provided for Cloudinary upload.');
        }

        // Create a new HomeUpdate document
        const newHomeUpdate = new HomeUpdate({
            text:text||null,
            image: imageUrl || null,
            imageBase64 // Save the Cloudinary URL if available
        });

        // Save the document to the database
        await newHomeUpdate.save();

        // Send a success response
        res.status(201).json({
            message: 'Home update successfully created',
            homeUpdate: newHomeUpdate,
        });
    } catch (error) {
        console.error('Error while adding home update:', error);
        res.status(500).json({ message: 'An error occurred while saving the home update.' });
    }
};




exports.getHomeUpdates = async (req, res) => {
    try {
        const homeUpdates = await HomeUpdate.find();

        res.status(200).json({
            message: 'Home updates retrieved successfully',
            homeUpdates,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching home updates.' });
    }
};
exports.deleteHomeUpdate = async (req, res) => {
    try {
        // Retrieve the ID from the query parameters
        const { id } = req.query;

        // Ensure the ID is provided
        if (!id) {
            return res.status(400).json({ message: 'Home ID is required in query parameters' });
        }

        // Find and delete the news article by ID
        const news = await HomeUpdate.findByIdAndDelete(id);
        
        // Check if the news article was not found
        if (!news) {
            return res.status(404).json({ message: 'Home news not found' });
        }
        
        // Send success response
        res.status(200).json({ message: 'Home update deleted successfully' });
    } catch (error) {
        console.error('Error while deleting Self news:', error);
        res.status(500).json({ message: 'An error occurred while deleting news.' });
    }
};