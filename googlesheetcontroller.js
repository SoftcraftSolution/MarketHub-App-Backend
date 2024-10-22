const { google } = require('googleapis');

require('dotenv').config();


// Google Sheet ID and range to fetch data
const SHEET_ID = '12hag257BMMd-W5fNlZE-ZDiBF6p6GRgrpsp3DK6VLIk';
const RANGE = 'DELHI';

exports.getGoogleSheetData = async (req, res) => {
  try {
    // Authentication using Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEET_CONFIG), // Load from environment variable
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (rows.length) {
      return res.status(200).json({
        message: 'Data fetched successfully',
        data: rows,
      });
    } else {
      return res.status(404).json({
        message: 'No data found',
      });
    }
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching data',
      error: error.message,
    });
  }
};
