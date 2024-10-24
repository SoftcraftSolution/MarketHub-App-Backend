const mongoose = require('mongoose');

const warehouseStockSchema = new mongoose.Schema({
  Symbol: {
    type: String,
    required: true,
    unique: true
  },
  Open: {
    type: Number,
    required: true
  },
  In: {
    type: Number,
    required: true,
   
  },
  Out: {
    type: Number,
    required: true,
   
  },
  Close: {
    type: Number,
    required: true
  },
  Live: {
    type: Number,
    required: true
  },
  Cancel: {
    type: Number,
    required: true
  },
  Change: {
    type: Number,
    required: true
  },
  PercentChange: {
    type: Number,
    required: true
  }
});

// Create a model from the schema
const WarehouseStock = mongoose.model('lmewarehouse', warehouseStockSchema);

module.exports = WarehouseStock;
