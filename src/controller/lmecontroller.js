const WarehouseStock = require('../model/lmewarehouse.model'); 
const Settlement=require('../model/settlement.model')
const SettlementCash=require('../model/settlmentcash.model')

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
exports.getSettlements = async (req, res) => {
    try {
        const settlementData = await Settlement.find();
         // Fetch settlement data

        if (!settlementData.length) {
            return res.status(404).json({ message: 'No settlement data found.' });
        }

        res.status(200).json({
            message: 'Settlement data retrieved successfully',
            data: settlementData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching settlement data.' });
    }
};
exports.getSettlementCash = async (req, res) => {
    try {
        const settlement = await SettlementCash.find();
         // Fetch settlement data

        if (!settlement.length) {
            return res.status(404).json({ message: 'No settlement data found.' });
        }

        res.status(200).json({
            message: 'Settlement data retrieved successfully',
            settlement
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching settlement data.' });
    }
};
