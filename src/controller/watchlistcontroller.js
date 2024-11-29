const Watchlist = require('../model/watchlist.model'); // Update with the actual path to your model
const Registration = require('../model/user.model'); // Update with the actual path to your model
const BaseMetal = require('../model/basemetal.model');
const fx=require('../model/fx.model')
const lme=require('../model/lmescrapwatchlist.model')
const mcx=require('../model/mcx.model')
const shfe=require('../model/shfe.model')
 //
 exports.addToWatchlist = async (req, res) => {
    const { email, baseMetalIds, fxIds, lmeIds, mcxIds, shfeIds, usIds } = req.body;

    try {
        // Find or create the watchlist entry for the user by email
        const watchlist = await Watchlist.findOneAndUpdate(
            { email },
            {
                $addToSet: { 
                    baseMetalIds: { $each: baseMetalIds || [] }, 
                    fxIds: { $each: fxIds || [] }, 
                    lmeIds: { $each: lmeIds || [] }, 
                    mcxIds: { $each: mcxIds || [] }, 
                    shfeIds: { $each: shfeIds || [] },
                    usIds: { $each: usIds || [] } // Corrected to use usIds
                }
            },
            { new: true, upsert: true }
        );

        res.status(201).json({
            message: 'Watchlist updated successfully',
            watchlist
        });
    } catch (error) {
        console.error('Error updating watchlist:', error);
        res.status(500).json({ message: 'Failed to update watchlist.' });
    }
};













// 2. Get a user's watchlist with baseMetal in array format
exports.getWatchlist = async (req, res) => {
    const { email } = req.query;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = await Registration.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const watchlistEntry = await Watchlist.findOne({ email })
            .populate('baseMetalIds')
            .populate('fxIds')
            .populate('lmeIds')
            .populate('mcxIds')
            .populate('shfeIds')
            .populate('usIds')
            .exec();

        console.log('Populated Watchlist Entry:', JSON.stringify(watchlistEntry, null, 2));

        if (!watchlistEntry) {
            return res.status(404).json({ message: 'No watchlist found for the user.' });
        }

        res.status(200).json({
            message: 'Watchlist retrieved successfully',
            watchlist: {
                baseMetals: watchlistEntry.baseMetalIds,
                fx: watchlistEntry.fxIds,
                lme: watchlistEntry.lmeIds,
                mcx: watchlistEntry.mcxIds,
                shfe: watchlistEntry.shfeIds,
                us: watchlistEntry.usIds
            }
        });
    } catch (error) {
        console.error('Error retrieving watchlist:', error);
        res.status(500).json({ message: 'Error retrieving watchlist.' });
    }
};


exports.deleteWatchListItemById = async (req, res) => {
    try {
        const { id, email } = req.query; // Get the ID and email from query parameters

        // Validate required fields
        if (!id || !email) {
            return res.status(400).json({
                success: false,
                message: "ID and email are required.",
            });
        }

        // Find the user by email
        const user = await Registration.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // List of fields to check
        const fieldsToCheck = ['baseMetalIds', 'fxIds', 'lmeIds', 'mcxIds', 'shfeIds','usIds'];
        let updatedWatchlist;

        // Iterate over each field and try to remove the ID from the array if it exists
        for (const field of fieldsToCheck) {
            updatedWatchlist = await Watchlist.findOneAndUpdate(
                { email, [field]: id }, // Check if the ID is in the current array
                { $pull: { [field]: id } }, // Remove the ID from the array
                { new: true }
            );
            if (updatedWatchlist) break; // If ID is found and removed, stop further checks
        }

        // Check if the ID was removed from any watchlist array
        if (!updatedWatchlist) {
            return res.status(404).json({
                success: false,
                message: "ID not found in any watchlist field.",
            });
        }

        // Respond with success message
        res.status(200).json({
            success: true,
            message: "Item removed from watchlist successfully.",
            data: updatedWatchlist,
        });
    } catch (error) {
        // Handle any errors during deletion
        res.status(500).json({
            success: false,
            message: "Error removing item from watchlist.",
            error: error.message,
        });
    }
};




