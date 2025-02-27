const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true }, 
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, required: true },
    others: { type: String },
    dateTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
