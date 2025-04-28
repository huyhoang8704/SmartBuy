const express = require('express')
const controller = require('../controllers/categoryController')
const router = express.Router()


router.get('/',controller.index)


module.exports = router;