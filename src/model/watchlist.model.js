const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    email: { // Changed from email to user for clarity
        type: String,

    },
    baseMetalId: { // Add baseMetalId to uniquely identify the base metal
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BaseMetal', // Reference to the BaseMetal model
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});




const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;
