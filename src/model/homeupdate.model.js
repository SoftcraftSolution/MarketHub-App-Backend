const mongoose = require('mongoose');

const homeUpdateSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true, // Optional: add this if you want to make the field required
        },
        image: {
            type: String,
           // Optional: add this if you want to make the field required
        }
    },
    {
        timestamps: true, // Correctly place timestamps here
    }
);

const HomeUpdate = mongoose.model('HomeUpdate', homeUpdateSchema); // Capitalize the model name

module.exports = HomeUpdate;
