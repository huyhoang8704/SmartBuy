const express = require('express')
const controller = require('../controllers/homeController')
const router = express.Router()


router.get('/',controller.index)
router.get('/category/:slug',controller.getProductByCategory)


module.exports = router;