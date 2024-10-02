const Admin = require('../model/admin.model');
const User=require('../model/user.model')
const fetch = require('node-fetch'); // Ensure you have node-fetch installed
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const responseStructure = require('../middleware/response');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();
const ResetCode = require('../model/resetcode.models'); 

// Generate a random OTP (between 1000 and 9999)
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000); // Generate a random number between 1000 and 9999
};

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




// Default admin credentials
const defaultAdmin = {
  email: process.env.DEFAULT_ADMIN_EMAIL,
  password: process.env.DEFAULT_ADMIN_PASSWORD,
};

const ensureDefaultAdminExists = async () => {
  try {
    const admin = await Admin.findOne({ email: defaultAdmin.email });
    if (!admin) {
      await Admin.create(defaultAdmin);
      console.log('Default admin credentials saved.');
    }
  } catch (err) {
    console.error('Error ensuring default admin exists:', err.message);
  }
};

// Ensure default admin exists on server start
ensureDefaultAdminExists();

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email, password });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const resetCode = crypto.randomInt(1000, 9999).toString(); // 4-digit code

    await ResetCode.findOneAndUpdate(
      { userId: admin._id }, 
      { userId: admin._id, code: resetCode },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      to: admin.email,
      from: process.env.EMAIL_FROM,
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${resetCode}\n\nIf you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: `An email has been sent to ${admin.email} with the reset code.` });
  } catch (err) {
    console.error('Error sending password reset email:', err);
    res.status(500).json({ error: 'Error sending password reset email' });
  }
};

// Verify Code
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const resetCode = await ResetCode.findOne({ userId: admin._id, code });
    if (!resetCode) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    res.status(200).json({ message: 'Reset code verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error verifying reset code' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
  
    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      admin.password = newPassword;
      await admin.save();
  
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Error resetting password' });
    }
  };

exports.approveAdmin = async (req, res) => {
    const { id } = req.query; // Get the admin ID from the query
    const { isApproved } = req.body; // Get the approval status from the body

    try {
        // Log the admin ID
        console.log("Admin ID:", id);

        // Validate ObjectId
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid Admin ID' });
        }

        // Check if admin exists
        const userExists = await User.findById(id);
        console.log("User found:", userExists); // Log the found user

        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user document
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { isApproved }, // Update isApproved status
            { new: true, runValidators: true } // Return the updated document
        );

        // Log the updated user
        console.log("Updated User:", updatedUser);

        // Respond with success message and updated user
        res.status(200).json({
            message: 'User approval status updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(400).send({ message: error.message });
    }
};

exports.getUserList = async (req, res) => {
    try {
        // Retrieve all users from the database
        const users = await User.find();

        // Respond with the list of users
        res.status(200).json({
            message: 'User list retrieved successfully',
            users: users
        });
    } catch (error) {
        console.error("Error fetching user list:", error);
        res.status(500).json({ message: 'Error fetching user list' });
    }
};




