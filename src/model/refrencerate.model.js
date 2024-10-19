const mongoose = require('mongoose');

// Define the SBI TT Schema
const sbiTTSchema = new mongoose.Schema({
  "SBI TT": { type: String, required: true }, // Match the JSON field name
  "BELOW 10 L": { type: String, required: true }, // Match the JSON field name
  "ABOVE 10 L": { type: String, required: true } // Match the JSON field name
});

// Define the RBI REFF RATE Schema
const rbiRefRateSchema = new mongoose.Schema({
  "RBI FBILL": { type: String, required: true }, // Match the JSON field name
  "Column2": { type: String, required: true } // Match the JSON field name
});

// Define the main Schema for storing both
const currencyRatesSchema = new mongoose.Schema({
  "SBI TT": [sbiTTSchema], // Match the JSON field name
  "RBI REFF RATE": [rbiRefRateSchema] // Match the JSON field name
}, { collection: 'referencerate' }); // Specify the collection name

// Create the model
const CurrencyRates = mongoose.model('CurrencyRates', currencyRatesSchema);

module.exports = CurrencyRates;
