const express = require('express')
const controller = require('../controllers/userController')
const router = express.Router()


router.get("/", controller.getUsers);
router.get("/:id", controller.getUser);
router.patch("/:id", controller.updateUser);
router.delete("/:id", controller.deleteUser);

module.exports = router;