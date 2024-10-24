const mongoose = require('mongoose');

const circularNewsSchema = new mongoose.Schema({
    addTitle: {
        type: String,
      
    },
    addContent: {
       type:String,
    },
    addLink: {
        type: String,
      
    },
    image: {
        type: String,
      
    },
    pdf:{
        type: String,
    },
    email: {
        type: String,
      
    },
    shareNews: {
        type: [String], // Change to an array of strings
        enum: ['freeTrialUsers', 'extendedTrialUsers', 'standardTrailUsers', 'premiumTrailUsers', 'basicTrailUsers'],
    },
}, { timestamps: true });

const CircularNews = mongoose.model('CircularNews', circularNewsSchema);

module.exports = CircularNews;
