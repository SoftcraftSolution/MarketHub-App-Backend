const Registration = require('../model/user.model');
const cloudinary = require('cloudinary').v2;
const fetch = require('node-fetch'); // Ensure you have node-fetch installed
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const response = require('../middleware/response')

// Generate a random OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000); // Generate a random number between 1000 and 9999
};

// Function to send OTP via SMS using FAST2SMS
// Function to send OTP via SMS using FAST2SMS
const sendOTP = async (phoneNumber, otp) => {
    try {
        const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&sender_id=FSTSMS&message=Your OTP is ${otp}&language=english&route=p&numbers=${phoneNumber}`, {
            method: 'GET', // Adjust if necessary
        });

        const data = await response.json();

        // Log the response from Fast2SMS
        console.log("Response from Fast2SMS:", data);

        if (data.return === true) {
            console.log(`OTP sent successfully to ${phoneNumber}`);
        } else {
            console.error(`Failed to send OTP to ${phoneNumber}: ${data.message}`);
        }

        return data;
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error('Failed to send OTP');
    }
};


// Create a new registration
exports.createRegistration = async (req, res) => {
    try {
        // Extract phoneNumber from request body
        const { phoneNumber } = req.body;

        // Generate OTP
        const otp = generateOTP();

        // Create a new registration document
        const newRegistration = new Registration({
            ...req.body,
            visitingCard: req.file ? req.file.path : null, // Handle visiting card upload
            otp: otp // Store the OTP
        });

        // Save the registration document
        await newRegistration.save();

        // Send OTP to the provided phone number
        await sendOTP(phoneNumber, otp); // Use phoneNumber from request body
        console.log(`Generated OTP for ${phoneNumber}: ${otp}`);

        // Respond with the new registration and a success message
        res.status(201).json({
            message: 'Registration successful. OTP sent.',
            registration: newRegistration,
            otp: otp // Optionally include the OTP in the response
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