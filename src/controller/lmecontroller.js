const WarehouseStock = require('../model/lmewarehouse.model'); 
const Settlement3M=require('../model/settlement.model')
const Settlement=require('../model/settlmentcash.model')

exports.getlmewarehouse = async (req, res) => {
    try {
        const lmeStockData = await WarehouseStock.find(); // Use the model to find documents

        // Check if data was retrieved
        if (!lmeStockData.length) {
            return res.status(404).json({ message: 'No warehouse stock data found.' });
        }

        res.status(200).json({
            message: 'LME warehouse stock retrieved successfully',
            data: lmeStockData,
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching LME warehouse stock.' });
    }
};

// exports.getSettlementCash = async (req, res) => {
//     try {
//         const settlement = await SettlementCash.find();
//          // Fetch settlement data

//         if (!settlement.length) {
//             return res.status(404).json({ message: 'No settlement data found.' });
//         }

//         res.status(200).json({
//             message: 'Settlement data retrieved successfully',
//             settlement
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error fetching settlement data.' });
//     }
// };


// Ensure correct path to schema file

exports.getSettlementsAndCash = async (req, res) => {
    try {
        // Fetch all data from both collections
        const cashData = await Settlement.find(); // Fetch from `settlementcashs`
        const settlement3MData = await Settlement3M.find(); // Fetch from `settlement3m`

        // Log all retrieved data
        console.log('All Settlement Cash Data:', JSON.stringify(cashData, null, 2));
        console.log('All Settlement 3M Data:', JSON.stringify(settlement3MData, null, 2));

        // Handle case where no data is found
        if (!cashData.length && !settlement3MData.length) {
            return res.status(404).json({ message: 'No data found in both collections.' });
        }

        // Return combined data as JSON response
        res.status(200).json({
            message: 'Data retrieved successfully.',
            cashData: cashData, // Data from `settlementcashs`
            settlement3MData: settlement3MData, // Data from `settlement3m`
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching data from the database.' });
    }
}


exports.updateLmeWarehouseStock = async (req, res) => {
    try {
      const { symbol } = req.query;
      const updateData = req.body;
  
      if (!symbol) {
        return res.status(400).json({ error: "Symbol is required in query." });
      }
  
      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No update data provided." });
      }
  
      const warehouseData = await WarehouseStock.findOne({});
      if (!warehouseData) {
        return res.status(404).json({ error: "Warehouse data not found." });
      }
  
      if (!Array.isArray(warehouseData.LME_Warehouse_Stock)) {
        return res.status(400).json({ error: "LME_Warehouse_Stock field is missing or not an array." });
      }
  
      const stockItem = warehouseData.LME_Warehouse_Stock.find(item => item.Symbol === symbol);
  
      if (!stockItem) {
        return res.status(404).json({ error: `No stock item found for symbol: ${symbol}` });
      }
  
      // Update fields
      Object.keys(updateData).forEach(key => {
        if (key in stockItem) {
          stockItem[key] = updateData[key];
        }
      });
  
      await warehouseData.save();
  
      res.status(200).json({
        message: "LME warehouse stock updated successfully.",
        updatedStock: stockItem
      });
    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  };

  
  
  
  
  
  





















