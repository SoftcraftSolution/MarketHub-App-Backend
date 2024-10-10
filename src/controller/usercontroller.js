const Registration = require('../model/user.model');
const cloudinary = require('cloudinary').v2;
const fetch = require('node-fetch'); // Ensure you have node-fetch installed
const axios = require('axios');
const response = require('../middleware/response')
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();
const ResetCode = require('../model/resetcode.models');
const moment = require('moment-timezone');

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
            console.log('Country', postOffice.Country);

            return {
                city: postOffice.District,
                state: postOffice.State,
                country: postOffice.Country
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
        const { fullName, email, whatsappNumber, phoneNumber, pincode, pin, planName } = req.body;

        // Fetch city and state based on the pin code
        const { city, state, country } = await getCityAndStateByPinCode(pincode);

        // Calculate plan start and end dates
    // Plan ends 7 days after the start

        // Create a new registration document
        const newRegistration = new Registration({
            fullName: fullName,
            email: email,
            phoneNumber: phoneNumber,
            whatsappNumber: whatsappNumber,
            pincode: pincode,
            pin: pin,
            planName: planName,
            city: city, // Save city from pin code API
            state: state,
            country: country, // Save state from pin code API
            visitingCard: req.file ? req.file.path : null, // Handle visiting card upload if exists
           // Save the plan end date
        });

        // Save the registration document in the database
        await newRegistration.save();

        // Send a success response with the registration details
        res.status(201).json({
          
            newRegistration,
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(400).json({ message: error.message });
    }
};






exports.verifyEmail = async (req, res) => {
    try {
        const { email, verifyUser } = req.body; // Extracting verifyUser flag from the request body

        // If verifyUser is true, find the user by email
        let user;
        if (verifyUser) {
            user = await Registration.findOne({ email });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
        } else {
            // If not verifying, set a default user object (optional)
            user = { email }; // Create a temporary user object with the email
        }

        // Generate OTP and update the user in the database
        const otp = generateOTP();
        if (verifyUser) {
            user.otp = otp;
            await user.save(); // Save the OTP to the user's document only if verifying
        }

        console.log(`OTP generated for email: ${email} - OTP: ${otp}`);

        // Send the OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,  // Sender's email address
            to: email,  // Recipient's email address
            subject: 'Your OTP for verification',
            text: `Your OTP code is: ${otp}` // Message body
        };

        // Send email using nodemailer
        await transporter.sendMail(mailOptions);

        console.log(`OTP sent to email: ${email}`);

        // Respond with user details and OTP (optional for debugging)
        res.status(200).json({
            message: 'OTP sent successfully to email',
            user,
            otp // You may want to remove this in production for security reasons
        });

    } catch (error) {
        console.error("Error during OTP verification:", error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to send OTP' });
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
exports.updatePin = async (req, res) => {
    try {
        const { email, newPin } = req.body;

        // Validate the inputs
        if (!email || !newPin) {
            return res.status(400).json({ error: 'Email and new PIN are required' });
        }

        // Find the user by email
        const user = await Registration.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the user's PIN (without hashing)
        user.pin = newPin;

        // Save the updated user to the database
        await user.save();

        res.status(200).json({
            message: 'PIN updated successfully',
            user
        });

    } catch (error) {
        console.error('Error updating PIN:', error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to update PIN' });
    }
};
 // Assuming you have a User model defined

 exports.userList = async (req, res) => {
  try {
    // Destructure query parameters for searching and sorting
    const { fullName, phoneNumber, sortBy = 'createdAt', sortOrder = 'desc' } = req.query; // Default to 'desc' for recent first

    // Build the search query
    const searchQuery = { isApproved: true }; // Only show approved users
    if (fullName) {
      searchQuery.fullName = { $regex: fullName, $options: 'i' }; // Case-insensitive search
    }

    // Normalize phoneNumber for searching
    if (phoneNumber) {
      const normalizedPhoneNumber = phoneNumber.replace(/[^\d]/g, ''); // Remove non-digit characters
      searchQuery.phoneNumber = { $regex: normalizedPhoneNumber, $options: 'i' }; // Case-insensitive search
    }

    // Determine sort order
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1; // Ascending or descending

    // Fetch users based on the search query and sorting options
    const users = await Registration.find(searchQuery).sort(sortOptions);

    // Send the user list as a response
    res.status(200).json({
      success: true,
      message: 'User list fetched successfully',
      data: users,
    });
  } catch (error) {
    // Handle any errors that occur during fetching
    res.status(500).json({
      success: false,
      message: 'Error fetching user list',
      error: error.message,
    });
  }
};

  exports.freeTrialUsers = async (req, res) => {
    try {
      const {
        fullName,
        phoneNumber,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10
      } = req.query; // Default to 'desc' for recent first and page 1 with 10 items per page
  
      // Build the search query
      const searchQuery = { isInTrail: true }; // Only look for free trial users
      if (fullName) {
        searchQuery.fullName = { $regex: fullName, $options: 'i' }; // Case-insensitive search
      }
  
      // Normalize phoneNumber for searching
      if (phoneNumber) {
        const normalizedPhoneNumber = phoneNumber.replace(/[^\d]/g, ''); // Remove non-digit characters
        searchQuery.phoneNumber = { $regex: normalizedPhoneNumber, $options: 'i' }; // Case-insensitive search
      }
  
      // Determine sort order
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1; // Ascending or descending
  
      // Fetch users based on the search query and sorting options with pagination
      const skip = (page - 1) * limit; // Calculate how many documents to skip
      const freeTrialUsers = await Registration.find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)); // Limit to the specified number of users
  
      // Check if any free trial users were found
      if (!freeTrialUsers || freeTrialUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No free trial users found',
        });
      }
  
      // Get the total count of free trial users for pagination
      const totalCount = await Registration.countDocuments(searchQuery);
  
      // Respond with the list of free trial users and pagination info
      res.status(200).json({
        success: true,
        message: 'Free trial user list fetched successfully',
        data: freeTrialUsers,
        pagination: {
          total: totalCount,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      // Handle any errors during the query
      res.status(500).json({
        success: false,
        message: 'Error fetching free trial user list',
        error: error.message,
      });
    }
  };
  
  
  exports.expiredTrailUsers = async (req, res) => {
    try {
      // Get the current date
      const currentDate = new Date();
  
      // Destructure query parameters for searching and pagination
      const {
        fullName,
        phoneNumber,
        sortBy = 'planEndDate',
        sortOrder = 'desc',
        page = 1,
        limit = 10
      } = req.query; // Default to 'desc' for recent first and page 1 with 10 items per page
  
      // Build the search query
      const searchQuery = {
        planEndDate: { $lt: currentDate } // Only look for expired users
      };
  
      if (fullName) {
        searchQuery.fullName = { $regex: fullName, $options: 'i' }; // Case-insensitive search
      }
  
      // Normalize phoneNumber for searching
      if (phoneNumber) {
        const normalizedPhoneNumber = phoneNumber.replace(/[^\d]/g, ''); // Remove non-digit characters
        searchQuery.phoneNumber = { $regex: normalizedPhoneNumber, $options: 'i' }; // Case-insensitive search
      }
  
      // Determine sort order
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1; // Ascending or descending
  
      // Calculate how many documents to skip for pagination
      const skip = (page - 1) * limit;
  
      // Fetch expired users based on the search query and sorting options with pagination
      const expiredUsers = await Registration.find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)); // Limit to the specified number of users
  
      // Check if any expired users were found
      if (!expiredUsers || expiredUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No expired users found',
        });
      }
  
      // Get the total count of expired users for pagination
      const totalCount = await Registration.countDocuments(searchQuery);
  
      // Respond with the list of expired users and pagination info
      res.status(200).json({
        success: true,
        message: 'Expired user list fetched successfully',
        data: expiredUsers,
        pagination: {
          total: totalCount,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      // Handle any errors during the query
      res.status(500).json({
        success: false,
        message: 'Error fetching expired user list',
        error: error.message,
      });
    }
  };
  
  exports.freeUsers = async (req, res) => {
    try {
      // Destructure query parameters for searching and pagination
      const {
        fullName,
        phoneNumber,
        sortBy = 'createdAt', // Default sort field
        sortOrder = 'desc', // Default sort order
        page = 1, // Default to page 1
        limit = 10 // Default to 10 users per page
      } = req.query;
  
      // Build the search query
      const searchQuery = {
        isFreeUser: true // Only look for free users
      };
  
      // Case-insensitive search for fullName
      if (fullName) {
        searchQuery.fullName = { $regex: fullName, $options: 'i' }; // Case-insensitive search
      }
  
      // Normalize phoneNumber for searching
      if (phoneNumber) {
        const normalizedPhoneNumber = phoneNumber.replace(/[^\d]/g, ''); // Remove non-digit characters
        searchQuery.phoneNumber = { $regex: normalizedPhoneNumber, $options: 'i' }; // Case-insensitive search
      }
  
      // Determine sort order
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1; // Ascending or descending
  
      // Calculate how many documents to skip for pagination
      const skip = (page - 1) * limit;
  
      // Fetch free users based on the search query and sorting options with pagination
      const freeUsers = await Registration.find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)); // Limit to the specified number of users
  
      // Check if any free users were found
      if (!freeUsers || freeUsers.length === 0) {
        return res.status(200).json({
          success: false,
          message: 'No free users found',
        });
      }
  
      // Get the total count of free users for pagination
      const totalCount = await Registration.countDocuments(searchQuery);
  
      // Respond with the list of free users and pagination info
      res.status(200).json({
        success: true,
        message: 'Free user list fetched successfully',
        data: freeUsers,
        pagination: {
          total: totalCount,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      // Handle any errors during the query
      res.status(500).json({
        success: false,
        message: 'Error fetching free user list',
        error: error.message,
      });
    }
  };
  exports.rejectUser = async (req, res) => {
    try {
      const { userId, isRejected } = req.body; // Assuming user ID and isRejected status are sent in the request body
  
      // Validate the user ID
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required.',
        });
      }
  
    
      const updatedUser = await Registration.findByIdAndUpdate(
        userId,
        {
          isRejected: isRejected, // Set the isRejected status based on request
          rejectionDate: isRejected ? new Date() : null, // Set current date if rejected
        },
        { new: true } // Return the updated document
      );
  
      // Check if the user was found and updated
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }
  
      // Respond with the updated user information
      res.status(200).json({
        success: true,
        message: isRejected ? 'User rejected successfully.' : 'User status updated successfully.',
        data: updatedUser,
      });
    } catch (error) {
      // Handle any errors during the update
      res.status(500).json({
        success: false,
        message: 'Error rejecting user.',
        error: error.message,
      });
    }
  };
  
  
  exports.rejectedUsers = async (req, res) => {
    try {
      // Destructure query parameters for searching and pagination
      const {
        fullName,
        phoneNumber,
        sortBy = 'createdAt', // Default sort field
        sortOrder = 'desc', // Default sort order
        page = 1, // Default to page 1
        limit = 10 // Default to 10 users per page
      } = req.query;
  
      // Build the search query
      const searchQuery = {
        isRejected: true // Only look for rejected users
      };
  
      // Case-insensitive search for fullName
      if (fullName) {
        searchQuery.fullName = { $regex: fullName, $options: 'i' }; // Case-insensitive search
      }
  
      // Normalize phoneNumber for searching
      if (phoneNumber) {
        const normalizedPhoneNumber = phoneNumber.replace(/[^\d]/g, ''); // Remove non-digit characters
        searchQuery.phoneNumber = { $regex: normalizedPhoneNumber, $options: 'i' }; // Case-insensitive search
      }
  
      // Determine sort order
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1; // Ascending or descending
  
      // Calculate how many documents to skip for pagination
      const skip = (page - 1) * limit;
  
      // Fetch rejected users based on the search query and sorting options with pagination
      const rejectedUsers = await Registration.find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)); // Limit to the specified number of users
  
      // Check if any rejected users were found
      if (!rejectedUsers || rejectedUsers.length === 0) {
        return res.status(200).json({
          success: false,
          message: 'No rejected users found',
        });
      }
  
      // Get the total count of rejected users for pagination
      const totalCount = await Registration.countDocuments(searchQuery);
  
      // Respond with the list of rejected users and pagination info
      res.status(200).json({
        success: true,
        message: 'Rejected user list fetched successfully',
        data: rejectedUsers,
        pagination: {
          total: totalCount,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      // Handle any errors during the query
      res.status(500).json({
        success: false,
        message: 'Error fetching rejected user list',
        error: error.message,
      });
    }
  };
  exports.userApproved = async (req, res) => {
    try {
      const { email, isApproved } = req.body;
  
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required.',
        });
      }
  
   
      let updateFields = {
        isApproved: isApproved,
      };
  
      if (isApproved) {
        // Get the current date and time in IST
        const planStartDate = moment.tz("Asia/Kolkata"); // Current time in IST
        const planEndDate = moment(planStartDate).add(7, 'days'); // Add 7 days
  
        updateFields.planStartDate = planStartDate.toDate(); // Convert to JavaScript Date object
        updateFields.planEndDate = planEndDate.toDate(); // Convert to JavaScript Date object
        updateFields.approvedAt = planStartDate.toDate(); // Set approvedAt to the same timestamp
      }
  
      const updatedUser = await Registration.findOneAndUpdate(
        { email: email },
        updateFields,
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }
  
      // Format dates to IST for the response
      const formattedPlanStartDate = moment.tz(updatedUser.planStartDate, "Asia/Kolkata").format();
      const formattedPlanEndDate = moment.tz(updatedUser.planEndDate, "Asia/Kolkata").format();
      
      // Log for debugging
      console.log('Plan Start Date:', formattedPlanStartDate);
  
      res.status(200).json({
        success: true,
        message: isApproved ? 'User approved successfully.' : 'User status updated successfully.',
        data: {
          ...updatedUser.toObject(),
          planStartDate: formattedPlanStartDate, // Send formatted date
          planEndDate: formattedPlanEndDate, // Send formatted date
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error approving user.',
        error: error.message,
      });
    }
  };
  exports.checkUserApproved = async (req, res) => {
    try {
      const email = req.body.email;  // Get email from request body
      const user = await Registration.findOne({ email });  // Query user by email
    
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.isApproved) {
     
        return res.status(200).json({
          isApproved: true,
         
        });
      } else {
        // If not approved, send false
        return res.status(200).json({
          isApproved: false,
        });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  
  
  
  
  
  
