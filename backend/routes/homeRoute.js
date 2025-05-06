const express = require('express')
const controller = require('../controllers/homeController')
const router = express.Router()


router.get('/',controller.index)

// Recommendation System
router.get('/recommendation/:userId',controller.recommendation)


module.exports = router;