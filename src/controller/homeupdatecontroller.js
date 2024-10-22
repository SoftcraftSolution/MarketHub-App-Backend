const HomeUpdate = require('../model/homeupdate.model.js'); // Ensure this points to your model
const cloudinary = require('cloudinary').v2; // Import Cloudinary for image uploads

// Controller function to handle home updates
exports.homeUpdate = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Text is required.' });
        }

        // Log the entire request to check if files are being sent
        console.log('Request body:', req.body);
        console.log('Request files:', req.files); // Log all files received

        let image = null;

        // Check if image is received in the request
        if (req.files && req.files.image && req.files.image[0]) {
            console.log('Uploading image...');

            const imageFile = req.files.image[0]; // Access the image file buffer

            // Upload image buffer to Cloudinary
            image = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'images', resource_type: 'image' },
                    (error, result) => {
                        if (error) {
                            console.error('Error uploading to Cloudinary:', error);
                            reject(error);
                        }
                        resolve(result.secure_url);
                    }
                );
                uploadStream.end(imageFile.buffer); // Pass the buffer to the upload stream
            });
        }

        console.log('Uploaded image URL:', image);

        // Create new home update
        const newHomeUpdate = new HomeUpdate({
            text,
            image: image || null, // Image URL from Cloudinary
        });

        await newHomeUpdate.save();

        res.status(201).json({
            message: 'Home update successfully created',
            homeUpdate: newHomeUpdate,
        });
    } catch (error) {
        console.error('Error while adding home update:', error);
        res.status(500).json({ message: 'An error occurred while uploading the home update.' });
    }
};

