const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  settlementscash: [
    {
      symbol: {
        type: String,
        required: true,
      },
      date: {
        type: String, // Use String for date in "DD.MM.YYYY" format
        required: true,
      },
      bid: {
        type: Number,
        required: true,
      },
      ask: {
        type: Number,
        required: true,
      },
    },
  ],
});

const Settlement = mongoose.model('SettlementCashs', settlementSchema);

module.exports = Settlement;
