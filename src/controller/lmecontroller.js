const WarehouseStock = require('../model/lmewarehouse.model'); 

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
