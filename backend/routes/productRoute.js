const express = require('express')
const controller = require('../controllers/productController')
const router = express.Router()


router.post('/',controller.createProduct)
router.get('/',controller.getAllProducts)

module.exports = router;