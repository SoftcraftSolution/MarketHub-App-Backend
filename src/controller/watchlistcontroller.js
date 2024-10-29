const Watchlist = require('../model/watchlist.model'); // Update with the actual path to your model
const Registration = require('../model/user.model'); // Update with the actual path to your model
const BaseMetal = require('../model/basemetal.model');
const fx=require('../model/fx.model')
const lme=require('../model/lmescrapwatchlist.model')
const mcx=require('../model/mcx.model')
const shfe=require('../model/shfe.model')
 //
 exports.addToWatchlist = async (req, res) => {
    const { email, baseMetalIds, fxIds, lmeIds, mcxIds, shfeIds } = req.body;

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
                    shfeIds: { $each: shfeIds || [] }
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
            .populate('baseMetalIds') // Populate base metals
            .populate('fxIds')        // Populate FX
            .populate('lmeIds')       // Populate LME
            .populate('mcxIds')       // Populate MCX
            .populate('shfeIds')      // Populate SHFE
            .exec();

        if (!watchlistEntry) {
            return res.status(404).json({ message: 'No watchlist found for the user.' });
        }

        // Format the response
        res.status(200).json({
            message: 'Watchlist retrieved successfully',
            watchlist: {
                baseMetals: watchlistEntry.baseMetalIds,  // Detailed Base Metal information
                fx: watchlistEntry.fxIds,                 // Detailed FX information
                lme: watchlistEntry.lmeIds,               // Detailed LME information
                mcx: watchlistEntry.mcxIds,               // Detailed MCX information
                shfe: watchlistEntry.shfeIds              // Detailed SHFE information
            }
        });
    } catch (error) {
        console.error('Error retrieving watchlist:', error);
        res.status(500).json({ message: 'Error retrieving watchlist.' });
    }
};

exports.deleteWatchListById = async (req, res) => {
    try {
        const { id, email } = req.query; // Get the baseMetalId and email from query parameters

        // Validate the baseMetalId
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Base metal ID is required.",
            });
        }

        // Validate the email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
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

        // Find and update the watchlist, removing the specified baseMetalId from the baseMetalIds array
        const updatedWatchlist = await Watchlist.findOneAndUpdate(
            { email },
            { $pull: { baseMetalIds: id } }, // Remove the specified baseMetalId from the array
            { new: true } // Return the updated document
        );

        // Check if the baseMetalId was removed from the watchlist
        if (!updatedWatchlist || updatedWatchlist.baseMetalIds.length === 0) {
            return res.status(200).json({
                success: false,
                message: "Watchlist entry empty.",
            });
        }

        // Respond with success message
        res.status(200).json({
            success: true,
            message: "Base metal removed from watchlist successfully.",
            data: updatedWatchlist,
        });
    } catch (error) {
        // Handle any errors during deletion
        res.status(500).json({
            success: false,
            message: "Error removing base metal from watchlist.",
            error: error.message,
        });
    }
};




