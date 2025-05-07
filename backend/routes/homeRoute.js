const express = require('express')
const controller = require('../controllers/homeController')
const router = express.Router()
const checkUserId = require('../middlewares/checkUserId')


// router.get('/',controller.index)
router.get('/',checkUserId, controller.getProductList)
// Recommendation System
router.get('/recommendation/:userId',controller.recommendation)


module.exports = router;