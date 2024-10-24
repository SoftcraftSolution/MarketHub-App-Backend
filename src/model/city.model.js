const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: { type: String, required: true },
    state: { type: String },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }],
    types: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Type' }],
});

const City = mongoose.model('City', citySchema);
module.exports = City;