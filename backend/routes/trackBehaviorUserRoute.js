const express = require('express')
const controller = require('../controllers/trackBehaviorUserController')
const router = express.Router()



router.post('/track',controller.trackBehaviorUser)
router.get('/track',controller.getBehaviorLogsByUser)
router.get('/track/aggregate',controller.aggregateBehaviorStats)



module.exports = router;