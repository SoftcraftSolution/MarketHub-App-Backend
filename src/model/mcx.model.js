// model/mcx.model.js
const mongoose = require('mongoose');

// Define the schema for MCX data
const mcxSchema = new mongoose.Schema({
    Symbol: { type: String, required: true, unique: true },  // Unique identifier for the commodity
    Last: { type: String, required: true },                  // Last traded price
    Change: { type: String, required: true },                // Change in price
    ChangePercent: { type: String, required: true },         // Percentage change in price
    Close: { type: String, required: true },                 // Closing price
    High: { type: String, required: true },                  // Highest price of the day
    Low: { type: String, required: true },                   // Lowest price of the day
    LastTrade: { type: String, required: true }              // Timestamp of the last trade
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Export the model
module.exports = mongoose.model('MCX', mcxSchema);
