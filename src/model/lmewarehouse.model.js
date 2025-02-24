const mongoose = require('mongoose');

// Define a sub-schema for individual stock entries
const stockItemSchema = new mongoose.Schema({
  Symbol: {
    type: String,
    required: true,
  },
  Open: {
    type: Number,
    required: true,
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
    required: true,
  },
  Live: {
    type: Number,
    
  },
  Cancel: {
    type: Number,
  
  },
  Change: {
    type: Number,
  
  },
  PercentChange: {
    type: Number,
   
  },
});

// Main schema with LME_Warehouse_Stock as an array of stockItemSchema
const warehouseStockSchema = new mongoose.Schema({
  LME_Warehouse_Stock: {
    type: [stockItemSchema],
    required: true,
  },
});

// Create the model
const WarehouseStock = mongoose.model('lmewarehouse', warehouseStockSchema);

module.exports = WarehouseStock;
