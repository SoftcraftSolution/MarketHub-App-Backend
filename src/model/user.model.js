const mongoose = require('mongoose');

// Define the registration schema with timestamps
const registrationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,

    },
    whatsappNumber: {
        type: String,
        required:true
    },
    phoneNumber: {
        type: String,
        required: true

    },
    pincode: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,

    },
    state: {
        type: String,

    },
    country:{
        type:String
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
