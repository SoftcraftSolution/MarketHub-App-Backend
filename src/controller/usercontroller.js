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
const sharp = require('sharp'); 


// Generate a random OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit OTP
};

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: {
        user: 'mhmarkethub@gmail.com' ,// Your email account
        pass:'dfvm ymkh ajse hmgb' // Your email account's password
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

const  resizeImageBuffer = async (buffer) => {
  return await sharp(buffer).resize(1024).toBuffer(); // Resize to 1024px width while maintaining aspect ratio
};
// Create a new registration
exports.createRegistration = async (req, res) => {
  try {
      let imageUrl = null;

      // If a visiting card file is provided, upload it to Cloudinary
      if (req.files && req.files.visitingCard && req.files.visitingCard[0]) {
          console.log("Resizing and uploading visiting card to Cloudinary...");

          try {
              const fileBuffer = req.files.visitingCard[0].buffer;

              if (!fileBuffer || fileBuffer.length === 0) {
                  throw new Error("Invalid visiting card file uploaded.");
              }

              const resizedBuffer = await resizeImageBuffer(fileBuffer);
              
              imageUrl = await new Promise((resolve, reject) => {
                  const uploadStream = cloudinary.uploader.upload_stream(
                      { folder: "visitingCards" },
                      (error, result) => {
                          if (error) return reject(error);
                          resolve(result.secure_url);
                      }
                  );
                  uploadStream.end(resizedBuffer);
              });

              console.log("Cloudinary upload successful:", imageUrl);
          } catch (error) {
              console.error("Error uploading resized visiting card to Cloudinary:", error);
              return res.status(500).json({ message: "Failed to upload visiting card to Cloudinary." });
          }
      }

      // Extract necessary fields from request body
      const { fullName, email, whatsappNumber, phoneNumber, pincode, pin, planName } = req.body;

      // Fetch city, state, and country based on the pin code
      const { city, state, country } = await getCityAndStateByPinCode(pincode);

      // Calculate plan start and end dates
      const planStartDate = new Date();
      const planEndDate = new Date();
      planEndDate.setDate(planStartDate.getDate() + 7);

      // Create a new registration document
      const newRegistration = new Registration({
          fullName,
          email,
          phoneNumber,
          whatsappNumber,
          pincode,
          pin,
          planName,
          city,
          state,
          country,
          visitingCard: imageUrl, // Save uploaded visiting card URL
          planStartDate,
          planEndDate,
      });

      // Save the registration document in the database
      await newRegistration.save();

      res.status(201).json({
          message: "Registration successful",
          registration: newRegistration,
      });
  } catch (error) {
      console.error("Error in registration:", error);
      res.status(400).json({ message: error.message });
  }
};








// exports.verifyEmail = async (req, res) => {
//   try {
//       const { email, verifyUser } = req.body; // Extracting verifyUser flag from the request body

//       // Find the user by email
//       const user = await Registration.findOne({ email });
//       let tempUser;
//       let isAlreadyRegistered = false;

//       if (user) {
//           isAlreadyRegistered = true; // User exists, set the flag to true
//       }

//       if (verifyUser) {
//           if (!isAlreadyRegistered) {
//               return res.status(200).json({ message: 'User not registered' });
//           }
//       } else {
//           // If verifyUser is false and user is not registered, send an OTP
//           if (!isAlreadyRegistered) {
//               // Create a temporary user object with the email
//               tempUser = { email }; 
              
//               // Generate OTP
               
//               tempUser.otp  = generateOTP(); // Assign OTP to the temporary user
              
//               // Prepare mail options to send OTP
//               const mailOptions = {
//                   from: process.env.EMAIL_USERNAME,  // Sender's email address
//                   to: email,  // Recipient's email address
//                   subject: 'Your OTP for verification',
//                   text: `Your OTP code is: ${tempUser.otp}` // Message body
//               };

//               // Send email using nodemailer
//               await transporter.sendMail(mailOptions);
//               console.log(`OTP sent to email: ${email}`);

//               // Respond with user details and OTP
//               return res.status(200).json({
//                   message: 'OTP sent successfully to email',
//                   user: tempUser,
//                   isAlreadyRegistered, // Add registration status to the response
//                    // Include OTP in the response
//               });
//           }else{
//             tempUser = { email }; 
              
//             // Generate OTP
             
//             tempUser.otp  = generateOTP();
//             return res.status(200).json({
//               // message: 'OTP sent successfully to email',
//               user: tempUser,
//               isAlreadyRegistered, // Add registration status to the response
//                // Include OTP in the response
//           });
//           }
//       }

//       // Generate OTP and update the user in the database if the user is already registered
//       const otp = generateOTP();
//       if (isAlreadyRegistered) {
//           user.otp = otp; // Set OTP only if the user is registered
//           await user.save(); // Save the OTP to the user's document
//       }

//       console.log(`OTP generated for email: ${email} - OTP: ${otp}`);

//       // Send the OTP via email only if verifyUser is true
//       if (verifyUser) {
//           const mailOptions = {
//               from: process.env.EMAIL_USERNAME,  // Sender's email address
//               to: email,  // Recipient's email address
//               subject: 'Your OTP for verification',
//               text: `Your OTP code is: ${otp}` // Message body
//           };

//           // Send email using nodemailer
//           await transporter.sendMail(mailOptions);
//           console.log(`OTP sent to email: ${email}`);
//       }

//       // Respond with user details, OTP, and registration status
//       res.status(200).json({
//           message: verifyUser ? 'OTP sent successfully to email' : 'User found',
//           user,
//           isAlreadyRegistered, // Add registration status to the response
//          // Include OTP only if verifyUser is true
//       });

//   } catch (error) {
//       console.error("Error during OTP verification:", error); // Log the error for debugging
//       return res.status(500).json({ error: 'Failed to send OTP' });
//   }
// };

// exports.verifyEmail = async (req, res) => {
//   try {
//       const { email, verifyUser } = req.body;
//       const specificEmail = "lokeshbisht01@gmail.com"; // Email for which we do not generate OTP
//       const user = await Registration.findOne({ email });
//       let tempUser;
//       let isAlreadyRegistered = false;

//       if (user) {
//           isAlreadyRegistered = true; // User exists, set the flag to true
//       }

//       // If the email matches the specific email, do not generate OTP
//       if (email === specificEmail) {
//           if (verifyUser) {
//               // For verification requests
//               if (isAlreadyRegistered) {
//                   console.log(`Sending existing OTP for email: ${email} - OTP: ${user.otp}`);
//                   const mailOptions = {
//                       from: process.env.EMAIL_USERNAME,
//                       to: email,
//                       subject: 'Your OTP for verification',
//                       text: `Your OTP code is: ${user.otp}` // Send existing OTP
//                   };
//                   await transporter.sendMail(mailOptions);
//                   return res.status(200).json({
//                       message: 'OTP sent successfully to email',
//                       user,
//                       isAlreadyRegistered
//                   });
//               } else {
//                   return res.status(200).json({ message: 'User not registered' });
//               }
//           } else {
//               // If not verifying and the user is not registered
//               return res.status(200).json({ message: 'User not registered' });
//           }
//       } else {
//           // For all other emails
//           if (verifyUser) {
//               if (isAlreadyRegistered) {
//                   // Send existing OTP for registered user
//                   console.log(`Sending existing OTP for email: ${email} - OTP: ${user.otp}`);
//                   const mailOptions = {
//                       from: process.env.EMAIL_USERNAME,
//                       to: email,
//                       subject: 'Your OTP for verification',
//                       text: `Your OTP code is: ${user.otp}` // Send existing OTP
//                   };
//                   await transporter.sendMail(mailOptions);
//                   return res.status(200).json({
//                       message: 'OTP sent successfully to email',
//                       user,
//                       isAlreadyRegistered
//                   });
//               } else {
//                   // User is not registered
//                   return res.status(200).json({ message: 'User not registered' });
//               }
//           } else {
//               // If verifyUser is false and user is not registered, create a temporary user object
//               if (!isAlreadyRegistered) {
//                   tempUser = { email }; // Create a temporary user object with the email
//                   // Here you can add logic to handle the temporary user if necessary
//               }

//               // Generate a new OTP for all other users
//               const newOtp = generateOTP(); // Generate a new OTP

//               if (isAlreadyRegistered) {
//                   // For registered users, update and send OTP
//                   user.otp = newOtp; // Update user's OTP
//                   await user.save(); // Save the new OTP
//                   const mailOptions = {
//                       from: process.env.EMAIL_USERNAME,
//                       to: email,
//                       subject: 'Your OTP for verification',
//                       text: `Your new OTP code is: ${newOtp}`
//                   };
//                   await transporter.sendMail(mailOptions);
//                   console.log(`Generated new OTP for registered email: ${email} - OTP: ${newOtp}`);
//                   return res.status(200).json({
//                       message: 'New OTP generated and sent',
//                       user,
//                       isAlreadyRegistered
//                   });
//               } else {
//                   // Register new user with a new OTP
//                   const newUser = new Registration({ email, otp: newOtp });
//                   await newUser.save(); // Save new user to database
//                   const mailOptions = {
//                       from: process.env.EMAIL_USERNAME,
//                       to: email,
//                       subject: 'Your OTP for verification',
//                       text: `Your OTP code is: ${newOtp}`
//                   };
//                   await transporter.sendMail(mailOptions);
//                   console.log(`New user registered and OTP sent to email: ${email} - OTP: ${newOtp}`);
//                   return res.status(200).json({
//                       message: 'OTP sent successfully to email',
//                       user: newUser,
//                       isAlreadyRegistered: false
//                   });
//               }
//           }
//       }
//   } catch (error) {
//       console.error("Error during OTP verification:", error);
//       return res.status(500).json({ error: 'Failed to send OTP' });
//   }
// };


exports.verifyEmail = async (req, res) => {
  try {
      const { email, verifyUser } = req.body; // Extracting verifyUser flag from the request body
      // Find the user by email
      const user = await Registration.findOne({ email });
      let tempUser;
      let isAlreadyRegistered = false;
      if (user) {
          isAlreadyRegistered = true; // User exists, set the flag to true
      }
      if (verifyUser) {
          if (!isAlreadyRegistered) {
              return res.status(200).json({ message: 'User not registered' });
          }
      } else {
          // If verifyUser is false and user is not registered, send an OTP
          if (!isAlreadyRegistered) {
              // Create a temporary user object with the email
              tempUser = { email }; 
              
              // Generate OTP
               
              tempUser.otp  = generateOTP(); // Assign OTP to the temporary user
              
              // Prepare mail options to send OTP
              const mailOptions = {
                  from: process.env.EMAIL_USERNAME,  // Sender's email address
                  to: email,  // Recipient's email address
                  subject: 'Your OTP for verification',
                  text: `Your OTP code is: ${tempUser.otp}` // Message body
              };
              // Send email using nodemailer
              await transporter.sendMail(mailOptions);
              console.log(`OTP sent to email: ${email}`);
              // Respond with user details and OTP
              return res.status(200).json({
                  message: 'OTP sent successfully to email',
                  user: tempUser,
                  isAlreadyRegistered, // Add registration status to the response
                   // Include OTP in the response
              });
          }
          else{
            tempUser = { email }; 
              
            // Generate OTP
             
            tempUser.otp  = generateOTP();
            return res.status(200).json({
              // message: 'OTP sent successfully to email',
              user: tempUser,
              isAlreadyRegistered, // Add registration status to the response
               // Include OTP in the response
          });
          }
      }
      // Generate OTP and update the user in the database if the user is already registered
      const otp = generateOTP();
      if (isAlreadyRegistered) {
          user.otp = otp; // Set OTP only if the user is registered
          await user.save(); // Save the OTP to the user's document
      }
      console.log(`OTP generated for email: ${email} - OTP: ${otp}`);
      // Send the OTP via email only if verifyUser is true
      if (verifyUser) {
          const mailOptions = {
              from: process.env.EMAIL_USERNAME,  // Sender's email address
              to: email,  // Recipient's email address
              subject: 'Your OTP for verification',
              text: `Your OTP code is: ${otp}` // Message body
          };
          // Send email using nodemailer
          await transporter.sendMail(mailOptions);
          console.log(`OTP sent to email: ${email}`);
      }
      // Respond with user details, OTP, and registration status
      res.status(200).json({
          message: verifyUser ? 'OTP sent successfully to email' : 'User found',
          user,
          isAlreadyRegistered, // Add registration status to the response
         // Include OTP only if verifyUser is true
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

        // Calculate the date 7 days from now
        const expirationDate = new Date();
        expirationDate.setDate(currentDate.getDate() + 7); // Set to 7 days from now

        // Destructure query parameters for pagination
        const {
            sortBy = 'planEndDate',
            sortOrder = 'desc',
            page = 1,
            limit = 10
        } = req.query; // Default to 'desc' for recent first and page 1 with 10 items per page

        // Build the search query to find users whose plans will expire in the next 7 days
        const searchQuery = {
            planEndDate: { $lt: expirationDate } // Only look for users whose plans expire in the next 7 days
        };

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
                message: 'No users found whose plans will expire in the next 7 days',
            });
        }

        // Get the total count of expired users for pagination
        const totalCount = await Registration.countDocuments(searchQuery);

        // Respond with the list of expired users and pagination info
        res.status(200).json({
            success: true,
            message: 'Users with plans expiring in the next 7 days fetched successfully',
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
      const { email } = req.query; // Extract email from the request query
  
      // Validate the email
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email ID is required.',
        });
      }
  
      // Update the user based on the email field, always setting isRejected to true
      const updatedUser = await Registration.findOneAndUpdate(
        { email: email }, // Find user by email
        {
          isRejected: true, // Set isRejected status to true
          rejectionDate: new Date() // Set current date as rejection date
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
        message: 'User rejected successfully.',
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
  
  
  
  
  exports.rejectedUserList = async (req, res) => {
    try {
      // Fetch all approved users
      const approvedUsers = await Registration.find({ isRejected: true }) // Only approved users
  
      // Check if any approved users were found
      if (!approvedUsers || approvedUsers.length === 0) {
        return res.status(200).json({
          success: false,
          message: 'No approved users found',
        });
      }
  
      // Respond with the list of approved users
      res.status(200).json({
        success: true,
        message: 'Approved user list fetched successfully',
        data: approvedUsers
      });
    } catch (error) {
      // Handle any errors during the query
      res.status(500).json({
        success: false,
        message: 'Error fetching approved user list',
        error: error.message,
      });
    }
  };
  
  exports.userApproved = async (req, res) => {
    try {
      const { email, isApproved } = req.query;
  
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
  exports.pendingUserList = async (req, res) => {
    try {
      // Assuming you have a User model
      const pendingUsers = await Registration.find({ isApproved: false });
      
      // Send the list of pending users as a response
      res.status(200).json({
        success: true,
        data: pendingUsers,
      });
    } catch (error) {
      // Handle any errors
      res.status(500).json({
        success: false,
        message: 'Error fetching pending users',
        error: error.message,
      });
    }
  };
  exports.deleteUserByEmail = async (req, res) => {
    try {
      const { email } = req.query; // Get the email from query parameters
  
      // Validate the email
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email ID is required.',
        });
      }
  
      // Delete the user based on the email field
      const deletedUser = await Registration.findOneAndDelete({ email: email });
  
      // Check if the user was found and deleted
      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }
  
      // Respond with success message
      res.status(200).json({
        success: true,
        message: 'User deleted successfully.',
        data: deletedUser,
      });
    } catch (error) {
      // Handle any errors during deletion
      res.status(500).json({
        success: false,
        message: 'Error deleting user.',
        error: error.message,
      });
    }
  };
  
  // controllers/userController.js

exports.deleteUserById = async (req, res) => {
  try {
    const { id } = req.query; // Get the user ID from query parameters

    // Validate the ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
    }

    // Find and delete the user by ID
    const deletedUser = await Registration.findByIdAndDelete(id);

    // Check if the user exists
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Successful response
    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
      data: deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user.',
      error: error.message,
    });
  }
};

  
  
  
  
  
  
