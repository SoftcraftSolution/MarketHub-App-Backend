const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
    },
    date: {
        type: String, // Use String for date in "DD.MM.YYYY" format
        required: true,
    },
    bid: {
        type: Number,
        required: true,
    },
    ask: {
        type: Number,
        required: true,
    },
}, { collection: 'settlementcashs' }); // Explicitly set the collection name

const Settlement = mongoose.model('Settlement', settlementSchema);

module.exports = Settlement;
