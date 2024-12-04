

const HomeUpdate = require('../model/homeupdate.model.js'); // Import your Mongoose model

// Controller for handling home updates
exports.homeUpdate = async (req, res) => {
    try {
        const { text, imageBase64 } = req.body;

        // Validate that text is provided
        if (!text) {
            return res.status(400).json({ message: 'Text is required.' });
        }

        // Directly save the Base64 image in the database
        const newHomeUpdate = new HomeUpdate({
            text,
            image: imageBase64 || null, // Save Base64 data or set to null if not provided
        });

        // Save to the database
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