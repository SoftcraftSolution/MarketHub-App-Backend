// controllers/CategoryController.js
const Category = require('../model/categories.model');
const Subcategory=require('../model/subcategories.model')
const Type=require('../model/type.model')

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Validate the input
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        // Create a new category
        const newCategory = new Category({
            name,
        });

        // Save the category to the database
        await newCategory.save();

        // Return the created category
        res.status(201).json(newCategory);
    } catch (error) {
        // Handle unique constraint violation
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category name must be unique' });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createSubcategory = async (req, res) => {
    try {
        const { name, category } = req.body;

        // Validate the input
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        if (!category) {
            return res.status(400).json({ message: 'Category ID is required' });
        }

        // Check if the category exists
        const existingCategory = await Category.findById(category);
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Create a new subcategory
        const newSubcategory = new Subcategory({
            name,
            category,
        });

        // Save the subcategory to the database
        await newSubcategory.save();

        // Return the created subcategory
        res.status(201).json(newSubcategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};