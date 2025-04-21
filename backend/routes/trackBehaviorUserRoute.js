const express = require('express')
const controller = require('../controllers/trackBehaviorUserController')
const router = express.Router()



router.post('/track',controller.trackBehaviorUser)
router.get('/track',controller.getBehaviorLogsByUser)



module.exports = router;