const express = require('express')
const controller = require('../controllers/productController')
const router = express.Router()


router.post('/',controller.createProduct)
router.post('/many',controller.createManyProducts)
router.get('/',controller.getAllProducts)
router.get('/category/:slug',controller.getProductByCategory)
router.get('/:slug',controller.getProductBySlug)
router.patch('/:slug',controller.updateProduct)

module.exports = router;