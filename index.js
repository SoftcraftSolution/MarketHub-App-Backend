require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes=require('./src/route/app.routes')

const cors = require('cors');
const path = require('path');
const http = require('http');
const cron = require('node-cron');
//const BaseMetal = require('./src/model/basemetal');


const app = express();
const port = process.env.PORT || 3000; // Use port from environment variable or default to 3000

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '100mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect("mongodb+srv://Rahul:myuser@rahul.fack9.mongodb.net/MarketHubApp?authSource=admin&replicaSet=atlas-117kuv-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Serve Uploaded Images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const server = http.createServer(app);


// User Routes
app.use('/user', userRoutes);


// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Add the trackDriver route


// Start the HTTP server
server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});

// Create a WebSocket server

cron.schedule('0 0 * * *', async () => { 
  try {
    const items = await BaseMetal.find();

    for (let item of items) {
      const currentPrice = parseFloat(item.price) || 0;
      const lastPrice = parseFloat(item.lastPrice) || 0;

      if (currentPrice !== lastPrice) {
        item.lastPrice = item.price;

        const percentageChange = ((currentPrice - lastPrice) / (lastPrice || 1)) * 100;
        item.percentageChange = percentageChange.toFixed(2);

        const incrementPrice = currentPrice - lastPrice;
        item.incrementPrice = incrementPrice.toFixed(2);

        await item.save();
      }
    }

    console.log('Cron job executed. Updated prices and percentage changes.');
  } catch (error) {
    console.error('Error running cron job:', error);
  }
});
  


