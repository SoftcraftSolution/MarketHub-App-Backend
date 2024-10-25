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


exports.getSettlementsAndCash = async (req, res) => {
    try {
        // Fetch settlement and cash data
        const settlementsData = await Settlement.find();
        const cashData = await SettlementCash.find();

        // Log the retrieved data
        console.log('Settlements:', JSON.stringify(settlementsData, null, 2));
        console.log('Cash Data:', JSON.stringify(cashData, null, 2));

        if (!settlementsData.length && !cashData.length) {
            return res.status(404).json({ message: 'No settlement data found.' });
        }

        // Function to map cash data
        const mapCashData = (cashData) => {
            const cashDataMap = new Map();

            cashData.forEach(cashEntry => {
                if (Array.isArray(cashEntry.settlementscash) && cashEntry.settlementscash.length) {
                    cashEntry.settlementscash.forEach(cashSettlement => {
                        const cashKey = `${cashSettlement.symbol}-${cashSettlement.date}`;
                        console.log('Mapping Cash Settlement:', cashSettlement); // Log each mapping

                        // Ensure cash values are parsed as Int32
                        cashDataMap.set(cashKey, {
                            bid: cashSettlement.bid !== null ? parseInt(cashSettlement.bid, 10) : null,
                            ask: cashSettlement.ask !== null ? parseInt(cashSettlement.ask, 10) : null,
                            // Include more fields if needed
                            symbol: cashSettlement.symbol,
                            date: cashSettlement.date,
                            id: cashEntry._id  // Store the cash entry ID for logging
                        });
                    });
                } else {
                    // Log the cash entry details if there are no valid settlements
                    console.warn(`No valid settlements cash data for cash ID: ${cashEntry._id}`, cashEntry);
                }
            });

            return cashDataMap;
        };

        const mappedCashData = mapCashData(cashData);
        console.log('Mapped Cash Data:', Array.from(mappedCashData.entries())); // Log mapped cash data

        // Build settlements list
        const settlementsList = settlementsData.flatMap(settlement => {
            if (!Array.isArray(settlement.settlements)) {
                console.warn(`Invalid settlements data in settlement ID: ${settlement._id}`);
                return [];
            }

            return settlement.settlements.map(settlementObj => {
                console.log('Settlement Object:', settlementObj);

                const cashKey = `${settlementObj.symbol}-${settlementObj.date}`;
                console.log('Generated Cash Key:', cashKey); // Log the generated cash key

                const cash = mappedCashData.get(cashKey);
                console.log('Available Cash Keys in Map:', Array.from(mappedCashData.keys())); // Log all keys in mappedCashData

                return {
                    _id: settlementObj._id,
                    symbol: settlementObj.symbol,  // Symbol at root level
                    date: settlementObj.date,
                        "3m": {
                            bid: settlementObj.bid,
                            ask: settlementObj.ask,
                        },
                        cash: cash ? {
                            bid: cash.bid !== null ? cash.bid : 0,  // Default to 0 if null
                            ask: cash.ask !== null ? cash.ask : 0   // Default to 0 if null
                        } : { 
                            bid: 0, 
                            ask: 0 
                        }, // Default to 0 if cash not found
                    }
                
            });
        });

        console.log('Settlements List:', settlementsList); // Log the final settlements list

        res.status(200).json({
            message: 'Settlement data retrieved successfully',
            settlements: settlementsList,
        });
    } catch (error) {
        console.error('Error fetching settlement data:', error);
        res.status(500).json({ message: 'Error fetching settlement data.' });
    }
};





















