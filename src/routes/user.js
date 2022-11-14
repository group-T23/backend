const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.get('/', userController.findUser);
router.post('/', userController.newUser);
router.post('/login', userController.loginUser);

module.exports = router;