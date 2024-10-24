// controllers/itemController.js

const Item = require('../model/basemetal.model'); // Adjust the path as necessary

// Create a new item
exports.createItem = async (req, res) => {
    try {
        const { city, category, type, subcategory, price } = req.body;

        const newItem = new Item({
            city,
            category,
            type,
            subcategory,
            price
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating item' });
    }
};

// Retrieve all items
exports.getAllItems = async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching items' });
    }
};
exports.getSpotList = async (req, res) => {
    try {
        // Extract query parameters from request
        const { category, type, subcategory } = req.query;

        // Build query object based on available query parameters
        let query = {};

        if (category) {
            query.category = category;
        }

        if (type) {
            query.type = type;
        }

        if (subcategory) {
            query.subcategory = subcategory;
        }

        // Fetch items from database based on query
        const items = await Item.find(query);

        // Send response
        res.status(200).json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching items' });
    }
};
exports.spotlist = async (req, res) => {
    try {
        // Extract category from query parameters
        const { category } = req.query;

        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }

        // Query the database to find all items with the specified category
        const items = await Item.find({ category });

        if (!items || items.length === 0) {
            return res.status(404).json({ message: 'No items found for this category' });
        }

        // Extract unique types and their corresponding subcategories
        const typeSubcategoryMap = {};

        items.forEach(item => {
            const { type, subcategory } = item;

            // Initialize the type array if it doesn't exist
            if (!typeSubcategoryMap[type]) {
                typeSubcategoryMap[type] = [];
            }

            // Add the subcategory if it's not already present
            if (!typeSubcategoryMap[type].includes(subcategory)) {
                typeSubcategoryMap[type].push(subcategory);
            }
        });

        // Convert the object to an array of type-subcategory pairs
        const typeSubcategoryList = Object.entries(typeSubcategoryMap).map(([type, subcategories]) => ({
            type,
            subcategories
        }));

        // Extract unique types from the keys of the typeSubcategoryMap
        const Types = Object.keys(typeSubcategoryMap);

        // Return all matching items along with unique types and their subcategories
        res.status(200).json({
            category,
            items,
            Types, // List of unique types
            typeSubcategoryList
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Error fetching items' });
    }
};



