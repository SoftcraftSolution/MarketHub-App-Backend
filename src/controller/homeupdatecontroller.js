


const HomeUpdate = require('../model/homeupdate.model.js'); // Import the Mongoose model
const cloudinary = require('cloudinary').v2; // Import Cloudinary



// Controller for handling home updates
exports.homeUpdate = async (req, res) => {
    try {
        const { text ,imageBase64} = req.body;

       

        let imageUrl = null;

        // Check if files are provided and process the 'image' file
        if (req.files && req.files.image && req.files.image[0]) {
            console.log('Uploading image to Cloudinary...');
            try {
                const fileBuffer = req.files.image[0].buffer; // Access file buffer
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'images' }, // Specify folder in Cloudinary
                        (error, result) => {
                            if (error) {
                                return reject(error);
                            }
                            resolve(result);
                        }
                    );
                    uploadStream.end(fileBuffer); // Stream the file buffer to Cloudinary
                });

                imageUrl = result.secure_url; // Get the uploaded image's URL
                console.log('Cloudinary upload successful:', imageUrl);
            } catch (error) {
                console.error('Error uploading image to Cloudinary:', error);
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