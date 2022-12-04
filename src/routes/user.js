const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.get('/username=:username', userController.getUser);
router.get('/find/username=:username', userController.findUser);
router.post('/', userController.newUser);

module.exports = router;