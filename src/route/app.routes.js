const express = require('express');
const router = express.Router();
const userController=require('../controller/usercontroller')
const { uploadVisitingCard } = require('../middleware/imageupload');

router.post('/create-registration', uploadVisitingCard,userController.createRegistration)
router.post('/verify-email',userController.verifyEmail)
router.post('/create-pin',userController.createPin)
router.post('/forgot-pin',userController.forgotPinRequest)
router.post('/reset-pin',userController.resetPin)
router.post('/change-pin',userController.changePin)
router.post('/update-pin',userController.updatePin)


module.exports = router;