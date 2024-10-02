const SelfNews= require('../model/selfnews.model');
const cloudinary = require('cloudinary').v2;
const fetch = require('node-fetch'); // Ensure you have node-fetch installed

const response = require('../middleware/response')
const Admin = require('../model/admin.model'); 

exports.addSelfNews = async (req, res) => {
    try {
        // Extract data from request body
        const { addTitle, addContent, addLink, adminPhoneNumber, shareNews } = req.body;

        // Validate input fields
        if (!addTitle || !addContent || !adminPhoneNumber) {
            return res.status(400).json({ message: 'Title, content, and phone number are required.' });
        }

        // Optional: Check if the admin exists
        const admin = await Admin.findOne({ phoneNumber: adminPhoneNumber });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        // Ensure shareNews is an array and handle any duplicates if necessary
        const shareNewsArray = JSON.parse(shareNews);

        // Create a new SelfNews document
        const newAddSelfNews = new SelfNews({
            addTitle,
            addContent,
            addLink,
            image: req.file ? req.file.path : null, // Handle image if uploaded
            adminPhoneNumber,
            shareNews: shareNewsArray, // Save the shareNews array
        });

        // Save the new document to the database
        await newAddSelfNews.save();

        // Send a success response
        res.status(201).json({
            message: 'News uploaded successfully',
            addSelfNews: newAddSelfNews,
        });
    } catch (error) {
        console.error('Error while adding self news:', error); // Log the error for debugging
        res.status(500).json({ message: 'An error occurred while uploading news.' });
    }
};
