const express = require('express')
const controller = require('../controllers/orderController')
const router = express.Router()


router.post('/',controller.createOrderFromSelectedCartItems)
router.get('/user',controller.getOrdersByUserId)
router.get('/:orderId',controller.getOrderById)



module.exports = router;