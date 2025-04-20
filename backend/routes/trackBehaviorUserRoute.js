const express = require('express')
const controller = require('../controllers/trackBehaviorUserController')
const router = express.Router()



router.post('/track',controller.trackBehaviorUser)




module.exports = router;