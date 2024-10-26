// controllers/watchlistController.js
const Watchlist = require('../model/watchlist.model'); // Update with the actual path to your model
const Registration = require('../model/user.model'); // Update with the actual path to your model
const BaseMetal = require('../model/basemetal.model'); // Update with the actual path to your model

// 1. Add a new watchlist entry
exports.addWatchlistEntry = async (req, res) => {
    const { email, baseMetalId } = req.body; // Extract email and baseMetalId from request body

    try {
        // Find the user by email
        const user = await Registration.findOne({ email }); // Change here to query by email directly
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Find the base metal by ID
        const baseMetal = await BaseMetal.findById(baseMetalId);
        if (!baseMetal) {
            return res.status(404).json({ message: 'Base metal not found.' });
        }

        // Create a new watchlist entry
        const newWatchlistEntry = new Watchlist({
            email: user._id, // Use the user's ObjectId
            baseMetalId,     // Store base metal's ObjectId
        });

        await newWatchlistEntry.save();
        res.status(201).json({ message: 'Watchlist entry created successfully', newWatchlistEntry });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ message: 'Error adding to watchlist.' });
    }
};
// 2. Get a user's watchlist
// 2. Get a user's watchlist with baseMetal in array format
// 2. Get a user's watchlist with baseMetal in array format, excluding email field
// 2. Get a user's watchlist with only necessary fields
// 2. Get a user's watchlist with only baseMetal entries
exports.getWatchlist = async (req, res) => {
    const { email } = req.query; // Extract email from query parameters

    try {
        // Find the user by email
        const user = await Registration.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Find all watchlist entries for this user
        const watchlistEntries = await Watchlist.find({ email: user._id })
            .populate('baseMetalId') // Populate base metal details
            .exec();

        // Extract only base metal details
        const baseMetalList = watchlistEntries.map(entry => entry.baseMetalId);

        res.status(200).json({
            message: 'Watchlist retrieved successfully',
            baseMetal: baseMetalList, // Return base metals directly as an array
        });
    } catch (error) {
        console.error('Error retrieving watchlist:', error);
        res.status(500).json({ message: 'Error retrieving watchlist.' });
    }
};




