const express = require('express')
const controller = require('../controllers/cartController')
const router = express.Router()


router.post('/add-product',controller.addProductToCart)
router.get('/',controller.getCartbyUserId)
router.put('/',controller.updateCart)
router.delete('/:productId',controller.removeProductFromCart)


module.exports = router;