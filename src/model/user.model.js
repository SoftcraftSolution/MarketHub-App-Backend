const mongoose = require('mongoose');

// Define the registration schema with timestamps
const registrationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    pincode: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    visitingCard: {
        type: String, // URL or path to the uploaded file
    },
    otp: {
        type: String,
    },
    pin: {
        type: Number,
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    planName: {
        type: String,
        enum: ['freeTrial', 'standard', 'premium', 'basic'],
    },
    status: {
        type: String,
        enum: [
            'freeTrail',
            'extendedfreeTrial', 
            'rejected', 
            'expiredFreeTrial', 
            'basicPlan', 
            'expiredBasicPlan', 
            'standardPlan', 
            'expiredStandardPlan', 
            'premiumPlan', 
            'expiredPremiumPlan'
        ] // Corrected enum values as strings
    }
}, { timestamps: true });

// Create the model from the schema
const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
