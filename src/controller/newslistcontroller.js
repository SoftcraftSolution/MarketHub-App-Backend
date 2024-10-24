const express = require('express');
const SelfNews = require('../model/selfnews.model'); 



// Route to fetch the news list from MongoDB
exports.selfnewsList = async (req, res) => {
    try {
        // Assuming SelfNews is your Mongoose model
        const newsArticles = await SelfNews.find() // Sort by latest published news

        // Return the list of news articles
        res.status(200).json({
            status: 'success',
            data: newsArticles, // Return the fetched news data
        });

    } catch (error) {
        console.error('Error fetching news from database:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching news.',
        });
    }
};

