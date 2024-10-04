const Registration = require('../model/user.model');
const cloudinary = require('cloudinary').v2;
const fetch = require('node-fetch'); // Ensure you have node-fetch installed
const axios = require('axios');
const response = require('../middleware/response')
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();
const ResetCode = require('../model/resetcode.models'); 

// Generate a random OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit OTP
};

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: {
        user: process.env.EMAIL_USERNAME, // Your email account
        pass: process.env.EMAIL_PASSWORD, // Your email account's password
    },
});

// Function to get city and state by pin code
const getCityAndStateByPinCode = async (pincode) => {
    try {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
        console.log('API Response:', response.data); // Log the entire API response

        const data = response.data[0];

        if (data.Status === "Success") {
            const postOffice = data.PostOffice[0];
            console.log('City:', postOffice.District);
            console.log('State:', postOffice.State);
            console.log('Country',postOffice.Country);

            return {
                city: postOffice.District,
                state: postOffice.State,
                country:postOffice.Country
            };
        } else {
            console.log('API Status:', data.Status); // Log the API status if it's not "Success"
            throw new Error('Invalid Pincode');
        }
    } catch (error) {
        console.error('Error occurred while fetching city and state:', error.message);
        throw new Error('Error fetching city and state information');
    }
};


// Create a new registration
exports.createRegistration = async (req, res) => {
    try {
        // Extract necessary fields from request body
        const { fullName, email, whatsappNumber, phoneNumber, pincode } = req.body;

        // Fetch city and state based on the pin code
        const { city, state ,country} = await getCityAndStateByPinCode(pincode);

        // Generate the 4-digit OTP (registration code)
        const otp = generateOTP();

        // Create a new registration document
        const newRegistration = new Registration({
            fullName: fullName,
            email: email,
            phoneNumber: phoneNumber,
            whatsappNumber: whatsappNumber,
            pincode: pincode,
            city: city, // Save city from pin code API
            state: state,
            country:country, // Save state from pin code API
            visitingCard: req.file ? req.file.path : null, // Handle visiting card upload if exists
            otp: otp, // Save generated 4-digit OTP as registration code
        });

        // Save the registration document in the database
        await newRegistration.save();

        // Send the 4-digit registration code to the user's email
        const mailOptions = {
            from: process.env.EMAIL_USERNAME, // Sender address
            to: email, // Recipient's email
            subject: 'Your Registration Code',
            text: `Hello ${fullName},\n\nYour registration code is: ${otp}\n\nPlease verify using this code.`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Registration code sent to ${email}: ${otp}`);

        // Respond with the new registration and success message
        res.status(201).json({
            message: 'Registration successful. Code sent to email. Please verify.',
            registration: newRegistration,
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(400).json({ message: error.message });
    }
};





exports.verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        console.log(`Received OTP verification request for phoneNumber: ${phoneNumber} with OTP: ${otp}`);

        // Find the registration by phone number
        const registration = await Registration.findOne({ phoneNumber });

        if (!registration) {
            console.error(`Registration not found for phoneNumber: ${phoneNumber}`);
            return response.error(res, 'Registration not found', 404);
        }

        // Log the stored OTP for comparison (be cautious with logging sensitive data)
        console.log(`Stored OTP for phoneNumber ${phoneNumber}: ${registration.otp}`);

        // Check if the OTP matches
        if (registration.otp !== otp) {
            console.warn(`Invalid OTP provided for phoneNumber: ${phoneNumber}`);
            return response.error(res, 'Invalid OTP', 400);
        }

        // If OTP is correct, clear the OTP and save the registration


        console.log(`OTP verified successfully for phoneNumber: ${phoneNumber}`);

        res.status(200).json({
            message: 'otp verifed sucessfully',

            // Optionally include the OTP in the response
        });
    } catch (error) {
        console.error("Error during OTP verification:", error); // Log the error for debugging
        return response.error(res, error.message);
    }
};
exports.createPin = async (req, res) => {
    try {
        const { phoneNumber, pin } = req.body;


        // Find the registration by phone number
        const registration = await Registration.findOne({ phoneNumber });

        if (!registration) {
            return response.error(res, 'Registration not found', 404);
        }

        // Store the PIN associated with the registration
        registration.pin = pin; // Add this field to your model as necessary
        await registration.save();

        res.status(201).json({
            message: 'PIN created successfully',
            phoneNumber,
            pin // Optionally include the PIN in the response
        });
    } catch (error) {
        console.error("Error creating PIN:", error);
        return response.error(res, error.message);
    }
};
exports.forgotPinRequest = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        // Check if the phone number is registered
        const registration = await Registration.findOne({ phoneNumber });
        if (!registration) {
            return response.error(res, 'Phone number not registered', 404);
        }

        // Generate OTP and store it in the user's record
        const otp = generateOTP();
        registration.otp = otp; // Store OTP temporarily
        await registration.save();

        // Send OTP to user's phone number
        await sendOTP(phoneNumber, otp);
        console.log(`OTP sent to ${phoneNumber, otp} for PIN reset`);

        res.status(200).json({
            message: 'OTP sent for PIN reset',
            otp: otp
        });
    } catch (error) {
        console.error("Error in forgot PIN request:", error);
        return response.error(res, error.message);
    }
};

// Forgot PIN - Step 2: Verify OTP and reset PIN
exports.resetPin = async (req, res) => {
    try {
        const { phoneNumber, otp, newPin } = req.body;

        // Find the user by phone number
        const registration = await Registration.findOne({ phoneNumber });

        if (!registration) {
            return response.error(res, 'Phone number not registered', 404);
        }

        // Check if OTP matches
        if (registration.otp !== otp) {
            return response.error(res, 'Invalid OTP', 400);
        }

        // OTP verified, reset the PIN
        registration.pin = newPin; // Update the PIN with the new one
        registration.otp = null; // Clear the OTP after successful reset
        await registration.save();

        res.status(200).json({
            message: 'PIN reset successfully',
        });
    } catch (error) {
        console.error("Error resetting PIN:", error);
        return response.error(res, error.message);
    }
};
exports.changePin = async (req, res) => {
    try {
        const { phoneNumber, oldPin, newPin } = req.body;

        // Find the user by phone number
        const registration = await Registration.findOne({ phoneNumber });

        if (!registration) {
            return response.error(res, 'Phone number not registered', 404);
        }

        registration.pin = newPin;
        res.status(200).json({
            message: 'Change Pin successfully',
        });
    } catch (error) {
        console.error("Error resetting PIN:", error);
        return response.error(res, error.message);
    }
};