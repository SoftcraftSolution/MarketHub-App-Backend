// controllers/currencyRatesController.js

const CurrencyRates = require('../model/refrencerate.model'); // Adjust the path as needed

// Fetch currency rates from MongoDB
exports.getCurrencyRates = async (req, res) => {
  try {
    const rates = await CurrencyRates.find();

    // Prepare the response format
    const formattedResponse = {
      "SBI TT": [],
      "RBI REFF RATE": []
    };

    rates.forEach(rate => {
      // Check and format "SBI TT"
      if (rate["SBI TT"] && Array.isArray(rate["SBI TT"])) {
        rate["SBI TT"].forEach(item => {
          if (item) {  // Check if item is not null
            formattedResponse["SBI TT"].push({
              "SBI TT": item["SBI TT"] || 'N/A',
              "BELOW 10 L": item["BELOW 10 L"] || 'N/A',
              "ABOVE 10 L": item["ABOVE 10 L"] || 'N/A'
            });
          }
        });
      }

      // Check and format "RBI REFF RATE"
      if (rate["RBI REFF RATE"] && Array.isArray(rate["RBI REFF RATE"])) {
        rate["RBI REFF RATE"].forEach(item => {
          if (item) {  // Check if item is not null
            formattedResponse["RBI REFF RATE"].push({
              "RBI FBILL": item["RBI FBILL"] || 'N/A', // Make sure to use the correct field name
              "Column2": item["Column2"] || 'N/A'      // Make sure to use the correct field name
            });
          }
        });
      }
    });

    // Send the formatted data as a JSON response
    res.json({
      success: true,
      data: formattedResponse
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currency rates'
    });
  }
};
exports.updateSBITT=async (req, res) => {
  try {
    const { data } = req.body;

    // Validate input
    if (!data || !data["SBI TT"] || !data["BELOW 10 L"] || !data["ABOVE 10 L"]) {
      return res.status(400).json({ error: "Invalid data format. Ensure all required fields are provided." });
    }

    // Update the document by pushing into "SBI TT"
    const updatedDoc = await CurrencyRates.updateOne(
      {}, // Find the first document (assuming there's only one)
      { $push: { "SBI TT": data } } // Push the new entry to the "SBI TT" array
    );

    if (updatedDoc.modifiedCount === 0) {
      return res.status(404).json({ error: "Document not found or no modifications made." });
    }

    res.json({ message: "Data added successfully to SBI TT", updatedDocument: updatedDoc });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}