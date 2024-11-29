// models/watchlist.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const watchlistSchema = new Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    baseMetalIds: [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'BaseMetal' 
        }
    ],
    fxIds: [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'FX' 
        }
    ],
    lmeIds: [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'LMESCRAP' 
        }
    ],
    mcxIds: [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'MCX' 
        }
    ],
    shfeIds: [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'Shfe' 
        }
    ],
    usIds: [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'MCX' 
        }
    ],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Watchlist', watchlistSchema);
