const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // E.g., Copper Scrap, Copper Rod, etc.
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true } // Reference to Category
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
module.exports = Subcategory;
