const express = require('express');
const router = express.Router();
const userController=require('../controller/usercontroller')
const newlistController=require('../controller/newslistcontroller')

const refrencerateController=require('../controller/refrenceratecontroller')
const homeupdateController=require('../controller/homeupdatecontroller')
const { upload } = require('../middleware/imageupload');
const CategoryController=require('../controller/categorycontroller')
const itemController=require('../controller/itemcontroller')
const lmeController=require('../controller/lmecontroller')


router.post('/create-registration', upload,userController.createRegistration)
router.post('/verify-email',userController.verifyEmail)
router.post('/create-pin',userController.createPin)
router.post('/forgot-pin',userController.forgotPinRequest)
router.post('/reset-pin',userController.resetPin)
router.post('/change-pin',userController.changePin)
router.post('/update-pin',userController.updatePin)
router.get('/get-user-list',userController.userList)
router.get('/free-trail-user-list',userController.freeTrialUsers)
router.get('/expired-trail-user-list',userController.expiredTrailUsers)
router.get('/free-user-list',userController.freeUsers)
router.get('/reject-user',userController.rejectUser)
router.get("/rejected-user-list",userController.rejectedUsers)
router.get("/user-approve",userController.userApproved)
router.post("/check-user-approve",userController.checkUserApproved)
router.get("/get-reference-rate",refrencerateController.getCurrencyRates)
router.post('/home-update',upload,homeupdateController.homeUpdate)
router.get('/get-home-update',homeupdateController.getHomeUpdates)


router.get('/get-self-news',newlistController.selfnewsList)

router.post('/create-category',CategoryController.createCategory)
router.post('/create-subcategory',CategoryController.createSubcategory)
router.post('/create-item',itemController.createItem)
router.get('/get-all-item',itemController.getAllItems)
router.get('/getSpot-list',itemController.getSpotList)
router.get('/spot-list',itemController.spotlist)
router.get('/get-lme-warehouse',lmeController.getlmewarehouse)

//Extended days Api

//vercel update
//logi

module.exports = router;