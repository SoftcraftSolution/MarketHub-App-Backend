const CircularNews = require('../model/circularnews.model');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const Admin = require('../model/admin.model'); 




exports.CircularNews = async (req, res) => {
    try {
        // Extract data from request body
        const { addTitle, addContent, addLink, adminPhoneNumber ,shareNews} = req.query;
      
          const shareNewsArray = JSON.parse(shareNews);
        
          console.log('Uploaded file:', req.file);
          console.log('Request body:', req.body);
        console.log(typeof(shareNewsArray),"shareNews")
        // Create a new CircularNews document
        const newAddCircular = new CircularNews({
            addTitle,
            addContent,
            addLink,
            adminPhoneNumber,
            shareNews:shareNewsArray,
            image: req.file ? req.file.path : null, // Store the image URL
          //  pdf: req.file ? req.file.path : null,
        });
       
        // Save the new document to the database
        await newAddCircular.save();

        // Send a success response
        res.status(201).json({
            message: 'News uploaded successfully',
            circularNews: {
                addTitle: newAddCircular.addTitle, // Include the addTitle from the saved document
                createdAt: newAddCircular.createdAt, // Optionally include other fields like createdAt
                addContent: newAddCircular.addContent, // Optionally include addContent
                addLink: newAddCircular.addLink, // Optionally include addLink
                adminPhoneNumber: newAddCircular.adminPhoneNumber,
                shareNews :newAddCircular.shareNews,// Optionally include adminPhoneNumber
                image: newAddCircular.image, // Include image URL
               // pdf: newAddCircular.pdf // Include PDF URL
            }
        });
    
    } catch (error) {
        console.error('Error while adding circular news:', error); // Log the error for debugging
        res.status(500).json({ message: 'An error occurred while uploading news.' });
    }
};