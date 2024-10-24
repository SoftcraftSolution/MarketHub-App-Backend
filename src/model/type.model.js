const mongoose = require('mongoose');

const typeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // E.g., Bhathi, Plant, CCROD, SUPER ROD, etc.
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true } // Reference to Subcategory
});

const Type = mongoose.model('Type', typeSchema);
module.exports = Type;
