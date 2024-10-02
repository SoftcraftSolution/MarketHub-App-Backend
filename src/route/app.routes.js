const express = require('express');
const router = express.Router();
const userController=require('../controller/usercontroller')
const { uploadVisitingCard } = require('../middleware/imageupload');

router.post('/create-registration', uploadVisitingCard,userController.createRegistration)
router.post('/verify-otp',userController.verifyOTP)
router.post('/create-pin',userController.createPin)
router.post('/forgot-pin',userController.forgotPinRequest)
router.post('/reset-pin',userController.resetPin)
router.post('/change-pin',userController.changePin)


module.exports = router;