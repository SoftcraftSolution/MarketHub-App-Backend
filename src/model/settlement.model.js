const mongoose = require('mongoose');

// Define the schema
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
}, { collection: 'settlement3m' }); // Explicitly set the collection name

// Create the model
const Settlement = mongoose.model('Settlement3M', settlementSchema);

module.exports = Settlement;
