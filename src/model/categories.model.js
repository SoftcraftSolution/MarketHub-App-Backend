const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true } // E.g., Copper, Aluminium, etc.
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
