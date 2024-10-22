const mongoose = require('mongoose');

const homeUpdateSchema = new mongoose.Schema({
    text:{
        type:String,
    },
    image:{
        type:String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
     
    }
});

const homeUpdate = mongoose.model('homeUpdate', homeUpdateSchema);

module.exports = homeUpdate;
