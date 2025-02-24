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
const watchlistController=require('../controller/watchlistcontroller')


router.post('/create-registration', upload,userController.createRegistration)
router.post('/verify-email',userController.verifyEmail)
router.post('/create-pin',userController.createPin)
router.post('/forgot-pin',userController.forgotPinRequest)
router.post('/reset-pin',userController.resetPin)
router.post('/change-pin',userController.changePin)
router.post('/update-pin',userController.updatePin)
router.get('/get-user-list',userController.userList)
router.get('/pending-user-list',userController.pendingUserList)
router.get('/free-trail-user-list',userController.freeTrialUsers)
router.get('/expired-trail-user-list',userController.expiredTrailUsers)
router.get('/free-user-list',userController.freeUsers)
router.get('/reject-user',userController.rejectUser)
router.get("/rejected-user-list",userController.rejectedUserList)
router.get("/user-approve",userController.userApproved)
router.post("/check-user-approve",userController.checkUserApproved)
router.delete('/delete-user',userController.deleteUserByEmail)
router.get("/get-reference-rate",refrencerateController.getCurrencyRates)
router.post('/update-sbi-tt', refrencerateController.updateSBITT);
router.post('/home-update',upload,homeupdateController.homeUpdate)
router.get('/get-home-update',homeupdateController.getHomeUpdates)
router.delete('/delete-home-update',homeupdateController.deleteHomeUpdate)
router.get('/get-self-news',newlistController.selfnewsList)

router.post('/create-item',itemController.createItem)
router.get('/get-all-item',itemController.getAllItems)
router.get('/getSpot-list',itemController.getSpotList)
router.get('/spot-list',itemController.spotlist)
router.post('/update-spot-price',itemController.pricechange)
router.post('/price-update',itemController.priceUpdate)
router.get('/get-lme-warehouse',lmeController.getlmewarehouse)
//router.get('/get-settlement-list',lmeController.getSettlements)
//router.get('/get-cash',lmeController.getSettlementCash)
router.get('/get-settlement-cash',lmeController.getSettlementsAndCash)
router.post('/update-lmewarehouse',lmeController.updateLmeWarehouseStock)
 

router.post('/add-watchlist',watchlistController.addToWatchlist)
router.get('/get-watch-list',watchlistController.getWatchlist)
router.delete('/delete-watchlist',watchlistController.deleteWatchListItemById)

//Extended days Api

//vercel update
//logi

module.exports = router;
