const express = require('express')
const controller = require('../controllers/cartController')
const router = express.Router()


router.post('/add-product',controller.addProductToCart)
router.get('/:userId',controller.getCartbyUserId)


module.exports = router;